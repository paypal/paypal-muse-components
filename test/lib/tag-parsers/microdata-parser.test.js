/* @flow */
/* global expect jest */
import fs from 'fs';
import path from 'path';

import parse from '../../../src/lib/tag-parsers/microdata-parser';

import result1 from './res/microdata_result1.json';
import result2 from './res/microdata2_result.json';
import result3 from './res/microdata3_result.json';
import zazzleResult from './res/zazzle_microdata_result.json';

describe('test micordata parser', () => {
  it('should parse microdata tags as expected for product (without `review` attributes)', () => {
    const fanaticsHTML = fs.readFileSync(path.resolve(__dirname, 'res/fanatics_product.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = fanaticsHTML;
    const result = parse({ schemaType: 'Product' });

    expect(JSON.stringify(result)).toBe(JSON.stringify(result1));
  });

  it('should parse microdata when more than 1 Product tag', () => {
    const microdataHTML = fs.readFileSync(path.resolve(__dirname, 'res/microdata2.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = microdataHTML;
    const result = parse({ schemaType: 'Product' });

    expect(JSON.stringify(result)).toBe(JSON.stringify(result2));
  });

  it('should parse microdata for both Product and BreadcrumbList', () => {
    const microdataHTML = fs.readFileSync(path.resolve(__dirname, 'res/microdata3.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = microdataHTML;
    const product = parse({ schemaType: 'Product' });
    const breadcrumb = parse({ schemaType: 'BreadcrumbList' });

    const result = [ product, breadcrumb ];

    expect(JSON.stringify(result)).toBe(JSON.stringify(result3));
  });

  it('should parse microdata tags as expected for zazzle product that has deeply nested elements', () => {
    const zazzleHTML = fs.readFileSync(path.resolve(__dirname, 'res/zazzle_product.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = zazzleHTML;
    const productResult = parse({ schemaType: 'Product' });
    const breadcrumbResult = parse({ schemaType: 'BreadcrumbList' });
    const result = [ productResult, breadcrumbResult ];

    expect(JSON.stringify(result)).toBe(JSON.stringify(zazzleResult));
  });

  it('should silently swallow errors', () => {
    const microdataHTML = fs.readFileSync(path.resolve(__dirname, 'res/microdata3.html'), 'utf8'); /* eslint-disable-line no-sync */

    document.documentElement.innerHTML = microdataHTML;

    document.querySelectorAll = jest.fn().mockImplementation(() => {
      throw new Error('error parsing OG tags !!');
    });

    expect(parse).not.toThrow();

    const result = parse({ schemaType: 'Product' });

    expect(result).toBe(undefined);
  });
});

