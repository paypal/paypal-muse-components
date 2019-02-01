/* @flow */

import { getClientID, getMerchantID, getEnv } from '@paypal/sdk-client/src';
import { ENV } from '@paypal/sdk-constants/src';

export const PPTM_ID = 'xo-pptm';
export const BASE_URL_SANDBOX = 'https://sandbox.paypal.com/tagmanager/pptm.js';
export const BASE_URL_STAGE = 'https://msmaster.qa.paypal.com/tagmanager/pptm.js';
export const BASE_URL_PRODUCTION = 'https://www.paypal.com/tagmanager/pptm.js';
export const BASE_URL_LOCAL = 'http://localhost.paypal.com:8001/tagmanager/pptm.js';

/*
Generates a URL for pptm.js, e.g. http://localhost:80001/tagmanager/pptm.js?id=www.merchant-site.com&t=xo&mrid=xyz&client_id=abc
*/
export function getScriptSrc(env : string, mrid : ?string, clientId : ?string, url : string) : string {
    // "xo" is a checkout container
    const type = 'xo';

    let baseUrl;

    switch (env) {
    case ENV.SANDBOX:
        baseUrl = BASE_URL_SANDBOX;
        break;
    case ENV.STAGE:
        baseUrl = BASE_URL_STAGE;
        break;
    case ENV.PRODUCTION:
        baseUrl = BASE_URL_PRODUCTION;
        break;
    default:
        baseUrl = BASE_URL_LOCAL;
    }

    let src = `${ baseUrl }?id=${ url }&t=${ type }`;

    // Optional in the payments SDK, but if it's here, we'll prefer
    // to query pptm.js by the mrid.
    if (mrid) {
        src += `&mrid=${ mrid }`;
    }

    // Technically, this is required by the Payments SDK
    if (clientId) {
        src += `&client_id=${ clientId }`;
    }

    return src;
}

export function insertPptm() {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const mrid = getMerchantID();
            const clientId = getClientID();
            const url = window.location.hostname;
            const env = getEnv();
            const script = document.createElement('script');
            const head = document.querySelector('head');

            const src = getScriptSrc(env, mrid, clientId, url);

            script.src = src;

            script.id = PPTM_ID;

            script.async = true;

            if (head) {
                head.appendChild(script);
            }
        } catch (err) {
            window.console.error(err);
        }
    });
}

// Automatically insert pptm.js script
insertPptm();
