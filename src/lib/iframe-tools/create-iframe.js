// temporary
import { template } from './iframe/iframe-template'

export default (src) => {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('src', src)
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  /* temporary */
  iframe.contentWindow.document.open()
  iframe.contentWindow.document.write(template)
  iframe.contentWindow.document.close()
  /* temporary */

  return iframe
}