/* @flow */
import { getCookie } from './cookie-utils';
import { storage, sevenDays } from './constants';
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
// $FlowFixMe
export const composeCart = (type, data) => {
    // Copy the data so we don't modify it outside the scope of this method.
    let _data = { ...data };

    // Devnote: Checking for cookie for backwards compatibility (the cookie check can be removed
    // a couple weeks after deploy because any cart cookie storage will be moved to localStorage
    // in this function).
    const storedCart = window.localStorage.getItem(storage.paypalCrCart) || getCookie(storage.paypalCrCart) || '{}';
    const expiry = window.localStorage.getItem(storage.paypalCrCartExpiry);
    const cart = JSON.parse(storedCart);
    const currentItems = cart ? cart.items : [];

    if (!expiry) {
        window.localStorage.setItem(storage.paypalCrCartExpiry, Date.now() + sevenDays);
    }

    switch (type) {
    case 'add':
        _data.items = addToCart(data.items, currentItems);
        break;
    case 'set':
        _data.items = data.items;
        break;
    case 'remove':
        _data = { ...cart, ...data };
        _data.items = removeFromCart(data.items, currentItems);
        break;
    default:
        throw new Error('invalid cart action');
    }

    window.localStorage.setItem(storage.paypalCrCart, JSON.stringify(_data));

    return _data;
};
