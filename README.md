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

The latest browser version of the benchmark is available at <https://v8.github.io/web-tooling-benchmark/>.

## Building

> This was tested with Node 6, Node 7 and Node 8.

To build the benchmark suite, run

```
$ npm install
```

assuming that you have a working [Node.js](https://nodejs.org) installation. Once
the command is done, it produces a bundled version that is suitable to run in
JS shells (i.e. `d8`, `jsc` or `jsshell`) in `dist/cli.js` and another bundle
in `dist/browser.js` that is used by the browser version in `dist/index.html`.

To build an individual benchmark rather than the entire suite, pass the `--env.only`
CLI flag:

```
$ npm run build -- --env.only babel
```

## Running

You can either run the benchmark suite directly via [Node](https://nodejs.org/),
i.e. like this:

```
$ node dist/cli.js
Running Web Tooling Benchmark 0.3.1...
--------------------------------------
         acorn:  9.19 runs/sec
         babel:  6.74 runs/sec
       babylon:  8.72 runs/sec
         buble:  7.67 runs/sec
          chai: 13.28 runs/sec
  coffeescript:  6.80 runs/sec
        espree:  5.45 runs/sec
       esprima:  7.67 runs/sec
        jshint:  8.41 runs/sec
         lebab:  8.88 runs/sec
       prepack:  8.81 runs/sec
      prettier: 11.21 runs/sec
    source-map: 17.22 runs/sec
    typescript: 10.70 runs/sec
     uglify-es: 20.16 runs/sec
     uglify-js:  8.22 runs/sec
--------------------------------------
Geometric mean:  9.37 runs/sec
```

Or you open a web browser and point it to `dist/index.html`, or you can use one
of the engine JS shells to run the special bundle in `dist/cli.js`. The easiest
way to install recent versions of the supported JS engine shells is to run
[`jsvu`](https://github.com/GoogleChromeLabs/jsvu). Afterwards, you can run the
benchmark as follows:

```sh
$ chakra dist/cli.js
$ javascriptcore dist/cli.js
$ spidermonkey dist/cli.js
$ v8 dist/cli.js
```

To run an individual benchmark rather than the entire suite via Node, pass the
`--only` CLI flag:

```
$ node dist/cli.js --only babel
```
