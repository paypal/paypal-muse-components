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

type Cart = {|
    cartId? : string,
    items : $ReadOnlyArray<Product>,
    emailCampaignId? : string,
    total? : string,
    currencyCode? : string
|};

type RemoveCart = {|
    cartId? : string,
    items : $ReadOnlyArray<{ id : string }>
|};

type ParamsToBeaconUrl = ({
    trackingType : TrackingType,
    data : Cart | RemoveCart | { cartId : string } | { pageUrl : string }
}) => string;

type Config = {|
    user? : {
        id : string,
        email? : string, // mandatory if unbranded cart recovery
        firstName? : string,
        lastName? : string
    },
    property? : {
        id : string
    },
    paramsToBeaconUrl? : ParamsToBeaconUrl
|};

const track = <T>(config : Config, trackingType : TrackingType, trackingData : T) : Promise<void> => {
    const encodeData = data => encodeURIComponent(btoa(JSON.stringify(data)));

    return new Promise((resolve, reject) => {
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
            img.src = `https://www.paypal.com/targeting/track/${ trackingType }?data=${ encodeData(data) }`;
        }

        img.addEventListener('load', () => resolve());
        img.addEventListener('error', reject);
        if (document.body) {
            document.body.appendChild(img);
        }
    });
};

const trackCartEvent = <T>(config : Config, cartEventType : CartEventType, trackingData : T) : Promise<void> =>
    track(config, 'cartEvent', { ...trackingData, cartEventType });

const generateId = () : string => Math.random().toString(16).slice(2);

export const Tracker = (config? : Config = { user: { id: generateId() } }) => ({
    view:           (data : { page : string, title? : string }) => track(config, 'view', data),
    addToCart:      (data : Cart) => trackCartEvent(config, 'addToCart', data),
    setCart:        (data : Cart) => trackCartEvent(config, 'setCart', data),
    removeFromCart: (data : RemoveCart) => trackCartEvent(config, 'removeFromCart', data),
    purchase:       (data : { cartId : string }) => track(config, 'purchase', data),
    setUser:        (data : { user : { id : string, email : string, firstName? : string, lastName? : string } }) => {
        config.user = config.user || { id: data.user.id };
        config.user.id = data.user.id;
        config.user.firstName = data.user.firstName;
        config.user.lastName = data.user.lastName;
        config.user.email = data.user.email;
    }
});
