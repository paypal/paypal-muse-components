/* @flow */
import constants from '../constants';

const { storage } = constants;

export const getPropertyId = () : Object | null => {
  try {
    const storedValue = window.localStorage.getItem(storage.paypalCrPropertyId);

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

  window.localStorage.setItem(storage.paypalCrPropertyId, JSON.stringify(storedValue));
};
