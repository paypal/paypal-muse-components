/* global expect jest */
/* @flow */
import { eventToFptiConverters } from '../../src/lib/shopping-event-conversions';
import { PageView } from '../../src/types/shopping-events';
import { getUserId } from '../../src/lib/local-storage';

const config = {};
const eventConverters = eventToFptiConverters(config);
const merchantProvidedUserId = '4328f923-3293-4b24-a069-d3c0bc2a0375';
const generatedUserId = 'ee964537-1c7b-403e-b978-ea29babc5aed';

const pageView : PageView = {
  id: '427b0021-00b3-4411-bf65-520b13841232',
  page_type: 'HOME_PAGE',
  category: {
    id: 'b1b302f9-1ef9-4cae-b0fd-5735131c80f3',
    name: 'Shoes'
  }
};

jest.mock('../../src/lib/local-storage');

describe('test event converters to FPTI input', () => {
  beforeEach(() => {
    getUserId.mockClear();
    getUserId.mockReturnValue({ userId: generatedUserId, merchantProvidedUserId });
  });
  it('should map pageView event to FPTI input', () => {
    const fptiEvent = eventConverters.viewPageToFpti(pageView);
    expect(fptiEvent.eventName).toEqual('pageView');
    expect(fptiEvent.eventType).toEqual('pageView');
    expect(fptiEvent.eventData).toEqual(JSON.stringify(pageView));
    expect(fptiEvent.shopperId).toEqual(generatedUserId);
    expect(fptiEvent.merchantProvidedUserId).toEqual(merchantProvidedUserId);
  });
});
