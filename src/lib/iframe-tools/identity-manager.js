/* @flow */
import { setIdentity, getIdentity } from '../local-storage';
import { getDeviceInfo } from '../get-device-info';
import { logger } from '../logger';

import { IframeManager } from './iframe-manager';

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
