export const fetchUserCountry = () => {
  const US = 'US';
  const geoLocationUrl = 'https://www.paypalobjects.com/muse/noop.js';

  return fetch(geoLocationUrl, { mode: 'no-cors' })
    .then(res => {
      // we need this function to workaround a chrome issue
      // https://stackoverflow.com/questions/45816743/how-to-solve-this-caution-request-is-not-finished-yet-in-chrome
      // First brought up by Bed Bath and Beyond asserting this breaks their SEO
      // https://engineering.paypalcorp.com/jira/browse/DTSHOPCASH-1316
      const bodyNoOp = () => {
      };
      res.text().then(bodyNoOp);

      // If country cannot be determined show the default config
      // This can happen if Akamai header 'x-client-location' is missing in noop.js response
      const country = res.headers.get('x-client-location');
      if (country === null) {
        return US;
      }

      return country;
    })
    .catch(() => {
      // Fallback to US in case noop.js request blocked
      return US;
    });
}
