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

const esprima = require("esprima");
const fs = require("fs");

const payloads = [
  "backbone-1.1.0.js",
  "jquery-3.2.1.js",
  "mootools-core-1.6.0.js",
  "underscore-1.8.3.js"
].map(name => fs.readFileSync(`resources/${name}`, "utf8"));

module.exports = {
  name: "esprima",
  fn() {
    return payloads.map(payload => {
      let count = 0;
      count += esprima.tokenize(payload, { loc: true, range: true }).length;
      count += esprima.parse(payload, { loc: true, range: true }).body.length;
      return count;
    });
  }
};
