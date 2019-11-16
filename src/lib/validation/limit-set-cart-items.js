/* @flow */
export const limitSetCartItems = (input : any)  => {
  input.items = input.items.splice(0, 10);
  if (input.cartTotal) {
    input.cartTotal = input.items.length;
  }  else if (input.total) {
    input.total = input.items.length;
  }
  return input;
};
