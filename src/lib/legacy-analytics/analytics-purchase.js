/* @flow */
import type { Config } from '../../types';

import { legacyFpti } from './legacy-fpti';

export const analyticsPurchase = (config : Config) => {
  legacyFpti(config, {
    fltp: 'analytics',
    es: 'txnSuccess',
    website: 'muse',
    feature: 'offer',
    subfeature1: 'store-cash',
    subfeature2: 'sdk',
    flavor: 'txnSuccess'
  });
};
