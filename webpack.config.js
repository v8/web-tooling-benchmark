// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = [
  {
    context: path.resolve("src"),
    entry: "./cli.js",
    output: {
      filename: "run.js",
      path: path.resolve("dist")
    },
    bail: true,
    resolve: {
      alias: {
        fs: require.resolve("./src/vfs"),
        "graceful-fs": require.resolve("./src/vfs"),
        module: require.resolve("./src/mocks/dummy"),
        chokidar: require.resolve("./src/mocks/chokidar"),
        "uglify-js": require.resolve("./src/mocks/dummy"),
        // These modules are used by virtualfs to fake async fs calls
        "core-js/library/fn/set-immediate": require.resolve(
          "./src/mocks/set-immediate"
        ),
        "core-js/library/fn/clear-immediate": require.resolve(
          "./src/mocks/clear-immediate"
        )
      }
    },
    node: {
      setImmediate: false, // this disables also clearImmediate
      process: false
    },
    plugins: [
      new webpack.ProvidePlugin({
        setImmediate: require.resolve("./src/mocks/set-immediate"),
        clearImmediate: require.resolve("./src/mocks/clear-immediate"),
        process: require.resolve("./src/mocks/process")
      }),
      new webpack.BannerPlugin({
        banner:
          "// Required for JavaScript engine shells.\n" +
          "var global = this;\n" +
          "if (typeof console === 'undefined') {\n" +
          "  console = {log: print};\n" +
          "}",
        raw: true
      })
    ]
  },
  {
    context: path.resolve("src"),
    entry: "./bootstrap.js",
    output: {
      filename: "bundle.js",
      path: path.resolve("dist")
    },
    bail: true,
    resolve: {
      alias: {
        define: require.resolve("./src/mocks/dummy"),
        fs: require.resolve("./src/vfs"),
        "graceful-fs": require.resolve("./src/vfs"),
        module: require.resolve("./src/mocks/dummy"),
        chokidar: require.resolve("./src/mocks/chokidar"),
        "uglify-js": require.resolve("./src/mocks/dummy"),
        "core-js/library/fn/set-immediate": require.resolve(
          "./src/mocks/set-immediate"
        ),
        "core-js/library/fn/clear-immediate": require.resolve(
          "./src/mocks/clear-immediate"
        )
      }
    },
    node: {
      setImmediate: false,
      process: false
    },
    plugins: [
      new webpack.ProvidePlugin({
        setImmediate: require.resolve("./src/mocks/set-immediate"),
        clearImmediate: require.resolve("./src/mocks/clear-immediate"),
        process: require.resolve("./src/mocks/process")
      }),
      new CopyWebpackPlugin([{ from: "style.css" }, { from: "Logo.png" }]),
      new webpack.BannerPlugin({
        banner:
          "// Work-around for the weird JaegerMonkey\n" +
          "// work-around inside benchmark.js.\n" +
          "const define = { amd: {} };\n",
        raw: true
      }),
      new HtmlWebpackPlugin({
        template: "./index.html",
        inject: "head"
      })
    ]
  }
];
