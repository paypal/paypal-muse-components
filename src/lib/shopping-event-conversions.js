/* @flow */
import type { PageView, EventType, ProductView } from '../types/shopping-events';
import type { FptiInput, Config } from '../types';

import { getUserId } from './local-storage';

export type EventName = "pageView" | "purchase";

export type EventToFptiInputMapping = (event : Object) => FptiInput;

const eventToFpti = (config : Config) => (
  event : Object,
  eventType : EventType
) : FptiInput => {

  viewData['currency'] = viewData['currency'] ? viewData['currency'] : config['currency']
  // $FlowFixMe
  const merchantProvidedUserId = getUserId().merchantProvidedUserId;
  // $FlowFixMe
  const shopperId = getUserId().userId;

  if (!event.user) {
    event.user = config.user;
  }

  const data : FptiInput = {
    eventName: eventType,
    eventType,
    shopperId,
    merchantProvidedUserId,
    eventData: JSON.stringify(event)
  };

  return data;
};

export const eventToFptiConverters = (config : Config) => {
  const eventToFptiConverter = eventToFpti(config);
  return {
    viewPageToFpti: (viewData : PageView) : FptiInput => {
      return eventToFptiConverter(viewData, 'pageView');
    },
    viewProductToFpti: (viewData : ProductView) : FptiInput => {      
      return eventToFptiConverter(viewData, 'productView');
    }
  };
};
