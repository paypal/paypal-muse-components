/* @flow */
import { logger } from '../logger';

import createIframe from './create-iframe';


export class IframeManager {
  constructor(config) {
    this.url = new URL(config.src);
    this.iframe = createIframe(config.src);
    this.messageListeners = config.messageListeners || [];
 
    this.iframe.addEventListener('load', this._onIframeLoad);
    window.addEventListener('message', this._onMessage);
  }

  _onIframeLoad = (e) => {
    if (this.onIframeLoad) {
      this.onIframeLoad(e);
    }
  };

  _onMessage = (e) => {
    if (e.source.window !== this.iframe.contentWindow) {
      return;
    }

    if (e.origin !== this.url.origin) {
      return;
    }

    this.messageListeners.forEach((listener) => {
      try {
        listener(e);
      } catch (err) {
        logger.error(err, listener, e);
      }
    });
  };

  addMessageListener = (listener) => {
    if (typeof listener !== 'function') {
      logger.error('iframe listener must be a function');
      return;
    }

    this.messageListeners.push(listener);
  };
}
