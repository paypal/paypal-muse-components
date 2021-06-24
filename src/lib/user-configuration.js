/* @flow */
import type { Config, UserData } from '../types';

import {
  getOrCreateValidUserId as fetchOrSetupUserIdInLocalStorage,
  setMerchantProvidedUserId,
  createNewCartId,
  setGeneratedUserId
} from './local-storage';
import { IdentityManager } from './iframe-tools/identity-manager';
import { logger } from './logger';

/**
 * Make a call to VPNS by loading the identity iframe and
 * try to do our own identifying of the user. Store this in the local storage.
 * @param config
 * @returns {IdentityManager}
 */
function fetchUserIdentity(config : Config) : IdentityManager {
  return new IdentityManager(config);
}

/** If the merchant passes in a userId,
 * store it as the merchantProvidedId in the localStorage  **/
function processMerchantProvidedId(config : Config) {
  if (config.user && config.user.id) {
    config.user.merchantProvidedUserId = config.user.id;
    delete config.user.id;
    setMerchantProvidedUserId(config.user.merchantProvidedUserId);
  }
}

/** Handle user details from the config passed in by the merchant.
 *
 * This function essentially stores the merchantProvidedUserId
 * as well as fetching our own user id from identity
 *
 * 1) If a user id is provided, cache it in the local storage as merchantProvidedUserId
 * 2) In any case, make a call to VPNS by loading the identity iframe and
 * try to do our own identifying of the user. Store this in the local storage.
 * **/
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

export const setUser = (user : UserData) => {
  setupUserDetails({ user });
};
