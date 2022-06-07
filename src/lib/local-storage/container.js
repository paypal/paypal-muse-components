/* @flow */
import constants from '../constants';
import type { ContainerSummary } from '../../types';

const { storage, oneHour } = constants;

const getContainer = () : Object | null => {
  const storedValue = window.localStorage.getItem(storage.paypalCrContainer);

  if (storedValue) {
    return JSON.parse(storedValue);
  }

  return null;
};

/* Returns an existing, non-expired container. Removes a container
from localstorage if it has expired. */
export const getValidContainer = () : ContainerSummary | null => {
  try {
    const storedValue = getContainer();
    const now = Date.now();

    if (!storedValue || ((now - storedValue.createdAt) > oneHour)) {
      window.localStorage.removeItem(storage.paypalCrContainer);

      return null;
    }

    return storedValue.containerSummary;
  } catch (e) {
    return null;
  }
};

export const setContainer = (containerSummary : ContainerSummary) => {
  const storedValue = JSON.stringify({
    containerSummary,
    createdAt: Date.now()
  });

  window.localStorage.setItem(storage.paypalCrContainer, storedValue);
};

export const clearContainer = () => {
  window.localStorage.removeItem(storage.paypalCrContainer);
};
