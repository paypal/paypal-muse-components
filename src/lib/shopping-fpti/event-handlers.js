/* @flow */
import type { Config } from '../../types';
import type { EventType } from '../../types/shopping-events';

export function eventSinfoBuilderInit(config : Config) : Object {
  function filterAttributesForSinfoPayload(event : Object) : Object {
    const excluded_attributes = [ 'user_id' ];
    const filteredAttributes = Object.keys(event)
      .filter((key) => !excluded_attributes.includes(key))
      .reduce((obj, key) => {
        obj[key] = event[key];
        return obj;
      }, {});

    return filteredAttributes;
  }

  function constructSinfoPayload(payload : Object) : ?string {
    const shopperConfig = config.shoppingAttributes || {};

    const enrichedPayload = filterAttributesForSinfoPayload({
      ...payload,
      ...shopperConfig
    });
    const json = JSON.stringify(enrichedPayload);
    return json === '{}' ? null : json;
  }

  return {
    constructSinfoPayload
  };
}

export function customEventMappingInit(config : Config) : Object {
  function enrichPageViewEvent() : Object {
    const containerSummary = config.containerSummary || {};
    const offerId = containerSummary.programId;
    if (offerId) {
      return {
        fltp: 'analytics',
        offer_id: offerId,
        sub_flow: 'store-cash',
        sub_component: 'analytics'
      };
    }
    return {};
  }

  function enrichPurchaseEvent() : Object {
    return {
      fltp: 'analytics',
      es: 'txnSuccess'
    };
  }

  function enrichStoreCashExcusionEvent() : Object {
    return {
      fltp: 'analytics',
      es: 'merchantRecognizedUser'
    };
  }

  const eventMap = {
    page_view: enrichPageViewEvent,
    purchase: enrichPurchaseEvent,
    store_cash_exclusion: enrichStoreCashExcusionEvent
  };

  function getEventSpecificFptiAttributes(eventType : EventType) : Object {
    const event = eventType.toString();
    return eventMap[event] ? eventMap[event]() : {};
  }

  return {
    getEventSpecificFptiAttributes
  };
}

export function eventToFptiMapperInit(config : Config) : Object {
  const customEventMapper = customEventMappingInit(config);
  const eventSinfoBuilder = eventSinfoBuilderInit(config);

  function eventToFptiAttributes(
    eventType : EventType,
    payload : Object = {}
  ) : Object {
    const shopperConfig = config.shoppingAttributes || {};
    const user_id = shopperConfig.user_id || payload.user_id;
    const eventSpecificAttributes = customEventMapper.getEventSpecificFptiAttributes(
      eventType
    );
    return {
      eventName: eventType,
      eventData: eventSinfoBuilder.constructSinfoPayload(payload),
      merchantProvidedUserId: user_id,
      page: `ppshopping:${ eventType }`,
      ...eventSpecificAttributes
    };
  }

  return {
    eventToFptiAttributes
  };
}
