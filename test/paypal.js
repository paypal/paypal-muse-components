/* @flow */

import { setupSDK, insertMockSDKScript } from '@paypal/sdk-client/src';
import { SDK_QUERY_KEYS } from '@paypal/sdk-constants/src';

import * as muse from '../src'; // eslint-disable-line import/no-namespace

insertMockSDKScript({
    query: {
        [ SDK_QUERY_KEYS.MERCHANT_ID ]: 'xyz,hij,lmno'
    }
});

setupSDK([
    {
        name:     'must',
        requirer: () => muse
    }
]);
