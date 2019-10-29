import createIframe from './create-iframe'

export class IframeManager {
  constructor(config) {
    this.iframe = createIframe(config.src)
    this.listeners = config.listeners || [];

    window.addEventListener('message', this._messageListener)
  }

  _messageListener = (e) => {
    if (e.source.window !== this.iframe.contentWindow) {
      return
    }

    for (let i = 0; i < this.listeners.length; i++) {
      try {
        this.listeners[i](e)
      } catch (err) {
        console.error(err, this.listeners[i], e)
      }
    }
  }

  addListener = (listener) => {
    if (typeof listener !== 'function') {
      console.error('listener must be a function')
      return
    }

    this.listeners.push(listener)
  }
}