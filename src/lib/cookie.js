/* @flow */
export const getCookieValue = (cookieName : string) => {
    const cookie = document.cookie.split(';').find(x => x.startsWith(cookieName));
    if (cookie !== undefined) {
        return cookie.split('=')[1]
    }
};

export const setCookie = (cookieName : string, cookieValue : string, expires : ?string) => {
    const today = new Date();
    const oneYearFromToday = new Date(
        today.getFullYear() + 1,
        today.getMonth(),
        today.getDate()
    );
    const defaultExpires = oneYearFromToday.toUTCString();
    const expiration = expires ? expires : defaultExpires;
    document.cookie = `${ cookieName }=${ cookieValue };expires=${ expiration }`;
};
