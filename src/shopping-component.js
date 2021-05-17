/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import constants from './lib/constants';
import { setupUserDetails } from './lib/user-configuration';
import { setupTrackers } from './lib/shopping-analytics';
import { fetchContainerSettings } from './lib/get-property-id';
import type { Config } from './types';

const { defaultTrackerConfig } = constants;

function fetchMerchantContainer(config : Config) {
  fetchContainerSettings(config).then((containerSummary) => {
    if (!config.propertyId) {
      config.propertyId = containerSummary.id;
    }
    config.containerSummary = containerSummary;
  });
}

/**
 *  Parse merchant provided config and cache the user details passed
 *  in by the merchant if any as well as try to identify the user by calling VPNS.
 *
 * Further, fetch and cache the container associated with the propertyId or the url.
 * @param config
 * @returns {{viewPage: function(Object): void}}
 * @constructor
 */
// $FlowFixMe
export const ShoppingAnalytics = (config? : Config = {}) => {
  // $FlowFixMe
  config = { ...defaultTrackerConfig, ...config };
  setupUserDetails(config);
  fetchMerchantContainer(config);

  const shoppingAnalytics = setupTrackers(config);

  window.__pp__trackers__ = window.__pp__trackers__ || [];
  window.__pp__trackers__.push(shoppingAnalytics);

  return shoppingAnalytics;
};
