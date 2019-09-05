/* @flow */
import constants from './constants';
import generate from './generate-id';

const { storage, sevenDays, oneMonth } = constants;

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

/* Generates a random cartId that expires in 7 days */
export const createNewCartId = () => {
    const cartId = `${ generate.generateId() }`;

    return setCartId(cartId);
};

/* Returns an existing, valid cartId or creates a new one */
export const getOrCreateValidCartId = () => {
    const storedValue = getCartId();
    const now = Date.now();

    if (!storedValue || ((now - storedValue.createdAt) > sevenDays)) {
        return createNewCartId();
    }

    return storedValue;
};

export const setUserId = (userId : string) => {
    const storedValue = {
        userId,
        createdAt: Date.now()
    };

    window.localStorage.setItem(storage.paypalCrUser, JSON.stringify(storedValue));

    return storedValue;
};

export const createNewUserId = () => {
    const userId = `${ generate.generateId() }`;

    return setUserId(userId);
};

export const getUserId = () => {
    const storedValue = window.localStorage.getItem(storage.paypalCrUser);

    if (storedValue) {
        return JSON.parse(storedValue);
    }

    return null;
};

// paypalCrUser
export const getOrCreateValidUserId = () => {
    const storedValue = getUserId();
    const now = Date.now();

    if (!storedValue || ((now - storedValue.createdAt) > oneMonth)) {
        return createNewUserId();
    }

    return storedValue;
};
