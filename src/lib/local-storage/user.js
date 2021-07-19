/* @flow */
import constants from '../constants';
import generate from '../generate-id';
import { logger } from '../logger';
import type { UserStorage } from '../../types';

const { storage } = constants;

export const getUserStorage = () : UserStorage => {
  const userStorage : string = window.localStorage.getItem(storage.paypalCrUser);
  let userData = {};

  try {
    if (userStorage) {
      userData = JSON.parse(userStorage);
    }
  } catch (err) {
    logger.error('getUserStorage', err);
  }

  return userData;
};

export const setUserStorage = (userData : UserStorage) => {
  window.localStorage.setItem(storage.paypalCrUser, JSON.stringify(userData));
};

// Generates a random user ID.
// Further cache the generated userId in LocalStorage.
export const setGeneratedUserId = () => {
  // TODO: userStorage should be typeof UserData
  const userStorage : UserStorage = getUserStorage();

  // $FlowFixMe
  userStorage.userId = generate.generateId();

  setUserStorage(userStorage);

  return userStorage;
};

// Set the merchant provided user ID to the userId field and
// the merchantProvidedUserId field.
export const setMerchantProvidedUserId = (id : string) => {
  const userStorage = getUserStorage();
  // $FlowFixMe
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

/** Returns an existing, valid userId cached in localStorage
or creates a new one if one doesn't exist **/
export const getOrCreateValidUserId = () => {
  const storedValue = getUserId();

  if (!storedValue) {
    return setGeneratedUserId();
  }

  return storedValue;
};
