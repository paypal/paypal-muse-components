/* @flow */
import constants from '../constants';

import { writeInLocalStorage, readFromLocalStorage } from './local-storage-manager';

const { storage } = constants;

export const getPropertyId = () : Object | null => {
  return readFromLocalStorage(storage.paypalCrPropertyId);
};

export const setPropertyId = (propertyId : string) : void => {
  const storedValue = {
    propertyId,
    createdAt: Date.now()
  };

  writeInLocalStorage(storage.paypalCrPropertyId, storedValue);
};

// TODO: removeFromLocal storage `window.localStorage.removeItem(key);`
