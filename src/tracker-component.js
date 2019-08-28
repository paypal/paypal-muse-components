/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import { getClientID, getMerchantID } from '@paypal/sdk-client/src';

// $FlowFixMe
import { getUserIdCookie } from './lib/cookie-utils';
import getJetlore from './lib/jetlore';
import { composeCart } from './lib/compose-cart';
import { track } from './lib/track';
import {
    accessTokenUrl,
    storage
} from './lib/constants';
import type {
    CartEventType,
    ViewData,
    CartData,
    CancelCartData,
    RemoveCartData,
    PurchaseData,
    UserData,
    IdentityData,
    JetloreConfig,
    Config
} from './lib/types';

const getAccessToken = (url : string, mrid : string) : Promise<Object> => {
    return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
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
            deal_id: payload.deal_id,
            option_id: payload.option_id,
            count: payload.count,
            price: payload.price
        };
    case 'purchase':
        return {
            deal_id: payload.deal_id,
            option_id: payload.option_id,
            count: payload.count
        };
    case 'search':
        return {
            text: payload.text
        };
    case 'view':
        return {
            deal_id: payload.deal_id,
            option_id: payload.option_id
        };
    case 'browse_section':
        return {
            name: payload.name,
            refinements: payload.refinements
        };
    case 'browse_promo':
        return {
            name: payload.name,
            id: payload.id
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

let trackEventQueue = [];

// eslint-disable-next-line flowtype/no-weak-types
export const clearTrackQueue = (config : Config, queue : any) => {
    // eslint-disable-next-line array-callback-return
    return queue.filter(([ trackingType, trackingData ]) => {
        track(config, trackingType, trackingData, trackEventQueue);
    });
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

const getPropertyId = ({ paramsToPropertyIdUrl }) => {
    return new Promise(resolve => {
        const clientId = getClientID();
        const merchantId = getMerchantID()[0];
        const propertyIdKey = `property-id-${ clientId }-${ merchantId }`;
        const savedPropertyId = window.localStorage.getItem(propertyIdKey);
        const currentUrl = `${ window.location.protocol }//${ window.location.host }`;
        if (savedPropertyId) {
            return resolve(savedPropertyId);
        }
        let url;
        if (paramsToPropertyIdUrl) {
            url = paramsToPropertyIdUrl();
        } else {
            url = 'https://paypal.com/tagmanager/containers/xo';
        }
        return window.fetch(`${ url }?mrid=${ merchantId }&url=${ encodeURIComponent(currentUrl) }`)
            .then(res => {
                if (res.status === 200) {
                    return res;
                }
            })
            .then(r => r.json()).then(container => {
                window.localStorage.setItem(propertyIdKey, container.id);
                resolve(container.id);
            })
            .catch(() => {
                // doing nothing for now since there's no logging
            });
    });
};

export const setImplicitPropertyId = (config : Config) => {
    /*
    ** this is used for backwards compatibility
    ** we do not want to overwrite a propertyId if propertyId
    ** has already been set using the SDK
    */
    if (config.propertyId) {
        return;
    }
    getPropertyId(config).then(propertyId => {
        config.propertyId = propertyId;
        if (trackEventQueue.length) {
            trackEventQueue = clearTrackQueue(config, trackEventQueue);
        }
    });
};
const clearCancelledCart = () => {
    window.localStorage.removeItem(storage.paypalCrCartExpiry);
    window.localStorage.removeItem(storage.paypalCrCart);
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
        view: (data : ViewData) => () => {}, // eslint-disable-line no-unused-vars,no-empty-function
        addToCart: (data : CartData) => {
            const newCart = composeCart('add', data);

            return trackCartEvent(config, 'addToCart', newCart);
        },
        setCart: (data : CartData) => {
            const newCart = composeCart('set', data);

            return trackCartEvent(config, 'setCart', newCart);
        },
        removeFromCart: (data : RemoveCartData) => {
            composeCart('remove', data);

            trackCartEvent(config, 'removeFromCart', data);
        },
        purchase: (data : PurchaseData) => track(config, 'purchase', data, trackEventQueue),
        setUser: (data : UserData) => {
            config = {
                ...config,
                user: {
                    ...config.user,
                    email: data.user.email || ((config && config.user) || {}).email,
                    name: data.user.name || ((config && config.user) || {}).name
                }
            };
            track(config, 'setUser', { oldUserId: getUserIdCookie() }, trackEventQueue);
        },
        cancelCart: (data : CancelCartData) => {
            clearCancelledCart();
            track(config, 'cancelCart', data, trackEventQueue);
        },
        setPropertyId: (id : string) => {
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
                                error: accessToken
                            });
                        }
                    }
                    return accessToken;

                }).catch(err => {
                    if (data.onError) {
                        data.onError({
                            message: 'No token could be created',
                            error: err
                        });
                    }

                    return {};
                });
        }
    };
    setImplicitPropertyId(config);

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
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                merchantId: getMerchantID()[0],
                clientId: getClientID()
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
