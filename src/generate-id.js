/* @flow */

export const generateId = () : string =>
    [ Math.random(), Math.random() ].map(x => x.toString(16).slice(2)).join('');
