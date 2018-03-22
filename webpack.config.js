/*
 * Helpers
 */
var sliceArgs = Function.prototype.call.bind(Array.prototype.slice);
var toString = Function.prototype.call.bind(Object.prototype.toString);
var NODE_ENV = process.env.NODE_ENV || 'production';
var pkg = require('./package.json');

// Polyfill
Object.assign = require('object-assign');

// Node
var path = require('path');

// NPM
var webpack = require('webpack');

// Webpack Plugins
var OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var DedupePlugin = webpack.optimize.DedupePlugin;
var DefinePlugin = webpack.DefinePlugin;
var BannerPlugin = webpack.BannerPlugin;
var MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");

/**
 * CROSS-BROWSER COMPATIBILITY
 * We use different build configurations depending on browser.
 * For example, browsers have different support for properties on manifest.json
 */

// browsers we support
const BROWSER = {
  FIREFOX: 'FIREFOX',
  CHROME: 'CHROME'
}

// browser-specific manifest file created during build.
// `merge-jsons-webpack-plugin` needs relative paths from the build folder.
const MANIFEST_OUTPUT = `../manifest.json`

// manifest.json properties shared by all browsers
const BASE_MANIFEST = `manifest/base.manifest.json`

// target browser parameter is case insensitive (default chrome)
const interpretTargetBrowser = (requested = '') => {
  return Object.keys(BROWSER)
    .find(browser => browser == requested.toUpperCase())
    || BROWSER.CHROME
}

// each browser can extend the base manifest with a file of this form
const getManifestExtension = (targetBrowser) =>
  `manifest/${targetBrowser.toLowerCase()}.manifest.json`

// grab target browser parameter (passed as command arg)
const targetBrowser = interpretTargetBrowser(process.env.BROWSER)

// grab manifest extension
const manifestExtension = getManifestExtension(targetBrowser)

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
    'frontend': [
      'webpack.vendor.ts',
      './src/frontend/module'
    ],
    'backend': ['./src/backend/backend'],
    'ng-validate': ['./src/utils/ng-validate'],
    'devtools': ['./src/devtools/devtools'],
    'content-script': ['./src/content-script'],
    'background': [
      './src/channel/channel',
      './src/sentry-connection/sentry-connection',
      './src/gtm-connection/gtm-connection'
    ]
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
    extensions: ['', '.ts', '.js', '.json']
  },
  module: {
    preLoaders: [{
      test: /\.ts$/,
      loader: 'tslint',
      exclude: /node_modules/,
    }],
    loaders: [{
      // Support for .ts files.
      test: /\.ts$/,
      loader: 'ts',
      query: {
        'ignoreDiagnostics': []
      },
      exclude: [
        /\.min\.js$/,
        /\.spec\.ts$/,
        /\.e2e\.ts$/,
        /web_modules/,
        /test/,
        /node_modules\/(?!(ng2-.+))/
      ]
    }, {
      test: /\.css$/,
      loader: 'css!postcss'
    }, {
      test: /\.png$/,
      loader: "url-loader?mimetype=image/png"
    }, {
      test: /\.html$/,
      loader: 'raw'
    }],
    noParse: [
      /rtts_assert\/src\/rtts_assert/,
      /reflect-metadata/,
      /.+zone\.js\/dist\/.+/,
      /.+angular2\/bundles\/.+/
    ]
  },

  postcss: function () {
    return [
      require('postcss-import')({ addConfigTo: webpack }),
      require('postcss-cssnext')
    ];
  },

  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'PRODUCTION': JSON.stringify(process.env.NODE_ENV !== 'development'),
      'VERSION': JSON.stringify(pkg.version),
      'SENTRY_KEY': JSON.stringify(process.env.SENTRY_KEY),
    }),
    new OccurenceOrderPlugin(),
    new DedupePlugin(),
    new MergeJsonWebpackPlugin({
        "files": [
            BASE_MANIFEST,
            manifestExtension,
        ],
        "output": {
            "fileName": MANIFEST_OUTPUT
        }
    }),
  ].concat((NODE_ENV == 'production') ?  [
    new UglifyJsPlugin()
  ] : [
    // ... dev-only plugins
  ]),

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
  if (configEnv === undefined) {
    return configEnv;
  }
  switch (toString(configEnv[NODE_ENV])) {
    case '[object Object]'    :
      return Object.assign({}, configEnv.all || {}, configEnv[NODE_ENV]);
    case '[object Array]'     :
      return [].concat(configEnv.all || [], configEnv[NODE_ENV]);
    case '[object Undefined]' :
      return configEnv.all;
    default                   :
      return configEnv[NODE_ENV];
  }
}

function root(args) {
  args = sliceArgs(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}
