/* @flow */
export const loadJavascript = url => {
    // eslint-disable-next-line func-names, max-statements-per-line, block-spacing, no-unused-expressions, max-params, space-before-blocks, flowtype/no-unused-expressions, comma-spacing, no-sequences
    return !(function(e, t, n, s, a, c, o){e.PaypalOffersObject = n, e[n] = e[n] || function() { (e[n].q = e[n].q || []).push(arguments);}, e[n].l = Number(new Date()), c = t.createElement(s), o = t.getElementsByTagName(s)[0], c.async = 1,c.src = a, o.parentNode.insertBefore(c, o); }(window, document, 'ppq', 'script', url));
};
