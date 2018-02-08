// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const Benchmark = require("benchmark");

// We need to run deterministically, so we set 'maxTime' to 0, which
// disables the variable iteration count feature of benchmark.js,
// and specify 'minSamples' as 20 to have it collect exactly 20
// samples. We leave the 'initCount' to the default of 1. See
// https://github.com/v8/web-tooling-benchmark/issues/6 for details.
const defaultOptions = {
  maxTime: 0,
  minSamples: 20
};

const suite = new Benchmark.Suite();

[
  require("./acorn-benchmark"),
  require("./babel-benchmark"),
  require("./babylon-benchmark"),
  require("./buble-benchmark"),
  require("./chai-benchmark"),
  require("./coffeescript-benchmark"),
  require("./espree-benchmark"),
  require("./esprima-benchmark"),
  require("./jshint-benchmark"),
  require("./lebab-benchmark"),
  require("./prepack-benchmark"),
  require("./prettier-benchmark"),
  require("./source-map-benchmark"),
  require("./std-esm-benchmark"),
  require("./typescript-benchmark"),
  require("./uglify-es-benchmark"),
  require("./uglify-js-benchmark")
].forEach(options => {
  if (options.fn) {
    suite.add(Object.assign({}, options, defaultOptions));
  }
});

module.exports = suite;
