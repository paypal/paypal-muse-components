/* globals expect */
/* @flow */
import { getCookie, setCookie } from '../src/lib/cookie-utils';

describe('cookieUtils', () => {
  it('set the cookie you want to set', () => {
    expect(getCookie('__test__hello')).toBe('');
    setCookie('__test__hello', '__test__cookie-value', 10000);
    expect(getCookie('__test__hello')).toBe('__test__cookie-value');
  });

  it('handles setting multiple cookie values', () => {
    setCookie('__test__hello1', '__test__cookie-value1', 10000);
    setCookie('__test__hello2', '__test__cookie-value2', 10000);
    expect(getCookie('__test__hello1')).toBe('__test__cookie-value1');
    expect(getCookie('__test__hello2')).toBe('__test__cookie-value2');
  });

  it('keeps the last value that was set as the cookie', () => {
    setCookie('__test__hello1', '__test__cookie-value1', 10000);
    setCookie('__test__hello1', '__test__cookie-value2', 10000);
    expect(getCookie('__test__hello1')).toBe('__test__cookie-value2');
  });

  it('returns an empty string if there is no cookie value', () => {
    expect(getCookie('___test__some-cookie-we-have-not-set')).toBe('');
  });
});
