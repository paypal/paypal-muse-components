/* @flow */
import type { FptiInput, Config } from '../types';

import { trackFptiV2 } from './fpti';
import { eventToFptiConverters, type EventToFptiInputMapping } from './shopping-event-conversions';

const initEventPublisher = (config : Config) => {
  return (converterToFpti : EventToFptiInputMapping) => {
    return (event : Object) => {
      const fptiInput : FptiInput = converterToFpti(event);

      trackFptiV2(config, fptiInput);
    };
  };
};

export const setupTrackers = (config : Config) => {
  const eventPublisher = initEventPublisher(config);
  const converters = eventToFptiConverters(config);

  const viewPage = eventPublisher(converters.viewPageToFpti);
  const productViewed = eventPublisher(converters.viewProductToFpti);
   
  return { viewPage, productViewed};
};
