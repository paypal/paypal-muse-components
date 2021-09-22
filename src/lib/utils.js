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
  return (argObj) => {
    try {
      return fn(argObj);
    } catch (err) {
      console.log(err); /* eslint-disable-line no-console */
    }
  };
};

// https://gist.github.com/harish2704/d0ee530e6ee75bad6fd30c98e5ad9dab#gistcomment-3148552
export const _get = (object, path, value) => {
  const pathArray = Array.isArray(path) ? path : path.split('.').filter(key => key);
  const pathArrayFlat = pathArray.flatMap(part => (typeof part === 'string' ? part.split('.') : part));
  const checkValue = pathArrayFlat.reduce((obj, key) => obj && obj[key], object);
  return  checkValue === undefined ? value : checkValue;
};
