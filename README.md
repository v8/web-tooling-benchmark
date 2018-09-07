# Web Tooling Benchmark

[![Build Status](https://travis-ci.org/v8/web-tooling-benchmark.svg?branch=master)](https://travis-ci.org/v8/web-tooling-benchmark) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

This is a benchmark suite designed to measure the JavaScript-related
workloads commonly used by web developers, such as the
core workloads in popular tools like [Babel](https://github.com/babel/babel)
or [TypeScript](https://github.com/Microsoft/TypeScript). The goal is to measure **only** the
JavaScript performance aspect (which is affected by the JavaScript engine) and not measure I/O
or other unrelated aspects.

See the [in-depth
analysis](https://github.com/v8/web-tooling-benchmark/blob/master/docs/in-depth.md)
for a detailed description of the tests included in this benchmark suite.

The latest browser version of the benchmark is available at
<https://v8.github.io/web-tooling-benchmark/>.

## Support

The Web Tooling Benchmark supports the latest [active
LTS](https://github.com/nodejs/Release#release-schedule) version of Node.js. To see the supported
Node.js versions of the current version of the benchmark, see [the `node_js` section of our CI
configuration](https://github.com/v8/web-tooling-benchmark/blob/master/.travis.yml).

## Building

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
Running Web Tooling Benchmark v0.5.2…
-------------------------------------
         acorn:  5.50 runs/s
         babel:  6.10 runs/s
  babel-minify:  9.13 runs/s
       babylon:  8.00 runs/s
         buble:  4.77 runs/s
          chai: 14.47 runs/s
  coffeescript:  5.62 runs/s
        espree:  4.05 runs/s
       esprima:  6.68 runs/s
        jshint:  7.84 runs/s
         lebab:  7.52 runs/s
       postcss:  5.06 runs/s
       prepack:  6.26 runs/s
      prettier:  5.97 runs/s
    source-map:  8.60 runs/s
        terser: 16.40 runs/s
    typescript: 10.04 runs/s
     uglify-js:  3.81 runs/s
-------------------------------------
Geometric mean:  6.98 runs/s
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
$ npm run build -- --env.only babel && npm run benchmark
```
