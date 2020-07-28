/* @flow */
/* global afterAll expect jest */
import { Tracker } from '../../src/tracker-component';
import { fetchPropertyId } from '../../src/lib/get-property-id';
import { getUserId } from '../../src/lib/local-storage';
import { track } from '../../src/lib/track';
import constants from '../../src/lib/constants';
import { mockContainerSummary1 } from '../mocks';

jest.mock('../../src/lib/track');
jest.mock('../../src/lib/get-property-id', () => {
  return {
    fetchPropertyId: async () => 'mockpropertyidofsomekind',
    fetchContainerSettings: async () => mockContainerSummary1
  };
});

describe('setUser', () => {
  const { defaultTrackerConfig, storage } = constants;

  let config;
  let mockItem;

  beforeEach(() => {
    window.localStorage.removeItem(storage.paypalCrUser);

    config = {
      propertyId: 'foobar',
      user: {
        id: 'arglebargle123',
        name: 'Bob Ross',
        email: 'bossrob21@pbs.org'
      }
    };

    mockItem = {
      id: 'XL novelty hat',
      imgUrl: 'https://www.paypalobjects.com/digitalassets/c/gifts/media/catalog/product/b/e/bestbuy.jpg',
      price: '100.00',
      title: 'Best Buy',
      url: 'http://localhost.paypal.com:8080/us/gifts/brands/best-buy',
      quantity: 1
    };
  });

  afterEach(() => {
    track.mockReset();
    window.localStorage.removeItem('paypal-cr-cart');
    window.localStorage.removeItem('paypal-cr-cart-expirty');
  });

  afterAll(() => {
    track.mockRestore();
    fetchPropertyId.mockRestore();
    window.localStorage.removeItem(storage.paypalCrUser);
  });

  it('user should be set when the tracker is initialized', () => {
    const tracker = Tracker(config);

    tracker.addToCart({
      cartTotal: '5.00',
      items: [ mockItem ]
    });

    const args = track.mock.calls;

    expect(args[0][0].user).toEqual(config.user);
  });

  it('no user should be set if no configuration is passed to initialization', (done) => {
    const tracker = Tracker();

    // wait for mock propertyId to resolve
    setTimeout(() => {
      tracker.addToCart({
        cartTotal: '5.00',
        items: [ mockItem ]
      });

      const args = track.mock.calls;
      expect(args[0][0].user).toEqual(defaultTrackerConfig.user);
      done();
    }, 100);
  });

  it('creates a userId if none exists when the tracker is initialized', () => {
    const oldUser = getUserId();
    Tracker();
    const newUser = getUserId().userId;

    expect(oldUser).toBe(null);
    expect(typeof newUser).toBe('string');
  });

  it('should retain a userId if one exists when the tracker is initialized', () => {
    const oldUser = { userId: 'oldvalue', createdAt: Date.now() };
    window.localStorage.setItem(storage.paypalCrUser, JSON.stringify(oldUser));
    Tracker();
    const newUser = getUserId().userId;

    expect(newUser).toBe(oldUser.userId);
  });

  it('should override userId if one is passed in at the time a tracker is initialized', () => {
    const oldUser = { userId: 'oldvalue', createdAt: Date.now() };
    window.localStorage.setItem(storage.paypalCrUser, JSON.stringify(oldUser));
    Tracker({ user: { id: 'newvalue' } });
    
    const newUser = getUserId().merchantProvidedUserId;
    expect(newUser).toBe('newvalue');
    expect(newUser).not.toBe(oldUser.merchantProvidedUserId);
  });

  it('should set a user to local storage when called', () => {
    const oldUser = { merchantProvidedUserId: 'oldvalue' };
    window.localStorage.setItem(storage.paypalCrUser, JSON.stringify(oldUser));
    const tracker = Tracker({ user: { id: 'alsoanoldvalue' } });
    tracker.setUser({ id: 'newvalue' });

    const newUser = getUserId().merchantProvidedUserId;
    expect(newUser).toBe('newvalue');
    expect(newUser).not.toBe(oldUser.merchantProvidedUserId);
  });

  it('should clear a userId from local storage when null is passed', () => {
    const tracker = Tracker({ user: { id: 'oldvalue' } });
    const oldUser = getUserId().merchantProvidedUserId;

    tracker.setUser({ id: null });
    const newUser = getUserId().merchantProvidedUserId;
    expect(oldUser).toBe('oldvalue');
    expect(newUser).not.toBe(oldUser);
  });

  it('no user should be set if no user is passed to initialization', () => {
    const tracker = Tracker({ propertyId: 'somevalue' });

    tracker.addToCart({
      cartTotal: '5.00',
      items: [ mockItem ]
    });

    const args = track.mock.calls;
    expect(args[0][0].user).toEqual(defaultTrackerConfig.user);
  });

  it('user should be set when set user is called', () => {
    const tracker = Tracker({ user: { id: 'somevalue' } });
    const prevMerchantProvidedUserId = tracker.getConfig().user.merchantProvidedUserId;

    tracker.setUser({ id: '123' });

    const newMerchantProvidedUserId = tracker.getConfig().user.merchantProvidedUserId;

    expect(prevMerchantProvidedUserId).toBe('somevalue');
    expect(newMerchantProvidedUserId).toBe('123');
  });

  it('setUser accepts different types of input', () => {
    const tracker = Tracker();

    tracker.setUser({
      user: {
        id: 'foo'
      }
    });

    const firstId = tracker.getConfig().user.merchantProvidedUserId;

    tracker.setUser({
      id: 'bar'
    });

    const secondId = tracker.getConfig().user.merchantProvidedUserId;

    expect(firstId).toBe('foo');
    expect(secondId).toBe('bar');
  });

  it('user can be unset by passing null', () => {
    const tracker = Tracker({
      user: {
        id: 'foo'
      }
    });

    const prevMerchantProvidedUserId = tracker.getConfig().user.merchantProvidedUserId;

    tracker.setUser({ id: null });

    const newMerchantProvidedUserId = tracker.getConfig().user.merchantProvidedUserId;

    expect(prevMerchantProvidedUserId).toBe('foo');
    expect(newMerchantProvidedUserId).toBe(null);
  });
});
