/* @flow */
/* eslint no-fallthrough: off */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import { getClientID, getMerchantID, getCurrency } from '@paypal/sdk-client/src';

import { logger } from './lib/logger';
import {
  validateCustomEvent
} from './lib/validation';
import {
  getOrCreateValidCartId,
  setCartId,
  createNewCartId,
  getUserId,
  setGeneratedUserId,
  getOrCreateValidUserId,
  setMerchantProvidedUserId,
  getCartId
} from './lib/local-storage';
import {
  sendStoreCash,
  convertStoreCash,
  excludeStoreCash
} from './storeCash';
import { fetchContainerSettings } from './lib/get-property-id';
import { IdentityManager } from './lib/iframe-tools/identity-manager';
import {
  analyticsInit,
  merchantUserEvent,
  analyticsPurchase
} from './lib/legacy-analytics';
import getJetlore from './lib/jetlore';
import { trackFpti } from './lib/fpti';
import constants from './lib/constants';
import type {
  UserData,
  IdentityData,
  PurchaseData,
  EventType,
  Config,
  FptiInput
} from './types';

const {
  accessTokenUrl,
  defaultTrackerConfig
} = constants;

const getAccessToken = (url : string, mrid : string) : Promise<Object> => {
  return fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      mrid,
      clientId: getClientID()
    })
  }).then(r => r.json()).then(data => {
    return data;
  });
};

let trackEventQueue = [];

export const trackEvent = (config : Config, trackingType : EventType, trackingData : any) : void => {
  // CartId can be set by any event if it is provided
  if (trackingData.cartId) {
    setCartId(trackingData.cartId);
  }

  if (trackingData.currencyCode) {
    config.currencyCode = trackingData.currencyCode;
  }

  // Events cannot be fired without a propertyId. We add events
  // to a queue if a propertyId has not yet been returned.
  if (!config.propertyId) {
    trackEventQueue.push([ trackingType, trackingData ]);
    return;
  }

  const programExists = config.containerSummary && config.containerSummary.programId;

  switch (trackingType) {
  case 'view':
  case 'customEvent':
    if (programExists) {
      // eslint-disable-next-line default-case
      switch (trackingData.eventName) {
      case 'analytics-init':
        analyticsInit(config);
        break;
      case 'analytics-cancel':
        merchantUserEvent(config);
        break;
      }
    }

    trackFpti(config, trackingData);
    break;
  case 'purchase':
    convertStoreCash(trackingData);
    if (programExists) {
      analyticsPurchase(config);
    }
  default:
    break;
  }
};

export const clearTrackQueue = (config : Config) => {
  trackEventQueue.forEach(([ trackingType, trackingData ]) => {
    trackEvent(config, trackingType, trackingData);
  });
  trackEventQueue = [];
};

export const setImplicitPropertyId = (config : Config) => {

  fetchContainerSettings(config).then(containerSummary => {
    /* this is used for backwards compatibility we do not want to overwrite
    a propertyId if propertyId has already been set using the SDK */
    if (!config.propertyId) {
      config.propertyId = containerSummary.id;
    }

    config.containerSummary = containerSummary;

    if (trackEventQueue.length) {
      clearTrackQueue(config);
    }
  });
};

// $FlowFixMe
export const Tracker = (config? : Config = {}) => {
  /*
        Bit of a tricky thing here. We allow the merchant to pass
        in { user: { id } }. However, we convert that property
        to config.user.merchantProvidedUserId instead of setting
        it as config.user.id. This is because config.user.id is a
        constant that we generate internally.
    */
  if (config.user && config.user.id) {
    config.user.merchantProvidedUserId = config.user.id;

    delete config.user.id;
  }

  const currentUrl = new URL(window.location.href);
  // use the param ?ppDebug=true to see logs
  const debug = currentUrl.searchParams.get('ppDebug') === 'true';

  if (debug) {
    // eslint-disable-next-line no-console
    console.log('PayPal Shopping: debug mode on.');
  }

  let userId;

  try {
    // eslint-disable-next-line no-new
    new IdentityManager(config);
    getOrCreateValidCartId();
    userId = getOrCreateValidUserId().userId;

    if (config && config.user && config.user.merchantProvidedUserId) {
      setMerchantProvidedUserId(config.user.merchantProvidedUserId);
    }
  } catch (err) {
    logger.error('cart_or_shopper_id', err);
    createNewCartId();
    userId = setGeneratedUserId().userId;
  }

  // $FlowFixMe
  config = { ...defaultTrackerConfig, ...config };
  config.user = config.user || {};
  config.user.id = userId;
  config.currencyCode = config.currencyCode || getCurrency();

  /*
    Quick devnote here:

    If a merchant doesn't provide a user ID during initialization or call setUser,
    then any previously-stored merchant provided user ID will *not* be pulled into
    config.user.merchantProvidedUserId.

    This differs in behavior from the SDK generated user ID ("shopper ID"). The shopper ID
    will be created, stored in storage, and set in config.user.id, or if it already exists
    in local storage, then it will be pulled into config.user.id.

    The difference in behavior is intended.
  */

  // Initialize JL Module. Note: getJetlore must never throw an error
  // Which is why getJetlore is wrapped around a try catch
  const JL = getJetlore(config);

  const noop = (eventName : string) => {
    return () => {
      // Send FPTI event for us to see who is still using deprecated functions.
      //   Helps with elegant deprecation for partners.
      try {
        const fptiInput : FptiInput = {
          eventName,
          eventType: 'noop'
        };

        trackFpti(config, fptiInput);
      } catch (err) {
        // continue regardless of error
      }
    };
  };

  const cartIdentifier = 'paypal-cart-items';
  const trackers = {
    getConfig: () => {
      return config;
    },
    viewPage: () => {
      // $FlowFixMe
      const merchantProvidedUserId = getUserId().merchantProvidedUserId;
      // $FlowFixMe
      const shopperId = getUserId().userId;
      // $FlowFixMe
      const cartId = getCartId().cartId;

      const data : FptiInput = {
        eventName: 'pageView',
        eventType: 'view',
        shopperId,
        merchantProvidedUserId,
        cartId
      };

      trackEvent(config, 'view', data);
    },
    addToCart: noop('addToCart'),
    setCart: noop('setcart'),
    getCart: function getCart() : Promise<any> {
      return new Promise((resolve, reject) => {
        try {
          const data = JSON.parse(localStorage.getItem(cartIdentifier) || '{}');
          resolve(data);
        } catch (err) {
          logger.error('setCart', err);
          reject(err);
        }
      });
    },
    setCartId: (cartId : string) => setCartId(cartId),
    removeFromCart: noop('removeFromCart'),
    purchase: (data : PurchaseData) => {
      try {
        trackEvent(config, 'purchase', data);
      } catch (err) {
        logger.error('purchase', err);
      }
    },
    cancelCart: () => {
      const event = trackEvent(config, 'cancelCart', {});
      // a new id can only be created AFTER the 'cancel' event has been fired
      createNewCartId();
      localStorage.setItem(cartIdentifier, '');
      return event;
    },
    setUser: (data : {| user : UserData |} | UserData) => {
      try {
        excludeStoreCash();
      } catch (err) {
        logger.error('setUser', err);
        return;
      }

      if (data.id || data.id === null) {
        setMerchantProvidedUserId(data.id);

        if (data.id === null) {
          setGeneratedUserId();
        }
      }

      const configUser = config.user || {};
      const merchantProvidedUserId = data.id !== undefined ? data.id : configUser.merchantProvidedUserId;
      const userEmail = data.email !== undefined ? data.email : configUser.email;
      const userName = data.name !== undefined ? data.name : configUser.name;

      config = {
        ...config,
        user: {
          id: configUser.id,
          merchantProvidedUserId,
          email: userEmail,
          name: userName
        }
      };
    },
    setPropertyId: (id : string) => {
      config.propertyId = id;
    },
    getIdentity: (data : IdentityData, url? : string = accessTokenUrl) : Promise<Object> => {
      return getAccessToken(url, data.mrid)
        .then(accessToken => {
          if (accessToken.data) {
            if (data.onIdentification) {
              data.onIdentification({ getAccessToken: () => accessToken.data });
            }
          } else {
            if (data.onError) {
              data.onError({
                message: 'No token could be created',
                error: accessToken
              });
            }
          }
          return accessToken;

        }).catch(err => {
          if (data.onError) {
            data.onError({
              message: 'No token could be created',
              error: err
            });
          }

          return {};
        });
    },
    customEvent: (eventName : string, data? : Object) => {
      try {
        validateCustomEvent(eventName, data);

        const fptiInput : FptiInput = {
          eventName,
          eventType: 'customEvent'
        };

        if (data) {
          fptiInput.eventData = data;
        }

        trackEvent(config, 'customEvent', fptiInput);
      } catch (err) {
        logger.error('customEvent', err);
      }
    }
  };
  setImplicitPropertyId(config);

  try {
    // This will add JL specific functions to trackers object
    //   This function will have a side effect, which is necessary.
    //   Since tracking SDK don't support these functions, they should
    //   be handled directly by JL instead of going through trackers (more error prone)
    JL.addJLFunctionsToSDK(trackers);
  } catch (err) {
    logger.error('JL.addJLFunctionsToSDK', err);
  }

  // To disable functions, refer to this PR:
  // https://github.com/paypal/paypal-muse-components/commit/b3e76554fadd72ad24b6a900b99b8ff75af08815
  const trackerFunctions = trackers;

  // To future developers. This is only for supporting an undocumented
  // Tracker.track function call.
  const trackEventByType = (type : string, data : Object) => {
    try {
      JL.trackActivity(type, data);
    } catch (err) {
      logger.error('JL.trackActivity', err);
    }
    if (trackers[type]) {
      trackers[type](data);
    }
  };

  const identify = (cb? : function) => {
    let url;
    if (config.paramsToTokenUrl) {
      url = config.paramsToTokenUrl();
    } else {
      url = 'https://paypal.com/muse/api/partner-token';
    }
    return window.fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchantId: getMerchantID()[0],
        clientId: getClientID()
      })
    }).then(res => {
      if (res.status !== 200) {
        return false;
      }
      return res.json();
    }).then(data => {
      if (!data) {
        const failurePayload = { success: false };
        return cb ? cb(failurePayload) : failurePayload;
      }
      const identityPayload = {
        ...data,
        success: true
      };
      return cb ?  cb(identityPayload) : identityPayload;
    }).catch(err => {
      logger.error('identity', err);
    });
  };

  trackerFunctions.viewPage();

  const fullTracker = {
    // bringing in tracking functions for backwards compatibility
    ...trackerFunctions,
    track: trackEventByType,
    identify
  };

  // Adding tracker onto the window so that we can inspect its properties
  // for debugging. For example, window.__pp__trackers__[0].getConfig()
  // will show all the config properties. It's an array in case for whatever
  // reason a merchant website instantiates multiple trackers (then that's
  // good for us to know too).
  window.__pp__trackers__ = window.__pp__trackers__ || [];

  window.__pp__trackers__.push(fullTracker);

  try {
    sendStoreCash();
  } catch (err) {
    logger.error('sdkStoreCash', err);
  }

  if (config.user) {
    excludeStoreCash();
  }

  return fullTracker;
};
