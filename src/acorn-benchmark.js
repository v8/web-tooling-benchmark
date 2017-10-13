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

const acorn = require("acorn");
const fs = require("fs");
const walk = require("acorn/dist/walk");

const payloads = [
  {
    name: "backbone-1.1.0.js",
    options: { ecmaVersion: 5, sourceType: "script" }
  },
  {
    name: "jquery-3.2.1.js",
    options: { ecmaVersion: 5, sourceType: "script" }
  },
  {
    name: "lodash.core-4.17.4.js",
    options: { ecmaVersion: 5, sourceType: "script" }
  },
  {
    name: "preact-8.2.5.js",
    options: { ecmaVersion: 5, sourceType: "script" }
  },
  {
    name: "redux.min-3.7.2.js",
    options: { ecmaVersion: 5, sourceType: "script" }
  },
  {
    name: "speedometer-es2015-test-2.0.js",
    options: { ecmaVersion: 6, sourceType: "script" }
  },
  {
    name: "underscore-1.8.3.js",
    options: { ecmaVersion: 5, sourceType: "script" }
  },
  {
    name: "vue.runtime.esm-nobuble-2.4.4.js",
    options: { ecmaVersion: 7, sourceType: "module" }
  }
].map(({ name, options }) => ({
  payload: fs.readFileSync(`resources/${name}`, "utf8"),
  options: Object.assign(options, { locations: true }, { ranges: true })
}));

module.exports = {
  name: "acorn",
  fn() {
    return payloads.map(({ payload, options }) => {
      let count = 0;

      // Test the tokenizer by counting the resulting tokens.
      for (const token of acorn.tokenizer(payload, options)) {
        count++;
      }

      // Test the parser.
      const ast = acorn.parse(payload, options);

      // Test the AST walker.
      walk.full(ast, node => count++);
      return count;
    });
  }
};
