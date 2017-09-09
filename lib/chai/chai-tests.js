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

let chaiTests = [];

function ChaiSetup() {
  const chai = ChaiLoadLibrary();
  const assert = chai.assert;
  const expect = chai.expect;
  const AssertionError = chai.AssertionError;

  const it = (name, func) => chaiTests.push({name, func});

  it('assert', () => {
    const foo = 'bar';
    assert(foo == 'bar', "expected foo to equal `bar`");

    expect(() => {
      assert(foo == 'baz', "expected foo to equal `baz`");
    }).to.throw(AssertionError, "expected foo to equal `baz`");

    expect(() => {
      assert(foo == 'baz', () => "expected foo to equal `baz`");
    }).to.throw(AssertionError, "expected foo to equal `baz`");
  });

  it('fail', () => {
    expect(() => {
      assert.fail(0, 1, "this has failed");
    }).to.throw(AssertionError, "this has failed");
  });

  it('isTrue', () => {
    assert.isTrue(true);
    
    expect(() => {
      assert.isTrue(false, "blah");
    }).to.throw(AssertionError, "blah: expected false to be true");

    expect(() => {
      assert.isTrue(1);
    }).to.throw(AssertionError, "expected 1 to be true");

    expect(() => {
      assert.isTrue('test');
    }).to.throw(AssertionError, "expected 'test' to be true");
  });

  it('isNotTrue', () => {
    assert.isNotTrue(false);

    expect(() => {
      assert.isNotTrue(true, "blah");
    }).to.throw(AssertionError, "blah: expected true to not equal true");
  });

  it('isOk / ok', () => {
    ['isOk', 'ok'].forEach(isOk => {
      assert[isOk](true);
      assert[isOk](1);
      assert[isOk]('test');

      expect(() => {
        assert[isOk](false, "blah");
      }).to.throw(AssertionError, "blah: expected false to be truthy");

      expect(() => {
        assert[isOk](0);
      }).to.throw(AssertionError, "expected 0 to be truthy");

      expect(() => {
        assert[isOk]('');
      }).to.throw(AssertionError, "expected '' to be truthy");
    });
  });

  it('isNotOk / notOk', () => {
    ['isNotOk', 'notOk'].forEach(isNotOk => {
      assert[isNotOk](false);
      assert[isNotOk](0);
      assert[isNotOk]('');

      expect(() => {
        assert[isNotOk](true, "blah");
      }).to.throw(AssertionError, "blah: expected true to be falsy");

      expect(() => {
        assert[isNotOk](1);
      }).to.throw(AssertionError, "expected 1 to be falsy");

      expect(() => {
        assert[isNotOk]('test');
      }).to.throw(AssertionError, "expected 'test' to be falsy");
    });
  });

  it('isFalse', () => {
    assert.isFalse(false);
    
    expect(() => {
      assert.isFalse(true, "blah");
    }).to.throw(AssertionError, "blah: expected true to be false");

    expect(() => {
      assert.isFalse(0);
    }).to.throw(AssertionError, "expected 0 to be false");
  });

  it('isNotFalse', () => {
    assert.isNotFalse(true);

    expect(() => {
      assert.isNotFalse(false, "blah");
    }).to.throw(AssertionError, "blah: expected false to not equal false");
  });

  const sym = Symbol();

  it('isEqual', () => {
    assert.equal(0, 0);
    assert.equal(sym, sym);
    assert.equal('test', 'test');
    assert.equal(void 0, null);
    assert.equal(void 0, undefined);

    expect(() => {
      assert.equal(NaN, NaN);
    }).to.throw(AssertionError, "expected NaN to equal NaN");

    expect(() => {
      assert.equal(1, 2, "blah");
    }).to.throw(AssertionError, "blah: expected 1 to equal 2");
  });

  it('notEqual', () => {
    assert.notEqual(1, 2);
    assert.notEqual(NaN, NaN);
    assert.notEqual(1, 'test');

    expect(() => {
      assert.notEqual('test', 'test');
    }).to.throw(AssertionError, "expected 'test' to not equal 'test'");
    expect(() => {
      assert.notEqual(sym, sym);
    }).to.throw(AssertionError, "expected Symbol() to not equal Symbol()");
  });

  it('typeOf', () => {
    assert.typeOf('test', 'string');
    assert.typeOf(true, 'boolean');
    assert.typeOf(NaN, 'number');
    assert.typeOf(sym, 'symbol');

    expect(() => {
      assert.typeOf(5, 'string', "blah");
    }).to.throw(AssertionError, "blah: expected 5 to be a string");
  });

  it('notTypeOf', () => {
    assert.notTypeOf(5, 'string');
    assert.notTypeOf(sym, 'string');
    assert.notTypeOf(null, 'object');
    assert.notTypeOf('test', 'number');

    expect(() => {
      assert.notTypeOf(5, 'number', "blah");
    }).to.throw(AssertionError, "blah: expected 5 not to be a number");
  });

  function Foo() {}

  const FakeConstructor = {
    [Symbol.hasInstance](x) {
      return x === 3;
    }
  };

  it('instanceOf', () => {
    assert.instanceOf({}, Object);
    assert.instanceOf(/a/, RegExp);
    assert.instanceOf(new Foo(), Foo);
    assert.instanceOf(3, FakeConstructor);

    expect(() => {
      assert.instanceOf(new Foo(), 1);
    }).to.throw("assertion needs a constructor but number was given");

    expect(() => {
      assert.instanceOf(new Foo(), 'Foo');
    }).to.throw("assertion needs a constructor but string was given");

    expect(() => {
      assert.instanceOf(4, FakeConstructor);
    }).to.throw("expected 4 to be an instance of an unnamed constructor");
  });

  it('notInstanceOf', () => {
    assert.notInstanceOf({}, Foo);
    assert.notInstanceOf({}, Array);
    assert.notInstanceOf(new Foo, Array);

    expect(() => {
      assert.notInstanceOf(new Foo, Foo);
    }).to.throw("expected {} to not be an instance of Foo");

    expect(() => {
      assert.notInstanceOf(3, FakeConstructor);
    }).to.throw("expected 3 to not be an instance of an unnamed constructor");
  });

  it('isObject', () => {
    assert.isObject({});
    assert.isObject(new Foo);

    expect(() => {
      assert.isObject(true);
    }).to.throw(AssertionError, "expected true to be an object");

    expect(() => {
      assert.isObject(Foo);
    }).to.throw(AssertionError, "expected [Function: Foo] to be an object");

    expect(() => {
      assert.isObject('foo');
    }).to.throw(AssertionError, "expected 'foo' to be an object");
  });

  it('isNotObject', () => {
    assert.isNotObject(1);
    assert.isNotObject([]);
    assert.isNotObject(/a/);
    assert.isNotObject(Foo);
    assert.isNotObject('foo');

    expect(() => {
      assert.isNotObject({}, 'blah');
    }).to.throw(AssertionError, "blah: expected {} not to be an object");
  });
}

function ChaiRun() {
  for (const chaiTest of chaiTests) {
    chaiTest.func();
  }
}

function ChaiTearDown() {
  // Don't leak any resources.
  chaiTests = [];
}

new BenchmarkSuite('Chai', 1030000, [
    new Benchmark('Chai', false, false, 0, ChaiRun, ChaiSetup, ChaiTearDown)
]);
