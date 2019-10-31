import { IframeManager } from './iframe-manager'
import { setIdentity } from '../local-storage'
import { getDeviceInfo } from '../get-device-info';

export class IdentityManager extends IframeManager {
  constructor(config) {
    super({ src: 'https://localhost.paypal.com:443/tagmanager/iframe' })

    this.addMessageListener(this.storeIdentity)
  }

  onIframeLoad = (e) => {
    this.fetchIdentity()
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
    }, 'https://localhost.paypal.com')
  }
}