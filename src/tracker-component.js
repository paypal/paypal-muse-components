/* @flow */
import getJetlore from './lib/jetlore';
import type {
  Config
} from './types';
import {
  createConfigHelper
} from './tracker-helpers';

// $FlowFixMe
export const Tracker = (config? : Config = {}) => {
  /*
    Quick devnote here:

    If a merchant doesn't provide a user ID during initialization or call setUser,
    then any previously-stored merchant provided user ID will *not* be pulled into
    config.user.merchantProvidedUserId.

    This differs in behavior from the SDK generated user ID ("shopper ID"). The shopper ID
    will be created, stored in storage, and set in config.user.id, or if it already exists
    in local storage, then it will be pulled into config.user.id.

    The difference in behavior is intended.
  */

  const configHelper = createConfigHelper(config);
  configHelper.setupConfigUser(config);
  configHelper.checkDebugMode();
  configHelper.setupUserAndCart();
    
  // Initialize JL Module. Note: getJetlore must never throw an error
  // Which is why getJetlore is wrapped around a try catch
  const JL = getJetlore(configHelper.getConfig());

  const trackers = {
    getConfig: configHelper.getConfig,
    viewPage: configHelper.viewPage,
    addToCart: configHelper.addToCart,
    setCart: configHelper.setCart,
    setCartId: configHelper.setCartId,
    removeFromCart: configHelper.removeFromCart,
    purchase: configHelper.purchase,
    cancelCart: configHelper.cancelCart,
    setUser: configHelper.setUser,
    setPropertyId: configHelper.setPropertyId,
    getIdentity: configHelper.getIdentity,
    customEvent: configHelper.customEvent
  };

  configHelper.setImplicitPropertyId();

  JL.addJLFunctionsToSDK(trackers);

  // To disable functions, refer to this PR:
  // https://github.com/paypal/paypal-muse-components/commit/b3e76554fadd72ad24b6a900b99b8ff75af08815

  trackers.viewPage();

  const fullTracker = {
    // bringing in tracking functions for backwards compatibility
    ...trackers,
    track: (type : string, data : Object) => {
      // To future developers. This is only for supporting an undocumented
      // Tracker.track function call.
      JL.trackActivity(type, data);
      if (typeof trackers[type] === 'function') {
        trackers[type](data);
      }
    },
    identify: configHelper.getUserAccessToken
  };

  // Adding tracker onto the window so that we can inspect its properties
  // for debugging. For example, window.__pp__trackers__[0].getConfig()
  // will show all the config properties. It's an array in case for whatever
  // reason a merchant website instantiates multiple trackers (then that's
  // good for us to know too).
  window.__pp__trackers__ = window.__pp__trackers__ || [];

  window.__pp__trackers__.push(fullTracker);

  return fullTracker;
};
