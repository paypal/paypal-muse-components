import { IframeManager } from './iframe-manager'
import { setIdentity } from '../local-storage'
import { getDeviceInfo } from '../get-device-info'
import { logger } from '../logger'

export class IdentityManager extends IframeManager {
  constructor(config) {
    let iframeUrl
    
    if (config.paramsToIdentityUrl) {
      iframeUrl = config.paramsToIdentityUrl()
    } else {
      iframeUrl = 'https://www.paypalobjects.com/muse/identity/index.html'
    }

    super({ src: iframeUrl })

    this.addMessageListener(this.storeIdentity)
  }

  onIframeLoad = (e) => {
    this.fetchIdentity()
  }

  logIframeError = (e) => {
    if (e.data.type !== 'fetch_identity_error') {
      return
    }

    logger.error('identity iframe error:', e.data.payload)
  }

  storeIdentity = (e) => {
    if (e.data.type !== 'fetch_identity_response') {
      return
    }

    const identity = e.data.payload

    setIdentity(identity)
  }

  fetchIdentity = () => {
    const deviceInfo = getDeviceInfo();
    const country = 'US'

    this.iframe.contentWindow.postMessage({
      type: 'fetch_identity_request',
      payload: {
        deviceInfo,
        country
      }
    }, this.url.origin)
  }
}