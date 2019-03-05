// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const fs = require("fs");
const CLIEngine = require("eslint").CLIEngine;
const cli = new CLIEngine({
  useEslintrc: false,
  extends: "eslint:recommended"
});

const payloads = [
  "jshint.js",
  "lodash.core-4.17.4.js",
  "preact-8.2.5.js",
  "underscore-1.8.3.js"
].map(name => fs.readFileSync(`third_party/${name}`, "utf8"));

module.exports = {
  name: "eslint",
  fn() {
    return payloads.forEach(payload => {
      cli.executeOnText(payload);
    });
  }
};
