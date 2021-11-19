/* @flow */

export const tryAndLog = (fn : Function) => {
  return (argObj : Object) => {
    try {
      return fn(argObj);
    } catch (err) {
      (() => {})(); // noop
    }
  };
};

export const isConfigFalse = (configAttribute : Object) => {
  return configAttribute === undefined || configAttribute === 'false' || configAttribute === false;
};

