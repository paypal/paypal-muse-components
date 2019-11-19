/* @flow */
import constants from '../constants';

export const limitCartItems = (input : any)  => {
  const { cartLimit } = constants;
  if (input.items && input.items.length > cartLimit) {
    // eslint-disable-next-line no-console
    console.warn(`Total number of items in cart is greater than ${ cartLimit }, cart will be truncated`);
    input.items = input.items.splice(0, cartLimit);
  }
  return input;
};
