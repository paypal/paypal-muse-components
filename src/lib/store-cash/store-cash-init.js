/* @flow */
import type { Config } from '../../types';

import { storeCashFpti } from './store-cash-fpti';

export const storeCashInit = (config : Config) => {
  storeCashFpti(config, {
    fltp: 'store-cash',
    es: 'connectionStarted',
    website: 'muse',
    feature: 'offer',
    subfeature1: 'store-cash',
    subfeature2: 'sdk',
    flavor: 'connectionStarted'
  });
};
