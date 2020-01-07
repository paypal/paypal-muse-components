/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import { getClientID } from '@paypal/sdk-client/src';

import { logger } from './lib/logger';
import {
  validateUser,
  validateCustomEvent,
  setUserNormalizer
} from './lib/validation';
import {
  setCartId,
  getUserId,
  setGeneratedUserId,
  setMerchantProvidedUserId
} from './lib/local-storage';
import { fetchContainerSettings } from './lib/get-property-id';
import {
  analyticsInit,
  merchantUserEvent,
  analyticsPurchase
} from './lib/legacy-analytics';
import getJetlore from './lib/jetlore';
import { trackFpti } from './lib/fpti';
import { track } from './lib/track';
import constants from './lib/constants';
import type {
  UserData,
  IdentityData,
  CartData,
  RemoveFromCartData,
  EventType,
  CartEventType,
  Config,
  FptiInput
} from './types';
import {
  createConfigHelper
} from './tracker-helpers';

const {
  accessTokenUrl
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
    if (programExists) {
      analyticsPurchase(config);
    }
  default:
    track(config, trackingType, trackingData);
    break;
  }
};

const trackCartEvent = (config : Config, cartEventType : CartEventType, trackingData : CartData | RemoveFromCartData) => {
  trackEvent(config, 'cartEvent', { ...trackingData, cartEventType });
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
    Quick devnote here:

    If a merchant doesn't provide a user ID during initialization or call setUser,
    then any previously-stored merchant provided user ID will *not* be pulled into
    config.user.merchantProvidedUserId.

    This differs in behavior from the SDK generated user ID ("shopper ID"). The shopper ID
    will be created, stored in storage, and set in config.user.id, or if it already exists
    in local storage, then it will be pulled into config.user.id.

    The difference in behavior is intended.
  */

  const configHelper = createConfigHelper(config);
  configHelper.setupConfigUser(config);
  configHelper.checkDebugMode();
  configHelper.setupUserAndCart();
    
  // Initialize JL Module. Note: getJetlore must never throw an error
  // Which is why getJetlore is wrapped around a try catch
  const JL = getJetlore(configHelper.getConfig());

  const trackers = {
    getConfig: configHelper.getConfig,
    viewPage: configHelper.viewPage,
    addToCart: configHelper.addToCart,
    setCart: configHelper.setCart,
    setCartId: configHelper.setCartId,
    removeFromCart: configHelper.removeFromCart,
    purchase: configHelper.purchase,
    cancelCart: configHelper.cancelCart,
    setUser: (data : { user : UserData } | UserData) => {
      // $FlowFixMe
      const prevMerchantProvidedUserId = getUserId().merchantProvidedUserId;

      try {
        data = setUserNormalizer(data);
        validateUser(data);
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

      if (merchantProvidedUserId !== undefined || userEmail || userName) {
        trackEvent(config, 'setUser', { prevMerchantProvidedUserId });
      }
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

  trackers.viewPage();

  const fullTracker = {
    // bringing in tracking functions for backwards compatibility
    ...trackers,
    track: trackEventByType,
    identify: configHelper.getUserAccessToken
  };

  // Adding tracker onto the window so that we can inspect its properties
  // for debugging. For example, window.__pp__trackers__[0].getConfig()
  // will show all the config properties. It's an array in case for whatever
  // reason a merchant website instantiates multiple trackers (then that's
  // good for us to know too).
  window.__pp__trackers__ = window.__pp__trackers__ || [];

  window.__pp__trackers__.push(fullTracker);

  return fullTracker;
};
