/* @flow */
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpackTemplate from 'html-webpack-template';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url)
const __dirname = `${dirname(__filename)}`

const baseHref = '/muse2/';

const babelConfig = {
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
        [ 'transform-inline-environment-variables' ],
        'babel-plugin-transform-es2015-modules-commonjs',
        [ '@babel/plugin-syntax-dynamic-import', { 'loose': true } ],
        [ '@babel/plugin-proposal-decorators', { 'loose': true, 'legacy': true } ],
        [ '@babel/plugin-proposal-class-properties', { 'loose': true } ],
        [ '@babel/plugin-transform-for-of', { 'assumeArray': true } ],
        [ '@babel/plugin-transform-runtime', { 'corejs': false, 'helpers': true, 'regenerator': false } ]
    ]
};

const webpackConfig = {
    mode: 'development',
    entry: path.resolve(__dirname, 'iframes/identity/identity.js'),
    output: {
        path: path.resolve(__dirname, 'dist/identity'),
        filename: 'identity.js',
        publicPath: '/muse2/'
    },
    plugins: [ new HtmlWebpackPlugin({
        inject: false,
        template: webpackTemplate,
        title: 'Identity',
        showErrors: false,
        baseHref
    }) ],
    module: {
        rules: [ {
            test: /\.js$/,
            loader: 'babel-loader',
            options: babelConfig
        } ]
    },
    devServer: {
        disableHostCheck: true
    }
};

export default webpackConfig;