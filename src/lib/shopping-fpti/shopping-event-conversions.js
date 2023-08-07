/* @flow */
import type {
  PageView,
  EventType
} from '../../types/shopping-events';
import type { FptiInput, Config } from '../../types';
import { getDeviceInfo } from '../get-device-info';
import { getIdentity, getUserId } from '../local-storage';
import type { VisitorInfo } from '../../types/user';

import { eventToFptiMapperInit } from './event-handlers';

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


export const eventToFptiConverters = (config : Config) => {
  const eventToFptiMapper = eventToFptiMapperInit(config);
  
  function constructFptiInput(
    eventType : EventType,
    event : Object,
    inMemoryIdentity: ?VisitorInfo
  ) : Object {
    const containerSummary = config.containerSummary || {};
    const applicationContext = containerSummary.applicationContext || {};
    const deviceInfo : any  = getDeviceInfo() || {};
    const identity : any = inMemoryIdentity || getIdentity() || {};

    const storedUserIds = getStoredUserIds();
    const eventFptiAttributes = eventToFptiMapper.eventToFptiAttributes(eventType, event);

    let { location } = deviceInfo;

    if (applicationContext.limitUrlCapture) {
      location = document.location.host;
    }

    return {
      ...eventFptiAttributes,
      e: 'im',
      flag_consume: 'yes',
      mrid: containerSummary.mrid,
      item: containerSummary.id,
      shopperId: storedUserIds.shopperId,
      t: new Date().getTime(),
      g: new Date().getTimezoneOffset(),
      deviceWidth: deviceInfo.deviceWidth,
      deviceHeight: deviceInfo.deviceHeight,
      screenWidth: deviceInfo.screenWidth,
      screenHeight: deviceInfo.screenHeight,
      colorDepth: deviceInfo.colorDepth,
      rosettaLanguage: deviceInfo.rosettaLanguage,
      location,
      deviceType: deviceInfo.deviceType,
      browserHeight: deviceInfo.browserHeight,
      browserWidth: deviceInfo.browserWidth,
      confidenceScore: identity.confidenceScore,
      encryptedAccountNumber: identity.encryptedAccountNumber,
      identificationType: identity.identificationType
    };
  }
  
  return {
    viewPageToFpti: (viewData : PageView) : Object => {
      return constructFptiInput('page_view', viewData);
    },
    eventToFpti: constructFptiInput
  };
};


