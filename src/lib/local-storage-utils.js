/* @flow */
import constants from './constants';
import generate from './generate-id';

const { storage, sevenDays } = constants;

/* Returns an existing cartId or null */
export const getCartId = () => {
  const storedValue = window.localStorage.getItem(storage.paypalCrCart);

  if (storedValue) {
    return JSON.parse(storedValue);
  }

  return null;
};

/* Sets a new cartId to expire in 7 days */
export const setCartId = (cartId : string) => {
  const storedValue = {
    cartId,
    createdAt: Date.now()
  };

  window.localStorage.setItem(storage.paypalCrCart, JSON.stringify(storedValue));

  return storedValue;
};

/* Generates a random cartId that expires in 7 days */
export const createNewCartId = () => {
  const cartId = `${ generate.generateId() }`;

  return setCartId(cartId);
};

/* Returns an existing, valid cartId or creates a new one */
export const getOrCreateValidCartId = () => {
  const storedValue = getCartId();
  const now = Date.now();

  if (!storedValue || ((now - storedValue.createdAt) > sevenDays)) {
    return createNewCartId();
  }

  return storedValue;
};

export const getUserStorage = () => {
  let userStorage = window.localStorage.getItem(storage.paypalCrUser) || '{}';

  try {
    userStorage = JSON.parse(userStorage);
  } catch (err) {
    userStorage = {};
  }

  return userStorage;
};

export const setUserStorage = (userStorage : Object) => {
  window.localStorage.setItem(storage.paypalCrUser, JSON.stringify(userStorage));
};

// Generates a random user ID.
// This method will set the userId field and generatedUserId field.
export const setGeneratedUserId = () => {
  const userStorage = getUserStorage();

  userStorage.userId = generate.generateId();

  setUserStorage(userStorage);

  return userStorage;
};

// Set the merchant provided user ID to the userId field and
// the merchantProvidedUserId field.
export const setMerchantProvidedUserId = (id : string) => {
  const userStorage = getUserStorage();

  userStorage.merchantProvidedUserId = id;

  setUserStorage(userStorage);

  return userStorage;
};

/* Returns a userId if one exists */
export const getUserId = () => {
  const storedValue = window.localStorage.getItem(storage.paypalCrUser);

  if (storedValue) {
    return JSON.parse(storedValue);
  }

  return null;
};

/* Returns an existing, valid userId or creates a new one if it doesn't exist */
export const getOrCreateValidUserId = () => {
  const storedValue = getUserId();

  if (!storedValue) {
    return setGeneratedUserId();
  }

  return storedValue;
};
