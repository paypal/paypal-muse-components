/* @flow */
const getType = (input : any) => {
  if (Array.isArray(input)) {
    return 'array';
  }

  if (input === null) {
    return 'null';
  }

  return typeof input;
};

// Performs 'typeof' check on every key in 'input'
export const checkKeys = (input : any, expectedInput : any) => {
  // input must be an object
  if (getType(input) !== 'object') {
    throw new Error(`Input error: expected ${ getType(input) } to be object`);
  }

  for (const key in expectedInput) {
    const expected = expectedInput[key];
    const actual = getType(input[key]);

    if (expected.indexOf(actual) === -1) {
      throw new Error(`Input error for ${ key }: expected ${ actual } to be ${ expected[0] }`);
    }
  }
};

export const checkArrayKeys = (input : any, expectedInput : any) => {
  // input must be an array
  if (getType(input) !== 'array') {
    throw new Error(`Input error: expected ${ getType(input) } to be array`);
  }

  input.forEach(inputItem => checkKeys(inputItem, expectedInput));
};
