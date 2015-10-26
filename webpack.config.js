/**
 * Webpack Config
 * Based on angular2-webpack-starter by AngularClass
 * https://github.com/angular-class/angular2-webpack-starter
 */

/*
 * Helpers
 */
var sliceArgs = Function.prototype.call.bind(Array.prototype.slice);
var toString  = Function.prototype.call.bind(Object.prototype.toString);
var NODE_ENV  = process.env.NODE_ENV || 'development';
var pkg = require('./package.json');

// Polyfill
Object.assign = require('object-assign');

// Node
var path = require('path');

// NPM
var webpack = require('webpack');

// Webpack Plugins
var OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;
var CommonsChunkPlugin   = webpack.optimize.CommonsChunkPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var DedupePlugin   = webpack.optimize.DedupePlugin;
var DefinePlugin   = webpack.DefinePlugin;
var BannerPlugin   = webpack.BannerPlugin;

/*
 * Config
 */
module.exports = {
  devtool: 'source-map',
  debug: true,
  cache: true,

  verbose: true,
  displayErrorDetails: true,
  context: __dirname,
  stats: {
    colors: true,
    reasons: true
  },

  entry: {
    'app': [
      // Angular 2 Deps
      '@reactivex/rxjs',
      'zone.js',
      'reflect-metadata',
      // To ensure these modules are grouped together in one file
      'angular2/angular2',
      'angular2/core',
      'angular2/router',
      'angular2/http',
      'json-formatter-js',
      // Angular 2 ES6 browser shim
      'es6-shim',
      // Frontend
      './frontend/batarangle'
    ],
    'devtools': ['./devtools/devtools'],
    'backend': ['./backend/batarangle-backend'],
    'entry': ['./backend/entry'],
    'channel': ['./channel/channel']
  },

  // Config for our build files
  output: {
    path: root('build'),
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    root: __dirname,
    extensions: ['','.ts','.js','.json'],
    alias: {
      'rx': '@reactivex/rxjs'
    }
  },

  module: {
    loaders: [
      // Support for .ts files.
      { test: /\.ts$/,    loader: 'ts',
        query: {
          'ignoreDiagnostics': [
            // 2300, // 2300 -> Duplicate identifier
            // 2309 // 2309 -> An export assignment cannot be used in a module with other exported elements.
          ]
        },
        exclude: [
          /\.min\.js$/,
          /\.spec\.ts$/,
          /\.e2e\.ts$/,
          /web_modules/,
          /test/,
          /node_modules/
        ]
      }
    ],
    noParse: [
      /rtts_assert\/src\/rtts_assert/,
      /reflect-metadata/
    ]
  },

  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'VERSION': JSON.stringify(pkg.version)
    }),
    new OccurenceOrderPlugin(),
    new DedupePlugin()
  ],

  /*
   * When using `templateUrl` and `styleUrls` please use `__filename`
   * rather than `module.id` for `moduleId` in `@View`
   */
  node: {
    crypto: false,
    __filename: true
  }
};

/**
 * Utils
 */
function env(configEnv) {
  if (configEnv === undefined) { return configEnv; }
  switch (toString(configEnv[NODE_ENV])) {
    case '[object Object]'    : return Object.assign({}, configEnv.all || {}, configEnv[NODE_ENV]);
    case '[object Array]'     : return [].concat(configEnv.all || [], configEnv[NODE_ENV]);
    case '[object Undefined]' : return configEnv.all;
    default                   : return configEnv[NODE_ENV];
  }
}

function root(args) {
  args = sliceArgs(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}
