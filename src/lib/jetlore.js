/* @flow */
import type {
  JetloreConfig
} from '../types';

import { logger } from './logger';
import Tracker from './jetloreTracker';

let JL;
let jlEnabled = false;

const validFn = (fn) => {
  return (...args) => {
    if (!jlEnabled || !JL || !JL.trackActivity || (typeof JL.trackActivity !== 'function')) {
      return;
    }
    fn(...args);
  };
};

function addJLFunctionsToSDK(tracker = {}) : null {
  tracker.viewSection = validFn((data : {}) : null => {
    JL.trackActivity('viewSection', { payload: data });
  });
  tracker.viewPromotion = validFn((data : {}) : null => {
    JL.trackActivity('viewPromotion', { payload: data });
  });
  tracker.viewProduct = validFn((data : {}) : null => {
    JL.trackActivity('viewProduct', { payload: data });
  });
  tracker.setWishList = validFn((data : {}) : null => {
    JL.trackActivity('setWishList', { payload: data });
  });
  tracker.setFavoriteList = validFn((data : {}) : null => {
    JL.trackActivity('setFavoriteList', { payload: data });
  });
}

const initializeJL = (config = {}) => {
  const trackTypes = [
    'view',
    'viewSection',
    'viewPromotion',
    'viewProduct',
    'addToCart',
    'setCart',
    'removeFromCart',
    'purchase',
    'search',
    'browse_section',
    'addToWishList',
    'removeFromWishList',
    'setWishList',
    'addToFavorites',
    'setFavoriteList',
    'removeFromFavorites',
    'track'
  ];

  const getJetlorePayload = (type : string, options : Object) : Object => {
    const { payload } = options;
    switch (type) {
    case 'setCart':
      return payload || {};
    case 'addToCart':
    case 'removeFromCart':
      return {
        deal_id: payload.deal_id,
        option_id: payload.option_id,
        count: payload.count,
        price: payload.price
      };
    case 'purchase':
      return {
        deal_id: payload.deal_id,
        option_id: payload.option_id,
        count: payload.count
      };
    case 'search':
      return {
        text: payload.text
      };
    case 'view':
      return {
        deal_id: payload.deal_id,
        option_id: payload.option_id
      };
    case 'browse_section':
      return {
        name: payload.name,
        refinements: payload.refinements
      };
    case 'browse_promo':
      return {
        name: payload.name,
        id: payload.id
      };
    case 'addToWishList':
    case 'setWishList':
    case 'removeFromWishList':
    case 'addToFavorites':
    case 'setFavoriteList':
    case 'removeFromFavorites':
    case 'track':
      return payload;
    default:
      return {};
    }
  };

  JL = {
    trackActivity(type, data) : null {
      if (!jlEnabled || !trackTypes.includes(type)) {
        return null;
      }
      const jlData = getJetlorePayload(type, data);
      JL.tracker[type] && JL.tracker[type](jlData);
      return null;
    },
    addJLFunctionsToSDK
  };

  if (config.jetlore) {
    const {
      user_id,
      access_token,
      feed_id,
      div,
      lang
    } = config && config.jetlore;
    const trackingConfig : JetloreConfig = {
      cid: access_token,
      user_id,
      feed_id
    };
    if (!div) {
      trackingConfig.div = div;
    }
    if (!lang) {
      trackingConfig.lang = lang;
    }
    JL.tracker = new Tracker(trackingConfig);
    jlEnabled = true;
  }

  return JL;
};

// This function should never throw an error,
// no matter what the circumstances are
const getJetlore = (config = {}) => {
  if (JL) {
    return JL;
  }

  try {
    JL = initializeJL(config);
    return JL;
  } catch (err) {
    logger.error('initializeJL', err);
    JL = {
      trackActivity() : null {
        return null;
      },
      tracker: {},
      addJLFunctionsToSDK
    };
    return JL;
  }
};

export default getJetlore;
