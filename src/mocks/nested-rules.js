// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

module.exports = `
.phone {
  &_title {
      width: 500px;
      @media (max-width: 500px) {
          width: auto;
      }
      body.is_dark & {
          color: white;
      }
  }
  img {
      display: block;
  }
}`;
