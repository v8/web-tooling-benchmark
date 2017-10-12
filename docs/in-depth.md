# In-depth Analysis

The Web Tooling Benchmark contains interesting JavaScript workloads from a variety of
commonly used web developer tools. It executes these core workloads a couple of times
reports a single score at the end that balances them using geometric mean.

Note that scores of different versions of the Web Tooling Benchmark are not comparable
to each other.

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
[Acorn](https://github.com/ternjs/acorn) and thus representative of a whole class of
common parsing workloads.

This benchmark runs the Babylon parser on different popular inputs, including the
[Preact](https://github.com/developit/preact) 8.2.5 bundle, the [lodash](https://lodash.com)
4.17.4 bundle, the JSX files from the React TodoMVC example app, the 
[underscore](http://underscorejs.org/) 1.8.3 bundle, and an ES2015 module containing the untranspiled [Vue](https://github.com/vuejs/vue) bundle

## buble

A test to stress the [Buble](https://github.com/Rich-Harris/buble)
ES2015 compiler, both the parser and the actual transformation
logic, on the same 196K ES2015 module containing the untranspiled
[Vue](https://github.com/vuejs/vue) source code that is also used
to stress by the `babel` and `babylon` tests.

## chai

A test to stress the [Chai Assertion Library](http://chaijs.com),
which is commonly used to write unit and integration tests.

## lebab

A test to stress the [Lebab](https://github.com/lebab/lebab)
ES5 to ES6/ES7 transpiler, modernizing the preact bundle.

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