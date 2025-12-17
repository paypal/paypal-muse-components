/* @flow */
const noop = () => {};

export const shoppingAnalyticsSetup = () => {
  // return publicly accessible
  return {
    send: noop,
    set: noop,
    getPageSkuData: noop,
    enableDebugLogging: noop,
    disableDebugLogging: noop
  };
};
