/* @flow */
import { debugLogger } from '../debug-console-logger';

import parseOgTags from './og-parser';
import parseJsonLd from './jsonld-parser';
import parseMicroData from './microdata-parser';

const generateOgData = () => {
  const ogTags = parseOgTags();
  const hasOgTags = Array.isArray(ogTags) && ogTags.length > 0;
  return hasOgTags ? {
    type: 'open_graph',
    version: 1,
    data: ogTags
  } : null;
};

const generateJSONldData = () => {
  let tags = [];

  const ldTags = parseJsonLd();
  const productMicroData = parseMicroData({ schemaType: 'Product' });
  const breadcrumbMicroData = parseMicroData({ schemaType: 'BreadcrumbList' });

  const hasLdTags = Array.isArray(ldTags) && ldTags.length > 0;
  if (hasLdTags) {
    // eslint-disable-next-line unicorn/prefer-spread
    tags = tags.concat(ldTags);
  }

  if (productMicroData) {
    tags.push(productMicroData);
  }

  if (breadcrumbMicroData) {
    tags.push(breadcrumbMicroData);
  }

  return Array.isArray(tags) && tags.length > 0 ? {
    type: 'schema.org/ld+json',
    version: 1,
    data: tags
  }  : null;
};

export const capturePageData = () => {
  const autoData = [];

  const ogTagsData = generateOgData();
  if (ogTagsData) {
    autoData.push(ogTagsData);
  }
  const ldTagsData = generateJSONldData();
  if (ldTagsData) {
    autoData.push(ldTagsData);
  }

  debugLogger.log('[capture-page-data:capturePageData]. Captured page data: ', autoData);

  return autoData;
};
