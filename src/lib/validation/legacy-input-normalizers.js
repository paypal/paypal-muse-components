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

/* sets cartTotal to total. Warns in the event a 'deprecated' value is passed
TODO: 'total' should eventually be replaced with 'cartTotal' on the backend. */
export const addToCartNormalizer = (input : any) => {
  if (input) {
    if (input.total !== undefined) {
      // eslint-disable-next-line no-console
      console.warn('"total" has been deprecated. use "cartTotal" instead');
    } else if (input.cartTotal) {
      input.total = input.cartTotal;
      delete input.cartTotal;
      input = limitCartItems(input);
    }
  }
  return input;
};

export const purchaseNormalizer = addToCartNormalizer;
export const setCartNormalizer = addToCartNormalizer;
export const removeFromCartNormalizer = addToCartNormalizer;
