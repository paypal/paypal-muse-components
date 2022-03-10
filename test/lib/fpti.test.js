/* globals jest expect */
/* @flow */
import { resolveTrackingData } from '../../src/lib/fpti';
import { getDeviceInfo } from '../../src/lib/get-device-info';
import { getIdentity } from '../../src/lib/local-storage';

const deviceInfoMock = {
  deviceWidth: 123,
  deviceHeight: 125,
  screenWidth: 300,
  screenHeight: 400,
  colorDepth: 24,
  rosettaLanguage: 'en-US',
  location: 'test.business.us',
  deviceType: 'Desktop',
  browserHeight: 100,
  browserWidth: 300
};

const identityMock = {
  confidenceScore: 100,
  identificationType: 'RMUC',
  encryptedAccountNumber: 'CY26RACMGXKQL'
};
const fptiInput = {
  eventName: 'pageView',
  eventType: 'view',
  eventData: `{"id":  123}`
};

jest.mock('../../src/lib/get-device-info');
jest.mock('../../src/lib/local-storage');

function verifyCopy (targetObject : Object, sourceObject : Object) {
  // eslint-disable-next-line guard-for-in
  for (const property in sourceObject) {
    expect(targetObject[property]).toEqual(sourceObject[property]);
  }
}

describe('should map tracking data', () => {
  beforeEach(() => {
    getDeviceInfo.mockClear();
    getIdentity.mockClear();
    getDeviceInfo.mockReturnValue(deviceInfoMock);
    getIdentity.mockReturnValue(identityMock);
  });

  it('should map tracking data with default values', () => {
    const config = { user: { id: 123 } };
    const trackingData = resolveTrackingData(config, fptiInput);

    expect(trackingData.product).toEqual('ppshopping');
    expect(trackingData.e).toEqual('im');
    expect(trackingData.comp).toEqual('ppshoppingsdk');
    expect(trackingData.page).toEqual('ppshopping:pageView');

    verifyCopy(trackingData, deviceInfoMock);
    verifyCopy(trackingData, config);
    verifyCopy(trackingData, fptiInput);
    verifyCopy(trackingData, identityMock);

  });

  it('should map tracking data with parameters', () => {
    const config = { user: { id: 123 } };
    const trackingData = resolveTrackingData(config, fptiInput, 'ppshopping_v2', 'ppshoppingsdk_v2');

    expect(trackingData.product).toEqual('ppshopping_v2');
    expect(trackingData.e).toEqual('im');
    expect(trackingData.comp).toEqual('ppshoppingsdk_v2');
    expect(trackingData.page).toEqual('ppshopping_v2:pageView');

    verifyCopy(trackingData, deviceInfoMock);
    verifyCopy(trackingData, config);
    verifyCopy(trackingData, fptiInput);
    verifyCopy(trackingData, identityMock);

  });

});
