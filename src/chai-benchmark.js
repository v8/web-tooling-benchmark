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

"use strict";

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const AssertionError = chai.AssertionError;

const tests = [];

const describe = (name, func) => func();
const it = (name, func) => tests.push({name, func});

describe('assert', () => {
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

  it('strictEqual', () => {
    assert.strictEqual(0, 0);
    assert.strictEqual(0, -0);
    assert.strictEqual('foo', 'foo');
    assert.strictEqual(sym, sym);

    expect(() => {
      assert.strictEqual('5', 5, 'blah');
    }).to.throw(AssertionError, "blah: expected \'5\' to equal 5");
  });

  it('notStrictEqual', () => {
    assert.notStrictEqual(5, '5');
    assert.notStrictEqual(NaN, NaN);
    assert.notStrictEqual(Symbol(), Symbol());

    expect(() => {
      assert.notStrictEqual(5, 5, 'blah');
    }).to.throw(AssertionError, "blah: expected 5 to not equal 5");
  });

  it('deepEqual', () => {
    const obja = Object.create({ tea: 'chai' });
    const objb = Object.create({ tea: 'chai' });

    assert.deepEqual(/a/, /a/);
    assert.deepEqual(/a/g, /a/g);
    assert.deepEqual(/a/i, /a/i);
    assert.deepEqual(/a/m, /a/m);
    assert.deepEqual(obja, objb);
    assert.deepEqual([NaN], [NaN]);
    assert.deepEqual({tea: NaN}, {tea: NaN});
    assert.deepEqual({tea: 'chai'}, {tea: 'chai'});
    assert.deepEqual({a:'a', b:'b'}, {b:'b', a:'a'});
    assert.deepEqual(new Date(1, 2, 3), new Date(1, 2, 3));

    expect(() => {
      assert.deepEqual({tea: 'chai'}, {tea: 'black'});
    }).to.throw(AssertionError);

    const obj1 = Object.create({tea: 'chai'});
    const obj2 = Object.create({tea: 'black'});

    expect(() => {
      assert.deepEqual(obj1, obj2);
    }).to.throw(AssertionError);

    const circularObject = {};
    const secondCircularObject = {};
    circularObject.field = circularObject;
    secondCircularObject.field = secondCircularObject;

    assert.deepEqual(circularObject, secondCircularObject);

    expect(() => {
      secondCircularObject.field2 = secondCircularObject;
      assert.deepEqual(circularObject, secondCircularObject);
    }).to.throw(AssertionError);
  });

  it('notDeepEqual', () => {
    assert.notDeepEqual({tea: 'jasmine'}, {tea: 'chai'});
    assert.notDeepEqual(/a/, /b/);
    assert.notDeepEqual(/a/, {});
    assert.notDeepEqual(/a/g, /b/g);
    assert.notDeepEqual(/a/i, /b/i);
    assert.notDeepEqual(/a/m, /b/m);
    assert.notDeepEqual(new Date(1, 2, 3), new Date(4, 5, 6));
    assert.notDeepEqual(new Date(1, 2, 3), {});

    expect(() => {
      assert.notDeepEqual({tea: 'chai'}, {tea: 'chai'});
    }).to.throw(AssertionError);

    const circularObject = {};
    const secondCircularObject = { tea: 'jasmine' };
    circularObject.field = circularObject;
    secondCircularObject.field = secondCircularObject;

    assert.notDeepEqual(circularObject, secondCircularObject);

    expect(() => {
      delete secondCircularObject.tea;
      assert.notDeepEqual(circularObject, secondCircularObject);
    }).to.throw(AssertionError);
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
});

describe('expect', () => {
  it('no-op chains', () => {
    [
        'to', 'be', 'been' , 'is', 'and', 'has', 'have',
        'with', 'that', 'which', 'at', 'of', 'same',
        'but', 'does'
    ].forEach(chain => {
      // tests that chain exists
      expect(expect(1)[chain]).not.undefined;

      // tests methods
      expect(1)[chain].equal(1);

      // tests properties that assert
      expect(false)[chain].false;

      // tests not
      expect(false)[chain].not.true;

      // tests chainable methods
      expect([1, 2, 3])[chain].contains(1);
    });
  });

  it('fail', () => {
    expect(() => {
      expect.fail(0, 1, 'this has failed');
    }).to.throw(AssertionError, "this has failed");
  });

  it('true', () => {
    expect(true).to.be.true;
    expect(false).to.not.be.true;
    expect(1).to.not.be.true;

    expect(() => {
      expect('test', 'blah').to.be.true;
    }).to.throw(AssertionError, "blah: expected 'test' to be true");
  });

  it('ok', () => {
    expect(true).to.be.ok;
    expect(false).to.not.be.ok;
    expect(1).to.be.ok;
    expect(0).to.not.be.ok;

    expect(() => {
      expect('', 'blah').to.be.ok;
    }).to.throw(AssertionError, "blah: expected '' to be truthy");

    expect(() => {
      expect('test').to.not.be.ok;
    }).to.throw(AssertionError, "expected 'test' to be falsy");
  });

  it('false', () => {
    expect(false).to.be.false;
    expect(true).to.not.be.false;
    expect(0).to.not.be.false;

    expect(() => {
      expect('', 'blah').to.be.false;
    }).to.throw(AssertionError, "blah: expected '' to be false");
  });

  it('null', () => {
    expect(null).to.be.null;
    expect(false).to.not.be.null;

    expect(() => {
      expect('', 'blah').to.be.null;
    }).to.throw(AssertionError, "blah: expected '' to be null");

  });

  it('undefined', () => {
    expect(undefined).to.be.undefined;
    expect(null).to.not.be.undefined;

    expect(() => {
      expect('', 'blah').to.be.undefined;
    }).to.throw(AssertionError, "blah: expected '' to be undefined");
  });

  it('exist', () => {
    var foo = 'bar';
    var bar;

    expect(foo).to.exist;
    expect(bar).to.not.exist;
    expect(0).to.exist;
    expect(false).to.exist;
    expect('').to.exist;

    expect(() => {
      expect(bar, 'blah').to.exist;
    }).to.throw(AssertionError, "blah: expected undefined to exist");

    expect(() => {
      expect(foo).to.not.exist(foo);
    }).to.throw(AssertionError, "expected 'bar' to not exist");
  });

  it('arguments', () => {
    var args = (function(){ return arguments; })(1,2,3);
    expect(args).to.be.arguments;
    expect([]).to.not.be.arguments;
    expect(args).to.be.an('arguments').and.be.arguments;
    expect([]).to.be.an('array').and.not.be.Arguments;

    expect(() => {
      expect([]).to.be.arguments;
    }).to.throw(AssertionError, "expected [] to be arguments but got Array");
  });

  it('NaN', () => {
    expect(NaN).to.be.NaN;
    expect(undefined).not.to.be.NaN;
    expect(Infinity).not.to.be.NaN;
    expect('foo').not.to.be.NaN;
    expect({}).not.to.be.NaN;
    expect(4).not.to.be.NaN;
    expect([]).not.to.be.NaN;

    expect(() => {
      expect(NaN, 'blah').not.to.be.NaN;
    }).to.throw(AssertionError, "blah: expected NaN not to be NaN");

    expect(() => {
      expect(undefined).to.be.NaN;
    }).to.throw(AssertionError, "expected undefined to be NaN");

    expect(() => {
      expect(Infinity).to.be.NaN;
    }).to.throw(AssertionError, "expected Infinity to be NaN");

    expect(() => {
      expect('foo').to.be.NaN;
    }).to.throw(AssertionError, "expected 'foo' to be NaN");

    expect(() => {
      expect({}).to.be.NaN;
    }).to.throw(AssertionError, "expected {} to be NaN");

    expect(() => {
      expect(4).to.be.NaN;
    }).to.throw(AssertionError, "expected 4 to be NaN");

    expect(() => {
      expect([]).to.be.NaN;
    }).to.throw(AssertionError, "expected [] to be NaN");
  });

  it('change', () => {
    const obj = { value: 10, str: 'foo' };
    const heroes = ['spiderman', 'superman'];
    const fn = () => obj.value += 5;
    const decFn = () => obj.value -= 20;
    const sameFn = () => 'foo' + 'bar';
    const bangFn = () => obj.str += '!';
    const batFn = () => heroes.push('batman');
    const lenFn = () => heroes.length;

    expect(fn).to.change(obj, 'value');
    expect(fn).to.change(obj, 'value').by(5);
    expect(fn).to.change(obj, 'value').by(-5);

    expect(decFn).to.change(obj, 'value').by(20);
    expect(decFn).to.change(obj, 'value').but.not.by(21);

    expect(sameFn).to.not.change(obj, 'value');

    expect(sameFn).to.not.change(obj, 'str');
    expect(bangFn).to.change(obj, 'str');

    expect(batFn).to.change(lenFn).by(1);
    expect(batFn).to.change(lenFn).but.not.by(2);

    expect(() =>  {
      expect(sameFn).to.change(obj, 'value', 'blah');
    }).to.throw(AssertionError, "blah: expected .value to change");

    expect(() =>  {
      expect(sameFn, 'blah').to.change(obj, 'value');
    }).to.throw(AssertionError, "blah: expected .value to change");

    expect(() =>  {
      expect(fn).to.not.change(obj, 'value', 'blah');
    }).to.throw(AssertionError, "blah: expected .value to not change");

    expect(() =>  {
      expect({}).to.change(obj, 'value', 'blah');
    }).to.throw(AssertionError, "blah: expected {} to be a function");

    expect(() =>  {
      expect({}, 'blah').to.change(obj, 'value');
    }).to.throw(AssertionError, "blah: expected {} to be a function");

    expect(() =>  {
      expect(fn).to.change({}, 'badprop', 'blah');
    }).to.throw(AssertionError, "blah: expected {} to have property 'badprop'");

    expect(() =>  {
      expect(fn, 'blah').to.change({}, 'badprop');
    }).to.throw(AssertionError, "blah: expected {} to have property 'badprop'");

    expect(() =>  {
      expect(fn, 'blah').to.change({});
    }).to.throw(AssertionError, "blah: expected {} to be a function");

    expect(() =>  {
      expect(fn).to.change(obj, 'value').by(10, 'blah');
    }).to.throw(AssertionError, "blah: expected .value to change by 10");

    expect(() =>  {
      expect(fn, 'blah').to.change(obj, 'value').by(10);
    }).to.throw(AssertionError, "blah: expected .value to change by 10");

    expect(() =>  {
      expect(fn).to.change(obj, 'value').but.not.by(5, 'blah');
    }).to.throw(AssertionError, "blah: expected .value to not change by 5");
  });

  const sym = Symbol();

  it('extensible', function() {
    const nonExtensibleObject = Object.preventExtensions({});

    expect({}).to.be.extensible;
    expect(nonExtensibleObject).to.not.be.extensible;

    expect(() =>  {
        expect(nonExtensibleObject, 'blah').to.be.extensible;
    }).to.throw(AssertionError, 'blah: expected {} to be extensible');

    expect(() =>  {
        expect({}).to.not.be.extensible;
    }).to.throw(AssertionError, 'expected {} to not be extensible');

    expect(42).to.not.be.extensible;
    expect(null).to.not.be.extensible;
    expect('foo').to.not.be.extensible;
    expect(false).to.not.be.extensible;
    expect(undefined).to.not.be.extensible;
    expect(sym).to.not.be.extensible;

    expect(() =>  {
      expect(42).to.be.extensible;
    }).to.throw(AssertionError, 'expected 42 to be extensible');

    expect(() =>  {
      expect(null).to.be.extensible;
    }).to.throw(AssertionError, 'expected null to be extensible');

    expect(() =>  {
      expect('foo').to.be.extensible;
    }).to.throw(AssertionError, 'expected \'foo\' to be extensible');

    expect(() =>  {
      expect(false).to.be.extensible;
    }).to.throw(AssertionError, 'expected false to be extensible');

    expect(() =>  {
      expect(undefined).to.be.extensible;
    }).to.throw(AssertionError, 'expected undefined to be extensible');

    const proxy = new Proxy({}, {
      isExtensible() { throw new TypeError(); }
    });

    expect(() =>  {
      expect(proxy).to.be.extensible;
    }).to.throw(TypeError);
  });

  it('sealed', function() {
    const sealedObject = Object.seal({});

    expect(sealedObject).to.be.sealed;
    expect({}).to.not.be.sealed;

    expect(() => {
        expect({}).to.be.sealed;
    }).to.throw(AssertionError, 'expected {} to be sealed');

    expect(() =>  {
        expect(sealedObject).to.not.be.sealed;
    }).to.throw(AssertionError, 'expected {} to not be sealed');

    expect(42).to.be.sealed;
    expect(null).to.be.sealed;
    expect('foo').to.be.sealed;
    expect(false).to.be.sealed;
    expect(undefined).to.be.sealed;
    expect(sym).to.be.sealed;

    expect(() =>  {
      expect(42).to.not.be.sealed;
    }).to.throw(AssertionError, 'expected 42 to not be sealed');

    expect(() =>  {
      expect(null).to.not.be.sealed;
    }).to.throw(AssertionError, 'expected null to not be sealed');

    expect(() =>  {
      expect('foo').to.not.be.sealed;
    }).to.throw(AssertionError, 'expected \'foo\' to not be sealed');

    expect(() =>  {
      expect(false).to.not.be.sealed;
    }).to.throw(AssertionError, 'expected false to not be sealed');

    expect(() =>  {
      expect(undefined).to.not.be.sealed;
    }).to.throw(AssertionError, 'expected undefined to not be sealed');

    const proxy = new Proxy({}, {
      ownKeys() { throw new TypeError(); }
    });

    Object.preventExtensions(proxy);

    expect(() =>  {
      expect(proxy).to.be.sealed;
    }).to.throw(TypeError);
  });

  it('frozen', function() {
    const frozenObject = Object.freeze({});

    expect(frozenObject).to.be.frozen;
    expect({}).to.not.be.frozen;

    expect(() =>  {
        expect({}).to.be.frozen;
    }).to.throw(AssertionError, 'expected {} to be frozen');

    expect(() =>  {
        expect(frozenObject).to.not.be.frozen;
    }).to.throw(AssertionError, 'expected {} to not be frozen');

    expect(42).to.be.frozen;
    expect(null).to.be.frozen;
    expect('foo').to.be.frozen;
    expect(false).to.be.frozen;
    expect(undefined).to.be.frozen;
    expect(sym).to.be.frozen;

    expect(() =>  {
      expect(42).to.not.be.frozen;
    }).to.throw(AssertionError, 'expected 42 to not be frozen');

    expect(() =>  {
      expect(null).to.not.be.frozen;
    }).to.throw(AssertionError, 'expected null to not be frozen');

    expect(() =>  {
      expect('foo').to.not.be.frozen;
    }).to.throw(AssertionError, 'expected \'foo\' to not be frozen');

    expect(() =>  {
      expect(false).to.not.be.frozen;
    }).to.throw(AssertionError, 'expected false to not be frozen');

    expect(() =>  {
      expect(undefined).to.not.be.frozen;
    }).to.throw(AssertionError, 'expected undefined to not be frozen');

    const proxy = new Proxy({}, {
      ownKeys() { throw new TypeError(); }
    });

    Object.preventExtensions(proxy);

    expect(() =>  {
      expect(proxy).to.be.frozen;
    }).to.throw(TypeError);
  });
});

module.exports = {
  name: 'chai',
  fn() {
    tests.forEach(test => test.func());
  }
};
