// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const fs = require("fs");
const prepack = require("prepack");

const sourceFiles = [
  "third_party/preact-8.2.5.js",
  "third_party/redux.min-3.7.2.js"
].map(filePath => ({
  filePath,
  fileContents: fs.readFileSync(filePath, "utf8")
}));

module.exports = {
  name: "prepack",
  fn() {
    return prepack.prepackSources(sourceFiles);
  }
};
