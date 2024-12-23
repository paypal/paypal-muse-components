/* @flow */
import constants from '../constants';
import generate from '../generate-id';

import { readFromLocalStorage, writeInLocalStorage } from './local-storage-manager';

const { storage, sevenDays } = constants;

/* Returns an existing cartId or null */
export const getCartId = (): any => {
  return  readFromLocalStorage(storage.paypalCrCart);
};

/* Sets a new cartId to expire in 7 days */
export const setCartId = (cartId : string): any => {
  const storedValue = {
    cartId,
    createdAt: Date.now()
  };

  writeInLocalStorage(storage.paypalCrCart, storedValue);

  return storedValue;
};

/* Generates a random cartId that expires in 7 days */
export const createNewCartId = (): any => {
  const cartId = `${ generate.generateId() }`;

  return setCartId(cartId);
};

/* Returns an existing, valid cartId or creates a new one */
export const getOrCreateValidCartId = (): any => {
  const storedValue = getCartId();
  const now = Date.now();

  if (!storedValue || ((now - storedValue.createdAt) > sevenDays)) {
    return createNewCartId();
  }

  return storedValue;
};
