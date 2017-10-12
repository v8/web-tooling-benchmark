# Web Tooling Benchmark

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

This is work-in-progress benchmark suite that tries to measure the
JavaScript related workloads required by Web Developers nowadays.
It's the explicit goal not to measure I/O or other non-JavaScript
related tasks.

## Philosophy

I love the web! I love working on [Chromium](http://www.chromium.org) - more
specifically on [V8](http://v8project.org) - to make the web even better! But
building the best browser is only a small piece of the puzzle. I see browsers
as similar to TV screens: They provide you with the *frame*. Having an awesome
TV screen is nice, but doesn't buy you anything if there's no content and no
one providing the infrastructure to deliver the content.
With the web it's very similar, and so for the continued success of the web
it's important to not only focus on the browser, but also support the
content producers in the best way we can to ensure that we continue to have
great websites with interesting content. V8 is in a kind of unique position
here at this point in time, since it doesn't only power all Chromiun based
browsers, but also powers [Node.js](https://www.nodejs.org), which in turn
provides the runs a lot of the enterprise services today, but even more
importantly powers almost all the tooling used to create the web experiences.

And this tooling (plus the support story around it) is one of the critical
factors for companies when choosing a platform. The web platform today has
an amazing set of tools, a very active community around most of them, which
makes the web attractive as the main platform for so many companies. Besides
several other aspects, it's important that these tools run reasonably fast.
For example for developers that use [test-driven development
(TDD)](https://en.wikipedia.org/wiki/Test-driven_development) it's crucial
that the tests execute quickly. Or when using
[TypeScript](https://www.typescriptlang.org) for development, it's important
that the type checking and compilation to JavaScript doesn't take too long,
especially when combined with a test-driven work-flow.

Driving progress on the engine related aspects of the web tooling is the
main motivation behind this benchmark suite. It tries to isolate the
JavaScript heavy workloads from the most common tools used by the web
platform. Specifically I/O and other non-JavaScript related aspects are
excluded from the measurement.

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
- A test to stress the [Lebab](https://github.com/lebab/lebab)
  ES5 to ES6/ES7 transpiler, modernizing the preact bundle.
- A test to stress the [Prettier](https://github.com/prettier/prettier)
  code formatter with various `.js` and `.jsx` inputs.
- A test to stress the [source-map](https://github.com/mozilla/source-map)
  tool on both parsing and serializing source maps.
- A test to stress the [TypeScript](https://github.com/Microsoft/TypeScript)
  compiler on the [`typescript-angular`](https://github.com/tastejs/todomvc/tree/master/examples/typescript-angular)
  example from [todomvc](https://github.com/tastejs/todomvc).
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
