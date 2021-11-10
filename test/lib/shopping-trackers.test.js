/* global expect jest */
/* @flow */
import { setupTrackers } from '../../src/lib/shopping-trackers';
import { trackFpti } from '../../src/lib/shopping-fpti/shopping-fpti';
import { PageView } from '../../src/types/shopping-events';
import { eventToFptiConverters } from '../../src/lib/shopping-fpti/shopping-event-conversions';

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

jest.mock('../../src/lib/shopping-fpti/shopping-event-conversions');
jest.mock('../../src/lib/shopping-fpti/shopping-fpti');

const eventToFptiMock = jest.fn();

describe('test eventTracker setup', () => {
  beforeEach(() => {
    eventToFptiConverters.mockClear();
    eventToFptiConverters.mockReturnValue({
      eventToFpti: eventToFptiMock
    });

    eventToFptiMock.mockClear();
    eventToFptiMock.mockReturnValue(mockFptiInput);

    trackFpti.mockClear();
  });
  
  it('should event trackers include pageView tracker', () => {
    const trackers = setupTrackers(config);
    trackers.send('page_view', pageView);
    expect(eventToFptiMock).toBeCalledWith('page_view', pageView);
    expect(trackFpti).toBeCalledWith(mockFptiInput);
  });

});
