/* @flow */
import constants from '../constants';

import { writeInLocalStorage, readFromLocalStorage } from './local-storage-manager';

const { storage } = constants;

export const getPropertyId = () : Object | null => {
  try {
    const storedValue = readFromLocalStorage(storage.paypalCrPropertyId);

    if (storedValue) {
      return JSON.parse(storedValue);
    }
  } catch (e) {
    return null;
  }

  return null;
};

export const setPropertyId = (propertyId : string) : void => {
  const storedValue = {
    propertyId,
    createdAt: Date.now()
  };

  writeInLocalStorage(storage.paypalCrPropertyId, storedValue);
};

// TODO: removeFromLocal storage `window.localStorage.removeItem(key);`
