/* @flow */
/* eslint import/no-commonjs: 0 */

const globals = require('./globals');

module.exports = {
  messaging: {
    entry: './src/messaging',
    automatic: false
  },
  muse: {
    entry: './src/index',
    automatic: false
  },
  tracker: {
    entry: './src/tracker',
    automatic: false
  },
  shopping: {
    entry: './src/shopping',
    globals,
    automatic: false
  }
};
