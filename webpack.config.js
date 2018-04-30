const path = require('path');
const webpack = require('webpack');
const DefinePlugin = webpack.DefinePlugin;
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const pkg = require('./package.json');

// Environment config
const NODE_ENV = process.env.NODE_ENV || 'production';
const DIST_DIR = path.join(__dirname, 'build');
const isProduction = NODE_ENV === 'production';

/**
 * CROSS-BROWSER COMPATIBILITY (and other builds)
 * We use different build configurations depending on browser (or other builds, like canary).
 * For example, browsers have different support for properties on manifest.json
 */

// versions we produce
const BUILD = {
  FIREFOX: 'FIREFOX',
  CHROME: 'CHROME',
  CANARY: 'CANARY',
}

/*
 * Config
 */
module.exports = {
  mode: NODE_ENV,
  devtool: isProduction ? false : ' source-map',
  cache: true,
  context: __dirname,
  stats: {
    colors: true,
    reasons: true,
  },

  entry: {
    'frontend': [
      './webpack.vendor',
      './src/frontend/module',
    ],
    'backend': ['./src/backend/backend'],
    'ng-validate': ['./src/utils/ng-validate'],
    'devtools': ['./src/devtools/devtools'],
    'content-script': ['./src/content-script'],
    'background': [
      './src/channel/channel',
      './src/sentry-connection/sentry-connection',
      './src/gtm-connection/gtm-connection',
    ],
  },

  // Config for our build files
  output: {
    path: DIST_DIR,
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    chunkFilename: '[name].chunk.js',
  },

  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: ['./node_modules'],
  },

  // Opt-in to the old behavior with the resolveLoader.moduleExtensions
  // - https://webpack.js.org/guides/migrating/#automatic-loader-module-name-extension-removed
  resolveLoader: {
    modules: ['./node_modules'],
    moduleExtensions: ['-loader'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: [
          /\.spec\.ts$/,
          /node_modules\/(?!(ng2-.+))/
        ]
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

  plugins: [
    new ProgressPlugin(),
    new CleanWebpackPlugin(DIST_DIR),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'PRODUCTION': JSON.stringify(isProduction),
      'VERSION': JSON.stringify(pkg.version),
      'SENTRY_KEY': JSON.stringify(process.env.SENTRY_KEY),
    }),
    new MergeJsonWebpackPlugin({
      files: manifestFiles(),
      output: {
        fileName: '../manifest.json',
      },
    }),
  ].concat((isProduction) ?  [
    // ... prod-only plugins
  ] : [
    // ... dev-only plugins
    // new BundleAnalyzerPlugin(),
  ]),

  /*
   * When using `templateUrl` and `styleUrls` please use `__filename`
   * rather than `module.id` for `moduleId` in `@View`
   */
  node: {
    crypto: false,
    __filename: true,
  },
};

/**
 * Utils
 */

function targetBuild() {
  // target BUILD parameter is case insensitive (default chrome)
  const interpretTargetBuild = (requested = '') => {
    return Object.keys(BUILD)
      .find(build => build == requested.toUpperCase())
      || BUILD.CHROME;
  }

  // grab target build parameter (passed as command arg)
  return interpretTargetBuild(process.env.BUILD);
}

function manifestFiles() {
  return [
    // base manifest file
    'manifest/base.manifest.json',
    // each build can extend the base manifest with a file of this form
    `manifest/${targetBuild().toLowerCase()}.manifest.json`,
  ];
}
