/* @flow */
/* global expect jest */
import fs from 'fs';
import path from 'path';

import parse from '../../../src/lib/tag-parsers/jsonld-parser';

import nikeProductldjson_result from './res/nike_product_ldjson.res.json';
import fanaticsProductldjson_result from './res/fanatics_product_ldjson.res.json';


describe('test jsonld tag parser', () => {
  it('should parse jsonld tags as expected (with no `review` attribute)', () => {
    const nikeProductHtml = fs.readFileSync(path.resolve(__dirname, 'res/nike_product.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = nikeProductHtml;
    const result = parse();

    expect(JSON.stringify(result)).toBe(JSON.stringify(nikeProductldjson_result));
  });

  it('should parse jsonld tags as expected for fanatics product', () => {
    const fanaticsHTML = fs.readFileSync(path.resolve(__dirname, 'res/fanatics_product.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = fanaticsHTML;
    const result = parse();

    expect(JSON.stringify(result)).toBe(JSON.stringify(fanaticsProductldjson_result));
  });

  it('should return empty array when no jsonld tag', () => {
    const noParseHTML = fs.readFileSync(path.resolve(__dirname, 'res/no_parse.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = noParseHTML;
    const result = parse();

    expect(JSON.stringify(result)).toBe('[]');
  });

  it('should silently swallow errors', () => {
    const fanaticsHTML = fs.readFileSync(path.resolve(__dirname, 'res/fanatics_product.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = fanaticsHTML;

    JSON.parse = jest.fn().mockImplementation(() => {
      throw new Error('failed parsing JSON!!');
    });

    expect(parse).not.toThrow();

    const result = parse();

    expect(result).toBe(undefined);
  });

});
