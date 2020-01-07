/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import _ from 'lodash';
import { getCurrency } from '@paypal/sdk-client/src';

import { fetchContainerSettings } from './lib/get-property-id';
import constants from './lib/constants';
import getJetlore from './lib/jetlore';
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
import { installTrackerFunctions, clearTrackQueue } from './tracker-functions';
/*
import type {
  UserData,
  Config,
} from './types';
*/

export const createConfigHelper = (config? : Config = {}) => {
  const configStore = { ...constants.defaultTrackerConfig, ...config };

  const JL = getJetlore(configStore);

  const configHelper = {};

  configHelper.setupConfigUser = () => {
    /*
      Bit of a tricky thing here. We allow the merchant to pass
      in { user: { id } }. However, we convert that property
      to config.user.merchantProvidedUserId instead of setting
      it as config.user.id. This is because config.user.id is a
      constant that we generate internally.
      */
    const merchantUserId = _.get(configStore, 'user.id');
    if (merchantUserId) {
      configStore.user.merchantProvidedUserId = merchantUserId;
      delete configStore.user.id;
    }
  };

  configHelper.setupJL = (tracker : Object) => {
    JL.addJLFunctionsToSDK(tracker);
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

  installTrackerFunctions(configHelper, configStore);

  configHelper.setImplicitPropertyId = () => {
    fetchContainerSettings(configStore).then(containerSummary => {
      /* this is used for backwards compatibility we do not want to overwrite
    a propertyId if propertyId has already been set using the SDK */
      if (!configStore.propertyId) {
        configStore.propertyId = containerSummary.id;
      }

      configStore.containerSummary = containerSummary;

      clearTrackQueue(configStore);
    });
  };

  return configHelper;
};

