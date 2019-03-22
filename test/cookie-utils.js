/* globals describe it */
/* @flow */

import { expect } from 'chai';

import { getCookie, setCookie } from '../src/cookie-utils';

describe('cookieUtils', () => {
    it('set the cookie you want to set', () => {
        expect(getCookie('__test__hello')).to.equal('');
        setCookie('__test__hello', '__test__cookie-value', 1000);
        expect(getCookie('__test__hello')).to.equal('__test__cookie-value');
    });
});
