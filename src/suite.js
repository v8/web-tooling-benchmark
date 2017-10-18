// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const Benchmark = require("benchmark");

const suite = new Benchmark.Suite();

suite.add(require("./acorn-benchmark"));
suite.add(require("./babel-benchmark"));
suite.add(require("./babylon-benchmark"));
suite.add(require("./buble-benchmark"));
suite.add(require("./chai-benchmark"));
suite.add(require("./coffeescript-benchmark"));
suite.add(require("./espree-benchmark"));
suite.add(require("./esprima-benchmark"));
suite.add(require("./jshint-benchmark"));
suite.add(require("./lebab-benchmark"));
suite.add(require("./prepack-benchmark"));
suite.add(require("./prettier-benchmark"));
suite.add(require("./source-map-benchmark"));
suite.add(require("./typescript-benchmark"));
suite.add(require("./uglify-js-benchmark"));
suite.add(require("./uglify-es-benchmark"));

module.exports = suite;
