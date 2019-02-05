/* @flow */

import { getHost, getPath } from '@paypal/sdk-client/src';

const script = document.createElement('script');
script.setAttribute('type', 'mock/javascript');
script.setAttribute('src', `https://${ getHost() }${ getPath() }?client-id=abc&merchant-id=xyz`);
script.setAttribute('data-client-token', 'TEST');
script.setAttribute('id', 'sdk');

const body = document.body;

if (body) {
    body.appendChild(script);
}

window.paypal = require('../src');

require('../src/component').insertPptm();
