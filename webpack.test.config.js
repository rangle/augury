var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: {
    test: [
      // Angular 2 Deps
      '@reactivex/rxjs',
      'zone.js',
      'reflect-metadata',
      path.join(__dirname, 'webpack.test.bootstrap.ts')
    ]
  },

  output: {
    path: path.join(__dirname, './build'),
    filename: '[name].js'
  },

  module: {
    loaders: [{
      // Support for .ts files.
      test: /\.ts$/,
      loader: 'ts',
      exclude: [
        /node_modules/
      ]
    }]
  },

  resolve: {
    extensions: ['', '.ts', '.js', '.jsx'],
    modulesDirectories: ['src', 'node_modules']
  },

  node: {
    fs: 'empty'
  }
};