const babelMinifyBenchmark = require("./babel-minify-benchmark");

it("babel-minify-benchmark runs to completion", () =>
  void babelMinifyBenchmark.fn());
