/* @flow */
import constants from '../constants';
import { logger } from '../logger';

export const limitCartItems = (input : any)  => {
  const { cartLimit } = constants;
  if (input.items && input.items.length > cartLimit) {
    logger.error(`Total number of items in cart is greater than ${ cartLimit }, cart will be truncated`);
    input.items = input.items.splice(0, cartLimit);
  }
  return input;
};
