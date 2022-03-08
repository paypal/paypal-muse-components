/* @flow */
import { tryAndLog } from '../utils';

const setProperty = (prop, value, jsonResult) => {
  // eslint-disable-next-line max-statements-per-line
  if (!jsonResult[prop]) { jsonResult[prop] = value; return; }

  // if a property on the object exists, then convert the property into an Array before pushing our value
  // eslint-disable-next-line max-statements-per-line
  if (!Array.isArray(jsonResult[prop])) { jsonResult[prop] = [ jsonResult[prop] ]; }
  // eslint-disable-next-line max-statements-per-line
  if (Array.isArray(jsonResult[prop])) { return jsonResult[prop].push(value); }
};

/**
 * This implements a DFS walking of the DOM to find itemprops
 */
function parseMicrodata (schemaNode, jsonResult) {
  for (const child of schemaNode.children) {
    if (!child.hasAttribute('itemprop')) {
      parseMicrodata(child, jsonResult); // descend into it's children
      continue;
    }

    const itemprop = child.getAttribute('itemprop');

    if (child.hasAttribute('itemscope')) {
      const valueObj = { '@type': child.getAttribute('itemtype') };
      setProperty(itemprop, valueObj, jsonResult);
      parseMicrodata(child, valueObj);
    }
    else if (itemprop === 'item') { // special handling for Breadcrumb items
      // 'item' is a special case as it behaves like a itemscope but doesn't have the itemscope attribute
      // It also has a different object format
      const itemObj = { '@id': child.getAttribute('href') };
      setProperty(itemprop, itemObj, jsonResult);
      parseMicrodata(child, itemObj);
    }
    else {
      const itemContent = child.getAttribute('content') || child.getAttribute('src') ||
                child.getAttribute('href') || child.textContent;
      setProperty(itemprop, itemContent, jsonResult);
    }
  }
}

const parseTags = ({ schemaType }) => {
  const jsonResult = {
    '@context': 'https://schema.org',
    '@type': schemaType
  };

  const schemaNodes = document.querySelectorAll(`[itemtype$="schema.org/${ schemaType }"]`);

  if (!schemaNodes || schemaNodes.length === 0) {
    return;
  }

  const schemaNode = schemaNodes[0]; // we are only interested in the first as our payload size is limited
  parseMicrodata(schemaNode, jsonResult);

  delete jsonResult.review;

  return jsonResult;
};

const parse = tryAndLog(parseTags);

export default parse;
