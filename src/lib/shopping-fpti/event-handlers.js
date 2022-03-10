/* @flow */
// $FlowFixMe
import { capturePageData } from '../tag-parsers/capture-page-data';
import type { Config } from '../../types';
import type { EventType } from '../../types/shopping-events';
import { isConfigFalse } from '../utils';
import { debugLogger } from '../debug-console-logger';

// eslint-disable-next-line default-param-last
function findConfigurationAttribute(config : Config, payload : Object = {}, attribName : string) : ?string {
  const shopperConfig = config.shoppingAttributes || {};
  return shopperConfig[attribName] || payload[attribName];
}

export const allowedAttributes = [
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
];

export function eventSinfoBuilderInit(config : Config) : Object {
  function filterAttributesForSinfoPayload(event : Object) : Object {
    const filteredAttributes = Object.keys(event)
      .filter((key) => allowedAttributes.includes(key))
      .reduce((obj, key) => {
        obj[key] = event[key];
        return obj;
      }, {});

    const excludedAttributes = Object.keys(event)
      .filter((key) => !allowedAttributes.includes(key))
      .reduce((obj, key) => {
        obj[key] = event[key];
        return obj;
      }, {});

    if (Object.keys(excludedAttributes).length) {
      debugLogger.log('[event-handler:filterAttributesForSinfoPayload] Following attributes will be excluded from event sinfo payload:', excludedAttributes);
    }

    return filteredAttributes;
  }

  function constructSinfoPayload(payload : Object) : ?string {
    const shopperConfig = config.shoppingAttributes || {};

    const enrichedPayload = filterAttributesForSinfoPayload({
      ...payload,
      ...shopperConfig
    });
    const shouldCaptureData = !isConfigFalse(shopperConfig.parse_page);
    const capturedData = shouldCaptureData ? capturePageData() : {};
    if (shouldCaptureData) {
      enrichedPayload.capturedData = capturedData;
    }

    const json = JSON.stringify(enrichedPayload);
    return json === '{}' ? null : json;
  }

  return {
    constructSinfoPayload
  };
}

export function customEventMappingInit(config : Config) : Object {
  function enrichPageViewEvent(payload : Object) : Object {
    const disableStoreCash = findConfigurationAttribute(config, payload, 'disable_storecash') || 'false';
    const containerSummary = config.containerSummary || {};
    const offerId = containerSummary.programId;
    if ((disableStoreCash === 'false') && offerId) {
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
      mru: 'true',
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
    const user_id = findConfigurationAttribute(config, payload, 'user_id');
    const eventSpecificAttributes = customEventMapper.getEventSpecificFptiAttributes(
      eventType, payload
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
