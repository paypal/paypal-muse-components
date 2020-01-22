/* globals jest expect */
/* @flow */
import {
  getIdentity,
  setIdentity
} from '../../src/lib/local-storage';
import constants from '../../src/lib/constants';

const { storage, oneHour } = constants;

/* Mock post message response */
const mockIdentityResponse = {
  'encryptedAccountNumber': '759SBALRW3ZTY',
  'confidenceScore': 100,
  'identificationType': 'RMUC'
};

describe('identity-local-storage', () => {
  beforeEach(() => {
    window.localStorage.removeItem(storage.paypalSDKIdentity);
  });

  describe('set identity', () => {
    beforeEach(() => {
      window.localStorage.removeItem(storage.paypalSDKIdentity);
    });

    it('sets user identity information into localstorage with along with a timestamp', () => {
      setIdentity(mockIdentityResponse);

      let result = window.localStorage.getItem(storage.paypalSDKIdentity);
      result = JSON.parse(result);

      expect(typeof result.createdAt).toBe('number');
      expect(result.identity).toEqual(mockIdentityResponse);
    });
  });

  describe('get identity', () => {
    let now;
    let storedValue;

    beforeEach(() => {
      jest.useFakeTimers();

      now = Date.now();

      storedValue = {
        identity: mockIdentityResponse,
        createdAt: now
      };

      window.localStorage.setItem(storage.paypalSDKIdentity, JSON.stringify(storedValue));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('returns stored identity information as json', () => {
      const result = getIdentity();

      expect(result).toEqual(mockIdentityResponse);
    });

    it('clears the cache and return null when data is older than a threshold', () => {
      const result = getIdentity();
      const localStorage = JSON.parse(window.localStorage.getItem(storage.paypalSDKIdentity));
      const ogDate = global.Date;

      /* Advance time an hour and one millisecond */
      global.Date = {
        now: () => (now + oneHour + 1)
      };

      const expiredResult = getIdentity();
      const expiredLocalStorage = window.localStorage.getItem(storage.paypalSDKIdentity);

      expect(result).toEqual(mockIdentityResponse);
      expect(localStorage.identity).toEqual(mockIdentityResponse);
      expect(localStorage.createdAt).toEqual(now);

      expect(expiredResult).toBe(null);
      expect(expiredLocalStorage).toBe(null);

      global.Date = ogDate;
    });

    it('will fail gracefully in the event that malformed data is stored', () => {
      storedValue = '';
      window.localStorage.setItem(storage.paypalSDKIdentity, storedValue);

      const result = getIdentity();
      const localStorage = JSON.parse(window.localStorage.getItem(storage.paypalSDKIdentity));

      expect(result).toBe(null);
      expect(localStorage).toBe(null);
    });
  });
});
