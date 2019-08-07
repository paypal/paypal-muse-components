/* @flow */
// $FlowFixMe
export const removeFromCart = (items, currentItems = []) => {
    return items.reduce((accumulator, item) => {
        if (item.quantity === undefined) {
            return accumulator.filter(curItem => curItem.id !== item.id);
        }

        let quantity = parseInt(item.quantity, 10);
  
        while (quantity > 0) {
            const index = accumulator.findIndex(curItem => curItem.id === item.id);
  
            if (index === -1) {
                break;
            }
  
            accumulator.splice(index, 1);
            quantity -= 1;
        }
  
        return accumulator;
    }, currentItems);
};
// $FlowFixMe
export const addToCart = (items, currentItems = []) => {
    return [ ...currentItems, ...items ];
};
