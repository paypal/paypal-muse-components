/* @flow */
import type { Config } from '../../types';

import { legacyFpti } from './legacy-fpti';

export const merchantUserEvent = (config : Config) => {
  legacyFpti(config, {
    fltp: 'analytics',
    es: 'merchantRecognizedUser',
    mru: true,
    website: 'muse',
    feature: 'offer',
    subfeature1: 'store-cash',
    subfeature2: 'sdk',
    flavor: 'merchantRecognizedUser'
  });
};
