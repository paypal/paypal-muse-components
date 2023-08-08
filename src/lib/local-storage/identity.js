/* @flow */
import constants from '../constants';

import { writeInLocalStorage, readFromLocalStorage } from './local-storage-manager';

const { storage, oneHour } = constants;

export const clearIdentity = () => {
  window.localStorage.removeItem(storage.paypalSDKIdentity);
};

export const getIdentity = () => {
  const storedValue = readFromLocalStorage(storage.paypalSDKIdentity);
  const now = Date.now();

  if (!storedValue) {
    clearIdentity();
    return null;
  }

  /* Discard identity information more than an hour old. */
  if (storedValue && (now - storedValue.createdAt) > oneHour) {
    clearIdentity();
    return null;
  }

  return storedValue ? storedValue.identity : null;
};

export const setIdentity = identity => {
  const storedValue = {
    identity,
    createdAt: Date.now()
  };

  writeInLocalStorage(storage.paypalSDKIdentity, storedValue);

  return storedValue;
};
