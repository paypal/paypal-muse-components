import constants from '../../src/lib/constants';

const { defaultCountry } = constants;

export const fetchUserCountry = () => {
    const geoLocationUrl = 'https://www.paypalobjects.com/muse/noop.js';

    return fetch(geoLocationUrl, { mode: 'no-cors' })
        .then(res => {
            // we need this function to workaround a chrome issue
            // https://stackoverflow.com/questions/45816743/how-to-solve-this-caution-request-is-not-finished-yet-in-chrome
            const bodyNoOp = () => {
            };
            res.text().then(bodyNoOp);

            // If country cannot be determined show the default config
            // This can happen if Akamai header 'x-client-location' is missing in noop.js response
            const country = res.headers.get('x-client-location');
            if (country === null) {
                return defaultCountry;
            }

            return country;
        })
        .catch(() => {
            // Fallback to US in case noop.js request blocked
            return defaultCountry;
        });
}
