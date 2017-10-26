// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const path = require("path");
const webpack = require("webpack");
const webpackConfig = require("../webpack.config.js");

const outputFile = path.resolve(
  __dirname,
  "..",
  "build",
  "webpack-benchmark.test.js"
);
let webpackBenchmark;

beforeAll(
  () =>
    new Promise((resolve, reject) => {
      const baseConfig = webpackConfig[0];
      const config = Object.assign({}, baseConfig, {
        entry: require.resolve("./webpack-benchmark.js")
      });
      config.output = Object.assign({}, baseConfig.output, {
        libraryTarget: "commonjs2",
        path: path.dirname(outputFile),
        filename: path.basename(outputFile)
      });
      const compiler = webpack(config);
      compiler.run(err => {
        if (err) {
          reject(err);
          return;
        }
        webpackBenchmark = require(outputFile);
        resolve();
      });
    })
);

it("webpack runs to completion", () => void webpackBenchmark.fn());
