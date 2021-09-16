/* @flow */

/* parse the open graph meta tags on the page.
 eg meta tag : <meta property="og:title" content="NOT Case - iPhone 12"> */
type GeneratedProductPayload = {|
  product_name? : string,
  price? : string, // eg 200.00
  currency? : string, // ISO code
  url? : string
|};
export const autoGenerateProductPayload = () : ?GeneratedProductPayload => {
  type OpenGraphTag = 'og:title' | 'product:price:amount' | 'product:price:currency' | 'og:url';
  type PayloadAttribute = 'product_name' | 'price' | 'currency' | 'url';
  type _tags = {
      [OpenGraphTag] : PayloadAttribute
  };

  const tags : _tags = {
    'og:title': 'product_name',
    'product:price:amount': 'price',
    'product:price:currency': 'currency',
    'og:url': 'url'
  };

  const parseTagValue = (ogTag : OpenGraphTag) : ?string => {
    const openGraphMetaTag : ?HTMLElement = document.querySelector(`meta[property="${ ogTag }"]`);

    if (openGraphMetaTag && (openGraphMetaTag instanceof HTMLMetaElement)) {
      return openGraphMetaTag.content;
    }
  };

  const reducer = (acc, curr) => {
    const [ ogTag : OpenGraphTag, payloadAttribute : PayloadAttribute ] = curr; // $FlowFixMe
    const ogTagValue = parseTagValue(ogTag);
    if (ogTagValue) {
      // $FlowFixMe - flow does not like result[v] and there is no accepted fix
      acc[payloadAttribute] = ogTagValue;
    }
    return acc;
  };

  // $FlowFixMe
  const attributes : GeneratedProductPayload = Object.entries(tags).reduce(reducer, {});

  return Object.keys(attributes).length > 0 ? attributes : null;
};

export const tryAndLog = (fn : Function) => {
  return () => {
    try {
      return fn();
    } catch (err) {
      console.log(err); /* eslint-disable-line no-console */
    }
  };
};
