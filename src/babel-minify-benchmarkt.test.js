// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const babelMinifyBenchmark = require("./babel-minify-benchmark");

it("babel-minify-benchmark runs to completion", () =>
  void babelMinifyBenchmark.fn());
