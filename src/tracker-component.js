/* @flow */

import { getClientID, getMerchantID } from '@paypal/sdk-client/src';

type TrackingType = 'view' | 'cartEvent' | 'purchase';

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
        id : string,
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
        id : string,
        email? : string, // mandatory if unbranded cart recovery
        name? : string
    |},
    property? : {|
        id : string
    |},
    paramsToBeaconUrl? : ParamsToBeaconUrl
|};

const track = <T>(config : Config, trackingType : TrackingType, trackingData : T) => {
    const encodeData = data => encodeURIComponent(btoa(JSON.stringify(data)));

    const img = document.createElement('img');
    img.style.display = 'none';

    const data = {
        ...trackingData,
        user:       config.user,
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
        img.src = `https://targetingnodeweb19125146982616.qa.paypal.com/targeting/track/${ trackingType }?data=${ encodeData(data) }`;
    }

    if (document.body) {
        document.body.appendChild(img);
    }
};

const trackCartEvent = <T>(config : Config, cartEventType : CartEventType, trackingData : T) =>
    track(config, 'cartEvent', { ...trackingData, cartEventType });

const generateId = () : string => Math.random().toString(16).slice(2);

export const Tracker = (config? : Config = { user: { id: generateId() } }) => ({
    view:           (data : ViewData) => track(config, 'view', data),
    addToCart:      (data : CartData) => trackCartEvent(config, 'addToCart', data),
    setCart:        (data : CartData) => trackCartEvent(config, 'setCart', data),
    removeFromCart: (data : RemoveCartData) => trackCartEvent(config, 'removeFromCart', data),
    purchase:       (data : PurchaseData) => track(config, 'purchase', data),
    setUser:        (data : UserData) => {
        config.user = config.user || { id: data.user.id };
        config.user.id = data.user.id;
        config.user.email = data.user.email;
        const today = new Date();
        const expires = new Date(
            today.getFullYear() + 1,
            today.getMonth(),
            today.getDate()
            // $FlowFixMe
        ).toGMTString();
        document.cookie = `paypal-cr-user=${ data.user.email };expires=${ expires }`;
        // $FlowFixMe
        config.user.name = data.user.name;
    },
    setProperty:    (data : PropertyData) => {
        config.property = { id: data.property.id };
    }
});
