/* @flow */
import constants from './constants';

const { storage } = constants;
const timeOutOptions = { hour12: false };

function _getTimeLabel() : string {
  const now = new Date();
  const millis = now.getTime() % 1000;
  return `${ now.toLocaleTimeString('en-US', timeOutOptions)  }.${  millis  } - `;
}

function _initDebugTracker() {
  if (typeof global.debugLogInitilized === 'undefined' || !global.debugLogInitilized) {
    const currentUrl = new URL(window.location.href);
    // use the param ?ppDebug=true to see logs
    let debug = currentUrl.searchParams.get('ppDebug') === 'true';
    if (debug) {
      // eslint-disable-next-line no-console
      console.log(`${ _getTimeLabel()  }[debug-console-logger:init] PayPal Shopping: debug mode on. Based on URL parameter.`);
    } else {
      debug = window.localStorage.getItem(storage.paypalSDKConsoleDebug) === 'true';
      if (debug) {
        // eslint-disable-next-line no-console
        console.log(`${ _getTimeLabel()  }[debug-console-logger:init] PayPal Shopping: debug mode on. Based on local storage.`);
      }
    }
    global.debugLogEnabled = debug;
    global.debugLogInitilized = true;
  }
}

// Trigger init. Will initialize global.debugLogEnabled variable
_initDebugTracker();

export const debugLogger = {
  log: (msg : string, ...args : any) => {
    if (global.debugLogEnabled && typeof (console) !== 'undefined') {
      if (args.length > 0) {
        // eslint-disable-next-line no-console
        console.log(_getTimeLabel() + msg, args);
      } else {
        // eslint-disable-next-line no-console
        console.log(_getTimeLabel() + msg);
      }
    }
  },
  setDebugEnabled: (enabled : boolean) => {
    window.localStorage.setItem(storage.paypalSDKConsoleDebug, enabled);
    if (enabled) {
      // eslint-disable-next-line no-console
      console.log(`${ _getTimeLabel()  }[debug-console-logger:setDebugEnabled] PayPal Shopping: debug mode on. Mode ON saved to local storage.`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`${ _getTimeLabel()  }[debug-console-logger:setDebugEnabled] PayPal Shopping: debug mode off. Mode OFF saved to local storage.`);
    }
    global.debugLogEnabled = enabled;
  }
};

