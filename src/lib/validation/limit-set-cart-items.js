/* @flow */
export const limitSetCartItems = (input : any)  => {
  input.items = input.items.splice(0, 10);
  return input;
};
