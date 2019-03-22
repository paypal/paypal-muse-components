/* @flow */

export const getCookie = (cname : string) : string => {
    const name = `${ cname }=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
};

export const setCookie = (cname : string, cvalue : string, exMilliseconds : number) : void => {
    const d = new Date();
    d.setTime(d.getTime() + exMilliseconds);
    const expires = `expires=${ d.toUTCString() }`;
    document.cookie = `${ cname }=${ cvalue }; Path=/; ${ expires }`;
};
