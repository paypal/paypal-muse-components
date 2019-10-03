/* @flow */
import { getClientID, getMerchantID } from '@paypal/sdk-client/src';

import type {
    Config
} from '../types';

export const getPropertyId = ({ paramsToPropertyIdUrl } : Config) => {
    // $FlowFixMe
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
        // $FlowFixMe
        if (paramsToPropertyIdUrl) {
            url = paramsToPropertyIdUrl();
        } else {
            url = 'https://www.paypal.com/tagmanager/containers/xo';
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
