/* @flow */
// $FlowFixMe
export const removeFromCart = (items, currentItems = []) => {
    return items.reduce((accumulator, item) => {
        if (item.quantity === undefined) {
            return accumulator.filter(curItem => curItem.id !== item.id);
        }
  
        if (typeof item.quantity !== 'number') {
            throw new TypeError('quantity must be a number');
        }
  
        while (item.quantity > 0) {
            const index = accumulator.findIndex(curItem => curItem.id === item.id);
  
            if (index === -1) {
                break;
            }
  
            accumulator.splice(index, 1);
            item.quantity -= 1;
        }
  
        return accumulator;
    }, currentItems);
};
// $FlowFixMe
export const addToCart = (items, currentItems = []) => {
    return [ ...currentItems, ...items ];
};
