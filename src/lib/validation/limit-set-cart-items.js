/* @flow */
export const limitSetCartItems = (input : any)  => {
  input.items = input.items.splice(0,10);
  input.cartTotal = input.items.length;
  return input;
};