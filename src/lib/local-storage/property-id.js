/* @flow */
import constants from '../constants';

const { storage } = constants;

export const getPropertyId = () : Object | null => {
  const storedValue = window.localStorage.getItem(storage.paypalCrPropId);

  if (storedValue) {
    return JSON.parse(storedValue);
  }

  return null;
};

export const setPropertyId = (propertyId : string) : void => {
  const storedValue = {
    propertyId,
    createdAt: Date.now()
  };

  window.localStorage.setItem(storage.paypalCrPropId, JSON.stringify(storedValue));
};
