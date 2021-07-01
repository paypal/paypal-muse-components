/* global expect jest */
/* @flow */
import { eventToFptiConverters } from '../../src/lib/shopping-event-conversions';
import { PageView, ProductView } from '../../src/types/shopping-events';
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
  },
  user: {
    id: '6fbbc29f-3a15-4cf8-889a-34624a74496c',
    first_time_visit: 'true'
  }
};

// with only required field
const pageViewSimple : PageView = {
  page_type: 'HOME_PAGE'
};

const productView : ProductView = {
  product_id: '427b0021-00b3-4411-bf65-520b13841232',
  product_name: 'Reebok Shoe ® R,™ TM, © C -- 1231 asd | +=..,/ á, é, í, ó, ú, ü, ñ, ¿, ¡',
  price: '200.00',
  currency: 'USD',
  url: 'https://xyz.com/products/puffy-lux-mattress?type=hybrid',
  brand: 'Reebok® á, é, í, ó, ú, ü, ñ, ¿, ¡'
};

jest.mock('../../src/lib/local-storage');

describe('test event converters to FPTI input', () => {
  beforeEach(() => {
    getUserId.mockClear();
    getUserId.mockReturnValue({ userId: generatedUserId, merchantProvidedUserId });
  });

  describe('viewPageToFpti', () => {
    it('should map HOME_PAGE pageView event with optional fields to FPTI input', () => {
      const fptiEvent = eventConverters.viewPageToFpti(pageView);
      expect(fptiEvent.eventName).toEqual('pageView');
      expect(fptiEvent.eventType).toEqual('pageView');
      expect(fptiEvent.eventData).toEqual(JSON.stringify(pageView));
      expect(fptiEvent.shopperId).toEqual(generatedUserId);
    });

    it('should map HOME_PAGE pageView event without optional fields to FPTI input', () => {
      const fptiEvent = eventConverters.viewPageToFpti(pageViewSimple);
      expect(fptiEvent.eventName).toEqual('pageView');
      expect(fptiEvent.eventType).toEqual('pageView');
      expect(fptiEvent.eventData).toEqual(JSON.stringify(pageViewSimple));
      expect(fptiEvent.shopperId).toEqual(generatedUserId);
    });
  });

  describe('viewProductToFpti', () => {
    it('should map productView event to FPTI input', () => {
      const fptiEvent = eventConverters.viewProductToFpti(productView);
      expect(fptiEvent.eventName).toEqual('productView');
      expect(fptiEvent.eventType).toEqual('productView');
      expect(fptiEvent.eventData).toEqual(JSON.stringify(productView));
      expect(fptiEvent.shopperId).toEqual(generatedUserId);
    });
  });

  describe('eventToFpti', () => {
    it('should map generic event to FPTI input', () => {
      const fptiEvent = eventConverters.eventToFpti('productView', productView);
      expect(fptiEvent.eventName).toEqual('productView');
      expect(fptiEvent.eventType).toEqual('productView');
      expect(fptiEvent.eventData).toEqual(JSON.stringify(productView));
      expect(fptiEvent.shopperId).toEqual(generatedUserId);
    });

    it('should map merchantProvidedUserId to FPTI input when user_id is set', () => {
      const userId = '123';
      const payload = {
        user_id: userId,
        id: 'HOME'
      };
      const eventDataPayload = { ...payload };
      delete eventDataPayload.user_id;
      const fptiEvent = eventConverters.eventToFpti('page_view', payload);
      expect(fptiEvent.eventName).toEqual('page_view');
      expect(fptiEvent.eventType).toEqual('page_view');
      expect(fptiEvent.eventData).toEqual(JSON.stringify(eventDataPayload));
      expect(fptiEvent.shopperId).toEqual(generatedUserId);
      expect(fptiEvent.merchantProvidedUserId).toEqual(userId);
    });

    it('should not map merchantProvidedUserId to FPTI input when user_id is not set', () => {
      const payload = { id: 'HOME' };
      const eventDataPayload = { ...payload };
      delete eventDataPayload.user_id;
      const fptiEvent = eventConverters.eventToFpti('page_view', payload);
      expect(fptiEvent.eventName).toEqual('page_view');
      expect(fptiEvent.eventType).toEqual('page_view');
      expect(fptiEvent.eventData).toEqual(JSON.stringify(eventDataPayload));
      expect(fptiEvent.shopperId).toEqual(generatedUserId);
      expect(fptiEvent.merchantProvidedUserId).toEqual(undefined);
    });
  });

});
