/* global expect */
/* @flow */

import { autoGenerateProductPayload } from '../../src/lib/utils';

const htmlWithOGTags = '<head><meta property="og:title" content="NOT Case - iPhone 12"><meta property="og:image" content="http://cdn.shoppify.com/cts/iPhoneCaseWebImages.png"><meta property="product:price:amount" content="30.00"><meta property="product:price:currency" content="AUD"><meta property="og:description" content="The NOT case provides protection against dings and scratches"><meta property="og:url" content="https://www.stttrfer.com.au/products/ultra-thin-case-iphone-12"><meta property="og:site_name" content="STUDIO RRG"></head>';
const expextedParsedJson = {
  product_name: 'NOT Case - iPhone 12',
  price: '30.00',
  currency: 'AUD',
  // description: 'The NOT case provides protection against dings and scratches',
  url: 'https://www.stttrfer.com.au/products/ultra-thin-case-iphone-12'
};

describe('test src/lib/utils.js', () => {

  it('should return object with correctly mapped tags when autoGenerateProductPayload called and there are OG tags on the page', () => {
    document.head.innerHTML = htmlWithOGTags;
    const result = autoGenerateProductPayload();
    expect(JSON.stringify(result)).toBe(JSON.stringify(expextedParsedJson));
  });

  it('should return undefined when autoGenerateProductPayload called and no OG tags on page', () => {
    document.head.innerHTML = '';
    const result = autoGenerateProductPayload();
    expect(result).toBe(null);
  });
});

