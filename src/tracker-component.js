/* @flow */

import { getClientID, getMerchantID } from '@paypal/sdk-client/src';

import { generateId } from './generate-id';
import { getCookie, setCookie } from './lib/cookie-utils';

type TrackingType = 'view' | 'cartEvent' | 'purchase' | 'setUser';

type CartEventType = 'addToCart' | 'setCart' | 'removeFromCart';

type Product = {|
    id : string,
    title? : string,
    url? : string,
    description? : string,
    imageUrl? : string,
    otherImages? : $ReadOnlyArray<string>,
    keywords? : $ReadOnlyArray<string>,
    price? : string,
    quantity? : string
|};

type ViewData = {| page : string, title? : string |};

type CartData = {|
    cartId? : string,
    items : $ReadOnlyArray<Product>,
    emailCampaignId? : string,
    total? : string,
    currencyCode? : string
|};

type RemoveCartData = {|
    cartId? : string,
    items : $ReadOnlyArray<{ id : string }>
|};

type PurchaseData = {| cartId : string |};

type UserData = {|
    user : {|
        email : string,
        name? : string
    |}
|};

type PropertyData = {|
    property : {|
        id : string
    |}
|};

type ParamsToBeaconUrl = ({
    trackingType : TrackingType,
    data : ViewData | CartData | RemoveCartData | PurchaseData
}) => string;

type Config = {|
    user? : {|
        email? : string, // mandatory if unbranded cart recovery
        name? : string
    |},
    property? : {|
        id : string
    |},
    paramsToBeaconUrl? : ParamsToBeaconUrl,
    isPaypalUser : boolean
|};

const sevenDays = 6.048e+8;

const getUserIdCookie = () : ?string => {
    return getCookie('paypal-user-id') || null;
};

const setRandomUserIdCookie = () : void => {
    const ONE_MONTH_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;
    setCookie('paypal-user-id', generateId(), ONE_MONTH_IN_MILLISECONDS);
};

const track = <T>(config : Config, trackingType : TrackingType, trackingData : T) => {
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

    const data = {
        ...trackingData,
        user,
        property:   config.property,
        trackingType,
        clientId:   getClientID(),
        merchantId: getMerchantID()
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

const trackCartEvent = <T>(config : Config, cartEventType : CartEventType, trackingData : T) =>
    track(config, 'cartEvent', { ...trackingData, cartEventType });

export const Tracker = (config? : Config = { user: { email: undefined, name: undefined } }) => ({
    view:           (data : ViewData) => track(config, 'view', data),
    addToCart:      (data : CartData) => {
        setCookie('paypal-cr-cart', JSON.stringify(data), sevenDays);
        return trackCartEvent(config, 'addToCart', data);
    },
    setCart:        (data : CartData) => trackCartEvent(config, 'setCart', data),
    removeFromCart: (data : RemoveCartData) => trackCartEvent(config, 'removeFromCart', data),
    purchase:       (data : PurchaseData) => track(config, 'purchase', data),
    setUser:        (data : UserData, isPaypalUser : boolean = false) => {
        config = {
            ...config,
            user: {
                ...config.user,
                email: data.user.email || ((config && config.user) || {}).email,
                name:  data.user.name || ((config && config.user) || {}).name
            },
            isPaypalUser
        };
        track(config, 'setUser', { oldUserId: getUserIdCookie() });
    },
    setProperty: (data : PropertyData) => {
        config.property = { id: data.property.id };
    }
});
