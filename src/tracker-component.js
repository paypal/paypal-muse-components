/* @flow */
import {
  setCartId
} from './lib/local-storage';
import { fetchContainerSettings } from './lib/get-property-id';
import {
  analyticsInit,
  merchantUserEvent,
  analyticsPurchase
} from './lib/legacy-analytics';
import getJetlore from './lib/jetlore';
import { trackFpti } from './lib/fpti';
import { track } from './lib/track';
import type {
  EventType,
  Config
} from './types';
import {
  createConfigHelper
} from './tracker-helpers';

let trackEventQueue = [];

export const trackEvent = (config : Config, trackingType : EventType, trackingData : any) : void => {
  // CartId can be set by any event if it is provided
  if (trackingData.cartId) {
    setCartId(trackingData.cartId);
  }

  if (trackingData.currencyCode) {
    config.currencyCode = trackingData.currencyCode;
  }

  // Events cannot be fired without a propertyId. We add events
  // to a queue if a propertyId has not yet been returned.
  if (!config.propertyId) {
    trackEventQueue.push([ trackingType, trackingData ]);
    return;
  }

  const programExists = config.containerSummary && config.containerSummary.programId;

  switch (trackingType) {
  case 'view':
  case 'customEvent':
    if (programExists) {
      switch (trackingData.eventName) {
      case 'analytics-init':
        analyticsInit(config);
        break;
      case 'analytics-cancel':
        merchantUserEvent(config);
        break;
      }
    }

    trackFpti(config, trackingData);
    break;
  case 'purchase':
    if (programExists) {
      analyticsPurchase(config);
    }
  default:
    track(config, trackingType, trackingData);
    break;
  }
};

export const clearTrackQueue = (config : Config) => {
  trackEventQueue.forEach(([ trackingType, trackingData ]) => {
    trackEvent(config, trackingType, trackingData);
  });
  trackEventQueue = [];
};

export const setImplicitPropertyId = (config : Config) => {

  fetchContainerSettings(config).then(containerSummary => {
    /* this is used for backwards compatibility we do not want to overwrite
    a propertyId if propertyId has already been set using the SDK */
    if (!config.propertyId) {
      config.propertyId = containerSummary.id;
    }

    config.containerSummary = containerSummary;

    if (trackEventQueue.length) {
      clearTrackQueue(config);
    }
  });
};

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
  setImplicitPropertyId(config);

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
