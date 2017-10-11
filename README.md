# Web Tooling Benchmark

This is work-in-progress benchmark suite that tries to measure the
JavaScript related workloads required by Web Developers nowadays.
It's the explicit goal not to measure I/O or other non-JavaScript
related tasks.

## Test suite

The test suite currently contains:

- A test to stress the [Babe](https://github.com/babel/babel)
  transformation logic using the `es2015` preset on a 196K
  ES2015 module containing the untranspiled [Vue](https://github.com/vuejs/vue)
  source code.
- A test to stress the [Babylon](https://github.com/babel/babylon)
  syntax analysis library on different common inputs, i.e. on
  the [jQuery](https://jquery.com) source code. Babylon is the
  JavaScript parser used in [Babel](https://github.com/babel/babel)
  and is built on top of [Acorn](https://github.com/ternjs/acorn).
  It's representative for a whole class of popular parsing worklads.
- A test to stress the [Buble](https://github.com/Rich-Harris/buble)
  ES2015 compiler, both the parser and the actual transformation
  logic, on the same 196K ES2015 module containing the untranspiled
  [Vue](https://github.com/vuejs/vue) source code that is also used
  to stress by the `babel` and `babylon` tests.
- A test to stress the [Chai Assertion Library](http://chaijs.com),
  which is commonly used to write unit and integration tests.
- A test to stress the [source-map](https://github.com/mozilla/source-map)
  tool on both parsing and serializing source maps.
- A test to stress the [UglifyJS3](https://github.com/mishoo/UglifyJS2)
  minifier, running on the (concatenated) JavaScript source for
  the ES2015 test in the [Speedometer](https://browserbench.org/Speedometer)
  2.0 benchmark.

## Building

```
$ npm install
```

## Running

```
$ node src/main
babylon x 33.47 ops/sec ±11.03% (60 runs sampled)
chai x 163 ops/sec ±1.95% (80 runs sampled)
source-map x 15.57 ops/sec ±4.00% (42 runs sampled)
```
