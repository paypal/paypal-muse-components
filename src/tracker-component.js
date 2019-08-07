/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import { getClientID, getMerchantID } from '@paypal/sdk-client/src';

// $FlowFixMe
import generate from './generate-id';
import { getCookie, setCookie } from './lib/cookie-utils';
import getJetlore from './lib/jetlore';
import { getDeviceInfo } from './lib/get-device-info';
import { removeFromCart, addToCart } from './lib/compose-cart';

type TrackingType = 'view' | 'cartEvent' | 'purchase' | 'setUser' | 'cancelCart';

type CartEventType = 'addToCart' | 'setCart' | 'removeFromCart';

type Product = {|
    id : string,
    title? : string,
    url? : string,
    description? : string,
    imgUrl? : string,
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

type CancelCartData = {|
    cartId? : string
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

type IdentityData = {|
    mrid : string,
    onIdentification : Function,
    onError? : Function
|};

type ParamsToBeaconUrl = ({
    trackingType : TrackingType,
    data : ViewData | CartData | RemoveCartData | PurchaseData | CancelCartData
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

const storage = {
    paypalCrCart:       'paypal-cr-cart',
    paypalCrCartExpiry: 'paypal-cr-cart-expiry'
};

const sevenDays = 6.048e+8;

const accessTokenUrl = 'https://www.paypal.com/muse/api/partner-token';

const getUserIdCookie = () : ?string => {
    return getCookie('paypal-user-id') || null;
};

const setRandomUserIdCookie = () : void => {
    const ONE_MONTH_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;
    setCookie('paypal-user-id', generate.generateId(), ONE_MONTH_IN_MILLISECONDS);
};

const composeCart = (type, data) => {
    // Copy the data so we don't modify it outside the scope of this method.
    let _data = { ...data };

    // Devnote: Checking for cookie for backwards compatibility (the cookie check can be removed
    // a couple weeks after deploy because any cart cookie storage will be moved to localStorage
    // in this function).
    const storedCart = window.localStorage.getItem(storage.paypalCrCart) || getCookie(storage.paypalCrCart) || '{}';
    const expiry = window.localStorage.getItem(storage.paypalCrCartExpiry);
    const cart = JSON.parse(storedCart);
    const currentItems = cart ? cart.items : [];

    if (!expiry) {
        window.localStorage.setItem(storage.paypalCrCartExpiry, Date.now() + sevenDays);
    }

    switch (type) {
    case 'add':
        _data.items = addToCart(data.items, currentItems);
        break;
    case 'set':
        _data.items = data.items;
        break;
    case 'remove':
        _data = { ...cart, ...data };
        _data.items = removeFromCart(data.items, currentItems);
        break;
    default:
        throw new Error('invalid cart action');
    }

    window.localStorage.setItem(storage.paypalCrCart, JSON.stringify(_data));

    return _data;
};

const getAccessToken = (url : string, mrid : string) : Promise<Object> => {
    return fetch(url, {
        method:      'POST',
        credentials: 'include',
        headers:     {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            mrid,
            clientId: getClientID()
        })
    }).then(r => r.json()).then(data => {
        return data;
    });
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

const clearExpiredCart = () => {
    const expiry = window.localStorage.getItem(storage.paypalCrCartExpiry);

    if (expiry !== null) {
        const expiryTime = Number(expiry);

        if (Date.now() >= expiryTime) {
            window.localStorage.removeItem(storage.paypalCrCartExpiry);
            window.localStorage.removeItem(storage.paypalCrCart);
        }
    }
};

export const Tracker = (config? : Config = defaultTrackerConfig) => {
    /*
     * Use the get param ?ppDebug=true to see logs
     *
     */
    
    const currentUrl = new URL(window.location.href);
    const debug = currentUrl.searchParams.get('ppDebug');

    if (debug) {
        // eslint-disable-next-line no-console
        console.log('PayPal Shopping: debug mode on.');
    }
    
    clearExpiredCart();

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
        view:       (data : ViewData) => () => {}, // eslint-disable-line no-unused-vars,no-empty-function
        addToCart:  (data : CartData) => {
            const newCart = composeCart('add', data);

            return trackCartEvent(config, 'addToCart', newCart);
        },
        setCart:        (data : CartData) => {
            const newCart = composeCart('set', data);

            return trackCartEvent(config, 'setCart', newCart);
        },
        removeFromCart: (data : RemoveCartData) => {
            composeCart('remove', data);

            trackCartEvent(config, 'removeFromCart', data);
        },
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
        cancelCart:     (data : CancelCartData) => track(config, 'cancelCart', data),
        setPropertyId:  (id : string) => {
            config.propertyId = id;
        },
        getIdentity: (data : IdentityData, url? : string = accessTokenUrl) : Promise<Object> => {
            return getAccessToken(url, data.mrid)
                .then(accessToken => {
                    if (accessToken.data) {
                        if (data.onIdentification) {
                            data.onIdentification({ getAccessToken: () => accessToken.data });
                        }
                    } else {
                        if (data.onError) {
                            data.onError({
                                message: 'No token could be created',
                                error:   accessToken
                            });
                        }
                    }
                    return accessToken;

                }).catch(err => {
                    if (data.onError) {
                        data.onError({
                            message: 'No token could be created',
                            error:   err
                        });
                    }

                    return {};
                });
        }
    };

    // To disable functions, refer to this PR:
    // https://github.com/paypal/paypal-muse-components/commit/b3e76554fadd72ad24b6a900b99b8ff75af08815
    const trackerFunctions = trackers;

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
        return window.fetch(url, {
            method:      'POST',
            credentials: 'include',
            headers:     {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                merchantId: getMerchantID()[0],
                clientId:   getClientID()
            })
        }).then(res => {
            if (res.status !== 200) {
                return false;
            }
            return res.json();
        }).then(data => {
            if (!data) {
                const failurePayload = { success: false };
                return cb ? cb(failurePayload) : failurePayload;
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
        ...trackerFunctions,
        track: trackEvent,
        identify,
        getJetlorePayload
    };
};
