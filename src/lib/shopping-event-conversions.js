/* @disabled-flow */
/* Disabling flow because it does not understand the Object.assign return values */
import type {
  PageView,
  EventType,
  ProductView
} from '../types/shopping-events';
import type { FptiInput, Config } from '../types';

import { getUserId } from './local-storage';

export type EventToFptiInputMapping = (event : Object) => FptiInput;

const getDefaultFPTIEvent = () => {
  const storedUserIds = getUserId();

  const data = {
    shopperId: storedUserIds ? storedUserIds.userId : undefined,
    merchantProvidedUserId: storedUserIds ? storedUserIds.merchantProvidedUserId : undefined
  };

  return data;
};

function getDefaultFPTIEventFromShoppingEvent(config : Config,
  shoppingEvent : Object,
  eventType : EventType) : FptiInput {

  const eventData = {
    ...shoppingEvent,
    user: shoppingEvent.user || config.user
  };

  const data : FptiInput = {
    eventName: eventType,
    eventType,
    eventData
  };

  return data;
}

/**
 * Generic function that performs the default conversion for events
 * by stringifying the event object
 *
 * @param config
 * @param shoppingEvent
 * @param eventType
 * @returns {FptiInput}
 */
const getDefaultConvertor = (config : Config,
  shoppingEvent : Object,
  eventType : EventType) => {

  const defaultConvertedEvent =
      getDefaultFPTIEventFromShoppingEvent(config, shoppingEvent, eventType);

  const data : FptiInput =
      Object.assign(
        getDefaultFPTIEvent(),
        { ...defaultConvertedEvent,
          eventData: JSON.stringify(defaultConvertedEvent.eventData) }
      );

  return data;
};

const getViewProductEventConvertor = (config : Config,
  shoppingEvent : Object,
  eventType : EventType) => {

  const defaultConvertedEvent =
      getDefaultFPTIEventFromShoppingEvent(config, shoppingEvent, eventType);

  // Add additional data to event data
  const eventData = {
    ...defaultConvertedEvent.eventData,
    currency: defaultConvertedEvent.eventData.currency || config.currencyCode
  };

  // Now stringify event data
  const viewProductFPTIEvent = {
    ...defaultConvertedEvent,
    eventData: JSON.stringify(eventData)
  };

  const data : FptiInput =
      Object.assign(getDefaultFPTIEvent(), viewProductFPTIEvent);

  return data;
};

export const eventToFptiConverters = (config : Config) => {
  return {
    viewPageToFpti: (pageViewData : PageView) : FptiInput => {
      return getDefaultConvertor(config, pageViewData, 'pageView');
    },
    viewProductToFpti: (productViewData : ProductView) : FptiInput => {
      return getViewProductEventConvertor(config, productViewData, 'productView');
    }
  };
};
