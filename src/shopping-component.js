/* @flow */
import { shoppingAnalyticsSetup } from './lib/shopping-analytics';

// $FlowFixMe
export const ShoppingAnalytics = () => {
  const shoppingAnalytics = shoppingAnalyticsSetup();
  window.__pp__trackers__ = window.__pp__trackers__ || [];
  window.__pp__trackers__.push(shoppingAnalytics);

  return shoppingAnalytics;
};

export function setup() {}
