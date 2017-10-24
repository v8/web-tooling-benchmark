// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const virtualfs = require("virtualfs");

// Setup the virtual file system.
const fs = new virtualfs.VirtualFS();
fs.mkdirpSync("third_party/todomvc/react");
fs.writeFileSync(
  "third_party/backbone-1.1.0.js",
  require("raw-loader!../third_party/backbone-1.1.0.js")
);
fs.writeFileSync(
  "third_party/jquery-3.2.1.js",
  require("raw-loader!../third_party/jquery-3.2.1.js")
);
fs.writeFileSync(
  "third_party/coffeescript-lexer-2.0.1.coffee",
  require("raw-loader!../third_party/coffeescript-lexer-2.0.1.coffee")
);
fs.writeFileSync(
  "third_party/lodash.core-4.17.4.js",
  require("raw-loader!../third_party/lodash.core-4.17.4.js")
);
fs.writeFileSync(
  "third_party/lodash.min-4.17.4.js.map",
  require("raw-loader!../third_party/lodash.min-4.17.4.js.map")
);
fs.writeFileSync(
  "third_party/mootools-core-1.6.0.js",
  require("raw-loader!../third_party/mootools-core-1.6.0.js")
);
fs.writeFileSync(
  "third_party/preact-8.2.5.js",
  require("raw-loader!../third_party/preact-8.2.5.js")
);
fs.writeFileSync(
  "third_party/preact-8.2.5.js.map",
  require("raw-loader!../third_party/preact-8.2.5.js.map")
);
fs.writeFileSync(
  "third_party/redux.min-3.7.2.js",
  require("raw-loader!../third_party/redux.min-3.7.2.js")
);
fs.writeFileSync(
  "third_party/source-map.min-0.5.7.js.map",
  require("raw-loader!../third_party/source-map.min-0.5.7.js.map")
);
fs.writeFileSync(
  "third_party/speedometer-es2015-test-2.0.js",
  require("raw-loader!../third_party/speedometer-es2015-test-2.0.js")
);
fs.writeFileSync(
  "third_party/todomvc/react/app.jsx",
  require("raw-loader!../third_party/todomvc/react/app.jsx")
);
fs.writeFileSync(
  "third_party/todomvc/react/footer.jsx",
  require("raw-loader!../third_party/todomvc/react/footer.jsx")
);
fs.writeFileSync(
  "third_party/todomvc/react/todoItem.jsx",
  require("raw-loader!../third_party/todomvc/react/todoItem.jsx")
);
fs.writeFileSync(
  "third_party/todomvc/typescript-angular.ts",
  require("raw-loader!../third_party/todomvc/typescript-angular.ts")
);
fs.writeFileSync(
  "third_party/underscore-1.8.3.js",
  require("raw-loader!../third_party/underscore-1.8.3.js")
);
fs.writeFileSync(
  "third_party/underscore.min-1.8.3.js.map",
  require("raw-loader!../third_party/underscore.min-1.8.3.js.map")
);
fs.writeFileSync(
  "third_party/vue.runtime.esm-nobuble-2.4.4.js",
  require("raw-loader!../third_party/vue.runtime.esm-nobuble-2.4.4.js")
);
fs.mkdirpSync("/src/fixtures/webpack");
fs.writeFileSync(
  "/src/fixtures/webpack/a.js",
  require("raw-loader!./fixtures/webpack/a.js")
);
fs.writeFileSync(
  "/src/fixtures/webpack/b.js",
  require("raw-loader!./fixtures/webpack/b.js")
);
fs.writeFileSync(
  "/src/fixtures/webpack/c.js",
  require("raw-loader!./fixtures/webpack/c.js")
);

module.exports = fs;
