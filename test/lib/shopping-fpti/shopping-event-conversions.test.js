/* global expect jest */
/* @flow */

import { eventToFptiMapperInit } from '../../../src/lib/shopping-fpti/event-handlers';
import { eventToFptiConverters } from '../../../src/lib/shopping-fpti/shopping-event-conversions';
import { getUserId, getIdentity } from '../../../src/lib/local-storage';
import { getDeviceInfo } from '../../../src/lib/get-device-info';
import {
  deviceInfo,
  identity,
  generatedUserIds,
  config,
  verifyMainFptiAttributes,
  verifyFptiIdentityMappings,
  verifyFptiDeviceInfoMappings
} from '../fpti-test-utils';

jest.mock('../../../src/lib/shopping-fpti/event-handlers');
jest.mock('../../../src/lib/local-storage');
jest.mock('../../../src/lib/get-device-info');

const eventToFptiAttributesMock = jest.fn();

describe('test event converters to FPTI input', () => {
  const eventName = 'page_view';
  const eventPayload = {
    user_id: '123',
    id: 'HOME'
  };

  const mappedFptiAttributes = {
    eventName: 'page_view',
    eventData: '{}',
    merchantProvidedUserId: 'GNAFQFT5ECSTS',
    page: `ppshopping:page_view`
  };

  beforeEach(() => {
    eventToFptiMapperInit.mockClear();
    eventToFptiMapperInit.mockReturnValue({
      eventToFptiAttributes: eventToFptiAttributesMock
    });

    getUserId.mockClear();
    getUserId.mockReturnValue(generatedUserIds);

    getIdentity.mockClear();
    getIdentity.mockReturnValue(identity);

    getDeviceInfo.mockClear();
    getDeviceInfo.mockReturnValue(deviceInfo);

    eventToFptiAttributesMock.mockClear();
    eventToFptiAttributesMock.mockReturnValue(mappedFptiAttributes);
  });

  it('should map event data into FPTI input. Not event specific attributes found', () => {
    const eventConverters = eventToFptiConverters(config);
    const fptiEvent = eventConverters.eventToFpti(eventName, eventPayload);

    verifyMainFptiAttributes(fptiEvent, mappedFptiAttributes);
    verifyFptiIdentityMappings(fptiEvent, identity);
    verifyFptiDeviceInfoMappings(fptiEvent, deviceInfo);
    expect(fptiEvent.mrid).toEqual(config.containerSummary.mrid);
    expect(fptiEvent.item).toEqual(config.containerSummary.id);
    expect(fptiEvent.e).toEqual('im');
    expect(fptiEvent.flag_consume).toEqual('yes');

    expect(getIdentity).toHaveBeenCalledTimes(1);
    expect(getDeviceInfo).toHaveBeenCalledTimes(1);
    expect(eventToFptiAttributesMock).toHaveBeenCalledTimes(1);
  });

  it('should map event data into FPTI input. No device info found', () => {
    getDeviceInfo.mockClear();
    getDeviceInfo.mockReturnValue(undefined);

    const eventConverters = eventToFptiConverters(config);
    const fptiEvent = eventConverters.eventToFpti(eventName, eventPayload);

    verifyFptiDeviceInfoMappings(fptiEvent, {});
  });

  it('should map event data into FPTI input. No identity info found', () => {
    getIdentity.mockClear();
    getIdentity.mockReturnValue(undefined);

    const eventConverters = eventToFptiConverters(config);
    const fptiEvent = eventConverters.eventToFpti(eventName, eventPayload);

    verifyFptiIdentityMappings(fptiEvent, {});
  });
});
