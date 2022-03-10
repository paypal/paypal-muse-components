/* @flow */
/* eslint-disable-next-line import/no-commonjs */
module.exports = {
  'presets': [
    [
      '@babel/env', {
        'targets': {
          'ie': 11,
          'chrome': 27,
          'firefox': 30,
          'safari': 7,
          'opera': 23
        },
        'loose': true,
        'exclude': [
          'transform-regenerator'
        ]
      }
    ],
    '@babel/react',
    '@babel/flow'
  ],
  'plugins': [
    'babel-plugin-transform-es2015-modules-commonjs',
    [ '@babel/plugin-syntax-dynamic-import', { 'loose': true } ],
    [ '@babel/plugin-proposal-decorators', { 'loose': true, 'legacy': true } ],
    [ '@babel/plugin-proposal-class-properties', { 'loose': true } ],
    [ '@babel/plugin-transform-for-of', { 'assumeArray': true } ],
    [ '@babel/plugin-transform-runtime', { 'corejs': false, 'helpers': true, 'regenerator': false } ]
  ]
};
