/* @flow */

import { getClientID, getMerchantID, getEnv } from '@paypal/sdk-client/src';
import { ENV } from '@paypal/sdk-constants/src';

export const PPTM_ID = 'xo-pptm';

function getScriptSrc() : string {
    const env = getEnv();
    const id = window.location.hostname;
    const t = 'xo';
    const mrid = getMerchantID();
    const clientId = getClientID();

    let baseUrl;

    switch (env) {
    case ENV.SANDBOX:
        baseUrl = 'https://sandbox.paypal.com/tagmanager/pptm.js';
        break;
    case ENV.STAGE:
        baseUrl = 'https://msmaster.qa.paypal.com/tagmanager/pptm.js';
        break;
    case ENV.PRODUCTION:
        baseUrl = 'https://www.paypal.com/tagmanager/pptm.js';
        break;
    default:
        baseUrl = 'http://localhost.paypal.com:8001/tagmanager/pptm.js';
    }

    let src = `${ baseUrl }?id=${ id }&t=${ t }`;

    if (mrid) {
        src += `&mrid=${ mrid }`;
    }

    if (clientId) {
        src += `&client_id=${ clientId }`;
    }

    return src;
}

function insertPptm() {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const script = document.createElement('script');
            const head = document.querySelector('head');

            const src = getScriptSrc();

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

insertPptm();
