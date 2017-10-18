// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const sourceMap = require("source-map");
const fs = require("fs");

const payloads = [
  "lodash.min-4.17.4.js.map",
  "preact-8.2.5.js.map",
  "source-map.min-0.5.7.js.map",
  "underscore.min-1.8.3.js.map"
].map(name => fs.readFileSync(`third_party/${name}`, "utf8"));

module.exports = {
  name: "source-map",
  fn() {
    payloads.forEach(payload => {
      // Parse the source map first...
      const smc = new sourceMap.SourceMapConsumer(payload);
      // ...then serialize the parsed source map to a String.
      const smg = sourceMap.SourceMapGenerator.fromSourceMap(smc);
      return smg.toString();
    });
  }
};
