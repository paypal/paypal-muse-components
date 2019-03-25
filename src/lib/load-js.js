/* @flow */
export const loadJavascript = (url: string) => {
  return !function (window, document, global, tag, src, newScriptEl, firstScriptEl) {
    window['PaypalOffersObject'] = global
    window[global] = window[global] || function () { 
      (window[global].q = window[global].q || []).push(arguments)
    }
    window[global].l = 1 * new Date()
    newScriptEl = document.createElement(tag )
    firstScriptEl = document.getElementsByTagName(tag)[0]
    newScriptEl.async = 1
    newScriptEl.src = src
    if ( firstScriptEl.parentNode) {
      firstScriptEl.parentNode.insertBefore(newScriptEl, firstScriptEl)
    }
  }(window, document, 'ppq', 'script', url)
}
