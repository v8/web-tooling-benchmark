// Copyright (c) 2017 Benedikt Meurer
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const gmean = require("compute-gmean");
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
        text += `<a href="https://github.com/bmeurer/web-tooling-benchmark/blob/master/docs/in-depth.md##${benchmark.name}" target="_blank">${benchmark.name}</a></td>`;
        text += `<td class="result" id="results-cell-${benchmark.name}">&mdash;</td>`;
      }
    }
    text += "</tr>";
  }
  resultsTable.innerHTML = text;
}

function initialize() {
  reset();

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

suite.forEach(benchmark => {
  benchmark.on("start", event => {
    displayResultMessage(
      benchmark.name,
      "<em>Running...</em>",
      "highlighted-result"
    );
    displayStatusMessage(`Running iteration 1 of ${benchmark.name}...`);
  });
  benchmark.on("cycle", event => {
    const iteration = benchmark.stats.sample.length + 1;
    displayStatusMessage(
      `Running iteration ${iteration} of ${benchmark.name}...`
    );
  });
  benchmark.on("complete", event => {
    displayResultMessage(
      benchmark.name,
      `${benchmark.hz.toFixed(
        2
      )} <span class="interval">&plusmn; ${benchmark.stats.rme.toFixed(
        2
      )}%</span>`,
      "result"
    );
    const iterations = benchmark.stats.sample.length;
    displayStatusMessage(
      `Ran ${iterations} iterations of ${benchmark.name}...`
    );
  });
});

suite.on("complete", event => {
  const sample = [];
  suite.forEach(benchmark => {
    sample.push(...benchmark.stats.sample);
  });
  const hz = 1 / gmean(sample);
  displayResultMessage("geomean", `${hz.toFixed(2)}`, "highlighted-result");

  const statusDiv = document.getElementById("status");
  statusDiv.innerHTML = `<a href="javascript:void(0);">Test again</a>`;
  statusDiv.firstChild.onclick = start;

  const resultSummaryDiv = document.getElementById("result-summary");
  resultSummaryDiv.innerHTML = `<label>Runs/Sec</label><br><span class="score">${hz.toFixed(
    2
  )}</span>`;
});
