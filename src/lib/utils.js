/* @flow */

export const tryAndLog = (fn : Function) :Function => {
  return (argObj : Object) => {
    try {
      return fn(argObj);
    } catch (err) {
      (() => {})(); // noop
    }
  };
};

export const isConfigFalse = (configAttribute : Object): boolean => {
  return configAttribute === undefined || configAttribute === 'false' || configAttribute === false;
};

