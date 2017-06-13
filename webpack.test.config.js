var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: {
    test: [path.join(__dirname, 'webpack.vendor.ts'), path.join(__dirname, 'webpack.test.bootstrap.ts')],
  },

  output: {
    path: path.join(__dirname, './build'),
    filename: '[name].js',
  },
  stats: {
    colors: true,
    reasons: true,
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.css$/,
        use: ['to-string-loader', 'style-loader', 'css-loader', 'postcss-loader'],
      },
      { test: /\.png$/, loader: 'url-loader?mimetype=image/png' },
      { test: /\.html$/, loader: 'raw-loader' },
    ],
    noParse: [/rtts_assert\/src\/rtts_assert/, /reflect-metadata/, /.+zone\.js\/dist\/.+/, /.+angular2\/bundles\/.+/],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: ['src', 'node_modules'],
  },

  node: {
    fs: 'empty',
  },

  plugins: [
    new webpack.DefinePlugin({
      chrome: '{runtime: {connect: function() {}}}',
    }),
  ],
};
