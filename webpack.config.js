// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const targetList = require("./src/cli-flags-helper").targetList;

function getTarget(env) {
  return env && targetList.has(env.only) && env.only;
}

module.exports = env => [
  {
    context: path.resolve("src"),
    entry: "./cli.js",
    output: {
      filename: "cli.js",
      path: path.resolve("dist")
    },
    bail: true,
    resolve: {
      alias: {
        fs: require.resolve("./src/vfs"),
        module: require.resolve("./src/mocks/dummy")
      }
    },
    plugins: [
      new webpack.BannerPlugin({
        banner:
          "// Required for JavaScript engine shells.\n" +
          "var global = this;\n" +
          "if (typeof console === 'undefined') {\n" +
          "  console = {log: print};\n" +
          "}",
        raw: true
      }),
      new webpack.DefinePlugin({
        ONLY: JSON.stringify(getTarget(env))
      })
    ]
  },
  {
    context: path.resolve("src"),
    entry: "./bootstrap.js",
    output: {
      filename: "browser.js",
      path: path.resolve("dist")
    },
    bail: true,
    resolve: {
      alias: {
        define: require.resolve("./src/mocks/dummy"),
        fs: require.resolve("./src/vfs"),
        module: require.resolve("./src/mocks/dummy")
      }
    },
    plugins: [
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
      }),
      new webpack.DefinePlugin({
        ONLY: JSON.stringify(getTarget(env))
      })
    ]
  }
];
