/* @flow */
import constants from '../constants';

export const limitCartItems = (input : any)  => {
  const { cartLimit } = constants;
  if (input.items && input.items.length > cartLimit) {
    input.items = input.items.splice(0, cartLimit);
  }
  return input;
};
