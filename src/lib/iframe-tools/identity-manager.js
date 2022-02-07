/* @flow */
import { setIdentity, getIdentity } from '../local-storage';
import { getDeviceInfo } from '../get-device-info';
import { logger } from '../logger';
import { debugLogger } from '../debug-console-logger';
import constants from '../constants';

import { IframeManager } from './iframe-manager';


const { IDENTITY_MESSAGES } = constants;

/**
 * Make a call to VPNS by loading the identity iframe and
 * try to do our own identifying of the user. Store this in the local storage.
 *
 * The call to VPNS is done by loading an iframe specific to identity which loads
 * identity.js (probably from musenodeweb) which calls VPNS.
 *
 * Store the result from VPNS in the local storage.
 */

function noop() {}
export class IdentityManager extends IframeManager {
  constructor(config, completionListener = noop) {
    let iframeUrl;


    if (config.paramsToIdentityUrl) {
      iframeUrl = config.paramsToIdentityUrl();
    } else {
      iframeUrl = 'https://www.paypal.com/muse/identity/v2/index.html';
    }
    debugLogger.log('[identity-manager:constructor] Using iframe url:', iframeUrl);
    super({ src: iframeUrl });

    this.addMessageListener(this.storeIdentity);
    this.addMessageListener(this.logIframeError);
    this.completionListener = completionListener;
  }

  onIframeLoad = () => {
    debugLogger.log('[identity-manager:onIframeLoad] Iframe loaded.');
    this.fetchIdentity();
  }

  logIframeError = (e) => {
    if (e.data.type !== 'fetch_identity_error') {
      return;
    }
    this.completionListener(null, e);
    debugLogger.log('[identity-manager:logIframeError] Identity iframe error:', e.data.payload);
    logger.error('identity iframe error:', e.data.payload);
  }

  storeIdentity = (e) => {
    if (e.data.type !== 'fetch_identity_response') {
      return;
    }

    const identity = e.data.payload;
    debugLogger.log('[identity-manager:storeIdentity] Fetch identity response. Received: ', identity);
    setIdentity(identity);
    this.completionListener(identity, null);
  }

  fetchCountry = () => {
    return new Promise((resolve) => {
      this.addMessageListener(({ data: { type, payload } }) => {
        if (type === IDENTITY_MESSAGES.USER_COUNTRY_MESSAGE) {
          resolve(payload);
        }
      });

      this.iframe.contentWindow.postMessage({
        type: IDENTITY_MESSAGES.USER_COUNTRY_MESSAGE
      }, this.url.origin);
    });
  }

  fetchIdentity = () => {
    const cachedIdentity = getIdentity();

    if (cachedIdentity) {
      debugLogger.log('[identity-manager:fetchIdentity] Fetch identity found in cache:', cachedIdentity);
      this.completionListener(cachedIdentity, null);
      return;
    }

    debugLogger.log('[identity-manager:fetchIdentity] Fetch country request.');
    this.fetchCountry().then((country) => {

      debugLogger.log('[identity-manager:fetchIdentity] Fetch identity request. Country:', country);
      this.fetchUserInfo(country);
    });
  }

  fetchUserInfo = (country) => {
    /* Do not fetch if identity data
    has recently be cached. */
    this.addMessageListener(({ data: { type, payload } }) => {
      if (type !== IDENTITY_MESSAGES.USER_INFO_REQUEST) {
        return;
      }

      const identity = { ...payload, country };

      setIdentity(identity);
      this.completionListener(identity, null);
    });

    const deviceInfo = getDeviceInfo();

    this.iframe.contentWindow.postMessage({
      type: IDENTITY_MESSAGES.USER_INFO_REQUEST,
      payload: {
        deviceInfo,
        country
      }
    }, this.url.origin);
  }

  // fetchIdentity = () => {
  //   const cachedIdentity = getIdentity();
  //
  //   /* Do not fetch if identity data
  //   has recently be cached. */
  //   if (cachedIdentity) {
  //     debugLogger.log('[identity-manager:fetchIdentity] Fetch identity found in cache:', cachedIdentity);
  //     this.completionListener(cachedIdentity, null);
  //     return;
  //   }
  //
  //   const deviceInfo = getDeviceInfo();
  //   const country = 'US';
  //
  //   debugLogger.log('[identity-manager:fetchIdentity] Fetch identity request.');
  //   this.iframe.contentWindow.postMessage({
  //     type: 'fetch_identity_request',
  //     payload: {
  //       deviceInfo,
  //       country
  //     }
  //   }, this.url.origin);
  // }
}
