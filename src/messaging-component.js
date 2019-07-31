/* globals ppq */
/* @flow */

import { Tracker } from './tracker-component';
import { checkIfMobile } from './lib/mobile-check';
import { loadJavascript } from './lib/load-js';
import { getCookie, setCookie } from './lib/cookie-utils';

const museSdkUrl = 'https://www.paypalobjects.com/muse/cart-recovery-0.3/sdk.js';
let userId = '';
let isRendered = false;
const sevenDays = 6.048e+8;

const debounce = (f, ms) => {
    let timeoutId;
    return (...args : $ReadOnlyArray<mixed>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => f(...args), ms);
    };
};

const showExitModal = ({ cartRecovery }) => {
    // don't show modal if cartRecovery is not enabled
    if (!cartRecovery) {
        return false;
    }
    // don't show modal if user is identified
    const email = getCookie('paypal-cr-user');
    if (email) {
        return false;
    }
    // don't show modal if user has no cart items
    // Prefer localStorage first, fallback to cookie (backwards compatibility -- this check can be removed a couple weeks after deploy).
    const cart = JSON.parse(window.localStorage.getItem('paypal-cr-cart') || getCookie('paypal-cr-cart') || '{}');
    if (!cart.items) {
        return false;
    }
    // don't show modal if user has seen in last 7 days
    const lastSeen = Boolean(getCookie('paypal-cr-lastseen'));
    if (lastSeen) {
        return false;
    }
    if (!isRendered) {
        // $FlowFixMe
        ppq('updateExperience', {
            command:    'SHOW_OVERLAY',
            visitorId:  userId
        });
        setCookie('paypal-cr-lastseen', 'true', sevenDays);
        isRendered = true;
    }
    return isRendered;
};

export const Messaging = (...args : $ReadOnlyArray<{ cartRecovery : { userId : string, beta? : boolean } }>) => {
    console.warn('PayPal Messaging: This component has been deprecated. Starting July 24, this **functionality** will no longer be available and will result in an error. For more information email dl-pp-sdk-messaging@paypal.com'); // eslint-disable-line no-console
    const config = args[0];
    if (!config.cartRecovery || !config.cartRecovery.beta) {
        return;
    }
    if (config.cartRecovery) {
        userId = config.cartRecovery.userId;
    }
    const exitIntentListener = debounce(e => {
        // $FlowFixMe
        if (e.clientY <= 10) {
            showExitModal(...args);
        }
    }, 100);
    
    const resetIdle = debounce(() => {
        showExitModal(...args);
    }, checkIfMobile() ? 30000 : 300000);

    const bindEventListeners = () => {
        // $FlowFixMe
        document.body.addEventListener('mousemove', exitIntentListener);
        // $FlowFixMe
        document.body.addEventListener('mousemove', resetIdle);
        // $FlowFixMe
        document.body.addEventListener('mousedown', resetIdle);
        // $FlowFixMe
        document.body.addEventListener('touchstart', resetIdle);
        // $FlowFixMe
        document.body.addEventListener('onclick', resetIdle);
    };

    if (document && document.body) {
        if (document.readyState === 'complete') {
            bindEventListeners();
        } else {
            document.addEventListener('readystatechange', () => {
                if (document.readyState === 'complete') {
                    bindEventListeners();
                }
            });
        }
    }
};

export function setup() {
    loadJavascript(museSdkUrl);
    // $FlowFixMe
    ppq('showExperience', 'https://www.paypalobjects.com/muse/cart-recovery-0.3/', 'body', {
        sessionId:          'BOND007',
        variant:            'modal',
        flow:               'cart-recovery',
        mobileVariant:      'modal',
        mobileFlow:         'cart-recovery',
        isMobileEnabled:    'true',
        isDesktopEnabled:   'true',
        mrid:               'FY8HBGU6Y2MWW',
        iframeId:           '__cr',
        dismissCookieAge:   0,
        isPpUserExclusive:  false,
        handleEvents:       ({ data, email }) => {
            if (!data) {
                return;
            }
            if (data.includes('CR_EMAIL_RECEIVED')) {
                Tracker().setUser({
                    user: { email }
                });
            }
        }
    });
}
