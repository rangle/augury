var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: {
    'test': [
      path.join(__dirname, 'webpack.vendor.ts'),
      path.join(__dirname, 'webpack.test.bootstrap.ts')
    ]
  },

  output: {
    path: path.join(__dirname, './build'),
    filename: '[name].js'
  },
  stats: {
    colors: true,
    reasons: true
  },
  module: {
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
