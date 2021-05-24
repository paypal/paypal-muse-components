/* @flow */
import type { FptiInput, Config } from '../types';

import { ShoppingEventPublisher } from './shopping-fpti-event-publisher';
import { eventToFptiConverters, type EventToFptiInputMapping } from './shopping-event-conversions';


const initEventPublisher = (config : Config) => {
  const fptiEventPubisher = ShoppingEventPublisher(config);
  return (converterToFpti : EventToFptiInputMapping) => {
    return (event : Object) => {
      const fptiInput : FptiInput = converterToFpti(event);
      fptiEventPubisher.publishFptiEvent(fptiInput);
    };
  };
};

/**
 * Setup the various trackers which are a part of the shopping analytics
 * api.
 *
 * There are two phases :
 * 1) Converter - converts from the SDK object to an fpti object.
 *                There are specific converters for different SDK endpoint and payload objects
 * 2) Publisher - publishes event to fpti taking care of fetching necessary container data from the server
 *                before publishing
 *                There is a single fpti publisher that takes the FPTI payload from any converter
 *                and sends to FPTI
 *
 * @param config
 * @returns {{viewPage: (function(...[*]=))}}
 */
export const setupTrackers = (config : Config) => {
  const eventPublisher = initEventPublisher(config);
  const converters = eventToFptiConverters(config);

  const viewPage = eventPublisher(converters.viewPageToFpti);
  const viewProduct = eventPublisher(converters.viewProductToFpti);

  return { viewPage, viewProduct };
};
