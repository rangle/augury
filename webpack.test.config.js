const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const buildDir = path.join(__dirname, './build');

module.exports = {
  mode: 'development',

  entry: {
    'test': [
      path.join(__dirname, 'webpack.vendor.ts'),
      path.join(__dirname, 'webpack.test.bootstrap.ts'),
    ],
  },

  output: {
    path: buildDir,
    filename: '[name].js',
  },

  stats: {
    colors: true,
    reasons: true,
  },

  // Opt-in to the old behavior with the resolveLoader.moduleExtensions
  // - https://webpack.js.org/guides/migrating/#automatic-loader-module-name-extension-removed
  resolveLoader: {
    moduleExtensions: ['-loader'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: [
          /node_modules/
        ],
      },
      {
        test: /\.css$/,
        use: [
          'to-string-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.png$/,
        use: 'url-loader?mimetype=image/png',
      },
      {
        test: /\.html$/,
        use: 'raw-loader',
      },
    ],

    noParse: [
      /rtts_assert\/src\/rtts_assert/,
      /reflect-metadata/,
      /.+zone\.js\/dist\/.+/,
      /.+angular2\/bundles\/.+/,
    ],
  },

  resolve: {
    extensions: ['.ts', '.js', '.jsx'],
    modules: ['src', 'node_modules'],
  },

  node: {
    'fs': 'empty',
  },

  plugins: [
    new webpack.DefinePlugin({
      chrome: '{runtime: {connect: function() {}}}'
    }),
    new CleanWebpackPlugin(buildDir),
  ],
};
