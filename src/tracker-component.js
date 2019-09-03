/* @flow */
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

import { getClientID, getMerchantID } from '@paypal/sdk-client/src';

// $FlowFixMe
import {
    validateAddItems,
    validateRemoveItems,
    validateUser
} from './lib/input-validation';
import { getUserIdCookie } from './lib/cookie-utils';
import { getOrCreateValidCartId, setCartId, createNewCartId } from './lib/local-storage-utils';
import { getPropertyId } from './lib/get-property-id';
import getJetlore from './lib/jetlore';
import { track } from './lib/track';
import constants from './lib/constants';
import type {
    CartEventType,
    TrackingType,
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

const {
    accessTokenUrl,
    defaultTrackerConfig
} = constants;

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

export const clearTrackQueue = (config : Config) => {
    // TODO: replace 'filter' with 'forEach'
    // $FlowFixMe
    return trackEventQueue.filter(([ trackingType, trackingData ]) => { // eslint-disable-line array-callback-return
        track(config, trackingType, trackingData);
    });
};

export const trackEvent = <T>(config : Config, trackingType : TrackingType, trackingData : T) => {
    // CartId can be set by any event if it is provided
    // $FlowFixMe
    if (trackingData.cartId) {
        setCartId(trackingData.cartId);
    }

    // Events cannot be fired without a propertyId. We add events
    // to a queue if a propertyId has not yet been returned.
    if (!config.propertyId) {
        trackEventQueue.push([ trackingType, trackingData ]);
        return;
    }

    track(config, trackingType, trackingData);
};

const trackCartEvent = <T>(config : Config, cartEventType : CartEventType, trackingData : T) =>
    trackEvent(config, 'cartEvent', { ...trackingData, cartEventType });

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
            trackEventQueue = clearTrackQueue(config);
        }
    });
};

// $FlowFixMe
export const Tracker = (config? : Config = {}) => {
    // $FlowFixMe
    config = { ...defaultTrackerConfig, ...config };
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
    
    getOrCreateValidCartId();

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
            try {
                validateAddItems(data);
                return trackCartEvent(config, 'addToCart', data);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err.message);
            }
        },
        setCart: (data : CartData) => {
            try {
                validateAddItems(data);
                return trackCartEvent(config, 'setCart', data);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err.message);
            }
        },
        setCartId: (cartId : string) => setCartId(cartId),
        removeFromCart: (data : RemoveCartData) => {
            try {
                validateRemoveItems(data);
                return trackCartEvent(config, 'removeFromCart', data);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err.message);
            }
        },
        purchase: (data : PurchaseData) => trackEvent(config, 'purchase', data),
        cancelCart: (data : CancelCartData) => {
            const event = trackEvent(config, 'cancelCart', data);
            // a new id can only be created AFTER the 'cancel' event has been fired
            createNewCartId();
            return event;
        },
        setUser: (data : UserData) => {
            try {
                validateUser(data)
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err.message)
                return
            }

            const user = data.user || data;
            const configUser = config.user || {};

            const userId = user.id !== undefined ? user.id : configUser.id;
            const userEmail = user.email !== undefined ? user.email : configUser.email;
            const userName = user.name !== undefined ? user.name : configUser.name;

            config = {
                ...config,
                user: {
                    id: userId,
                    email: userEmail,
                    name: userName
                }
            };

            trackEvent(config, 'setUser', { oldUserId: getUserIdCookie() });
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

    const trackEventByType = (type : string, data : Object) => {
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
        track: trackEventByType,
        identify,
        getJetlorePayload
    };
};
