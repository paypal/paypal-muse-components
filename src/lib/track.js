/* @flow */
import { getClientID, getMerchantID } from '@paypal/sdk-client/src';

import { getUserIdCookie, setRandomUserIdCookie } from './cookie-utils';
import { getDeviceInfo } from './get-device-info';
import type {
    Config,
    TrackingType
} from './types';

export const track = <T>(config : Config, trackingType : TrackingType, trackingData : T) => {
    const encodeData = data => encodeURIComponent(btoa(JSON.stringify(data)));

    const img = document.createElement('img');
    img.style.display = 'none';
    if (!getUserIdCookie()) {
        setRandomUserIdCookie();
    }
    const user = {
        ...config.user,
        id: getUserIdCookie()
    };
    const deviceInfo = getDeviceInfo();
    const data = {
        ...trackingData,
        user,
        propertyId: config.propertyId,
        trackingType,
        clientId: getClientID(),
        merchantId: getMerchantID().join(','),
        deviceInfo
    };

    // paramsToBeaconUrl is a function that gives you the ability to override the beacon url
    // to whatever you want it to be based on the trackingType string and data object.
    // This can be useful for testing purposes, this feature won't be used by merchants.
    if (config.paramsToBeaconUrl) {
        img.src = config.paramsToBeaconUrl({ trackingType, data });
    } else {
        img.src = `https://www.paypal.com/targeting/track/${ trackingType }?data=${ encodeData(data) }`;
    }

    if (document.body) {
        document.body.appendChild(img);
    }
};
