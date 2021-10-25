/* @flow */
import { setIdentity, getIdentity } from '../local-storage';
import { getDeviceInfo } from '../get-device-info';
import { logger } from '../logger';

import { IframeManager } from './iframe-manager';
import { debugLogger } from '../debug-console-logger';
debugLogger.log('[identity:fetchUserIdentity] Triggering identity discovery.');

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
  constructor(config, completionListener? = noop) {
    let iframeUrl;


    if (config.paramsToIdentityUrl) {
      iframeUrl = config.paramsToIdentityUrl();
    } else {
      iframeUrl = 'https://www.paypal.com/muse/identity/index.html';
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

  fetchIdentity = () => {
    const cachedIdentity = getIdentity();

    /* Do not fetch if identity data
    has recently be cached. */
    if (cachedIdentity) {
      this.completionListener(cachedIdentity, null);
      return;
    }

    const deviceInfo = getDeviceInfo();
    const country = 'US';

    debugLogger.log('[identity-manager:fetchIdentity] Fetch identity request.');
    this.iframe.contentWindow.postMessage({
      type: 'fetch_identity_request',
      payload: {
        deviceInfo,
        country
      }
    }, this.url.origin);
  }
}
