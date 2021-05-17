/* global expect jest */
/* @flow */
import { setupTrackers } from '../../src/lib/shopping-analytics';
import { PageView, ProductView } from '../../src/types/shopping-events';
import { eventToFptiConverters } from '../../src/lib/shopping-event-conversions';
import { trackFptiV2 } from '../../src/lib/fpti';

const config = {};

const pageView : PageView = {
  id: '427b0021-00b3-4411-bf65-520b13841232',
  page_type: 'HOME_PAGE',
  category: {
    id: 'b1b302f9-1ef9-4cae-b0fd-5735131c80f3',
    name: 'Shoes'
  }
};

const productView : ProductView = {
  product_id: '427b0021-00b3-4411-bf65-520b13841232',
  product_name: 'HOME_PAGE',
  price: '200.00',
  currency: 'USD'
};

const mockFptiInput = { eventData: JSON.stringify(pageView) };

jest.mock('../../src/lib/fpti');
jest.mock('../../src/lib/shopping-event-conversions');

const viewPageToFptiMock = jest.fn();
const viewProductToFptiMock = jest.fn();

describe('test eventTracker setup', () => {
  beforeEach(() => {
    eventToFptiConverters.mockClear();
    eventToFptiConverters.mockReturnValue({
      viewPageToFpti: viewPageToFptiMock,
      viewProductToFpti: viewProductToFptiMock
    });

    viewPageToFptiMock.mockClear();
    viewPageToFptiMock.mockReturnValue(mockFptiInput);

    viewProductToFptiMock.mockClear();
    viewProductToFptiMock.mockReturnValue(mockFptiInput);

  });
  it('should event trackers include pageView tracker', () => {
    const trackers = setupTrackers(config);
    trackers.viewPage(pageView);
    expect(viewPageToFptiMock).toBeCalledWith(pageView);
    expect(trackFptiV2).toBeCalledWith(config, mockFptiInput);
  });
  it('should event trackers include productView tracker', () => {
    const trackers = setupTrackers(config);
    trackers.viewProduct(productView);
    expect(viewProductToFptiMock).toBeCalledWith(productView);
    expect(trackFptiV2).toBeCalledWith(config, mockFptiInput);
  });
});
