/* @flow */
import { uniqueID } from '@krakenjs/belter/src';

/*
** the reason this is exported as a default object is to get rid of error
** "Cannot set property "prop" of #<Object> which has only a getter"
** - flow and eslint have to be disabled on whatever line this is used.
*/

export default {
  generateId: uniqueID
};
