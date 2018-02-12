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

const targetList = [
  "acorn",
  "babel",
  "babylon",
  "buble",
  "chai",
  "coffeescript",
  "espree",
  "esprima",
  "jshint",
  "lebab",
  "prepack",
  "prettier",
  "source-map",
  "typescript",
  "uglify-es",
  "uglify-js"
];

const suite = new Benchmark.Suite();
const targetItems = ONLY ? [ONLY] : null;

const requireList = (targetItems || targetList).map(val => {
  return require(`./${val}-benchmark`);
});

requireList.forEach(options => {
  suite.add(Object.assign({}, options, defaultOptions));
});

module.exports = suite;
