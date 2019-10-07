/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import { getClientID, getMerchantID, getCurrency } from '@paypal/sdk-client/src';

import {
  validateAddItems,
  validateRemoveItems,
  validateUser,
  validatePurchase
} from './lib/input-validation';
import {
  addToCartNormalizer,
  setCartNormalizer,
  removeFromCartNormalizer,
  purchaseNormalizer,
  setUserNormalizer
} from './lib/deprecated-input-normalizers';
import {
  getOrCreateValidCartId,
  setCartId,
  createNewCartId,
  getUserId,
  setGeneratedUserId,
  getOrCreateValidUserId,
  setMerchantProvidedUserId
} from './lib/local-storage-utils';
import { getPropertyId } from './lib/get-property-id';
import getJetlore from './lib/jetlore';
import trackFpti from './lib/fpti';
import { track } from './lib/track';
import constants from './lib/constants';
import type {
  UserData,
  IdentityData,
  CartData,
  RemoveFromCartData,
  PurchaseData,
  EventType,
  CartEventType,
  Config,
  JetloreConfig,
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

const getJetlorePayload = (type : string, options : Object) : Object => {
  const { payload } = options;
  switch (type) {
  case 'addToCart':
  case 'removeFromCart':
    return {
      deal_id: payload.deal_id,
      option_id: payload.option_id,
      count: payload.count,
      price: payload.price
    };
  case 'purchase':
    return {
      deal_id: payload.deal_id,
      option_id: payload.option_id,
      count: payload.count
    };
  case 'search':
    return {
      text: payload.text
    };
  case 'view':
    return {
      deal_id: payload.deal_id,
      option_id: payload.option_id
    };
  case 'browse_section':
    return {
      name: payload.name,
      refinements: payload.refinements
    };
  case 'browse_promo':
    return {
      name: payload.name,
      id: payload.id
    };
  case 'addToWishList':
  case 'removeFromWishList':
  case 'addToFavorites':
  case 'removeFromFavorites':
  case 'track':
    return payload;
  default:
    return {};
  }
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

  switch (trackingType) {
  case 'view':
    trackFpti(config, trackingData);
    break;
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
  /*
    ** this is used for backwards compatibility
    ** we do not want to overwrite a propertyId if propertyId
    ** has already been set using the SDK
    */
  if (config.propertyId) {
    return;
  }
  getPropertyId(config).then(propertyId => {
    config.propertyId = propertyId;
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
  const debug = currentUrl.searchParams.get('ppDebug');

  if (debug) {
    // eslint-disable-next-line no-console
    console.log('PayPal Shopping: debug mode on.');
  }

  let userId;

  try {
    getOrCreateValidCartId();
    userId = getOrCreateValidUserId().userId;

    if (config && config.user && config.user.merchantProvidedUserId) {
      setMerchantProvidedUserId(config.user.merchantProvidedUserId);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err.message);
    createNewCartId();
    userId = setGeneratedUserId().userId;
  }

  // $FlowFixMe
  config = { ...defaultTrackerConfig, ...config };
  config.user = config.user || {};
  config.user.id = userId;
  config.currencyCode = config.currencyCode || getCurrency();

  const JL = getJetlore();
  const jetloreTrackTypes = [
    'view',
    'addToCart',
    'removeFromCart',
    'purchase',
    'search',
    'browse_section',
    'addToWishList',
    'removeFromWishList',
    'addToFavorites',
    'removeFromFavorites',
    'track'
  ];
  if (config.jetlore) {
    const {
      user_id,
      access_token,
      feed_id,
      div,
      lang
    } = config && config.jetlore;
    const trackingConfig : JetloreConfig = {
      cid: access_token,
      user_id,
      feed_id
    };
    if (!div) {
      trackingConfig.div = div;
    }
    if (!lang) {
      trackingConfig.lang = lang;
    }
    JL.tracking(trackingConfig);
  }
  const trackers = {
    getConfig: () => {
      return config;
    },
    viewPage: () => {
      const data : FptiInput = {
        eventName: 'pageView',
        eventType: 'view'
      };

      trackEvent(config, 'view', data);
    },
    addToCart: (data : CartData) => {
      try {
        data = addToCartNormalizer(data);
        validateAddItems(data);
        return trackCartEvent(config, 'addToCart', data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err.message);
      }
    },
    setCart: (data : CartData) => {
      try {
        data = setCartNormalizer(data);
        validateAddItems(data);
        return trackCartEvent(config, 'setCart', data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err.message);
      }
    },
    setCartId: (cartId : string) => setCartId(cartId),
    removeFromCart: (data : RemoveFromCartData) => {
      try {
        data = removeFromCartNormalizer(data);
        validateRemoveItems(data);
        return trackCartEvent(config, 'removeFromCart', data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err.message);
      }
    },
    purchase: (data : PurchaseData) => {
      try {
        data = purchaseNormalizer(data);
        validatePurchase(data);
        return trackEvent(config, 'purchase', data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err.message);
      }
    },
    cancelCart: () => {
      const event = trackEvent(config, 'cancelCart', {});
      // a new id can only be created AFTER the 'cancel' event has been fired
      createNewCartId();
      return event;
    },
    setUser: (data : { user : UserData } | UserData) => {
      // $FlowFixMe
      const prevMerchantProvidedUserId = getUserId().merchantProvidedUserId;

      try {
        data = setUserNormalizer(data);
        validateUser(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err.message);
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

      trackEvent(config, 'setUser', { prevMerchantProvidedUserId });
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
    }
  };
  setImplicitPropertyId(config);

  // To disable functions, refer to this PR:
  // https://github.com/paypal/paypal-muse-components/commit/b3e76554fadd72ad24b6a900b99b8ff75af08815
  const trackerFunctions = trackers;

  const trackEventByType = (type : string, data : Object) => {
    const isJetloreType = config.jetlore
      ? jetloreTrackTypes.includes(type)
      : false;
    if (config.jetlore && isJetloreType && data) {
      const jlData = getJetlorePayload(type, data);
      JL.tracker[type](jlData);
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
    });
  };

  trackerFunctions.viewPage();

  return {
    // bringing in tracking functions for backwards compatibility
    ...trackerFunctions,
    track: trackEventByType,
    identify,
    getJetlorePayload
  };
};
