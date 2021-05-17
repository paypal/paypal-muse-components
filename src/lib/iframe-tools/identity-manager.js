/* @flow */
import { setIdentity, getIdentity } from '../local-storage';
import { getDeviceInfo } from '../get-device-info';
import { logger } from '../logger';

import { IframeManager } from './iframe-manager';

/**
 * Make a call to VPNS by loading the identity iframe and
 * try to do our own identifying of the user. Store this in the local storage.
 *
 * The call to VPNS is done by loading an iframe specific to identity which loads
 * identity.js (probably from musenodeweb) which calls VPNS.
 *
 * Store the result from VPNS in the local storage.
 */
export class IdentityManager extends IframeManager {
  constructor(config) {
    let iframeUrl;

    if (config.paramsToIdentityUrl) {
      iframeUrl = config.paramsToIdentityUrl();
    } else {
      iframeUrl = 'https://www.paypal.com/muse/identity/index.html';
    }

    super({ src: iframeUrl });

    this.addMessageListener(this.storeIdentity);
    this.addMessageListener(this.logIframeError);
  }

  onIframeLoad = () => {
    this.fetchIdentity();
  }

  logIframeError = (e) => {
    if (e.data.type !== 'fetch_identity_error') {
      return;
    }

    logger.error('identity iframe error:', e.data.payload);
  }

  storeIdentity = (e) => {
    if (e.data.type !== 'fetch_identity_response') {
      return;
    }

    const identity = e.data.payload;

    setIdentity(identity);
  }

  fetchIdentity = () => {
    const cachedIdentity = getIdentity();

    /* Do not fetch if identity data
    has recently be cached. */
    if (cachedIdentity) {
      return;
    }

    const deviceInfo = getDeviceInfo();
    const country = 'US';

    this.iframe.contentWindow.postMessage({
      type: 'fetch_identity_request',
      payload: {
        deviceInfo,
        country
      }
    }, this.url.origin);
  }
}
