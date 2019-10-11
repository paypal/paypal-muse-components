/* @flow */
import { checkKeys, checkArrayKeys } from './utils';

export const validateRemoveItems = (input : any) => {
  const inputKeys = {
    items: [ 'array' ],
    total: [ 'string', 'number' ],
    cartId: [ 'string', 'undefined' ],
    currencyCode: [ 'string', 'undefined' ]
  };

  const itemKeys = {
    id: [ 'string' ],
    quantity: [ 'number', 'string', 'undefined' ]
  };

  checkKeys(input, inputKeys);
  checkArrayKeys(input.items, itemKeys);
};
