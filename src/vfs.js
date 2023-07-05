const { createFsFromVolume, Volume } = require("memfs");

const json = {
  "./angular-material-1.1.8.css": require("raw-loader!../third_party/angular-material-1.1.8.css"),
  "./backbone-1.1.0.js": require("raw-loader!../third_party/backbone-1.1.0.js"),
  "./bootstrap-4.0.0.css": require("raw-loader!../third_party/bootstrap-4.0.0.css"),
  "./foundation-6.4.2.css": require("raw-loader!../third_party/foundation-6.4.2.css"),
  "./jquery-3.2.1.js": require("raw-loader!../third_party/jquery-3.2.1.js"),
  "./coffeescript-lexer-2.0.1.coffee": require("raw-loader!../third_party/coffeescript-lexer-2.0.1.coffee"),
  "./lodash.core-4.17.4.js": require("raw-loader!../third_party/lodash.core-4.17.4.js"),
  "./lodash.min-4.17.4.js.map": require("raw-loader!../third_party/lodash.min-4.17.4.js.map"),
  "./mootools-core-1.6.0.js": require("raw-loader!../third_party/mootools-core-1.6.0.js"),
  "./preact-8.2.5.js": require("raw-loader!../third_party/preact-8.2.5.js"),
  "./preact-8.2.5.js.map": require("raw-loader!../third_party/preact-8.2.5.js.map"),
  "./redux.min-3.7.2.js": require("raw-loader!../third_party/redux.min-3.7.2.js"),
  "./source-map.min-0.5.7.js.map": require("raw-loader!../third_party/source-map.min-0.5.7.js.map"),
  "./speedometer-es2015-test-2.0.js": require("raw-loader!../third_party/speedometer-es2015-test-2.0.js"),
  "./todomvc/react/app.jsx": require("raw-loader!../third_party/todomvc/react/app.jsx"),
  "./todomvc/react/footer.jsx": require("raw-loader!../third_party/todomvc/react/footer.jsx"),
  "./todomvc/react/todoItem.jsx": require("raw-loader!../third_party/todomvc/react/todoItem.jsx"),
  "./todomvc/typescript-angular.ts": require("raw-loader!../third_party/todomvc/typescript-angular.ts"),
  "./underscore-1.8.3.js": require("raw-loader!../third_party/underscore-1.8.3.js"),
  "./underscore.min-1.8.3.js.map": require("raw-loader!../third_party/underscore.min-1.8.3.js.map"),
  "./vue.runtime.esm-nobuble-2.4.4.js": require("raw-loader!../third_party/vue.runtime.esm-nobuble-2.4.4.js")
};
const vol = Volume.fromJSON(json, "third_party");

const fs = createFsFromVolume(vol);

module.exports = fs;
