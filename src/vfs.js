// Copyright (c) 2017 Benedikt Meurer
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const path = require('path');
const virtualfs = require('virtualfs');

// Setup the virtual file system.
const fs = new virtualfs.VirtualFS;
[
    'test/3rdparty/lodash.core-4.17.4.js',
    'test/3rdparty/lodash.min-4.17.4.js.map',
    'test/3rdparty/preact-8.2.5.js',
    'test/3rdparty/preact-8.2.5.js.map',
    'test/3rdparty/source-map.min-0.5.7.js.map',
    'test/3rdparty/todomvc/react/app.jsx',
    'test/3rdparty/todomvc/react/footer.jsx',
    'test/3rdparty/todomvc/react/todoItem.jsx',
    'test/3rdparty/underscore-1.8.3.js',
    'test/3rdparty/underscore.min-1.8.3.js.map'
].forEach(fileName => {
  fs.mkdirpSync(path.dirname(fileName));
  fs.writeFileSync(fileName, require(`raw-loader!../${fileName}`));
});

module.exports = fs;
