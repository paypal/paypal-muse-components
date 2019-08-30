/* @flow */
import constants from './constants';
import generate from './generate-id';

const { storage, sevenDays } = constants;

/* Generates a random cartId that expires in 7 days */
export const createNewCartId = () => {
    const cartId = `${ generate.generateId() }`;

    const storedValue = {
        cartId,
        createdAt: Date.now()
    };

    window.localStorage.setItem(storage.paypalCrCart, JSON.stringify(storedValue));

    return storedValue;
};

/* Returns an existing cartId or null */
export const getCartId = () => {
    const storedValue = window.localStorage.getItem(storage.paypalCrCart);

    if (storedValue) {
        return JSON.parse(storedValue);
    }

    return null;
};

/* Sets a new cartId to expire in 7 days */
export const setCartId = (cartId : string) => {
    const storedValue = {
        cartId,
        createdAt: Date.now()
    };

    window.localStorage.setItem(storage.paypalCrCart, JSON.stringify(storedValue));

    return storedValue;
};

/* Generates a new cartId if the existing value is older than 7 days.
Returns the current, up-to-date cartId in either case */
export const resetExpiredCartId = () => {
    const storedValue = getCartId();
    const now = Date.now();

    if (!storedValue || ((now - storedValue.createdAt) > sevenDays)) {
        return createNewCartId();
    }

    return storedValue;
};
