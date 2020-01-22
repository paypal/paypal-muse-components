/* globals expect */
/* @flow */
import constants from '../../src/lib/constants';
import {
  createNewCartId,
  getCartId,
  setCartId,
  getOrCreateValidCartId
} from '../../src/lib/local-storage';

const { storage } = constants;

describe('local-storage-utils', () => {
  describe('createNewCartId', () => {
    beforeEach(() => {
      window.localStorage.removeItem(storage.paypalCrCart);
    });

    it('create a new cartId and save it to localStorage', () => {
      const result = createNewCartId();
      const localStorage = JSON.parse(window.localStorage.getItem(storage.paypalCrCart));

      expect(typeof result.cartId).toBe('string');
      expect(typeof result.createdAt).toBe('number');
      expect(result).toEqual(localStorage);
    });

    it('replaces old cartId if one exists', () => {
      const localStorage = {
        cartId: 'oldCartId',
        createAt: 500000
      };

      window.localStorage.setItem(storage.paypalCrCart, JSON.stringify(localStorage));
        
      const result = createNewCartId();

      expect(result).not.toEqual(localStorage);
    });
  });

  describe('setCartId', () => {
    beforeEach(() => {
      window.localStorage.removeItem(storage.paypalCrCart);
    });

    it('sets a cart', () => {
      const newCartId = 'arglebargle';

      const result = setCartId(newCartId);
      const localStorage = JSON.parse(window.localStorage.getItem(storage.paypalCrCart));

      expect(result.cartId).toBe(newCartId);
      expect(localStorage.cartId).toBe(newCartId);
      expect(typeof localStorage.createdAt).toBe('number');
      expect(typeof result.createdAt).toBe('number');
    });
  });

  describe('getCartId', () => {
    beforeEach(() => {
      window.localStorage.removeItem(storage.paypalCrCart);
    });

    it('returns a cart when one exists', () => {
      createNewCartId();
      const result = getCartId();

      expect(typeof result.cartId).toBe('string');
      expect(typeof result.createdAt).toBe('number');
    });

    it('returns null when no cart exists', () => {
      const result = getCartId();
      expect(result).toBe(null);
    });
  });

  describe('getOrCreateValidCartId', () => {
    beforeEach(() => {
      window.localStorage.removeItem(storage.paypalCrCart);
    });

    it('resets a cart when it is expired', () => {
      const previous = {
        cartId: 'expiredCart',
        createdAt: 500
      };

      window.localStorage.setItem(storage.paypalCrCart, JSON.stringify(previous));

      const result = getOrCreateValidCartId();
      const current = JSON.parse(window.localStorage.getItem(storage.paypalCrCart));

      expect(result).toEqual(current);
      expect(result.cartId).not.toBe(previous.cartId);
      expect(result.createdAt).not.toBe(previous.createdAt);
    });

    it('leaves a cart unchanged when it is not expired', () => {
      const previous = {
        cartId: 'expiredCart',
        createdAt: Date.now()
      };

      window.localStorage.setItem(storage.paypalCrCart, JSON.stringify(previous));

      const result = getOrCreateValidCartId();
      const current = JSON.parse(window.localStorage.getItem(storage.paypalCrCart));

      expect(result).toEqual(previous);
      expect(current).toEqual(previous);
    });

    it('creates a new cart when none exists', () => {
      const result = getOrCreateValidCartId();
      const localStorage = JSON.parse(window.localStorage.getItem(storage.paypalCrCart));

      expect(typeof result.cartId).toBe('string');
      expect(typeof result.createdAt).toBe('number');
      expect(result).toEqual(localStorage);
    });
  });
});
