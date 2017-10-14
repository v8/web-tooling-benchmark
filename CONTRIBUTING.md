# Contributing

Contributions are always welcome, no matter how large or small. Before
contributing, please read the
[code of conduct](https://github.com/bmeurer/web-tooling-benchmark/blob/master/CODE_OF_CONDUCT.md).

## Setup locally

> The Web Tooling Benchmark doesn't officially support any version of [Node](https://www.nodejs.org) prior to Node 8, it currently works with Node 6 and Node 7, but that might change at any point in time.

To start developing on the Web Tooling Benchmark you only need to install its dependencies:

```bash
git clone https://github.com/bmeurer/web-tooling-benchmark
cd web-tooling-benchmark
npm install
```

## Tests

There's no formal test suite yet. For now the process is roughly:

- [ ] Check that `npm install` passes.
- [ ] Check that the suite runs in `node`, via `node src/cli`.
- [ ] Check that the suite runs in `d8` via `/path/to/d8 dist/run.js`.
- [ ] Check that the browser bundle works by pointing your browser to `dist/index.html`.

## Creating a new benchmark

> Example: https://github.com/bmeurer/web-tooling-benchmark/pull/10

- Create a new issue that describes the motivation for including the benchmark. Include any relevant information.
- The pull request should include:
  - [ ] An update to the [in-depth.md](https://github.com/bmeurer/web-tooling-benchmark/blob/master/docs/in-depth.md) document. Add a new entry to that list for the new benchmark, which describes the tool and the concrete benchmark case.
  - [ ] Add a new file `src/foo-benchmark.js`, which includes the actual driver code for the benchmark (see the [`src/babylon-benchmark.js`](https://github.com/bmeurer/web-tooling-benchmark/blob/master/src/babylon-benchmark.js) for example).
  - [ ] `npm install --save-exact` any necessary dependencies, and be sure to include both the `package.json` and the `package-lock.json` changes in your pull request.
  - [ ] Put any assets used by the benchmark into the `resources` folder and hook them up with the virtual file system in `src/vfs.js`.
