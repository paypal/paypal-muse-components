/* global expect jest */
/* @flow */
import { setupTrackers } from '../../src/lib/shopping-trackers';
import { PageView } from '../../src/types/shopping-events';
import { eventToFptiConverters } from '../../src/lib/shopping-fpti/shopping-event-conversions';
import { ShoppingEventPublisher } from '../../src/lib/shopping-fpti/shopping-fpti-event-publisher';

const config = {};

const pageView : PageView = {
  id: '427b0021-00b3-4411-bf65-520b13841232',
  page_type: 'HOME_PAGE',
  category: {
    id: 'b1b302f9-1ef9-4cae-b0fd-5735131c80f3',
    name: 'Shoes'
  }
};

const mockFptiInput = { eventData: JSON.stringify(pageView) };

jest.mock('../../src/lib/shopping-fpti/shopping-fpti-event-publisher');
jest.mock('../../src/lib/shopping-fpti/shopping-event-conversions');

const viewPageToFptiMock = jest.fn();
const eventToFptiMock = jest.fn();
const fptiPublishMock = jest.fn();

describe('test eventTracker setup', () => {
  beforeEach(() => {
    eventToFptiConverters.mockClear();
    eventToFptiConverters.mockReturnValue({
      viewPageToFpti: viewPageToFptiMock,
      eventToFpti: eventToFptiMock
    });

    ShoppingEventPublisher.mockClear();
    ShoppingEventPublisher.mockReturnValue({ publishFptiEvent: fptiPublishMock });

    viewPageToFptiMock.mockClear();
    viewPageToFptiMock.mockReturnValue(mockFptiInput);

    eventToFptiMock.mockClear();
    eventToFptiMock.mockReturnValue(mockFptiInput);

  });
  
  it('should event trackers include pageView tracker', () => {
    const trackers = setupTrackers(config);
    trackers.viewPage(pageView);
    expect(viewPageToFptiMock).toBeCalledWith(pageView);
    expect(fptiPublishMock).toBeCalledWith(mockFptiInput);
  });


  it('should include autoGenerateProductPayload', () => {
    const trackers = setupTrackers(config);
    expect(trackers.autoGenerateProductPayload).toBeInstanceOf(Function);
  });

});
