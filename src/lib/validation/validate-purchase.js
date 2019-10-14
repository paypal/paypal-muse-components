/* @flow */
import { checkKeys } from './utils';

export const validatePurchase = (input : any) => {
  const inputKeys = {
    total: [ 'string', 'number', 'undefined' ],
    paymentProvider: [ 'string', 'undefined' ],
    currencyCode: [ 'string', 'undefined' ]
  };

  checkKeys(input, inputKeys);
};
