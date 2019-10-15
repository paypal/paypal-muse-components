/* @flow */
import type { Config } from '../../types';

import { storeCashFpti } from './store-cash-fpti';

export const storeCashCancel = (config : Config) => {
  storeCashFpti(config, {
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
