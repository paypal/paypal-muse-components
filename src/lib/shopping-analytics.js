/* @flow */
import type { FptiInput, Config } from '../types';
import type { EventType } from '../types/shopping-events';

import autoGenerateProductPayload from './utils';
import { ShoppingEventPublisher } from './shopping-fpti-event-publisher';
import {
  eventToFptiConverters,
  type EventToFptiInputMapping
} from './shopping-event-conversions';
import { shoppingAttributes } from './shopping-attributes';


const initEventPublisher = (config : Config) => {
  const fptiEventPubisher = ShoppingEventPublisher(config);
  return (converterToFpti : EventToFptiInputMapping) => {
    return (event : Object) => {
      const fptiInput : FptiInput = converterToFpti(event);
      fptiEventPubisher.publishFptiEvent(fptiInput);
    };
  };
};

function initGenericEventPublisher(config : Config) : Object {
  const fptiEventPubisher = ShoppingEventPublisher(config);
  const convertEvent = eventToFptiConverters(config).eventToFpti;
  return {
    publishEvent: (event : EventType, payload : Object) => {
      const extendedPayload = { ...payload, ...config.shoppingAttributes };
      const fptiInput : FptiInput = convertEvent(event, extendedPayload);
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
  const eventPublisher = initEventPublisher(config);
  const converters = eventToFptiConverters(config);
  const viewPage = eventPublisher(converters.viewPageToFpti);
  const viewProduct = eventPublisher(converters.viewProductToFpti);
  const send = initGenericEventPublisher(config).publishEvent;
  const set = shoppingAttributes(config).updateShoppingAttributes;
  return { viewPage, viewProduct, send, set, autoGenerateProductPayload };
};
