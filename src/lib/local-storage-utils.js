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

export const getUserStorage = () => {
    let userStorage = window.localStorage.getItem(storage.paypalCrUser) || '{}';

    try {
        userStorage = JSON.parse(userStorage);
    } catch (err) {
        userStorage = {};
    }

    return userStorage;
};

export const setUserStorage = (userStorage : Object, expiry? : Date) => {
    userStorage.createdAt = expiry || Date.now();

    window.localStorage.setItem(storage.paypalCrUser, JSON.stringify(userStorage));
};

// Generates a random user ID.
// This method will set the userId field and generatedUserId field.
export const setGeneratedUserId = (id? : string, expiry? : Date) => {
    const userStorage = getUserStorage();

    const userId = id || `${ generate.generateId() }`;

    userStorage.userId = userId;

    userStorage.generatedUserId = userId;

    setUserStorage(userStorage, expiry);

    return userStorage;
};

// Set the merchant provided user ID to the userId field and
// the merchantProvidedUserId field.
export const setMerchantProvidedUserId = (id : string) => {
    const userStorage = getUserStorage();

    userStorage.merchantProvidedUserId = id;

    // The `userId` key will be merchantProvidedUserId || sdkGeneratedUserId for compatibility
    // with the existing methods that send events.
    userStorage.userId = id;

    setUserStorage(userStorage);

    return userStorage;
};

/* Returns a userId if one exists */
export const getUserId = () => {
    const storedValue = window.localStorage.getItem(storage.paypalCrUser);

    if (storedValue) {
        return JSON.parse(storedValue);
    }

    return null;
};

/* Returns an existing, valid userId or creates a new one if it doesn't exist or is expired */
export const getOrCreateValidUserId = () => {
    const storedValue = getUserId();
    const now = Date.now();

    if (!storedValue || ((now - storedValue.createdAt) > oneMonth)) {
        // REVIEW: should we also clear the merchantProvidedUserId?
        
        return setGeneratedUserId();
    }

    // When we deploy this for the first time, existing user storage
    // won't have the key `generatedUserId`. So, we'll set the `generateUserId` and expiry
    // to the existing expiry and `userId` key.
    if (storedValue && !storedValue.generatedUserId) {
        setGeneratedUserId(storedValue.userId, storedValue.createdAt);
    }

    return storedValue;
};
