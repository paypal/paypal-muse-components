/* @flow */
/* eslint import/no-default-export: off */

import { getKarmaConfig } from 'grumbler-scripts/config/karma.conf';
import { getWebpackConfig } from 'grumbler-scripts/config/webpack.config';

import type { MuseGlobalType } from './src/types';

const museGlobal : MuseGlobalType = {
    serverConfig: {
        assetsUrl: 'https://paypal.com/assets/'
    }
};

export default (karma : Object) => {
    const karmaConfig = getKarmaConfig(karma, {
        basePath: __dirname,
        webpack:  getWebpackConfig({
            vars: {
                __muse__: museGlobal,

                __PORT__:       8000,
                __STAGE_HOST__: 'msmaster.qa.paypal.com',
                __HOST__:       'test.paypal.com',
                __HOSTNAME__:   'test.paypal.com',
                __PATH__:       '/sdk/js',
                __VERSION__:    '1.0.55',
                __NAMESPACE__:  'testpaypal'
            }
        })
    });

    karma.set({
        ...karmaConfig,
        files: [
            {
                pattern:  'test/paypal.js',
                included: true,
                served:   true
            },

            ...karmaConfig.files
        ]
    });
};
