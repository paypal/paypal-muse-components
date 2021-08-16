/* @flow */
import { setIdentity, getIdentity } from '../local-storage';
import { getDeviceInfo } from '../get-device-info';
import { logger } from '../logger';
import { IDENTITY_MESSAGES } from '../constants';

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

function noop() {}
export class IdentityManager extends IframeManager {
  constructor(config, completionListener = noop) {
    let iframeUrl;

    if (config.paramsToIdentityUrl) {
      iframeUrl = config.paramsToIdentityUrl();
    } else {
      iframeUrl = 'https://www.paypal.com/muse/identity/v2/index.html';
    }

    super({ src: iframeUrl });

    this.completionListener = completionListener;
  }

  onIframeLoad = () => {
    this.fetchIdentity();
  }

  logIframeError = (e) => {
    if (e.data.type !== 'fetch_identity_error') {
      return;
    }
    this.completionListener(null, e);
    logger.error('identity iframe error:', e.data.payload);
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

  fetchIdentity = () => {
    const cachedIdentity = getIdentity();

    if (cachedIdentity) {
      this.completionListener(cachedIdentity, null);

      return;
    }

    this.fetchCountry().then((country) => {
      this.fetchUserInfo(country);
    });
  }
}
