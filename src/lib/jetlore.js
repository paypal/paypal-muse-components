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
  tracker.viewPromo = validFn((data : {}) : null => {
    JL.trackActivity('viewPromo', { payload: data });
  });
  tracker.viewProduct = validFn((data : {}) : null => {
    JL.trackActivity('viewProduct', { payload: data });
  });
  tracker.addToFavorites = validFn((data : {}) : null => {
    JL.trackActivity('addToFavorites', { payload: data });
  });
  tracker.removeFromFavorites = validFn((data : {}) : null => {
    JL.trackActivity('removeFromFavorites', { payload: data });
  });
  tracker.addToWishList = validFn((data : {}) : null => {
    JL.trackActivity('addToWishList', { payload: data });
  });
  tracker.removeFromWishList = validFn((data : {}) : null => {
    JL.trackActivity('removeFromWishList', { payload: data });
  });
  tracker.setWishList = validFn((data : {}) : null => {
    JL.trackActivity('setWishList', { payload: data });
  });
  tracker.setFavoriteList = validFn((data : {}) : null => {
    JL.trackActivity('setFavoriteList', { payload: data });
  });
  tracker.search = validFn((data : {}) : null => {
    JL.trackActivity('search', { payload: data });
  });
}

const initializeJL = (config = {}) => {
  const trackTypes = [
    'view',
    'viewSection',
    'viewPromo',
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

  const getItems = (items : any) => {
    const allItems = Array.isArray(items) ? items : [];
    return allItems.filter(item => item.id).map(item => ({
      deal_id: item.id,
      option_id: item.optionId,
      count: item.quantity,
      price: item.price
    }));
  };

  const getJetlorePayload = (type : string, options : Object) : Object => {
    const { payload } = options;
    switch (type) {
    case 'setCart':
      return payload || {};
    case 'addToCart':
    case 'removeFromCart':
    case 'purchase':
      return getItems(options.items);
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
    case 'viewProduct':
    case 'addToFavorites':
    case 'removeFromFavorites':
    case 'addToWishList':
    case 'removeFromWishList':
      return {
        deal_id: payload.dealId,
        item_group_id: payload.item_group_id
      };
    case 'viewPromo':
    case 'viewSection':
    case 'setWishList':
    case 'setFavoriteList':
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
      if (type === 'viewPromo') {
        return JL.tracker.browse_promo && JL.tracker.browse_promo(jlData);
      }
      if (type === 'viewSection') {
        return JL.tracker.browse_section && JL.tracker.browse_section(jlData);
      }
      if (type === 'viewProduct') {
        return JL.tracker.browse_product && JL.tracker.browse_product(jlData);
      }
      if (type === 'setCart') {
        return JL.tracker.setCart && JL.tracker.setCart(data);
      }
      JL.tracker[type] && JL.tracker[type](jlData);
      return null;
    },
    addJLFunctionsToSDK
  };

  const jetloreConfig = config.jetlore || config || {};
  if (jetloreConfig) {
    const {
      user_id,
      access_token,
      feed_id,
      div,
      lang
    } = jetloreConfig;
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
