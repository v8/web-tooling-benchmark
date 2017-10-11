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

const align = require('string-align');
const gmean = require('compute-gmean');
const packageJson = require('../package.json');
const suite = require('./suite');

console.log(`Running Web Tooling Benchmark ${packageJson.version}...`);
console.log("--------------------------------------");

suite.on('error', error => {
  console.log('Encountered error, aborting benchmark...');
  suite.abort();
});

suite.on('cycle', event => {
  const benchmark = event.target;
  const name = benchmark.name;
  const hz = benchmark.hz;
  const stats = benchmark.stats;
  console.log(`${align(name, 14, 'right')}: ${align(hz.toFixed(2), 5, 'right')} runs/sec ${align(`\xb1${stats.rme.toFixed(2)}%`, 7, 'right')}`);
});

suite.on('complete', event => {
  const sample = [];
  suite.forEach(benchmark => {
    sample.push(...benchmark.stats.sample);
  });
  const hz = 1 / gmean(sample);
  console.log("--------------------------------------");
  console.log(`Geometric mean: ${align(hz.toFixed(2), 5, 'right')} runs/sec`);
});

suite.run();
