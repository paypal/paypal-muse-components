/* @flow */
import type { Config } from '../types';

import {
  getOrCreateValidUserId as fetchOrSetupUserIdInLocalStorage,
  setMerchantProvidedUserId,
  createNewCartId,
  setGeneratedUserId
} from './local-storage';
import { IdentityManager } from './iframe-tools/identity-manager';
import { logger } from './logger';

function fetchUserIdentity(config : Config) : IdentityManager {
  return new IdentityManager(config);
}

function processMerchantProvidedId(config : Config) {
  if (config.user && config.user.id) {
    config.user.merchantProvidedUserId = config.user.id;
    delete config.user.id;
    setMerchantProvidedUserId(config.user.merchantProvidedUserId);
  }
}

export const setupUserDetails = (config : Config) => {
  let userId;
  try {
    config.user = config.user || {};
    userId = fetchOrSetupUserIdInLocalStorage().userId;
    processMerchantProvidedId(config);
    fetchUserIdentity(config);
  } catch (err) {
    logger.error('cart_or_shopper_id', err);
    createNewCartId();
    userId = setGeneratedUserId().userId;
  }
  // $FlowFixMe
  if (!config.user.id) {
  // $FlowFixMe
    config.user.id = userId;
  }
};
