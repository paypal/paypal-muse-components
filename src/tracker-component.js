/* @flow */
import type {
  Config
} from './types';
import {
  createConfigManager
} from './config-manager';

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

  const configManager = createConfigManager(config);
  configManager.setupConfigUser();
  configManager.checkDebugMode();
  configManager.setupUserAndCart();
    
  const trackers = {
    getConfig: configManager.getConfig,
    viewPage: configManager.viewPage,
    addToCart: configManager.addToCart,
    setCart: configManager.setCart,
    setCartId: configManager.setCartId,
    removeFromCart: configManager.removeFromCart,
    purchase: configManager.purchase,
    cancelCart: configManager.cancelCart,
    setUser: configManager.setUser,
    setPropertyId: configManager.setPropertyId,
    getIdentity: configManager.getIdentity,
    customEvent: configManager.customEvent,

    // To future developers. This is only for supporting an undocumented
    // Tracker.track function call
    // Used in PPDG
    track: configManager.deprecatedTrack,

    // Identity calls are used by CIQ to get user identity
    identify: configManager.getUserAccessToken
  };

  configManager.setImplicitPropertyId();

  configManager.setupJL(trackers);

  // To disable functions, refer to this PR:
  // https://github.com/paypal/paypal-muse-components/commit/b3e76554fadd72ad24b6a900b99b8ff75af08815

  trackers.viewPage();

  // Adding tracker onto the window so that we can inspect its properties
  // for debugging. For example, window.__pp__trackers__[0].getConfig()
  // will show all the config properties. It's an array in case for whatever
  // reason a merchant website instantiates multiple trackers (then that's
  // good for us to know too).
  window.__pp__trackers__ = window.__pp__trackers__ || [];

  window.__pp__trackers__.push(trackers);

  return trackers;
};
