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

export const checkValue = (input : any, expectedInput : $ReadOnlyArray<string>) => {
  const actual = getType(input);
  const expected = expectedInput.join(', or ');

  if (!expectedInput.includes(actual)) {
    throw new Error(`Input error: expected ${ actual } to be ${ expected }`);
  }
};

// Performs 'typeof' check on every key in 'input'
export const checkKeys = (input : any, expectedInput : any) => {
  // input must be an object
  if (getType(input) !== 'object') {
    throw new Error(`Input error: expected ${ getType(input) } to be object`);
  }

  // eslint-disable-next-line guard-for-in
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
