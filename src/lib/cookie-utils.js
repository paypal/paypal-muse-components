/* @flow */
import generate from './generate-id';

export const getCookie = (cookieName : string) : string => {
    const name = `${ cookieName }=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.slice(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.slice(name.length, name.length + cookie.length);
        }
    }
    return '';
};

export const setCookie = (cookieName : string, cookieValue : string, expirationMilliseconds : number) : void => {
    const d = new Date();
    d.setTime(d.getTime() + expirationMilliseconds);
    const expires = `expires=${ d.toUTCString() }`;
    document.cookie = `${ cookieName }=${ cookieValue }; Path=/; ${ expires }`;
};

export const getUserIdCookie = () : ?string => {
    return getCookie('paypal-user-id') || null;
};

export const setRandomUserIdCookie = () : void => {
    const ONE_MONTH_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;
    setCookie('paypal-user-id', generate.generateId(), ONE_MONTH_IN_MILLISECONDS);
};
