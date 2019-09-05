/* @flow */
import { getClientID, getMerchantID } from '@paypal/sdk-client/src';

import { getOrCreateValidCartId, getOrCreateValidUserId } from './local-storage-utils';
import { getDeviceInfo } from './get-device-info';
import type {
    Config,
    TrackingType
} from './types';

export const track = <T>(config : Config, trackingType : TrackingType, trackingData : T) => {
    const encodeData = data => encodeURIComponent(btoa(JSON.stringify(data)));
    const cartId = getOrCreateValidCartId().cartId;
    const userId = getOrCreateValidUserId().userId;
    // $FlowFixMe
    const currencyCode = trackingData.currencyCode || config.currencyCode;

    const img = document.createElement('img');
    img.style.display = 'none';

    const user = {
        ...config.user,
        id: userId
    };

    const deviceInfo = getDeviceInfo();
    const data = {
        ...trackingData,
        currencyCode,
        cartId,
        user,
        propertyId: config.propertyId,
        trackingType,
        clientId: getClientID(),
        merchantId: getMerchantID().join(','),
        deviceInfo,
        version: 'TRANSITION_FLAG'
    };

    // paramsToBeaconUrl is a function that gives you the ability to override the beacon url
    // to whatever you want it to be based on the trackingType string and data object.
    // This can be useful for testing purposes, this feature won't be used by merchants.
    if (config.paramsToBeaconUrl) {
        img.src = config.paramsToBeaconUrl({ trackingType, data });
    } else {
        img.src = `https://www.paypal.com/targeting/track/${ trackingType }?data=${ encodeData(data) }`;
    }

    // TODO: this will add a new image EVERY time the 'track' method is called. There's no reason
    // to clutter the DOM like this. We should replace the old image.
    if (document.body) {
        document.body.appendChild(img);
    }
};
