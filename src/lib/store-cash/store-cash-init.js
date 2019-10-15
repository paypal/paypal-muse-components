/* @flow */
import { storeCashFpti } from './store-cash-fpti';

export const storeCashInit = (config) => {
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
