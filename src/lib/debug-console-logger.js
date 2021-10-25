/* @flow */
export const debugLogger = {
  log: (msg : string, obj : object) => {
    if (global.debugLogEnabled) {
      if (typeof obj !== 'undefined') {
        // eslint-disable-next-line no-console
        console.log(msg, obj);
      }
      else {
        // eslint-disable-next-line no-console
        console.log(msg);
      }
    }
  },
  init: () => {
    const currentUrl = new URL(window.location.href);
    // use the param ?ppDebug=true to see logs
    let debug = currentUrl.searchParams.get('ppDebug');
    if (debug) {
      // eslint-disable-next-line no-console
      console.log('[debug-console-logger:init] PayPal Shopping: debug mode on. Based on URL parameter.');
    }

    if (!debug) {
      debug = window.localStorage.getItem('ppDebug') === 'true';
      if (debug) {
        // eslint-disable-next-line no-console
        console.log('[debug-console-logger:init] PayPal Shopping: debug mode on. Based on local storage.');
      }
    }
     
    global.debugLogEnabled = debug;
  },
  setDebugEnabled: (enabled : boolean) => {
    window.localStorage.setItem('ppDebug', enabled);
    if (enabled) {
      // eslint-disable-next-line no-console
      console.log('[debug-console-logger:setDebugEnabled] PayPal Shopping: debug mode on. Mode ON saved to local storage.');
    } else {
      // eslint-disable-next-line no-console
      console.log('[debug-console-logger:setDebugEnabled] PayPal Shopping: debug mode off. Mode OFF saved to local storage.');
    }
    global.debugLogEnabled = enabled;
  }
};

