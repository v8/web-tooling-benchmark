// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const webpack = require("webpack");

const payloads = [
  {
    entry: "/src/fixtures/webpack/a.js"
  }
].map(({ entry }, i) => ({
  entry,
  output: {
    path: "/dist/webpack/",
    filename: `bundle.${i}.js`
  },
  // Using bail option in order to receive noisy errors in the benchmark if something went wrong
  bail: true,
  // We need to define that because Firefox has a Object.prototype.watch function
  watch: false
}));

module.exports = {
  name: "webpack",
  defer: true,
  fn(deferred) {
    return Promise.all(
      payloads.map(
        config =>
          new Promise((resolve, reject) => {
            const compiler = webpack(config);
            compiler.run((err, stats) => void (err ? reject(err) : resolve()));
          })
      )
    ).then(() => deferred.resolve());
  }
};
