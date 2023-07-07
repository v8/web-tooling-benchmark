// Copyright 2017 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const AssertionError = chai.AssertionError;

global.err = function globalErr(fn, val) {
  if (chai.util.type(fn) !== "function")
    throw new chai.AssertionError("Invalid fn");

  try {
    fn();
  } catch (err) {
    switch (chai.util.type(val).toLowerCase()) {
      case "undefined":
        return;
      case "string":
        return chai.expect(err.message).to.equal(val);
      case "regexp":
        return chai.expect(err.message).to.match(val);
      case "object":
        return Object.keys(val).forEach(key => {
          chai
            .expect(err)
            .to.have.property(key)
            .and.to.deep.equal(val[key]);
        });
    }

    throw new chai.AssertionError("Invalid val");
  }

  throw new chai.AssertionError("Expected an error");
};

const tests = [];

const describe = (name, func) => func();
const it = (name, func) => tests.push({ name, func });

describe("assert", () => {
  it("assert", () => {
    const foo = "bar";
    assert(foo == "bar", "expected foo to equal `bar`");

    err(
      () => assert(foo == "baz", "expected foo to equal `bar`"),
      "expected foo to equal `bar`"
    );

    err(
      () => assert(foo == "baz", () => "expected foo to equal `bar`"),
      "expected foo to equal `bar`"
    );
  });

  describe("fail", () => {
    it("should accept a message as the 3rd argument", () => {
      err(() => {
        assert.fail(0, 1, "this has failed");
      }, /this has failed/);
    });

    it("should accept a message as the only argument", () => {
      err(() => {
        assert.fail("this has failed");
      }, /this has failed/);
    });

    it("should produce a default message when called without any arguments", () => {
      err(() => {
        assert.fail();
      }, /assert\.fail()/);
    });
  });

  it("isTrue", () => {
    assert.isTrue(true);

    err(() => assert.isTrue(false, "blah"), "blah: expected false to be true");

    err(() => assert.isTrue(1), "expected 1 to be true");

    err(() => assert.isTrue("test"), "expected 'test' to be true");
  });

  it("isNotTrue", () => {
    assert.isNotTrue(false);

    err(
      () => assert.isNotTrue(true, "blah"),
      "blah: expected true to not equal true"
    );
  });

  it("isOk / ok", () => {
    ["isOk", "ok"].forEach(isOk => {
      assert[isOk](true);
      assert[isOk](1);
      assert[isOk]("test");

      err(
        () => assert[isOk](false, "blah"),
        "blah: expected false to be truthy"
      );

      err(() => assert[isOk](0), "expected +0 to be truthy");

      err(() => assert[isOk](""), "expected '' to be truthy");
    });
  });

  it("isNotOk, notOk", () => {
    ["isNotOk", "notOk"].forEach(function(isNotOk) {
      assert[isNotOk](false);
      assert[isNotOk](0);
      assert[isNotOk]("");

      err(
        () => assert[isNotOk](true, "blah"),
        "blah: expected true to be falsy"
      );

      err(() => assert[isNotOk](1), "expected 1 to be falsy");

      err(() => assert[isNotOk]("test"), "expected 'test' to be falsy");
    });
  });

  it("isFalse", () => {
    assert.isFalse(false);

    err(() => assert.isFalse(true, "blah"), "blah: expected true to be false");

    err(() => assert.isFalse(0), "expected +0 to be false");
  });

  it("isNotFalse", () => {
    assert.isNotFalse(true);

    err(
      () => assert.isNotFalse(false, "blah"),
      "blah: expected false to not equal false"
    );
  });

  it("equal", () => {
    var foo;
    assert.equal(foo, undefined);

    if (typeof Symbol === "function") {
      const sym = Symbol();
      assert.equal(sym, sym);
    }

    err(() => assert.equal(1, 2, "blah"), "blah: expected 1 to equal 2");
  });

  it("typeof", () => {
    assert.typeOf("test", "string");
    assert.typeOf(true, "boolean");
    assert.typeOf(5, "number");

    if (typeof Symbol === "function") {
      assert.typeOf(Symbol(), "symbol");
    }

    err(
      () => assert.typeOf(5, "string", "blah"),
      "blah: expected 5 to be a string"
    );
  });

  it("notTypeOf", () => {
    assert.notTypeOf("test", "number");

    err(
      () => assert.notTypeOf(5, "number", "blah"),
      "blah: expected 5 not to be a number"
    );
  });

  it("instanceOf", () => {
    function Foo() {}
    assert.instanceOf(new Foo(), Foo);

    // Normally, `instanceof` requires that the constructor be a function or an
    // object with a callable `@@hasInstance`. But in some older browsers such
    // as IE11, `instanceof` also accepts DOM-related interfaces such as
    // `HTMLElement`, despite being non-callable objects in those browsers.
    // See: https://github.com/chaijs/chai/issues/1000.
    if (
      typeof document !== "undefined" &&
      typeof document.createElement !== "undefined" &&
      typeof HTMLElement !== "undefined"
    ) {
      assert.instanceOf(document.createElement("div"), HTMLElement);
    }

    err(
      () => assert.instanceOf(new Foo(), 1, "blah"),
      "blah: The instanceof assertion needs a constructor but number was given."
    );

    err(
      () => assert.instanceOf(new Foo(), "batman"),
      "The instanceof assertion needs a constructor but string was given."
    );

    err(
      () => assert.instanceOf(new Foo(), {}),
      "The instanceof assertion needs a constructor but Object was given."
    );

    err(
      () => assert.instanceOf(new Foo(), true),
      "The instanceof assertion needs a constructor but boolean was given."
    );

    err(
      () => assert.instanceOf(new Foo(), null),
      "The instanceof assertion needs a constructor but null was given."
    );

    err(
      () => assert.instanceOf(new Foo(), undefined),
      "The instanceof assertion needs a constructor but undefined was given."
    );

    err(() => {
      function Thing() {}
      const t = new Thing();
      Thing.prototype = 1337;
      assert.instanceOf(t, Thing);
    }, "The instanceof assertion needs a constructor but function was given.");

    if (
      typeof Symbol !== "undefined" &&
      typeof Symbol.hasInstance !== "undefined"
    ) {
      err(
        () => assert.instanceOf(new Foo(), Symbol()),
        "The instanceof assertion needs a constructor but symbol was given."
      );

      err(() => {
        const FakeConstructor = {};
        const fakeInstanceB = 4;
        FakeConstructor[Symbol.hasInstance] = function(val) {
          return val === 3;
        };

        assert.instanceOf(fakeInstanceB, FakeConstructor);
      }, "expected 4 to be an instance of an unnamed constructor");
    }

    err(
      () => assert.instanceOf(5, Foo, "blah"),
      "blah: expected 5 to be an instance of Foo"
    );

    function CrashyObject() {}
    CrashyObject.prototype.inspect = () => {
      throw new Error("Arg's inspect() called even though the test passed");
    };
    assert.instanceOf(new CrashyObject(), CrashyObject);
  });

  it("notInstanceOf", () => {
    function Foo() {}
    assert.notInstanceOf(new Foo(), String);

    err(
      () => assert.notInstanceOf(new Foo(), 1, "blah"),
      "blah: The instanceof assertion needs a constructor but number was given."
    );

    err(
      () => assert.notInstanceOf(new Foo(), "batman"),
      "The instanceof assertion needs a constructor but string was given."
    );

    err(
      () => assert.notInstanceOf(new Foo(), {}),
      "The instanceof assertion needs a constructor but Object was given."
    );

    err(
      () => assert.notInstanceOf(new Foo(), true),
      "The instanceof assertion needs a constructor but boolean was given."
    );

    err(
      () => assert.notInstanceOf(new Foo(), null),
      "The instanceof assertion needs a constructor but null was given."
    );

    err(
      () => assert.notInstanceOf(new Foo(), undefined),
      "The instanceof assertion needs a constructor but undefined was given."
    );

    if (
      typeof Symbol !== "undefined" &&
      typeof Symbol.hasInstance !== "undefined"
    ) {
      err(
        () => assert.notInstanceOf(new Foo(), Symbol()),
        "The instanceof assertion needs a constructor but symbol was given."
      );

      err(() => {
        const FakeConstructor = {};
        const fakeInstanceB = 4;
        FakeConstructor[Symbol.hasInstance] = function(val) {
          return val === 4;
        };

        assert.notInstanceOf(fakeInstanceB, FakeConstructor);
      }, "expected 4 to not be an instance of an unnamed constructor");
    }

    err(
      () => assert.notInstanceOf(new Foo(), Foo, "blah"),
      "blah: expected Foo{} to not be an instance of Foo"
    );
  });

  it("isObject", () => {
    function Foo() {}
    assert.isObject({});
    assert.isObject(new Foo());

    err(
      () => assert.isObject(true, "blah"),
      "blah: expected true to be an object"
    );

    err(() => assert.isObject(Foo), "expected [Function Foo] to be an object");

    err(() => assert.isObject("foo"), "expected 'foo' to be an object");
  });

  it("isNotObject", () => {
    function Foo() {}
    assert.isNotObject(5);

    err(
      () => assert.isNotObject({}, "blah"),
      "blah: expected {} not to be an object"
    );
  });

  it("notEqual", () => {
    assert.notEqual(3, 4);

    if (typeof Symbol === "function") {
      const sym1 = Symbol(),
        sym2 = Symbol();
      assert.notEqual(sym1, sym2);
    }

    err(() => assert.notEqual(5, 5, "blah"), "blah: expected 5 to not equal 5");
  });

  it("strictEqual", () => {
    assert.strictEqual("foo", "foo");

    if (typeof Symbol === "function") {
      const sym = Symbol();
      assert.strictEqual(sym, sym);
    }

    err(
      () => assert.strictEqual("5", 5, "blah"),
      "blah: expected '5' to equal 5"
    );
  });

  it("notStrictEqual", () => {
    assert.notStrictEqual(5, "5");

    if (typeof Symbol === "function") {
      const sym1 = Symbol(),
        sym2 = Symbol();
      assert.notStrictEqual(sym1, sym2);
    }

    err(
      () => assert.notStrictEqual(5, 5, "blah"),
      "blah: expected 5 to not equal 5"
    );
  });

  it("deepEqual", () => {
    assert.deepEqual({ tea: "chai" }, { tea: "chai" });
    assert.deepStrictEqual({ tea: "chai" }, { tea: "chai" }); // Alias of deepEqual

    assert.deepEqual([NaN], [NaN]);
    assert.deepEqual({ tea: NaN }, { tea: NaN });

    err(
      () => assert.deepEqual({ tea: "chai" }, { tea: "black" }, "blah"),
      "blah: expected { tea: 'chai' } to deeply equal { tea: 'black' }"
    );

    const obja = Object.create({ tea: "chai" }),
      objb = Object.create({ tea: "chai" });

    assert.deepEqual(obja, objb);

    const obj1 = Object.create({ tea: "chai" }),
      obj2 = Object.create({ tea: "black" });

    err(() => assert.deepEqual(obj1, obj2), "expected {} to deeply equal {}");
  });

  it("deepEqual (ordering)", () => {
    const a = { a: "b", c: "d" },
      b = { c: "d", a: "b" };
    assert.deepEqual(a, b);
  });

  it("deepEqual /regexp/", () => {
    assert.deepEqual(/a/, /a/);
    assert.notDeepEqual(/a/, /b/);
    assert.notDeepEqual(/a/, {});
    assert.deepEqual(/a/g, /a/g);
    assert.notDeepEqual(/a/g, /b/g);
    assert.deepEqual(/a/i, /a/i);
    assert.notDeepEqual(/a/i, /b/i);
    assert.deepEqual(/a/m, /a/m);
    assert.notDeepEqual(/a/m, /b/m);
  });

  it("deepEqual (Date)", () => {
    const a = new Date(1, 2, 3),
      b = new Date(4, 5, 6);
    assert.deepEqual(a, a);
    assert.notDeepEqual(a, b);
    assert.notDeepEqual(a, {});
  });

  it("deepEqual (circular)", () => {
    const circularObject = {},
      secondCircularObject = {};
    circularObject.field = circularObject;
    secondCircularObject.field = secondCircularObject;

    assert.deepEqual(circularObject, secondCircularObject);

    err(() => {
      secondCircularObject.field2 = secondCircularObject;
      assert.deepEqual(circularObject, secondCircularObject);
    }, "expected { field: [Circular] } to deeply equal { field: [Circular], …(1) }");
  });

  it("notDeepEqual", () => {
    assert.notDeepEqual({ tea: "jasmine" }, { tea: "chai" });

    err(
      () => assert.notDeepEqual({ tea: "chai" }, { tea: "chai" }, "blah"),
      "blah: expected { tea: 'chai' } to not deeply equal { tea: 'chai' }"
    );
  });

  it("notDeepEqual (circular)", () => {
    const circularObject = {},
      secondCircularObject = { tea: "jasmine" };
    circularObject.field = circularObject;
    secondCircularObject.field = secondCircularObject;

    assert.notDeepEqual(circularObject, secondCircularObject);

    err(() => {
      delete secondCircularObject.tea;
      assert.notDeepEqual(circularObject, secondCircularObject);
    }, "expected { field: [Circular] } to not deeply equal { field: [Circular] }");
  });

  it("isNull", () => {
    assert.isNull(null);

    err(
      () => assert.isNull(undefined, "blah"),
      "blah: expected undefined to equal null"
    );
  });

  it("isNotNull", () => {
    assert.isNotNull(undefined);

    err(
      () => assert.isNotNull(null, "blah"),
      "blah: expected null to not equal null"
    );
  });

  it("isNaN", () => {
    assert.isNaN(NaN);

    err(
      () => assert.isNaN(Infinity, "blah"),
      "blah: expected Infinity to be NaN"
    );

    err(() => assert.isNaN(undefined), "expected undefined to be NaN");

    err(() => assert.isNaN({}), "expected {} to be NaN");

    err(() => assert.isNaN(4), "expected 4 to be NaN");
  });

  it("isNotNaN", () => {
    assert.isNotNaN(4);
    assert.isNotNaN(Infinity);
    assert.isNotNaN(undefined);
    assert.isNotNaN({});

    err(() => assert.isNotNaN(NaN, "blah"), "blah: expected NaN not to be NaN");
  });

  it("exists", () => {
    const meeber = "awesome";
    var iDoNotExist;

    assert.exists(meeber);
    assert.exists(0);
    assert.exists(false);
    assert.exists("");

    err(
      () => assert.exists(iDoNotExist, "blah"),
      "blah: expected undefined to exist"
    );
  });

  it("notExists", () => {
    const meeber = "awesome";
    var iDoNotExist;

    assert.notExists(iDoNotExist);

    err(
      () => assert.notExists(meeber, "blah"),
      "blah: expected 'awesome' to not exist"
    );
  });

  it("isUndefined", () => {
    assert.isUndefined(undefined);

    err(
      () => assert.isUndefined(null, "blah"),
      "blah: expected null to equal undefined"
    );
  });

  it("isDefined", () => {
    assert.isDefined(null);

    err(
      () => assert.isDefined(undefined, "blah"),
      "blah: expected undefined to not equal undefined"
    );
  });

  it("isFunction", () => {
    const func = () => {};
    assert.isFunction(func);

    err(
      () => assert.isFunction({}, "blah"),
      "blah: expected {} to be a function"
    );
  });

  it("isNotFunction", () => {
    assert.isNotFunction(5);

    err(
      () => assert.isNotFunction(() => {}, "blah"),
      "blah: expected [Function] not to be a function"
    );
  });

  it("isArray", () => {
    assert.isArray([]);
    assert.isArray(new Array());

    err(() => assert.isArray({}, "blah"), "blah: expected {} to be an array");
  });

  it("isNotArray", () => {
    assert.isNotArray(3);

    err(
      () => assert.isNotArray([], "blah"),
      "blah: expected [] not to be an array"
    );

    err(() => assert.isNotArray(new Array()), "expected [] not to be an array");
  });

  it("isString", () => {
    assert.isString("Foo");
    assert.isString(new String("foo"));

    err(() => assert.isString(1, "blah"), "blah: expected 1 to be a string");
  });

  it("isNotString", () => {
    assert.isNotString(3);
    assert.isNotString(["hello"]);

    err(
      () => assert.isNotString("hello", "blah"),
      "blah: expected 'hello' not to be a string"
    );
  });

  it("isNumber", () => {
    assert.isNumber(1);
    assert.isNumber(Number("3"));

    err(
      () => assert.isNumber("1", "blah"),
      "blah: expected '1' to be a number"
    );
  });

  it("isNotNumber", () => {
    assert.isNotNumber("hello");
    assert.isNotNumber([5]);

    err(
      () => assert.isNotNumber(4, "blah"),
      "blah: expected 4 not to be a number"
    );
  });

  it("isFinite", () => {
    assert.isFinite(4);
    assert.isFinite(-10);

    err(
      () => assert.isFinite(NaN, "blah"),
      "blah: expected NaN to be a finite number"
    );

    err(
      () => assert.isFinite(Infinity),
      "expected Infinity to be a finite number"
    );

    err(() => assert.isFinite("foo"), "expected 'foo' to be a finite number");

    err(() => assert.isFinite([]), "expected [] to be a finite number");

    err(() => assert.isFinite({}), "expected {} to be a finite number");
  });

  it("isBoolean", () => {
    assert.isBoolean(true);
    assert.isBoolean(false);

    err(
      () => assert.isBoolean("1", "blah"),
      "blah: expected '1' to be a boolean"
    );
  });

  it("isNotBoolean", () => {
    assert.isNotBoolean("true");

    err(
      () => assert.isNotBoolean(true, "blah"),
      "blah: expected true not to be a boolean"
    );

    err(() => assert.isNotBoolean(false), "expected false not to be a boolean");
  });

  it("include", () => {
    assert.include("foobar", "bar");
    assert.include("", "");
    assert.include([1, 2, 3], 3);

    // .include should work with Error objects and objects with a custom
    // `@@toStringTag`.
    assert.include(new Error("foo"), { message: "foo" });
    if (
      typeof Symbol !== "undefined" &&
      typeof Symbol.toStringTag !== "undefined"
    ) {
      const customObj = { a: 1 };
      customObj[Symbol.toStringTag] = "foo";

      assert.include(customObj, { a: 1 });
    }

    const obj1 = { a: 1 },
      obj2 = { b: 2 };
    assert.include([obj1, obj2], obj1);
    assert.include({ foo: obj1, bar: obj2 }, { foo: obj1 });
    assert.include({ foo: obj1, bar: obj2 }, { foo: obj1, bar: obj2 });

    if (typeof Map === "function") {
      const map = new Map();
      const val = [{ a: 1 }];
      map.set("a", val);
      map.set("b", 2);
      map.set("c", -0);
      map.set("d", NaN);

      assert.include(map, val);
      assert.include(map, 2);
      assert.include(map, 0);
      assert.include(map, NaN);
    }

    if (typeof Set === "function") {
      const set = new Set();
      const val = [{ a: 1 }];
      set.add(val);
      set.add(2);
      set.add(-0);
      set.add(NaN);

      assert.include(set, val);
      assert.include(set, 2);
      if (set.has(0)) {
        // This test is skipped in IE11 because (contrary to spec) IE11 uses
        // SameValue instead of SameValueZero equality for sets.
        assert.include(set, 0);
      }
      assert.include(set, NaN);
    }

    if (typeof WeakSet === "function") {
      const ws = new WeakSet();
      const val = [{ a: 1 }];
      ws.add(val);

      assert.include(ws, val);
    }

    if (typeof Symbol === "function") {
      const sym1 = Symbol(),
        sym2 = Symbol();
      assert.include([sym1, sym2], sym1);
    }

    err(
      () => assert.include("foobar", "baz", "blah"),
      "blah: expected 'foobar' to include 'baz'"
    );

    err(
      () => assert.include([{ a: 1 }, { b: 2 }], { a: 1 }),
      "expected [ { a: 1 }, { b: 2 } ] to include { a: 1 }"
    );

    err(() => {
      assert.include(
        { foo: { a: 1 }, bar: { b: 2 } },
        { foo: { a: 1 } },
        "blah"
      );
    }, "blah: expected { foo: { a: 1 }, bar: { b: 2 } } to have property 'foo' of { a: 1 }, but got { a: 1 }");

    err(
      () => assert.include(true, true, "blah"),
      "blah: the given combination of arguments (boolean and boolean) is invalid for this assertion. " +
        "You can use an array, a map, an object, a set, a string, or a weakset instead of a boolean"
    );

    err(
      () => assert.include(42, "bar"),
      "the given combination of arguments (number and string) is invalid for this assertion. " +
        "You can use an array, a map, an object, a set, a string, or a weakset instead of a string"
    );

    err(
      () => assert.include(null, 42),
      "the given combination of arguments (null and number) is invalid for this assertion. " +
        "You can use an array, a map, an object, a set, a string, or a weakset instead of a number"
    );

    err(
      () => assert.include(undefined, "bar"),
      "the given combination of arguments (undefined and string) is invalid for this assertion. " +
        "You can use an array, a map, an object, a set, a string, or a weakset instead of a string"
    );
  });

  it("notInclude", () => {
    assert.notInclude("foobar", "baz");
    assert.notInclude([1, 2, 3], 4);

    const obj1 = { a: 1 },
      obj2 = { b: 2 };
    assert.notInclude([obj1, obj2], { a: 1 });
    assert.notInclude({ foo: obj1, bar: obj2 }, { foo: { a: 1 } });
    assert.notInclude({ foo: obj1, bar: obj2 }, { foo: obj1, bar: { b: 2 } });

    if (typeof Map === "function") {
      const map = new Map();
      const val = [{ a: 1 }];
      map.set("a", val);
      map.set("b", 2);

      assert.notInclude(map, [{ a: 1 }]);
      assert.notInclude(map, 3);
    }

    if (typeof Set === "function") {
      const set = new Set();
      const val = [{ a: 1 }];
      set.add(val);
      set.add(2);

      assert.include(set, val);
      assert.include(set, 2);

      assert.notInclude(set, [{ a: 1 }]);
      assert.notInclude(set, 3);
    }

    if (typeof WeakSet === "function") {
      const ws = new WeakSet();
      const val = [{ a: 1 }];
      ws.add(val);

      assert.notInclude(ws, [{ a: 1 }]);
      assert.notInclude(ws, {});
    }

    if (typeof Symbol === "function") {
      const sym1 = Symbol(),
        sym2 = Symbol(),
        sym3 = Symbol();
      assert.notInclude([sym1, sym2], sym3);
    }

    err(() => {
      const obj1 = { a: 1 },
        obj2 = { b: 2 };
      assert.notInclude([obj1, obj2], obj1, "blah");
    }, "blah: expected [ { a: 1 }, { b: 2 } ] to not include { a: 1 }");

    err(() => {
      const obj1 = { a: 1 },
        obj2 = { b: 2 };
      assert.notInclude(
        { foo: obj1, bar: obj2 },
        { foo: obj1, bar: obj2 },
        "blah"
      );
    }, "blah: expected { foo: { a: 1 }, bar: { b: 2 } } to not have property 'foo' of { a: 1 }");

    err(
      () => assert.notInclude(true, true, "blah"),
      "blah: the given combination of arguments (boolean and boolean) is invalid for this assertion. " +
        "You can use an array, a map, an object, a set, a string, or a weakset instead of a boolean"
    );

    err(
      () => assert.notInclude(42, "bar"),
      "the given combination of arguments (number and string) is invalid for this assertion. " +
        "You can use an array, a map, an object, a set, a string, or a weakset instead of a string"
    );

    err(
      () => assert.notInclude(null, 42),
      "the given combination of arguments (null and number) is invalid for this assertion. " +
        "You can use an array, a map, an object, a set, a string, or a weakset instead of a number"
    );

    err(
      () => assert.notInclude(undefined, "bar"),
      "the given combination of arguments (undefined and string) is invalid for this assertion. " +
        "You can use an array, a map, an object, a set, a string, or a weakset instead of a string"
    );

    err(
      () => assert.notInclude("foobar", "bar"),
      "expected 'foobar' to not include 'bar'"
    );
  });

  it("deepInclude and notDeepInclude", () => {
    const obj1 = { a: 1 },
      obj2 = { b: 2 };
    assert.deepInclude([obj1, obj2], { a: 1 });
    assert.notDeepInclude([obj1, obj2], { a: 9 });
    assert.notDeepInclude([obj1, obj2], { z: 1 });
    assert.deepInclude({ foo: obj1, bar: obj2 }, { foo: { a: 1 } });
    assert.deepInclude(
      { foo: obj1, bar: obj2 },
      { foo: { a: 1 }, bar: { b: 2 } }
    );
    assert.notDeepInclude({ foo: obj1, bar: obj2 }, { foo: { a: 9 } });
    assert.notDeepInclude({ foo: obj1, bar: obj2 }, { foo: { z: 1 } });
    assert.notDeepInclude({ foo: obj1, bar: obj2 }, { baz: { a: 1 } });
    assert.notDeepInclude(
      { foo: obj1, bar: obj2 },
      { foo: { a: 1 }, bar: { b: 9 } }
    );

    if (typeof Map === "function") {
      const map = new Map();
      map.set(1, [{ a: 1 }]);

      assert.deepInclude(map, [{ a: 1 }]);
    }

    if (typeof Set === "function") {
      const set = new Set();
      set.add([{ a: 1 }]);

      assert.deepInclude(set, [{ a: 1 }]);
    }

    if (typeof WeakSet === "function") {
      err(
        () => assert.deepInclude(new WeakSet(), {}, "foo"),
        "foo: unable to use .deep.include with WeakSet"
      );
    }

    err(
      () => assert.deepInclude([obj1, obj2], { a: 9 }, "blah"),
      "blah: expected [ { a: 1 }, { b: 2 } ] to deep include { a: 9 }"
    );

    err(
      () => assert.notDeepInclude([obj1, obj2], { a: 1 }),
      "expected [ { a: 1 }, { b: 2 } ] to not deep include { a: 1 }"
    );

    err(() => {
      assert.deepInclude(
        { foo: obj1, bar: obj2 },
        { foo: { a: 1 }, bar: { b: 9 } },
        "blah"
      );
    }, "blah: expected { foo: { a: 1 }, bar: { b: 2 } } to have deep property 'bar' of { b: 9 }, but got { b: 2 }");

    err(() => {
      assert.notDeepInclude(
        { foo: obj1, bar: obj2 },
        { foo: { a: 1 }, bar: { b: 2 } },
        "blah"
      );
    }, "blah: expected { foo: { a: 1 }, bar: { b: 2 } } to not have deep property 'foo' of { a: 1 }");
  });

  it("nestedInclude and notNestedInclude", () => {
    assert.nestedInclude({ a: { b: ["x", "y"] } }, { "a.b[1]": "y" });
    assert.notNestedInclude({ a: { b: ["x", "y"] } }, { "a.b[1]": "x" });
    assert.notNestedInclude({ a: { b: ["x", "y"] } }, { "a.c": "y" });

    assert.notNestedInclude({ a: { b: [{ x: 1 }] } }, { "a.b[0]": { x: 1 } });

    assert.nestedInclude({ ".a": { "[b]": "x" } }, { "\\.a.\\[b\\]": "x" });
    assert.notNestedInclude({ ".a": { "[b]": "x" } }, { "\\.a.\\[b\\]": "y" });

    err(
      () =>
        assert.nestedInclude(
          { a: { b: ["x", "y"] } },
          { "a.b[1]": "x" },
          "blah"
        ),
      "blah: expected { a: { b: [ 'x', 'y' ] } } to have nested property 'a.b[1]' of 'x', but got 'y'"
    );

    err(
      () =>
        assert.nestedInclude(
          { a: { b: ["x", "y"] } },
          { "a.b[1]": "x" },
          "blah"
        ),
      "blah: expected { a: { b: [ 'x', 'y' ] } } to have nested property 'a.b[1]' of 'x', but got 'y'"
    );

    err(
      () => assert.nestedInclude({ a: { b: ["x", "y"] } }, { "a.c": "y" }),
      "expected { a: { b: [ 'x', 'y' ] } } to have nested property 'a.c'"
    );

    err(() => {
      assert.notNestedInclude(
        { a: { b: ["x", "y"] } },
        { "a.b[1]": "y" },
        "blah"
      );
    }, "blah: expected { a: { b: [ 'x', 'y' ] } } to not have nested property 'a.b[1]' of 'y'");
  });

  it("deepNestedInclude and notDeepNestedInclude", () => {
    assert.deepNestedInclude({ a: { b: [{ x: 1 }] } }, { "a.b[0]": { x: 1 } });
    assert.notDeepNestedInclude(
      { a: { b: [{ x: 1 }] } },
      { "a.b[0]": { y: 2 } }
    );
    assert.notDeepNestedInclude({ a: { b: [{ x: 1 }] } }, { "a.c": { x: 1 } });

    assert.deepNestedInclude(
      { ".a": { "[b]": { x: 1 } } },
      { "\\.a.\\[b\\]": { x: 1 } }
    );
    assert.notDeepNestedInclude(
      { ".a": { "[b]": { x: 1 } } },
      { "\\.a.\\[b\\]": { y: 2 } }
    );

    err(() => {
      assert.deepNestedInclude(
        { a: { b: [{ x: 1 }] } },
        { "a.b[0]": { y: 2 } },
        "blah"
      );
    }, "blah: expected { a: { b: [ { x: 1 } ] } } to have deep nested property 'a.b[0]' of { y: 2 }, but got { x: 1 }");

    err(() => {
      assert.deepNestedInclude(
        { a: { b: [{ x: 1 }] } },
        { "a.b[0]": { y: 2 } },
        "blah"
      );
    }, "blah: expected { a: { b: [ { x: 1 } ] } } to have deep nested property 'a.b[0]' of { y: 2 }, but got { x: 1 }");

    err(
      () =>
        assert.deepNestedInclude({ a: { b: [{ x: 1 }] } }, { "a.c": { x: 1 } }),
      "expected { a: { b: [ { x: 1 } ] } } to have deep nested property 'a.c'"
    );

    err(() => {
      assert.notDeepNestedInclude(
        { a: { b: [{ x: 1 }] } },
        { "a.b[0]": { x: 1 } },
        "blah"
      );
    }, "blah: expected { a: { b: [ { x: 1 } ] } } to not have deep nested property 'a.b[0]' of { x: 1 }");
  });

  it("ownInclude and notOwnInclude", () => {
    assert.ownInclude({ a: 1 }, { a: 1 });
    assert.notOwnInclude({ a: 1 }, { a: 3 });
    assert.notOwnInclude({ a: 1 }, { toString: Object.prototype.toString });

    assert.notOwnInclude({ a: { b: 2 } }, { a: { b: 2 } });

    err(
      () => assert.ownInclude({ a: 1 }, { a: 3 }, "blah"),
      "blah: expected { a: 1 } to have own property 'a' of 3, but got 1"
    );

    err(
      () => assert.ownInclude({ a: 1 }, { a: 3 }, "blah"),
      "blah: expected { a: 1 } to have own property 'a' of 3, but got 1"
    );

    err(
      () =>
        assert.ownInclude({ a: 1 }, { toString: Object.prototype.toString }),
      "expected { a: 1 } to have own property 'toString'"
    );

    err(
      () => assert.notOwnInclude({ a: 1 }, { a: 1 }, "blah"),
      "blah: expected { a: 1 } to not have own property 'a' of 1"
    );
  });

  it("deepOwnInclude and notDeepOwnInclude", () => {
    assert.deepOwnInclude({ a: { b: 2 } }, { a: { b: 2 } });
    assert.notDeepOwnInclude({ a: { b: 2 } }, { a: { c: 3 } });
    assert.notDeepOwnInclude(
      { a: { b: 2 } },
      { toString: Object.prototype.toString }
    );

    err(
      () => assert.deepOwnInclude({ a: { b: 2 } }, { a: { c: 3 } }, "blah"),
      "blah: expected { a: { b: 2 } } to have deep own property 'a' of { c: 3 }, but got { b: 2 }"
    );

    err(
      () => assert.deepOwnInclude({ a: { b: 2 } }, { a: { c: 3 } }, "blah"),
      "blah: expected { a: { b: 2 } } to have deep own property 'a' of { c: 3 }, but got { b: 2 }"
    );

    err(() => {
      assert.deepOwnInclude(
        { a: { b: 2 } },
        { toString: Object.prototype.toString }
      );
    }, "expected { a: { b: 2 } } to have deep own property 'toString'");

    err(
      () => assert.notDeepOwnInclude({ a: { b: 2 } }, { a: { b: 2 } }, "blah"),
      "blah: expected { a: { b: 2 } } to not have deep own property 'a' of { b: 2 }"
    );
  });

  it("keys(array|Object|arguments)", () => {
    assert.hasAllKeys({ foo: 1 }, ["foo"]);
    assert.hasAllKeys({ foo: 1, bar: 2 }, ["foo", "bar"]);
    assert.hasAllKeys({ foo: 1 }, { foo: 30 });
    assert.hasAllKeys({ foo: 1, bar: 2 }, { foo: 6, bar: 7 });

    assert.containsAllKeys({ foo: 1, bar: 2, baz: 3 }, ["foo", "bar"]);
    assert.containsAllKeys({ foo: 1, bar: 2, baz: 3 }, ["bar", "foo"]);
    assert.containsAllKeys({ foo: 1, bar: 2, baz: 3 }, ["baz"]);
    assert.containsAllKeys({ foo: 1, bar: 2 }, ["foo"]);
    assert.containsAllKeys({ foo: 1, bar: 2 }, ["bar"]);
    assert.containsAllKeys({ foo: 1, bar: 2 }, { foo: 6 });
    assert.containsAllKeys({ foo: 1, bar: 2 }, { bar: 7 });
    assert.containsAllKeys({ foo: 1, bar: 2 }, { foo: 6 });
    assert.containsAllKeys({ foo: 1, bar: 2 }, { bar: 7, foo: 6 });

    assert.doesNotHaveAllKeys({ foo: 1, bar: 2 }, ["baz"]);
    assert.doesNotHaveAllKeys({ foo: 1, bar: 2 }, ["foo"]);
    assert.doesNotHaveAllKeys({ foo: 1, bar: 2 }, ["foo", "baz"]);
    assert.doesNotHaveAllKeys({ foo: 1, bar: 2, baz: 3 }, [
      "foo",
      "bar",
      "baz",
      "fake"
    ]);
    assert.doesNotHaveAllKeys({ foo: 1, bar: 2 }, ["baz", "foo"]);
    assert.doesNotHaveAllKeys({ foo: 1, bar: 2 }, { baz: 8 });
    assert.doesNotHaveAllKeys({ foo: 1, bar: 2 }, { baz: 8, foo: 7 });
    assert.doesNotHaveAllKeys({ foo: 1, bar: 2 }, { baz: 8, fake: 7 });

    assert.hasAnyKeys({ foo: 1, bar: 2 }, ["foo", "baz"]);
    assert.hasAnyKeys({ foo: 1, bar: 2 }, ["foo"]);
    assert.hasAnyKeys({ foo: 1, bar: 2 }, ["bar", "baz"]);
    assert.hasAnyKeys({ foo: 1, bar: 2 }, ["bar", "foo"]);
    assert.hasAnyKeys({ foo: 1, bar: 2 }, ["foo", "bar"]);
    assert.hasAnyKeys({ foo: 1, bar: 2 }, ["baz", "fake", "foo"]);
    assert.hasAnyKeys({ foo: 1, bar: 2 }, { foo: 6 });
    assert.hasAnyKeys({ foo: 1, bar: 2 }, { baz: 6, foo: 12 });

    assert.doesNotHaveAnyKeys({ foo: 1, bar: 2 }, ["baz", "abc", "def"]);
    assert.doesNotHaveAnyKeys({ foo: 1, bar: 2 }, ["baz"]);
    assert.doesNotHaveAnyKeys({ foo: 1, bar: 2 }, { baz: 1, biz: 2, fake: 3 });
    assert.doesNotHaveAnyKeys({ foo: 1, bar: 2 }, { baz: 1 });

    const enumProp1 = "enumProp1",
      enumProp2 = "enumProp2",
      nonEnumProp = "nonEnumProp",
      obj = {};

    obj[enumProp1] = "enumProp1";
    obj[enumProp2] = "enumProp2";

    Object.defineProperty(obj, nonEnumProp, {
      enumerable: false,
      value: "nonEnumProp"
    });

    assert.hasAllKeys(obj, [enumProp1, enumProp2]);
    assert.doesNotHaveAllKeys(obj, [enumProp1, enumProp2, nonEnumProp]);

    if (typeof Symbol === "function") {
      const sym1 = Symbol("sym1"),
        sym2 = Symbol("sym2"),
        sym3 = Symbol("sym3"),
        str = "str",
        obj = {};

      obj[sym1] = "sym1";
      obj[sym2] = "sym2";
      obj[str] = "str";

      Object.defineProperty(obj, sym3, {
        enumerable: false,
        value: "sym3"
      });

      assert.hasAllKeys(obj, [sym1, sym2, str]);
      assert.doesNotHaveAllKeys(obj, [sym1, sym2, sym3, str]);
    }

    if (typeof Map !== "undefined") {
      // Not using Map constructor args because not supported in IE 11.
      const aKey = { thisIs: "anExampleObject" },
        anotherKey = { doingThisBecauseOf: "referential equality" },
        testMap = new Map();

      testMap.set(aKey, "aValue");
      testMap.set(anotherKey, "anotherValue");

      assert.hasAnyKeys(testMap, [aKey]);
      assert.hasAnyKeys(testMap, ["thisDoesNotExist", "thisToo", aKey]);
      assert.hasAllKeys(testMap, [aKey, anotherKey]);

      assert.containsAllKeys(testMap, [aKey]);
      assert.doesNotHaveAllKeys(testMap, [aKey, { iDoNot: "exist" }]);

      assert.doesNotHaveAnyKeys(testMap, [{ iDoNot: "exist" }]);
      assert.doesNotHaveAnyKeys(testMap, [
        "thisDoesNotExist",
        "thisToo",
        { iDoNot: "exist" }
      ]);
      assert.doesNotHaveAllKeys(testMap, [
        "thisDoesNotExist",
        "thisToo",
        anotherKey
      ]);

      assert.doesNotHaveAnyKeys(testMap, [
        { iDoNot: "exist" },
        "thisDoesNotExist"
      ]);
      assert.doesNotHaveAnyKeys(testMap, [
        "thisDoesNotExist",
        "thisToo",
        { iDoNot: "exist" }
      ]);
      assert.doesNotHaveAllKeys(testMap, [aKey, { iDoNot: "exist" }]);

      // Ensure the assertions above use strict equality
      assert.doesNotHaveAnyKeys(testMap, { thisIs: "anExampleObject" });
      assert.doesNotHaveAllKeys(testMap, [
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      ]);

      err(() => {
        assert.hasAnyKeys(testMap, [{ thisIs: "anExampleObject" }]);
      });

      err(() => {
        assert.hasAllKeys(testMap, [
          { thisIs: "anExampleObject" },
          { doingThisBecauseOf: "referential equality" }
        ]);
      });

      err(() => {
        assert.containsAllKeys(testMap, [{ thisIs: "anExampleObject" }]);
      });

      // Tests for the deep variations of the keys assertion
      assert.hasAnyDeepKeys(testMap, { thisIs: "anExampleObject" });
      assert.hasAnyDeepKeys(testMap, [
        { thisIs: "anExampleObject" },
        { three: "three" }
      ]);
      assert.hasAnyDeepKeys(testMap, [
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      ]);

      assert.hasAllDeepKeys(testMap, [
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      ]);

      assert.containsAllDeepKeys(testMap, { thisIs: "anExampleObject" });
      assert.containsAllDeepKeys(testMap, [
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      ]);

      assert.doesNotHaveAnyDeepKeys(testMap, { thisDoesNot: "exist" });
      assert.doesNotHaveAnyDeepKeys(testMap, [
        { twenty: "twenty" },
        { fifty: "fifty" }
      ]);

      assert.doesNotHaveAllDeepKeys(testMap, { thisDoesNot: "exist" });
      assert.doesNotHaveAllDeepKeys(testMap, [
        { twenty: "twenty" },
        { thisIs: "anExampleObject" }
      ]);

      const weirdMapKey1 = Object.create(null),
        weirdMapKey2 = { toString: NaN },
        weirdMapKey3 = [],
        weirdMap = new Map();

      weirdMap.set(weirdMapKey1, "val1");
      weirdMap.set(weirdMapKey2, "val2");

      assert.hasAllKeys(weirdMap, [weirdMapKey1, weirdMapKey2]);
      assert.doesNotHaveAllKeys(weirdMap, [weirdMapKey1, weirdMapKey3]);

      if (typeof Symbol === "function") {
        const symMapKey1 = Symbol(),
          symMapKey2 = Symbol(),
          symMapKey3 = Symbol(),
          symMap = new Map();

        symMap.set(symMapKey1, "val1");
        symMap.set(symMapKey2, "val2");

        assert.hasAllKeys(symMap, [symMapKey1, symMapKey2]);
        assert.hasAnyKeys(symMap, [symMapKey1, symMapKey3]);
        assert.containsAllKeys(symMap, [symMapKey2, symMapKey1]);

        assert.doesNotHaveAllKeys(symMap, [symMapKey1, symMapKey3]);
        assert.doesNotHaveAnyKeys(symMap, [symMapKey3]);
      }

      const errMap = new Map();

      errMap.set({ 1: 20 }, "number");

      err(() => assert.hasAllKeys(errMap, [], "blah"), "blah: keys required");

      err(
        () => assert.containsAllKeys(errMap, [], "blah"),
        "blah: keys required"
      );

      err(
        () => assert.doesNotHaveAllKeys(errMap, [], "blah"),
        "blah: keys required"
      );

      err(() => assert.hasAnyKeys(errMap, [], "blah"), "blah: keys required");

      err(
        () => assert.doesNotHaveAnyKeys(errMap, [], "blah"),
        "blah: keys required"
      );

      // Uncomment this after solving https://github.com/chaijs/chai/issues/662
      // This should fail because of referential equality (this is a strict comparison)
      // err(function(){
      //   assert.containsAllKeys(new Map([[{foo: 1}, 'bar']]), { foo: 1 });
      // }, 'expected [ [ { foo: 1 }, 'bar' ] ] to contain key { foo: 1 }');

      // err(function(){
      //   assert.containsAllDeepKeys(new Map([[{foo: 1}, 'bar']]), { iDoNotExist: 0 })
      // }, 'expected [ { foo: 1 } ] to deeply contain key { iDoNotExist: 0 }');
    }

    if (typeof Set !== "undefined") {
      // Not using Set constructor args because not supported in IE 11.
      const aKey = { thisIs: "anExampleObject" },
        anotherKey = { doingThisBecauseOf: "referential equality" },
        testSet = new Set();

      testSet.add(aKey);
      testSet.add(anotherKey);

      assert.hasAnyKeys(testSet, [aKey]);
      assert.hasAnyKeys(testSet, [20, 1, aKey]);
      assert.hasAllKeys(testSet, [aKey, anotherKey]);

      assert.containsAllKeys(testSet, [aKey]);
      assert.doesNotHaveAllKeys(testSet, [aKey, { iDoNot: "exist" }]);

      assert.doesNotHaveAnyKeys(testSet, [{ iDoNot: "exist" }]);
      assert.doesNotHaveAnyKeys(testSet, [
        "thisDoesNotExist",
        "thisToo",
        { iDoNot: "exist" }
      ]);
      assert.doesNotHaveAllKeys(testSet, [
        "thisDoesNotExist",
        "thisToo",
        anotherKey
      ]);

      assert.doesNotHaveAnyKeys(testSet, [
        { iDoNot: "exist" },
        "thisDoesNotExist"
      ]);
      assert.doesNotHaveAnyKeys(testSet, [20, 1, { iDoNot: "exist" }]);
      assert.doesNotHaveAllKeys(testSet, [
        "thisDoesNotExist",
        "thisToo",
        { iDoNot: "exist" }
      ]);

      // Ensure the assertions above use strict equality
      assert.doesNotHaveAnyKeys(testSet, { thisIs: "anExampleObject" });
      assert.doesNotHaveAllKeys(testSet, [
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      ]);

      err(() => {
        assert.hasAnyKeys(testSet, [{ thisIs: "anExampleObject" }]);
      });

      err(() => {
        assert.hasAllKeys(testSet, [
          { thisIs: "anExampleObject" },
          { doingThisBecauseOf: "referential equality" }
        ]);
      });

      err(() => {
        assert.containsAllKeys(testSet, [{ thisIs: "anExampleObject" }]);
      });

      // Tests for the deep variations of the keys assertion
      assert.hasAnyDeepKeys(testSet, { thisIs: "anExampleObject" });
      assert.hasAnyDeepKeys(testSet, [
        { thisIs: "anExampleObject" },
        { three: "three" }
      ]);
      assert.hasAnyDeepKeys(testSet, [
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      ]);

      assert.hasAllDeepKeys(testSet, [
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      ]);

      assert.containsAllDeepKeys(testSet, { thisIs: "anExampleObject" });
      assert.containsAllDeepKeys(testSet, [
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      ]);

      assert.doesNotHaveAnyDeepKeys(testSet, { twenty: "twenty" });
      assert.doesNotHaveAnyDeepKeys(testSet, [
        { twenty: "twenty" },
        { fifty: "fifty" }
      ]);

      assert.doesNotHaveAllDeepKeys(testSet, { twenty: "twenty" });
      assert.doesNotHaveAllDeepKeys(testSet, [
        { thisIs: "anExampleObject" },
        { fifty: "fifty" }
      ]);

      const weirdSetKey1 = Object.create(null),
        weirdSetKey2 = { toString: NaN },
        weirdSetKey3 = [],
        weirdSet = new Set();

      weirdSet.add(weirdSetKey1);
      weirdSet.add(weirdSetKey2);

      assert.hasAllKeys(weirdSet, [weirdSetKey1, weirdSetKey2]);
      assert.doesNotHaveAllKeys(weirdSet, [weirdSetKey1, weirdSetKey3]);

      if (typeof Symbol === "function") {
        const symSetKey1 = Symbol(),
          symSetKey2 = Symbol(),
          symSetKey3 = Symbol(),
          symSet = new Set();

        symSet.add(symSetKey1);
        symSet.add(symSetKey2);

        assert.hasAllKeys(symSet, [symSetKey1, symSetKey2]);
        assert.hasAnyKeys(symSet, [symSetKey1, symSetKey3]);
        assert.containsAllKeys(symSet, [symSetKey2, symSetKey1]);

        assert.doesNotHaveAllKeys(symSet, [symSetKey1, symSetKey3]);
        assert.doesNotHaveAnyKeys(symSet, [symSetKey3]);
      }

      const errSet = new Set();

      errSet.add({ 1: 20 });
      errSet.add("number");

      err(() => assert.hasAllKeys(errSet, [], "blah"), "blah: keys required");

      err(
        () => assert.containsAllKeys(errSet, [], "blah"),
        "blah: keys required"
      );

      err(
        () => assert.doesNotHaveAllKeys(errSet, [], "blah"),
        "blah: keys required"
      );

      err(() => assert.hasAnyKeys(errSet, [], "blah"), "blah: keys required");

      err(
        () => assert.doesNotHaveAnyKeys(errSet, [], "blah"),
        "blah: keys required"
      );

      // Uncomment this after solving https://github.com/chaijs/chai/issues/662
      // This should fail because of referential equality (this is a strict comparison)
      // err(function(){
      //   assert.containsAllKeys(new Set([{foo: 1}]), { foo: 1 });
      // }, 'expected [ [ { foo: 1 }, 'bar' ] ] to contain key { foo: 1 }');

      // err(function(){
      //   assert.containsAllDeepKeys(new Set([{foo: 1}]), { iDoNotExist: 0 })
      // }, 'expected [ { foo: 1 } ] to deeply contain key { iDoNotExist: 0 }');
    }

    err(() => assert.hasAllKeys({ foo: 1 }, [], "blah"), "blah: keys required");

    err(
      () => assert.containsAllKeys({ foo: 1 }, [], "blah"),
      "blah: keys required"
    );

    err(
      () => assert.doesNotHaveAllKeys({ foo: 1 }, [], "blah"),
      "blah: keys required"
    );

    err(() => assert.hasAnyKeys({ foo: 1 }, [], "blah"), "blah: keys required");

    err(
      () => assert.doesNotHaveAnyKeys({ foo: 1 }, [], "blah"),
      "blah: keys required"
    );

    err(
      () => assert.hasAllKeys({ foo: 1 }, ["bar"], "blah"),
      "blah: expected { foo: 1 } to have key 'bar'"
    );

    err(
      () => assert.hasAllKeys({ foo: 1 }, ["bar", "baz"]),
      "expected { foo: 1 } to have keys 'bar', and 'baz'"
    );

    err(
      () => assert.hasAllKeys({ foo: 1 }, ["foo", "bar", "baz"]),
      "expected { foo: 1 } to have keys 'foo', 'bar', and 'baz'"
    );

    err(
      () => assert.doesNotHaveAllKeys({ foo: 1 }, ["foo"], "blah"),
      "blah: expected { foo: 1 } to not have key 'foo'"
    );

    err(
      () => assert.doesNotHaveAllKeys({ foo: 1, bar: 2 }, ["foo", "bar"]),
      "expected { foo: 1, bar: 2 } to not have keys 'foo', and 'bar'"
    );

    err(
      () => assert.hasAllKeys({ foo: 1, bar: 2 }, ["foo"]),
      "expected { foo: 1, bar: 2 } to have key 'foo'"
    );

    err(
      () => assert.containsAllKeys({ foo: 1 }, ["foo", "bar"], "blah"),
      "blah: expected { foo: 1 } to contain keys 'foo', and 'bar'"
    );

    err(
      () => assert.hasAnyKeys({ foo: 1 }, ["baz"], "blah"),
      "blah: expected { foo: 1 } to have key 'baz'"
    );

    err(
      () => assert.doesNotHaveAllKeys({ foo: 1, bar: 2 }, ["foo", "bar"]),
      "expected { foo: 1, bar: 2 } to not have keys 'foo', and 'bar'"
    );

    err(
      () =>
        assert.doesNotHaveAnyKeys({ foo: 1, bar: 2 }, ["foo", "baz"], "blah"),
      "blah: expected { foo: 1, bar: 2 } to not have keys 'foo', or 'baz'"
    );

    // repeat previous tests with Object as arg.
    err(
      () => assert.hasAllKeys({ foo: 1 }, { bar: 1 }, "blah"),
      "blah: expected { foo: 1 } to have key 'bar'"
    );

    err(
      () => assert.hasAllKeys({ foo: 1 }, { bar: 1, baz: 1 }),
      "expected { foo: 1 } to have keys 'bar', and 'baz'"
    );

    err(
      () => assert.hasAllKeys({ foo: 1 }, { foo: 1, bar: 1, baz: 1 }),
      "expected { foo: 1 } to have keys 'foo', 'bar', and 'baz'"
    );

    err(
      () => assert.doesNotHaveAllKeys({ foo: 1 }, { foo: 1 }, "blah"),
      "blah: expected { foo: 1 } to not have key 'foo'"
    );

    err(
      () => assert.doesNotHaveAllKeys({ foo: 1 }, { foo: 1 }),
      "expected { foo: 1 } to not have key 'foo'"
    );

    err(
      () => assert.doesNotHaveAllKeys({ foo: 1, bar: 2 }, { foo: 1, bar: 1 }),
      "expected { foo: 1, bar: 2 } to not have keys 'foo', and 'bar'"
    );

    err(
      () => assert.hasAnyKeys({ foo: 1 }, "baz", "blah"),
      "blah: expected { foo: 1 } to have key 'baz'"
    );

    err(
      () => assert.doesNotHaveAllKeys({ foo: 1, bar: 2 }, { foo: 1, bar: 1 }),
      "expected { foo: 1, bar: 2 } to not have keys 'foo', and 'bar'"
    );

    err(
      () =>
        assert.doesNotHaveAnyKeys(
          { foo: 1, bar: 2 },
          { foo: 1, baz: 1 },
          "blah"
        ),
      "blah: expected { foo: 1, bar: 2 } to not have keys 'foo', or 'baz'"
    );
  });

  it("lengthOf", () => {
    assert.lengthOf([1, 2, 3], 3);
    assert.lengthOf("foobar", 6);

    err(
      () => assert.lengthOf("foobar", 5, "blah"),
      "blah: expected 'foobar' to have a length of 5 but got 6"
    );

    err(() => assert.lengthOf(1, 5), "expected 1 to have property 'length'");

    if (typeof Map === "function") {
      assert.lengthOf(new Map(), 0);

      const map = new Map();
      map.set("a", 1);
      map.set("b", 2);

      assert.lengthOf(map, 2);

      err(
        () => assert.lengthOf(map, 3, "blah"),
        "blah: expected Map{ 'a' => 1, 'b' => 2 } to have a size of 3 but got 2"
      );
    }

    if (typeof Set === "function") {
      assert.lengthOf(new Set(), 0);

      const set = new Set();
      set.add(1);
      set.add(2);

      assert.lengthOf(set, 2);

      err(
        () => assert.lengthOf(set, 3, "blah"),
        "blah: expected Set{ 1, 2 } to have a size of 3 but got 2"
      );
    }
  });

  it("match", () => {
    assert.match("foobar", /^foo/);
    assert.notMatch("foobar", /^bar/);

    err(
      () => assert.match("foobar", /^bar/i, "blah"),
      "blah: expected 'foobar' to match /^bar/i"
    );

    err(
      () => assert.notMatch("foobar", /^foo/i, "blah"),
      "blah: expected 'foobar' not to match /^foo/i"
    );
  });

  it("property", () => {
    const obj = { foo: { bar: "baz" } };
    const simpleObj = { foo: "bar" };
    const undefinedKeyObj = { foo: undefined };
    const dummyObj = { a: "1" };
    assert.property(obj, "foo");
    assert.property(obj, "toString");
    assert.propertyVal(obj, "toString", Object.prototype.toString);
    assert.property(undefinedKeyObj, "foo");
    assert.propertyVal(undefinedKeyObj, "foo", undefined);
    assert.nestedProperty(obj, "foo.bar");
    assert.notProperty(obj, "baz");
    assert.notProperty(obj, "foo.bar");
    assert.notPropertyVal(simpleObj, "foo", "flow");
    assert.notPropertyVal(simpleObj, "flow", "bar");
    assert.notPropertyVal(obj, "foo", { bar: "baz" });
    assert.notNestedProperty(obj, "foo.baz");
    assert.nestedPropertyVal(obj, "foo.bar", "baz");
    assert.notNestedPropertyVal(obj, "foo.bar", "flow");
    assert.notNestedPropertyVal(obj, "foo.flow", "baz");

    err(
      () => assert.property(obj, "baz", "blah"),
      "blah: expected { foo: { bar: 'baz' } } to have property 'baz'"
    );

    err(
      () => assert.nestedProperty(obj, "foo.baz", "blah"),
      "blah: expected { foo: { bar: 'baz' } } to have nested property 'foo.baz'"
    );

    err(
      () => assert.notProperty(obj, "foo", "blah"),
      "blah: expected { foo: { bar: 'baz' } } to not have property 'foo'"
    );

    err(
      () => assert.notNestedProperty(obj, "foo.bar", "blah"),
      "blah: expected { foo: { bar: 'baz' } } to not have nested property 'foo.bar'"
    );

    err(
      () => assert.propertyVal(simpleObj, "foo", "ball", "blah"),
      "blah: expected { foo: 'bar' } to have property 'foo' of 'ball', but got 'bar'"
    );

    err(
      () => assert.propertyVal(simpleObj, "foo", undefined),
      "expected { foo: 'bar' } to have property 'foo' of undefined, but got 'bar'"
    );

    err(
      () => assert.nestedPropertyVal(obj, "foo.bar", "ball", "blah"),
      "blah: expected { foo: { bar: 'baz' } } to have nested property 'foo.bar' of 'ball', but got 'baz'"
    );

    err(
      () => assert.notPropertyVal(simpleObj, "foo", "bar", "blah"),
      "blah: expected { foo: 'bar' } to not have property 'foo' of 'bar'"
    );

    err(
      () => assert.notNestedPropertyVal(obj, "foo.bar", "baz", "blah"),
      "blah: expected { foo: { bar: 'baz' } } to not have nested property 'foo.bar' of 'baz'"
    );

    err(
      () => assert.property(null, "a", "blah"),
      "blah: Target cannot be null or undefined."
    );

    err(
      () => assert.property(undefined, "a", "blah"),
      "blah: Target cannot be null or undefined."
    );

    err(
      () => assert.property({ a: 1 }, { a: "1" }, "blah"),
      "blah: the argument to property must be a string, number, or symbol"
    );

    err(
      () => assert.propertyVal(dummyObj, "a", "2", "blah"),
      "blah: expected { a: '1' } to have property 'a' of '2', but got '1'"
    );

    err(
      () => assert.nestedProperty({ a: 1 }, { a: "1" }, "blah"),
      "blah: the argument to property must be a string when using nested syntax"
    );
  });

  it("deepPropertyVal", () => {
    const obj = { a: { b: 1 } };
    assert.deepPropertyVal(obj, "a", { b: 1 });
    assert.notDeepPropertyVal(obj, "a", { b: 7 });
    assert.notDeepPropertyVal(obj, "a", { z: 1 });
    assert.notDeepPropertyVal(obj, "z", { b: 1 });

    err(
      () => assert.deepPropertyVal(obj, "a", { b: 7 }, "blah"),
      "blah: expected { a: { b: 1 } } to have deep property 'a' of { b: 7 }, but got { b: 1 }"
    );

    err(
      () => assert.deepPropertyVal(obj, "z", { b: 1 }, "blah"),
      "blah: expected { a: { b: 1 } } to have deep property 'z'"
    );

    err(
      () => assert.notDeepPropertyVal(obj, "a", { b: 1 }, "blah"),
      "blah: expected { a: { b: 1 } } to not have deep property 'a' of { b: 1 }"
    );
  });

  it("ownProperty", () => {
    const coffeeObj = { coffee: "is good" };

    // This has length = 17
    const teaObj = "but tea is better";

    assert.ownProperty(coffeeObj, "coffee");
    assert.ownProperty(teaObj, "length");

    assert.ownPropertyVal(coffeeObj, "coffee", "is good");
    assert.ownPropertyVal(teaObj, "length", 17);

    assert.notOwnProperty(coffeeObj, "length");
    assert.notOwnProperty(coffeeObj, "toString");
    assert.notOwnProperty(teaObj, "calories");

    assert.notOwnPropertyVal(coffeeObj, "coffee", "is bad");
    assert.notOwnPropertyVal(teaObj, "length", 1);
    assert.notOwnPropertyVal(coffeeObj, "toString", Object.prototype.toString);
    assert.notOwnPropertyVal({ a: { b: 1 } }, "a", { b: 1 });

    err(
      () => assert.ownProperty(coffeeObj, "calories", "blah"),
      "blah: expected { coffee: 'is good' } to have own property 'calories'"
    );

    err(
      () => assert.notOwnProperty(coffeeObj, "coffee", "blah"),
      "blah: expected { coffee: 'is good' } to not have own property 'coffee'"
    );

    err(
      () => assert.ownPropertyVal(teaObj, "length", 1, "blah"),
      "blah: expected 'but tea is better' to have own property 'length' of 1, but got 17"
    );

    err(
      () => assert.notOwnPropertyVal(teaObj, "length", 17, "blah"),
      "blah: expected 'but tea is better' to not have own property 'length' of 17"
    );

    err(
      () => assert.ownPropertyVal(teaObj, "calories", 17),
      "expected 'but tea is better' to have own property 'calories'"
    );

    err(
      () => assert.ownPropertyVal(teaObj, "calories", 17),
      "expected 'but tea is better' to have own property 'calories'"
    );
  });

  it("deepOwnPropertyVal", () => {
    const obj = { a: { b: 1 } };
    assert.deepOwnPropertyVal(obj, "a", { b: 1 });
    assert.notDeepOwnPropertyVal(obj, "a", { z: 1 });
    assert.notDeepOwnPropertyVal(obj, "a", { b: 7 });
    assert.notDeepOwnPropertyVal(obj, "toString", Object.prototype.toString);

    err(
      () => assert.deepOwnPropertyVal(obj, "a", { z: 7 }, "blah"),
      "blah: expected { a: { b: 1 } } to have deep own property 'a' of { z: 7 }, but got { b: 1 }"
    );

    err(
      () => assert.deepOwnPropertyVal(obj, "z", { b: 1 }, "blah"),
      "blah: expected { a: { b: 1 } } to have deep own property 'z'"
    );

    err(
      () => assert.notDeepOwnPropertyVal(obj, "a", { b: 1 }, "blah"),
      "blah: expected { a: { b: 1 } } to not have deep own property 'a' of { b: 1 }"
    );
  });

  it("deepNestedPropertyVal", () => {
    const obj = { a: { b: { c: 1 } } };
    assert.deepNestedPropertyVal(obj, "a.b", { c: 1 });
    assert.notDeepNestedPropertyVal(obj, "a.b", { c: 7 });
    assert.notDeepNestedPropertyVal(obj, "a.b", { z: 1 });
    assert.notDeepNestedPropertyVal(obj, "a.z", { c: 1 });

    err(
      () => assert.deepNestedPropertyVal(obj, "a.b", { c: 7 }, "blah"),
      "blah: expected { a: { b: { c: 1 } } } to have deep nested property 'a.b' of { c: 7 }, but got { c: 1 }"
    );

    err(
      () => assert.deepNestedPropertyVal(obj, "a.z", { c: 1 }, "blah"),
      "blah: expected { a: { b: { c: 1 } } } to have deep nested property 'a.z'"
    );

    err(
      () => assert.notDeepNestedPropertyVal(obj, "a.b", { c: 1 }, "blah"),
      "blah: expected { a: { b: { c: 1 } } } to not have deep nested property 'a.b' of { c: 1 }"
    );
  });

  it("throws / throw / Throw", () => {
    ["throws", "throw", "Throw"].forEach(function(throws) {
      assert[throws](() => {
        throw new Error("foo");
      });
      assert[throws](() => {
        throw new Error("");
      }, "");
      assert[throws](() => {
        throw new Error("bar");
      }, "bar");
      assert[throws](() => {
        throw new Error("bar");
      }, /bar/);
      assert[throws](() => {
        throw new Error("bar");
      }, Error);
      assert[throws](
        () => {
          throw new Error("bar");
        },
        Error,
        "bar"
      );
      assert[throws](
        () => {
          throw new Error("");
        },
        Error,
        ""
      );
      assert[throws](() => {
        throw new Error("foo");
      }, "");
      const thrownErr = assert[throws](() => {
        throw new Error("foo");
      });
      assert(thrownErr instanceof Error, "assert." + throws + " returns error");
      assert(
        thrownErr.message === "foo",
        "assert." + throws + " returns error message"
      );

      err(() => {
        assert[throws](() => {
          throw new Error("foo");
        }, TypeError);
      }, "expected [Function] to throw 'TypeError' but 'Error: foo' was thrown");

      err(() => {
        assert[throws](() => {
          throw new Error("foo");
        }, "bar");
      }, "expected [Function] to throw error including 'bar' but got 'foo'");

      err(() => {
        assert[throws](
          () => {
            throw new Error("foo");
          },
          Error,
          "bar",
          "blah"
        );
      }, "blah: expected [Function] to throw error including 'bar' but got 'foo'");

      err(() => {
        assert[throws](
          () => {
            throw new Error("foo");
          },
          TypeError,
          "bar",
          "blah"
        );
      }, "blah: expected [Function] to throw 'TypeError' but 'Error: foo' was thrown");

      err(
        () => assert[throws](() => {}),
        "expected [Function] to throw an error"
      );

      err(() => {
        assert[throws](() => {
          throw new Error("");
        }, "bar");
      }, "expected [Function] to throw error including 'bar' but got ''");

      err(() => {
        assert[throws](() => {
          throw new Error("");
        }, /bar/);
      }, "expected [Function] to throw error matching /bar/ but got ''");

      err(() => assert[throws]({}), "expected {} to be a function");

      err(
        () => assert[throws]({}, Error, "testing", "blah"),
        "blah: expected {} to be a function"
      );
    });
  });

  it("doesNotThrow", () => {
    function CustomError(message) {
      this.name = "CustomError";
      this.message = message;
    }
    CustomError.prototype = Object.create(Error.prototype);

    assert.doesNotThrow(() => {});
    assert.doesNotThrow(() => {}, "foo");
    assert.doesNotThrow(() => {}, "");

    assert.doesNotThrow(() => {
      throw new Error("This is a message");
    }, TypeError);

    assert.doesNotThrow(() => {
      throw new Error("This is a message");
    }, "Another message");

    assert.doesNotThrow(() => {
      throw new Error("This is a message");
    }, /Another message/);

    assert.doesNotThrow(
      () => {
        throw new Error("This is a message");
      },
      Error,
      "Another message"
    );

    assert.doesNotThrow(
      () => {
        throw new Error("This is a message");
      },
      Error,
      /Another message/
    );

    assert.doesNotThrow(
      () => {
        throw new Error("This is a message");
      },
      TypeError,
      "Another message"
    );

    assert.doesNotThrow(
      () => {
        throw new Error("This is a message");
      },
      TypeError,
      /Another message/
    );

    err(() => {
      assert.doesNotThrow(() => {
        throw new Error("foo");
      });
    }, "expected [Function] to not throw an error but 'Error: foo' was thrown");

    err(() => {
      assert.doesNotThrow(() => {
        throw new CustomError("foo");
      });
    }, "expected [Function] to not throw an error but 'CustomError: foo' was thrown");

    err(() => {
      assert.doesNotThrow(() => {
        throw new Error("foo");
      }, Error);
    }, "expected [Function] to not throw 'Error' but 'Error: foo' was thrown");

    err(() => {
      assert.doesNotThrow(() => {
        throw new CustomError("foo");
      }, CustomError);
    }, "expected [Function] to not throw 'CustomError' but 'CustomError: foo' was thrown");

    err(() => {
      assert.doesNotThrow(() => {
        throw new Error("foo");
      }, "foo");
    }, "expected [Function] to throw error not including 'foo'");

    err(() => {
      assert.doesNotThrow(() => {
        throw new Error("foo");
      }, /foo/);
    }, "expected [Function] to throw error not matching /foo/");

    err(() => {
      assert.doesNotThrow(
        () => {
          throw new Error("foo");
        },
        Error,
        "foo",
        "blah"
      );
    }, "blah: expected [Function] to not throw 'Error' but 'Error: foo' was thrown");

    err(() => {
      assert.doesNotThrow(
        () => {
          throw new CustomError("foo");
        },
        CustomError,
        "foo",
        "blah"
      );
    }, "blah: expected [Function] to not throw 'CustomError' but 'CustomError: foo' was thrown");

    err(() => {
      assert.doesNotThrow(() => {
        throw new Error("");
      }, "");
    }, "expected [Function] to throw error not including ''");

    err(() => {
      assert.doesNotThrow(
        () => {
          throw new Error("");
        },
        Error,
        ""
      );
    }, "expected [Function] to not throw 'Error' but 'Error' was thrown");

    err(() => assert.doesNotThrow({}), "expected {} to be a function");

    err(
      () => assert.doesNotThrow({}, Error, "testing", "blah"),
      "blah: expected {} to be a function"
    );
  });

  it("ifError", () => {
    assert.ifError(false);
    assert.ifError(null);
    assert.ifError(undefined);

    err(() => {
      const err = new Error("This is an error message");
      assert.ifError(err);
    }, "This is an error message");
  });

  it("operator", () => {
    // For testing undefined and null with == and ===
    var w;

    assert.operator(1, "<", 2);
    assert.operator(2, ">", 1);
    assert.operator(1, "==", 1);
    assert.operator(1, "<=", 1);
    assert.operator(1, ">=", 1);
    assert.operator(1, "!=", 2);
    assert.operator(1, "!==", 2);
    assert.operator(1, "!==", "1");
    assert.operator(w, "==", undefined);
    assert.operator(w, "===", undefined);
    assert.operator(w, "==", null);

    err(() => assert.operator(1, "=", 2, "blah"), 'blah: Invalid operator "="');

    err(() => assert.operator(2, "<", 1, "blah"), "blah: expected 2 to be < 1");

    err(() => assert.operator(1, ">", 2), "expected 1 to be > 2");

    err(() => assert.operator(1, "==", 2), "expected 1 to be == 2");

    err(() => assert.operator(1, "===", "1"), "expected 1 to be === '1'");

    err(() => assert.operator(2, "<=", 1), "expected 2 to be <= 1");

    err(() => assert.operator(1, ">=", 2), "expected 1 to be >= 2");

    err(() => assert.operator(1, "!=", 1), "expected 1 to be != 1");

    err(() => assert.operator(1, "!==", 1), "expected 1 to be !== 1");

    err(
      () => assert.operator(w, "===", null),
      "expected undefined to be === null"
    );
  });

  it("closeTo", () => {
    assert.closeTo(1.5, 1.0, 0.5);
    assert.closeTo(10, 20, 20);
    assert.closeTo(-10, 20, 30);

    err(
      () => assert.closeTo(2, 1.0, 0.5, "blah"),
      "blah: expected 2 to be close to 1 +/- 0.5"
    );

    err(
      () => assert.closeTo(-10, 20, 29),
      "expected -10 to be close to 20 +/- 29"
    );

    err(
      () => assert.closeTo([1.5], 1.0, 0.5, "blah"),
      "blah: expected [ 1.5 ] to be a number"
    );

    err(
      () => assert.closeTo(1.5, "1.0", 0.5, "blah"),
      "blah: the arguments to closeTo or approximately must be numbers"
    );

    err(
      () => assert.closeTo(1.5, 1.0, true, "blah"),
      "blah: the arguments to closeTo or approximately must be numbers"
    );

    err(
      () => assert.closeTo(1.5, 1.0, undefined, "blah"),
      "blah: the arguments to closeTo or approximately must be numbers, and a delta is required"
    );
  });

  it("approximately", () => {
    assert.approximately(1.5, 1.0, 0.5);
    assert.approximately(10, 20, 20);
    assert.approximately(-10, 20, 30);

    err(
      () => assert.approximately(2, 1.0, 0.5, "blah"),
      "blah: expected 2 to be close to 1 +/- 0.5"
    );

    err(
      () => assert.approximately(-10, 20, 29),
      "expected -10 to be close to 20 +/- 29"
    );

    err(
      () => assert.approximately([1.5], 1.0, 0.5),
      "expected [ 1.5 ] to be a number"
    );

    err(
      () => assert.approximately(1.5, "1.0", 0.5, "blah"),
      "blah: the arguments to closeTo or approximately must be numbers"
    );

    err(
      () => assert.approximately(1.5, 1.0, true, "blah"),
      "blah: the arguments to closeTo or approximately must be numbers"
    );

    err(
      () => assert.approximately(1.5, 1.0, undefined, "blah"),
      "blah: the arguments to closeTo or approximately must be numbers, and a delta is required"
    );
  });

  it("sameMembers", () => {
    assert.sameMembers([], []);
    assert.sameMembers([1, 2, 3], [3, 2, 1]);
    assert.sameMembers([4, 2], [4, 2]);
    assert.sameMembers([4, 2, 2], [4, 2, 2]);

    err(
      () => assert.sameMembers([], [1, 2], "blah"),
      "blah: expected [] to have the same members as [ 1, 2 ]"
    );

    err(
      () => assert.sameMembers([1, 54], [6, 1, 54]),
      "expected [ 1, 54 ] to have the same members as [ 6, 1, 54 ]"
    );

    err(
      () => assert.sameMembers({}, [], "blah"),
      "blah: expected {} to be an array"
    );

    err(
      () => assert.sameMembers([], {}, "blah"),
      "blah: expected {} to be an array"
    );
  });

  it("notSameMembers", () => {
    assert.notSameMembers([1, 2, 3], [2, 1, 5]);
    assert.notSameMembers([1, 2, 3], [1, 2, 3, 3]);
    assert.notSameMembers([1, 2], [1, 2, 2]);
    assert.notSameMembers([1, 2, 2], [1, 2]);
    assert.notSameMembers([1, 2, 2], [1, 2, 3]);
    assert.notSameMembers([1, 2, 3], [1, 2, 2]);
    assert.notSameMembers([{ a: 1 }], [{ a: 1 }]);

    err(
      () => assert.notSameMembers([1, 2, 3], [2, 1, 3], "blah"),
      "blah: expected [ 1, 2, 3 ] to not have the same members as [ 2, 1, 3 ]"
    );
  });

  it("sameDeepMembers", () => {
    assert.sameDeepMembers(
      [{ b: 3 }, { a: 2 }, { c: 5 }],
      [{ c: 5 }, { b: 3 }, { a: 2 }],
      "same deep members"
    );
    assert.sameDeepMembers(
      [{ b: 3 }, { a: 2 }, 5, "hello"],
      ["hello", 5, { b: 3 }, { a: 2 }],
      "same deep members"
    );
    assert.sameDeepMembers(
      [{ a: 1 }, { b: 2 }, { b: 2 }],
      [{ a: 1 }, { b: 2 }, { b: 2 }]
    );

    err(
      () => assert.sameDeepMembers([{ b: 3 }], [{ c: 3 }], "blah"),
      "blah: expected [ { b: 3 } ] to have the same members as [ { c: 3 } ]"
    );

    err(
      () => assert.sameDeepMembers([{ b: 3 }], [{ b: 5 }]),
      "expected [ { b: 3 } ] to have the same members as [ { b: 5 } ]"
    );
  });

  it("notSameDeepMembers", () => {
    assert.notSameDeepMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ b: 2 }, { a: 1 }, { f: 5 }]
    );
    assert.notSameDeepMembers(
      [{ a: 1 }, { b: 2 }],
      [{ a: 1 }, { b: 2 }, { b: 2 }]
    );
    assert.notSameDeepMembers(
      [{ a: 1 }, { b: 2 }, { b: 2 }],
      [{ a: 1 }, { b: 2 }]
    );
    assert.notSameDeepMembers(
      [{ a: 1 }, { b: 2 }, { b: 2 }],
      [{ a: 1 }, { b: 2 }, { c: 3 }]
    );
    assert.notSameDeepMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ a: 1 }, { b: 2 }, { b: 2 }]
    );

    err(() => {
      assert.notSameDeepMembers(
        [{ a: 1 }, { b: 2 }, { c: 3 }],
        [{ b: 2 }, { a: 1 }, { c: 3 }],
        "blah"
      );
    }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to not have the same members as [ { b: 2 }, { a: 1 }, { c: 3 } ]");
  });

  it("sameOrderedMembers", () => {
    assert.sameOrderedMembers([1, 2, 3], [1, 2, 3]);
    assert.sameOrderedMembers([1, 2, 2], [1, 2, 2]);

    err(
      () => assert.sameOrderedMembers([1, 2, 3], [2, 1, 3], "blah"),
      "blah: expected [ 1, 2, 3 ] to have the same ordered members as [ 2, 1, 3 ]"
    );
  });

  it("notSameOrderedMembers", () => {
    assert.notSameOrderedMembers([1, 2, 3], [2, 1, 3]);
    assert.notSameOrderedMembers([1, 2, 3], [1, 2]);
    assert.notSameOrderedMembers([1, 2], [1, 2, 2]);
    assert.notSameOrderedMembers([1, 2, 2], [1, 2]);
    assert.notSameOrderedMembers([1, 2, 2], [1, 2, 3]);
    assert.notSameOrderedMembers([1, 2, 3], [1, 2, 2]);

    err(
      () => assert.notSameOrderedMembers([1, 2, 3], [1, 2, 3], "blah"),
      "blah: expected [ 1, 2, 3 ] to not have the same ordered members as [ 1, 2, 3 ]"
    );
  });

  it("sameDeepOrderedMembers", () => {
    assert.sameDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ a: 1 }, { b: 2 }, { c: 3 }]
    );
    assert.sameDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }, { b: 2 }],
      [{ a: 1 }, { b: 2 }, { b: 2 }]
    );

    err(() => {
      assert.sameDeepOrderedMembers(
        [{ a: 1 }, { b: 2 }, { c: 3 }],
        [{ b: 2 }, { a: 1 }, { c: 3 }],
        "blah"
      );
    }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to have the same ordered members as [ { b: 2 }, { a: 1 }, { c: 3 } ]");
  });

  it("notSameDeepOrderedMembers", () => {
    assert.notSameDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ b: 2 }, { a: 1 }, { c: 3 }]
    );
    assert.notSameDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ a: 1 }, { b: 2 }, { f: 5 }]
    );
    assert.notSameDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }],
      [{ a: 1 }, { b: 2 }, { b: 2 }]
    );
    assert.notSameDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }, { b: 2 }],
      [{ a: 1 }, { b: 2 }]
    );
    assert.notSameDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }, { b: 2 }],
      [{ a: 1 }, { b: 2 }, { c: 3 }]
    );
    assert.notSameDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ a: 1 }, { b: 2 }, { b: 2 }]
    );

    err(() => {
      assert.notSameDeepOrderedMembers(
        [{ a: 1 }, { b: 2 }, { c: 3 }],
        [{ a: 1 }, { b: 2 }, { c: 3 }],
        "blah"
      );
    }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to not have the same ordered members as [ { a: 1 }, { b: 2 }, { c: 3 } ]");
  });

  it("includeMembers", () => {
    assert.includeMembers([1, 2, 3], [2, 3, 2]);
    assert.includeMembers([1, 2, 3], []);
    assert.includeMembers([1, 2, 3], [3]);

    err(
      () => assert.includeMembers([5, 6], [7, 8], "blah"),
      "blah: expected [ 5, 6 ] to be a superset of [ 7, 8 ]"
    );

    err(
      () => assert.includeMembers([5, 6], [5, 6, 0]),
      "expected [ 5, 6 ] to be a superset of [ 5, 6, +0 ]"
    );
  });

  it("notIncludeMembers", () => {
    assert.notIncludeMembers([1, 2, 3], [5, 1]);
    assert.notIncludeMembers([{ a: 1 }], [{ a: 1 }]);

    err(
      () => assert.notIncludeMembers([1, 2, 3], [2, 1], "blah"),
      "blah: expected [ 1, 2, 3 ] to not be a superset of [ 2, 1 ]"
    );
  });

  it("includeDeepMembers", () => {
    assert.includeDeepMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ c: 3 }, { b: 2 }]
    );
    assert.includeDeepMembers([{ a: 1 }, { b: 2 }, { c: 3 }], []);
    assert.includeDeepMembers([{ a: 1 }, { b: 2 }, { c: 3 }], [{ c: 3 }]);
    assert.includeDeepMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }, { c: 3 }],
      [{ c: 3 }, { c: 3 }]
    );
    assert.includeDeepMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ c: 3 }, { c: 3 }]
    );

    err(() => {
      assert.includeDeepMembers(
        [{ e: 5 }, { f: 6 }],
        [{ g: 7 }, { h: 8 }],
        "blah"
      );
    }, "blah: expected [ { e: 5 }, { f: 6 } ] to be a superset of [ { g: 7 }, { h: 8 } ]");

    err(() => {
      assert.includeDeepMembers(
        [{ e: 5 }, { f: 6 }],
        [{ e: 5 }, { f: 6 }, { z: 0 }]
      );
    }, "expected [ { e: 5 }, { f: 6 } ] to be a superset of [ { e: 5 }, { f: 6 }, { z: +0 } ]");
  });

  it("notIncludeDeepMembers", () => {
    assert.notIncludeDeepMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ b: 2 }, { f: 5 }]
    );

    err(() => {
      assert.notIncludeDeepMembers(
        [{ a: 1 }, { b: 2 }, { c: 3 }],
        [{ b: 2 }, { a: 1 }],
        "blah"
      );
    }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to not be a superset of [ { b: 2 }, { a: 1 } ]");
  });

  it("includeOrderedMembers", () => {
    assert.includeOrderedMembers([1, 2, 3], [1, 2]);

    err(
      () => assert.includeOrderedMembers([1, 2, 3], [2, 1], "blah"),
      "blah: expected [ 1, 2, 3 ] to be an ordered superset of [ 2, 1 ]"
    );
  });

  it("notIncludeOrderedMembers", () => {
    assert.notIncludeOrderedMembers([1, 2, 3], [2, 1]);
    assert.notIncludeOrderedMembers([1, 2, 3], [2, 3]);
    assert.notIncludeOrderedMembers([1, 2, 3], [1, 2, 2]);

    err(
      () => assert.notIncludeOrderedMembers([1, 2, 3], [1, 2], "blah"),
      "blah: expected [ 1, 2, 3 ] to not be an ordered superset of [ 1, 2 ]"
    );
  });

  it("includeDeepOrderedMembers", () => {
    assert.includeDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ a: 1 }, { b: 2 }]
    );

    err(() => {
      assert.includeDeepOrderedMembers(
        [{ a: 1 }, { b: 2 }, { c: 3 }],
        [{ b: 2 }, { a: 1 }],
        "blah"
      );
    }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to be an ordered superset of [ { b: 2 }, { a: 1 } ]");
  });

  it("notIncludeDeepOrderedMembers", () => {
    assert.notIncludeDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ b: 2 }, { a: 1 }]
    );
    assert.notIncludeDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ a: 1 }, { f: 5 }]
    );
    assert.notIncludeDeepOrderedMembers(
      [{ a: 1 }, { b: 2 }, { c: 3 }],
      [{ a: 1 }, { b: 2 }, { b: 2 }]
    );

    err(() => {
      assert.notIncludeDeepOrderedMembers(
        [{ a: 1 }, { b: 2 }, { c: 3 }],
        [{ a: 1 }, { b: 2 }],
        "blah"
      );
    }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to not be an ordered superset of [ { a: 1 }, { b: 2 } ]");
  });

  it("oneOf", () => {
    assert.oneOf(1, [1, 2, 3]);

    const three = [3];
    assert.oneOf(three, [1, 2, three]);

    const four = { four: 4 };
    assert.oneOf(four, [1, 2, four]);

    err(() => assert.oneOf(1, 1, "blah"), "blah: expected 1 to be an array");

    err(() => assert.oneOf(1, { a: 1 }), "expected { a: 1 } to be an array");

    err(
      () => assert.oneOf(9, [1, 2, 3], "Message"),
      "Message: expected 9 to be one of [ 1, 2, 3 ]"
    );

    err(
      () => assert.oneOf([3], [1, 2, [3]]),
      "expected [ 3 ] to be one of [ 1, 2, [ 3 ] ]"
    );

    err(
      () => assert.oneOf({ four: 4 }, [1, 2, { four: 4 }]),
      "expected { four: 4 } to be one of [ 1, 2, { four: 4 } ]"
    );
  });

  it("above", () => {
    assert.isAbove(5, 2, "5 should be above 2");

    err(() => assert.isAbove(1, 3, "blah"), "blah: expected 1 to be above 3");

    err(() => assert.isAbove(1, 1), "expected 1 to be above 1");

    err(
      () => assert.isAbove(null, 1, "blah"),
      "blah: expected null to be a number or a date"
    );

    err(
      () => assert.isAbove(1, null, "blah"),
      "blah: the argument to above must be a number"
    );
  });

  it("above (dates)", () => {
    const now = new Date();
    const oneSecondAgo = new Date(now.getTime() - 1000);
    assert.isAbove(now, oneSecondAgo, "Now should be above 1 second ago");

    err(() => {
      assert.isAbove(oneSecondAgo, now, "blah");
    }, "blah: expected " + oneSecondAgo.toISOString() + " to be above " + now.toISOString());

    err(() => {
      assert.isAbove(now, now, "blah");
    }, "blah: expected " + now.toISOString() + " to be above " + now.toISOString());

    err(
      () => assert.isAbove(null, now),
      "expected null to be a number or a date"
    );

    err(
      () => assert.isAbove(now, null, "blah"),
      "blah: the argument to above must be a date"
    );

    err(
      () => assert.isAbove(now, 1, "blah"),
      "blah: the argument to above must be a date"
    );

    err(
      () => assert.isAbove(1, now, "blah"),
      "blah: the argument to above must be a number"
    );
  });

  it("atLeast", () => {
    assert.isAtLeast(5, 2, "5 should be above 2");
    assert.isAtLeast(1, 1, "1 should be equal to 1");

    err(
      () => assert.isAtLeast(1, 3, "blah"),
      "blah: expected 1 to be at least 3"
    );

    err(
      () => assert.isAtLeast(null, 1, "blah"),
      "blah: expected null to be a number or a date"
    );

    err(
      () => assert.isAtLeast(1, null, "blah"),
      "blah: the argument to least must be a number"
    );
  });

  it("atLeast (dates)", () => {
    const now = new Date();
    const oneSecondAgo = new Date(now.getTime() - 1000);
    const oneSecondAfter = new Date(now.getTime() + 1000);

    assert.isAtLeast(now, oneSecondAgo, "Now should be above one second ago");
    assert.isAtLeast(now, now, "Now should be equal to now");

    err(() => {
      assert.isAtLeast(now, oneSecondAfter, "blah");
    }, "blah: expected " + now.toISOString() + " to be at least " + oneSecondAfter.toISOString());

    err(
      () => assert.isAtLeast(null, now, "blah"),
      "blah: expected null to be a number or a date"
    );

    err(
      () => assert.isAtLeast(now, null, "blah"),
      "blah: the argument to least must be a date"
    );

    err(
      () => assert.isAtLeast(1, now, "blah"),
      "blah: the argument to least must be a number"
    );

    err(
      () => assert.isAtLeast(now, 1, "blah"),
      "blah: the argument to least must be a date"
    );
  });

  it("below", () => {
    assert.isBelow(2, 5, "2 should be below 5");

    err(() => assert.isBelow(3, 1, "blah"), "blah: expected 3 to be below 1");

    err(() => assert.isBelow(1, 1), "expected 1 to be below 1");

    err(
      () => assert.isBelow(null, 1, "blah"),
      "blah: expected null to be a number or a date"
    );

    err(
      () => assert.isBelow(1, null, "blah"),
      "blah: the argument to below must be a number"
    );
  });

  it("below (dates)", () => {
    const now = new Date();
    const oneSecondAgo = new Date(now.getTime() - 1000);
    assert.isBelow(oneSecondAgo, now, "One second ago should be below now");

    err(() => {
      assert.isBelow(now, oneSecondAgo, "blah");
    }, "blah: expected " + now.toISOString() + " to be below " + oneSecondAgo.toISOString());

    err(() => {
      assert.isBelow(now, now);
    }, "expected " + now.toISOString() + " to be below " + now.toISOString());

    err(
      () => assert.isBelow(null, now, "blah"),
      "blah: expected null to be a number or a date"
    );

    err(
      () => assert.isBelow(now, null, "blah"),
      "blah: the argument to below must be a date"
    );

    err(
      () => assert.isBelow(now, 1, "blah"),
      "blah: the argument to below must be a date"
    );

    err(
      () => assert.isBelow(1, now, "blah"),
      "blah: the argument to below must be a number"
    );
  });

  it("atMost", () => {
    assert.isAtMost(2, 5, "2 should be below 5");
    assert.isAtMost(1, 1, "1 should be equal to 1");

    err(
      () => assert.isAtMost(3, 1, "blah"),
      "blah: expected 3 to be at most 1"
    );

    err(
      () => assert.isAtMost(null, 1, "blah"),
      "blah: expected null to be a number or a date"
    );

    err(
      () => assert.isAtMost(1, null, "blah"),
      "blah: the argument to most must be a number"
    );
  });

  it("atMost (dates)", () => {
    const now = new Date();
    const oneSecondAgo = new Date(now.getTime() - 1000);
    const oneSecondAfter = new Date(now.getTime() + 1000);

    assert.isAtMost(oneSecondAgo, now, "Now should be below one second ago");
    assert.isAtMost(now, now, "Now should be equal to now");

    err(() => {
      assert.isAtMost(oneSecondAfter, now, "blah");
    }, "blah: expected " + oneSecondAfter.toISOString() + " to be at most " + now.toISOString());

    err(
      () => assert.isAtMost(null, now, "blah"),
      "blah: expected null to be a number or a date"
    );

    err(
      () => assert.isAtMost(now, null, "blah"),
      "blah: the argument to most must be a date"
    );

    err(
      () => assert.isAtMost(now, 1, "blah"),
      "blah: the argument to most must be a date"
    );

    err(
      () => assert.isAtMost(1, now, "blah"),
      "blah: the argument to most must be a number"
    );
  });

  it("change", () => {
    const obj = { value: 10, str: "foo" },
      heroes = ["spiderman", "superman"],
      fn = () => {
        obj.value += 5;
      },
      fnDec = () => {
        obj.value -= 20;
      },
      getterFn = () => {
        return obj.value;
      },
      bangFn = () => {
        obj.str += "!";
      },
      smFn = () => {
        "foo" + "bar";
      },
      batFn = () => {
        heroes.push("batman");
      },
      lenFn = () => {
        return heroes.length;
      };

    assert.changes(fn, obj, "value");
    assert.changes(fn, getterFn, "changes via getter function");
    assert.changesBy(fn, obj, "value", 5);
    assert.changesBy(fn, obj, "value", -5);
    assert.changesBy(fn, getterFn, 5);
    assert.changesBy(fnDec, obj, "value", 20);

    assert.doesNotChange(smFn, obj, "value");
    assert.doesNotChange(smFn, getterFn, "value");
    assert.changesButNotBy(fnDec, obj, "value", 1);
    assert.changesButNotBy(fnDec, getterFn, 1);

    assert.changes(bangFn, obj, "str");

    assert.changesBy(batFn, lenFn, 1);
    assert.changesButNotBy(batFn, lenFn, 2);

    err(
      () => assert.changes(smFn, obj, "value", "blah"),
      "blah: expected .value to change"
    );

    err(
      () => assert.doesNotChange(fn, obj, "value", "blah"),
      "blah: expected .value to not change"
    );

    err(
      () => assert.changes({}, obj, "value", "blah"),
      "blah: expected {} to be a function"
    );

    err(
      () => assert.changes(fn, {}, "badprop", "blah"),
      "blah: expected {} to have property 'badprop'"
    );

    err(
      () => assert.changesBy(fn, obj, "value", 10, "blah"),
      "blah: expected .value to change by 10"
    );

    err(
      () => assert.changesButNotBy(fn, obj, "value", 5, "blah"),
      "blah: expected .value to not change by 5"
    );
  });

  it("increase, decrease", () => {
    const obj = { value: 10, noop: null },
      arr = ["one", "two"],
      pFn = () => {
        arr.push("three");
      },
      popFn = () => {
        arr.pop();
      },
      lenFn = () => {
        return arr.length;
      },
      incFn = () => {
        obj.value += 2;
      },
      decFn = () => {
        obj.value -= 3;
      },
      getterFn = () => {
        return obj.value;
      },
      smFn = () => {
        obj.value += 0;
      };

    assert.decreases(decFn, obj, "value");
    assert.decreases(decFn, getterFn, "decreases via getter function");
    assert.doesNotDecrease(smFn, obj, "value");
    assert.doesNotDecrease(smFn, getterFn, "value");
    assert.decreasesBy(decFn, obj, "value", 3);
    assert.decreasesBy(decFn, getterFn, 3);
    assert.decreasesButNotBy(decFn, obj, "value", 10);
    assert.decreasesButNotBy(decFn, getterFn, 10);

    assert.increases(incFn, obj, "value");
    assert.increases(incFn, getterFn, "increases via getter function");
    assert.doesNotIncrease(smFn, obj, "value");
    assert.doesNotIncrease(smFn, getterFn, "value");
    assert.increasesBy(incFn, obj, "value", 2);
    assert.increasesBy(incFn, getterFn, 2);
    assert.increasesButNotBy(incFn, obj, "value", 1);
    assert.increasesButNotBy(incFn, getterFn, 1);

    assert.decreases(popFn, lenFn);
    assert.doesNotDecrease(pFn, lenFn);
    assert.decreasesBy(popFn, lenFn, 1);
    assert.decreasesButNotBy(popFn, lenFn, 2);

    assert.increases(pFn, lenFn);
    assert.doesNotIncrease(popFn, lenFn);
    assert.increasesBy(pFn, lenFn, 1);
    assert.increasesButNotBy(pFn, lenFn, 2);

    err(
      () => assert.increases(smFn, obj, "value", "blah"),
      "blah: expected .value to increase"
    );

    err(
      () => assert.doesNotIncrease(incFn, obj, "value", "blah"),
      "blah: expected .value to not increase"
    );

    err(
      () => assert.increases({}, obj, "value", "blah"),
      "blah: expected {} to be a function"
    );

    err(
      () => assert.increases(incFn, {}, "badprop", "blah"),
      "blah: expected {} to have property 'badprop'"
    );

    err(
      () => assert.increases(incFn, obj, "noop", "blah"),
      "blah: expected null to be a number"
    );

    err(
      () => assert.increasesBy(incFn, obj, "value", 10, "blah"),
      "blah: expected .value to increase by 10"
    );

    err(
      () => assert.increasesButNotBy(incFn, obj, "value", 2, "blah"),
      "blah: expected .value to not increase by 2"
    );

    err(
      () => assert.decreases(smFn, obj, "value", "blah"),
      "blah: expected .value to decrease"
    );

    err(
      () => assert.doesNotDecrease(decFn, obj, "value", "blah"),
      "blah: expected .value to not decrease"
    );

    err(
      () => assert.decreases({}, obj, "value", "blah"),
      "blah: expected {} to be a function"
    );

    err(
      () => assert.decreases(decFn, {}, "badprop", "blah"),
      "blah: expected {} to have property 'badprop'"
    );

    err(
      () => assert.decreases(decFn, obj, "noop", "blah"),
      "blah: expected null to be a number"
    );

    err(
      () => assert.decreasesBy(decFn, obj, "value", 10, "blah"),
      "blah: expected .value to decrease by 10"
    );

    err(
      () => assert.decreasesButNotBy(decFn, obj, "value", 3, "blah"),
      "blah: expected .value to not decrease by 3"
    );
  });

  it("isExtensible / extensible", () => {
    ["isExtensible", "extensible"].forEach(function(isExtensible) {
      const nonExtensibleObject = Object.preventExtensions({});

      assert[isExtensible]({});

      err(
        () => assert[isExtensible](nonExtensibleObject, "blah"),
        "blah: expected {} to be extensible"
      );

      // Making sure ES6-like Object.isExtensible response is respected for all primitive types

      err(() => assert[isExtensible](42), "expected 42 to be extensible");

      err(() => assert[isExtensible](null), "expected null to be extensible");

      err(() => assert[isExtensible]("foo"), "expected 'foo' to be extensible");

      err(() => assert[isExtensible](false), "expected false to be extensible");

      err(
        () => assert[isExtensible](undefined),
        "expected undefined to be extensible"
      );

      if (typeof Proxy === "function") {
        const proxy = new Proxy(
          {},
          {
            isExtensible: () => {
              throw new TypeError();
            }
          }
        );

        err(
          () => {
            // isExtensible should not suppress errors, thrown in proxy traps
            assert[isExtensible](proxy);
          },
          { name: "TypeError" }
        );
      }
    });
  });

  it("isNotExtensible / notExtensible", () => {
    ["isNotExtensible", "notExtensible"].forEach(function(isNotExtensible) {
      const nonExtensibleObject = Object.preventExtensions({});

      assert[isNotExtensible](nonExtensibleObject);

      err(
        () => assert[isNotExtensible]({}, "blah"),
        "blah: expected {} to not be extensible"
      );

      // Making sure ES6-like Object.isExtensible response is respected for all primitive types

      assert[isNotExtensible](42);
      assert[isNotExtensible](null);
      assert[isNotExtensible]("foo");
      assert[isNotExtensible](false);
      assert[isNotExtensible](undefined);

      if (typeof Symbol === "function") {
        assert[isNotExtensible](Symbol());
      }

      if (typeof Proxy === "function") {
        const proxy = new Proxy(
          {},
          {
            isExtensible: () => {
              throw new TypeError();
            }
          }
        );

        err(
          () => {
            // isNotExtensible should not suppress errors, thrown in proxy traps
            assert[isNotExtensible](proxy);
          },
          { name: "TypeError" }
        );
      }
    });
  });

  it("isSealed / sealed", () => {
    ["isSealed", "sealed"].forEach(function(isSealed) {
      const sealedObject = Object.seal({});

      assert[isSealed](sealedObject);

      err(() => assert[isSealed]({}, "blah"), "blah: expected {} to be sealed");

      // Making sure ES6-like Object.isSealed response is respected for all primitive types

      assert[isSealed](42);
      assert[isSealed](null);
      assert[isSealed]("foo");
      assert[isSealed](false);
      assert[isSealed](undefined);

      if (typeof Symbol === "function") {
        assert[isSealed](Symbol());
      }

      if (typeof Proxy === "function") {
        const proxy = new Proxy(
          {},
          {
            ownKeys: () => {
              throw new TypeError();
            }
          }
        );

        // Object.isSealed will call ownKeys trap only if object is not extensible
        Object.preventExtensions(proxy);

        err(
          () => {
            // isSealed should not suppress errors, thrown in proxy traps
            assert[isSealed](proxy);
          },
          { name: "TypeError" }
        );
      }
    });
  });

  it("isNotSealed / notSealed", () => {
    ["isNotSealed", "notSealed"].forEach(function(isNotSealed) {
      const sealedObject = Object.seal({});

      assert[isNotSealed]({});

      err(
        () => assert[isNotSealed](sealedObject, "blah"),
        "blah: expected {} to not be sealed"
      );

      // Making sure ES6-like Object.isSealed response is respected for all primitive types

      err(() => assert[isNotSealed](42), "expected 42 to not be sealed");

      err(() => assert[isNotSealed](null), "expected null to not be sealed");

      err(() => assert[isNotSealed]("foo"), "expected 'foo' to not be sealed");

      err(() => assert[isNotSealed](false), "expected false to not be sealed");

      err(
        () => assert[isNotSealed](undefined),
        "expected undefined to not be sealed"
      );

      if (typeof Proxy === "function") {
        const proxy = new Proxy(
          {},
          {
            ownKeys: () => {
              throw new TypeError();
            }
          }
        );

        // Object.isSealed will call ownKeys trap only if object is not extensible
        Object.preventExtensions(proxy);

        err(
          () => {
            // isNotSealed should not suppress errors, thrown in proxy traps
            assert[isNotSealed](proxy);
          },
          { name: "TypeError" }
        );
      }
    });
  });

  it("isFrozen / frozen", () => {
    ["isFrozen", "frozen"].forEach(function(isFrozen) {
      const frozenObject = Object.freeze({});

      assert[isFrozen](frozenObject);

      err(() => assert[isFrozen]({}, "blah"), "blah: expected {} to be frozen");

      // Making sure ES6-like Object.isFrozen response is respected for all primitive types

      assert[isFrozen](42);
      assert[isFrozen](null);
      assert[isFrozen]("foo");
      assert[isFrozen](false);
      assert[isFrozen](undefined);

      if (typeof Symbol === "function") {
        assert[isFrozen](Symbol());
      }

      if (typeof Proxy === "function") {
        const proxy = new Proxy(
          {},
          {
            ownKeys: () => {
              throw new TypeError();
            }
          }
        );

        // Object.isFrozen will call ownKeys trap only if object is not extensible
        Object.preventExtensions(proxy);

        err(
          () => {
            // isFrozen should not suppress errors, thrown in proxy traps
            assert[isFrozen](proxy);
          },
          { name: "TypeError" }
        );
      }
    });
  });

  it("isNotFrozen / notFrozen", () => {
    ["isNotFrozen", "notFrozen"].forEach(function(isNotFrozen) {
      const frozenObject = Object.freeze({});

      assert[isNotFrozen]({});

      err(
        () => assert[isNotFrozen](frozenObject, "blah"),
        "blah: expected {} to not be frozen"
      );

      // Making sure ES6-like Object.isFrozen response is respected for all primitive types

      err(() => assert[isNotFrozen](42), "expected 42 to not be frozen");

      err(() => assert[isNotFrozen](null), "expected null to not be frozen");

      err(() => assert[isNotFrozen]("foo"), "expected 'foo' to not be frozen");

      err(() => assert[isNotFrozen](false), "expected false to not be frozen");

      err(
        () => assert[isNotFrozen](undefined),
        "expected undefined to not be frozen"
      );

      if (typeof Proxy === "function") {
        const proxy = new Proxy(
          {},
          {
            ownKeys: () => {
              throw new TypeError();
            }
          }
        );

        // Object.isFrozen will call ownKeys trap only if object is not extensible
        Object.preventExtensions(proxy);

        err(
          () => {
            // isNotFrozen should not suppress errors, thrown in proxy traps
            assert[isNotFrozen](proxy);
          },
          { name: "TypeError" }
        );
      }
    });
  });

  it("isEmpty / empty", () => {
    ["isEmpty", "empty"].forEach(function(isEmpty) {
      function FakeArgs() {}
      FakeArgs.prototype.length = 0;

      assert[isEmpty]("");
      assert[isEmpty]([]);
      assert[isEmpty](new FakeArgs());
      assert[isEmpty]({});

      if (typeof WeakMap === "function") {
        err(
          () => assert[isEmpty](new WeakMap(), "blah"),
          "blah: .empty was passed a weak collection"
        );
      }

      if (typeof WeakSet === "function") {
        err(
          () => assert[isEmpty](new WeakSet(), "blah"),
          "blah: .empty was passed a weak collection"
        );
      }

      if (typeof Map === "function") {
        assert[isEmpty](new Map());

        const map = new Map();
        map.key = "val";
        assert[isEmpty](map);
      }

      if (typeof Set === "function") {
        assert[isEmpty](new Set());

        const set = new Set();
        set.key = "val";
        assert[isEmpty](set);
      }

      err(
        () => assert[isEmpty]("foo", "blah"),
        "blah: expected 'foo' to be empty"
      );

      err(() => assert[isEmpty](["foo"]), "expected [ 'foo' ] to be empty");

      err(
        () => assert[isEmpty]({ arguments: 0 }),
        "expected { arguments: +0 } to be empty"
      );

      err(
        () => assert[isEmpty]({ foo: "bar" }),
        "expected { foo: 'bar' } to be empty"
      );

      err(
        () => assert[isEmpty](null, "blah"),
        "blah: .empty was passed non-string primitive null"
      );

      err(
        () => assert[isEmpty](undefined),
        ".empty was passed non-string primitive undefined"
      );

      err(
        () => assert[isEmpty](),
        ".empty was passed non-string primitive undefined"
      );

      err(
        () => assert[isEmpty](0),
        ".empty was passed non-string primitive +0"
      );

      err(() => assert[isEmpty](1), ".empty was passed non-string primitive 1");

      err(
        () => assert[isEmpty](true),
        ".empty was passed non-string primitive true"
      );

      err(
        () => assert[isEmpty](false),
        ".empty was passed non-string primitive false"
      );

      if (typeof Symbol !== "undefined") {
        err(
          () => assert[isEmpty](Symbol()),
          ".empty was passed non-string primitive Symbol()"
        );

        err(
          () => assert[isEmpty](Symbol.iterator),
          ".empty was passed non-string primitive Symbol(Symbol.iterator)"
        );
      }

      err(
        () => assert[isEmpty](() => {}, "blah"),
        "blah: .empty was passed a function"
      );

      if (FakeArgs.name === "FakeArgs") {
        err(
          () => assert[isEmpty](FakeArgs),
          ".empty was passed a function FakeArgs"
        );
      }
    });
  });

  it("isNotEmpty / notEmpty", () => {
    ["isNotEmpty", "notEmpty"].forEach(function(isNotEmpty) {
      function FakeArgs() {}
      FakeArgs.prototype.length = 0;

      assert[isNotEmpty]("foo");
      assert[isNotEmpty](["foo"]);
      assert[isNotEmpty]({ arguments: 0 });
      assert[isNotEmpty]({ foo: "bar" });

      if (typeof WeakMap === "function") {
        err(
          () => assert[isNotEmpty](new WeakMap(), "blah"),
          "blah: .empty was passed a weak collection"
        );
      }

      if (typeof WeakSet === "function") {
        err(
          () => assert[isNotEmpty](new WeakSet(), "blah"),
          "blah: .empty was passed a weak collection"
        );
      }

      if (typeof Map === "function") {
        // Not using Map constructor args because not supported in IE 11.
        const map = new Map();
        map.set("a", 1);
        assert[isNotEmpty](map);

        err(
          () => assert[isNotEmpty](new Map()),
          "expected Map{} not to be empty"
        );
      }

      if (typeof Set === "function") {
        // Not using Set constructor args because not supported in IE 11.
        const set = new Set();
        set.add(1);
        assert[isNotEmpty](set);

        err(
          () => assert[isNotEmpty](new Set()),
          "expected Set{} not to be empty"
        );
      }

      err(
        () => assert[isNotEmpty]("", "blah"),
        "blah: expected '' not to be empty"
      );

      err(() => assert[isNotEmpty]([]), "expected [] not to be empty");

      err(
        () => assert[isNotEmpty](new FakeArgs()),
        "expected FakeArgs{} not to be empty"
      );

      err(() => assert[isNotEmpty]({}), "expected {} not to be empty");

      err(
        () => assert[isNotEmpty](null, "blah"),
        "blah: .empty was passed non-string primitive null"
      );

      err(
        () => assert[isNotEmpty](undefined),
        ".empty was passed non-string primitive undefined"
      );

      err(
        () => assert[isNotEmpty](),
        ".empty was passed non-string primitive undefined"
      );

      err(
        () => assert[isNotEmpty](0),
        ".empty was passed non-string primitive +0"
      );

      err(
        () => assert[isNotEmpty](1),
        ".empty was passed non-string primitive 1"
      );

      err(
        () => assert[isNotEmpty](true),
        ".empty was passed non-string primitive true"
      );

      err(
        () => assert[isNotEmpty](false),
        ".empty was passed non-string primitive false"
      );

      if (typeof Symbol !== "undefined") {
        err(
          () => assert[isNotEmpty](Symbol()),
          ".empty was passed non-string primitive Symbol()"
        );

        err(
          () => assert[isNotEmpty](Symbol.iterator),
          ".empty was passed non-string primitive Symbol(Symbol.iterator)"
        );
      }

      err(
        () => assert[isNotEmpty](() => {}, "blah"),
        "blah: .empty was passed a function"
      );

      if (FakeArgs.name === "FakeArgs") {
        err(
          () => assert[isNotEmpty](FakeArgs),
          ".empty was passed a function FakeArgs"
        );
      }
    });
  });

  it("showDiff true with actual and expected args", () => {
    try {
      new chai.Assertion().assert(
        "one" === "two",
        "expected #{this} to equal #{exp}",
        "expected #{this} to not equal #{act}",
        "one",
        "two"
      );
    } catch (e) {
      assert.isTrue(e.showDiff);
    }
  });

  it("showDiff false without expected and actual", () => {
    try {
      new chai.Assertion().assert(
        "one" === "two",
        "expected #{this} to equal #{exp}",
        "expected #{this} to not equal #{act}",
        "one",
        "two",
        false
      );
    } catch (e) {
      assert.isFalse(e.showDiff);
    }
  });
});

describe("expect", () => {
  const sym = Symbol();

  describe("proxify", () => {
    if (typeof Proxy === "undefined" || typeof Reflect === "undefined") return;

    it("throws when invalid property follows expect", () =>
      err(() => expect(42).pizza, "Invalid Chai property: pizza"));

    it("throws when invalid property follows language chain", () =>
      err(() => expect(42).to.pizza, "Invalid Chai property: pizza"));

    it("throws when invalid property follows property assertion", () =>
      err(() => expect(42).ok.pizza, "Invalid Chai property: pizza"));

    it("throws when invalid property follows uncalled method assertion", () => {
      err(() => {
        expect(42).equal.pizza;
      }, 'Invalid Chai property: equal.pizza. See docs for proper usage of "equal".');
    });

    it("throws when invalid property follows called method assertion", () =>
      err(() => expect(42).equal(42).pizza, "Invalid Chai property: pizza"));

    it("throws when invalid property follows uncalled chainable method assertion", () =>
      err(() => expect(42).a.pizza, "Invalid Chai property: pizza"));

    it("throws when invalid property follows called chainable method assertion", () =>
      err(() => expect(42).a("number").pizza, "Invalid Chai property: pizza"));

    it("doesn't throw if invalid property is excluded via config", () => {
      expect(() => {
        expect(42).then;
      }).to.not.throw();
    });
  });
});

it("no-op chains", () => {
  function test(chain) {
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
  }

  [
    "to",
    "be",
    "been",
    "is",
    "and",
    "has",
    "have",
    "with",
    "that",
    "which",
    "at",
    "of",
    "same",
    "but",
    "does",
    "still",
    "also"
  ].forEach(test);
});

describe("fail", () => {
  it("should accept a message as the 3rd argument", () => {
    err(() => expect.fail(0, 1, "this has failed"), /this has failed/);
  });

  it("should accept a message as the only argument", () => {
    err(() => expect.fail("this has failed"), /this has failed/);
  });

  it("should produce a default message when called without any arguments", () => {
    err(() => expect.fail(), /expect\.fail()/);
  });
});

it("true", () => {
  expect(true).to.be.true;
  expect(false).to.not.be.true;
  expect(1).to.not.be.true;

  err(
    () => expect("test", "blah").to.be.true,
    "blah: expected 'test' to be true"
  );
});

it("ok", () => {
  expect(true).to.be.ok;
  expect(false).to.not.be.ok;
  expect(1).to.be.ok;
  expect(0).to.not.be.ok;

  err(() => expect("", "blah").to.be.ok, "blah: expected '' to be truthy");

  err(() => expect("test").to.not.be.ok, "expected 'test' to be falsy");
});

it("false", () => {
  expect(false).to.be.false;
  expect(true).to.not.be.false;
  expect(0).to.not.be.false;

  err(() => expect("", "blah").to.be.false, "blah: expected '' to be false");
});

it("null", () => {
  expect(null).to.be.null;
  expect(false).to.not.be.null;

  err(() => expect("", "blah").to.be.null, "blah: expected '' to be null");
});

it("undefined", () => {
  expect(undefined).to.be.undefined;
  expect(null).to.not.be.undefined;

  err(
    () => expect("", "blah").to.be.undefined,
    "blah: expected '' to be undefined"
  );
});

it("exist", () => {
  const foo = "bar";
  var bar;

  expect(foo).to.exist;
  expect(foo).to.exists;
  expect(bar).to.not.exist;
  expect(bar).to.not.exists;
  expect(0).to.exist;
  expect(false).to.exist;
  expect("").to.exist;

  err(() => expect(bar, "blah").to.exist, "blah: expected undefined to exist");

  err(() => expect(foo).to.not.exist(foo), "expected 'bar' to not exist");
});

it("arguments", () => {
  const args = (() => {
    return arguments;
  })(1, 2, 3);
  expect(args).to.be.arguments;
  expect([]).to.not.be.arguments;
  expect(args).to.be.an("arguments").and.be.arguments;
  expect([]).to.be.an("array").and.not.be.Arguments;

  err(
    () => expect([], "blah").to.be.arguments,
    "blah: expected [] to be arguments but got Array"
  );
});

it(".equal()", () => {
  var foo;
  expect(undefined).to.equal(foo);

  err(
    () => expect(undefined).to.equal(null),
    "expected undefined to equal null"
  );
});

it("typeof", () => {
  expect("test").to.be.a("string");

  err(
    () => expect("test").to.not.be.a("string"),
    "expected 'test' not to be a string"
  );

  (() => {
    expect(arguments).to.be.an("arguments");
  })(1, 2);

  expect(5).to.be.a("number");
  expect(new Number(1)).to.be.a("number");
  expect(Number(1)).to.be.a("number");
  expect(true).to.be.a("boolean");
  expect(new Array()).to.be.a("array");
  expect(new Object()).to.be.a("object");
  expect({}).to.be.a("object");
  expect([]).to.be.a("array");
  expect(() => {}).to.be.a("function");
  expect(null).to.be.a("null");

  if (typeof Symbol === "function") {
    expect(Symbol()).to.be.a("symbol");
  }

  err(
    () => expect(5).to.not.be.a("number", "blah"),
    "blah: expected 5 not to be a number"
  );

  err(
    () => expect(5, "blah").to.not.be.a("number"),
    "blah: expected 5 not to be a number"
  );
});

it("instanceof", () => {
  function Foo() {}
  expect(new Foo()).to.be.an.instanceof(Foo);

  // Normally, `instanceof` requires that the constructor be a function or an
  // object with a callable `@@hasInstance`. But in some older browsers such
  // as IE11, `instanceof` also accepts DOM-related interfaces such as
  // `HTMLElement`, despite being non-callable objects in those browsers.
  // See: https://github.com/chaijs/chai/issues/1000.
  if (
    typeof document !== "undefined" &&
    typeof document.createElement !== "undefined" &&
    typeof HTMLElement !== "undefined"
  ) {
    expect(document.createElement("div")).to.be.an.instanceof(HTMLElement);
  }

  err(
    () => expect(new Foo()).to.an.instanceof(1, "blah"),
    "blah: The instanceof assertion needs a constructor but number was given."
  );

  err(
    () => expect(new Foo(), "blah").to.an.instanceof(1),
    "blah: The instanceof assertion needs a constructor but number was given."
  );

  err(
    () => expect(new Foo()).to.an.instanceof("batman"),
    "The instanceof assertion needs a constructor but string was given."
  );

  err(
    () => expect(new Foo()).to.an.instanceof({}),
    "The instanceof assertion needs a constructor but Object was given."
  );

  err(
    () => expect(new Foo()).to.an.instanceof(true),
    "The instanceof assertion needs a constructor but boolean was given."
  );

  err(
    () => expect(new Foo()).to.an.instanceof(null),
    "The instanceof assertion needs a constructor but null was given."
  );

  err(
    () => expect(new Foo()).to.an.instanceof(undefined),
    "The instanceof assertion needs a constructor but undefined was given."
  );

  err(() => {
    function Thing() {}
    const t = new Thing();
    Thing.prototype = 1337;
    expect(t).to.an.instanceof(Thing);
  }, "The instanceof assertion needs a constructor but function was given.");

  if (
    typeof Symbol !== "undefined" &&
    typeof Symbol.hasInstance !== "undefined"
  ) {
    err(
      () => expect(new Foo()).to.an.instanceof(Symbol()),
      "The instanceof assertion needs a constructor but symbol was given."
    );

    err(() => {
      const FakeConstructor = {};
      const fakeInstanceB = 4;
      FakeConstructor[Symbol.hasInstance] = function(val) {
        return val === 3;
      };

      expect(fakeInstanceB).to.be.an.instanceof(FakeConstructor);
    }, "expected 4 to be an instance of an unnamed constructor");

    err(() => {
      const FakeConstructor = {};
      const fakeInstanceB = 4;
      FakeConstructor[Symbol.hasInstance] = function(val) {
        return val === 4;
      };

      expect(fakeInstanceB).to.not.be.an.instanceof(FakeConstructor);
    }, "expected 4 to not be an instance of an unnamed constructor");
  }

  err(
    () => expect(3).to.an.instanceof(Foo, "blah"),
    "blah: expected 3 to be an instance of Foo"
  );

  err(
    () => expect(3, "blah").to.an.instanceof(Foo),
    "blah: expected 3 to be an instance of Foo"
  );
});

it("within(start, finish)", () => {
  expect(5).to.be.within(5, 10);
  expect(5).to.be.within(3, 6);
  expect(5).to.be.within(3, 5);
  expect(5).to.not.be.within(1, 3);
  expect("foo").to.have.length.within(2, 4);
  expect("foo").to.have.lengthOf.within(2, 4);
  expect([1, 2, 3]).to.have.length.within(2, 4);
  expect([1, 2, 3]).to.have.lengthOf.within(2, 4);

  err(
    () => expect(5).to.not.be.within(4, 6, "blah"),
    "blah: expected 5 to not be within 4..6"
  );

  err(
    () => expect(5, "blah").to.not.be.within(4, 6),
    "blah: expected 5 to not be within 4..6"
  );

  err(
    () => expect(10).to.be.within(50, 100, "blah"),
    "blah: expected 10 to be within 50..100"
  );

  err(
    () => expect("foo").to.have.length.within(5, 7, "blah"),
    "blah: expected 'foo' to have a length within 5..7"
  );

  err(
    () => expect("foo", "blah").to.have.length.within(5, 7),
    "blah: expected 'foo' to have a length within 5..7"
  );

  err(
    () => expect("foo").to.have.lengthOf.within(5, 7, "blah"),
    "blah: expected 'foo' to have a length within 5..7"
  );

  err(
    () => expect([1, 2, 3]).to.have.length.within(5, 7, "blah"),
    "blah: expected [ 1, 2, 3 ] to have a length within 5..7"
  );

  err(
    () => expect([1, 2, 3]).to.have.lengthOf.within(5, 7, "blah"),
    "blah: expected [ 1, 2, 3 ] to have a length within 5..7"
  );

  err(
    () => expect(null).to.be.within(0, 1, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(null, "blah").to.be.within(0, 1),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(1).to.be.within(null, 1, "blah"),
    "blah: the arguments to within must be numbers"
  );

  err(
    () => expect(1, "blah").to.be.within(null, 1),
    "blah: the arguments to within must be numbers"
  );

  err(
    () => expect(1).to.be.within(0, null, "blah"),
    "blah: the arguments to within must be numbers"
  );

  err(
    () => expect(1, "blah").to.be.within(0, null),
    "blah: the arguments to within must be numbers"
  );

  err(
    () => expect(null).to.not.be.within(0, 1, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(1).to.not.be.within(null, 1, "blah"),
    "blah: the arguments to within must be numbers"
  );

  err(
    () => expect(1).to.not.be.within(0, null, "blah"),
    "blah: the arguments to within must be numbers"
  );

  err(
    () => expect(1).to.have.length.within(5, 7, "blah"),
    "blah: expected 1 to have property 'length'"
  );

  err(
    () => expect(1, "blah").to.have.length.within(5, 7),
    "blah: expected 1 to have property 'length'"
  );

  err(
    () => expect(1).to.have.lengthOf.within(5, 7, "blah"),
    "blah: expected 1 to have property 'length'"
  );

  if (typeof Map === "function") {
    expect(new Map()).to.have.length.within(0, 0);
    expect(new Map()).to.have.lengthOf.within(0, 0);

    const map = new Map();
    map.set("a", 1);
    map.set("b", 2);
    map.set("c", 3);

    expect(map).to.have.length.within(2, 4);
    expect(map).to.have.lengthOf.within(2, 4);

    err(
      () => expect(map).to.have.length.within(5, 7, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to have a size within 5..7"
    );

    err(
      () => expect(map).to.have.lengthOf.within(5, 7, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to have a size within 5..7"
    );
  }

  if (typeof Set === "function") {
    expect(new Set()).to.have.length.within(0, 0);
    expect(new Set()).to.have.lengthOf.within(0, 0);

    const set = new Set();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set).to.have.length.within(2, 4);
    expect(set).to.have.lengthOf.within(2, 4);

    err(
      () => expect(set).to.have.length.within(5, 7, "blah"),
      "blah: expected Set{ 1, 2, 3 } to have a size within 5..7"
    );

    err(
      () => expect(set).to.have.lengthOf.within(5, 7, "blah"),
      "blah: expected Set{ 1, 2, 3 } to have a size within 5..7"
    );
  }
});

it("within(start, finish) (dates)", () => {
  const now = new Date();
  const oneSecondAgo = new Date(now.getTime() - 1000);
  const oneSecondAfter = new Date(now.getTime() + 1000);
  const nowISO = now.toISOString();
  const beforeISO = oneSecondAgo.toISOString();
  const afterISO = oneSecondAfter.toISOString();

  expect(now).to.be.within(oneSecondAgo, oneSecondAfter);
  expect(now).to.be.within(now, oneSecondAfter);
  expect(now).to.be.within(now, now);
  expect(oneSecondAgo).to.not.be.within(now, oneSecondAfter);

  err(
    () => expect(now).to.not.be.within(now, oneSecondAfter, "blah"),
    "blah: expected " + nowISO + " to not be within " + nowISO + ".." + afterISO
  );

  err(
    () => expect(now, "blah").to.not.be.within(oneSecondAgo, oneSecondAfter),
    "blah: expected " +
      nowISO +
      " to not be within " +
      beforeISO +
      ".." +
      afterISO
  );

  err(
    () => expect(now).to.have.length.within(5, 7, "blah"),
    "blah: expected " + nowISO + " to have property 'length'"
  );

  err(
    () => expect("foo").to.have.lengthOf.within(now, 7, "blah"),
    "blah: the arguments to within must be numbers"
  );

  err(
    () => expect(now).to.be.within(now, 1, "blah"),
    "blah: the arguments to within must be dates"
  );

  err(
    () => expect(now).to.be.within(null, now, "blah"),
    "blah: the arguments to within must be dates"
  );

  err(
    () => expect(now).to.be.within(now, undefined, "blah"),
    "blah: the arguments to within must be dates"
  );

  err(
    () => expect(now, "blah").to.be.within(1, now),
    "blah: the arguments to within must be dates"
  );

  err(
    () => expect(now, "blah").to.be.within(now, 1),
    "blah: the arguments to within must be dates"
  );

  err(
    () => expect(null).to.not.be.within(now, oneSecondAfter, "blah"),
    "blah: expected null to be a number or a date"
  );
});

it("above(n)", () => {
  expect(5).to.be.above(2);
  expect(5).to.be.greaterThan(2);
  expect(5).to.not.be.above(5);
  expect(5).to.not.be.above(6);
  expect("foo").to.have.length.above(2);
  expect("foo").to.have.lengthOf.above(2);
  expect([1, 2, 3]).to.have.length.above(2);
  expect([1, 2, 3]).to.have.lengthOf.above(2);

  err(() => expect(5).to.be.above(6, "blah"), "blah: expected 5 to be above 6");

  err(() => expect(5, "blah").to.be.above(6), "blah: expected 5 to be above 6");

  err(
    () => expect(10).to.not.be.above(6, "blah"),
    "blah: expected 10 to be at most 6"
  );

  err(
    () => expect("foo").to.have.length.above(4, "blah"),
    "blah: expected 'foo' to have a length above 4 but got 3"
  );

  err(
    () => expect("foo", "blah").to.have.length.above(4),
    "blah: expected 'foo' to have a length above 4 but got 3"
  );

  err(
    () => expect("foo").to.have.lengthOf.above(4, "blah"),
    "blah: expected 'foo' to have a length above 4 but got 3"
  );

  err(
    () => expect([1, 2, 3]).to.have.length.above(4, "blah"),
    "blah: expected [ 1, 2, 3 ] to have a length above 4 but got 3"
  );

  err(
    () => expect([1, 2, 3]).to.have.lengthOf.above(4, "blah"),
    "blah: expected [ 1, 2, 3 ] to have a length above 4 but got 3"
  );

  err(
    () => expect(null).to.be.above(0, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(null, "blah").to.be.above(0),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(1).to.be.above(null, "blah"),
    "blah: the argument to above must be a number"
  );

  err(
    () => expect(1, "blah").to.be.above(null),
    "blah: the argument to above must be a number"
  );

  err(
    () => expect(null).to.not.be.above(0, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(1).to.not.be.above(null, "blah"),
    "blah: the argument to above must be a number"
  );

  err(
    () => expect(1).to.have.length.above(0, "blah"),
    "blah: expected 1 to have property 'length'"
  );

  err(
    () => expect(1, "blah").to.have.length.above(0),
    "blah: expected 1 to have property 'length'"
  );

  err(
    () => expect(1).to.have.lengthOf.above(0, "blah"),
    "blah: expected 1 to have property 'length'"
  );

  if (typeof Map === "function") {
    expect(new Map()).to.have.length.above(-1);
    expect(new Map()).to.have.lengthOf.above(-1);

    const map = new Map();
    map.set("a", 1);
    map.set("b", 2);
    map.set("c", 3);

    expect(map).to.have.length.above(2);
    expect(map).to.have.lengthOf.above(2);

    err(
      () => expect(map).to.have.length.above(5, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to have a size above 5 but got 3"
    );

    err(
      () => expect(map).to.have.lengthOf.above(5, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to have a size above 5 but got 3"
    );
  }

  if (typeof Set === "function") {
    expect(new Set()).to.have.length.above(-1);
    expect(new Set()).to.have.lengthOf.above(-1);

    const set = new Set();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set).to.have.length.above(2);
    expect(set).to.have.lengthOf.above(2);

    err(
      () => expect(set).to.have.length.above(5, "blah"),
      "blah: expected Set{ 1, 2, 3 } to have a size above 5 but got 3"
    );

    err(
      () => expect(set).to.have.lengthOf.above(5, "blah"),
      "blah: expected Set{ 1, 2, 3 } to have a size above 5 but got 3"
    );
  }
});

it("above(n) (dates)", () => {
  const now = new Date();
  const oneSecondAgo = new Date(now.getTime() - 1000);
  const oneSecondAfter = new Date(now.getTime() + 1000);

  expect(now).to.be.above(oneSecondAgo);
  expect(now).to.be.greaterThan(oneSecondAgo);
  expect(now).to.not.be.above(now);
  expect(now).to.not.be.above(oneSecondAfter);

  err(
    () => expect(now).to.be.above(oneSecondAfter, "blah"),
    "blah: expected " +
      now.toISOString() +
      " to be above " +
      oneSecondAfter.toISOString()
  );

  err(
    () => expect(10).to.not.be.above(6, "blah"),
    "blah: expected 10 to be at most 6"
  );

  err(
    () => expect(now).to.have.length.above(4, "blah"),
    "blah: expected " + now.toISOString() + " to have property 'length'"
  );

  err(
    () => expect([1, 2, 3]).to.have.length.above(now, "blah"),
    "blah: the argument to above must be a number"
  );

  err(
    () => expect(null).to.be.above(now, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(now).to.be.above(null, "blah"),
    "blah: the argument to above must be a date"
  );

  err(
    () => expect(null).to.have.length.above(0, "blah"),
    "blah: Target cannot be null or undefined."
  );
});

it("least(n)", () => {
  expect(5).to.be.at.least(2);
  expect(5).to.be.at.least(5);
  expect(5).to.not.be.at.least(6);
  expect("foo").to.have.length.of.at.least(2);
  expect("foo").to.have.lengthOf.at.least(2);
  expect([1, 2, 3]).to.have.length.of.at.least(2);
  expect([1, 2, 3]).to.have.lengthOf.at.least(2);

  err(
    () => expect(5).to.be.at.least(6, "blah"),
    "blah: expected 5 to be at least 6"
  );

  err(
    () => expect(5, "blah").to.be.at.least(6),
    "blah: expected 5 to be at least 6"
  );

  err(
    () => expect(10).to.not.be.at.least(6, "blah"),
    "blah: expected 10 to be below 6"
  );

  err(
    () => expect("foo").to.have.length.of.at.least(4, "blah"),
    "blah: expected 'foo' to have a length at least 4 but got 3"
  );

  err(
    () => expect("foo", "blah").to.have.length.of.at.least(4),
    "blah: expected 'foo' to have a length at least 4 but got 3"
  );

  err(
    () => expect("foo").to.have.lengthOf.at.least(4, "blah"),
    "blah: expected 'foo' to have a length at least 4 but got 3"
  );

  err(
    () => expect([1, 2, 3]).to.have.length.of.at.least(4, "blah"),
    "blah: expected [ 1, 2, 3 ] to have a length at least 4 but got 3"
  );

  err(
    () => expect([1, 2, 3]).to.have.lengthOf.at.least(4, "blah"),
    "blah: expected [ 1, 2, 3 ] to have a length at least 4 but got 3"
  );

  err(
    () => expect([1, 2, 3, 4]).to.not.have.length.of.at.least(4, "blah"),
    "blah: expected [ 1, 2, 3, 4 ] to have a length below 4"
  );

  err(
    () => expect([1, 2, 3, 4]).to.not.have.lengthOf.at.least(4, "blah"),
    "blah: expected [ 1, 2, 3, 4 ] to have a length below 4"
  );

  err(
    () => expect(null).to.be.at.least(0, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(null, "blah").to.be.at.least(0),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(1).to.be.at.least(null, "blah"),
    "blah: the argument to least must be a number"
  );

  err(
    () => expect(1, "blah").to.be.at.least(null),
    "blah: the argument to least must be a number"
  );

  err(
    () => expect(null).to.not.be.at.least(0, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(1).to.not.be.at.least(null, "blah"),
    "blah: the argument to least must be a number"
  );

  err(
    () => expect(1).to.have.length.at.least(0, "blah"),
    "blah: expected 1 to have property 'length'"
  );

  err(
    () => expect(1, "blah").to.have.length.at.least(0),
    "blah: expected 1 to have property 'length'"
  );

  err(
    () => expect(1).to.have.lengthOf.at.least(0, "blah"),
    "blah: expected 1 to have property 'length'"
  );

  if (typeof Map === "function") {
    expect(new Map()).to.have.length.of.at.least(0);
    expect(new Map()).to.have.lengthOf.at.least(0);

    const map = new Map();
    map.set("a", 1);
    map.set("b", 2);
    map.set("c", 3);

    expect(map).to.have.length.of.at.least(3);
    expect(map).to.have.lengthOf.at.least(3);

    err(
      () => expect(map).to.have.length.of.at.least(4, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to have a size at least 4 but got 3"
    );

    err(
      () => expect(map).to.have.lengthOf.at.least(4, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to have a size at least 4 but got 3"
    );
  }

  if (typeof Set === "function") {
    expect(new Set()).to.have.length.of.at.least(0);
    expect(new Set()).to.have.lengthOf.at.least(0);

    const set = new Set();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set).to.have.length.of.at.least(3);
    expect(set).to.have.lengthOf.at.least(3);

    err(
      () => expect(set).to.have.length.of.at.least(4, "blah"),
      "blah: expected Set{ 1, 2, 3 } to have a size at least 4 but got 3"
    );

    err(
      () => expect(set).to.have.lengthOf.at.least(4, "blah"),
      "blah: expected Set{ 1, 2, 3 } to have a size at least 4 but got 3"
    );
  }
});

it("below(n)", () => {
  expect(2).to.be.below(5);
  expect(2).to.be.lessThan(5);
  expect(2).to.not.be.below(2);
  expect(2).to.not.be.below(1);
  expect("foo").to.have.length.below(4);
  expect("foo").to.have.lengthOf.below(4);
  expect([1, 2, 3]).to.have.length.below(4);
  expect([1, 2, 3]).to.have.lengthOf.below(4);

  err(() => expect(6).to.be.below(5, "blah"), "blah: expected 6 to be below 5");

  err(() => expect(6, "blah").to.be.below(5), "blah: expected 6 to be below 5");

  err(
    () => expect(6).to.not.be.below(10, "blah"),
    "blah: expected 6 to be at least 10"
  );

  err(
    () => expect("foo").to.have.length.below(2, "blah"),
    "blah: expected 'foo' to have a length below 2 but got 3"
  );

  err(
    () => expect("foo", "blah").to.have.length.below(2),
    "blah: expected 'foo' to have a length below 2 but got 3"
  );

  err(
    () => expect("foo").to.have.lengthOf.below(2, "blah"),
    "blah: expected 'foo' to have a length below 2 but got 3"
  );

  err(
    () => expect([1, 2, 3]).to.have.length.below(2, "blah"),
    "blah: expected [ 1, 2, 3 ] to have a length below 2 but got 3"
  );

  err(
    () => expect([1, 2, 3]).to.have.lengthOf.below(2, "blah"),
    "blah: expected [ 1, 2, 3 ] to have a length below 2 but got 3"
  );

  err(
    () => expect(null).to.be.below(0, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(null, "blah").to.be.below(0),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(1).to.be.below(null, "blah"),
    "blah: the argument to below must be a number"
  );

  err(
    () => expect(1, "blah").to.be.below(null),
    "blah: the argument to below must be a number"
  );

  err(
    () => expect(null).to.not.be.below(0, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(1).to.not.be.below(null, "blah"),
    "blah: the argument to below must be a number"
  );

  err(
    () => expect(1).to.have.length.below(0, "blah"),
    "blah: expected 1 to have property 'length'"
  );

  err(
    () => expect(1, "blah").to.have.length.below(0),
    "blah: expected 1 to have property 'length'"
  );

  err(
    () => expect(1).to.have.lengthOf.below(0, "blah"),
    "blah: expected 1 to have property 'length'"
  );

  if (typeof Map === "function") {
    expect(new Map()).to.have.length.below(1);
    expect(new Map()).to.have.lengthOf.below(1);

    const map = new Map();
    map.set("a", 1);
    map.set("b", 2);
    map.set("c", 3);

    expect(map).to.have.length.below(4);
    expect(map).to.have.lengthOf.below(4);

    err(
      () => expect(map).to.have.length.below(2, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to have a size below 2 but got 3"
    );

    err(
      () => expect(map).to.have.lengthOf.below(2, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to have a size below 2 but got 3"
    );
  }

  if (typeof Set === "function") {
    expect(new Set()).to.have.length.below(1);
    expect(new Set()).to.have.lengthOf.below(1);

    const set = new Set();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set).to.have.length.below(4);
    expect(set).to.have.lengthOf.below(4);

    err(
      () => expect(set).to.have.length.below(2, "blah"),
      "blah: expected Set{ 1, 2, 3 } to have a size below 2 but got 3"
    );

    err(
      () => expect(set).to.have.lengthOf.below(2, "blah"),
      "blah: expected Set{ 1, 2, 3 } to have a size below 2 but got 3"
    );
  }
});

it("below(n) (dates)", () => {
  const now = new Date();
  const oneSecondAgo = new Date(now.getTime() - 1000);
  const oneSecondAfter = new Date(now.getTime() + 1000);

  expect(now).to.be.below(oneSecondAfter);
  expect(oneSecondAgo).to.be.lessThan(now);
  expect(now).to.not.be.below(oneSecondAgo);
  expect(oneSecondAfter).to.not.be.below(oneSecondAgo);

  err(
    () => expect(now).to.be.below(oneSecondAgo, "blah"),
    "blah: expected " +
      now.toISOString() +
      " to be below " +
      oneSecondAgo.toISOString()
  );

  err(
    () => expect(now).to.not.be.below(oneSecondAfter, "blah"),
    "blah: expected " +
      now.toISOString() +
      " to be at least " +
      oneSecondAfter.toISOString()
  );

  err(
    () => expect("foo").to.have.length.below(2, "blah"),
    "blah: expected 'foo' to have a length below 2 but got 3"
  );

  err(
    () => expect(null).to.be.below(now, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(1).to.be.below(null, "blah"),
    "blah: the argument to below must be a number"
  );

  err(
    () => expect(now).to.not.be.below(null, "blah"),
    "blah: the argument to below must be a date"
  );

  err(
    () => expect(now).to.have.length.below(0, "blah"),
    "blah: expected " + now.toISOString() + " to have property 'length'"
  );

  err(
    () => expect("asdasd").to.have.length.below(now, "blah"),
    "blah: the argument to below must be a number"
  );
});

it("most(n)", () => {
  expect(2).to.be.at.most(5);
  expect(2).to.be.at.most(2);
  expect(2).to.not.be.at.most(1);
  expect("foo").to.have.length.of.at.most(4);
  expect("foo").to.have.lengthOf.at.most(4);
  expect([1, 2, 3]).to.have.length.of.at.most(4);
  expect([1, 2, 3]).to.have.lengthOf.at.most(4);

  err(
    () => expect(6).to.be.at.most(5, "blah"),
    "blah: expected 6 to be at most 5"
  );

  err(
    () => expect(6, "blah").to.be.at.most(5),
    "blah: expected 6 to be at most 5"
  );

  err(
    () => expect(6).to.not.be.at.most(10, "blah"),
    "blah: expected 6 to be above 10"
  );

  err(
    () => expect("foo").to.have.length.of.at.most(2, "blah"),
    "blah: expected 'foo' to have a length at most 2 but got 3"
  );

  err(
    () => expect("foo", "blah").to.have.length.of.at.most(2),
    "blah: expected 'foo' to have a length at most 2 but got 3"
  );

  err(
    () => expect("foo").to.have.lengthOf.at.most(2, "blah"),
    "blah: expected 'foo' to have a length at most 2 but got 3"
  );

  err(
    () => expect([1, 2, 3]).to.have.length.of.at.most(2, "blah"),
    "blah: expected [ 1, 2, 3 ] to have a length at most 2 but got 3"
  );

  err(
    () => expect([1, 2, 3]).to.have.lengthOf.at.most(2, "blah"),
    "blah: expected [ 1, 2, 3 ] to have a length at most 2 but got 3"
  );

  err(
    () => expect([1, 2]).to.not.have.length.of.at.most(2, "blah"),
    "blah: expected [ 1, 2 ] to have a length above 2"
  );

  err(
    () => expect([1, 2]).to.not.have.lengthOf.at.most(2, "blah"),
    "blah: expected [ 1, 2 ] to have a length above 2"
  );

  err(
    () => expect(null).to.be.at.most(0, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(null, "blah").to.be.at.most(0),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(1).to.be.at.most(null, "blah"),
    "blah: the argument to most must be a number"
  );

  err(
    () => expect(1, "blah").to.be.at.most(null),
    "blah: the argument to most must be a number"
  );

  err(
    () => expect(null).to.not.be.at.most(0, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(1).to.not.be.at.most(null, "blah"),
    "blah: the argument to most must be a number"
  );

  err(
    () => expect(1).to.have.length.of.at.most(0, "blah"),
    "blah: expected 1 to have property 'length'"
  );

  err(
    () => expect(1, "blah").to.have.length.of.at.most(0),
    "blah: expected 1 to have property 'length'"
  );

  err(
    () => expect(1).to.have.lengthOf.at.most(0, "blah"),
    "blah: expected 1 to have property 'length'"
  );

  if (typeof Map === "function") {
    expect(new Map()).to.have.length.of.at.most(0);
    expect(new Map()).to.have.lengthOf.at.most(0);

    const map = new Map();
    map.set("a", 1);
    map.set("b", 2);
    map.set("c", 3);

    expect(map).to.have.length.of.at.most(3);
    expect(map).to.have.lengthOf.at.most(3);

    err(
      () => expect(map).to.have.length.of.at.most(2, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to have a size at most 2 but got 3"
    );

    err(
      () => expect(map).to.have.lengthOf.at.most(2, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to have a size at most 2 but got 3"
    );
  }

  if (typeof Set === "function") {
    expect(new Set()).to.have.length.of.at.most(0);
    expect(new Set()).to.have.lengthOf.at.most(0);

    const set = new Set();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set).to.have.length.of.at.most(3);
    expect(set).to.have.lengthOf.at.most(3);

    err(
      () => expect(set).to.have.length.of.at.most(2, "blah"),
      "blah: expected Set{ 1, 2, 3 } to have a size at most 2 but got 3"
    );

    err(
      () => expect(set).to.have.lengthOf.at.most(2, "blah"),
      "blah: expected Set{ 1, 2, 3 } to have a size at most 2 but got 3"
    );
  }
});

it("most(n) (dates)", () => {
  const now = new Date();
  const oneSecondBefore = new Date(now.getTime() - 1000);
  const oneSecondAfter = new Date(now.getTime() + 1000);
  const nowISO = now.toISOString();
  const beforeISO = oneSecondBefore.toISOString();
  const afterISO = oneSecondAfter.toISOString();

  expect(now).to.be.at.most(oneSecondAfter);
  expect(now).to.be.at.most(now);
  expect(now).to.not.be.at.most(oneSecondBefore);

  err(
    () => expect(now).to.be.at.most(oneSecondBefore, "blah"),
    "blah: expected " + nowISO + " to be at most " + beforeISO
  );

  err(
    () => expect(now).to.not.be.at.most(now, "blah"),
    "blah: expected " + nowISO + " to be above " + nowISO
  );

  err(
    () => expect(now).to.have.length.of.at.most(2, "blah"),
    "blah: expected " + nowISO + " to have property 'length'"
  );

  err(
    () => expect("foo", "blah").to.have.length.of.at.most(now),
    "blah: the argument to most must be a number"
  );

  err(
    () => expect([1, 2, 3]).to.not.have.length.of.at.most(now, "blah"),
    "blah: the argument to most must be a number"
  );

  err(
    () => expect(null).to.be.at.most(now, "blah"),
    "blah: expected null to be a number or a date"
  );

  err(
    () => expect(now, "blah").to.be.at.most(null),
    "blah: the argument to most must be a date"
  );

  err(
    () => expect(1).to.be.at.most(now, "blah"),
    "blah: the argument to most must be a number"
  );

  err(
    () => expect(now, "blah").to.be.at.most(1),
    "blah: the argument to most must be a date"
  );

  err(
    () => expect(now).to.not.be.at.most(undefined, "blah"),
    "blah: the argument to most must be a date"
  );
});

it("match(regexp)", () => {
  expect("foobar").to.match(/^foo/);
  expect("foobar").to.matches(/^foo/);
  expect("foobar").to.not.match(/^bar/);

  err(
    () => expect("foobar").to.match(/^bar/i, "blah"),
    "blah: expected 'foobar' to match /^bar/i"
  );

  err(
    () => expect("foobar", "blah").to.match(/^bar/i),
    "blah: expected 'foobar' to match /^bar/i"
  );

  err(
    () => expect("foobar").to.matches(/^bar/i, "blah"),
    "blah: expected 'foobar' to match /^bar/i"
  );

  err(
    () => expect("foobar").to.not.match(/^foo/i, "blah"),
    "blah: expected 'foobar' not to match /^foo/i"
  );
});

it("lengthOf(n)", () => {
  expect("test").to.have.length(4);
  expect("test").to.have.lengthOf(4);
  expect("test").to.not.have.length(3);
  expect("test").to.not.have.lengthOf(3);
  expect([1, 2, 3]).to.have.length(3);
  expect([1, 2, 3]).to.have.lengthOf(3);

  err(
    () => expect(4).to.have.length(3, "blah"),
    "blah: expected 4 to have property 'length'"
  );

  err(
    () => expect(4, "blah").to.have.length(3),
    "blah: expected 4 to have property 'length'"
  );

  err(
    () => expect(4).to.have.lengthOf(3, "blah"),
    "blah: expected 4 to have property 'length'"
  );

  err(
    () => expect("asd").to.not.have.length(3, "blah"),
    "blah: expected 'asd' to not have a length of 3"
  );

  err(
    () => expect("asd").to.not.have.lengthOf(3, "blah"),
    "blah: expected 'asd' to not have a length of 3"
  );

  if (typeof Map === "function") {
    expect(new Map()).to.have.length(0);
    expect(new Map()).to.have.lengthOf(0);

    const map = new Map();
    map.set("a", 1);
    map.set("b", 2);
    map.set("c", 3);

    expect(map).to.have.length(3);
    expect(map).to.have.lengthOf(3);

    err(
      () => expect(map).to.not.have.length(3, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to not have a size of 3"
    );

    err(
      () => expect(map).to.not.have.lengthOf(3, "blah"),
      "blah: expected Map{ 'a' => 1, 'b' => 2, 'c' => 3 } to not have a size of 3"
    );
  }

  if (typeof Set === "function") {
    expect(new Set()).to.have.length(0);
    expect(new Set()).to.have.lengthOf(0);

    const set = new Set();
    set.add(1);
    set.add(2);
    set.add(3);

    expect(set).to.have.length(3);
    expect(set).to.have.lengthOf(3);

    err(
      () => expect(set).to.not.have.length(3, "blah"),
      "blah: expected Set{ 1, 2, 3 } to not have a size of 3"
    );

    err(
      () => expect(set).to.not.have.lengthOf(3, "blah"),
      "blah: expected Set{ 1, 2, 3 } to not have a size of 3"
    );
  }
});

it("eql(val)", () => {
  expect("test").to.eql("test");
  expect({ foo: "bar" }).to.eql({ foo: "bar" });
  expect(1).to.eql(1);
  expect("4").to.not.eql(4);

  if (typeof Symbol === "function") {
    const sym = Symbol();
    expect(sym).to.eql(sym);
  }

  err(() => expect(4).to.eql(3, "blah"), "blah: expected 4 to deeply equal 3");
});

if ("undefined" !== typeof Buffer) {
  it("Buffer eql()", () => {
    expect(Buffer.from([1])).to.eql(Buffer.from([1]));

    err(
      () => expect(Buffer.from([0])).to.eql(Buffer.from([1])),
      "expected Buffer[ 0 ] to deeply equal Buffer[ 1 ]"
    );
  });
}

it("equal(val)", () => {
  expect("test").to.equal("test");
  expect(1).to.equal(1);

  if (typeof Symbol === "function") {
    const sym = Symbol();
    expect(sym).to.equal(sym);
  }

  err(() => expect(4).to.equal(3, "blah"), "blah: expected 4 to equal 3");

  err(() => expect(4, "blah").to.equal(3), "blah: expected 4 to equal 3");

  err(() => expect("4").to.equal(4, "blah"), "blah: expected '4' to equal 4");
});

it("deep.equal(val)", () => {
  expect({ foo: "bar" }).to.deep.equal({ foo: "bar" });
  expect({ foo: "bar" }).not.to.deep.equal({ foo: "baz" });

  err(
    () => expect({ foo: "bar" }).to.deep.equal({ foo: "baz" }, "blah"),
    "blah: expected { foo: 'bar' } to deeply equal { foo: 'baz' }"
  );

  err(
    () => expect({ foo: "bar" }, "blah").to.deep.equal({ foo: "baz" }),
    "blah: expected { foo: 'bar' } to deeply equal { foo: 'baz' }"
  );

  err(
    () => expect({ foo: "bar" }).to.not.deep.equal({ foo: "bar" }, "blah"),
    "blah: expected { foo: 'bar' } to not deeply equal { foo: 'bar' }"
  );

  err(
    () => expect({ foo: "bar" }, "blah").to.not.deep.equal({ foo: "bar" }),
    "blah: expected { foo: 'bar' } to not deeply equal { foo: 'bar' }"
  );
});

it("deep.equal(/regexp/)", () => {
  expect(/a/).to.deep.equal(/a/);
  expect(/a/).not.to.deep.equal(/b/);
  expect(/a/).not.to.deep.equal({});
  expect(/a/g).to.deep.equal(/a/g);
  expect(/a/g).not.to.deep.equal(/b/g);
  expect(/a/i).to.deep.equal(/a/i);
  expect(/a/i).not.to.deep.equal(/b/i);
  expect(/a/m).to.deep.equal(/a/m);
  expect(/a/m).not.to.deep.equal(/b/m);
});

it("deep.equal(Date)", () => {
  const a = new Date(1, 2, 3),
    b = new Date(4, 5, 6);
  expect(a).to.deep.equal(a);
  expect(a).not.to.deep.equal(b);
  expect(a).not.to.deep.equal({});
});

it("deep.equal(Symbol)", () => {
  const symb = Symbol("a");
  const a = { [symb]: "b" },
    b = { [symb]: "b" };
  expect(a).to.deep.equal(a);
  expect(a).to.deep.equal(b);

  const symb2 = Symbol("c");
  const c = { [symb]: { [symb2]: "c" } },
    d = { [symb]: { [symb2]: "b" } };
  expect(c).to.deep.equal(c);
  expect(d).to.not.deep.equal(c);

  const symb3 = Symbol("d");
  const e = { [symb]: { [symb3]: "b" } };
  expect(d).to.not.deep.equal(e);

  const f = { [symb]: { [symb3]: "b" } };
  expect(e).to.deep.equal(f);
});

it("empty", () => {
  function FakeArgs() {}
  FakeArgs.prototype.length = 0;

  expect("").to.be.empty;
  expect("foo").not.to.be.empty;
  expect([]).to.be.empty;
  expect(["foo"]).not.to.be.empty;
  expect(new FakeArgs()).to.be.empty;
  expect({ arguments: 0 }).not.to.be.empty;
  expect({}).to.be.empty;
  expect({ foo: "bar" }).not.to.be.empty;

  if (typeof WeakMap === "function") {
    err(
      () => expect(new WeakMap(), "blah").not.to.be.empty,
      "blah: .empty was passed a weak collection"
    );
  }

  if (typeof WeakSet === "function") {
    err(
      () => expect(new WeakSet(), "blah").not.to.be.empty,
      "blah: .empty was passed a weak collection"
    );
  }

  if (typeof Map === "function") {
    expect(new Map()).to.be.empty;

    // Not using Map constructor args because not supported in IE 11.
    var map = new Map();
    map.set("a", 1);
    expect(map).not.to.be.empty;

    err(
      () => expect(new Map()).not.to.be.empty,
      "expected Map{} not to be empty"
    );

    map = new Map();
    map.key = "val";
    expect(map).to.be.empty;

    err(() => expect(map).not.to.be.empty, "expected Map{} not to be empty");
  }

  if (typeof Set === "function") {
    expect(new Set()).to.be.empty;

    // Not using Set constructor args because not supported in IE 11.
    var set = new Set();
    set.add(1);
    expect(set).not.to.be.empty;

    err(
      () => expect(new Set()).not.to.be.empty,
      "expected Set{} not to be empty"
    );

    set = new Set();
    set.key = "val";
    expect(set).to.be.empty;

    err(() => expect(set).not.to.be.empty, "expected Set{} not to be empty");
  }

  err(
    () => expect("", "blah").not.to.be.empty,
    "blah: expected '' not to be empty"
  );

  err(() => expect("foo").to.be.empty, "expected 'foo' to be empty");

  err(() => expect([]).not.to.be.empty, "expected [] not to be empty");

  err(() => expect(["foo"]).to.be.empty, "expected [ 'foo' ] to be empty");

  err(
    () => expect(new FakeArgs()).not.to.be.empty,
    "expected FakeArgs{} not to be empty"
  );

  err(
    () => expect({ arguments: 0 }).to.be.empty,
    "expected { arguments: +0 } to be empty"
  );

  err(() => expect({}).not.to.be.empty, "expected {} not to be empty");

  err(
    () => expect({ foo: "bar" }).to.be.empty,
    "expected { foo: 'bar' } to be empty"
  );

  err(
    () => expect(null, "blah").to.be.empty,
    "blah: .empty was passed non-string primitive null"
  );

  err(
    () => expect(undefined).to.be.empty,
    ".empty was passed non-string primitive undefined"
  );

  err(
    () => expect().to.be.empty,
    ".empty was passed non-string primitive undefined"
  );

  err(
    () => expect(null).to.not.be.empty,
    ".empty was passed non-string primitive null"
  );

  err(
    () => expect(undefined).to.not.be.empty,
    ".empty was passed non-string primitive undefined"
  );

  err(
    () => expect().to.not.be.empty,
    ".empty was passed non-string primitive undefined"
  );

  err(() => expect(0).to.be.empty, ".empty was passed non-string primitive +0");

  err(() => expect(1).to.be.empty, ".empty was passed non-string primitive 1");

  err(
    () => expect(true).to.be.empty,
    ".empty was passed non-string primitive true"
  );

  err(
    () => expect(false).to.be.empty,
    ".empty was passed non-string primitive false"
  );

  if (typeof Symbol !== "undefined") {
    err(
      () => expect(Symbol()).to.be.empty,
      ".empty was passed non-string primitive Symbol()"
    );

    err(
      () => expect(Symbol.iterator).to.be.empty,
      ".empty was passed non-string primitive Symbol(Symbol.iterator)"
    );
  }

  err(
    () => expect(() => {}, "blah").to.be.empty,
    "blah: .empty was passed a function"
  );

  if (FakeArgs.name === "FakeArgs") {
    err(
      () => expect(FakeArgs).to.be.empty,
      ".empty was passed a function FakeArgs"
    );
  }
});

it("NaN", () => {
  expect(NaN).to.be.NaN;

  expect(undefined).not.to.be.NaN;
  expect(Infinity).not.to.be.NaN;
  expect("foo").not.to.be.NaN;
  expect({}).not.to.be.NaN;
  expect(4).not.to.be.NaN;
  expect([]).not.to.be.NaN;

  err(
    () => expect(NaN, "blah").not.to.be.NaN,
    "blah: expected NaN not to be NaN"
  );

  err(() => expect(undefined).to.be.NaN, "expected undefined to be NaN");

  err(() => expect(Infinity).to.be.NaN, "expected Infinity to be NaN");

  err(() => expect("foo").to.be.NaN, "expected 'foo' to be NaN");

  err(() => expect({}).to.be.NaN, "expected {} to be NaN");

  err(() => expect(4).to.be.NaN, "expected 4 to be NaN");

  err(() => expect([]).to.be.NaN, "expected [] to be NaN");
});

it("finite", () => {
  expect(4).to.be.finite;
  expect(-10).to.be.finite;

  err(
    () => expect(NaN, "blah").to.be.finite,
    "blah: expected NaN to be a finite number"
  );

  err(
    () => expect(Infinity).to.be.finite,
    "expected Infinity to be a finite number"
  );

  err(() => expect("foo").to.be.finite, "expected 'foo' to be a finite number");

  err(() => expect([]).to.be.finite, "expected [] to be a finite number");

  err(() => expect({}).to.be.finite, "expected {} to be a finite number");
});

it("property(name)", () => {
  expect("test").to.have.property("length");
  expect({ a: 1 }).to.have.property("toString");
  expect(4).to.not.have.property("length");

  expect({ "foo.bar": "baz" }).to.have.property("foo.bar");
  expect({ foo: { bar: "baz" } }).to.not.have.property("foo.bar");

  // Properties with the value 'undefined' are still properties
  const obj = { foo: undefined };
  Object.defineProperty(obj, "bar", {
    get: () => {}
  });
  expect(obj).to.have.property("foo");
  expect(obj).to.have.property("bar");

  expect({ "foo.bar[]": "baz" }).to.have.property("foo.bar[]");

  err(
    () => expect("asd").to.have.property("foo"),
    "expected 'asd' to have property 'foo'"
  );

  err(
    () => expect("asd", "blah").to.have.property("foo"),
    "blah: expected 'asd' to have property 'foo'"
  );

  err(
    () => expect({ foo: { bar: "baz" } }).to.have.property("foo.bar"),
    "expected { foo: { bar: 'baz' } } to have property 'foo.bar'"
  );

  err(() => {
    expect({ a: { b: 1 } }).to.have.own.nested.property("a.b");
  }, 'The "nested" and "own" flags cannot be combined.');

  err(() => {
    expect({ a: { b: 1 } }, "blah").to.have.own.nested.property("a.b");
  }, 'blah: The "nested" and "own" flags cannot be combined.');

  err(
    () => expect(null, "blah").to.have.property("a"),
    "blah: Target cannot be null or undefined."
  );

  err(
    () => expect(undefined, "blah").to.have.property("a"),
    "blah: Target cannot be null or undefined."
  );

  err(
    () => expect({ a: 1 }, "blah").to.have.property(null),
    "blah: the argument to property must be a string, number, or symbol"
  );
});

it("property(name, val)", () => {
  expect("test").to.have.property("length", 4);
  expect("asd").to.have.property("constructor", String);
  expect({ a: 1 }).to.have.property("toString", Object.prototype.toString);
  expect("test").to.not.have.property("length", 3);
  expect("test").to.not.have.property("foo", 4);
  expect({ a: { b: 1 } }).to.not.have.property("a", { b: 1 });

  const deepObj = {
    green: { tea: "matcha" },
    teas: ["chai", "matcha", { tea: "konacha" }]
  };
  expect(deepObj).to.have.nested.property("green.tea", "matcha");
  expect(deepObj).to.have.nested.property("teas[1]", "matcha");
  expect(deepObj).to.have.nested.property("teas[2].tea", "konacha");

  expect(deepObj)
    .to.have.property("teas")
    .that.is.an("array")
    .with.nested.property("[2]")
    .that.deep.equals({ tea: "konacha" });

  err(
    () => expect(deepObj).to.have.nested.property("teas[3]"),
    "expected { green: { tea: 'matcha' }, …(1) } to have nested property 'teas[3]'"
  );
  err(
    () => expect(deepObj).to.have.nested.property("teas[3]", "bar"),
    "expected { green: { tea: 'matcha' }, …(1) } to have nested property 'teas[3]'"
  );
  err(
    () => expect(deepObj).to.have.nested.property("teas[3].tea", "bar"),
    "expected { green: { tea: 'matcha' }, …(1) } to have nested property 'teas[3].tea'"
  );

  const arr = [
    ["chai", "matcha", "konacha"],
    [{ tea: "chai" }, { tea: "matcha" }, { tea: "konacha" }]
  ];
  expect(arr).to.have.nested.property("[0][1]", "matcha");
  expect(arr).to.have.nested.property("[1][2].tea", "konacha");
  err(
    () => expect(arr).to.have.nested.property("[2][1]"),
    "expected [ …(2) ] to have nested property '[2][1]'"
  );
  err(
    () => expect(arr).to.have.nested.property("[2][1]", "none"),
    "expected [ …(2) ] to have nested property '[2][1]'"
  );
  err(
    () => expect(arr).to.have.nested.property("[0][3]", "none"),
    "expected [ …(2) ] to have nested property '[0][3]'"
  );

  err(
    () => expect("asd").to.have.property("length", 4, "blah"),
    "blah: expected 'asd' to have property 'length' of 4, but got 3"
  );

  err(
    () => expect("asd", "blah").to.have.property("length", 4),
    "blah: expected 'asd' to have property 'length' of 4, but got 3"
  );

  err(
    () => expect("asd").to.not.have.property("length", 3, "blah"),
    "blah: expected 'asd' to not have property 'length' of 3"
  );

  err(
    () => expect("asd").to.have.property("constructor", Number, "blah"),
    "blah: expected 'asd' to have property 'constructor' of [Function Number], but got [Function String]"
  );

  err(() => {
    expect({ a: { b: 1 } }).to.have.own.nested.property("a.b", 1, "blah");
  }, 'blah: The "nested" and "own" flags cannot be combined.');

  err(() => {
    expect({ a: { b: 1 } }, "blah").to.have.own.nested.property("a.b", 1);
  }, 'blah: The "nested" and "own" flags cannot be combined.');
});

it("deep.property(name, val)", () => {
  const obj = { a: { b: 1 } };
  expect(obj).to.have.deep.property("a", { b: 1 });
  expect(obj).to.not.have.deep.property("a", { b: 7 });
  expect(obj).to.not.have.deep.property("a", { z: 1 });
  expect(obj).to.not.have.deep.property("z", { b: 1 });

  err(
    () => expect(obj).to.have.deep.property("a", { b: 7 }, "blah"),
    "blah: expected { a: { b: 1 } } to have deep property 'a' of { b: 7 }, but got { b: 1 }"
  );

  err(
    () => expect(obj).to.have.deep.property("z", { b: 1 }, "blah"),
    "blah: expected { a: { b: 1 } } to have deep property 'z'"
  );

  err(
    () => expect(obj).to.not.have.deep.property("a", { b: 1 }, "blah"),
    "blah: expected { a: { b: 1 } } to not have deep property 'a' of { b: 1 }"
  );
});

it("own.property(name)", () => {
  expect("test").to.have.own.property("length");
  expect("test").to.have.ownProperty("length");
  expect("test").to.haveOwnProperty("length");
  expect("test").to.not.have.own.property("iDontExist");
  expect("test").to.not.have.ownProperty("iDontExist");
  expect("test").to.not.haveOwnProperty("iDontExist");
  expect({ a: 1 }).to.not.have.own.property("toString");
  expect({ a: 1 }).to.not.have.ownProperty("toString");
  expect({ a: 1 }).to.not.haveOwnProperty("toString");

  expect({ length: 12 }).to.have.own.property("length");
  expect({ length: 12 }).to.have.ownProperty("length");
  expect({ length: 12 }).to.haveOwnProperty("length");
  expect({ length: 12 }).to.not.have.own.property("iDontExist");
  expect({ length: 12 }).to.not.have.ownProperty("iDontExist");
  expect({ length: 12 }).to.not.haveOwnProperty("iDontExist");

  // Chaining property's value
  expect("test")
    .to.have.own.property("length")
    .that.is.a("number");
  expect("test")
    .to.have.ownProperty("length")
    .that.is.a("number");
  expect("test")
    .to.haveOwnProperty("length")
    .that.is.a("number");

  err(
    () => expect({ length: 12 }, "blah").to.have.own.property("iDontExist"),
    "blah: expected { length: 12 } to have own property 'iDontExist'"
  );

  err(
    () => expect({ length: 12 }).to.not.have.own.property("length"),
    "expected { length: 12 } to not have own property 'length'"
  );

  err(
    () => expect({ length: 12 }, "blah").to.have.ownProperty("iDontExist"),
    "blah: expected { length: 12 } to have own property 'iDontExist'"
  );

  err(
    () => expect({ length: 12 }).to.not.have.ownProperty("length"),
    "expected { length: 12 } to not have own property 'length'"
  );

  err(
    () => expect({ length: 12 }, "blah").to.haveOwnProperty("iDontExist"),
    "blah: expected { length: 12 } to have own property 'iDontExist'"
  );

  err(
    () => expect({ length: 12 }).to.not.haveOwnProperty("length"),
    "expected { length: 12 } to not have own property 'length'"
  );
});

it("own.property(name, value)", () => {
  expect("test").to.have.own.property("length", 4);
  expect("test").to.have.ownProperty("length", 4);
  expect("test").to.haveOwnProperty("length", 4);
  expect("test").to.not.have.own.property("length", 1337);
  expect("test").to.not.have.ownProperty("length", 1337);
  expect("test").to.not.haveOwnProperty("length", 1337);
  expect({ a: 1 }).to.not.have.own.property(
    "toString",
    Object.prototype.toString
  );
  expect({ a: 1 }).to.not.have.ownProperty(
    "toString",
    Object.prototype.toString
  );
  expect({ a: 1 }).to.not.haveOwnProperty(
    "toString",
    Object.prototype.toString
  );
  expect({ a: { b: 1 } }).to.not.have.own.property("a", { b: 1 });
  expect({ a: { b: 1 } }).to.not.have.ownProperty("a", { b: 1 });
  expect({ a: { b: 1 } }).to.not.haveOwnProperty("a", { b: 1 });

  expect({ length: 12 }).to.have.own.property("length", 12);
  expect({ length: 12 }).to.have.ownProperty("length", 12);
  expect({ length: 12 }).to.haveOwnProperty("length", 12);
  expect({ length: 12 }).to.not.have.own.property("length", 15);
  expect({ length: 12 }).to.not.have.ownProperty("length", 15);
  expect({ length: 12 }).to.not.haveOwnProperty("length", 15);

  // Chaining property's value
  expect("test")
    .to.have.own.property("length", 4)
    .that.is.a("number");
  expect("test")
    .to.have.ownProperty("length", 4)
    .that.is.a("number");
  expect("test")
    .to.haveOwnProperty("length", 4)
    .that.is.a("number");

  const objNoProto = Object.create(null);
  objNoProto.a = "a";
  expect(objNoProto).to.have.own.property("a");
  expect(objNoProto).to.have.ownProperty("a");
  expect(objNoProto).to.haveOwnProperty("a");

  err(
    () => expect({ length: 12 }).to.have.own.property("iDontExist", 12, "blah"),
    "blah: expected { length: 12 } to have own property 'iDontExist'"
  );

  err(
    () => expect({ length: 12 }, "blah").to.have.own.property("iDontExist", 12),
    "blah: expected { length: 12 } to have own property 'iDontExist'"
  );

  err(
    () => expect({ length: 12 }).to.not.have.own.property("length", 12),
    "expected { length: 12 } to not have own property 'length' of 12"
  );

  err(
    () => expect({ length: 12 }).to.have.own.property("length", 15),
    "expected { length: 12 } to have own property 'length' of 15, but got 12"
  );

  err(
    () => expect({ length: 12 }).to.have.ownProperty("iDontExist", 12, "blah"),
    "blah: expected { length: 12 } to have own property 'iDontExist'"
  );

  err(
    () => expect({ length: 12 }, "blah").to.have.ownProperty("iDontExist", 12),
    "blah: expected { length: 12 } to have own property 'iDontExist'"
  );

  err(
    () => expect({ length: 12 }).to.not.have.ownProperty("length", 12),
    "expected { length: 12 } to not have own property 'length' of 12"
  );

  err(
    () => expect({ length: 12 }).to.have.ownProperty("length", 15),
    "expected { length: 12 } to have own property 'length' of 15, but got 12"
  );

  err(
    () => expect({ length: 12 }).to.haveOwnProperty("iDontExist", 12, "blah"),
    "blah: expected { length: 12 } to have own property 'iDontExist'"
  );

  err(
    () => expect({ length: 12 }, "blah").to.haveOwnProperty("iDontExist", 12),
    "blah: expected { length: 12 } to have own property 'iDontExist'"
  );

  err(
    () => expect({ length: 12 }).to.not.haveOwnProperty("length", 12),
    "expected { length: 12 } to not have own property 'length' of 12"
  );

  err(
    () => expect({ length: 12 }).to.haveOwnProperty("length", 15),
    "expected { length: 12 } to have own property 'length' of 15, but got 12"
  );
});

it("deep.own.property(name, val)", () => {
  const obj = { a: { b: 1 } };
  expect(obj).to.have.deep.own.property("a", { b: 1 });
  expect(obj).to.have.deep.ownProperty("a", { b: 1 });
  expect(obj).to.deep.haveOwnProperty("a", { b: 1 });
  expect(obj).to.not.have.deep.own.property("a", { z: 1 });
  expect(obj).to.not.have.deep.ownProperty("a", { z: 1 });
  expect(obj).to.not.deep.haveOwnProperty("a", { z: 1 });
  expect(obj).to.not.have.deep.own.property("a", { b: 7 });
  expect(obj).to.not.have.deep.ownProperty("a", { b: 7 });
  expect(obj).to.not.deep.haveOwnProperty("a", { b: 7 });
  expect(obj).to.not.have.deep.own.property(
    "toString",
    Object.prototype.toString
  );
  expect(obj).to.not.have.deep.ownProperty(
    "toString",
    Object.prototype.toString
  );
  expect(obj).to.not.deep.haveOwnProperty(
    "toString",
    Object.prototype.toString
  );

  err(
    () => expect(obj).to.have.deep.own.property("a", { z: 7 }, "blah"),
    "blah: expected { a: { b: 1 } } to have deep own property 'a' of { z: 7 }, but got { b: 1 }"
  );

  err(
    () => expect(obj).to.have.deep.own.property("z", { b: 1 }, "blah"),
    "blah: expected { a: { b: 1 } } to have deep own property 'z'"
  );

  err(
    () => expect(obj).to.not.have.deep.own.property("a", { b: 1 }, "blah"),
    "blah: expected { a: { b: 1 } } to not have deep own property 'a' of { b: 1 }"
  );

  err(
    () => expect(obj).to.have.deep.ownProperty("a", { z: 7 }, "blah"),
    "blah: expected { a: { b: 1 } } to have deep own property 'a' of { z: 7 }, but got { b: 1 }"
  );

  err(
    () => expect(obj).to.have.deep.ownProperty("z", { b: 1 }, "blah"),
    "blah: expected { a: { b: 1 } } to have deep own property 'z'"
  );

  err(
    () => expect(obj).to.not.have.deep.ownProperty("a", { b: 1 }, "blah"),
    "blah: expected { a: { b: 1 } } to not have deep own property 'a' of { b: 1 }"
  );

  err(
    () => expect(obj).to.deep.haveOwnProperty("a", { z: 7 }, "blah"),
    "blah: expected { a: { b: 1 } } to have deep own property 'a' of { z: 7 }, but got { b: 1 }"
  );

  err(
    () => expect(obj).to.deep.haveOwnProperty("z", { b: 1 }, "blah"),
    "blah: expected { a: { b: 1 } } to have deep own property 'z'"
  );

  err(
    () => expect(obj).to.not.deep.haveOwnProperty("a", { b: 1 }, "blah"),
    "blah: expected { a: { b: 1 } } to not have deep own property 'a' of { b: 1 }"
  );
});

it("nested.property(name)", () => {
  expect({ "foo.bar": "baz" }).to.not.have.nested.property("foo.bar");
  expect({ foo: { bar: "baz" } }).to.have.nested.property("foo.bar");

  expect({ foo: [1, 2, 3] }).to.have.nested.property("foo[1]");

  expect({ "foo.bar[]": "baz" }).to.have.nested.property("foo\\.bar\\[\\]");

  err(
    () => expect({ "foo.bar": "baz" }).to.have.nested.property("foo.bar"),
    "expected { 'foo.bar': 'baz' } to have nested property 'foo.bar'"
  );

  err(
    () => expect({ a: 1 }, "blah").to.have.nested.property({ a: "1" }),
    "blah: the argument to property must be a string when using nested syntax"
  );
});

it("nested.property(name, val)", () => {
  expect({ foo: { bar: "baz" } }).to.have.nested.property("foo.bar", "baz");
  expect({ foo: { bar: "baz" } }).to.not.have.nested.property(
    "foo.bar",
    "quux"
  );
  expect({ foo: { bar: "baz" } }).to.not.have.nested.property(
    "foo.quux",
    "baz"
  );
  expect({ a: { b: { c: 1 } } }).to.not.have.nested.property("a.b", { c: 1 });

  err(() => {
    expect({ foo: { bar: "baz" } }).to.have.nested.property(
      "foo.bar",
      "quux",
      "blah"
    );
  }, "blah: expected { foo: { bar: 'baz' } } to have nested property 'foo.bar' of 'quux', but got 'baz'");
  err(() => {
    expect({ foo: { bar: "baz" } }).to.not.have.nested.property(
      "foo.bar",
      "baz",
      "blah"
    );
  }, "blah: expected { foo: { bar: 'baz' } } to not have nested property 'foo.bar' of 'baz'");
});

it("deep.nested.property(name, val)", () => {
  const obj = { a: { b: { c: 1 } } };
  expect(obj).to.have.deep.nested.property("a.b", { c: 1 });
  expect(obj).to.not.have.deep.nested.property("a.b", { c: 7 });
  expect(obj).to.not.have.deep.nested.property("a.b", { z: 1 });
  expect(obj).to.not.have.deep.nested.property("a.z", { c: 1 });

  err(
    () => expect(obj).to.have.deep.nested.property("a.b", { c: 7 }, "blah"),
    "blah: expected { a: { b: { c: 1 } } } to have deep nested property 'a.b' of { c: 7 }, but got { c: 1 }"
  );

  err(
    () => expect(obj).to.have.deep.nested.property("a.z", { c: 1 }, "blah"),
    "blah: expected { a: { b: { c: 1 } } } to have deep nested property 'a.z'"
  );

  err(
    () => expect(obj).to.not.have.deep.nested.property("a.b", { c: 1 }, "blah"),
    "blah: expected { a: { b: { c: 1 } } } to not have deep nested property 'a.b' of { c: 1 }"
  );
});

it("ownPropertyDescriptor(name)", () => {
  expect("test").to.have.ownPropertyDescriptor("length");
  expect("test").to.haveOwnPropertyDescriptor("length");
  expect("test").not.to.have.ownPropertyDescriptor("foo");

  const obj = {};
  const descriptor = {
    configurable: false,
    enumerable: true,
    writable: true,
    value: NaN
  };
  Object.defineProperty(obj, "test", descriptor);
  expect(obj).to.have.ownPropertyDescriptor("test", descriptor);

  err(() => {
    expect(obj).not.to.have.ownPropertyDescriptor("test", descriptor, "blah");
  }, /^blah: expected the own property descriptor for 'test' on \{ test: NaN \} to not match \{ [^\}]+ \}$/);

  err(() => {
    expect(obj, "blah").not.to.have.ownPropertyDescriptor("test", descriptor);
  }, /^blah: expected the own property descriptor for 'test' on \{ test: NaN \} to not match \{ [^\}]+ \}$/);

  err(() => {
    const wrongDescriptor = {
      configurable: false,
      enumerable: true,
      writable: false,
      value: NaN
    };
    expect(obj).to.have.ownPropertyDescriptor("test", wrongDescriptor, "blah");
  }, /^blah: expected the own property descriptor for 'test' on \{ test: NaN \} to match \{ [^\}]+ \}, got \{ [^\}]+ \}$/);

  err(
    () => expect(obj).to.have.ownPropertyDescriptor("test2", "blah"),
    "blah: expected { test: NaN } to have an own property descriptor for 'test2'"
  );

  err(
    () => expect(obj, "blah").to.have.ownPropertyDescriptor("test2"),
    "blah: expected { test: NaN } to have an own property descriptor for 'test2'"
  );

  expect(obj)
    .to.have.ownPropertyDescriptor("test")
    .and.have.property("enumerable");
});

it("string()", () => {
  expect("foobar").to.have.string("bar");
  expect("foobar").to.have.string("foo");
  expect("foobar").to.not.have.string("baz");

  err(
    () => expect(3).to.have.string("baz", "blah"),
    "blah: expected 3 to be a string"
  );

  err(
    () => expect(3, "blah").to.have.string("baz"),
    "blah: expected 3 to be a string"
  );

  err(
    () => expect("foobar").to.have.string("baz", "blah"),
    "blah: expected 'foobar' to contain 'baz'"
  );

  err(
    () => expect("foobar", "blah").to.have.string("baz"),
    "blah: expected 'foobar' to contain 'baz'"
  );

  err(
    () => expect("foobar").to.not.have.string("bar", "blah"),
    "blah: expected 'foobar' to not contain 'bar'"
  );
});

it("include()", () => {
  expect(["foo", "bar"]).to.include("foo");
  expect(["foo", "bar"]).to.include("foo");
  expect(["foo", "bar"]).to.include("bar");
  expect([1, 2]).to.include(1);
  expect(["foo", "bar"]).to.not.include("baz");
  expect(["foo", "bar"]).to.not.include(1);

  expect({ a: 1 }).to.include({ toString: Object.prototype.toString });

  // .include should work with Error objects and objects with a custom
  // `@@toStringTag`.
  expect(new Error("foo")).to.include({ message: "foo" });
  if (
    typeof Symbol !== "undefined" &&
    typeof Symbol.toStringTag !== "undefined"
  ) {
    const customObj = { a: 1 };
    customObj[Symbol.toStringTag] = "foo";

    expect(customObj).to.include({ a: 1 });
  }

  const obj1 = { a: 1 },
    obj2 = { b: 2 };
  expect([obj1, obj2]).to.include(obj1);
  expect([obj1, obj2]).to.not.include({ a: 1 });
  expect({ foo: obj1, bar: obj2 }).to.include({ foo: obj1 });
  expect({ foo: obj1, bar: obj2 }).to.include({ foo: obj1, bar: obj2 });
  expect({ foo: obj1, bar: obj2 }).to.not.include({ foo: { a: 1 } });
  expect({ foo: obj1, bar: obj2 }).to.not.include({ foo: obj1, bar: { b: 2 } });

  if (typeof Map === "function") {
    const map = new Map();
    const val = [{ a: 1 }];
    map.set("a", val);
    map.set("b", 2);
    map.set("c", -0);
    map.set("d", NaN);

    expect(map).to.include(val);
    expect(map).to.not.include([{ a: 1 }]);
    expect(map).to.include(2);
    expect(map).to.not.include(3);
    expect(map).to.include(0);
    expect(map).to.include(NaN);
  }

  if (typeof Set === "function") {
    const set = new Set();
    const val = [{ a: 1 }];
    set.add(val);
    set.add(2);
    set.add(-0);
    set.add(NaN);

    expect(set).to.include(val);
    expect(set).to.not.include([{ a: 1 }]);
    expect(set).to.include(2);
    expect(set).to.not.include(3);
    if (set.has(0)) {
      // This test is skipped in IE11 because (contrary to spec) IE11 uses
      // SameValue instead of SameValueZero equality for sets.
      expect(set).to.include(0);
    }
    expect(set).to.include(NaN);
  }

  if (typeof WeakSet === "function") {
    const ws = new WeakSet();
    const val = [{ a: 1 }];
    ws.add(val);

    expect(ws).to.include(val);
    expect(ws).to.not.include([{ a: 1 }]);
    expect(ws).to.not.include({});
  }

  if (typeof Symbol === "function") {
    const sym1 = Symbol(),
      sym2 = Symbol(),
      sym3 = Symbol();
    expect([sym1, sym2]).to.include(sym1);
    expect([sym1, sym2]).to.not.include(sym3);
  }

  err(
    () => expect(["foo"]).to.include("bar", "blah"),
    "blah: expected [ 'foo' ] to include 'bar'"
  );

  err(
    () => expect(["foo"], "blah").to.include("bar"),
    "blah: expected [ 'foo' ] to include 'bar'"
  );

  err(
    () => expect(["bar", "foo"]).to.not.include("foo", "blah"),
    "blah: expected [ 'bar', 'foo' ] to not include 'foo'"
  );

  err(
    () => expect({ a: 1 }).to.include({ b: 2 }, "blah"),
    "blah: expected { a: 1 } to have property 'b'"
  );

  err(
    () => expect({ a: 1 }, "blah").to.include({ b: 2 }),
    "blah: expected { a: 1 } to have property 'b'"
  );

  err(
    () => expect({ a: 1, b: 2 }).to.not.include({ b: 2 }),
    "expected { a: 1, b: 2 } to not have property 'b' of 2"
  );

  err(
    () => expect([{ a: 1 }, { b: 2 }]).to.include({ a: 1 }),
    "expected [ { a: 1 }, { b: 2 } ] to include { a: 1 }"
  );

  err(() => {
    const obj1 = { a: 1 },
      obj2 = { b: 2 };
    expect([obj1, obj2]).to.not.include(obj1);
  }, "expected [ { a: 1 }, { b: 2 } ] to not include { a: 1 }");

  err(
    () =>
      expect({ foo: { a: 1 }, bar: { b: 2 } }).to.include({ foo: { a: 1 } }),
    "expected { foo: { a: 1 }, bar: { b: 2 } } to have property 'foo' of { a: 1 }, but got { a: 1 }"
  );

  err(() => {
    const obj1 = { a: 1 },
      obj2 = { b: 2 };
    expect({ foo: obj1, bar: obj2 }).to.not.include({ foo: obj1, bar: obj2 });
  }, "expected { foo: { a: 1 }, bar: { b: 2 } } to not have property 'foo' of { a: 1 }");

  err(
    () => expect(true).to.include(true, "blah"),
    "blah: the given combination of arguments (boolean and boolean) is invalid for this assertion. " +
      "You can use an array, a map, an object, a set, a string, or a weakset instead of a boolean"
  );

  err(
    () => expect(true, "blah").to.include(true),
    "blah: the given combination of arguments (boolean and boolean) is invalid for this assertion. " +
      "You can use an array, a map, an object, a set, a string, or a weakset instead of a boolean"
  );

  err(
    () => expect(42.0).to.include(42),
    "the given combination of arguments (number and number) is invalid for this assertion. " +
      "You can use an array, a map, an object, a set, a string, or a weakset instead of a number"
  );

  err(
    () => expect(null).to.include(42),
    "the given combination of arguments (null and number) is invalid for this assertion. " +
      "You can use an array, a map, an object, a set, a string, or a weakset instead of a number"
  );

  err(
    () => expect(undefined).to.include(42),
    "the given combination of arguments (undefined and number) is invalid for this assertion. " +
      "You can use an array, a map, an object, a set, a string, or a weakset instead of a number"
  );

  err(
    () => expect(true).to.not.include(true),
    "the given combination of arguments (boolean and boolean) is invalid for this assertion. " +
      "You can use an array, a map, an object, a set, a string, or a weakset instead of a boolean"
  );

  err(
    () => expect(42.0).to.not.include(42),
    "the given combination of arguments (number and number) is invalid for this assertion. " +
      "You can use an array, a map, an object, a set, a string, or a weakset instead of a number"
  );

  err(
    () => expect(null).to.not.include(42),
    "the given combination of arguments (null and number) is invalid for this assertion. " +
      "You can use an array, a map, an object, a set, a string, or a weakset instead of a number"
  );

  err(
    () => expect(undefined).to.not.include(42),
    "the given combination of arguments (undefined and number) is invalid for this assertion. " +
      "You can use an array, a map, an object, a set, a string, or a weakset instead of a number"
  );
});

it("deep.include()", () => {
  const obj1 = { a: 1 },
    obj2 = { b: 2 };
  expect([obj1, obj2]).to.deep.include({ a: 1 });
  expect([obj1, obj2]).to.not.deep.include({ a: 9 });
  expect([obj1, obj2]).to.not.deep.include({ z: 1 });
  expect({ foo: obj1, bar: obj2 }).to.deep.include({ foo: { a: 1 } });
  expect({ foo: obj1, bar: obj2 }).to.deep.include({
    foo: { a: 1 },
    bar: { b: 2 }
  });
  expect({ foo: obj1, bar: obj2 }).to.not.deep.include({ foo: { a: 9 } });
  expect({ foo: obj1, bar: obj2 }).to.not.deep.include({ foo: { z: 1 } });
  expect({ foo: obj1, bar: obj2 }).to.not.deep.include({ baz: { a: 1 } });
  expect({ foo: obj1, bar: obj2 }).to.not.deep.include({
    foo: { a: 1 },
    bar: { b: 9 }
  });

  if (typeof Map === "function") {
    const map = new Map();
    map.set(1, [{ a: 1 }]);

    expect(map).to.deep.include([{ a: 1 }]);
  }

  if (typeof Set === "function") {
    const set = new Set();
    set.add([{ a: 1 }]);

    expect(set).to.deep.include([{ a: 1 }]);
  }

  if (typeof WeakSet === "function") {
    err(
      () => expect(new WeakSet()).to.deep.include({}, "foo"),
      "foo: unable to use .deep.include with WeakSet"
    );
  }

  err(
    () => expect([obj1, obj2]).to.deep.include({ a: 9 }, "blah"),
    "blah: expected [ { a: 1 }, { b: 2 } ] to deep include { a: 9 }"
  );

  err(
    () => expect([obj1, obj2], "blah").to.deep.include({ a: 9 }),
    "blah: expected [ { a: 1 }, { b: 2 } ] to deep include { a: 9 }"
  );

  err(
    () => expect([obj1, obj2], "blah").to.not.deep.include({ a: 1 }),
    "blah: expected [ { a: 1 }, { b: 2 } ] to not deep include { a: 1 }"
  );

  err(() => {
    expect({ foo: obj1, bar: obj2 }).to.deep.include({
      foo: { a: 1 },
      bar: { b: 9 }
    });
  }, "expected { foo: { a: 1 }, bar: { b: 2 } } to have deep property 'bar' of { b: 9 }, but got { b: 2 }");

  err(() => {
    expect({ foo: obj1, bar: obj2 }).to.not.deep.include(
      { foo: { a: 1 }, bar: { b: 2 } },
      "blah"
    );
  }, "blah: expected { foo: { a: 1 }, bar: { b: 2 } } to not have deep property 'foo' of { a: 1 }");
});

it("nested.include()", () => {
  expect({ a: { b: ["x", "y"] } }).to.nested.include({ "a.b[1]": "y" });
  expect({ a: { b: ["x", "y"] } }).to.not.nested.include({ "a.b[1]": "x" });
  expect({ a: { b: ["x", "y"] } }).to.not.nested.include({ "a.c": "y" });

  expect({ a: { b: [{ x: 1 }] } }).to.not.nested.include({
    "a.b[0]": { x: 1 }
  });

  expect({ ".a": { "[b]": "x" } }).to.nested.include({ "\\.a.\\[b\\]": "x" });
  expect({ ".a": { "[b]": "x" } }).to.not.nested.include({
    "\\.a.\\[b\\]": "y"
  });

  err(() => {
    expect({ a: { b: ["x", "y"] } }).to.nested.include(
      { "a.b[1]": "x" },
      "blah"
    );
  }, "blah: expected { a: { b: [ 'x', 'y' ] } } to have nested property 'a.b[1]' of 'x', but got 'y'");

  err(() => {
    expect({ a: { b: ["x", "y"] } }, "blah").to.nested.include({
      "a.b[1]": "x"
    });
  }, "blah: expected { a: { b: [ 'x', 'y' ] } } to have nested property 'a.b[1]' of 'x', but got 'y'");

  err(
    () => expect({ a: { b: ["x", "y"] } }).to.nested.include({ "a.c": "y" }),
    "expected { a: { b: [ 'x', 'y' ] } } to have nested property 'a.c'"
  );

  err(() => {
    expect({ a: { b: ["x", "y"] } }).to.not.nested.include(
      { "a.b[1]": "y" },
      "blah"
    );
  }, "blah: expected { a: { b: [ 'x', 'y' ] } } to not have nested property 'a.b[1]' of 'y'");

  err(() => {
    expect({ a: { b: ["x", "y"] } }, "blah").to.not.nested.include({
      "a.b[1]": "y"
    });
  }, "blah: expected { a: { b: [ 'x', 'y' ] } } to not have nested property 'a.b[1]' of 'y'");
});

it("deep.nested.include()", () => {
  expect({ a: { b: [{ x: 1 }] } }).to.deep.nested.include({
    "a.b[0]": { x: 1 }
  });
  expect({ a: { b: [{ x: 1 }] } }).to.not.deep.nested.include({
    "a.b[0]": { y: 2 }
  });
  expect({ a: { b: [{ x: 1 }] } }).to.not.deep.nested.include({
    "a.c": { x: 1 }
  });

  expect({ ".a": { "[b]": { x: 1 } } }).to.deep.nested.include({
    "\\.a.\\[b\\]": { x: 1 }
  });
  expect({ ".a": { "[b]": { x: 1 } } }).to.not.deep.nested.include({
    "\\.a.\\[b\\]": { y: 2 }
  });

  err(() => {
    expect({ a: { b: [{ x: 1 }] } }).to.deep.nested.include(
      { "a.b[0]": { y: 2 } },
      "blah"
    );
  }, "blah: expected { a: { b: [ { x: 1 } ] } } to have deep nested property 'a.b[0]' of { y: 2 }, but got { x: 1 }");

  err(() => {
    expect({ a: { b: [{ x: 1 }] } }, "blah").to.deep.nested.include({
      "a.b[0]": { y: 2 }
    });
  }, "blah: expected { a: { b: [ { x: 1 } ] } } to have deep nested property 'a.b[0]' of { y: 2 }, but got { x: 1 }");

  err(() => {
    expect({ a: { b: [{ x: 1 }] } }).to.deep.nested.include({
      "a.c": { x: 1 }
    });
  }, "expected { a: { b: [ { x: 1 } ] } } to have deep nested property 'a.c'");

  err(() => {
    expect({ a: { b: [{ x: 1 }] } }).to.not.deep.nested.include(
      { "a.b[0]": { x: 1 } },
      "blah"
    );
  }, "blah: expected { a: { b: [ { x: 1 } ] } } to not have deep nested property 'a.b[0]' of { x: 1 }");

  err(() => {
    expect({ a: { b: [{ x: 1 }] } }, "blah").to.not.deep.nested.include({
      "a.b[0]": { x: 1 }
    });
  }, "blah: expected { a: { b: [ { x: 1 } ] } } to not have deep nested property 'a.b[0]' of { x: 1 }");
});

it("own.include()", () => {
  expect({ a: 1 }).to.own.include({ a: 1 });
  expect({ a: 1 }).to.not.own.include({ a: 3 });
  expect({ a: 1 }).to.not.own.include({ toString: Object.prototype.toString });

  expect({ a: { b: 2 } }).to.not.own.include({ a: { b: 2 } });

  err(
    () => expect({ a: 1 }).to.own.include({ a: 3 }, "blah"),
    "blah: expected { a: 1 } to have own property 'a' of 3, but got 1"
  );

  err(
    () => expect({ a: 1 }, "blah").to.own.include({ a: 3 }),
    "blah: expected { a: 1 } to have own property 'a' of 3, but got 1"
  );

  err(
    () =>
      expect({ a: 1 }).to.own.include({ toString: Object.prototype.toString }),
    "expected { a: 1 } to have own property 'toString'"
  );

  err(
    () => expect({ a: 1 }).to.not.own.include({ a: 1 }, "blah"),
    "blah: expected { a: 1 } to not have own property 'a' of 1"
  );

  err(
    () => expect({ a: 1 }, "blah").to.not.own.include({ a: 1 }),
    "blah: expected { a: 1 } to not have own property 'a' of 1"
  );
});

it("deep.own.include()", () => {
  expect({ a: { b: 2 } }).to.deep.own.include({ a: { b: 2 } });
  expect({ a: { b: 2 } }).to.not.deep.own.include({ a: { c: 3 } });
  expect({ a: { b: 2 } }).to.not.deep.own.include({
    toString: Object.prototype.toString
  });

  err(
    () => expect({ a: { b: 2 } }).to.deep.own.include({ a: { c: 3 } }, "blah"),
    "blah: expected { a: { b: 2 } } to have deep own property 'a' of { c: 3 }, but got { b: 2 }"
  );

  err(
    () => expect({ a: { b: 2 } }, "blah").to.deep.own.include({ a: { c: 3 } }),
    "blah: expected { a: { b: 2 } } to have deep own property 'a' of { c: 3 }, but got { b: 2 }"
  );

  err(() => {
    expect({ a: { b: 2 } }).to.deep.own.include({
      toString: Object.prototype.toString
    });
  }, "expected { a: { b: 2 } } to have deep own property 'toString'");

  err(
    () =>
      expect({ a: { b: 2 } }).to.not.deep.own.include({ a: { b: 2 } }, "blah"),
    "blah: expected { a: { b: 2 } } to not have deep own property 'a' of { b: 2 }"
  );

  err(
    () =>
      expect({ a: { b: 2 } }, "blah").to.not.deep.own.include({ a: { b: 2 } }),
    "blah: expected { a: { b: 2 } } to not have deep own property 'a' of { b: 2 }"
  );
});

it("keys(array|Object|arguments)", () => {
  expect({ foo: 1 }).to.have.keys(["foo"]);
  expect({ foo: 1 }).have.keys({ foo: 6 });
  expect({ foo: 1, bar: 2 }).to.have.keys(["foo", "bar"]);
  expect({ foo: 1, bar: 2 }).to.have.keys("foo", "bar");
  expect({ foo: 1, bar: 2 }).have.keys({ foo: 6, bar: 7 });
  expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys("foo", "bar");
  expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys("bar", "foo");
  expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys("baz");
  expect({ foo: 1, bar: 2 }).contain.keys({ foo: 6 });
  expect({ foo: 1, bar: 2 }).contain.keys({ bar: 7 });
  expect({ foo: 1, bar: 2 }).contain.keys({ foo: 6 });

  expect({ foo: 1, bar: 2 }).to.contain.keys("foo");
  expect({ foo: 1, bar: 2 }).to.contain.keys("bar", "foo");
  expect({ foo: 1, bar: 2 }).to.contain.keys(["foo"]);
  expect({ foo: 1, bar: 2 }).to.contain.keys(["bar"]);
  expect({ foo: 1, bar: 2 }).to.contain.keys(["bar", "foo"]);
  expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys(["bar", "foo"]);

  expect({ foo: 1, bar: 2 }).to.not.have.keys("baz");
  expect({ foo: 1, bar: 2 }).to.not.have.keys("foo");
  expect({ foo: 1, bar: 2 }).to.not.have.keys("foo", "baz");
  expect({ foo: 1, bar: 2 }).to.not.contain.keys("baz");
  expect({ foo: 1, bar: 2 }).to.not.contain.keys("foo", "baz");
  expect({ foo: 1, bar: 2 }).to.not.contain.keys("baz", "foo");

  expect({ foo: 1, bar: 2 }).to.have.any.keys("foo", "baz");
  expect({ foo: 1, bar: 2 }).to.have.any.keys("foo");
  expect({ foo: 1, bar: 2 }).to.contain.any.keys("bar", "baz");
  expect({ foo: 1, bar: 2 }).to.contain.any.keys(["foo"]);
  expect({ foo: 1, bar: 2 }).to.have.all.keys(["bar", "foo"]);
  expect({ foo: 1, bar: 2 }).to.contain.all.keys(["bar", "foo"]);
  expect({ foo: 1, bar: 2 }).contain.any.keys({ foo: 6 });
  expect({ foo: 1, bar: 2 }).have.all.keys({ foo: 6, bar: 7 });
  expect({ foo: 1, bar: 2 }).contain.all.keys({ bar: 7, foo: 6 });

  expect({ foo: 1, bar: 2 }).to.not.have.any.keys("baz", "abc", "def");
  expect({ foo: 1, bar: 2 }).to.not.have.any.keys("baz");
  expect({ foo: 1, bar: 2 }).to.not.contain.any.keys("baz");
  expect({ foo: 1, bar: 2 }).to.not.have.all.keys(["baz", "foo"]);
  expect({ foo: 1, bar: 2 }).to.not.contain.all.keys(["baz", "foo"]);
  expect({ foo: 1, bar: 2 }).not.have.all.keys({ baz: 8, foo: 7 });
  expect({ foo: 1, bar: 2 }).not.contain.all.keys({ baz: 8, foo: 7 });

  const enumProp1 = "enumProp1",
    enumProp2 = "enumProp2",
    nonEnumProp = "nonEnumProp",
    obj = {};

  obj[enumProp1] = "enumProp1";
  obj[enumProp2] = "enumProp2";

  Object.defineProperty(obj, nonEnumProp, {
    enumerable: false,
    value: "nonEnumProp"
  });

  expect(obj).to.have.all.keys([enumProp1, enumProp2]);
  expect(obj).to.not.have.all.keys([enumProp1, enumProp2, nonEnumProp]);

  if (typeof Symbol === "function") {
    const sym1 = Symbol("sym1"),
      sym2 = Symbol("sym2"),
      sym3 = Symbol("sym3"),
      str = "str",
      obj = {};

    obj[sym1] = "sym1";
    obj[sym2] = "sym2";
    obj[str] = "str";

    Object.defineProperty(obj, sym3, {
      enumerable: false,
      value: "sym3"
    });

    expect(obj).to.have.all.keys([sym1, sym2, str]);
    expect(obj).to.not.have.all.keys([sym1, sym2, sym3, str]);
  }

  if (typeof Map !== "undefined") {
    // Not using Map constructor args because not supported in IE 11.
    const aKey = { thisIs: "anExampleObject" },
      anotherKey = { doingThisBecauseOf: "referential equality" },
      testMap = new Map();

    testMap.set(aKey, "aValue");
    testMap.set(anotherKey, "anotherValue");

    expect(testMap).to.have.any.keys(aKey);
    expect(testMap).to.have.any.keys("thisDoesNotExist", "thisToo", aKey);
    expect(testMap).to.have.all.keys(aKey, anotherKey);

    expect(testMap).to.contain.all.keys(aKey);
    expect(testMap).to.not.contain.all.keys(aKey, "thisDoesNotExist");

    expect(testMap).to.not.have.any.keys({ iDoNot: "exist" });
    expect(testMap).to.not.have.any.keys(
      "thisIsNotAkey",
      { iDoNot: "exist" },
      { 33: 20 }
    );
    expect(testMap).to.not.have.all.keys(
      "thisDoesNotExist",
      "thisToo",
      anotherKey
    );

    expect(testMap).to.have.any.keys([aKey]);
    expect(testMap).to.have.any.keys([20, 1, aKey]);
    expect(testMap).to.have.all.keys([aKey, anotherKey]);

    expect(testMap).to.not.have.any.keys([
      { 13: 37 },
      "thisDoesNotExist",
      "thisToo"
    ]);
    expect(testMap).to.not.have.any.keys([20, 1, { 13: 37 }]);
    expect(testMap).to.not.have.all.keys([aKey, { iDoNot: "exist" }]);

    // Ensure the assertions above use strict equality
    err(() => expect(testMap).to.have.any.keys({ thisIs: "anExampleObject" }));

    err(() => {
      expect(testMap).to.have.all.keys(
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      );
    });

    err(() =>
      expect(testMap).to.contain.all.keys({ thisIs: "anExampleObject" })
    );

    err(() =>
      expect(testMap).to.have.any.keys([{ thisIs: "anExampleObject" }])
    );

    err(() => {
      expect(testMap).to.have.all.keys([
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      ]);
    });

    // Using the same assertions as above but with `.deep` flag instead of using referential equality
    expect(testMap).to.have.any.deep.keys({ thisIs: "anExampleObject" });
    expect(testMap).to.have.any.deep.keys("thisDoesNotExist", "thisToo", {
      thisIs: "anExampleObject"
    });

    expect(testMap).to.contain.all.deep.keys({ thisIs: "anExampleObject" });
    expect(testMap).to.not.contain.all.deep.keys(
      { thisIs: "anExampleObject" },
      "thisDoesNotExist"
    );

    expect(testMap).to.not.have.any.deep.keys({ iDoNot: "exist" });
    expect(testMap).to.not.have.any.deep.keys(
      "thisIsNotAkey",
      { iDoNot: "exist" },
      { 33: 20 }
    );
    expect(testMap).to.not.have.all.deep.keys("thisDoesNotExist", "thisToo", {
      doingThisBecauseOf: "referential equality"
    });

    expect(testMap).to.have.any.deep.keys([{ thisIs: "anExampleObject" }]);
    expect(testMap).to.have.any.deep.keys([
      20,
      1,
      { thisIs: "anExampleObject" }
    ]);

    expect(testMap).to.have.all.deep.keys(
      { thisIs: "anExampleObject" },
      { doingThisBecauseOf: "referential equality" }
    );

    expect(testMap).to.not.have.any.deep.keys([
      { 13: 37 },
      "thisDoesNotExist",
      "thisToo"
    ]);
    expect(testMap).to.not.have.any.deep.keys([20, 1, { 13: 37 }]);
    expect(testMap).to.not.have.all.deep.keys([
      { thisIs: "anExampleObject" },
      { iDoNot: "exist" }
    ]);

    const weirdMapKey1 = Object.create(null),
      weirdMapKey2 = { toString: NaN },
      weirdMapKey3 = [],
      weirdMap = new Map();

    weirdMap.set(weirdMapKey1, "val1");
    weirdMap.set(weirdMapKey2, "val2");

    expect(weirdMap).to.have.all.keys([weirdMapKey1, weirdMapKey2]);
    expect(weirdMap).to.not.have.all.keys([weirdMapKey1, weirdMapKey3]);

    if (typeof Symbol === "function") {
      const symMapKey1 = Symbol(),
        symMapKey2 = Symbol(),
        symMapKey3 = Symbol(),
        symMap = new Map();

      symMap.set(symMapKey1, "val1");
      symMap.set(symMapKey2, "val2");

      expect(symMap).to.have.all.keys(symMapKey1, symMapKey2);
      expect(symMap).to.have.any.keys(symMapKey1, symMapKey3);
      expect(symMap).to.contain.all.keys(symMapKey2, symMapKey1);
      expect(symMap).to.contain.any.keys(symMapKey3, symMapKey1);

      expect(symMap).to.not.have.all.keys(symMapKey1, symMapKey3);
      expect(symMap).to.not.have.any.keys(symMapKey3);
      expect(symMap).to.not.contain.all.keys(symMapKey3, symMapKey1);
      expect(symMap).to.not.contain.any.keys(symMapKey3);
    }

    const errMap = new Map();

    errMap.set({ foo: 1 });

    err(() => expect(errMap, "blah").to.have.keys(), "blah: keys required");

    err(() => expect(errMap).to.have.keys([]), "keys required");

    err(() => expect(errMap).to.contain.keys(), "keys required");

    err(() => expect(errMap).to.contain.keys([]), "keys required");

    // Uncomment this after solving https://github.com/chaijs/chai/issues/662
    // This should fail because of referential equality (this is a strict comparison)
    // err(function(){
    //   expect(new Map([[{foo: 1}, 'bar']])).to.contain.keys({ foo: 1 });
    // }, 'expected [ [ { foo: 1 }, 'bar' ] ] to contain key { foo: 1 }');

    // err(function(){
    //   expect(new Map([[{foo: 1}, 'bar']])).to.contain.deep.keys({ iDoNotExist: 0 })
    // }, 'expected [ { foo: 1 } ] to deeply contain key { iDoNotExist: 0 }');
  }

  if (typeof Set !== "undefined") {
    // Not using Set constructor args because not supported in IE 11.
    const aKey = { thisIs: "anExampleObject" },
      anotherKey = { doingThisBecauseOf: "referential equality" },
      testSet = new Set();

    testSet.add(aKey);
    testSet.add(anotherKey);

    expect(testSet).to.have.any.keys(aKey);
    expect(testSet).to.have.any.keys("thisDoesNotExist", "thisToo", aKey);
    expect(testSet).to.have.all.keys(aKey, anotherKey);

    expect(testSet).to.contain.all.keys(aKey);
    expect(testSet).to.not.contain.all.keys(aKey, "thisDoesNotExist");

    expect(testSet).to.not.have.any.keys({ iDoNot: "exist" });
    expect(testSet).to.not.have.any.keys(
      "thisIsNotAkey",
      { iDoNot: "exist" },
      { 33: 20 }
    );
    expect(testSet).to.not.have.all.keys(
      "thisDoesNotExist",
      "thisToo",
      anotherKey
    );

    expect(testSet).to.have.any.keys([aKey]);
    expect(testSet).to.have.any.keys([20, 1, aKey]);
    expect(testSet).to.have.all.keys([aKey, anotherKey]);

    expect(testSet).to.not.have.any.keys([
      { 13: 37 },
      "thisDoesNotExist",
      "thisToo"
    ]);
    expect(testSet).to.not.have.any.keys([20, 1, { 13: 37 }]);
    expect(testSet).to.not.have.all.keys([aKey, { iDoNot: "exist" }]);

    // Ensure the assertions above use strict equality
    err(() => expect(testSet).to.have.any.keys({ thisIs: "anExampleObject" }));

    err(() => {
      expect(testSet).to.have.all.keys(
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      );
    });

    err(() =>
      expect(testSet).to.contain.all.keys({ thisIs: "anExampleObject" })
    );

    err(() =>
      expect(testSet).to.have.any.keys([{ thisIs: "anExampleObject" }])
    );

    err(() => {
      expect(testSet).to.have.all.keys([
        { thisIs: "anExampleObject" },
        { doingThisBecauseOf: "referential equality" }
      ]);
    });

    // Using the same assertions as above but with `.deep` flag instead of using referential equality
    expect(testSet).to.have.any.deep.keys({ thisIs: "anExampleObject" });
    expect(testSet).to.have.any.deep.keys("thisDoesNotExist", "thisToo", {
      thisIs: "anExampleObject"
    });

    expect(testSet).to.contain.all.deep.keys({ thisIs: "anExampleObject" });
    expect(testSet).to.not.contain.all.deep.keys(
      { thisIs: "anExampleObject" },
      "thisDoesNotExist"
    );

    expect(testSet).to.not.have.any.deep.keys({ iDoNot: "exist" });
    expect(testSet).to.not.have.any.deep.keys(
      "thisIsNotAkey",
      { iDoNot: "exist" },
      { 33: 20 }
    );
    expect(testSet).to.not.have.all.deep.keys("thisDoesNotExist", "thisToo", {
      doingThisBecauseOf: "referential equality"
    });

    expect(testSet).to.have.any.deep.keys([{ thisIs: "anExampleObject" }]);
    expect(testSet).to.have.any.deep.keys([
      20,
      1,
      { thisIs: "anExampleObject" }
    ]);

    expect(testSet).to.have.all.deep.keys([
      { thisIs: "anExampleObject" },
      { doingThisBecauseOf: "referential equality" }
    ]);

    expect(testSet).to.not.have.any.deep.keys([
      { 13: 37 },
      "thisDoesNotExist",
      "thisToo"
    ]);
    expect(testSet).to.not.have.any.deep.keys([20, 1, { 13: 37 }]);
    expect(testSet).to.not.have.all.deep.keys([
      { thisIs: "anExampleObject" },
      { iDoNot: "exist" }
    ]);

    const weirdSetKey1 = Object.create(null),
      weirdSetKey2 = { toString: NaN },
      weirdSetKey3 = [],
      weirdSet = new Set();

    weirdSet.add(weirdSetKey1);
    weirdSet.add(weirdSetKey2);

    expect(weirdSet).to.have.all.keys([weirdSetKey1, weirdSetKey2]);
    expect(weirdSet).to.not.have.all.keys([weirdSetKey1, weirdSetKey3]);

    if (typeof Symbol === "function") {
      const symSetKey1 = Symbol(),
        symSetKey2 = Symbol(),
        symSetKey3 = Symbol(),
        symSet = new Set();

      symSet.add(symSetKey1);
      symSet.add(symSetKey2);

      expect(symSet).to.have.all.keys(symSetKey1, symSetKey2);
      expect(symSet).to.have.any.keys(symSetKey1, symSetKey3);
      expect(symSet).to.contain.all.keys(symSetKey2, symSetKey1);
      expect(symSet).to.contain.any.keys(symSetKey3, symSetKey1);

      expect(symSet).to.not.have.all.keys(symSetKey1, symSetKey3);
      expect(symSet).to.not.have.any.keys(symSetKey3);
      expect(symSet).to.not.contain.all.keys(symSetKey3, symSetKey1);
      expect(symSet).to.not.contain.any.keys(symSetKey3);
    }

    const errSet = new Set();
    errSet.add({ foo: 1 });

    err(() => expect(errSet, "blah").to.have.keys(), "blah: keys required");

    err(() => expect(errSet).to.have.keys([]), "keys required");

    err(() => expect(errSet).to.contain.keys(), "keys required");

    err(() => expect(errSet).to.contain.keys([]), "keys required");

    // Uncomment this after solving https://github.com/chaijs/chai/issues/662
    // This should fail because of referential equality (this is a strict comparison)
    // err(function(){
    //   expect(new Set([{foo: 1}])).to.contain.keys({ foo: 1 });
    // }, 'expected [ { foo: 1 } ] to deeply contain key { foo: 1 }');

    // err(function(){
    //   expect(new Set([{foo: 1}])).to.contain.deep.keys({ iDoNotExist: 0 });
    // }, 'expected [ { foo: 1 } ] to deeply contain key { iDoNotExist: 0 }');
  }

  err(() => expect({ foo: 1 }, "blah").to.have.keys(), "blah: keys required");

  err(() => expect({ foo: 1 }).to.have.keys([]), "keys required");

  err(() => expect({ foo: 1 }).to.not.have.keys([]), "keys required");

  err(() => expect({ foo: 1 }).to.contain.keys([]), "keys required");

  const mixedArgsMsg =
    "blah: when testing keys against an object or an array you must give a single Array|Object|String argument or multiple String arguments";

  err(() => {
    expect({}, "blah").contain.keys(["a"], "b");
  }, mixedArgsMsg);

  err(() => {
    expect({}, "blah").contain.keys({ a: 1 }, "b");
  }, mixedArgsMsg);

  err(
    () => expect({ foo: 1 }, "blah").to.have.keys(["bar"]),
    "blah: expected { foo: 1 } to have key 'bar'"
  );

  err(
    () => expect({ foo: 1 }).to.have.keys(["bar", "baz"]),
    "expected { foo: 1 } to have keys 'bar', and 'baz'"
  );

  err(
    () => expect({ foo: 1 }).to.have.keys(["foo", "bar", "baz"]),
    "expected { foo: 1 } to have keys 'foo', 'bar', and 'baz'"
  );

  err(
    () => expect({ foo: 1 }).to.not.have.keys(["foo"]),
    "expected { foo: 1 } to not have key 'foo'"
  );

  err(
    () => expect({ foo: 1 }).to.not.have.keys(["foo"]),
    "expected { foo: 1 } to not have key 'foo'"
  );

  err(
    () => expect({ foo: 1, bar: 2 }).to.not.have.keys(["foo", "bar"]),
    "expected { foo: 1, bar: 2 } to not have keys 'foo', and 'bar'"
  );

  err(
    () => expect({ foo: 1, bar: 2 }).to.have.all.keys("foo"),
    "expected { foo: 1, bar: 2 } to have key 'foo'"
  );

  err(
    () => expect({ foo: 1 }).to.not.contain.keys(["foo"]),
    "expected { foo: 1 } to not contain key 'foo'"
  );

  err(
    () => expect({ foo: 1 }).to.contain.keys("foo", "bar"),
    "expected { foo: 1 } to contain keys 'foo', and 'bar'"
  );

  err(
    () => expect({ foo: 1 }).to.have.any.keys("baz"),
    "expected { foo: 1 } to have key 'baz'"
  );

  err(
    () => expect({ foo: 1, bar: 2 }).to.not.have.all.keys(["foo", "bar"]),
    "expected { foo: 1, bar: 2 } to not have keys 'foo', and 'bar'"
  );

  err(
    () => expect({ foo: 1, bar: 2 }).to.not.have.any.keys(["foo", "baz"]),
    "expected { foo: 1, bar: 2 } to not have keys 'foo', or 'baz'"
  );

  // repeat previous tests with Object as arg.
  err(
    () => expect({ foo: 1 }, "blah").have.keys({ bar: 1 }),
    "blah: expected { foo: 1 } to have key 'bar'"
  );

  err(
    () => expect({ foo: 1 }).have.keys({ bar: 1, baz: 1 }),
    "expected { foo: 1 } to have keys 'bar', and 'baz'"
  );

  err(
    () => expect({ foo: 1 }).have.keys({ foo: 1, bar: 1, baz: 1 }),
    "expected { foo: 1 } to have keys 'foo', 'bar', and 'baz'"
  );

  err(
    () => expect({ foo: 1 }).not.have.keys({ foo: 1 }),
    "expected { foo: 1 } to not have key 'foo'"
  );

  err(
    () => expect({ foo: 1 }).not.have.keys({ foo: 1 }),
    "expected { foo: 1 } to not have key 'foo'"
  );

  err(
    () => expect({ foo: 1, bar: 2 }).not.have.keys({ foo: 1, bar: 1 }),
    "expected { foo: 1, bar: 2 } to not have keys 'foo', and 'bar'"
  );

  err(
    () => expect({ foo: 1 }).not.contain.keys({ foo: 1 }),
    "expected { foo: 1 } to not contain key 'foo'"
  );

  err(
    () => expect({ foo: 1 }).contain.keys("foo", "bar"),
    "expected { foo: 1 } to contain keys 'foo', and 'bar'"
  );

  err(
    () => expect({ foo: 1 }).have.any.keys("baz"),
    "expected { foo: 1 } to have key 'baz'"
  );

  err(
    () => expect({ foo: 1, bar: 2 }).not.have.all.keys({ foo: 1, bar: 1 }),
    "expected { foo: 1, bar: 2 } to not have keys 'foo', and 'bar'"
  );

  err(
    () => expect({ foo: 1, bar: 2 }).not.have.any.keys({ foo: 1, baz: 1 }),
    "expected { foo: 1, bar: 2 } to not have keys 'foo', or 'baz'"
  );
});

it("keys(array) will not mutate array (#359)", () => {
  const expected = ["b", "a"];
  const original_order = ["b", "a"];
  const obj = { b: 1, a: 1 };
  expect(expected).deep.equal(original_order);
  expect(obj).keys(original_order);
  expect(expected).deep.equal(original_order);
});

it("chaining", () => {
  const tea = { name: "chai", extras: ["milk", "sugar", "smile"] };
  expect(tea)
    .to.have.property("extras")
    .with.lengthOf(3);

  expect(tea)
    .to.have.property("extras")
    .which.contains("smile");

  err(
    () =>
      expect(tea)
        .to.have.property("extras")
        .with.lengthOf(4),
    "expected [ 'milk', 'sugar', 'smile' ] to have a length of 4 but got 3"
  );

  expect(tea)
    .to.be.a("object")
    .and.have.property("name", "chai");

  const badFn = () => {
    throw new Error("testing");
  };

  expect(badFn)
    .to.throw(Error)
    .with.property("message", "testing");
});

it("throw", function() {
  // See GH-45: some poorly-constructed custom errors don't have useful names
  // on either their constructor or their constructor prototype, but instead
  // only set the name inside the constructor itself.
  var PoorlyConstructedError = function() {
    this.name = "PoorlyConstructedError";
  };
  PoorlyConstructedError.prototype = Object.create(Error.prototype);

  function CustomError(message) {
    this.name = "CustomError";
    this.message = message;
  }
  CustomError.prototype = Error.prototype;

  var specificError = new RangeError("boo");

  var goodFn = function() {
      1 == 1;
    },
    badFn = function() {
      throw new Error("testing");
    },
    refErrFn = function() {
      throw new ReferenceError("hello");
    },
    ickyErrFn = function() {
      throw new PoorlyConstructedError();
    },
    specificErrFn = function() {
      throw specificError;
    },
    customErrFn = function() {
      throw new CustomError("foo");
    },
    emptyErrFn = function() {
      throw new Error();
    },
    emptyStringErrFn = function() {
      throw new Error("");
    };

  expect(goodFn).to.not.throw();
  expect(goodFn).to.not.throw(Error);
  expect(goodFn).to.not.throw(specificError);
  expect(badFn).to.throw();
  expect(badFn).to.throw(Error);
  expect(badFn).to.not.throw(ReferenceError);
  expect(badFn).to.not.throw(specificError);
  expect(refErrFn).to.throw();
  expect(refErrFn).to.throw(ReferenceError);
  expect(refErrFn).to.throw(Error);
  expect(refErrFn).to.not.throw(TypeError);
  expect(refErrFn).to.not.throw(specificError);
  expect(ickyErrFn).to.throw();
  expect(ickyErrFn).to.throw(PoorlyConstructedError);
  expect(ickyErrFn).to.throw(Error);
  expect(ickyErrFn).to.not.throw(specificError);
  expect(specificErrFn).to.throw(specificError);

  expect(goodFn).to.not.throw("testing");
  expect(goodFn).to.not.throw(/testing/);
  expect(badFn).to.throw(/testing/);
  expect(badFn).to.not.throw(/hello/);
  expect(badFn).to.throw("testing");
  expect(badFn).to.not.throw("hello");
  expect(emptyStringErrFn).to.throw("");
  expect(emptyStringErrFn).to.not.throw("testing");
  expect(badFn).to.throw("");

  expect(badFn).to.throw(Error, /testing/);
  expect(badFn).to.throw(Error, "testing");
  expect(emptyErrFn).to.not.throw(Error, "testing");

  expect(badFn).to.not.throw(Error, "I am the wrong error message");
  expect(badFn).to.not.throw(TypeError, "testing");

  err(() => {
    expect(goodFn, "blah").to.throw();
  }, /^blah: expected \[Function( goodFn)*\] to throw an error$/);

  err(() => {
    expect(goodFn, "blah").to.throw(ReferenceError);
  }, /^blah: expected \[Function( goodFn)*\] to throw ReferenceError$/);

  err(() => {
    expect(goodFn, "blah").to.throw(specificError);
  }, /^blah: expected \[Function( goodFn)*\] to throw 'RangeError: boo'$/);

  err(() => {
    expect(badFn, "blah").to.not.throw();
  }, /^blah: expected \[Function( badFn)*\] to not throw an error but 'Error: testing' was thrown$/);

  err(() => {
    expect(badFn, "blah").to.throw(ReferenceError);
  }, /^blah: expected \[Function( badFn)*\] to throw 'ReferenceError' but 'Error: testing' was thrown$/);

  err(() => {
    expect(badFn, "blah").to.throw(specificError);
  }, /^blah: expected \[Function( badFn)*\] to throw 'RangeError: boo' but 'Error: testing' was thrown$/);

  err(() => {
    expect(badFn, "blah").to.not.throw(Error);
  }, /^blah: expected \[Function( badFn)*\] to not throw 'Error' but 'Error: testing' was thrown$/);

  err(() => {
    expect(refErrFn, "blah").to.not.throw(ReferenceError);
  }, /^blah: expected \[Function( refErrFn)*\] to not throw 'ReferenceError' but 'ReferenceError: hello' was thrown$/);

  err(() => {
    expect(badFn, "blah").to.throw(PoorlyConstructedError);
  }, /^blah: expected \[Function( badFn)*\] to throw 'PoorlyConstructedError' but 'Error: testing' was thrown$/);

  err(() => {
    expect(ickyErrFn, "blah").to.not.throw(PoorlyConstructedError);
  }, /^blah: (expected \[Function( ickyErrFn)*\] to not throw 'PoorlyConstructedError' but)(.*)(PoorlyConstructedError|\{ Object \()(.*)(was thrown)$/);

  err(() => {
    expect(ickyErrFn, "blah").to.throw(ReferenceError);
  }, /^blah: (expected \[Function( ickyErrFn)*\] to throw 'ReferenceError' but)(.*)(PoorlyConstructedError|\{ Object \()(.*)(was thrown)$/);

  err(() => {
    expect(specificErrFn, "blah").to.throw(new ReferenceError("eek"));
  }, /^blah: expected \[Function( specificErrFn)*\] to throw 'ReferenceError: eek' but 'RangeError: boo' was thrown$/);

  err(() => {
    expect(specificErrFn, "blah").to.not.throw(specificError);
  }, /^blah: expected \[Function( specificErrFn)*\] to not throw 'RangeError: boo'$/);

  err(() => {
    expect(badFn, "blah").to.not.throw(/testing/);
  }, /^blah: expected \[Function( badFn)*\] to throw error not matching \/testing\/$/);

  err(() => {
    expect(badFn, "blah").to.throw(/hello/);
  }, /^blah: expected \[Function( badFn)*\] to throw error matching \/hello\/ but got 'testing'$/);

  err(() => {
    expect(badFn).to.throw(Error, /hello/, "blah");
  }, /^blah: expected \[Function( badFn)*\] to throw error matching \/hello\/ but got 'testing'$/);

  err(() => {
    expect(badFn, "blah").to.throw(Error, /hello/);
  }, /^blah: expected \[Function( badFn)*\] to throw error matching \/hello\/ but got 'testing'$/);

  err(() => {
    expect(badFn).to.throw(Error, "hello", "blah");
  }, /^blah: expected \[Function( badFn)*\] to throw error including 'hello' but got 'testing'$/);

  err(() => {
    expect(badFn, "blah").to.throw(Error, "hello");
  }, /^blah: expected \[Function( badFn)*\] to throw error including 'hello' but got 'testing'$/);

  err(() => {
    expect(customErrFn, "blah").to.not.throw();
  }, /^blah: expected \[Function( customErrFn)*\] to not throw an error but 'CustomError: foo' was thrown$/);

  err(() => {
    expect(badFn).to.not.throw(Error, "testing", "blah");
  }, /^blah: expected \[Function( badFn)*\] to not throw 'Error' but 'Error: testing' was thrown$/);

  err(() => {
    expect(badFn, "blah").to.not.throw(Error, "testing");
  }, /^blah: expected \[Function( badFn)*\] to not throw 'Error' but 'Error: testing' was thrown$/);

  err(() => {
    expect(emptyStringErrFn).to.not.throw(Error, "", "blah");
  }, /^blah: expected \[Function( emptyStringErrFn)*\] to not throw 'Error' but 'Error' was thrown$/);

  err(() => {
    expect(emptyStringErrFn, "blah").to.not.throw(Error, "");
  }, /^blah: expected \[Function( emptyStringErrFn)*\] to not throw 'Error' but 'Error' was thrown$/);

  err(() => {
    expect(emptyStringErrFn, "blah").to.not.throw("");
  }, /^blah: expected \[Function( emptyStringErrFn)*\] to throw error not including ''$/);

  err(
    () => expect({}, "blah").to.throw(),
    "blah: expected {} to be a function"
  );

  err(
    () => expect({}).to.throw(Error, "testing", "blah"),
    "blah: expected {} to be a function"
  );
});

it("respondTo", () => {
  function Foo() {}
  Foo.prototype.bar = () => {};
  Foo.func = () => {};

  const bar = {};
  bar.foo = () => {};

  expect(Foo).to.respondTo("bar");
  expect(Foo).to.not.respondTo("foo");
  expect(Foo).itself.to.respondTo("func");
  expect(Foo).itself.not.to.respondTo("bar");

  expect(bar).to.respondTo("foo");

  err(() => {
    expect(Foo).to.respondTo("baz", "constructor");
  }, /^(constructor: expected)(.*)(\[Function Foo\])(.*)(to respond to \'baz\')$/);

  err(() => {
    expect(Foo, "constructor").to.respondTo("baz");
  }, /^(constructor: expected)(.*)(\[Function Foo\])(.*)(to respond to \'baz\')$/);

  err(() => {
    expect(bar).to.respondTo("baz", "object");
  }, /^(object: expected)(.*)(\{ foo: \[Function\] \}|\{ Object \()(.*)(to respond to \'baz\')$/);

  err(() => {
    expect(bar, "object").to.respondTo("baz");
  }, /^(object: expected)(.*)(\{ foo: \[Function\] \}|\{ Object \()(.*)(to respond to \'baz\')$/);
});

it("satisfy", () => {
  const matcher = function(num) {
    return num === 1;
  };

  expect(1).to.satisfy(matcher);

  err(() => {
    expect(2).to.satisfy(matcher, "blah");
  }, /^blah: expected 2 to satisfy \[Function( matcher)*\]$/);

  err(() => {
    expect(2, "blah").to.satisfy(matcher);
  }, /^blah: expected 2 to satisfy \[Function( matcher)*\]$/);
});

it("closeTo", () => {
  expect(1.5).to.be.closeTo(1.0, 0.5);
  expect(10).to.be.closeTo(20, 20);
  expect(-10).to.be.closeTo(20, 30);

  err(
    () => expect(2).to.be.closeTo(1.0, 0.5, "blah"),
    "blah: expected 2 to be close to 1 +/- 0.5"
  );

  err(
    () => expect(2, "blah").to.be.closeTo(1.0, 0.5),
    "blah: expected 2 to be close to 1 +/- 0.5"
  );

  err(
    () => expect(-10).to.be.closeTo(20, 29, "blah"),
    "blah: expected -10 to be close to 20 +/- 29"
  );

  err(
    () => expect([1.5]).to.be.closeTo(1.0, 0.5, "blah"),
    "blah: expected [ 1.5 ] to be a number"
  );

  err(
    () => expect([1.5], "blah").to.be.closeTo(1.0, 0.5),
    "blah: expected [ 1.5 ] to be a number"
  );

  err(
    () => expect(1.5).to.be.closeTo("1.0", 0.5, "blah"),
    "blah: the arguments to closeTo or approximately must be numbers"
  );

  err(
    () => expect(1.5, "blah").to.be.closeTo("1.0", 0.5),
    "blah: the arguments to closeTo or approximately must be numbers"
  );

  err(
    () => expect(1.5).to.be.closeTo(1.0, true, "blah"),
    "blah: the arguments to closeTo or approximately must be numbers"
  );

  err(
    () => expect(1.5, "blah").to.be.closeTo(1.0, true),
    "blah: the arguments to closeTo or approximately must be numbers"
  );

  err(
    () => expect(1.5, "blah").to.be.closeTo(1.0),
    "blah: the arguments to closeTo or approximately must be numbers, and a delta is required"
  );
});

it("approximately", () => {
  expect(1.5).to.be.approximately(1.0, 0.5);
  expect(10).to.be.approximately(20, 20);
  expect(-10).to.be.approximately(20, 30);

  err(
    () => expect(2).to.be.approximately(1.0, 0.5, "blah"),
    "blah: expected 2 to be close to 1 +/- 0.5"
  );

  err(
    () => expect(-10).to.be.approximately(20, 29, "blah"),
    "blah: expected -10 to be close to 20 +/- 29"
  );

  err(
    () => expect([1.5]).to.be.approximately(1.0, 0.5),
    "expected [ 1.5 ] to be a number"
  );

  err(
    () => expect(1.5).to.be.approximately("1.0", 0.5),
    "the arguments to closeTo or approximately must be numbers"
  );

  err(
    () => expect(1.5).to.be.approximately(1.0, true),
    "the arguments to closeTo or approximately must be numbers"
  );

  err(
    () => expect(1.5).to.be.approximately(1.0),
    "the arguments to closeTo or approximately must be numbers, and a delta is required"
  );
});

it("oneOf", () => {
  expect(1).to.be.oneOf([1, 2, 3]);
  expect("1").to.not.be.oneOf([1, 2, 3]);
  expect([3, [4]]).to.not.be.oneOf([1, 2, [3, 4]]);
  const threeFour = [3, [4]];
  expect(threeFour).to.be.oneOf([1, 2, threeFour]);
  expect([]).to.be.deep.oneOf([[], ""]);

  expect([1, 2]).to.contain.oneOf([4, 2, 5]);
  expect([3, 4]).to.not.contain.oneOf([2, 1, 5]);

  expect("The quick brown fox jumps over the lazy dog").to.contain.oneOf([
    "cat",
    "dog",
    "bird"
  ]);
  expect("The quick brown fox jumps over the lazy dog").to.not.contain.oneOf([
    "elephant",
    "pigeon",
    "lynx"
  ]);

  err(
    () => expect(1).to.be.oneOf([2, 3], "blah"),
    "blah: expected 1 to be one of [ 2, 3 ]"
  );

  err(
    () => expect(1, "blah").to.be.oneOf([2, 3]),
    "blah: expected 1 to be one of [ 2, 3 ]"
  );

  err(
    () => expect(1).to.not.be.oneOf([1, 2, 3], "blah"),
    "blah: expected 1 to not be one of [ 1, 2, 3 ]"
  );

  err(
    () => expect(1, "blah").to.not.be.oneOf([1, 2, 3]),
    "blah: expected 1 to not be one of [ 1, 2, 3 ]"
  );

  err(
    () => expect(1).to.be.oneOf({}, "blah"),
    "blah: expected {} to be an array"
  );

  err(
    () => expect(1, "blah").to.be.oneOf({}),
    "blah: expected {} to be an array"
  );
});

it("include.members", () => {
  expect([1, 2, 3]).to.include.members([]);
  expect([1, 2, 3]).to.include.members([3, 2]);
  expect([1, 2, 3]).to.include.members([3, 2, 2]);
  expect([1, 2, 3]).to.not.include.members([8, 4]);
  expect([1, 2, 3]).to.not.include.members([1, 2, 3, 4]);
  expect([{ a: 1 }]).to.not.include.members([{ a: 1 }]);

  err(
    () => expect([1, 2, 3]).to.include.members([2, 5], "blah"),
    "blah: expected [ 1, 2, 3 ] to be a superset of [ 2, 5 ]"
  );

  err(
    () => expect([1, 2, 3], "blah").to.include.members([2, 5]),
    "blah: expected [ 1, 2, 3 ] to be a superset of [ 2, 5 ]"
  );

  err(
    () => expect([1, 2, 3]).to.not.include.members([2, 1]),
    "expected [ 1, 2, 3 ] to not be a superset of [ 2, 1 ]"
  );
});

it("same.members", () => {
  expect([5, 4]).to.have.same.members([4, 5]);
  expect([5, 4]).to.have.same.members([5, 4]);
  expect([5, 4, 4]).to.have.same.members([5, 4, 4]);
  expect([5, 4]).to.not.have.same.members([]);
  expect([5, 4]).to.not.have.same.members([6, 3]);
  expect([5, 4]).to.not.have.same.members([5, 4, 2]);
  expect([5, 4]).to.not.have.same.members([5, 4, 4]);
  expect([5, 4, 4]).to.not.have.same.members([5, 4]);
  expect([5, 4, 4]).to.not.have.same.members([5, 4, 3]);
  expect([5, 4, 3]).to.not.have.same.members([5, 4, 4]);
});

it("members", () => {
  expect([5, 4]).members([4, 5]);
  expect([5, 4]).members([5, 4]);
  expect([5, 4, 4]).members([5, 4, 4]);
  expect([5, 4]).not.members([]);
  expect([5, 4]).not.members([6, 3]);
  expect([5, 4]).not.members([5, 4, 2]);
  expect([5, 4]).not.members([5, 4, 4]);
  expect([5, 4, 4]).not.members([5, 4]);
  expect([5, 4, 4]).not.members([5, 4, 3]);
  expect([5, 4, 3]).not.members([5, 4, 4]);
  expect([{ id: 1 }]).not.members([{ id: 1 }]);

  err(
    () => expect([1, 2, 3]).members([2, 1, 5], "blah"),
    "blah: expected [ 1, 2, 3 ] to have the same members as [ 2, 1, 5 ]"
  );

  err(
    () => expect([1, 2, 3], "blah").members([2, 1, 5]),
    "blah: expected [ 1, 2, 3 ] to have the same members as [ 2, 1, 5 ]"
  );

  err(
    () => expect([1, 2, 3]).not.members([2, 1, 3]),
    "expected [ 1, 2, 3 ] to not have the same members as [ 2, 1, 3 ]"
  );

  err(() => expect({}).members([], "blah"), "blah: expected {} to be an array");

  err(() => expect({}, "blah").members([]), "blah: expected {} to be an array");

  err(() => expect([]).members({}, "blah"), "blah: expected {} to be an array");

  err(() => expect([], "blah").members({}), "blah: expected {} to be an array");
});

it("deep.members", () => {
  expect([{ id: 1 }]).deep.members([{ id: 1 }]);
  expect([{ a: 1 }, { b: 2 }, { b: 2 }]).deep.members([
    { a: 1 },
    { b: 2 },
    { b: 2 }
  ]);

  expect([{ id: 2 }]).not.deep.members([{ id: 1 }]);
  expect([{ a: 1 }, { b: 2 }]).not.deep.members([{ a: 1 }, { b: 2 }, { b: 2 }]);
  expect([{ a: 1 }, { b: 2 }, { b: 2 }]).not.deep.members([{ a: 1 }, { b: 2 }]);
  expect([{ a: 1 }, { b: 2 }, { b: 2 }]).not.deep.members([
    { a: 1 },
    { b: 2 },
    { c: 3 }
  ]);
  expect([{ a: 1 }, { b: 2 }, { c: 3 }]).not.deep.members([
    { a: 1 },
    { b: 2 },
    { b: 2 }
  ]);

  err(
    () => expect([{ id: 1 }]).deep.members([{ id: 2 }], "blah"),
    "blah: expected [ { id: 1 } ] to have the same members as [ { id: 2 } ]"
  );

  err(
    () => expect([{ id: 1 }], "blah").deep.members([{ id: 2 }]),
    "blah: expected [ { id: 1 } ] to have the same members as [ { id: 2 } ]"
  );
});

it("include.deep.members", () => {
  expect([{ a: 1 }, { b: 2 }, { c: 3 }]).include.deep.members([
    { b: 2 },
    { a: 1 }
  ]);
  expect([{ a: 1 }, { b: 2 }, { c: 3 }]).include.deep.members([
    { b: 2 },
    { a: 1 },
    { a: 1 }
  ]);
  expect([{ a: 1 }, { b: 2 }, { c: 3 }]).not.include.deep.members([
    { b: 2 },
    { a: 1 },
    { f: 5 }
  ]);

  err(() => {
    expect([{ a: 1 }, { b: 2 }, { c: 3 }]).include.deep.members(
      [{ b: 2 }, { a: 1 }, { f: 5 }],
      "blah"
    );
  }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to be a superset of [ { b: 2 }, { a: 1 }, { f: 5 } ]");

  err(() => {
    expect([{ a: 1 }, { b: 2 }, { c: 3 }], "blah").include.deep.members([
      { b: 2 },
      { a: 1 },
      { f: 5 }
    ]);
  }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to be a superset of [ { b: 2 }, { a: 1 }, { f: 5 } ]");
});

it("ordered.members", () => {
  expect([1, 2, 3]).ordered.members([1, 2, 3]);
  expect([1, 2, 2]).ordered.members([1, 2, 2]);

  expect([1, 2, 3]).not.ordered.members([2, 1, 3]);
  expect([1, 2, 3]).not.ordered.members([1, 2]);
  expect([1, 2]).not.ordered.members([1, 2, 2]);
  expect([1, 2, 2]).not.ordered.members([1, 2]);
  expect([1, 2, 2]).not.ordered.members([1, 2, 3]);
  expect([1, 2, 3]).not.ordered.members([1, 2, 2]);

  err(
    () => expect([1, 2, 3]).ordered.members([2, 1, 3], "blah"),
    "blah: expected [ 1, 2, 3 ] to have the same ordered members as [ 2, 1, 3 ]"
  );

  err(
    () => expect([1, 2, 3], "blah").ordered.members([2, 1, 3]),
    "blah: expected [ 1, 2, 3 ] to have the same ordered members as [ 2, 1, 3 ]"
  );

  err(
    () => expect([1, 2, 3]).not.ordered.members([1, 2, 3]),
    "expected [ 1, 2, 3 ] to not have the same ordered members as [ 1, 2, 3 ]"
  );
});

it("include.ordered.members", () => {
  expect([1, 2, 3]).include.ordered.members([1, 2]);
  expect([1, 2, 3]).not.include.ordered.members([2, 1]);
  expect([1, 2, 3]).not.include.ordered.members([2, 3]);
  expect([1, 2, 3]).not.include.ordered.members([1, 2, 2]);

  err(
    () => expect([1, 2, 3]).include.ordered.members([2, 1], "blah"),
    "blah: expected [ 1, 2, 3 ] to be an ordered superset of [ 2, 1 ]"
  );

  err(
    () => expect([1, 2, 3], "blah").include.ordered.members([2, 1]),
    "blah: expected [ 1, 2, 3 ] to be an ordered superset of [ 2, 1 ]"
  );

  err(
    () => expect([1, 2, 3]).not.include.ordered.members([1, 2]),
    "expected [ 1, 2, 3 ] to not be an ordered superset of [ 1, 2 ]"
  );
});

it("deep.ordered.members", () => {
  expect([{ a: 1 }, { b: 2 }, { c: 3 }]).deep.ordered.members([
    { a: 1 },
    { b: 2 },
    { c: 3 }
  ]);
  expect([{ a: 1 }, { b: 2 }, { b: 2 }]).deep.ordered.members([
    { a: 1 },
    { b: 2 },
    { b: 2 }
  ]);

  expect([{ a: 1 }, { b: 2 }, { c: 3 }]).not.deep.ordered.members([
    { b: 2 },
    { a: 1 },
    { c: 3 }
  ]);
  expect([{ a: 1 }, { b: 2 }]).not.deep.ordered.members([
    { a: 1 },
    { b: 2 },
    { b: 2 }
  ]);
  expect([{ a: 1 }, { b: 2 }, { b: 2 }]).not.deep.ordered.members([
    { a: 1 },
    { b: 2 }
  ]);
  expect([{ a: 1 }, { b: 2 }, { b: 2 }]).not.deep.ordered.members([
    { a: 1 },
    { b: 2 },
    { c: 3 }
  ]);
  expect([{ a: 1 }, { b: 2 }, { c: 3 }]).not.deep.ordered.members([
    { a: 1 },
    { b: 2 },
    { b: 2 }
  ]);

  err(() => {
    expect([{ a: 1 }, { b: 2 }, { c: 3 }]).deep.ordered.members(
      [{ b: 2 }, { a: 1 }, { c: 3 }],
      "blah"
    );
  }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to have the same ordered members as [ { b: 2 }, { a: 1 }, { c: 3 } ]");

  err(() => {
    expect([{ a: 1 }, { b: 2 }, { c: 3 }], "blah").deep.ordered.members([
      { b: 2 },
      { a: 1 },
      { c: 3 }
    ]);
  }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to have the same ordered members as [ { b: 2 }, { a: 1 }, { c: 3 } ]");

  err(() => {
    expect([{ a: 1 }, { b: 2 }, { c: 3 }]).not.deep.ordered.members([
      { a: 1 },
      { b: 2 },
      { c: 3 }
    ]);
  }, "expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to not have the same ordered members as [ { a: 1 }, { b: 2 }, { c: 3 } ]");
});

it("include.deep.ordered.members", () => {
  expect([{ a: 1 }, { b: 2 }, { c: 3 }]).include.deep.ordered.members([
    { a: 1 },
    { b: 2 }
  ]);
  expect([{ a: 1 }, { b: 2 }, { c: 3 }]).not.include.deep.ordered.members([
    { b: 2 },
    { a: 1 }
  ]);
  expect([{ a: 1 }, { b: 2 }, { c: 3 }]).not.include.deep.ordered.members([
    { b: 2 },
    { c: 3 }
  ]);
  expect([{ a: 1 }, { b: 2 }, { c: 3 }]).not.include.deep.ordered.members([
    { a: 1 },
    { b: 2 },
    { b: 2 }
  ]);

  err(() => {
    expect([{ a: 1 }, { b: 2 }, { c: 3 }]).include.deep.ordered.members(
      [{ b: 2 }, { a: 1 }],
      "blah"
    );
  }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to be an ordered superset of [ { b: 2 }, { a: 1 } ]");

  err(() => {
    expect([{ a: 1 }, { b: 2 }, { c: 3 }], "blah").include.deep.ordered.members(
      [{ b: 2 }, { a: 1 }]
    );
  }, "blah: expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to be an ordered superset of [ { b: 2 }, { a: 1 } ]");

  err(() => {
    expect([{ a: 1 }, { b: 2 }, { c: 3 }]).not.include.deep.ordered.members([
      { a: 1 },
      { b: 2 }
    ]);
  }, "expected [ { a: 1 }, { b: 2 }, { c: 3 } ] to not be an ordered superset of [ { a: 1 }, { b: 2 } ]");
});

it("change", () => {
  const obj = { value: 10, str: "foo" },
    heroes = ["spiderman", "superman"],
    fn = () => (obj.value += 5),
    decFn = () => (obj.value -= 20),
    sameFn = () => "foo" + "bar",
    bangFn = () => (obj.str += "!"),
    batFn = () => heroes.push("batman"),
    lenFn = () => heroes.length;

  expect(fn).to.change(obj, "value");
  expect(fn)
    .to.change(obj, "value")
    .by(5);
  expect(fn)
    .to.change(obj, "value")
    .by(-5);

  expect(decFn)
    .to.change(obj, "value")
    .by(20);
  expect(decFn)
    .to.change(obj, "value")
    .but.not.by(21);

  expect(sameFn).to.not.change(obj, "value");

  expect(sameFn).to.not.change(obj, "str");
  expect(bangFn).to.change(obj, "str");

  expect(batFn)
    .to.change(lenFn)
    .by(1);
  expect(batFn)
    .to.change(lenFn)
    .but.not.by(2);

  err(
    () => expect(sameFn).to.change(obj, "value", "blah"),
    "blah: expected .value to change"
  );

  err(
    () => expect(sameFn, "blah").to.change(obj, "value"),
    "blah: expected .value to change"
  );

  err(
    () => expect(fn).to.not.change(obj, "value", "blah"),
    "blah: expected .value to not change"
  );

  err(
    () => expect({}).to.change(obj, "value", "blah"),
    "blah: expected {} to be a function"
  );

  err(
    () => expect({}, "blah").to.change(obj, "value"),
    "blah: expected {} to be a function"
  );

  err(
    () => expect(fn).to.change({}, "badprop", "blah"),
    "blah: expected {} to have property 'badprop'"
  );

  err(
    () => expect(fn, "blah").to.change({}, "badprop"),
    "blah: expected {} to have property 'badprop'"
  );

  err(
    () => expect(fn, "blah").to.change({}),
    "blah: expected {} to be a function"
  );

  err(
    () =>
      expect(fn)
        .to.change(obj, "value")
        .by(10, "blah"),
    "blah: expected .value to change by 10"
  );

  err(
    () =>
      expect(fn, "blah")
        .to.change(obj, "value")
        .by(10),
    "blah: expected .value to change by 10"
  );

  err(
    () =>
      expect(fn)
        .to.change(obj, "value")
        .but.not.by(5, "blah"),
    "blah: expected .value to not change by 5"
  );
});

it("increase, decrease", () => {
  const obj = { value: 10, noop: null },
    arr = ["one", "two"],
    pFn = () => arr.push("three"),
    popFn = () => arr.pop(),
    nFn = () => null,
    lenFn = () => arr.length,
    incFn = () => (obj.value += 2),
    decFn = () => (obj.value -= 3),
    smFn = () => (obj.value += 0);

  expect(smFn).to.not.increase(obj, "value");
  expect(decFn).to.not.increase(obj, "value");
  expect(incFn).to.increase(obj, "value");
  expect(incFn)
    .to.increase(obj, "value")
    .by(2);
  expect(incFn)
    .to.increase(obj, "value")
    .but.not.by(1);

  expect(smFn).to.not.decrease(obj, "value");
  expect(incFn).to.not.decrease(obj, "value");
  expect(decFn).to.decrease(obj, "value");
  expect(decFn)
    .to.decrease(obj, "value")
    .by(3);
  expect(decFn)
    .to.decrease(obj, "value")
    .but.not.by(2);

  expect(popFn).to.not.increase(lenFn);
  expect(nFn).to.not.increase(lenFn);
  expect(pFn).to.increase(lenFn);
  expect(pFn)
    .to.increase(lenFn)
    .by(1);
  expect(pFn)
    .to.increase(lenFn)
    .but.not.by(2);

  expect(popFn).to.decrease(lenFn);
  expect(popFn)
    .to.decrease(lenFn)
    .by(1);
  expect(popFn)
    .to.decrease(lenFn)
    .but.not.by(2);
  expect(nFn).to.not.decrease(lenFn);
  expect(pFn).to.not.decrease(lenFn);

  err(
    () => expect(smFn).to.increase(obj, "value", "blah"),
    "blah: expected .value to increase"
  );

  err(
    () => expect(smFn, "blah").to.increase(obj, "value"),
    "blah: expected .value to increase"
  );

  err(
    () => expect(incFn).to.not.increase(obj, "value", "blah"),
    "blah: expected .value to not increase"
  );

  err(
    () => expect({}).to.increase(obj, "value", "blah"),
    "blah: expected {} to be a function"
  );

  err(
    () => expect({}, "blah").to.increase(obj, "value"),
    "blah: expected {} to be a function"
  );

  err(
    () => expect(incFn).to.increase({}, "badprop", "blah"),
    "blah: expected {} to have property 'badprop'"
  );

  err(
    () => expect(incFn, "blah").to.increase({}, "badprop"),
    "blah: expected {} to have property 'badprop'"
  );

  err(
    () => expect(incFn, "blah").to.increase({}),
    "blah: expected {} to be a function"
  );

  err(
    () => expect(incFn).to.increase(obj, "noop", "blah"),
    "blah: expected null to be a number"
  );

  err(
    () => expect(incFn, "blah").to.increase(obj, "noop"),
    "blah: expected null to be a number"
  );

  err(
    () =>
      expect(incFn)
        .to.increase(obj, "value")
        .by(10, "blah"),
    "blah: expected .value to increase by 10"
  );

  err(
    () =>
      expect(incFn, "blah")
        .to.increase(obj, "value")
        .by(10),
    "blah: expected .value to increase by 10"
  );

  err(
    () =>
      expect(incFn)
        .to.increase(obj, "value")
        .but.not.by(2, "blah"),
    "blah: expected .value to not increase by 2"
  );

  err(
    () => expect(smFn).to.decrease(obj, "value", "blah"),
    "blah: expected .value to decrease"
  );

  err(
    () => expect(smFn, "blah").to.decrease(obj, "value"),
    "blah: expected .value to decrease"
  );

  err(
    () => expect(decFn).to.not.decrease(obj, "value", "blah"),
    "blah: expected .value to not decrease"
  );

  err(
    () => expect({}).to.decrease(obj, "value", "blah"),
    "blah: expected {} to be a function"
  );

  err(
    () => expect({}, "blah").to.decrease(obj, "value"),
    "blah: expected {} to be a function"
  );

  err(
    () => expect(decFn).to.decrease({}, "badprop", "blah"),
    "blah: expected {} to have property 'badprop'"
  );

  err(
    () => expect(decFn, "blah").to.decrease({}, "badprop"),
    "blah: expected {} to have property 'badprop'"
  );

  err(
    () => expect(decFn, "blah").to.decrease({}),
    "blah: expected {} to be a function"
  );

  err(
    () => expect(decFn).to.decrease(obj, "noop", "blah"),
    "blah: expected null to be a number"
  );

  err(
    () => expect(decFn, "blah").to.decrease(obj, "noop"),
    "blah: expected null to be a number"
  );

  err(
    () =>
      expect(decFn)
        .to.decrease(obj, "value")
        .by(10, "blah"),
    "blah: expected .value to decrease by 10"
  );

  err(
    () =>
      expect(decFn, "blah")
        .to.decrease(obj, "value")
        .by(10),
    "blah: expected .value to decrease by 10"
  );

  err(
    () =>
      expect(decFn)
        .to.decrease(obj, "value")
        .but.not.by(3, "blah"),
    "blah: expected .value to not decrease by 3"
  );
});

it("extensible", () => {
  const nonExtensibleObject = Object.preventExtensions({});

  expect({}).to.be.extensible;
  expect(nonExtensibleObject).to.not.be.extensible;

  err(
    () => expect(nonExtensibleObject, "blah").to.be.extensible,
    "blah: expected {} to be extensible"
  );

  err(
    () => expect({}).to.not.be.extensible,
    "expected {} to not be extensible"
  );

  // Making sure ES6-like Object.isExtensible response is respected for all primitive types

  expect(42).to.not.be.extensible;
  expect(null).to.not.be.extensible;
  expect("foo").to.not.be.extensible;
  expect(false).to.not.be.extensible;
  expect(undefined).to.not.be.extensible;

  if (typeof Symbol === "function") {
    expect(Symbol()).to.not.be.extensible;
  }

  err(() => expect(42).to.be.extensible, "expected 42 to be extensible");

  err(() => expect(null).to.be.extensible, "expected null to be extensible");

  err(() => expect("foo").to.be.extensible, "expected 'foo' to be extensible");

  err(() => expect(false).to.be.extensible, "expected false to be extensible");

  err(
    () => expect(undefined).to.be.extensible,
    "expected undefined to be extensible"
  );

  if (typeof Proxy === "function") {
    const proxy = new Proxy(
      {},
      {
        isExtensible: () => {
          throw new TypeError();
        }
      }
    );

    err(() => expect(proxy).to.be.extensible, { name: "TypeError" });
  }
});

it("sealed", () => {
  const sealedObject = Object.seal({});

  expect(sealedObject).to.be.sealed;
  expect({}).to.not.be.sealed;

  err(() => expect({}, "blah").to.be.sealed, "blah: expected {} to be sealed");

  err(
    () => expect(sealedObject).to.not.be.sealed,
    "expected {} to not be sealed"
  );

  // Making sure ES6-like Object.isSealed response is respected for all primitive types

  expect(42).to.be.sealed;
  expect(null).to.be.sealed;
  expect("foo").to.be.sealed;
  expect(false).to.be.sealed;
  expect(undefined).to.be.sealed;

  if (typeof Symbol === "function") {
    expect(Symbol()).to.be.sealed;
  }

  err(() => expect(42).to.not.be.sealed, "expected 42 to not be sealed");

  err(() => expect(null).to.not.be.sealed, "expected null to not be sealed");

  err(() => expect("foo").to.not.be.sealed, "expected 'foo' to not be sealed");

  err(() => expect(false).to.not.be.sealed, "expected false to not be sealed");

  err(
    () => expect(undefined).to.not.be.sealed,
    "expected undefined to not be sealed"
  );

  if (typeof Proxy === "function") {
    const proxy = new Proxy(
      {},
      {
        ownKeys: () => {
          throw new TypeError();
        }
      }
    );

    // Object.isSealed will call ownKeys trap only if object is not extensible
    Object.preventExtensions(proxy);

    err(
      () => {
        // .sealed should not suppress errors, thrown in proxy traps
        expect(proxy).to.be.sealed;
      },
      { name: "TypeError" }
    );
  }
});

it("frozen", () => {
  const frozenObject = Object.freeze({});

  expect(frozenObject).to.be.frozen;
  expect({}).to.not.be.frozen;

  err(() => expect({}, "blah").to.be.frozen, "blah: expected {} to be frozen");

  err(
    () => expect(frozenObject).to.not.be.frozen,
    "expected {} to not be frozen"
  );

  // Making sure ES6-like Object.isFrozen response is respected for all primitive types

  expect(42).to.be.frozen;
  expect(null).to.be.frozen;
  expect("foo").to.be.frozen;
  expect(false).to.be.frozen;
  expect(undefined).to.be.frozen;

  if (typeof Symbol === "function") {
    expect(Symbol()).to.be.frozen;
  }

  err(() => expect(42).to.not.be.frozen, "expected 42 to not be frozen");

  err(() => expect(null).to.not.be.frozen, "expected null to not be frozen");

  err(() => expect("foo").to.not.be.frozen, "expected 'foo' to not be frozen");

  err(() => expect(false).to.not.be.frozen, "expected false to not be frozen");

  err(
    () => expect(undefined).to.not.be.frozen,
    "expected undefined to not be frozen"
  );

  if (typeof Proxy === "function") {
    const proxy = new Proxy(
      {},
      {
        ownKeys: () => {
          throw new TypeError();
        }
      }
    );

    // Object.isFrozen will call ownKeys trap only if object is not extensible
    Object.preventExtensions(proxy);

    err(
      () => {
        // .frozen should not suppress errors, thrown in proxy traps
        expect(proxy).to.be.frozen;
      },
      { name: "TypeError" }
    );
  }
});

module.exports = {
  name: "chai",
  fn() {
    tests.forEach(test => test.func());
  }
};
