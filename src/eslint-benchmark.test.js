// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const eslintBenchmark = require("./eslint-benchmark");

it("eslint-benchmark runs to completion", () => void eslintBenchmark.fn());