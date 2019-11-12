/* @flow */
import constants from '../constants';

const { storage, oneHour } = constants;

export const clearIdentity = () => {
  window.localStorage.removeItem(storage.paypalSDKIdentity);
};

export const getIdentity = () => {
  let storedValue = window.localStorage.getItem(storage.paypalSDKIdentity);
  const now = Date.now();

  try {
    storedValue = JSON.parse(storedValue);
  } catch (err) {
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

  window.localStorage.setItem(storage.paypalSDKIdentity, JSON.stringify(storedValue));

  return storedValue;
};
