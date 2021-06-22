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

  if (!event.user) {
    event.user = config.user;
  }

  const storedUserIds = getStoredUserIds();

  const data : FptiInput = {
    eventName: eventType,
    eventType,
    eventData: JSON.stringify(event),
    shopperId: storedUserIds.shopperId,
    merchantProvidedUserId: storedUserIds.merchantProvidedUserId
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
