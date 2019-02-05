/* @flow */

import { getClientID, getMerchantID, getEnv, getPayPalDomain, getVersion, getPort } from '@paypal/sdk-client/src';
import { ENV } from '@paypal/sdk-constants/src';

export const PPTM_ID = 'xo-pptm';

/*
Generates a URL for pptm.js, e.g. http://localhost:8001/tagmanager/pptm.js?id=www.merchant-site.com&t=xo&mrid=xyz&client_id=abc
*/
export function getPptmScriptSrc(paypalDomain : string, mrid : ?string, clientId : ?string, url : string) : string {
    // "xo" is a checkout container
    const type = 'xo';

    // We send this so that we know what version of the Payments SDK the request originated from.
    const version = getVersion();

    const source = 'payments_sdk';

    let baseUrl = `${ paypalDomain }/tagmanager/pptm.js`;

    // For local testing, we need to hit pptm.js on a different port.
    if (getEnv() === ENV.LOCAL) {
        baseUrl = baseUrl.replace(`${ getPort() }`, '8001');
    }

    let src = `${ baseUrl }?id=${ url }&t=${ type }&v=${ version }&source=${ source }`;

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

// Inserts the pptm.js script tag. This is the `setupHandler` in __sdk__.js and will be called automatically
// when the made SDK is initialized.
export function insertPptm() {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const mrid = getMerchantID();
            const clientId = getClientID();
            const url = window.location.hostname;
            const paypalDomain = getPayPalDomain();
            const script = document.createElement('script');
            const head = document.querySelector('head');

            const src = getPptmScriptSrc(paypalDomain, mrid, clientId, url);

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
