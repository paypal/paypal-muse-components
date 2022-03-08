/* @flow */
/* eslint consistent-this: [2, "tracker", "self" ] */

/*
** this is jetlore's code, it was pulled from http://api.jetlore.com/js_sdk/js_tracker?jl_cid=5b65ffa59603ca748a8f107a8843b695
*/

import {
  getUserId,
  getIdentity,
  getValidContainer
} from './local-storage';

const JL_UTIL = {
  _traverseObject(obj, func) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        func(prop, obj[prop]);
      }
    }
  },

  _deepCopyObject(src) : any {
    const obj = {};
    this._traverseObject(src, (key, value) => {
      obj[key] = value;
    });
    return obj;
  },

  _objectToQueryString(obj) : any {
    let builder = '';

    this._traverseObject(obj, (prop, value) => {
      const strValue = typeof value === 'object' ? JSON.stringify(value) : value;
      builder += `${ encodeURIComponent(prop)  }=${  encodeURIComponent(strValue)  }&`;
    });

    return builder;
  },

  _jsonp(mainObj, url) : any {
    const imgTag = document.createElement('img');
    imgTag.src = url;
    imgTag.height = '1px';
    imgTag.width = '1px';
    imgTag.style.position = 'fixed';
    imgTag.style.top = '0';
    imgTag.style.left = '0';
    imgTag.style.opacity = '0.01';
    imgTag.style.pointerEvents = 'none';
    document.body.appendChild(imgTag);
    const removeTag = function() {
      try {
        imgTag.remove();
      } catch (err) {
        mainObj.log('cannot remove image pixel');
      }
    };
    imgTag.addEventListener('load', removeTag);
    imgTag.addEventListener('error', removeTag);
    mainObj.log(`SENT JSONP request: ${  url }`);
  },

  _getUTCTime() : any {
    return new Date(
      this.getUTCFullYear(),
      this.getUTCMonth(),
      this.getUTCDate(),
      this.getUTCHours(),
      this.getUTCMinutes(),
      this.getUTCSeconds()
    ).getTime();
  },

  _getCookie(cname) : any {
    const name = `${ cname  }=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        // eslint-disable-next-line unicorn/prefer-string-slice
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        // eslint-disable-next-line unicorn/prefer-string-slice
        return c.substring(name.length, c.length);
      }
    }
    return '';
  },

  _setCookie(cname, cvalue, exMilliseconds) {
    const d = new Date();
    d.setTime(d.getTime() + exMilliseconds);
    const expires = `expires=${ d.toUTCString() }`;
    document.cookie = `${ cname  }=${  cvalue  }; Path=/; ${  expires }`;
  },

  _isConsoleCookieExists(cookieName) : any {
    return JL_UTIL._getCookie(cookieName) !== '';
  }
};

const retrieveUserId = () => {
  const sysUserId = getUserId() || {};
  const identityId = getIdentity() || {};
  return sysUserId.merchantProvidedUserId || identityId.encryptedAccountNumber || sysUserId.userId;
};

/* @flow */
function Tracker(init_data) {
  const tracker = this;
  tracker.access_token = init_data.cid;
  tracker.user_id = retrieveUserId();
  tracker.feed_id = typeof init_data.feed_id === 'undefined' || !init_data.feed_id ? 'any_feed' : init_data.feed_id;
  tracker.div = init_data.div;
  tracker.lang = init_data.lang;
  tracker.clicked = typeof init_data.clicked === 'function' ? init_data.clicked : function clickedAction() {};
  tracker.purchased = typeof init_data.purchased === 'function' ? init_data.purchased : function purchasedAction() {};
  tracker.logToConsoleCookieName = 'Tracker_log_to_console';
  tracker.logToConsole = JL_UTIL._isConsoleCookieExists(tracker.logToConsoleCookieName);
  tracker.setCookies = (typeof init_data.setCookies !== 'undefined' && init_data.setCookies !== null) ? init_data.setCookies : false;
  tracker.autoPageView = (typeof init_data.autoPageView !== 'undefined' && typeof init_data.autoPageView === 'boolean') ? init_data.autoPageView : false;

  tracker.log(`${ 'Tracking initialized with parameters\n' +
                          '\t - access token:' }${  tracker.access_token  }\n` +
    `\t - user id     :${  tracker.user_id  }\n` +
    `\t - feed id     :${  tracker.feed_id   }\n` +
    `\t - div         :${  tracker.div  }\n` +
    `\t - lang        :${  tracker.lang }`);
  if (tracker.autoPageView) {
    tracker.page_view();
  }
}

Tracker.prototype.track = function track(data) {
  const tracker = this;
  const event = data.event;
  tracker.log(`${ event  } action initiated`);
  tracker.log(data);
  const convertData = event === 'search' ? tracker.convertTextData : tracker.convertDealData;
  tracker.performAction(convertData, event, data);
};

Tracker.prototype.view = function view(data) {
  const tracker = this;
  tracker.log('Click action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_click, data);
};

Tracker.prototype.click = function click(data) {
  const tracker = this;
  tracker.log('Click action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_click, data);
};

Tracker.prototype.purchase = function purchase(data) {
  const tracker = this;
  tracker.log('Purchase action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_purchase, data);
};

Tracker.prototype.addToCart = function addToCart(data) {
  const tracker = this;
  tracker.log('AddToCart action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_add_to_cart, data);
};

Tracker.prototype.setCart = function setCart(data) {
  const tracker = this;
  tracker.log('SetCart action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_set_cart, data);
};

Tracker.prototype.removeFromCart = function removeFromCart(data) {
  const tracker = this;
  tracker.log('RemoveFromCart action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_remove_from_cart, data);
};

Tracker.prototype.addToWishList = function addToWishList(data) {
  const tracker = this;
  tracker.log('AddToWishList action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_add_to_wishlist, data);
};

Tracker.prototype.removeFromWishList = function removeFromWishList(data) {
  const tracker = this;
  tracker.log('RemoveFromWishList action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_remove_from_wishlist, data);
};

Tracker.prototype.setWishList = function setWishList(data) {
  const tracker = this;
  tracker.log('SetWishList action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_set_wishlist, data);
};

Tracker.prototype.addToFavorites = function addToFavorites(data) {
  const tracker = this;
  tracker.log('AddToFavorites action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_add_to_favorites, data);
};

Tracker.prototype.removeFromFavorites = function removeFromFavorites(data) {
  const tracker = this;
  tracker.log('RemoveFromFavorites action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_remove_from_favorites, data);
};

Tracker.prototype.setFavoriteList = function setFavoriteList(data) {
  const tracker = this;
  tracker.log('SetFavoriteList action initiated');
  tracker.performAction(tracker.convertDealData, tracker.a_set_favorites, data);
};

Tracker.prototype.browse_promo = function browse_promo(data) {
  const tracker = this;
  tracker.log('BrowsePromo action initiated');
  tracker.performAction(tracker.convertTextData, tracker.a_browse_promo, data);
};

Tracker.prototype.browse_product = function browse_product(data) {
  const tracker = this;
  tracker.log('BrowseProduct action initiated');
  tracker.performAction(tracker.convertTextData, tracker.a_browse_product, data);
};

Tracker.prototype.browse_catalog = function browse_catalog(data) {
  const tracker = this;
  tracker.log('BrowseCatalog action initiated');
  tracker.performAction(tracker.convertTextData, tracker.a_browse_catalog, data);
};

Tracker.prototype.browse_section = function browse_section(data) {
  const tracker = this;
  tracker.log('BrowseSection action initiated');
  tracker.performAction(tracker.convertBrowseSectionData, tracker.a_browse_section, data);
};

Tracker.prototype.search = function search(data) {
  const tracker = this;
  tracker.log('Search action initiated');
  tracker.performAction(tracker.convertTextData, tracker.a_search, data);
};

Tracker.prototype.page_view = function page_view() {
  const tracker = this;
  tracker.log('Page view action initiated');
  tracker.performAction(tracker.convertTextData, tracker.a_page_view, []);
};

Tracker.prototype.performAction = function performAction(convertData, action, data) {
  const tracker = this;
  if (data) {
    data.id = retrieveUserId() || data.id;

    // ignore if data is undefined or null
    if (data.constructor === Array) {
      tracker.action(convertData, action, data);
    } else {
      if ((typeof data.deal_id !== 'undefined' && data.deal_id !== null && data.deal_id !== '') ||
        (typeof data.text !== 'undefined' && data.text !== null && data.text !== '') ||
        (typeof data.id !== 'undefined' && data.id !== null && data.id !== '') ||
        (typeof data.name !== 'undefined' && data.name !== null && data.name !== '')
      ) {
        // ignore if deal_id/text is undefined, null of empty string
        tracker.action(convertData, action, [ data ]);
      } else {
        tracker.log('Action skipped. Provided data object is not Array or does not have \'deal_id\' or \'text\' property');
      }
    }
  } else {
    tracker.log('Action skipped. No \'data\' provided');
  }
};

Tracker.prototype.urlQuery = function urlQuery() : any {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  const query_string = {};
  // eslint-disable-next-line unicorn/prefer-string-slice
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    // If first entry with this name
    if (typeof query_string[pair[0]] === 'undefined') {
      query_string[pair[0]] = pair[1];
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === 'string') {
      const arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  }
  return query_string;
};

const extractJLToken = () => {
  const containerSummary = getValidContainer() || {};
  const jlAccessToken = containerSummary && containerSummary.jlAccessToken;
  return jlAccessToken;
};

Tracker.prototype.action = function takeAction(convertData, action, data) : any {
  let did; // TODO: JL bug because did is undefined. Figure out what this is, and when/how this is used
  const tracker = this;

  const jlAccessToken = extractJLToken();
  if (!jlAccessToken) {
    return;
  }
  tracker.access_token = jlAccessToken;

  tracker.user_id = retrieveUserId() || tracker.user_id;

  const urlQuery = tracker.urlQuery();

  const url_w_user = `${ tracker.api_url  }?action=${  action  }&id=${  tracker.user_id }`;
  const url_w_did = typeof did !== 'undefined' ? `${ url_w_user  }&did=${ did }` : url_w_user;
  const url_w_token = `${ url_w_did  }&access_token=${  tracker.access_token }`;

  const url_w_data = `${ url_w_token  }&data=${  tracker.serialize(convertData, data) }`;

  const url_w_feed = `${ url_w_data  }&feed=${  tracker.feed_id  }${ data && data[0] && data[0].deal_id ? `&pid=${  data[0].deal_id }` : ''  }${ data && data[0] && data[0].price ? `&price=${  data[0].price }` : '' }`;

  const url_w_div = typeof tracker.div !== 'undefined' && tracker.div !== '' ? `${ url_w_feed  }&div=${  tracker.div }` : url_w_feed;

  const url_w_lang = typeof tracker.lang !== 'undefined' && tracker.lang !== '' ? `${ url_w_div  }&lang=${  tracker.lang }` : url_w_div;

  const jlCtx = urlQuery.jl_ctx;

  const url_w_labels = typeof urlQuery.jl_labels !== 'undefined' && urlQuery.jl_labels !== '' ? `${ url_w_lang  }&jl_labels=${  urlQuery.jl_labels }` : url_w_lang;

  const url_w_ctx = typeof jlCtx !== 'undefined' && jlCtx !== '' ? `${ url_w_labels  }&jl_ctx=${  jlCtx }` : url_w_labels;

  const url_w_set_cookies = typeof tracker.setCookies !== 'undefined' && tracker.setCookies ? `${ url_w_ctx  }&set_cookies=${  tracker.setCookies }` : url_w_ctx;

  const url_w_location = `${ url_w_set_cookies  }&r_source=${  window.location.host  }${ window.location.pathname }`;

  tracker.log(`About to sent JSONP request: ${  url_w_location }`);
  JL_UTIL._jsonp(tracker, url_w_location);
};

Tracker.prototype.convertDealData = function convertDealData(data) : any {
  const arr = [];
  let obj;
  for (let i = 0; i < data.length; i++) {
    obj = {};
    JL_UTIL._traverseObject(data[i], (key, value) => {
      switch (key) {
      case 'deal_id':
        obj.pid = value;
        break;
      case 'count':
        obj.count = typeof data[i].count === 'number' ? value : 1;
        break;
      default:
        obj[key] = value;

      }

    });
    arr.push(obj);
  }
  return arr;
};

Tracker.prototype.convertBrowseSectionData = function convertBrowseSectionData(data) : any {
  const arr = [];
  for (let i = 0; i < data.length; i++) {
    const browse_section_data = data[i];
    const name = browse_section_data.name;
    const refinements = browse_section_data.refinements;
    const refinements_arr = [];
    if (refinements !== undefined) {
      for (let j = 0; j < refinements.length; j++) {
        const obj = {};
        JL_UTIL._traverseObject(refinements[j], (key, value) => {
          obj[key] = value;
        });
        refinements_arr.push(obj);
      }
    }
    arr.push({ name, 'refinements': refinements_arr });
  }
  return arr;
};

Tracker.prototype.convertTextData = function convertTextData(data) : any {
  return data;
};

Tracker.prototype.serialize = function serialize(convertData, data) : any {
  const tracker = this;
  const serializedObj = JSON.stringify(convertData(data));
  tracker.log(`Data object converted to string: ${  serializedObj }`);
  return encodeURIComponent(serializedObj);
};
Tracker.prototype.enableLog = function enableLog() {
  const self = this;
  self.logToConsole = true;
  self.log(`Stored enable log to console 'marker' cookie. Will expire in ${  30 * 60 * 1000  } milliseconds`);
  JL_UTIL._setCookie(self.logToConsoleCookieName, (new Date()).getTime(), 30 * 60 * 1000);
  self.log('JL logging Enabled');
};

Tracker.prototype.disableLog = function disableLog() {
  const self = this;
  self.log('Removed enable log to console \'marker\' cookie');
  self.logToConsole = false;
  self.log(`Stored enable log to console 'marker' cookie. Will expire in ${  -30 * 60 * 1000  } milliseconds`);
  JL_UTIL._setCookie(self.logToConsoleCookieName, (new Date()).getTime(), -30 * 60 * 1000);
  self.log('JL logging Disabled');
};

Tracker.prototype.log = function log(text) {
  const self = this;
  if (self.logToConsole && window.console && window.console.log) {
    console.log(text); // eslint-disable-line no-console
  }
};

Tracker.prototype.a_purchase = 'purch';
Tracker.prototype.a_click = 'click';
Tracker.prototype.a_add_to_cart = 'add_to_cart';
Tracker.prototype.a_set_cart = 'set_cart';
Tracker.prototype.a_remove_from_cart = 'remove_from_cart';
Tracker.prototype.a_add_to_wishlist = 'add_to_wishlist';
Tracker.prototype.a_set_wishlist = 'set_wishlist';
Tracker.prototype.a_remove_from_wishlist = 'remove_from_wishlist';
Tracker.prototype.a_add_to_favorites = 'add_to_favorites';
Tracker.prototype.a_remove_from_favorites = 'remove_from_favorites';
Tracker.prototype.a_set_favorites = 'set_favorites';
Tracker.prototype.a_browse_promo = 'browse_promo';
Tracker.prototype.a_browse_catalog = 'browse_catalog';
Tracker.prototype.a_browse_product = 'browse_product';
Tracker.prototype.a_browse_section = 'browse_section';
Tracker.prototype.api_url = 'https://api.jetlore.com/track.png';
Tracker.prototype.a_search = 'search';
Tracker.prototype.a_page_view = 'page_view';

export default Tracker;
