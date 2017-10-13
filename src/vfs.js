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

const virtualfs = require("virtualfs");

// Setup the virtual file system.
const fs = new virtualfs.VirtualFS();
fs.mkdirpSync("resources/todomvc/react");
fs.writeFileSync(
  "resources/backbone-1.1.0.js",
  require("raw-loader!../resources/backbone-1.1.0.js")
);
fs.writeFileSync(
  "resources/jquery-3.2.1.js",
  require("raw-loader!../resources/jquery-3.2.1.js")
);
fs.writeFileSync(
  "resources/coffeescript-lexer-2.0.1.coffee",
  require("raw-loader!../resources/coffeescript-lexer-2.0.1.coffee")
);
fs.writeFileSync(
  "resources/lodash.core-4.17.4.js",
  require("raw-loader!../resources/lodash.core-4.17.4.js")
);
fs.writeFileSync(
  "resources/lodash.min-4.17.4.js.map",
  require("raw-loader!../resources/lodash.min-4.17.4.js.map")
);
fs.writeFileSync(
  "resources/preact-8.2.5.js",
  require("raw-loader!../resources/preact-8.2.5.js")
);
fs.writeFileSync(
  "resources/preact-8.2.5.js.map",
  require("raw-loader!../resources/preact-8.2.5.js.map")
);
fs.writeFileSync(
  "resources/redux.min-3.7.2.js",
  require("raw-loader!../resources/redux.min-3.7.2.js")
);
fs.writeFileSync(
  "resources/source-map.min-0.5.7.js.map",
  require("raw-loader!../resources/source-map.min-0.5.7.js.map")
);
fs.writeFileSync(
  "resources/speedometer-es2015-test-2.0.js",
  require("raw-loader!../resources/speedometer-es2015-test-2.0.js")
);
fs.writeFileSync(
  "resources/todomvc/react/app.jsx",
  require("raw-loader!../resources/todomvc/react/app.jsx")
);
fs.writeFileSync(
  "resources/todomvc/react/footer.jsx",
  require("raw-loader!../resources/todomvc/react/footer.jsx")
);
fs.writeFileSync(
  "resources/todomvc/react/todoItem.jsx",
  require("raw-loader!../resources/todomvc/react/todoItem.jsx")
);
fs.writeFileSync(
  "resources/todomvc/typescript-angular.ts",
  require("raw-loader!../resources/todomvc/typescript-angular.ts")
);
fs.writeFileSync(
  "resources/underscore-1.8.3.js",
  require("raw-loader!../resources/underscore-1.8.3.js")
);
fs.writeFileSync(
  "resources/underscore.min-1.8.3.js.map",
  require("raw-loader!../resources/underscore.min-1.8.3.js.map")
);
fs.writeFileSync(
  "resources/vue.runtime.esm-nobuble-2.4.4.js",
  require("raw-loader!../resources/vue.runtime.esm-nobuble-2.4.4.js")
);

module.exports = fs;
