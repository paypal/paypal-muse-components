/* @flow */

import { getClientID, getMerchantID } from '@paypal/sdk-client/src';

type TrackingType = 'view' | 'cartEvent' | 'purchase';

type CartEventType = 'addToCart' | 'setCart' | 'removeFromCart';

type Product = {|
    id : string,
    url : string,
    sku? : string,
    name? : string,
    description? : string,
    imgUrl? : string,
    otherImages? : $ReadOnlyArray<string>
|};

type Cart = {|
    cartId? : string,
    items : $ReadOnlyArray<Product>,
    emailCampaignId? : string,
    price? : number,
    currencyCode? : string,
    keywords? : $ReadOnlyArray<string>
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
    user : {
        id : string,
        email? : string, // mandatory if unbranded cart recovery
        name? : string
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

        if (config.paramsToBeaconUrl) {
            img.src = config.paramsToBeaconUrl({ trackingType, data });
        } else {
            img.src = `https://api.keen.io/3.0/projects/5b903f6ec9e77c00013bc6a7/events/${ trackingType }?api_key=700B56FBE7A2A6BD845B82F9014ED6628943091AD5B0A5751C3027CFE8C5555448C6E11302BD769FCC5BDD003C3DE8282C4FC8FE279A0AAC866F2C97010468197B98779B872EFD7EE980D2986503B843DA3797C750DAA00017DC8186078EADA6&data=${ encodeData(data) }`;
            // img.src = `https://paypal.com/targeting/track?trackingType=${ trackingType }&data=${ encodeData(data) }`;
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

export const Tracker = (config : Config) => ({
    view:           (data : { pageUrl : string }) => track(config, 'view', data),
    addToCart:      (data : Cart) => trackCartEvent(config, 'addToCart', data),
    setCart:        (data : Cart) => trackCartEvent(config, 'setCart', data),
    removeFromCart: (data : RemoveCart) => trackCartEvent(config, 'removeFromCart', data),
    purchase:       (data : { cartId : string }) => track(config, 'purchase', data),
    setUser:        (data : { user : { id : string, name? : string, email? : string } }) => {
        config.user.id = data.user.id;
        config.user.name = data.user.name;
        config.user.email = data.user.email;
    }
});
