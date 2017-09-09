// Copyright (c) 2017 Benedikt Meurer
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Polyfill relevant bits of the console object.
if (typeof console === 'undefined') {
  console = {log: print};
}

// Polyfill global object references.
if (typeof global === 'undefined') {
  global = this;
}
if (typeof self === 'undefined') {
  self = this;
}

// Polyfill performance object.
if (typeof performance === 'undefined') {
  performance = {now: Date.now};
}

// Simple framework for running the benchmark suites and
// computing a score based on the timing measurements.

// Benchmark results hold the benchmark and the measured time used to
// run the benchmark. The benchmark score is computed later once a
// full benchmark suite has run to completion.
class BenchmarkResult {
  constructor(benchmark, time) {
    this.benchmark = benchmark;
    this.time = time;
  }

  [Symbol.toPrimitive]() {
    return this.time;
  }
}

// A benchmark has a name (string) and a function that will be run to
// do the performance measurement. The optional setup and tearDown
// arguments are functions that will be invoked before and after
// running the benchmark, but the running time of these functions will
// not be accounted for in the benchmark score.
class Benchmark {
  constructor(name, doWarmup, doDeterministic, deterministicIterations, 
              run, setup, tearDown, minIterations) {
    this.name = name;
    this.doWarmup = doWarmup;
    this.doDeterministic = doDeterministic;
    this.deterministicIterations = deterministicIterations;
    this.run = run;
    this.Setup = setup || function() {};
    this.TearDown = tearDown || function() {};
    this.minIterations = minIterations ? minIterations : 32;
  }
}

// Suites of benchmarks consist of a name and the set of benchmarks in
// addition to the reference timing that the final score will be based
// on. This way, all scores are relative to a reference run and higher
// scores implies better performance.
function BenchmarkSuite(name, reference, benchmarks) {
  this.name = name;
  this.reference = reference;
  this.benchmarks = benchmarks;
  BenchmarkSuite.suites.push(this);
}


// Keep track of all declared benchmark suites.
BenchmarkSuite.suites = [];

// Scores are not comparable across versions. Bump the version if
// you're making changes that will affect that scores, e.g. if you add
// a new benchmark or change an existing one.
BenchmarkSuite.version = '1';


// Defines global benchsuite running mode that overrides benchmark suite 
// behavior. Intended to be set by the benchmark driver. Undefined 
// values here allow a benchmark to define behaviour itself.
BenchmarkSuite.config = {
  doWarmup: undefined,
  doDeterministic: undefined
};


// To make the benchmark results predictable, we replace Math.random
// with a 100% deterministic alternative.
BenchmarkSuite.ResetRNG = function() {
  Math.random = (function() {
    var seed = 49734321;
    return function() {
      // Robert Jenkins' 32 bit integer hash function.
      seed = ((seed + 0x7ed55d16) + (seed << 12))  & 0xffffffff;
      seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
      seed = ((seed + 0x165667b1) + (seed << 5))   & 0xffffffff;
      seed = ((seed + 0xd3a2646c) ^ (seed << 9))   & 0xffffffff;
      seed = ((seed + 0xfd7046c5) + (seed << 3))   & 0xffffffff;
      seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
      return (seed & 0xfffffff) / 0x10000000;
    };
  })();
}


// Runs all registered benchmark suites and optionally yields between
// each individual benchmark to avoid running for too long in the
// context of browsers. Once done, the final score is reported to the
// runner.
BenchmarkSuite.RunSuites = function(runner, skipBenchmarks) {
  skipBenchmarks = typeof skipBenchmarks === 'undefined' ? [] : skipBenchmarks;
  var continuation = null;
  var suites = BenchmarkSuite.suites;
  var length = suites.length;
  BenchmarkSuite.scores = [];
  var index = 0;
  function RunStep() {
    while (continuation || index < length) {
      if (continuation) {
        continuation = continuation();
      } else {
        var suite = suites[index++];
        if (runner.NotifyStart) runner.NotifyStart(suite.name);
        if (skipBenchmarks.indexOf(suite.name) > -1) {
          suite.NotifySkipped(runner);
        } else {
          continuation = suite.RunStep(runner);
        }
      }
      if (continuation && typeof window != 'undefined' && window.setTimeout) {
        window.setTimeout(RunStep, 25);
        return;
      }
    }

    // show final result
    if (runner.NotifyScore) {
      var score = BenchmarkSuite.GeometricMean(BenchmarkSuite.scores);
      var formatted = BenchmarkSuite.FormatScore(score);
      runner.NotifyScore(formatted);
    }
  }
  RunStep();
}


// Counts the total number of registered benchmarks. Useful for
// showing progress as a percentage.
BenchmarkSuite.CountBenchmarks = function() {
  var result = 0;
  var suites = BenchmarkSuite.suites;
  for (var i = 0; i < suites.length; i++) {
    result += suites[i].benchmarks.length;
  }
  return result;
}


// Computes the geometric mean of a set of numbers.
BenchmarkSuite.GeometricMean = function(numbers) {
  var log = 0;
  for (var i = 0; i < numbers.length; i++) {
    log += Math.log(numbers[i]);
  }
  return Math.pow(Math.E, log / numbers.length);
}


// Converts a score value to a string with at least three significant
// digits.
BenchmarkSuite.FormatScore = function(value) {
  if (value > 100) {
    return value.toFixed(0);
  } else {
    return value.toPrecision(3);
  }
}

// Notifies the runner that we're done running a single benchmark in
// the benchmark suite. This can be useful to report progress.
BenchmarkSuite.prototype.NotifyStep = function(result) {
  this.results.push(result);
  if (this.runner.NotifyStep) this.runner.NotifyStep(result.benchmark.name);
}


// Notifies the runner that we're done with running a suite and that
// we have a result which can be reported to the user if needed.
BenchmarkSuite.prototype.NotifyResult = function() {
  var mean = BenchmarkSuite.GeometricMean(
      this.results.map(measurement => measurement.time));
  var score = (100 * this.reference) / mean;
  BenchmarkSuite.scores.push(score);
  if (this.runner.NotifyResult) {
    var formatted = BenchmarkSuite.FormatScore(score);
    this.runner.NotifyResult(this.name, formatted);
  }
}


BenchmarkSuite.prototype.NotifySkipped = function(runner) {
  BenchmarkSuite.scores.push(1);  // push default reference score.
  if (runner.NotifyResult) {
    runner.NotifyResult(this.name, "Skipped");
  }
}


// Notifies the runner that running a benchmark resulted in an error.
BenchmarkSuite.prototype.NotifyError = function(error) {
  if (this.runner.NotifyError) {
    this.runner.NotifyError(this.name, error);
  }
  if (this.runner.NotifyStep) {
    this.runner.NotifyStep(this.name);
  }
}


// Runs a single benchmark for at least a second and computes the
// average time it takes to run a single iteration.
BenchmarkSuite.prototype.RunSingleBenchmark = function(benchmark, data) {
  var config = BenchmarkSuite.config;
  var doWarmup = config.doWarmup !== undefined 
                 ? config.doWarmup 
                 : benchmark.doWarmup;
  var doDeterministic = config.doDeterministic !== undefined 
                        ? config.doDeterministic 
                        : benchmark.doDeterministic;

  function Measure(data) {
    var elapsed = 0;
    var start = performance.now();
  
  // Run either for 1 second or for the number of iterations specified
  // by minIterations, depending on the config flag doDeterministic.
    for (var i = 0; (doDeterministic ? 
      i<benchmark.deterministicIterations : elapsed < 1000); i++) {
      benchmark.run();
      elapsed = performance.now() - start;
    }
    if (data != null) {
      data.runs += i;
      data.elapsed += elapsed;
    }
  }

  // Sets up data in order to skip or not the warmup phase.
  if (!doWarmup && data == null) {
    data = { runs: 0, elapsed: 0 };
  }

  if (data == null) {
    Measure(null);
    return { runs: 0, elapsed: 0 };
  } else {
    Measure(data);
    // If we've run too few iterations, we continue for another second.
    if (data.runs < benchmark.minIterations) return data;
    var usec = (data.elapsed * 1000) / data.runs;
    this.NotifyStep(new BenchmarkResult(benchmark, usec));
    return null;
  }
}


// This function starts running a suite, but stops between each
// individual benchmark in the suite and returns a continuation
// function which can be invoked to run the next benchmark. Once the
// last benchmark has been executed, null is returned.
BenchmarkSuite.prototype.RunStep = function(runner) {
  BenchmarkSuite.ResetRNG();
  this.results = [];
  this.runner = runner;
  var length = this.benchmarks.length;
  var index = 0;
  var suite = this;
  var data;

  // Run the setup, the actual benchmark, and the tear down in three
  // separate steps to allow the framework to yield between any of the
  // steps.

  function RunNextSetup() {
    if (index < length) {
      try {
        suite.benchmarks[index].Setup();
      } catch (e) {
        suite.NotifyError(e);
        return null;
      }
      return RunNextBenchmark;
    }
    suite.NotifyResult();
    return null;
  }

  function RunNextBenchmark() {
    try {
      data = suite.RunSingleBenchmark(suite.benchmarks[index], data);
    } catch (e) {
      suite.NotifyError(e);
      return null;
    }
    // If data is null, we're done with this benchmark.
    return (data == null) ? RunNextTearDown : RunNextBenchmark();
  }

  function RunNextTearDown() {
    try {
      suite.benchmarks[index++].TearDown();
    } catch (e) {
      suite.NotifyError(e);
      return null;
    }
    return RunNextSetup;
  }

  // Start out running the setup.
  return RunNextSetup();
}
