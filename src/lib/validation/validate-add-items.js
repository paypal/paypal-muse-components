/* @flow */
import { checkKeys, checkArrayKeys } from './utils';

export const validateAddItems = (input : any) => {
  const inputKeys = {
    items: [ 'array' ],
    total: [ 'string', 'number' ],
    cartId: [ 'string', 'undefined' ],
    currencyCode: [ 'string', 'undefined' ]
  };

  const itemKeys = {
    id: [ 'string' ],
    title: [ 'string' ],
    url: [ 'string' ],
    imgUrl: [ 'string' ],
    price: [ 'string', 'number' ],
    quantity: [ 'number', 'string', 'undefined' ],
    keywords: [ 'array', 'string', 'undefined' ],
    otherImages: [ 'array', 'string', 'undefined' ],
    description: [ 'string', 'undefined' ]
  };

  checkKeys(input, inputKeys);
  checkArrayKeys(input.items, itemKeys);
};
