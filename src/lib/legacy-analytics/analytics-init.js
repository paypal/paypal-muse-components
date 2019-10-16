/* @flow */
import type { Config } from '../../types';

import { legacyFpti } from './legacy-fpti';

export const analyticsInit = (config : Config) => {
  legacyFpti(config, {
    fltp: 'store-cash',
    es: 'connectionStarted',
    website: 'muse',
    feature: 'offer',
    subfeature1: 'store-cash',
    subfeature2: 'sdk',
    flavor: 'connectionStarted'
  });
};
