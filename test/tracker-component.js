/* @flow */
/* globals describe */

import { expect } from 'chai';

import { Tracker } from '../src/tracker-component';

describe('paypal.Tracker', () => {
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
});

