// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const Babel = require("@babel/core");
const babylon = require("babylon");
const fs = require("fs");

const payloads = [
  {
    name: "vue.runtime.esm-nobuble-2.4.4.js",
    options: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              browsers: ["last 2 versions"],
              node: 4 // https://github.com/nodejs/Release#release-schedule
            }
          }
        ]
      ],
      sourceType: "module"
    }
  }
].map(({ name, options }) => {
  const code = fs.readFileSync(`third_party/${name}`, "utf8");
  const ast = babylon.parse(code, options);
  return { ast, code, options };
});

module.exports = {
  name: "babel",
  fn() {
    return payloads.map(({ ast, code, options }) =>
      Babel.transformFromAst(ast, code, options)
    );
  }
};
