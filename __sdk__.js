/* @flow */
/* eslint import/no-commonjs: 0 */

module.exports = {
    'muse': {
        entry:           './src/component',
        staticNamespace: '__muse__',
        automatic:        true,
        setupHandler:    'insertPptm'
    }
};
