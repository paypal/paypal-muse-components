/* @flow */
import type { Config } from '../../types';

import { storeCashFpti } from './store-cash-fpti';

export const storeCashPurchase = (config : Config) => {
  storeCashFpti(config, {
    fltp: 'analytics',
    es: 'txnSuccess',
    website: 'muse',
    feature: 'offer',
    subfeature1: 'store-cash',
    subfeature2: 'sdk',
    flavor: 'txnSuccess'
  });
};
