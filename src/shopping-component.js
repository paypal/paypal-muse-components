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
