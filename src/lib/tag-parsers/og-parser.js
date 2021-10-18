/* @flow */
import { tryAndLog } from '../utils';

const parseTags = () => {
  const result = [];
  const openGraphMetaTags = document.querySelectorAll(`meta[property^="og:"]`);

  openGraphMetaTags.forEach((ogTag) => {
    result.push({
      property: ogTag.getAttribute('property'),
      value: ogTag.content
    });
  });

  return result;
};

const parse = tryAndLog(parseTags);

export default parse;
