/* globals describe before it */
/* @flow */

import { expect } from 'chai';

import { Tracker } from '../src/tracker-component';

// We probably don't want to be sending events to Keen all the time so I'm
// adding this boolean here which will make it so we only send events to Keen
// if it's set to true.
const testEndToEnd = false;

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
        const imgLoadPromise = tracker.view({
            pageUrl: 'https://example.com/test2'
        });
        expect(appendChildCalls).to.equal(1);
        return testEndToEnd ? imgLoadPromise : undefined;
    });

    it('should send addToCart events', () => {
        const userID = '__test__userID3';
        const userName = '__test__userName3';
        const tracker = Tracker({ userID, userName });
        expect(appendChildCalls).to.equal(1);
        const imgLoadPromise = tracker.addToCart({
            cartId:          '__test__cartId',
            items:           [ { id: '__test__productId' } ],
            emailCampaignId: '__test__emailCampaignId',
            price:           12345.67,
            currencyCode:    'USD',
            keywords:        [ '__test__' ]
        });
        expect(appendChildCalls).to.equal(2);
        return testEndToEnd ? imgLoadPromise : undefined;
    });

    it('should send setCart events', () => {
        const userID = '__test__userID4';
        const userName = '__test__userName4';
        const tracker = Tracker({ userID, userName });
        expect(appendChildCalls).to.equal(2);
        const imgLoadPromise = tracker.setCart({
            cartId:          '__test__cartId',
            items:           [ { id: '__test__productId' } ],
            emailCampaignId: '__test__emailCampaignId',
            price:           12345.67,
            currencyCode:    'USD',
            keywords:        [ '__test__' ]
        });
        expect(appendChildCalls).to.equal(3);
        return testEndToEnd ? imgLoadPromise : undefined;
    });

    it('should send removeFromCart events', () => {
        const userID = '__test__userID5';
        const userName = '__test__userName5';
        const tracker = Tracker({ userID, userName });
        expect(appendChildCalls).to.equal(3);
        const imgLoadPromise = tracker.removeFromCart({
            cartId: '__test__cartId',
            items:  [ { id: '__test__productId' } ]
        });
        expect(appendChildCalls).to.equal(4);
        return testEndToEnd ? imgLoadPromise : undefined;
    });
});
