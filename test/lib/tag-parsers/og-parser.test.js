/* @flow */
/* global expect jest */
import fs from 'fs';
import path from 'path';

import parse from '../../../src/lib/tag-parsers/og-parser';

import nikeProductOG_result from './res/nike_product_og.res.json';
import fanaticsProductOG_result from './res/fanatics_product_og.res.json';

describe('test open graph tag parser', () => {
  it('should parse open graph tags as expected for nike product', () => {
    const nikeProductHtml = fs.readFileSync(path.resolve(__dirname, 'res/nike_product.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = nikeProductHtml;
    const result = parse();

    expect(JSON.stringify(result)).toBe(JSON.stringify(nikeProductOG_result));
  });

  it('should parse open graph tags as expected for fanatics product', () => {
    const fanaticsHTML = fs.readFileSync(path.resolve(__dirname, 'res/fanatics_product.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = fanaticsHTML;
    const result = parse();

    expect(JSON.stringify(result)).toBe(JSON.stringify(fanaticsProductOG_result));
  });

  it('should return empty array when no og tags', () => {
    const noParseHTML = fs.readFileSync(path.resolve(__dirname, 'res/no_parse.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = noParseHTML;
    const result = parse();

    expect(JSON.stringify(result)).toBe('[]');
  });

  it('should silently swallow errors', () => {
    const fanaticsHTML = fs.readFileSync(path.resolve(__dirname, 'res/fanatics_product.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = fanaticsHTML;

    document.querySelectorAll = jest.fn().mockImplementation(() => {
      throw new Error('error parsing OG tags !!');
    });

    expect(parse).not.toThrow();

    const result = parse();

    expect(result).toBe(undefined);
  });
});

