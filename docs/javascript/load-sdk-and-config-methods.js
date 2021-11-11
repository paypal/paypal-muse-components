const sdkBaseUrl =
  localStorage.getItem('sdk-base-url') || 'https://www.paypal.com';
const sdkPort = localStorage.getItem('sdk-port') || '443';
const clientId =
  localStorage.getItem('sdk-client-id') ||
  'AY09zHPojjoschuPgNWj1imd648hlwyX0aZnQRhncc0ALfqS8wZCaG5sxUoceQxo72cD1GvnEfS5EGZT';

; (function (a, t, o, m, i) { a[m] = a[m] || [];
  a[m].push({ t: new Date().getTime(), event:
  'snippetRun' }); var f =
  t.getElementsByTagName(o)[0], e =
  t.createElement(o); e.async = !0; e.src =
  `${sdkBaseUrl}:${sdkPort}/sdk/js?components=shopping&client-id=` + i; f.parentNode.insertBefore(e, f);
})(window, document, 'script', 'shoppingDDL', clientId);

const pptag = {send: function (event, payload) {shoppingDDL.push({event, payload}); }, set: function (set) {shoppingDDL.push({set}); } };

const sendStoreCashValue = localStorage.getItem('sdk-send-store-cash-automatically');
const shouldNotSendStoreCash = sendStoreCashValue === 'false';
console.log('shouldNotSendStoreCash:', shouldNotSendStoreCash);
if (shouldNotSendStoreCash) {
  pptag.set({ disable_storecash: 'true' });
}

const _setLocalStorage = (name, value) => {
  if (value && value !== '') {
    localStorage.setItem(name, value);
  }
};

const setSdkConfig = () => {
  const baseUrl = document.getElementById('sdk-base-url').value;
  const port = document.getElementById('sdk-port').value;
  const clientId = document.getElementById('sdk-client-id').value;
  const sendStoreCashEvents = document.getElementById('sdk-send-store-cash-events').value;

  console.log('sendStoreCashEvents:', sendStoreCashEvents);

  _setLocalStorage('sdk-base-url', baseUrl);
  _setLocalStorage('sdk-port', port);
  _setLocalStorage('sdk-client-id', clientId);
  _setLocalStorage('sdk-send-store-cash-automatically', undefined);
};

const updateStoreCashToggle = () => {
  const currentValue = localStorage.getItem('sdk-send-store-cash-automatically');
  if (currentValue === null || currentValue === 'true') {
    _setLocalStorage('sdk-send-store-cash-automatically', 'false');
  } else {
    _setLocalStorage('sdk-send-store-cash-automatically', 'true');
  }
};

const manuallySendStoreCashEvent = (pageId) => {
  pptag.set({ 'disable_storecash': 'false' });
  pptag.set({ 'parse_page': 'false' });
  pptag.send('page_view', {
    'page_id': `${pageId}_MANUAL-STORE-CASH-SEND`
  });
  pptag.set({ 'disable_storecash': 'true' });
};