/* @flow */
/* global afterAll expect jest */
import { Tracker } from '../../src/tracker-component';
import { getUserId } from '../../src/lib/local-storage';
import constants from '../../src/lib/constants';
import { mockContainerSummary1 } from '../mocks';

jest.mock('../../src/lib/get-property-id', () => {
  return {
    fetchPropertyId: async () => 'mockpropertyidofsomekind',
    fetchContainerSettings: async () => mockContainerSummary1
  };
});

describe('setUser', () => {
  const { storage } = constants;

  beforeEach(() => {
    window.localStorage.removeItem(storage.paypalCrUser);
  });

  afterEach(() => {
    window.localStorage.removeItem('paypal-cr-cart');
    window.localStorage.removeItem('paypal-cr-cart-expirty');
  });

  afterAll(() => {
    window.localStorage.removeItem(storage.paypalCrUser);
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

  it('user should be set when set user is called', () => {
    const tracker = Tracker({ user: { id: 'somevalue' } });
    const prevMerchantProvidedUserId = tracker.getConfig().user.merchantProvidedUserId;

    tracker.setUser({ id: '123' });

    const newMerchantProvidedUserId = tracker.getConfig().user.merchantProvidedUserId;

    expect(prevMerchantProvidedUserId).toBe('somevalue');
    expect(newMerchantProvidedUserId).toBe('123');
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
