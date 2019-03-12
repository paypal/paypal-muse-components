/* @flow */
/* globals describe */

import { expect } from 'chai';

import { Tracker } from '../src/tracker-component';

describe('paypal tracker', () => {
    it('should have properties', () => {
        expect(Tracker).to.have.property('setUser');
        expect(Tracker).to.have.property('view');
        expect(Tracker).to.have.property('addToCart');
        expect(Tracker).to.have.property('setCart');
        expect(Tracker).to.have.property('removeFromCart');
        expect(Tracker).to.have.property('purchase');
        expect(Tracker).to.not.have.property('purchases');
    });
});

