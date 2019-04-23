/* @flow */

import { getClientID, getMerchantID, getPayPalDomain, getVersion, isPayPalDomain, getEnv } from '@paypal/sdk-client/src';
import { UNKNOWN } from '@paypal/sdk-constants/src';

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

    const baseUrl = `${ paypalDomain }/tagmanager/pptm.js`;

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

function parseMerchantId() : ?string {
    const merchantId = getMerchantID();

    if (!merchantId.length || merchantId[0] === UNKNOWN) {
        return;
    }

    return merchantId[0];
}

function _isPayPalDomain() : boolean {
    return window.mockDomain === 'mock://www.paypal.com' || isPayPalDomain();
}

// Inserts the pptm.js script tag. This is the `setupHandler` in __sdk__.js and will be called automatically
// when the made SDK is initialized.
export function insertPptm() {
    try {
        // When merchants use checkout buttons, they'll include the payments SDK on their
        // website, and then it'll render an iframe from the PayPal domain which will in turn
        // initialize the SDK again. We don't want to insert another pptm.js on the paypal.com
        // domain, though.
        if (!_isPayPalDomain()) {
            const mrid = parseMerchantId();
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
        }
    } catch (err) {
        window.console.error(err);
    }
}

export function setup() {
    document.addEventListener('DOMContentLoaded', insertPptm);

    const clientId = getClientID();
    const merchantId = parseMerchantId();

    const clientIdQuery = clientId ? `clientId=${ encodeURIComponent(clientId) }` : '';
    const merchantIdQuery = merchantId ? `merchantId=${ encodeURIComponent(merchantId) }` : '';
    const ampersand = clientId && merchantId ? '&' : '';

    const musenodewebUri = getEnv().toLowerCase() !== 'production'
        ? decodeURIComponent(new URLSearchParams(location.search).get('musenodewebUri'))
        : undefined;

    const src =  musenodewebUri ? musenodewebUri : 'www.paypal.com/muse/api/merchant-list/add';
    const query = `${ clientIdQuery }${ ampersand }${ merchantIdQuery }`;
    const beaconImage = new window.Image();

    beaconImage.src = `${ src }?${ query }`;
}
