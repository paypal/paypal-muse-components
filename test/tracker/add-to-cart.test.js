/* @flow */
/* global it describe beforeEach afterAll expect jest */
import { Tracker } from '../../src/tracker-component';
import { track } from '../../src/lib/track';
import { getPropertyId } from '../../src/lib/get-property-id';
// eslint-disable-next-line no-console
console.error = jest.fn();
jest.mock('../../src/lib/track');
jest.mock('../../src/lib/get-property-id', () => {
  return {
    // eslint-disable-next-line require-await
    getPropertyId: async () => 'mockpropertyidofsomekind'
  };
});

describe('addToCart', () => {
  let config;
  let mockItem;

  beforeEach(() => {
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
    // eslint-disable-next-line no-console
    console.error.mockReset();
    window.localStorage.removeItem('paypal-cr-cart');
    window.localStorage.removeItem('paypal-cr-cart-expirty');
  });

  afterAll(() => {
    track.mockRestore();
    getPropertyId.mockRestore();
    // eslint-disable-next-line no-console
    console.error.mockRestore();
  });

  it('should pass added items', () => {
    const tracker = Tracker(config);

    tracker.addToCart({
      cartTotal: '25.00',
      items: [ mockItem ]
    });
    const args = track.mock.calls;

    expect(args[0][2].items).toEqual([ mockItem ]);
  });

  it('should pass user configuration to the track method', () => {
    const tracker = Tracker(config);

    tracker.addToCart({
      cartTotal: '25.00',
      items: [ mockItem ]
    });

    const args = track.mock.calls;

    expect(args[0][0].user).toEqual(config.user);
  });

  it('should pass currencyCode to the track method', () => {
    const tracker = Tracker(config);
    const args = track.mock.calls;
    
    tracker.addToCart({
      cartTotal: '25.00',
      items: [ mockItem ]
    });

    const currencyCode1 = args[0][0].currencyCode;

    tracker.addToCart({
      currencyCode: 'DARSEK', // the darsek is the official currency of the klingon empire
      cartTotal: '5000.00',
      items: [ mockItem ]
    });

    const currencyCode2 = args[1][0].currencyCode;

    tracker.addToCart({
      cartTotal: '10000.00',
      items: [ mockItem ]
    });

    const currencyCode3 = args[2][0].currencyCode;

    tracker.addToCart({
      currencyCode: 'JPY',
      cartTotal: '5000.00',
      items: [ mockItem ]
    });

    const currencyCode4 = args[3][0].currencyCode;

    expect(currencyCode1).toBe('USD');
    expect(currencyCode2).toBe('DARSEK');
    expect(currencyCode3).toBe('DARSEK');
    expect(currencyCode4).toBe('JPY');
  });

  it('should enqueue events when fired before propertyId is ready', (done) => {
    const tracker = Tracker();

    tracker.addToCart({
      cartTotal: '25.00',
      items: [ mockItem ]
    });
    tracker.addToCart({
      cartTotal: '24.00',
      items: [ mockItem ]
    });

    setTimeout(() => {
      const args = track.mock.calls;
      expect(args[0][2].items).toEqual([ mockItem ]);
      expect(args[1][2].items).toEqual([ mockItem ]);
      done();
    }, 100);
  });
});
