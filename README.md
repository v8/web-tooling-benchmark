# Web Tooling Benchmark

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

This is work-in-progress benchmark suite that tries to measure the
JavaScript related workloads required by Web Developers nowadays.
It's the explicit goal not to measure I/O or other non-JavaScript
related tasks.

See the [in-depth
analysis](https://github.com/bmeurer/web-tooling-benchmark/blob/master/docs/in-depth.md)
for a detailed description of the tests included in this benchmark suite.

## Building

Building the benchmark suite is just a matter of running

```
$ npm install
```

assuming that you have a working [Node](https://nodejs.org) installation. This
was only tested with Node thus far, and it might not work properly with earlier
versions of Node. Once the command is done, it produces a bundled version that
is suitable to run in JS shells (i.e. `d8`, `jsc` or `jsshell`) in `dist/run.js`
and another bundle in `dist/bundle.js` that is used by the browser version in
`dist/index.html`.

## Running

You can either run the benchmark suite directly via [Node](https://nodejs.org),
i.e. like this:

```
$ node src/cli
Running Web Tooling Benchmark 0.0.2...
--------------------------------------
         babel:  7.42 runs/sec  ±6.67%
       babylon: 13.10 runs/sec  ±6.51%
         buble:  6.60 runs/sec  ±9.79%
          chai: 13.20 runs/sec  ±2.01%
         lebab: 10.14 runs/sec  ±5.94%
      prettier:  8.27 runs/sec  ±9.31%
    source-map: 16.50 runs/sec  ±6.46%
    typescript: 10.29 runs/sec  ±9.79%
     uglify-js:  7.21 runs/sec ±11.06%
     uglify-es: 17.72 runs/sec  ±4.67%
--------------------------------------
Geometric mean: 11.41 runs/sec
```

Or you open a web browser and point it to `dist/index.html`, or you can use one
of the engine JS shells (`d8`, `jsc` or `jsshell`) to run the special bundle
in `dist/run.js`.

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