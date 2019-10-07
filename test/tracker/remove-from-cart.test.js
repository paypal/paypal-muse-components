/* @flow */
/* global it describe beforeEach afterAll expect jest */
import { Tracker } from '../../src/tracker-component';
import { track } from '../../src/lib/track';
import { getPropertyId } from '../../src/lib/get-property-id';

jest.mock('../../src/lib/track');
jest.mock('../../src/lib/get-property-id', () => {
  return {
    // eslint-disable-next-line require-await
    getPropertyId: async () => 'mockpropertyidofsomekind'
  };
});


describe('removeFromCart', () => {
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
    window.localStorage.removeItem('paypal-cr-cart');
    window.localStorage.removeItem('paypal-cr-cart-expirty');
  });

  afterAll(() => {
    track.mockRestore();
    getPropertyId.mockRestore();
  });

  it('should pass removed items', () => {
    const tracker = Tracker(config);

    tracker.removeFromCart({
      cartTotal: '25.00',
      items: [ mockItem ]
    });
    const args = track.mock.calls;

    expect(args[0][2].items).toEqual([ mockItem ]);
  });

  it('should pass user configuration to the track method', () => {
    const tracker = Tracker(config);

    tracker.removeFromCart({
      cartTotal: '25.00',
      items: [ mockItem ]
    });

    const args = track.mock.calls;

    expect(args[0][0].user).toEqual(config.user);
  });

  it('should enqueue events when fired before propertyId is ready', (done) => {
    const tracker = Tracker();

    tracker.removeFromCart({
      cartTotal: '25.00',
      items: [ mockItem ]
    });
    tracker.removeFromCart({
      cartTotal: '25.00',
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
