/* @flow */
import { eventToFptiMapperInit } from '../../../src/lib/shopping-fpti/event-handlers';

const { expect } = global;

describe('test FPTI attribute mappings for page_view', () => {
  const eventName = 'page_view';
  const eventPayload = {
    user_id: '123',
    id: 'HOME'
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
        id: 'HOME'
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
        id: 'HOME'
      }),
      merchantProvidedUserId: '123',
      page: `ppshopping:page_view`,
      fltp: 'analytics',
      offer_id: config.containerSummary.programId,
      sub_component: 'analytics',
      sub_flow: 'store-cash'
    });
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
      es: 'merchantRecognizedUser'
    });
  });
});

describe('should handle shopping attributes set in the Configuration', () => {
  const eventName = 'page_view';
  const eventPayload = {
    id: 'HOME'
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
      id: 'HOME',
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
