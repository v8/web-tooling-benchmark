// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const fs = require("fs");
const lebab = require("lebab");

const payloads = [
  {
    name: "preact-8.2.5.js",
    options: [
      "arg-rest",
      "arg-spread",
      "arrow",
      "class",
      "for-of",
      "let",
      "template",
      "includes",
      "obj-method",
      "obj-shorthand"
    ]
  }
].map(({ name, options }) => ({
  payload: fs.readFileSync(`third_party/${name}`, "utf8"),
  options
}));

module.exports = {
  name: "lebab",
  fn() {
    return payloads.map(({ payload, options }) =>
      lebab.transform(payload, options)
    );
  }
};
