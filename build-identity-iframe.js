const HtmlWebpackPlugin = require('html-webpack-plugin');
const babelConfig = require('./babel.config.js')
const webpack = require('webpack')
const path = require('path')

const webpackConfig = {
  mode: 'production',
  entry: path.resolve(__dirname, 'iframes/identity/identity.js'),
  output: {
    path: path.resolve(__dirname, 'dist/identity'),
    filename: 'identity.js'
  },
  plugins: [new HtmlWebpackPlugin({
    title: 'Identity',
    filename: 'identity.html',
    showErrors: false
  })],
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      options: babelConfig
    }]
  }
}

const compiler = webpack(webpackConfig);

compiler.run((err, stats) => {
  if (err) {
    console.error(err)
  }
})



