/* globals describe before afterEach it */
/* @flow */
import { expect } from 'chai';

import { Tracker } from '../src/tracker-component';
import getJetlore from '../src/lib/jetlore';

/*
** moved into it's own file due to eslint max file size rule
** - had to mock everything manually because sinon/rewire cannot be imported.
**   was getting error "Uncaught Error: Module build failed: Error: Final loader (./node_modules/imports/index.js) didn't return a Buffer or String"
*/
describe('Tracker.track function', () => {
    let initTrackerOpts;
    let originalJLTracking;
    let createMock;
    let getMockObj;
    let expectedJLInitObj;
    let JL;

    before(() => {
        JL = getJetlore();
        originalJLTracking = JL.tracking;
        initTrackerOpts = {
            user: {
                email: 'blah@gmail.com',
                name:  'ayye'
            },
            jetlore: {
                user_id:      'a',
                access_token: 'aaa',
                feed_id:      'bbb'
            }
        };
        createMock = calls => {
            return (...args) => {
                calls.count += 1;
                calls.calledWith.push(args);
            };
        };
        getMockObj = () => ({
            count:      0,
            calledWith: []
        });
        expectedJLInitObj = {
            cid:     initTrackerOpts.jetlore.access_token,
            user_id: initTrackerOpts.jetlore.user_id,
            feed_id: initTrackerOpts.jetlore.feed_id,
            div:     undefined,
            lang:    undefined
        };
    });

    afterEach(() => {
        JL.tracking = originalJLTracking;
        delete JL.tracker;
    });

    it('should call jetlore view function', () => {
        const operation = 'view';
        const trackingCalls = getMockObj();
        const trackerCalls = getMockObj();
        JL.tracking = createMock(trackingCalls);
        JL.tracker = {
            [operation]: createMock(trackerCalls)
        };
        const tracker = Tracker(initTrackerOpts);
        tracker.track(operation, { payload: {} });
        const actualJLInitObj = trackingCalls.calledWith[0][0];
        expect(trackerCalls.count).to.equal(1);
        expect(trackingCalls.count).to.equal(1);
        expect(actualJLInitObj).to.deep.equal(expectedJLInitObj);
    });

    it('should call jetlore addToCart function', () => {
        const operation = 'addToCart';
        const trackingCalls = getMockObj();
        const trackerCalls = getMockObj();
        JL.tracking = createMock(trackingCalls);
        JL.tracker = {
            [operation]: createMock(trackerCalls)
        };
        const tracker = Tracker(initTrackerOpts);
        tracker.track(operation, { payload: {} });
        const actualJLInitObj = trackingCalls.calledWith[0][0];
        expect(trackerCalls.count).to.equal(1);
        expect(trackingCalls.count).to.equal(1);
        expect(actualJLInitObj).to.deep.equal(expectedJLInitObj);
    });

    it('should call jetlore removeFromCart function', () => {
        const operation = 'removeFromCart';
        const trackingCalls = getMockObj();
        const trackerCalls = getMockObj();
        JL.tracking = createMock(trackingCalls);
        JL.tracker = {
            [operation]: createMock(trackerCalls)
        };
        const tracker = Tracker(initTrackerOpts);
        tracker.track(operation, { payload: {}, items: [] });
        const actualJLInitObj = trackingCalls.calledWith[0][0];
        expect(trackerCalls.count).to.equal(1);
        expect(trackingCalls.count).to.equal(1);
        expect(actualJLInitObj).to.deep.equal(expectedJLInitObj);
    });

    it('should call jetlore purchase function', () => {
        const operation = 'purchase';
        const trackingCalls = getMockObj();
        const trackerCalls = getMockObj();
        JL.tracking = createMock(trackingCalls);
        JL.tracker = {
            [operation]: createMock(trackerCalls)
        };
        const tracker = Tracker(initTrackerOpts);
        tracker.track(operation, { payload: {} });
        const actualJLInitObj = trackingCalls.calledWith[0][0];
        expect(trackerCalls.count).to.equal(1);
        expect(trackingCalls.count).to.equal(1);
        expect(actualJLInitObj).to.deep.equal(expectedJLInitObj);
    });

    it('should call jetlore search function', () => {
        const operation = 'search';
        const trackingCalls = getMockObj();
        const trackerCalls = getMockObj();
        JL.tracking = createMock(trackingCalls);
        JL.tracker = {
            [operation]: createMock(trackerCalls)
        };
        const tracker = Tracker(initTrackerOpts);
        tracker.track(operation, { payload: {} });
        const actualJLInitObj = trackingCalls.calledWith[0][0];
        expect(trackerCalls.count).to.equal(1);
        expect(trackingCalls.count).to.equal(1);
        expect(actualJLInitObj).to.deep.equal(expectedJLInitObj);
    });

    it('should call jetlore browse_section function', () => {
        const operation = 'browse_section';
        const trackingCalls = getMockObj();
        const trackerCalls = getMockObj();
        JL.tracking = createMock(trackingCalls);
        JL.tracker = {
            [operation]: createMock(trackerCalls)
        };
        const tracker = Tracker(initTrackerOpts);
        tracker.track(operation, { payload: {} });
        const actualJLInitObj = trackingCalls.calledWith[0][0];
        expect(trackerCalls.count).to.equal(1);
        expect(trackingCalls.count).to.equal(1);
        expect(actualJLInitObj).to.deep.equal(expectedJLInitObj);
    });

    it('should call jetlore addToWishList function', () => {
        const operation = 'addToWishList';
        const trackingCalls = getMockObj();
        const trackerCalls = getMockObj();
        JL.tracking = createMock(trackingCalls);
        JL.tracker = {
            [operation]: createMock(trackerCalls)
        };
        const tracker = Tracker(initTrackerOpts);
        tracker.track(operation, { payload: {} });
        const actualJLInitObj = trackingCalls.calledWith[0][0];
        expect(trackerCalls.count).to.equal(1);
        expect(trackingCalls.count).to.equal(1);
        expect(actualJLInitObj).to.deep.equal(expectedJLInitObj);
    });

    it('should call jetlore removeFromWishList function', () => {
        const operation = 'removeFromWishList';
        const trackingCalls = getMockObj();
        const trackerCalls = getMockObj();
        JL.tracking = createMock(trackingCalls);
        JL.tracker = {
            [operation]: createMock(trackerCalls)
        };
        const tracker = Tracker(initTrackerOpts);
        tracker.track(operation, { payload: {} });
        const actualJLInitObj = trackingCalls.calledWith[0][0];
        expect(trackerCalls.count).to.equal(1);
        expect(trackingCalls.count).to.equal(1);
        expect(actualJLInitObj).to.deep.equal(expectedJLInitObj);
    });

    it('should call jetlore addToFavorites function', () => {
        const operation = 'addToFavorites';
        const trackingCalls = getMockObj();
        const trackerCalls = getMockObj();
        JL.tracking = createMock(trackingCalls);
        JL.tracker = {
            [operation]: createMock(trackerCalls)
        };
        const tracker = Tracker(initTrackerOpts);
        tracker.track(operation, { payload: {} });
        const actualJLInitObj = trackingCalls.calledWith[0][0];
        expect(trackerCalls.count).to.equal(1);
        expect(trackingCalls.count).to.equal(1);
        expect(actualJLInitObj).to.deep.equal(expectedJLInitObj);
    });

    it('should call jetlore removeFromFavorites function', () => {
        const operation = 'removeFromFavorites';
        const trackingCalls = getMockObj();
        const trackerCalls = getMockObj();
        JL.tracking = createMock(trackingCalls);
        JL.tracker = {
            [operation]: createMock(trackerCalls)
        };
        const tracker = Tracker(initTrackerOpts);
        tracker.track(operation, { payload: {} });
        const actualJLInitObj = trackingCalls.calledWith[0][0];
        expect(trackerCalls.count).to.equal(1);
        expect(trackingCalls.count).to.equal(1);
        expect(actualJLInitObj).to.deep.equal(expectedJLInitObj);
    });

    it('should call jetlore generic track function', () => {
        const operation = 'track';
        const trackingCalls = getMockObj();
        const trackerCalls = getMockObj();
        JL.tracking = createMock(trackingCalls);
        JL.tracker = {
            [operation]: createMock(trackerCalls)
        };
        const tracker = Tracker(initTrackerOpts);
        tracker.track(operation, { payload: {} });
        const actualJLInitObj = trackingCalls.calledWith[0][0];
        expect(trackerCalls.count).to.equal(1);
        expect(trackingCalls.count).to.equal(1);
        expect(actualJLInitObj).to.deep.equal(expectedJLInitObj);
    });

    it('should get correct jetlore payload based on type', () => {
        const payload = {
            payload: {
                deal_id:     '6',
                option_id:   '7',
                count:        8,
                text:        'yes',
                name:        'muse',
                refinements: [ {
                    name:   'hello',
                    value:  'world'
                } ],
                id:         '2245332',
                payload: {
                    name:   'paypal shopping',
                    value:  'muse'
                },
                event:      'event1',
                price:      100,
                title:      'the title'
            }
        };
        const { deal_id, option_id, count, text, name, refinements, price } = payload.payload;
        const expectedCartEventPayload = {
            deal_id,
            option_id,
            count,
            price
        };
        const expectedCartPurchasePayload = {
            deal_id,
            option_id,
            count
        };
        const expectedSearchPayload = { text };
        const expectedViewPayload = {
            deal_id,
            option_id
        };
        const expectedBrowsePayload = {
            name,
            refinements
        };
        const tracker = Tracker(initTrackerOpts);
        const getPayload = type => {
            return tracker.getJetlorePayload(type, payload);
        };
        expect(getPayload('addToCart')).to.deep.equal(expectedCartEventPayload);
        expect(getPayload('removeFromCart')).to.deep.equal(expectedCartEventPayload);
        expect(getPayload('purchase')).to.deep.equal(expectedCartPurchasePayload);
        expect(getPayload('search')).to.deep.equal(expectedSearchPayload);
        expect(getPayload('view')).to.deep.equal(expectedViewPayload);
        expect(getPayload('browse_section')).to.deep.equal(expectedBrowsePayload);
    });
});
