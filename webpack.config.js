const path = require("path");
const webpack = require("webpack");
const DefinePlugin = webpack.DefinePlugin;
const ProgressPlugin = require("webpack/lib/ProgressPlugin");
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const AngularCompilerPlugin = require("@ngtools/webpack").AngularCompilerPlugin;

const pkg = require("./package.json");

// Environment config
const NODE_ENV = process.env.NODE_ENV || "production";
const DIST_DIR = path.join(__dirname, "build");
const isProduction = NODE_ENV === "production";

const BuildConfig = require("./build.config");
const env = BuildConfig.entries();
const manifestFiles = BuildConfig.manifestFiles();

console.log(`
  Building Augury with the following environment options:
   ${Object.keys(env)
     .map(k => `${k}: ${env[k]}`)
     .join("\n   ")}
`);

/*
 * Config
 */
module.exports = {
  mode: env.PROD_MODE ? "production" : "development",
  devtool: env.PROD_MODE ? false : " source-map",
  cache: true,
  context: __dirname,
  stats: {
    colors: true,
    reasons: true
  },

  entry: {
    frontend: ["./src/frontend/vendor", "./src/frontend/module"],
    backend: ["./src/backend/backend"],
    "ng-validate": ["./src/utils/ng-validate"],
    devtools: ["./src/devtools/devtools"],
    "content-script": ["./src/content-script"],
    background: [
      "./src/channel/channel",
      "./src/sentry-connection/sentry-connection",
      "./src/gtm-connection/gtm-connection"
    ]
  },

  // Config for our build files
  output: {
    path: DIST_DIR,
    filename: "[name].js",
    sourceMapFilename: "[name].js.map",
    chunkFilename: "[name].chunk.js"
  },

  resolve: {
    extensions: [".ts", ".js", ".json"],
    modules: ["./node_modules"],
    alias: {
      backend: path.resolve("./src/backend"),
      frontend: path.resolve("./src/frontend"),
      communication: path.resolve("./src/communication"),
      "feature-modules": path.resolve("./src/feature-modules"),
      tree: path.resolve("./src/tree")
    }
  },

  // Opt-in to the old behavior with the resolveLoader.moduleExtensions
  // - https://webpack.js.org/guides/migrating/#automatic-loader-module-name-extension-removed
  resolveLoader: {
    modules: ["./node_modules"],
    moduleExtensions: ["-loader"]
  },

  module: {
    rules: [
      {
        test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
        use: "@ngtools/webpack"
      },
      {
        test: /\.css$/,
        use: ["to-string-loader", "css-loader", "postcss-loader"]
      },
      {
        test: /\.png$/,
        use: "url-loader?mimetype=image/png"
      },
      {
        test: /\.html$/,
        use: "raw-loader"
      }
    ]
  },

  plugins: [
    new ProgressPlugin(),
    new CleanWebpackPlugin(),
    new DefinePlugin(BuildConfig.stringifyValues(env)),
    new AngularCompilerPlugin({
      tsConfigPath: "tsconfig.json",
      entryModule: "./src/frontend/module#FrontendModule",
      sourceMap: true
    }),
    new MergeJsonWebpackPlugin({
      files: manifestFiles,
      output: {
        fileName: "../manifest.json"
      }
    })
  ].concat(
    env.PROD_MODE
      ? [
          // ... prod-only pluginss
        ]
      : [
          // ... dev-only plugins
          // new BundleAnalyzerPlugin(),
        ]
  ),

  /*
   * When using `templateUrl` and `styleUrls` please use `__filename`
   * rather than `module.id` for `moduleId` in `@View`
   */
  node: {
    crypto: false,
    __filename: true
  }
};
