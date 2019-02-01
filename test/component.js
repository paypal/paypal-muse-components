/* @flow */

import { ENV } from '@paypal/sdk-constants/src';
import { expect } from 'chai';

import * as component from '../src/component'; // eslint-disable-line import/no-namespace

describe('muse', () => {
    describe('DOM', () => {
        afterEach(() => {
            const script = document.getElementById(component.PPTM_ID);
    
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        });

        it('should insert pptm.js with client ID and merchant ID', () => {
            const script = document.getElementById(component.PPTM_ID);
            const expectedUrl = `id=${ window.location.hostname }&t=xo&mrid=xyz&client_id=abc`;
            let src = '';
    
            if (script) {
                // $FlowFixMe
                src = script.src;
            }

            expect(src).to.have.string(expectedUrl);
        });
    });

    describe('#getScriptSrc', () => {
        const mrid = 'abc';
        const clientId = 'xyz';
        const url = 'www.merchant-site.com';

        it('should get the correct test base URL', () => {
            const env = ENV.TEST;
            const src = component.getScriptSrc(env, mrid, clientId, url);

            expect(src).to.have.string(component.BASE_URL_LOCAL);
        });

        it('should get the correct local base URL', () => {
            const env = ENV.LOCAL;
            const src = component.getScriptSrc(env, mrid, clientId, url);

            expect(src).to.have.string(component.BASE_URL_LOCAL);
        });

        it('should get the correct stage base URL', () => {
            const env = ENV.STAGE;
            const src = component.getScriptSrc(env, mrid, clientId, url);

            expect(src).to.have.string(component.BASE_URL_STAGE);
        });

        it('should get the correct sandbox base URL', () => {
            const env = ENV.SANDBOX;
            const src = component.getScriptSrc(env, mrid, clientId, url);

            expect(src).to.have.string(component.BASE_URL_SANDBOX);
        });

        it('should get the correct production base URL', () => {
            const env = ENV.PRODUCTION;
            const src = component.getScriptSrc(env, mrid, clientId, url);

            expect(src).to.have.string(component.BASE_URL_PRODUCTION);
        });

        it('should not add mrid param to src if mrid is not present', () => {
            const src = component.getScriptSrc(ENV.TEST, null, clientId, url);

            expect(src).to.not.have.string('&mrid=');
        });

        it('should not add client_id param to source if client_id is not present', () => {
            const src = component.getScriptSrc(ENV.TEST, mrid, null, url);

            expect(src).to.not.have.string('&client_id=');
        });
    });
});
