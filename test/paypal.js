/* @flow */

import { setupSDK, insertMockSDKScript } from '@paypal/sdk-client/src';
import { SDK_QUERY_KEYS } from '@paypal/sdk-constants/src';

// eslint-disable-next-line import/no-namespace
import * as muse from '../src';

insertMockSDKScript({
    query: {
        [ SDK_QUERY_KEYS.MERCHANT_ID ]: 'xyz,hij,lmno'
    }
});

setupSDK([
    {
        name: 'must',
        requirer: () => muse
    }
]);
