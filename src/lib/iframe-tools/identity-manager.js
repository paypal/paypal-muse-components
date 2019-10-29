import { IframeManager } from './iframe-manager'
import { setIdentity } from '../local-storage'

export class IdentityManager extends IframeManager {
  constructor(config) {
    super({ src: 'identity' })

    this.addListener(this._storeIdentity)
    this.iframe.onload(this.fetchIdentity)
  }

  _storeIdentity = (e) => {
    // check if event is from vpns iframe
    // save identity information to iframe
  }

  fetchIdentity = () => {
    this.iframe.contentWindow.postMessage('fetch-identity', '*')
  }
}