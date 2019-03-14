/* @flow */
import { create, EVENT } from 'zoid/src';
import { destroyElement } from 'belter/src'

const CLASS = {
    VISIBLE:   'visible',
    INVISIBLE: 'invisible',
    PRERENDER: 'prerender'
};

let isRendered = false;

const modal = create({
    tag:  'paypal-cart-recovery-modal',
    url: 'http://localhost:8001/cartrecovery/modal',
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
                width: 100%;
                height: 100%;
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
                margin: 10vh auto;
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
        width: '704px',
        height: '390px'
    }
})({
    setLastSeen: () => {
        localStorage.setItem('paypal-cr-lastseen', String(Date.now()))
    },
    closeModal: () => {
        isRendered = false;
        modal.close();
    },
    submitEmail: (email) => {
        // TODO: set email to cart
    }
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
        console.log('cartRecovery option not enabled')
        return false;
    }
    // don't show modal if user is identified
    const email = localStorage.getItem('paypal-cr-user');
    if (email !== null) {
        console.log('[exit] no email');
        return false;
    }
    // don't show modal if user has no cart items
    const cart = JSON.parse(localStorage.getItem('paypal-cr-cart') || '{}')
    if (!cart.items) {
        console.log('[exit] no items');
        return false;
    }
    console.log('cart:', cart)
    // don't show modal if user has seen in last 7 days
    const sevenDays = 1000 * 60 * 60 * 24 * 7;
    const lastSeen = Number(localStorage.getItem('paypal-cr-lastseen')) || 0;
    if (Date.now() - lastSeen < sevenDays) {
        console.log('[exit] seen < 7 days ago');
        return false;
    }
    if (!isRendered) {
        console.log('render experience....');
        modal.render('body');
        isRendered = true
        return true
    }
    return false
};

const init = (...args) => {
    const exitIntentListener = debounce(e => {
        if (e.screenY <= 150) {
            showExitModal(...args);
        }
    }, 100);
    
    const resetIdle = debounce(() => {
        showExitModal(...args);
    }, 300000);

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
}