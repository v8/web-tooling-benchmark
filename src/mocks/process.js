// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const eventLoop = require("./event-loop");

exports.nextTick = function(fn) {
  const args = Array.prototype.slice.call(arguments, 1);
  eventLoop.schedule(() => {
    fn.apply(null, args);
  });
};

exports.platform = exports.arch = exports.execPath = exports.title = "browser";
exports.pid = 1;
exports.browser = true;
exports.env = {};
exports.argv = [];
exports.cwd = () => "/";
exports.binding = name => {
  throw new Error("No such module. (Possibly not yet loaded)");
};
exports.exit = exports.kill = exports.umask = exports.dlopen = exports.uptime = exports.memoryUsage = exports.uvCounters = () => {};
exports.features = {};
