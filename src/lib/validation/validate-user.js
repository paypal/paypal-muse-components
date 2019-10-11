/* @flow */
import { checkKeys } from './utils';

export const validateUser = (input : any) => {
  const inputKeys = {
    id: [ 'string', 'null', 'undefined' ],
    email: [ 'string', 'null', 'undefined' ],
    name: [ 'string', 'null', 'undefined' ]
  };

  checkKeys(input, inputKeys);
};
