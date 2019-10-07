/* @flow */
/* global it jest describe beforeEach afterAll expect */
import { track } from '../../src/lib/track';
import constants from '../../src/lib/constants';

const { storage } = constants;

describe('track', () => {
  const mockCreateElement = jest.spyOn(document, 'createElement');
  let mockConfig;
  let mockTrackingData;

  beforeEach(() => {
    mockConfig = {
      user: {
        name: 'Phil Collins',
        id: 'a random user id',
        email: 'phil@collins.com'
      },
      propertyId: 'mahproperty',
      currencyCode: 'USD'
    };

    mockTrackingData = {
      cartId: 'acartidofsomekind',
      items: [ {
        id: 'abc-123',
        title: 'holiday-themed throwing axe set',
        url: 'www.heavymetalchristmas.com',
        imgUrl: 'www.heavymetalchristmas.com/images/family-gathering.jpg',
        keywords: [ 'christmas', 'throwing axes', 'metal', 'insurance liability' ],
        price: '19.95',
        quantity: 1
      } ],
      total: '19.95',
      currencyCode: 'USD'
    };
  });

  afterEach(() => {
    mockCreateElement.mockReset();
  });

  afterAll(() => {
    window.localStorage.removeItem(storage.paypalCrUser);
    jest.restoreAllMocks();
  });

  it('creates a new image element', () => {
    track(mockConfig, 'cartEvent', mockTrackingData);
    track(mockConfig, 'cartEvent', mockTrackingData);
    track(mockConfig, 'cartEvent', mockTrackingData);

    expect(mockCreateElement).toHaveBeenCalledTimes(3);
  });
});
