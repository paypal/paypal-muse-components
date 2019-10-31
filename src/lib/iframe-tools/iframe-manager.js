import createIframe from './create-iframe'

export class IframeManager {
  constructor(config) {
    this.url = new URL(config.src)
    this.iframe = createIframe(config.src)
    this.messageListeners = config.messageListeners || [];
 
    this.iframe.addEventListener('load', this._onIframeLoad)
    window.addEventListener('message', this._onMessage)
  }

  _onIframeLoad = (e) => {
    if (this.onIframeLoad) {
      this.onIframeLoad(e)
    }
  }

  _onMessage = (e) => {
    if (e.source.window !== this.iframe.contentWindow) {
      return
    }

    if (e.origin !== this.url.origin) {
      return
    }

    for (let i = 0; i < this.messageListeners.length; i++) {
      try {
        this.messageListeners[i](e)
      } catch (err) {
        console.error(err, this.messageListeners[i], e)
      }
    }
  }

  addMessageListener = (listener) => {
    if (typeof listener !== 'function') {
      console.error('listener must be a function')
      return
    }

    this.messageListeners.push(listener)
  }
}