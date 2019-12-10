/* @flow */
import type {
  JetloreConfig
} from '../types';

import Tracker from './jetloreTracker';


let JL;

const getJetlore = (config) => {
  let jlEnabled = false;
  if (JL) {
    return JL;
  }

  const trackTypes = [
    'view',
    'addToCart',
    'removeFromCart',
    'purchase',
    'search',
    'browse_section',
    'addToWishList',
    'removeFromWishList',
    'addToFavorites',
    'removeFromFavorites',
    'track'
  ];

  const getJetlorePayload = (type : string, options : Object) : Object => {
    const { payload } = options;
    switch (type) {
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
    case 'removeFromWishList':
    case 'addToFavorites':
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
      JL.tracker[type](jlData);
      return null;
    }
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

export default getJetlore;
