/* @flow */
/*
** this is jetlore's code, it was pulled from http://api.jetlore.com/js_sdk/js_tracker?jl_cid=5b65ffa59603ca748a8f107a8843b695
*/
let JL
const getJetlore = () => {
  if (JL) return JL;

    JL = {
        tracking: function(init_data) { JL.tracker = new Tracker(init_data) }
    }
    
    function Tracker(init_data) {
        var tracker = this;
        tracker.access_token = init_data.cid;
        tracker.user_id = (typeof init_data.user_id !== 'undefined' && init_data.user_id != null && init_data.user_id !== "" && init_data.user_id.indexOf("/") < 0) ? init_data.user_id : "undefined";
        tracker.feed_id = typeof init_data.feed_id === 'undefined' || init_data.feed_id == "" ? "any_feed" : init_data.feed_id;
        tracker.div = init_data.div;
        tracker.lang = init_data.lang;
        tracker.clicked = typeof init_data.clicked === "function" ? init_data.clicked : function(data){};
        tracker.purchased = typeof init_data.purchased === "function" ? init_data.purchased : function(data){};
        tracker.logToConsoleCookieName = "Tracker_log_to_console";
        tracker.logToConsole = JL_UTIL._isConsoleCookieExists(tracker.logToConsoleCookieName);
        tracker.setCookies = (typeof init_data.setCookies !== 'undefined' && init_data.setCookies != null) ? init_data.setCookies : false;
        tracker.autoPageView = (typeof init_data.autoPageView !== 'undefined' && typeof init_data.autoPageView === "boolean") ? init_data.autoPageView : false;
    
        tracker.log("Tracking initialized with parameters\n" +
                          "\t - access token:" + tracker.access_token + "\n" +
                          "\t - user id     :" + tracker.user_id + "\n" +
                          "\t - feed id     :" + tracker.feed_id  + "\n" +
                          "\t - div         :" + tracker.div + "\n" +
                          "\t - lang        :" + tracker.lang);
        if (tracker.autoPageView) {
          tracker.page_view();
        }
    }
    
    Tracker.prototype.track = function(data) {
        var tracker = this;
        var event = data.event;
        tracker.log(event + " action initiated");
        tracker.log(data);
        var convertData = event == 'search' ? tracker.convertTextData : tracker.convertDealData;
        tracker.performAction(convertData, event, data);
    }
    
    Tracker.prototype.view = function(data) {
        var tracker = this;
        tracker.log("Click action initiated");
        tracker.performAction(tracker.convertDealData, tracker.a_click, data);
    }
    
    Tracker.prototype.click = function(data) {
        var tracker = this;
        tracker.log("Click action initiated");
        tracker.performAction(tracker.convertDealData, tracker.a_click, data);
    }
    
    Tracker.prototype.purchase = function(data) {
        var tracker = this;
        tracker.log("Purchase action initiated");
        tracker.performAction(tracker.convertDealData, tracker.a_purchase, data);
    }
    
    Tracker.prototype.addToCart = function(data) {
        var tracker = this;
        tracker.log("AddToCart action initiated");
        tracker.performAction(tracker.convertDealData, tracker.a_add_to_cart, data);
    }
    
    Tracker.prototype.removeFromCart = function(data) {
        var tracker = this;
        tracker.log("RemoveFromCart action initiated");
        tracker.performAction(tracker.convertDealData, tracker.a_remove_from_cart, data);
    }
    
    Tracker.prototype.addToWishList = function(data) {
        var tracker = this;
        tracker.log("AddToWishList action initiated");
        tracker.performAction(tracker.convertDealData, tracker.a_add_to_wishlist, data);
    }
    
    Tracker.prototype.removeFromWishList = function(data) {
        var tracker = this;
        tracker.log("RemoveFromWishList action initiated");
        tracker.performAction(tracker.convertDealData, tracker.a_remove_from_wishlist, data);
    }
    
    Tracker.prototype.addToFavorites = function(data) {
        var tracker = this;
        tracker.log("AddToFavorites action initiated");
        tracker.performAction(tracker.convertDealData, tracker.a_add_to_favorites, data);
    }
    
    Tracker.prototype.removeFromFavorites = function(data) {
        var tracker = this;
        tracker.log("RemoveFromFavorites action initiated");
        tracker.performAction(tracker.convertDealData, tracker.a_remove_from_favorites, data);
    }
    
    Tracker.prototype.browse_promo = function(data) {
        var tracker = this;
        tracker.log("BrowsePromo action initiated");
        tracker.performAction(tracker.convertTextData, tracker.a_browse_promo, data);
    }
    
    Tracker.prototype.browse_catalog = function(data) {
        var tracker = this;
        tracker.log("BrowseCatalog action initiated");
        tracker.performAction(tracker.convertTextData, tracker.a_browse_catalog, data);
    }
    
    Tracker.prototype.browse_section = function(data) {
        var tracker = this;
        tracker.log("BrowseSection action initiated");
        tracker.performAction(tracker.convertBrowseSectionData, tracker.a_browse_section, data);
    }
    
    Tracker.prototype.search = function(data) {
        var tracker = this;
        tracker.log("Search action initiated");
        tracker.performAction(tracker.convertTextData, tracker.a_search, data);
    }
    
    Tracker.prototype.page_view = function() {
        var tracker = this;
        tracker.log("Page view action initiated");
        tracker.performAction(tracker.convertTextData, tracker.a_page_view, []);
    }
    
    Tracker.prototype.performAction = function(convertData, action, data) {
        var tracker = this;
        if(data){
            //ignore if data is undefined or null
            if(data.constructor === Array) {
                  tracker.action(convertData, action, data);
            } else {
                if((typeof data.deal_id !== "undefined" && data.deal_id != null && data.deal_id != "") ||
                    (typeof data.text !== "undefined" && data.text != null && data.text != "") ||
                    (typeof data.id !== "undefined" && data.id != null && data.id != "") ||
                    (typeof data.name !== "undefined" && data.name != null && data.name != "")
                ) {
                    //ignore if deal_id/text is undefined, null of empty string
                    tracker.action(convertData, action, [data]);
                } else {
                    tracker.log("Action skipped. Provided data object is not Array or does not have 'deal_id' or 'text' property");
                }
            }
        } else {
            tracker.log("Action skipped. No 'data' provided");
        }
    }
    
    Tracker.prototype.urlQuery = function() {
        // This function is anonymous, is executed immediately and
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
                // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]], pair[1] ];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    }
    
    Tracker.prototype.action = function(convertData, action, data) {
        var tracker = this;
        var urlQuery = tracker.urlQuery();
    
        var url_w_user = tracker.api_url + "/" + action + "/" + tracker.user_id;
        var url_w_did = typeof did !== "undefined" ? url_w_user + "/" + did : url_w_user
        var url_w_token = url_w_did + "?access_token=" + tracker.access_token
    
        var url_w_data = url_w_token + "&data=" + tracker.serialize(convertData, data)
    
        var url_w_feed = url_w_data + "&feed=" + tracker.feed_id;
    
        var url_w_div = typeof tracker.div !== 'undefined' && tracker.div != "" ? url_w_feed + "&div=" + tracker.div : url_w_feed;
    
        var url_w_lang = typeof tracker.lang !== 'undefined' && tracker.lang != "" ? url_w_div + "&lang=" + tracker.lang : url_w_div;
    
        var jlCtx = urlQuery.jl_ctx;
    
        var url_w_labels = typeof urlQuery.jl_labels !== 'undefined' && urlQuery.jl_labels != "" ? url_w_lang + "&jl_labels=" + urlQuery.jl_labels : url_w_lang;
    
        var url_w_ctx = typeof jlCtx !== 'undefined' && jlCtx != "" ? url_w_labels + "&jl_ctx=" + jlCtx : url_w_labels;
    
        var url_w_set_cookies = typeof tracker.setCookies !== 'undefined' && tracker.setCookies ? url_w_ctx + "&set_cookies=" + tracker.setCookies : url_w_ctx;
    
        var url_w_location = url_w_set_cookies + "&r_source=" + window.location.host + window.location.pathname;
    
        tracker.log("About to sent JSONP request: " + url_w_location);
        JL_UTIL._jsonp(tracker, url_w_location);
    }
    
    Tracker.prototype.convertDealData = function(data) {
        var tracker = this;
        var arr = [];
        var obj;
        for (var i=0; i<data.length; i++) {
            obj = {}
            JL_UTIL._traverseObject(data[i], function(key, value){
                switch(key) {
                    case 'deal_id':
                        obj['pid'] = value;
                        break;
                    case 'count':
                        obj['count'] = typeof data[i].count === "number" ? value : 1;
                        break;
                    default:
                        obj[key] = value;
    
                }
    
            })
            arr.push(obj);
        }
        return arr;
    }
    
    Tracker.prototype.convertBrowseSectionData = function(data) {
        var arr = [];
        for (var i = 0; i < data.length; i++) {
            var browse_section_data = data[i];
            var name = browse_section_data.name;
            var refinements = browse_section_data.refinements;
            var refinements_arr = [];
            if (refinements != undefined) {
                for (var j = 0; j < refinements.length; j++) {
                    var obj = {};
                    JL_UTIL._traverseObject(refinements[j], function(key, value){ obj[key] = value; });
                    refinements_arr.push(obj);
                }
            }
            arr.push({"name": name, "refinements": refinements_arr});
        }
        return arr;
    }
    
    Tracker.prototype.convertTextData = function(data) {
        return data;
    }
    
    Tracker.prototype.serialize = function(convertData, data) {
        var tracker = this;
        var serializedObj = JSON.stringify( convertData( data ) );
        tracker.log("Data object converted to string: " + serializedObj);
        return encodeURIComponent(serializedObj);
    }
    Tracker.prototype.enableLog = function() {
        var self = this;
        self.logToConsole = true;
        self.log("Stored enable log to console 'marker' cookie. Will expire in " + 30*60*1000 + " milliseconds");
        JL_UTIL._setCookie(self.logToConsoleCookieName, (new Date()).getTime(), 30*60*1000);
        self.log("JL logging Enabled");
    }
    
    Tracker.prototype.disableLog = function() {
        var self = this;
        self.log("Removed enable log to console 'marker' cookie");
        self.logToConsole = false;
        self.log("Stored enable log to console 'marker' cookie. Will expire in " + -30*60*1000 + " milliseconds");
        JL_UTIL._setCookie(self.logToConsoleCookieName, (new Date()).getTime(), -30*60*1000);
        self.log("JL logging Disabled");
    }
    
    Tracker.prototype.log = function(text) {
        var self = this;
        if (self.logToConsole && window.console && window.console.log ) {
          console.log(text);
        }
    }
    
    var JL_UTIL = {
      _traverseObject: function(obj, func){
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                func(prop, obj[prop]);
            }
        }
      },
    
      _deepCopyObject: function(src){
        var obj = {};
        this._traverseObject(src, function(key, value){
          obj[key] = value;
        });
        return obj;
      },
    
      _objectToQueryString: function(obj){
        var builder = "";
    
        this._traverseObject(obj, function(prop, value) {
          var strValue = typeof value == "object" ? JSON.stringify(value) : value;
          builder += encodeURIComponent(prop) + "=" + encodeURIComponent(strValue) + "&";
        })
    
        return builder;
      },
    
      _jsonp: function(self, url) {
        var imgTag = document.createElement("img");
        imgTag.src=url;
        imgTag.style.display = 'none'
        document.getElementsByTagName("body")[0].appendChild(imgTag);
        self.log("SENT JSONP request: " + url)
      },
    
      _getUTCTime: function(){
        return new Date(
            this.getUTCFullYear(),
            this.getUTCMonth(),
            this.getUTCDate(),
            this.getUTCHours(),
            this.getUTCMinutes(),
            this.getUTCSeconds()
        ).getTime();
      },
    
      _getCookie: function(cname) {
          var name = cname + "=";
          var ca = document.cookie.split(';');
          for(var i = 0; i < ca.length; i++) {
                  var c = ca[i];
                  while (c.charAt(0) === ' ') c = c.substring(1);
                  if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
          }
          return "";
      },
    
      _setCookie: function(cname, cvalue, exMilliseconds) {
          var d = new Date();
          d.setTime(d.getTime() + exMilliseconds);
          var expires = "expires="+d.toUTCString();
          document.cookie = cname + "=" + cvalue + "; Path=/; " + expires;
      },
    
      _isConsoleCookieExists: function(cookieName) {
          return "" !== JL_UTIL._getCookie(cookieName);
      }
    }
    Tracker.prototype.a_purchase='purch'
    Tracker.prototype.a_click='click'
    Tracker.prototype.a_add_to_cart='add_to_cart'
    Tracker.prototype.a_remove_from_cart='remove_from_cart'
    Tracker.prototype.a_add_to_wishlist='add_to_wishlist'
    Tracker.prototype.a_remove_from_wishlist='remove_from_wishlist'
    Tracker.prototype.a_add_to_favorites='add_to_favorites'
    Tracker.prototype.a_remove_from_favorites='remove_from_favorites'
    Tracker.prototype.a_browse_promo='browse_promo'
    Tracker.prototype.a_browse_catalog='browse_catalog'
    Tracker.prototype.a_browse_section='browse_section'
    Tracker.prototype.api_url='https://api.jetlore.com/track'
    Tracker.prototype.a_search='search'
    Tracker.prototype.a_page_view='page_view'

    return JL
}

export default getJetlore;
