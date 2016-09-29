'use strict';

const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  stats: {
    colors: true,
    reasons: true
  },

  entry: {
    app: './source/app.ts',
    vendor: [
      'core-js',
      'reflect-metadata',
      'zone.js/dist/zone',
      '@angular/platform-browser-dynamic',
      '@angular/core',
      '@angular/common',
      '@angular/router',
      '@angular/http'
     ]
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].bundle.js',
    publicPath: "/",
    sourceMapFilename: '[name].[hash].bundle.js.map',
    chunkFilename: '[id].chunk.js'
  },

  devtool: 'source-map',

  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', '[name].[hash].bundle.js'),
    new HtmlWebpackPlugin({
      template: './source/index.html',
      inject: 'body',
      minify: false
    })
  ],

  module: {
    preLoaders: [{
      test: /\.ts$/,
      loader: 'tslint'
    }],
    loaders: [
      { test: /\.ts$/, loader: 'ts', exclude: /node_modules/ },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.css$/, loader: 'style-loader!css-loader?sourceMap' },
      { test: /\.svg/, loader: 'url' },
      { test: /\.eot/, loader: 'url' },
      { test: /\.woff/, loader: 'url' },
      { test: /\.woff2/, loader: 'url' },
      { test: /\.ttf/, loader: 'url' },
    ],
    noParse: [ /zone\.js\/dist\/.+/, /angular2\/bundles\/.+/ ]
  },

  devServer: {
    inline: true,
    colors: true,
    contentBase: './dist',
    publicPath: '/'
  }
};
