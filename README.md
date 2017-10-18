# Web Tooling Benchmark

[![Build Status](https://travis-ci.org/v8/web-tooling-benchmark.svg?branch=master)](https://travis-ci.org/v8/web-tooling-benchmark) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

This is a benchmark suite designed to measure the JavaScript related
workloads commonly used by Web Developers nowadays, for example the
core workloads in popular tools like [Babel](https://github.com/babel/babel)
or [TypeScript](https://github.com/Microsoft/TypeScript). It's the
explicit goal to measure **only** the JavaScript performance aspect,
which is affected by the JavaScript engine, and not measure I/O or
other unrelated aspects.

See the [in-depth
analysis](https://github.com/v8/web-tooling-benchmark/blob/master/docs/in-depth.md)
for a detailed description of the tests included in this benchmark suite.


## Building

> This was tested with Node 6, Node 7 and Node 8.

Building the benchmark suite is just a matter of running

```
$ npm install
```

assuming that you have a working [Node](https://nodejs.org) installation. Once
the command is done, it produces a bundled version that is suitable to run in
JS shells (i.e. `d8`, `jsc` or `jsshell`) in `dist/run.js` and another bundle
in `dist/bundle.js` that is used by the browser version in `dist/index.html`.

## Running

You can either run the benchmark suite directly via [Node](https://nodejs.org),
i.e. like this:

```
$ node src/cli
Running Web Tooling Benchmark 0.2.0...
--------------------------------------
         acorn: 10.16 runs/sec ±10.38%
         babel:  8.78 runs/sec  ±2.89%
       babylon:  9.31 runs/sec  ±8.50%
         buble:  7.91 runs/sec  ±9.95%
          chai: 15.95 runs/sec  ±2.50%
  coffeescript:  7.06 runs/sec ±11.46%
        espree:  6.75 runs/sec ±14.73%
       esprima:  6.49 runs/sec ±13.16%
        jshint:  9.85 runs/sec ±10.13%
         lebab: 12.20 runs/sec  ±7.63%
       prepack:  8.88 runs/sec  ±9.47%
      prettier: 11.01 runs/sec  ±8.09%
    source-map: 19.43 runs/sec  ±1.31%
    typescript: 12.71 runs/sec  ±8.55%
     uglify-js:  9.49 runs/sec  ±4.89%
     uglify-es: 22.84 runs/sec  ±4.86%
--------------------------------------
Geometric mean: 10.45 runs/sec
```

Or you open a web browser and point it to `dist/index.html`, or you can use one
of the engine JS shells (`d8`, `jsc`, `ch` or `jsshell`) to run the special bundle
in `dist/run.js`.