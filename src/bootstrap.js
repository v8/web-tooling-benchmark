// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const gmean = require("compute-gmean");
const package = require("../package.json");
const suite = require("./suite");

function displayStatusMessage(message) {
  const element = document.getElementById("status");
  element.innerHTML = `<em>${message}</em>`;
}

function displayResultMessage(name, message, style) {
  const element = document.getElementById("results-cell-" + name);
  element.innerHTML = message || "&mdash;";
  if (element.classList) {
    element.classList.remove("result");
    element.classList.remove("highlighted-result");
    element.classList.add(style);
  } else {
    element.className = style;
  }
}

function reset() {
  const resultSummaryDiv = document.getElementById("result-summary");
  resultSummaryDiv.textContent = "";

  const benchmarks = [];
  suite.forEach(benchmark => benchmarks.push(benchmark));

  const numColumns = 2;
  const columnHeight = Math.ceil((benchmarks.length + 1) / numColumns);
  const resultsTable = document.getElementById("results");
  let text =
    "<tr>" + "<th>Benchmark</th><th>Runs/Sec</th>".repeat(numColumns) + "</tr>";
  for (let i = 0; i < columnHeight; ++i) {
    text += "<tr>";
    for (let j = 0; j < numColumns; ++j) {
      const index = j * columnHeight + i;
      if (index > benchmarks.length) break;
      if (index == benchmarks.length) {
        text += `<td class="benchmark-name geometric-mean">Geometric Mean</td>`;
        text += `<td class="result geometric-mean" id="results-cell-geomean">&mdash;</td>`;
      } else {
        const benchmark = benchmarks[index];
        text += `<td class="benchmark-name">`;
        text += `<a href="https://github.com/v8/web-tooling-benchmark/blob/master/docs/in-depth.md#${
          benchmark.name
        }" target="_blank">${benchmark.name}</a></td>`;
        text += `<td class="result" id="results-cell-${
          benchmark.name
        }">&mdash;</td>`;
      }
    }
    text += "</tr>";
  }
  resultsTable.innerHTML = text;
}

function initialize() {
  reset();

  document.title = `Web Tooling Benchmark v${package.version}`;

  const versionDiv = document.getElementById("version");
  versionDiv.innerHTML = `v${package.version}`;

  const statusDiv = document.getElementById("status");
  statusDiv.innerHTML = `<a href="javascript:void(0);">Start test</a>`;
  statusDiv.firstChild.onclick = start;
}

function start() {
  reset();

  const statusDiv = document.getElementById("status");
  statusDiv.innerHTML = "<em>Running test suite\u2026</em>";
  suite.run({ async: true });
}

window.onerror = () => {
  // TODO(bmeurer): Provide some sane error page here.
  console.log("SOMETHING WENT WRONG!");
};
window.onload = initialize;

// Helpers for automated runs in Telemetry/Catapult.
window.automated = {
  // Set to true when the whole suite is completed.
  completed: false,
  // The result array of {name, score} pairs.
  results: [],
  // The function that starts the run.
  start
};

suite.forEach(benchmark => {
  benchmark.on("start", event => {
    if (suite.aborted) return;
    displayResultMessage(
      benchmark.name,
      "<em>Running...</em>",
      "highlighted-result"
    );
    displayStatusMessage(`Running iteration 1 of ${benchmark.name}...`);
  });
  benchmark.on("cycle", event => {
    if (suite.aborted) return;
    const iteration = benchmark.stats.sample.length + 1;
    displayStatusMessage(
      `Running iteration ${iteration} of ${benchmark.name}...`
    );
  });
  benchmark.on("complete", event => {
    if (suite.aborted) return;
    displayResultMessage(
      benchmark.name,
      `${benchmark.hz.toFixed(2)}`,
      "result"
    );
    const iterations = benchmark.stats.sample.length;
    displayStatusMessage(
      `Ran ${iterations} iterations of ${benchmark.name}...`
    );
  });
});

suite.on("complete", event => {
  window.automated.completed = true;
  if (suite.aborted) return;
  const hz = gmean(suite.map(benchmark => benchmark.hz));
  window.automated.results = suite.map(benchmark => {
    return { name: benchmark.name, score: benchmark.hz };
  });
  window.automated.results.push({ name: "total", score: hz });
  displayResultMessage("geomean", `${hz.toFixed(2)}`, "highlighted-result");

  const statusDiv = document.getElementById("status");
  statusDiv.innerHTML = `<a href="javascript:void(0);">Test again</a>`;
  statusDiv.firstChild.onclick = start;

  const resultSummaryDiv = document.getElementById("result-summary");
  resultSummaryDiv.innerHTML = `<label>Runs/Sec</label><br><span class="score">${hz.toFixed(
    2
  )}</span>`;
});

suite.on("error", event => {
  window.automated.completed = true;
  const benchmark = event.target;
  const error = benchmark.error;
  const name = benchmark.name;
  document.body.innerHTML = `<h1>ERROR</h1><p>Encountered errors during execution of ${name} test. Refusing to run a partial benchmark suite.</p><pre>${
    error.stack
  }</pre>`;
  console.error(error);
  suite.abort();
});
