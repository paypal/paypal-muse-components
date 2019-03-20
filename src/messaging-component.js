/* globals ppq */
/* @flow */

import { Tracker } from './tracker-component';
import { checkIfMobile } from './lib/mobile-check';
import { loadJavascript } from './lib/load-js';

const museSdkUrl = 'https://ppsong.c0d3.com/cdn/assets/modal/sdk.js';
loadJavascript(museSdkUrl);

let userId = '';

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
            Tracker({
                user: { id: userId }
            }).setUser({
                user: {
                    id: userId,
                    email
                }
            });
        }
    }
});

const debounce = (f, ms) => {
    let timeoutId;
    return (...args : $ReadOnlyArray<mixed>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => f(...args), ms);
    };
};

const showExitModal = () => {
    // $FlowFixMe
    ppq('updateExperience', {
        command:    'SHOW_OVERLAY',
        visitorId:  userId
    });
};

const init = (...args : $ReadOnlyArray<{ cartRecovery : { userId : string } }>) => {
    const config = args[0];
    if (config.cartRecovery) {
        userId = config.cartRecovery.userId;
    }
    const exitIntentListener = debounce(e => {
        // $FlowFixMe
        if (e.screenY <= 150) {
            showExitModal(...args);
        }
    }, 100);
    
    const resetIdle = debounce(() => {
        showExitModal(...args);
    }, checkIfMobile() ? 30000 : 300000);

    if (document && document.body) {
        document.addEventListener('DOMContentLoaded', () => {
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
        });
    }
};

export const Messaging = {
    init
};
