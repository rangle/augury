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
      'webpack.vendor.ts',
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
    extensions: ['','.ts','.js','.json']
  },

  module: {
    preLoaders: [{
      test: /\.ts$/,
      loader: 'tslint'
    }],
    loaders: [{
      // Support for .ts files.
      test: /\.ts$/,
      loader: 'ts',
      query: {
        'ignoreDiagnostics': [
          2403, // 2403 -> Subsequent variable declarations
          2300, // 2300 -> Duplicate identifier
          2374, // 2374 -> Duplicate number index signature
          2375  // 2375 -> Duplicate string index signature
        ]
      },
      exclude: [
        /\.min\.js$/,
        /\.spec\.ts$/,
        /\.e2e\.ts$/,
        /web_modules/,
        /test/,
        /node_modules\/(?!(ng2-.+))/
      ]
    }],
    noParse: [
      /rtts_assert\/src\/rtts_assert/,
      /reflect-metadata/,
      /.+zone\.js\/dist\/.+/,
      /.+angular2\/bundles\/.+/
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
