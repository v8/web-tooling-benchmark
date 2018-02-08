// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var esmRequire = (function() {
  try {
    return __non_webpack_require__("@std/esm")(__non_webpack_module__);
  } catch (e) {}

  try {
    return module.require("@std/esm")(module);
  } catch (e) {}
})();

module.exports = {
  name: "@std/esm"
};

if (typeof esmRequire === "function") {
  module.exports.fn = function() {
    for (var key in esmRequire.cache) {
      delete esmRequire.cache[key];
    }

    return esmRequire("lodash-es");
  };
}
