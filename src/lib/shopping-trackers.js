/* @flow */
import type { FptiInput, Config } from '../types';
import type { EventType } from '../types/shopping-events';

import autoGenerateProductPayload from './utils';
import { ShoppingEventPublisher } from './shopping-fpti/shopping-fpti-event-publisher';
import {
  eventToFptiConverters,
  type EventToFptiInputMapping
} from './shopping-fpti/shopping-event-conversions';
import { shoppingAttributes } from './shopping-attributes';


const initEventPublisher = (config : Config, fptiEventPubisher) => {
  return (converterToFpti : EventToFptiInputMapping) => {
    return (event : Object) => {
      const fptiInput : FptiInput = converterToFpti(event);
      fptiEventPubisher.publishFptiEvent(fptiInput);
    };
  };
};

function initGenericEventPublisher(config : Config, fptiEventPubisher) : Object {
  const convertEvent = eventToFptiConverters(config).eventToFpti;
  return {
    publishEvent: (event : EventType, payload : Object) => {
      const fptiInput : FptiInput = convertEvent(event, payload);
      fptiEventPubisher.publishFptiEvent(fptiInput);
    }
  };
}

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
  const fptiEventPubisher = ShoppingEventPublisher(config);
  const eventPublisher = initEventPublisher(config, fptiEventPubisher);
  const converters = eventToFptiConverters(config);
  const viewPage = eventPublisher(converters.viewPageToFpti);
  const send = initGenericEventPublisher(config, fptiEventPubisher).publishEvent;
  const set = shoppingAttributes(config).updateShoppingAttributes;
  return { viewPage, send, set, autoGenerateProductPayload };
};
