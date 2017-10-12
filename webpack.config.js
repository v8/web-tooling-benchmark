// Copyright (c) 2017 Benedikt Meurer
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

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
      })
    ]
  }
];
