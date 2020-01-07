/* @flow */
import _ from 'lodash';
import { getCurrency } from '@paypal/sdk-client/src';

import constants from './lib/constants';
import { IdentityManager } from './lib/iframe-tools/identity-manager';
import type {
  Config
} from './types';
import { logger } from './lib/logger';
import {
  createNewCartId,
  getOrCreateValidCartId,
  setGeneratedUserId,
  getOrCreateValidUserId,
  setMerchantProvidedUserId
} from './lib/local-storage';

/*
import type {
  UserData,
  IdentityData,
  CartData,
  RemoveFromCartData,
  PurchaseData,
  EventType,
  CartEventType,
  Config,
  FptiInput
} from './types';
*/

let configStore = { ...constants.defaultTrackerConfig };

export const setupConfigUser = (config? : Config = {}) => {
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

export const checkDebugMode = () => {
  const currentUrl = new URL(window.location.href);
  // use the param ?ppDebug=true to see logs
  const debug = currentUrl.searchParams.get('ppDebug');

  if (debug) {
    // eslint-disable-next-line no-console
    console.log('PayPal Shopping: debug mode on.');
  }
};

export const setupUserAndCart = () => {
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

export const getConfig = () => {
  return configStore;
};
