/* globals beforeAll afterAll expect jest */
/* @flow */
import { Tracker } from '../src/tracker-component';
import { logger } from '../src/lib/logger';
import constants from '../src/lib/constants';
// $FlowFixMe
import generateIdModule from '../src/lib/generate-id';
import { getUserId, getCartId } from '../src/lib/local-storage';

const { sevenDays, storage } = constants;

const queryToObject = (src : string) => {
  const search = src.split('?')[1];
  // eslint-disable-next-line prefer-regex-literals
  return JSON.parse(`{"${ decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(new RegExp('=', 'g'), '":"') }"}`);
};

const autoPropertyId = 'wow-so-auto';
let fetchCalls = [];

// $FlowFixMe
describe('paypal.Tracker', () => {
  let createElementCalls = 0;

  const propertyId = 'hello-there';
  window.fetch = (url, options) => {
    const body = options ? options.body : undefined;

    fetchCalls.push([ url, options ]);
    return Promise.resolve({
      url,
      body,
      status: 200,
      json: () => ({ id: autoPropertyId, hello: 'hi' })
    });
  };

  const deviceInfo = {
    screenWidth: '1000',
    screenHeight: '750',
    colorDepth: '300',
    deviceType: 'desktop',
    browserHeight: '400',
    browserWidth: '400'
  };

  const imgMock = {
    src: '',
    style: {},
    addEventListener: () => {
      /* empty */
    },
    setAttribute: () => {
      /* empty */
    }
  };

  const appendChild = () => {};

  const createElement = () => {
    // $FlowFixMe
    // eslint-disable-next-line no-plusplus
    createElementCalls++;
    return imgMock;
  };

  // $FlowFixMe
  const originalDocumentCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  const originalGenerateId = generateIdModule.generateId;
  beforeAll(() => {
    const deviceLib = require('../src/lib/get-device-info');
    // $FlowFixMe
    deviceLib.getDeviceInfo = () => deviceInfo;

    // $FlowFixMe
    document.createElement = createElement;
    document.body.appendChild = appendChild;
    // $FlowFixMe
    generateIdModule.generateId = () => 'abc123';
    // generateIdModule.set(() => 'abc123');
  });

  // $FlowFixMe
  afterAll(() => {
    // $FlowFixMe
    document.createElement = originalDocumentCreateElement;
    document.body.appendChild = originalAppendChild;
    // $FlowFixMe
    generateIdModule.generateId = originalGenerateId;
  });

  beforeEach(() => {
    window.localStorage.removeItem(storage.paypalCrCart);
    window.localStorage.removeItem(storage.paypalCrUser);

    logger.error = jest.fn();
  });

  // $FlowFixMe
  afterEach(() => {
    createElementCalls = 0;
    imgMock.src = '';
    window.localStorage.removeItem(storage.paypalCrCart);
    window.localStorage.removeItem(storage.paypalCrUser);
    document.cookie = 'paypal-cr-cart=;';
    fetchCalls = [];

    logger.error.mockRestore();
  });

  // $FlowFixMe
  it('should be a function that returns a tracker', () => {
    const tracker = Tracker();
    expect(tracker).toHaveProperty('viewPage');
    expect(tracker).toHaveProperty('addToCart');
    expect(tracker).toHaveProperty('setCart');
    expect(tracker).toHaveProperty('removeFromCart');
    expect(tracker).toHaveProperty('purchase');
    expect(tracker).toHaveProperty('track');
    expect(tracker).toHaveProperty('getIdentity');
    expect(tracker).toHaveProperty('cancelCart');

    // JL specific functions
    expect(typeof tracker.viewSection).toEqual('function');
    expect(typeof tracker.viewPromo).toEqual('function');
    expect(typeof tracker.viewProduct).toEqual('function');
    expect(typeof tracker.setWishList).toEqual('function');
    expect(typeof tracker.setFavoriteList).toEqual('function');
  });

  it('should clear stored cart content if cart is expired', () => {
    const beforeStorage = window.localStorage.getItem(storage.paypalCrCart);
    const twoWeeksAgo = (Date.now() - (sevenDays * 2));

    expect(beforeStorage).toBe(null);
    window.localStorage.setItem(storage.paypalCrCart, JSON.stringify({
      cartId: 'arglebargleflimflam',
      createdAt: twoWeeksAgo
    }));

    // Since the expiry is in the past, this initialization should clear
    // the cart and expiry.
    Tracker();

    const afterStorage = JSON.parse(window.localStorage.getItem(storage.paypalCrCart));

    expect(afterStorage.cartId).not.toBe('arglebargleflimflam');
    expect(afterStorage.createdAt).toBeGreaterThan(twoWeeksAgo);
  });

  it('should send cancelCart events and clear localStorage upon cancelling cart', () => {
    const email = '__test__email7@gmail.com';
    const userName = '__test__userName7';
    const tracker = Tracker({ currencyCode: 'COWRIESHELLS', user: { email, name: userName } });
    tracker.setPropertyId(propertyId);
    tracker.cancelCart();

    const afterStorage = JSON.parse(window.localStorage.getItem(storage.paypalCrCart));

    expect(afterStorage.cartId).not.toBe('__test__cartId');
  });

  it('should set the cartId when setCartId is called', () => {
    const tracker = Tracker();
    const beforeStorage = JSON.parse(window.localStorage.getItem(storage.paypalCrCart));
    tracker.setCartId('arglebargle');
    const afterStorage = JSON.parse(window.localStorage.getItem(storage.paypalCrCart));

    expect(beforeStorage).not.toEqual(afterStorage);
    expect(afterStorage.cartId).toBe('arglebargle');
  });

  it('should hit partner-token route when identify method is invoked', done => {
    const email = '__test__email3@gmail.com';
    const userName = '__test__userName3';
    const tracker = Tracker({ user: { email, name: userName } });
    tracker.identify(data => {
      const params = fetchCalls.pop();
      expect(params[0]).toBe('https://paypal.com/muse/api/partner-token');
      expect(params[1].body).toBe(JSON.stringify({
        merchantId: 'xyz',
        clientId: 'abcxyz123'
      }));
      expect(data).toEqual({
        hello: 'hi',
        id: autoPropertyId,
        success: true
      });
      done();
    });
  });

  it('should hit partner-token route defined with paramsToTokenUrl when identify method is invoked', done => {
    const email = '__test__email3@gmail.com';
    const userName = '__test__userName3';
    const tokenUrl = 'www.blah.xyz';
    const tracker = Tracker({
      user: { email, name: userName },
      paramsToTokenUrl: () => tokenUrl
    });
    tracker.identify(data => {
      const params = fetchCalls.pop();
      expect(params[0]).toBe(tokenUrl);
      expect(data).toEqual({
        hello: 'hi',
        id: autoPropertyId,
        success: true
      });
      done();
    });
  });

  it('should return promise from identify call', done => {
    const email = '__test__email3@gmail.com';
    const userName = '__test__userName3';
    const tracker = Tracker({ user: { email, name: userName } });

    tracker.identify().then(data => {
      expect(data).toEqual({
        hello: 'hi',
        id: autoPropertyId,
        success: true
      });
      done();
    });
  });

  it('should call getIdentity function with url passed in', done => {
    const email = '__test__email3@gmail.com';
    const userName = '__test__userName3';
    const tracker = Tracker({ user: { email, name: userName } });

    const data = {
      mrid: 'NA4JBW4FWCUQL',
      onIdentification: identityData => identityData
    };
    const url = 'https://www.paypal.com/muse/api/partner-token';
    const result = tracker.getIdentity(data, url).then(accessToken => {
      expect(result).toBeInstanceOf(Promise);
      expect(accessToken).toBeInstanceOf(Object);
      done();
    });
  });

  it('should call getIdentity function with no url passed in', done => {
    const email = '__test__email3@gmail.com';
    const userName = '__test__userName3';
    const tracker = Tracker({ user: { email, name: userName } });

    const data = {
      mrid: 'NA4JBW4FWCUQL',
      onIdentification: identityData => identityData
    };
    const result = tracker.getIdentity(data).then(accessToken => {
      expect(accessToken).toBeInstanceOf(Object);
      expect(result).toBeInstanceOf(Promise);
      done();
    });
  });

  it('should not fetch implicit propertyId route if one is provided', () => {
    const email = '__test__email3@gmail.com';
    const userName = '__test__userName3';
    const tracker = Tracker({ user: {
      email,
      name: userName
    }, propertyId });
    // viewPage will have been called once at the time the tracker is itialized
    expect(createElementCalls).toBe(2);
    tracker.setPropertyId(propertyId);
    expect(fetchCalls.length).toBe(1);
  });

  it('should fetch implicit propertyId route if one is not provided', () => {
    const email = '__test__email3@gmail.com';
    const userName = '__test__userName3';
    // clear local storage to ensure a request happens
    window.localStorage.removeItem(storage.paypalCrPropertyId);
    Tracker({ user: { email, name: userName } });

    expect(createElementCalls).toBe(1);
    expect(fetchCalls.length).toBe(1);
    expect(fetchCalls[0][0]).toBe('https://www.paypal.com/tagmanager/containers/xo?mrid=xyz&url=http%3A%2F%2Flocalhost&jlAccessToken=true');
  });

  it('should gracefully fail in the event that malformed data exists in local storage', () => {
    window.localStorage.setItem(storage.paypalCrUser, 'this will cause an error');
    window.localStorage.setItem(storage.paypalCrCart, 'this will also cause an error');

    expect(logger.error.mock.calls.length).toBe(0);
    Tracker();
    const userId = getUserId().userId;
    const cartId = getCartId().cartId;

    expect(logger.error.mock.calls.length).toBe(2);
    expect(typeof userId).toBe('string');
    expect(typeof cartId).toBe('string');
  });


  describe('#viewPage', () => {
    it('should fire a well-formed page view event', () => {
      const tracker = Tracker();
      tracker.setPropertyId(propertyId);

      tracker.viewPage();

      expect(queryToObject(imgMock.src)).toEqual(
        expect.objectContaining(
          {
            bh: '400',
            bw: '400',
            cd: '300',
            sh: '750',
            sw: '1000',
            dvis: 'desktop',
            item: 'hello-there',
            mrid: 'xyz',
            client_id: 'abcxyz123',
            event_name: 'pageView',
            event_type: 'view',
            page: 'ppshopping%3ApageView',
            pgrp: 'ppshopping%3ApageView',
            comp: 'ppshoppingsdk',
            e: 'im',
            shopper_id: 'abc123',
            merchant_cart_id: 'abc123',
            product: 'ppshopping'
          }
        )
      );
    });
  });
});
