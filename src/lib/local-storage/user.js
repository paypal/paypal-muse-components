/* @flow */
import constants from '../constants';
import generate from '../generate-id';

import { writeInLocalStorage, readFromLocalStorage } from './local-storage-manager';

const { storage } = constants;

export const getUserStorage = (): any => {
  return readFromLocalStorage(storage.paypalCrUser) || {};
};

export const setUserStorage = (userStorage : Object) => {
  writeInLocalStorage(storage.paypalCrUser, userStorage);
};

// Generates a random user ID.
// Further cache the generated userId in LocalStorage.
export const setGeneratedUserId = (): any => {
  const userStorage = getUserStorage();

  userStorage.userId = generate.generateId();

  setUserStorage(userStorage);

  return userStorage;
};

// Set the merchant provided user ID to the userId field and
// the merchantProvidedUserId field.
export const setMerchantProvidedUserId = (id : string): any => {
  const userStorage = getUserStorage();

  userStorage.merchantProvidedUserId = id;

  setUserStorage(userStorage);

  return userStorage;
};

/* Returns a userId if one exists */
export const getUserId = (): any => {
  return readFromLocalStorage(storage.paypalCrUser);
};

/** Returns an existing, valid userId cached in localStorage
or creates a new one if one doesn't exist **/
export const getOrCreateValidUserId = (): any => {
  const storedValue = getUserId();

  if (!storedValue) {
    return setGeneratedUserId();
  }

  return storedValue;
};
