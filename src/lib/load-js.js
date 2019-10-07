/* @flow */
export const loadJavascript = (url : string) => {
  // eslint-disable-next-line func-names, max-params
  return !(function (window, document, global, tag, src, newScriptEl, firstScriptEl) {
    window.PaypalOffersObject = global;
    // eslint-disable-next-line func-names
    window[global] = window[global] || function () {
      (window[global].q = window[global].q || []).push(arguments);
    };
    window[global].l = Number(new Date());
    newScriptEl = document.createElement(tag);
    firstScriptEl = document.getElementsByTagName(tag)[0];
    newScriptEl.async = true;
    newScriptEl.src = src;
    if (firstScriptEl.parentNode) {
      firstScriptEl.parentNode.insertBefore(newScriptEl, firstScriptEl);
    }
  }(window, document, 'ppq', 'script', url));
};
