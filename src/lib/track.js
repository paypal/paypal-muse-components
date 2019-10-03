/* @flow */
import { getClientID, getMerchantID } from '@paypal/sdk-client/src';

import type {
    Config,
    EventType,
    CartData,
    RemoveCartData,
    PurchaseData
} from '../types';

import { getOrCreateValidCartId, getOrCreateValidUserId } from './local-storage-utils';
import { getDeviceInfo } from './get-device-info';


const createTrackingImg = src => {
    const beaconImage = new window.Image();
    beaconImage.src = src;
};

export const track = (
    config : Config,
    trackingType : EventType,
    trackingData : CartData | RemoveCartData | PurchaseData
) => {
    const encodeData = data => encodeURIComponent(btoa(JSON.stringify(data)));
    const cartId = getOrCreateValidCartId().cartId;
    const userId = getOrCreateValidUserId().userId;
    const currencyCode = trackingData.currencyCode || config.currencyCode;

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

    let src;
    // paramsToBeaconUrl is a function that gives you the ability to override the beacon url
    // to whatever you want it to be based on the trackingType string and data object.
    // This can be useful for testing purposes, this feature won't be used by merchants.
    if (config.paramsToBeaconUrl) {
        src = config.paramsToBeaconUrl({ trackingType, data });
    } else {
        src = `https://www.paypal.com/targeting/track/${ trackingType }?data=${ encodeData(data) }`;
    }

    // Send tracking info via image url
    createTrackingImg(src);
};
