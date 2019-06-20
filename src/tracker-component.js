/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import { getClientID, getMerchantID } from '@paypal/sdk-client/src';

// $FlowFixMe
import generate from './generate-id';
import { getCookie, setCookie } from './lib/cookie-utils';
import getJetlore from './lib/jetlore';
import { getDeviceInfo } from './lib/get-device-info';

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

type ParamsToBeaconUrl = ({
    trackingType : TrackingType,
    data : ViewData | CartData | RemoveCartData | PurchaseData
}) => string;

type ParamsToTokenUrl = () => string;

type JetloreConfig = {|
    user_id : string,
    cid : string,
    feed_id : string,
    div? : string,
    lang? : string
|};

type Config = {|
    user? : {|
        email? : string, // mandatory if unbranded cart recovery
        name? : string
    |},
    propertyId? : string,
    paramsToBeaconUrl? : ParamsToBeaconUrl,
    paramsToTokenUrl? : ParamsToTokenUrl,
    jetlore? : {|
        user_id : string,
        access_token : string,
        feed_id : string,
        div? : string,
        lang? : string
    |}
|};

const sevenDays = 6.048e+8;

const getUserIdCookie = () : ?string => {
    return getCookie('paypal-user-id') || null;
};

const setRandomUserIdCookie = () : void => {
    const ONE_MONTH_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;
    setCookie('paypal-user-id', generate.generateId(), ONE_MONTH_IN_MILLISECONDS);
};

const setCartCookie = (type, data) : void => {
    const currentCookie = getCookie('paypal-cr-cart');
    if (type === 'add' && currentCookie !== '') {
        const parsedCookie = JSON.parse(currentCookie);
        const currentItems = parsedCookie && parsedCookie.items;
        if (currentItems && currentItems.length) {
            data.items = [
                ...currentItems,
                ...data.items
            ];
        }
    }
    setCookie('paypal-cr-cart', JSON.stringify(data), sevenDays);
};

const getJetlorePayload = (type : string, options : Object) : Object => {
    const { payload } = options;
    switch (type) {
    case 'addToCart':
    case 'removeFromCart':
        return {
            deal_id:   payload.deal_id,
            option_id: payload.option_id,
            count:     payload.count,
            price:     payload.price
        };
    case 'purchase':
        return {
            deal_id:   payload.deal_id,
            option_id: payload.option_id,
            count:     payload.count
        };
    case 'search':
        return {
            text: payload.text
        };
    case 'view':
        return {
            deal_id:   payload.deal_id,
            option_id: payload.option_id
        };
    case 'browse_section':
        return {
            name:        payload.name,
            refinements: payload.refinements
        };
    case 'browse_promo':
        return {
            name: payload.name,
            id:   payload.id
        };
    case 'addToWishList':
    case 'removeFromWishList':
    case 'addToFavorites':
    case 'removeFromFavorites':
    case 'track':
        return payload;
    default:
        return {};
    }
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
    const deviceInfo = getDeviceInfo();
    const data = {
        ...trackingData,
        user,
        propertyId:   config.propertyId,
        trackingType,
        clientId:   getClientID(),
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

const trackCartEvent = <T>(config : Config, cartEventType : CartEventType, trackingData : T) =>
    track(config, 'cartEvent', { ...trackingData, cartEventType });

const defaultTrackerConfig = { user: { email: undefined, name: undefined } };

export const Tracker = (config? : Config = defaultTrackerConfig) => {
    const JL = getJetlore();
    const jetloreTrackTypes = [
        'view',
        'addToCart',
        'removeFromCart',
        'purchase',
        'search',
        'browse_section',
        'addToWishList',
        'removeFromWishList',
        'addToFavorites',
        'removeFromFavorites',
        'track'
    ];
    if (config.jetlore) {
        const {
            user_id,
            access_token,
            feed_id,
            div,
            lang
        } = config && config.jetlore;
        const trackingConfig : JetloreConfig = {
            cid: access_token,
            user_id,
            feed_id
        };
        if (!div) {
            trackingConfig.div = div;
        }
        if (!lang) {
            trackingConfig.lang = lang;
        }
        JL.tracking(trackingConfig);
    }
    const trackers = {
        view:       (data : ViewData) => track(config, 'view', data),
        addToCart:  (data : CartData) => {
            setCartCookie('add', data);
            return trackCartEvent(config, 'addToCart', data);
        },
        setCart:        (data : CartData) => {
            setCartCookie('set', data);
            return trackCartEvent(config, 'setCart', data);
        },
        removeFromCart: (data : RemoveCartData) => trackCartEvent(config, 'removeFromCart', data),
        purchase:       (data : PurchaseData) => track(config, 'purchase', data),
        setUser:        (data : UserData) => {
            config = {
                ...config,
                user: {
                    ...config.user,
                    email: data.user.email || ((config && config.user) || {}).email,
                    name:  data.user.name || ((config && config.user) || {}).name
                }
            };
            track(config, 'setUser', { oldUserId: getUserIdCookie() });
        },
        setPropertyId: (id : string) => {
            config.propertyId = id;
        }
    };
    const trackEvent = (type : string, data : Object) => {
        const isJetloreType = config.jetlore
            ? jetloreTrackTypes.includes(type)
            : false;
        if (config.jetlore && isJetloreType && data) {
            const jlData = getJetlorePayload(type, data);
            JL.tracker[type](jlData);
        }
        if (trackers[type]) {
            trackers[type](data);
        }
    };
    const identify = (cb? : function) => {
        let url;
        if (config.paramsToTokenUrl) {
            url = config.paramsToTokenUrl();
        } else {
            url = 'https://paypal.com/muse/api/partner-token';
        }
        const resp = window.fetch(url, {
            method:      'POST',
            credentials: 'include',
            headers:     {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                merchantId: getMerchantID()[0],
                clientId:   getClientID()
            })
        });
        return resp.then(res => {
            const failurePayload = { success: false };
            if (res.status !== 202) {
                return cb ? cb(failurePayload) : failurePayload;
            }
            return res.json();
        }).then(data => {
            if (!data) {
                return null;
            }
            const identityPayload = {
                ...data,
                success: true
            };
            return cb ?  cb(identityPayload) : identityPayload;
        });
    };
    return {
        // bringing in tracking functions for backwards compatibility
        ...trackers,
        track: trackEvent,
        identify,
        getJetlorePayload
    };
};
