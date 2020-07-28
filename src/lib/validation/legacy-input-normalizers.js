/* @flow */
import { limitCartItems } from './limit-cart-items';

/* Returns values from the v1 'user' key.  Warns in the event a 'deprecated' value is passed */
export const setUserNormalizer = (input : any) => {
  if (input) {
    if (input.user) {
      // eslint-disable-next-line no-console
      console.warn('the "user" key has been deprecated. See v2 documentation for details');
      return input.user;
    }
  }

  return input;
};