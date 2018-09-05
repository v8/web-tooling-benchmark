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

## Support

The Web Tooling Benchmark supports the latest [active LTS](https://github.com/nodejs/Release#release-schedule) version of Node.js. To see the supported Node.js versions of the current version of the benchmark, see [the `node_js` section of our CI configuration](https://github.com/v8/web-tooling-benchmark/blob/master/.travis.yml).

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
Running Web Tooling Benchmark v0.5.1…
-------------------------------------
         acorn:  6.11 runs/s
         babel:  5.59 runs/s
  babel-minify:  6.79 runs/s
       babylon:  5.48 runs/s
         buble:  3.31 runs/s
          chai: 10.49 runs/s
  coffeescript:  4.72 runs/s
        espree:  3.44 runs/s
       esprima:  4.27 runs/s
        jshint:  6.38 runs/s
         lebab:  5.76 runs/s
       postcss:  4.35 runs/s
       prepack:  5.07 runs/s
      prettier:  4.36 runs/s
    source-map:  6.66 runs/s
        terser: 10.87 runs/s
    typescript:  6.62 runs/s
     uglify-js:  3.48 runs/s
-------------------------------------
Geometric mean:  5.45 runs/s
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
