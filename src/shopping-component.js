/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import constants from './lib/constants';
import { shoppingAnalyticsSetup } from './lib/shopping-analytics';
import { setupShoppingDDL, DDL_NAME } from './lib/ddl/shopping-ddl';
import type { Config } from './types';

const { defaultTrackerConfig } = constants;

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
export const ShoppingAnalytics = (config : Config = {}) => {
  // $FlowFixMe
  config = { ...defaultTrackerConfig, ...config };
  const shoppingAnalytics = shoppingAnalyticsSetup(config);
  window.__pp__trackers__ = window.__pp__trackers__ || [];
  window.__pp__trackers__.push(shoppingAnalytics);

  return shoppingAnalytics;
};

function init() {
  if (window[DDL_NAME]) {
    const analytics = new ShoppingAnalytics();
    setupShoppingDDL(window, analytics);
  }
}


export function setup() {
  init();
}
