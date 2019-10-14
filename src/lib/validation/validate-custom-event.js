/* @flow */
import { checkValue } from './utils';

export const validateCustomEvent = (eventName : any, input : any) => {
  checkValue(eventName, [ 'string' ]);
  checkValue(input, [ 'object', 'undefined' ]);
};
