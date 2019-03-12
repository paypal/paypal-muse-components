/* @flow */
/* globals describe before it */

import { expect } from 'chai';

import { Tracker } from '../src/tracker-component';

describe('paypal.Tracker', () => {
    let appendChildCalls = 0;
    const appendChild = () => {
        appendChildCalls += 1;
    };
    before(() => {
        // $FlowFixMe
        document.body = document.body || {};
        // $FlowFixMe
        document.body.appendChild = appendChild;
    });

    it('should be a function that returns a tracker', () => {
        const userID = '__test__userID';
        const userName = '__test__userName';
        const tracker = Tracker({ userID, userName });
        expect(tracker).to.have.property('view');
        expect(tracker).to.have.property('addToCart');
        expect(tracker).to.have.property('setCart');
        expect(tracker).to.have.property('removeFromCart');
        expect(tracker).to.have.property('purchase');
        expect(tracker).to.not.have.property('purchases');
    });

    it('should send view events', () => {
        const userID = '__test__userID2';
        const userName = '__test__userName2';
        const tracker = Tracker({ userID, userName });
        expect(appendChildCalls).to.equal(0);
        tracker.view({ pageUrl: 'https://example.com/test' });
        expect(appendChildCalls).to.equal(1);
    });
});

