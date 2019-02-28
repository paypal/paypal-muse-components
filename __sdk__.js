/* @flow */
/* eslint import/no-commonjs: 0 */

module.exports = {
    'muse': {
        entry:           './src/index',
        staticNamespace: '__muse__',
        automatic:        true
    },
    'tracker': {
        entry:           './src/tracker',
        staticNamespace: '__tracker__',
        automatic:        true
    }
};
