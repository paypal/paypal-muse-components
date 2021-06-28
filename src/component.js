/* @flow */

import { getClientID, getMerchantID, getPayPalDomain, getVersion, isPayPalDomain, getEventEmitter, getDebug, getEnv, getVault, getSDKQueryParam } from '@paypal/sdk-client/src';
import { UNKNOWN, ENV } from '@paypal/sdk-constants/src';

import { logger } from './lib/logger';

export const PPTM_ID = 'xo-pptm';

const SHOPPING_COMPONENT = 'shopping';


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

  /*
    Add components query param passed to sdk
    Documentation - https://developer.paypal.com/docs/checkout/reference/customize-sdk/#components
    sample values (comma separated) - hosted-fields, buttons, marks, messages
  */
  if (getSDKQueryParam('components')) {
    src += `&comp=${ String(getSDKQueryParam('components')) }`;
  }
  
  /*
    Add the vault query passed to sdk
    Documentation - https://developer.paypal.com/docs/checkout/reference/customize-sdk/#vault
  */
  src += `&vault=${ String(getVault()) }`;
  
  
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

function _getComponents() : $ReadOnlyArray<string> {
  return (getSDKQueryParam('components') || '').toLowerCase().split(',');
}


function _isShoppingSdkComponent() : boolean {
  const components = _getComponents();
  return components.indexOf(SHOPPING_COMPONENT) >= 0;
}


// Inserts the pptm.js script tag. This is the `setupHandler` in __sdk__.js and will be called automatically
// when the made SDK is initialized.
export function insertPptm(env : string = getEnv(), isDebug : boolean = getDebug()) {
  try {
    // When merchants use checkout buttons, they'll include the payments SDK on their
    // website, and then it'll render an iframe from the PayPal domain which will in turn
    // initialize the SDK again. We don't want to insert another pptm.js on the paypal.com
    // domain, though.

    // We do not want to load pptm.js for shopping component. Merchant may always add muse, checkout button  to load pptms.js if neeeded.
    // However, shopping component will be a replacement of pptm.js. Some merchant may use it to publish store cash events.
    // https://engineering.paypalcorp.com/jira/browse/DTSHOPSDK-295
    
    if ((!_isPayPalDomain()) && (!_isShoppingSdkComponent())) {
      // https://engineering.paypalcorp.com/jira/browse/PPPLMER-79439
      // When merchants test the SDK using a sandbox client ID, it pulls in tagmanager/pptm.js
      // and that code makes calls to QA FPTI since it infers the environment as sandbox.
      // These calls fail on the public internet, so we only want to make these calls
      // if __DEBUG__ is manually set to true.
      if (env === ENV.SANDBOX && isDebug !== true) {
        return;
      }

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
    logger.error('insertPPTM', err);
  }
}

function listenForButtonRender() {
  getEventEmitter().on('button_render', () => {
    window.paypalDDL = window.paypalDDL || [];
    const buttonRenderEvent = window.paypalDDL.filter(e => e.event === 'paypalButtonRender');
    if (buttonRenderEvent.length === 0) {
      window.paypalDDL.push({ event: 'paypalButtonRender' });
    }
  });
}

export function setup() {
  insertPptm(getEnv(), getDebug());
  listenForButtonRender();
}
