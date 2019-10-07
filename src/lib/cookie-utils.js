/* @flow */
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
