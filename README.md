# Web Tooling Benchmark

This is work-in-progress benchmark suite that tries to measure the
JavaScript related workloads required by Web Developers nowadays.
It's the explicit goal not to measure I/O or other non-JavaScript
related tasks.

## Test suite

The test suite currently contains:

- A test to stress the [Chai Assertion Library](http://chaijs.com),
  which is commonly used to write unit and integration tests.
- A test to stress the [Espree](https://github.com/eslint/espree)
  syntax analysis library on different common inputs, i.e. on
  the [jQuery](https://jquery.com) source code. Espree is a fork
  of [Esprima](http://esprima.org), and nowadays built on top of
  [Acorn](https://github.com/ternjs/acorn). It's representative
  for a whole class of popular parsing worklads.

## Building

The benchmark comes either as a complete runner in `dist/run.js` or
as individual runners, i.e. `dist/chai.js`, etc. To generate these
runners, execute the following command in the toplevel folder:

```
$ make
```

Currently this only works with GNU Make, and probably only on Linux
and macOS. Once you have generated the runners, you can run them
using either `node` or `d8` (the V8 shell), i.e.

```
$ ~/Projects/v8/out/Release/d8 dist/run.js
Chai: 24096
Espree: 21685
-----
Score (version 1): 22859
```

In the future we also plan to add a web frontend.
