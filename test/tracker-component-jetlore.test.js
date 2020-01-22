/* globals beforeAll expect jest */
/* @flow */
import { Tracker } from '../src/tracker-component';
import getJetlore from '../src/lib/jetlore';
import { logger } from '../src/lib/logger';

/*
** moved into it's own file due to eslint max file size rule
** - had to mock everything manually because sinon/rewire cannot be imported.
**   was getting error "Uncaught Error: Module build failed: Error: Final loader (./node_modules/imports/index.js) didn't return a Buffer or String"
*/
describe('Tracker setCart', () => {
  it('should fire setCart events', () => {
    Tracker({ jetlore: { user_id: 'u123', feed_id: 'ff123', access_token: '1234' } });
    const JL = getJetlore();
    JL.tracker.setCart = jest.fn();
    JL.trackActivity('setCart', {
      cartId: '__test__cartId',
      items: [
        {
          title: 'william of normandy',
          imgUrl: 'animageurl',
          price: 'tree fiddy',
          id: '__test__productId',
          url: 'https://example.com/__test__productId'
        }
      ],
      emailCampaignId: '__test__emailCampaignId',
      currencyCode: 'USD',
      total: '12345.67'
    });
    expect(JL.tracker.setCart.mock.calls.length).toEqual(1);
  });
});

describe('Tracker.track function', () => {
  let initTrackerOpts;
  let originalJLTracking;
  let createMock;
  let getMockObj;
  // let expectedJLInitObj;
  let JL;

  beforeAll(() => {
    JL = getJetlore();
    originalJLTracking = JL.tracking;
    initTrackerOpts = {
      user: {
        email: 'blah@gmail.com',
        name: 'ayye'
      },
      jetlore: {
        user_id: 'a',
        access_token: 'aaa',
        feed_id: 'bbb'
      }
    };
    createMock = calls => {
      return (...args) => {
        calls.count += 1;
        calls.calledWith.push(args);
      };
    };
    getMockObj = () => ({
      count: 0,
      calledWith: []
    });
    /*
    expectedJLInitObj = {
      cid: initTrackerOpts.jetlore.access_token,
      user_id: initTrackerOpts.jetlore.user_id,
      feed_id: initTrackerOpts.jetlore.feed_id,
      div: undefined,
      lang: undefined
    };
    */
    logger.error = jest.fn();
  });

  afterEach(() => {
    JL.tracking = originalJLTracking;
    delete JL.tracker;
  });

  it.skip('should call jetlore view function', () => {
    const operation = 'view';
    const trackingCalls = getMockObj();
    const trackerCalls = getMockObj();
    JL.tracking = createMock(trackingCalls);
    JL.tracker = {
      [operation]: createMock(trackerCalls)
    };
    const tracker = Tracker(initTrackerOpts);
    tracker.track(operation, { payload: {} });
    expect(trackerCalls.count).toBe(1);
    expect(trackingCalls.count).toBe(1);
    // const actualJLInitObj = trackingCalls.calledWith[0][0];
    // expect(actualJLInitObj).toEqual(expectedJLInitObj);
  });

  it.skip('should call jetlore addToCart function', () => {
    const operation = 'addToCart';
    const trackingCalls = getMockObj();
    const trackerCalls = getMockObj();
    JL.tracking = createMock(trackingCalls);
    JL.tracker = {
      [operation]: createMock(trackerCalls)
    };
    const tracker = Tracker(initTrackerOpts);
    tracker.track(operation, { payload: {}, items: [] });
    expect(trackerCalls.count).toBe(1);
    expect(trackingCalls.count).toBe(1);
    // const actualJLInitObj = trackingCalls.calledWith[0][0];
    // expect(actualJLInitObj).toEqual(expectedJLInitObj);
  });

  it.skip('should call jetlore removeFromCart function', () => {
    const operation = 'removeFromCart';
    const trackingCalls = getMockObj();
    const trackerCalls = getMockObj();
    JL.tracking = createMock(trackingCalls);
    JL.tracker = {
      [operation]: createMock(trackerCalls)
    };
    const tracker = Tracker(initTrackerOpts);
    tracker.track(operation, { payload: {}, items: [] });
    expect(trackerCalls.count).toBe(1);
    expect(trackingCalls.count).toBe(1);
    // const actualJLInitObj = trackingCalls.calledWith[0][0];
    // expect(actualJLInitObj).toEqual(expectedJLInitObj);
  });

  it.skip('should call jetlore purchase function', () => {
    const operation = 'purchase';
    const trackingCalls = getMockObj();
    const trackerCalls = getMockObj();
    JL.tracking = createMock(trackingCalls);
    JL.tracker = {
      [operation]: createMock(trackerCalls)
    };
    const tracker = Tracker(initTrackerOpts);
    tracker.track(operation, { payload: {} });
    expect(trackerCalls.count).toBe(1);
    expect(trackingCalls.count).toBe(1);
    // const actualJLInitObj = trackingCalls.calledWith[0][0];
    // expect(actualJLInitObj).toEqual(expectedJLInitObj);
  });

  it.skip('should call jetlore search function', () => {
    const operation = 'search';
    const trackingCalls = getMockObj();
    const trackerCalls = getMockObj();
    JL.tracking = createMock(trackingCalls);
    JL.tracker = {
      [operation]: createMock(trackerCalls)
    };
    const tracker = Tracker(initTrackerOpts);
    tracker.track(operation, { payload: {} });
    expect(trackerCalls.count).toBe(1);
    expect(trackingCalls.count).toBe(1);
    // const actualJLInitObj = trackingCalls.calledWith[0][0];
    // expect(actualJLInitObj).toEqual(expectedJLInitObj);
  });

  it.skip('should call jetlore browse_section function', () => {
    const operation = 'browse_section';
    const trackingCalls = getMockObj();
    const trackerCalls = getMockObj();
    JL.tracking = createMock(trackingCalls);
    JL.tracker = {
      [operation]: createMock(trackerCalls)
    };
    const tracker = Tracker(initTrackerOpts);
    tracker.track(operation, { payload: {} });
    expect(trackerCalls.count).toBe(1);
    expect(trackingCalls.count).toBe(1);
    // const actualJLInitObj = trackingCalls.calledWith[0][0];
    // expect(actualJLInitObj).toEqual(expectedJLInitObj);
  });

  it.skip('should call jetlore addToWishList function', () => {
    const operation = 'addToWishList';
    const trackingCalls = getMockObj();
    const trackerCalls = getMockObj();
    JL.tracking = createMock(trackingCalls);
    JL.tracker = {
      [operation]: createMock(trackerCalls)
    };
    const tracker = Tracker(initTrackerOpts);
    tracker.track(operation, { payload: {} });
    expect(trackerCalls.count).toBe(1);
    expect(trackingCalls.count).toBe(1);
    // const actualJLInitObj = trackingCalls.calledWith[0][0];
    // expect(actualJLInitObj).toEqual(expectedJLInitObj);
  });

  it.skip('should call jetlore removeFromWishList function', () => {
    const operation = 'removeFromWishList';
    const trackingCalls = getMockObj();
    const trackerCalls = getMockObj();
    JL.tracking = createMock(trackingCalls);
    JL.tracker = {
      [operation]: createMock(trackerCalls)
    };
    const tracker = Tracker(initTrackerOpts);
    tracker.track(operation, { payload: {} });
    expect(trackerCalls.count).toEqual(1);
    expect(trackingCalls.count).toEqual(1);
    // const actualJLInitObj = trackingCalls.calledWith[0][0];
    // expect(actualJLInitObj).toEqual(expectedJLInitObj);
  });

  it.skip('should call jetlore addToFavorites function', () => {
    const operation = 'addToFavorites';
    const trackingCalls = getMockObj();
    const trackerCalls = getMockObj();
    JL.tracking = createMock(trackingCalls);
    JL.tracker = {
      [operation]: createMock(trackerCalls)
    };
    const tracker = Tracker(initTrackerOpts);
    tracker.track(operation, { payload: {} });
    expect(trackerCalls.count).toEqual(1);
    expect(trackingCalls.count).toEqual(1);
    // const actualJLInitObj = trackingCalls.calledWith[0][0];
    // expect(actualJLInitObj).toEqual(expectedJLInitObj);
  });

  it.skip('should call jetlore removeFromFavorites function', () => {
    const operation = 'removeFromFavorites';
    const trackingCalls = getMockObj();
    const trackerCalls = getMockObj();
    JL.tracking = createMock(trackingCalls);
    JL.tracker = {
      [operation]: createMock(trackerCalls)
    };
    const tracker = Tracker(initTrackerOpts);
    tracker.track(operation, { payload: {} });
    expect(trackerCalls.count).toEqual(1);
    expect(trackingCalls.count).toEqual(1);
    // const actualJLInitObj = trackingCalls.calledWith[0][0];
    // expect(actualJLInitObj).toEqual(expectedJLInitObj);
  });

  it.skip('should call jetlore generic track function', () => {
    const operation = 'track';
    const trackingCalls = getMockObj();
    const trackerCalls = getMockObj();
    JL.tracking = createMock(trackingCalls);
    JL.tracker = {
      [operation]: createMock(trackerCalls)
    };
    const tracker = Tracker(initTrackerOpts);
    tracker.track(operation, { payload: {} });
    expect(trackerCalls.count).toEqual(1);
    expect(trackingCalls.count).toEqual(1);
    // const actualJLInitObj = trackingCalls.calledWith[0][0];
    // expect(actualJLInitObj).toEqual(expectedJLInitObj);
  });

  // TODO: Address this test when JL is complete
  it.skip('should get correct jetlore payload based on type', () => {
    /*
    const payload = {
      payload: {
        deal_id: '6',
        option_id: '7',
        count: 8,
        text: 'yes',
        name: 'muse',
        refinements: [ {
          name: 'hello',
          value: 'world'
        } ],
        id: '2245332',
        payload: {
          name: 'paypal shopping',
          value: 'muse'
        },
        event: 'event1',
        price: 100,
        title: 'the title'
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
    expect(getPayload('addToCart')).toEqual(expectedCartEventPayload);
    expect(getPayload('removeFromCart')).toEqual(expectedCartEventPayload);
    expect(getPayload('purchase')).toEqual(expectedCartPurchasePayload);
    expect(getPayload('search')).toEqual(expectedSearchPayload);
    expect(getPayload('view')).toEqual(expectedViewPayload);
    expect(getPayload('browse_section')).toEqual(expectedBrowsePayload);
    */
  });
});
