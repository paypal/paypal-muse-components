/* @flow */
import { tryAndLog } from '../utils';

const parseJSON = (jsonString) => {
  const result = JSON.parse(jsonString);
  delete result.review;
  return result;
};

const parseTags = () => {
  const result = [];
  const ldTags = document.querySelectorAll('script[type="application/ld+json"]');

  ldTags.forEach((ldTag) => {
    result.push(parseJSON(ldTag.text));
  });

  return result;
};

const parse = tryAndLog(parseTags);

export default parse;
