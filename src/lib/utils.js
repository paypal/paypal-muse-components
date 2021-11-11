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

