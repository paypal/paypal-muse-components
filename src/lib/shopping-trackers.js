/* @flow */
import type { FptiInput, Config } from '../types';
import type { EventType } from '../types/shopping-events';

import { debugLogger } from './debug-console-logger';
import { trackFpti } from './shopping-fpti/shopping-fpti';
import {
  eventToFptiConverters
} from './shopping-fpti/shopping-event-conversions';
import { shoppingAttributes } from './shopping-attributes';

function initGenericEventPublisher(config : Config) : Object {
  const convertEvent = eventToFptiConverters(config).eventToFpti;
  return {
    publishEvent: (event : EventType, payload : Object) => {
      const fptiInput : FptiInput = convertEvent(event, payload);
      debugLogger.log('[shopping-tracker:publishEvent] Publishing FPTI event:', fptiInput);
      trackFpti(fptiInput);
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
  const send = initGenericEventPublisher(config).publishEvent;
  const set = shoppingAttributes(config).updateShoppingAttributes;
  return { send, set };
};
