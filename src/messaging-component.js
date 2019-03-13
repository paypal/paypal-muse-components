import { create } from 'zoid/src';

const modal = create({
    tag: 'paypal-cart-recovery-modal',
    url: 'http://localhost:8001/cartrecovery/modal',
    defaultContext: 'popup',
    containerTemplate: function containerTemplate({ uid, doc, frame, prerenderFrame }) {
        return node('div', { id: uid, class: 'container' },
            node('style', null, `
                #${ uid }.container {
                    border: 5px solid red;
                }
            `),
            node('node', { el: frame }),
            node('node', { el: prerenderFrame })
        ).render(dom({ doc }));
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
    // TODO: if identified - do nothing
    if (!cartRecovery) {
        console.log('cartRecovery option not enabled')
        return false;
    }
    modal().render('#modal');
    const email = localStorage.getItem('paypal-cr-user');
    if (email !== null) {
        console.log('[exit] no email');
        return false;
    }
    // TODO: does user have no items in cart - do nothing
    const cart = JSON.parse(localStorage.getItem('paypal-cr-cart') || '{}')
    if (!cart.items) {
        console.log('[exit] no items');
        return false;
    }
    console.log('cart:', cart)
    // TODO: has this been shown in past 7 days - do nothing
    const sevenDays = 1000 * 60 * 60 * 24 * 7;
    const lastSeen = Number(localStorage.getItem('paypal-cr-lastseen')) || 0;
    if (Date.now() - lastSeen < sevenDays) {
        console.log('[exit] seen < 7 days ago');
        return false;
    }
    // TODO: render experience
    console.log('render experience....');
    return true;
}

const init = (...args) => {
    const exitIntentListener = debounce(e => {
        if (e.screenY <= 150) {
            showExitModal(...args);
        }
    }, 100);
    if (document.body) {
        document.body.addEventListener('mousemove', exitIntentListener);
    }
};

export const Messaging = {
    init
}