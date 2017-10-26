// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const eventLoop = require("./event-loop");

module.exports = function(fn) {
  const args = Array.prototype.slice.call(arguments, 1);
  const task = () => {
    fn.apply(null, args);
  };
  eventLoop.schedule(task);
  return task;
};
