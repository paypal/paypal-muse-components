/* @flow */
import { logger } from './lib/logger';

export const sendStoreCash = () => {
  (function (a, t, o, m, s) { a[m] = a[m] || [];
    a[m].push({ t: new Date().getTime(), event:
      'snippetRun' }); const f =
      t.getElementsByTagName(o)[0],
      e =
      t.createElement(o),
      d = m !== 'paypalDDL' ? `&m=${
        m }` : ''; e.async = !0; e.src =
      `https://www.paypal.com/tagmanager/pptm.js?t=xo&id=${  s  }${ d }`; f.parentNode.insertBefore(e, f);
  }(window, document, 'script', 'paypalDDL', window.location.hostname));
};

export const excludeStoreCash = (config) => {
  try {
    const paypalDDL = window.paypalDDL || [];
    paypalDDL.push({
      event: 'userIdentification',
      identified: true
    });
  } catch (err) {
    logger.error('sdkExcludeStoreCash', err);
    console.log('wtf error');
  }
};
