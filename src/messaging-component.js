/* @flow */
import { create, EVENT } from 'zoid/src';
import { destroyElement } from 'belter/src';

import { Tracker } from './tracker-component';
import checkIfMobile from './lib/mobile-check';

const CLASS = {
    VISIBLE:   'visible',
    INVISIBLE: 'invisible',
    PRERENDER: 'prerender'
};

const isMobile = checkIfMobile();

let isRendered = false;
let userId = '';

const modal = create({
    tag:               'paypal-cart-recovery-modal',
    url:               'https://localhost:8001/cartrecovery/modal',
    containerTemplate: ({ uid, frame, prerenderFrame, doc, event, dimensions : { width, height } }) => {
        if (!frame || !prerenderFrame) {
            return;
        }
        const container = doc.createElement('div')
        const div = doc.createElement('div');
        container.appendChild(div);
        container.classList.add('hidden');
        div.setAttribute('id', uid);
        const style = doc.createElement('style');

        style.appendChild(doc.createTextNode(`
            #${ uid } {
                background-color: rgba(50, 50, 50, 0.8);
                width: 100vw;
                margin: 0;
                height: 100vh;
                position: absolute;
                top: 0;
                left: 0;
                text-align: center;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            #${ uid } > iframe {
                width: ${ width };
                height: ${ height };
                display: block;
                margin: 0 auto;
                transition: opacity .2s ease-in-out;
            }
            #${ uid } > iframe.${ CLASS.INVISIBLE } {
                opacity: 0;
            }
            #${ uid } > iframe.${ CLASS.VISIBLE } {
                opacity: 1;
            }
            .hidden {
                display: none;
            }
        `));
        div.appendChild(frame);
        div.appendChild(prerenderFrame);
        div.appendChild(style);
        prerenderFrame.classList.add(CLASS.VISIBLE);
        frame.classList.add(CLASS.INVISIBLE);
    
        event.on(EVENT.RENDERED, () => {
            container.classList.remove('hidden')
            prerenderFrame.classList.remove(CLASS.VISIBLE);
            prerenderFrame.classList.add(CLASS.INVISIBLE);
            frame.classList.remove(CLASS.INVISIBLE);
            frame.classList.add(CLASS.VISIBLE);
            setTimeout(() => {
                destroyElement(prerenderFrame);
            }, 1);
        });
        return container;
    },
    dimensions: {
        width:  isMobile ? '100%' : '704px',
        height: isMobile ? '100%' : '390px'
    }
})({
    setLastSeen: () => {
        localStorage.setItem('paypal-cr-lastseen', String(Date.now()));
    },
    closeModal: () => {
        isRendered = false;
        modal.close();
    },
    submitEmail: (email) => {
        Tracker({
            property: {
                // figure out how to get this
                id: '2d716c47-ffc3-4720-93d6-1ca7e55b315b'
            },
            user: {
                id: userId
            }
        });
        Tracker.setUser({
            user: {
                id: userId,
                email
            }
        });
    },
    isMobile
});

const debounce = (f, ms) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => f(...args), ms);
    };
};

const showExitModal = ({ cartRecovery }) => { // returns true if modal was shown
    // don't show modal if cartRecovery is not enabled
    if (!cartRecovery) {
        return false;
    }
    // don't show modal if user is identified
    const email = localStorage.getItem('paypal-cr-user');
    if (email !== null) {
        return false;
    }
    // don't show modal if user has no cart items
    const cart = JSON.parse(localStorage.getItem('paypal-cr-cart') || '{}');
    if (!cart.items) {
        return false;
    }
    // don't show modal if user has seen in last 7 days
    const sevenDays = 1000 * 60 * 60 * 24 * 7;
    const lastSeen = Number(localStorage.getItem('paypal-cr-lastseen')) || 0;
    if (Date.now() - lastSeen < sevenDays) {
        return false;
    }
    if (!isRendered) {
        modal.render('body');
        isRendered = true;
    }
    return isRendered;
};

const init = (...args) => {
    const config = args[0];
    if (config.cartRecovery) {
        userId = config.cartRecovery.userId;
    }
    const exitIntentListener = debounce(e => {
        if (e.screenY <= 150) {
            showExitModal(...args);
        }
    }, 100);
    
    const resetIdle = debounce(() => {
        showExitModal(...args);
    }, isMobile ? 30000 : 300000);

    if (document.body) {
        document.body.addEventListener('mousemove', exitIntentListener);
        document.body.addEventListener('mousemove', resetIdle);
        document.body.addEventListener('mousedown', resetIdle);
        document.body.addEventListener('touchstart', resetIdle);
        document.body.addEventListener('onclick', resetIdle);
    }
};

export const Messaging = {
    init
};
