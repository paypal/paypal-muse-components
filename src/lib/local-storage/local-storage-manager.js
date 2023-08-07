/* @flow */
import { getDisableSetCookie } from '@paypal/sdk-client/src';

const serializeData = (data: Object | string) => {
  try {
    if (typeof data === 'string') {
      return data;
    }

    return JSON.stringify(data);
  } catch (e) {
    return '';
  }
};

export const readFromLocalStorage = (key: string) => window.localStorage.getItem(key);

export const writeInLocalStorage = (key: string, data: Object) => {
  if (getDisableSetCookie()) {
    return;
  }

  window.localStorage.setItem(key, serializeData(data));
};
