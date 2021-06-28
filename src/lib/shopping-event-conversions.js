/* @flow */
import type {
  PageView,
  EventType,
  ProductView
} from '../types/shopping-events';
import type { FptiInput, Config } from '../types';

import { getUserId } from './local-storage';

export type EventToFptiInputMapping = (event : Object) => FptiInput;

function getStoredUserIds() : Object {
  const storedUserIds = getUserId();
  if (storedUserIds) {
    return {
      shopperId: storedUserIds.userId,
      merchantProvidedUserId: storedUserIds.merchantProvidedUserId
    };
  } else {
    return {};
  }
}

function convertShoppingEventToFptiInput(
  config : Config,
  event : Object,
  eventType : EventType
) : FptiInput {

  const storedUserIds = getStoredUserIds();

  const eventDataPayload = { ...event };
  // remove user_id property from event_payload since it is passed separately
  delete eventDataPayload.user_id;
  const data : FptiInput = {
    eventName: eventType,
    eventType,
    eventData: JSON.stringify(eventDataPayload),
    shopperId: storedUserIds.shopperId,
    merchantProvidedUserId: event.user_id
  };

  return data;
}

export const eventToFptiConverters = (config : Config) => {
  return {
    viewPageToFpti: (viewData : PageView) : FptiInput => {
      return convertShoppingEventToFptiInput(config, viewData, 'pageView');
    },
    viewProductToFpti: (viewData : ProductView) : FptiInput => {
      viewData.currency = viewData.currency
        ? viewData.currency
        : config.currencyCode;
      return convertShoppingEventToFptiInput(config, viewData, 'productView');
    },
    eventToFpti: (event : EventType, payload : Object) : FptiInput => {
      return convertShoppingEventToFptiInput(config, payload, event);
    }
  };
};
