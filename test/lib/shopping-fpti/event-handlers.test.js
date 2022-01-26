/* @flow */
import {
  eventToFptiMapperInit,
  allowedAttributes
} from '../../../src/lib/shopping-fpti/event-handlers';

const { expect } = global;

describe('IF ANY OF THESE FAIL, UPDATE DOC WHEN YOU FIX -- https://go/shopping-sdk-events', () => {
  describe('test FPTI attribute mappings for page_view', () => {
    const eventName = 'page_view';
    const eventPayload = {
      user_id: '123',
      page_id: 'HOME'
    };

    it('should return page_view event mappings if container is missing', () => {
      const config = {};
      const eventFpti = eventToFptiMapperInit(config).eventToFptiAttributes(
        eventName,
        eventPayload
      );
      expect(eventFpti).toEqual({
        eventName: 'page_view',
        eventData: JSON.stringify({
          page_id: 'HOME'
        }),
        merchantProvidedUserId: '123',
        page: `ppshopping:page_view`
      });
    });

    it('store-cash. should return page_view event mappings container includes offer', () => {
      const config = {
        containerSummary: {
          programId: 'LB8HB8WNMLNU6',
          mrid: 'JTJ8GTMKP7V3A'
        }
      };
      const eventFpti = eventToFptiMapperInit(config).eventToFptiAttributes(
        eventName,
        eventPayload
      );
      expect(eventFpti).toEqual({
        eventName: 'page_view',
        eventData: JSON.stringify({
          page_id: 'HOME'
        }),
        merchantProvidedUserId: '123',
        page: `ppshopping:page_view`,
        fltp: 'analytics',
        offer_id: config.containerSummary.programId,
        sub_component: 'analytics',
        sub_flow: 'store-cash'
      });
    });

    it('store-cash. disable_storecash=true should not include offer', () => {
      const config = {
        containerSummary: {
          programId: 'LB8HB8WNMLNU6',
          mrid: 'JTJ8GTMKP7V3A'
        },
        shoppingAttributes: {
          disable_storecash: 'true'
        }
      };
      const eventFpti = eventToFptiMapperInit(config).eventToFptiAttributes(
        eventName,
        eventPayload
      );
      expect(eventFpti.sub_flow).toEqual(undefined);
    });

    it('store-cash. disable_storecash=false should not include offer', () => {
      const config = {
        containerSummary: {
          programId: 'LB8HB8WNMLNU6',
          mrid: 'JTJ8GTMKP7V3A'
        },
        shoppingAttributes: {
          disable_storecash: 'false'
        }
      };
      const eventFpti = eventToFptiMapperInit(config).eventToFptiAttributes(
        eventName,
        eventPayload
      );
      expect(eventFpti.sub_flow).toEqual('store-cash');
    });
  });

  describe('test FPTI attribute mappings for purchase event', () => {
    const eventName = 'purchase';
    const eventPayload = { user_id: '123', amount: '20.00' };

    it('should return purchase event mappings', () => {
      const config = {};
      const eventFpti = eventToFptiMapperInit(config).eventToFptiAttributes(
        eventName,
        eventPayload
      );
      expect(eventFpti).toEqual({
        eventName: 'purchase',
        eventData: JSON.stringify({
          amount: '20.00'
        }),
        merchantProvidedUserId: '123',
        page: `ppshopping:purchase`,
        fltp: 'analytics',
        es: 'txnSuccess'
      });
    });
  });

  describe('test FPTI attribute mappings for store_cash exclusion event', () => {
    const eventName = 'store_cash_exclusion';
    const eventPayload = {};

    it('should return store_cash_exclusion event mappings', () => {
      const config = {};
      const eventFpti = eventToFptiMapperInit(config).eventToFptiAttributes(
        eventName,
        eventPayload
      );
      expect(eventFpti).toEqual({
        merchantProvidedUserId: undefined,
        eventData: null,
        eventName: 'store_cash_exclusion',
        page: `ppshopping:store_cash_exclusion`,
        fltp: 'analytics',
        es: 'merchantRecognizedUser',
        mru: 'true'
      });
    });
  });

  describe('should handle shopping attributes set in the Configuration', () => {
    const eventName = 'page_view';
    const eventPayload = {
      page_id: 'HOME'
    };

    it('should map attribute from shopping attributes set in the Configuration', () => {
      const config = {
        shoppingAttributes: {
          currency: 'USD'
        }
      };
      
      const eventFpti = eventToFptiMapperInit(config).eventToFptiAttributes(
        eventName,
        eventPayload
      );
      const sinfo = JSON.parse(eventFpti.eventData);
      expect(sinfo.currency).toEqual('USD');
    });

    it('should exclude special attributes from Sinfo. user_id set in Shopping configuration', () => {
      const config = {
        shoppingAttributes: {
          user_id: '15f903ad-e95c-4293-a8ef-b55f66bb9057'
        }
      };
      
      const eventFpti = eventToFptiMapperInit(config).eventToFptiAttributes(
        eventName,
        eventPayload
      );
      const sinfo = JSON.parse(eventFpti.eventData);
      expect(sinfo.user_id).toEqual(undefined);
    });

    it('should exclude special attributes from Sinfo. user_id set in event payload', () => {
      const config = {};
      const payload = {
        page_id: 'HOME',
        user_id: '15f903ad-e95c-4293-a8ef-b55f66bb9057'
      };
    
      const eventFpti = eventToFptiMapperInit(config).eventToFptiAttributes(
        eventName,
        payload
      );
      const sinfo = JSON.parse(eventFpti.eventData);
      expect(sinfo.user_id).toEqual(undefined);
    });
  });
});

describe('IF THIS FAILS, UPDATE DOC WHEN YOU FIX -- https://go/shopping-sinfo-props', () => {
  it('included attributes in sinfo builder should match what is documented.', () => {
    expect(allowedAttributes).toEqual([
      // page view
      'page_type',
      'page_name',
      'page_id',
      'page_path',
      'page_category_name',
      'page_category_id',
      'deal_id',
      'deal_name',
      'deal_value',
      'search_results_count',
      'cart_products',
      // product view
      'product_id',
      'product_name',
      'product_url',
      'product_price',
      'product_brand',
      'product_category_name',
      'product_category_id',
      'product_discount',
      // purchase
      'amount',
      // set properties
      'currency'
    ]);
  });
});
