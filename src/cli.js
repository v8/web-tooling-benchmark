// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const align = require("string-align");
const gmean = require("compute-gmean");
const packageJson = require("../package.json");
const suite = require("./suite");

console.log(`Running Web Tooling Benchmark ${packageJson.version}...`);
console.log("--------------------------------------");

suite.on("error", event => {
  const benchmark = event.target;
  const name = benchmark.name;
  const error = benchmark.error;
  console.log(`Encountered error running benchmark ${name}, aborting...`);
  console.log(error.stack);
  suite.abort();
});

suite.on("cycle", event => {
  if (suite.aborted) return;
  const benchmark = event.target;
  const name = benchmark.name;
  const hz = benchmark.hz;
  const stats = benchmark.stats;
  console.log(
    `${align(name, 14, "right")}: ${align(
      hz.toFixed(2),
      5,
      "right"
    )} runs/sec ${align(`\xb1${stats.rme.toFixed(2)}%`, 7, "right")}`
  );
});

suite.on("complete", event => {
  if (suite.aborted) return;
  const hz = gmean(suite.map(benchmark => benchmark.hz));
  console.log("--------------------------------------");
  console.log(`Geometric mean: ${align(hz.toFixed(2), 5, "right")} runs/sec`);
});

suite.run();
