# In-depth Analysis

The Web Tooling Benchmark contains interesting JavaScript workloads from a variety of
commonly used web developer tools. It executes these core workloads a couple of times
reports a single score at the end that balances them using geometric mean.

Note that scores of different versions of the Web Tooling Benchmark are not comparable
to each other.

## acorn

[Acorn](https://github.com/ternjs/acorn) is a tiny, fast JavaScript parser, written
completely in JavaScript. Acorn is the basis for many other JavaScript compiler
and code analysis tools, i.e. [webpack](https://webpack.js.org) uses acorn and
the [Babylon](https://github.com/babel/babylon) parser used by
[Babel](http://babeljs.io) today is also based on acorn.

This benchmarks runs the Acorn tokenizer, the parser and the full AST (Abstract
Syntax Tree) walker on several popular inputs, including
- the [Preact](https://github.com/developit/preact) 8.2.5 bundle,
- the [lodash](https://lodash.com) 4.17.4 bundle,
- the [underscore](http://underscorejs.org/) 1.8.3 bundle,
- an ES2015 module containing the untranspiled [Vue](https://github.com/vuejs/vue) bundle,
- the [jQuery](http://jquery.com) 3.2.1 distribution,
- the minified [Redux](https://redux.js.org) 3.7.2 distribution,
- the [Backbone.js](http://backbonejs.org) 1.1.0 bundle,
- and the (concatenated) JavaScript source for the Vanilla ES2015 test in the [Speedometer](https://browserbench.org/Speedometer).

## babel

[Babel](https://github.com/babel/babel) is a transpiler that compiles modern JavaScipt
(i.e. ES2015 and later) to an older JavaScript dialect (i.e. ES3 or ES5) that is understood
by a broad set of browsers. It's probably the most popular transpiler at this point in time
and used in the vast majority of web projects nowadays.

This benchmark runs the Babel transformation logic using the `es2015` preset on a 196KiB
ES2015 module containing the untranspiled [Vue](https://github.com/vuejs/vue) bundle.
Note that this explicitly excludes the [Babylon](https://github.com/babel/babylon) parser
and only measures the throughput on the actual transformations. The parser is tested
separately by the `babylon` benchmark below.

## babylon

[Babylon](https://github.com/babel/babylon) is the frontend for the Babel transpiler and
deals with transforming the JavaScript input into a so-called AST (Abstract Syntax Tree)
that can be consumed by the core transformation logic in Babel. It is built on top of
[Acorn](https://github.com/ternjs/acorn) nowadays.

This benchmark runs the Babylon parser on different popular inputs, including the
[Preact](https://github.com/developit/preact) 8.2.5 bundle, the [lodash](https://lodash.com)
4.17.4 bundle, the JSX files from the React TodoMVC example app, the
[underscore](http://underscorejs.org/) 1.8.3 bundle, an ES2015 module containing the
untranspiled [Vue](https://github.com/vuejs/vue) bundle, the [jQuery](http://jquery.com)
3.2.1 distribution, the minified [Redux](https://redux.js.org) 3.7.2 distribution, and
the (concatenated) JavaScript source for the Vanilla ES2015 test in the
[Speedometer](https://browserbench.org/Speedometer).

## buble

A test to stress the [Buble](https://github.com/Rich-Harris/buble)
ES2015 compiler, both the parser and the actual transformation
logic, on the same 196K ES2015 module containing the untranspiled
[Vue](https://github.com/vuejs/vue) source code that is also used
to stress by the `babel` and `babylon` tests.

## chai

[Chai](http://chaijs.com) is a popular BDD / TDD assertion library for
[Node](https://www.nodejs.org) and the browser that can be delightfully
paired with any test driver framework for JavaScript. It is commonly used
to write unit and integration tests. As such this test is not just a good
benchmark for web tooling on the [Node](https://www.nodejs.org) side, but
is also very relevant to the browser as tests often need to be run in the
browser too.

This benchmark is based on the test suite that comes with Chai and
essentially uses the Chai BDD style interface to test the Chai library
itself.

## coffeescript

[CoffeeScript](http://coffeescript.org/) is a little language that attempts to expose
the good parts of JavaScript in a simple way. At some point CoffeeScript was very
popular.

This benchmark runs the CoffeeScript compiler on the [`lexer.coffee`](https://github.com/bmeurer/web-tooling-benchmark/blob/resources/coffeescript-lexer-2.0.1.coffee)
file from the CoffeeScript 2.0.1 distribution.

## jshint

[JSHint](http://jshint.com) is a program that flags suspicious usage in programs written
in JavaScript. At some point it was very popular, but nowadays it seems that many projects
have switch or are switching to [ESLint](https://eslint.org).

This benchmark runs JSHint on the [lodash](https://lodash.com) 4.17.4 bundle, the
[Preact](http://preactjs.com) 8.2.5 bundle, and the [underscore](http://underscorejs.org)
1.8.3 distribution.

## lebab

A test to stress the [Lebab](https://github.com/lebab/lebab)
ES5 to ES6/ES7 transpiler, modernizing the preact bundle.

## prepack

[Prepack](https://prepack.io) is a tool that optimizes JavaScript source code:
Computations that can be done at compile-time instead of run-time get eliminated.
Prepack replaces the global code of a JavaScript bundle with equivalent code that
is a simple sequence of assignments. This gets rid of most intermediate computations
and object allocations. It currently focuses on React Native use cases.

This benchmark runs prepack on both the [Preact](https://github.com/developit/preact)
8.2.5 bundle (unminified) as well as the [Redux](https://github.com/reactjs/redux) 3.7.2 bundle
(minified).

## prettier

A test to stress the [Prettier](https://github.com/prettier/prettier)
code formatter with various `.js` and `.jsx` inputs.

## source-map

A test to stress the [source-map](https://github.com/mozilla/source-map)
tool on both parsing and serializing source maps.

## typescript

A test to stress the [TypeScript](https://github.com/Microsoft/TypeScript)
compiler on the [`typescript-angular`](https://github.com/tastejs/todomvc/tree/master/examples/typescript-angular)
example from [todomvc](https://github.com/tastejs/todomvc).

## uglify-js

A test to stress the [UglifyJS3](https://github.com/mishoo/UglifyJS2)
minifier, running on the (concatenated) JavaScript source for
the ES2015 test in the [Speedometer](https://browserbench.org/Speedometer)
2.0 benchmark.

## uglify-es

This benchmark stresses the new ES2015 and beyond minifier using the 196KiB
ES2015 module containing the untranspiled [Vue](https://github.com/vuejs/vue) bundle.
