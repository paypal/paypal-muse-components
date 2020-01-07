/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import _ from 'lodash';
import { getClientID, getMerchantID, getCurrency } from '@paypal/sdk-client/src';

import { fetchContainerSettings } from './lib/get-property-id';
import constants from './lib/constants';
import getJetlore from './lib/jetlore';
import { IdentityManager } from './lib/iframe-tools/identity-manager';
import type {
  Config,
  CartData,
  EventType,
  RemoveFromCartData,
  IdentityData,
  PurchaseData,
  CartEventType,
  FptiInput,
  UserData
} from './types';
import {
  validateRemoveItems,
  addToCartNormalizer,
  setCartNormalizer,
  removeFromCartNormalizer,
  purchaseNormalizer,
  validateAddItems,
  validatePurchase,
  validateUser,
  validateCustomEvent,
  setUserNormalizer
} from './lib/validation';
import { logger } from './lib/logger';
import {
  createNewCartId,
  getOrCreateValidCartId,
  setGeneratedUserId,
  getOrCreateValidUserId,
  setMerchantProvidedUserId,
  getCartId,
  setCartId,
  getUserId
} from './lib/local-storage';
import {
  analyticsInit,
  merchantUserEvent,
  analyticsPurchase
} from './lib/legacy-analytics';
import { trackFpti } from './lib/fpti';
import { track } from './lib/track';
/*
import type {
  UserData,
  Config,
} from './types';
*/

let trackEventQueue = [];

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

export const clearTrackQueue = (config : Config) => {
  trackEventQueue.forEach(([ trackingType, trackingData ]) => {
    trackEvent(config, trackingType, trackingData);
  });
  trackEventQueue = [];
};

const trackCartEvent = (config : Config, cartEventType : CartEventType, trackingData : CartData | RemoveFromCartData) => {
  trackEvent(config, 'cartEvent', { ...trackingData, cartEventType });
};

export const createConfigHelper = () => {
  let configStore = { ...constants.defaultTrackerConfig };

  const configHelper = {};
  configHelper.setupConfigUser = (config? : Config = {}) => {
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

    configStore = { ...config };
  };

  configHelper.checkDebugMode = () => {
    const currentUrl = new URL(window.location.href);
    // use the param ?ppDebug=true to see logs
    const debug = currentUrl.searchParams.get('ppDebug');

    if (debug) {
      // eslint-disable-next-line no-console
      console.log('PayPal Shopping: debug mode on.');
    }
  };

  configHelper.setupUserAndCart = () => {
    let userId;

    try {
      new IdentityManager(configStore);
      getOrCreateValidCartId();
      userId = getOrCreateValidUserId().userId;

      const merchantUserId = _.get(configStore, 'user.merchantProvidedUserId', false);
      if (merchantUserId) {
        setMerchantProvidedUserId(merchantUserId);
      }
    } catch (err) {
      logger.error('cart_or_shopper_id', err);
      createNewCartId();
      userId = setGeneratedUserId().userId;
    }

    configStore.user = configStore.user || {};
    configStore.user.id = userId;
    configStore.currencyCode = configStore.currencyCode || getCurrency();
  };

  configHelper.getConfig = () => {
    return configStore;
  };

  configHelper.getUserAccessToken = (cb? : function) => {
    const url = _.get(configStore, 'paramsToTokenUrl') || 'https://paypal.com/muse/api/partner-token';

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

  configHelper.viewPage = () => {
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

    trackEvent(configHelper.getConfig(), 'view', data);
  };

  configHelper.addToCart = (data : CartData) => {
    try {
      data = addToCartNormalizer(data);
      validateAddItems(data);
      return trackCartEvent(configHelper.getConfig(), 'addToCart', data);
    } catch (err) {
      logger.error('addToCart', err);
    }
  };

  configHelper.setCart = (data : CartData) => {
    const JL = getJetlore(configHelper.getConfig());
    try {
      data = setCartNormalizer(data);
      JL.trackActivity('setCart', data);
      validateAddItems(data);
      return trackCartEvent(configHelper.getConfig(), 'setCart', data);
    } catch (err) {
      logger.error('setCart', err);
    }
  };

  configHelper.setCartId = (cartId : string) => setCartId(cartId);
  configHelper.removeFromCart = (data : RemoveFromCartData) => {
    try {
      data = removeFromCartNormalizer(data);
      validateRemoveItems(data);
      return trackCartEvent(configHelper.getConfig(), 'removeFromCart', data);
    } catch (err) {
      logger.error('removeFromCart', err);
    }
  };
  configHelper.purchase = (data : PurchaseData) => {
    try {
      data = purchaseNormalizer(data);
      validatePurchase(data);
      return trackEvent(configHelper.getConfig(), 'purchase', data);
    } catch (err) {
      logger.error('purchase', err);
    }
  };

  configHelper.cancelCart = () => {
    const event = trackEvent(configHelper.getConfig(), 'cancelCart', {});
    // a new id can only be created AFTER the 'cancel' event has been fired
    createNewCartId();
    return event;
  };

  configHelper.setUser = (data : { user : UserData } | UserData) => {
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

    const configUser = configStore.user || {};
    const merchantProvidedUserId = data.id !== undefined ? data.id : configUser.merchantProvidedUserId;
    const userEmail = data.email !== undefined ? data.email : configUser.email;
    const userName = data.name !== undefined ? data.name : configUser.name;

    configStore = {
      ...configStore,
      user: {
        id: configUser.id,
        merchantProvidedUserId,
        email: userEmail,
        name: userName
      }
    };

    if (merchantProvidedUserId !== undefined || userEmail || userName) {
      trackEvent(configHelper.getConfig(), 'setUser', { prevMerchantProvidedUserId });
    }
  };

  configHelper.setPropertyId = (id : string) => {
    configStore.propertyId = id;
  };

  const {
    accessTokenUrl
  } = constants;
  configHelper.getIdentity = (data : IdentityData, url? : string = accessTokenUrl) : Promise<Object> => {
    return getAccessToken(url, data.mrid).then(accessToken => {
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
  };

  configHelper.customEvent = (eventName : string, data? : Object) => {
    try {
      validateCustomEvent(eventName, data);

      const fptiInput : FptiInput = {
        eventName,
        eventType: 'customEvent'
      };

      if (data) {
        fptiInput.eventData = data;
      }

      trackEvent(configHelper.getConfig(), 'customEvent', fptiInput);
    } catch (err) {
      logger.error('customEvent', err);
    }
  };

  configHelper.setImplicitPropertyId = () => {
    fetchContainerSettings(configStore).then(containerSummary => {
      /* this is used for backwards compatibility we do not want to overwrite
    a propertyId if propertyId has already been set using the SDK */
      if (!configStore.propertyId) {
        configStore.propertyId = containerSummary.id;
      }

      configStore.containerSummary = containerSummary;

      if (trackEventQueue.length) {
        clearTrackQueue(configStore);
      }
    });
  };

  return configHelper;
};

