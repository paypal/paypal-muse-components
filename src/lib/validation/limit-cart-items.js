/* @flow */
import constants from '../constants';
import { logger } from '../logger';

export const limitCartItems = (input : any)  => {
  const { cartLimit } = constants;
  if (input.items && input.items.length > cartLimit) {
    input.items = input.items.splice(0, cartLimit);
  }
  return input;
};
