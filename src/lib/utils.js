/* @flow */

const autoGenerateProductPayload = () => {
  const tags = {
    'og:title': 'product_name',
    'product:price:amount': 'price',
    'product:price:currency': 'currency',
    'og:description': 'description',
    'og:url': 'url'
  };

  const attributes = Object.entries(tags).map(([ k, v ]) => {
    const metaTag : ?HTMLElement = document.querySelector(`meta[property="${ k }"]`);
    const result = {};

    if (metaTag && (metaTag instanceof HTMLMetaElement)) {
      // $FlowFixMe - flow does not like result[v] and there is no accepted fix
      result[v] = metaTag.content;
    }

    return result;
  });

  const payload = attributes.reduce((accm, curr) => {
    return Object.assign(accm, curr);
  });

  return Object.keys(payload).length > 0 ? payload : null;
};

export default autoGenerateProductPayload;
