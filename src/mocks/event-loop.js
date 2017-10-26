// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This is a very simple event loop implementation. It does not cover the exact behavior
// in node, especially not the differences between process.nextTick and setImmediate.
// It is, however, sufficient for the benchmark.
const tasks = [];

module.exports = {
  schedule(task) {
    tasks.push(task);
  },
  cancel(task) {
    const i = tasks.indexOf(task);

    if (i > -1) {
      tasks.splice(i, 1);
    }
  },
  run() {
    let task;
    while ((task = tasks.shift())) {
      task();
    }
  }
};
