/* @flow */
import { tryAndLog } from '../utils';

const parseTags = () => {
  const result = [];
  const ldTags = document.querySelectorAll('script[type="application/ld+json"]');

  ldTags.forEach((ldTag) => {
    result.push(JSON.parse(ldTag.text));
  });

  return result;
};

const parse = tryAndLog(parseTags);

export default parse;
