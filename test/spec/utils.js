define(function () {
  'use strict';

  function testExtend(assert, utils) {
    var emptyObject = {},
      obj = Object.create({
        objName: 'obj'
      }),
      baseObject = {
        name: 'baseObject',
        testAttribute: 'A test attribute in baseObject'
      };

    obj.name = 'obj';
    obj.customAttribute = Math.random();

    utils.extend(emptyObject, obj);
    assert.propEqual(emptyObject, obj, 'extend transfers all the attributes from source object');
    assert.notDeepEqual(emptyObject, obj, 'extend doesnt transfer the proto attributes');

    utils.extend(baseObject, obj);
    assert.equal(typeof baseObject.objName, 'undefined', 'extend filters the base prototype object attributes');
    assert.notDeepEqual(baseObject, obj, 'extend doesnt touch the non-shared attributes');
    assert.equal(baseObject.name, 'obj', 'utils.extend overrides the shared attributes');
    assert.equal(baseObject.testAttribute, 'A test attribute in baseObject', 'extend keeps old attributes');
    assert.equal(baseObject.customAttribute, obj.customAttribute, 'extend transfers all the non-shared attributes from the source object');
  }

  function testIsArray(assert, utils) {
    var sampleArray = [],
      arrayLike = arguments;

    assert.equal(utils.isArray(Array.prototype), true, 'isArray detects Array.prototype as an array');
    assert.equal(utils.isArray(sampleArray), true, 'isArray detects real arrays');
    assert.equal(utils.isArray(arrayLike), false, 'isArray dont consider array-likes as an array');
    assert.equal(utils.isArray({}), false, 'isArray detects non-array objects correctly');
    assert.equal(utils.isArray(null), false, 'isArray detects falsy values');
    assert.equal(utils.isArray(undefined), false, 'isArray detects falsy values');
    assert.equal(utils.isArray(), false, 'isArray detects falsy values');
  }

  function testIsFunction(assert, utils) {
    assert.equal(utils.isFunction(Function.prototype), true, 'isFunction works for any function');
    assert.equal(utils.isFunction(Function), true, 'isFunction works for any function');
    assert.equal(utils.isFunction(utils.isFunction), true, 'isFunction works for any function');
    assert.equal(utils.isFunction(testIsFunction), true, 'isFunction works for any function');
    assert.equal(utils.isFunction(function () {}), true, 'isFunction works for any function');

    assert.equal(utils.isFunction(1), false, 'isFunction detects primitive values:Number');
    assert.equal(utils.isFunction(''), false, 'isFunction detects primitive values:String');
    assert.equal(utils.isFunction(true), false, 'isFunction detects primitive values:Boolean');
    assert.equal(utils.isFunction(null), false, 'isFunction detects primitive values:Null');
    assert.equal(utils.isFunction(undefined), false, 'isFunction detects primitive values:Undefined');
    assert.equal(utils.isFunction(), false, 'isFunction detects the empty arguments list');
  }

  function testIsObject(assert, utils) {
    assert.equal(utils.isObject({}), true, 'isObject detects hash object');
    assert.equal(utils.isObject([]), true, 'isObject detects arrays');
    assert.equal(utils.isObject(function () {}), true, 'isObject detects functions');

    assert.equal(utils.isObject(String('string')), false, 'isObject detects primitive data types');
    assert.equal(utils.isObject(new String('string')), true, 'isObject considers wrapper-objects as an object');

    assert.equal(utils.isObject(Number('1')), false, 'isObject detects primitive data types');
    assert.equal(utils.isObject(new Number('1')), true, 'isObject considers wrapper-objects as an object');

    assert.equal(utils.isObject(Boolean(true)), false, 'isObject detects primitive data types');
    assert.equal(utils.isObject(new Boolean(true)), true, 'isObject considers wrapper-objects as an object');

    assert.equal(utils.isObject(null), false, 'isObject detects falsy values');
    assert.equal(utils.isObject(undefined), false, 'isObject detects falsy values');
    assert.equal(utils.isObject(), false, 'isObject detects falsy values');
  }

  function testIsObjectLike(assert, utils) {
    assert.equal(utils.isObjectLike({}), true, 'isObjectLike detects js object');
    assert.equal(utils.isObjectLike([]), true, 'isObjectLike detects arrays');

    assert.equal(utils.isObjectLike(function () {}), false, 'isObjectLike detects functions');

    assert.equal(utils.isObjectLike(String('string')), false, 'isObjectLike detects primitive data types');
    assert.equal(utils.isObjectLike(new String('string')), true, 'isObjectLike considers wrapper-objects as an object');

    assert.equal(utils.isObjectLike(Number('1')), false, 'isObjectLike detects primitive data types');
    assert.equal(utils.isObjectLike(new Number('1')), true, 'isObjectLike considers wrapper-objects as an object');

    assert.equal(utils.isObjectLike(Boolean(true)), false, 'isObjectLike detects primitive data types');
    assert.equal(utils.isObjectLike(new Boolean(true)), true, 'isObjectLike considers wrapper-objects as an object');

    assert.equal(utils.isObjectLike(null), false, 'isObjectLike detects falsy values:null');
    assert.equal(utils.isObjectLike(undefined), false, 'isObjectLike detects falsy values:undefined');
    assert.equal(utils.isObjectLike(), false, 'isObjectLike detects the empty arguments list');
  }

  function testIsPromiseAlike(assert, utils) {
    var noop = function () {};

    assert.equal(utils.isPromiseAlike(new Promise(noop, noop)), true, 'isPromiseAlike detects real native Promise objects');
    assert.equal(utils.isPromiseAlike({
      then: noop
    }), true, 'isPromiseAlike considers any object with a then function as a promise alike object');

    assert.equal(utils.isPromiseAlike(null), false, 'isPromiseAlike detects falsy values:null');
    assert.equal(utils.isPromiseAlike(undefined), false, 'isPromiseAlike detects falsy values:undefined');
    assert.equal(utils.isPromiseAlike(), false, 'isPromiseAlike detects falsy values');
  }

  function testUtils(assert, utils) {

    assert.equal(typeof utils.extend, 'function', 'utils.extend is a function');
    testExtend(assert, utils);

    assert.equal(typeof utils.isArray, 'function', 'utils.isArray is a function');
    testIsArray(assert, utils);

    assert.equal(typeof utils.isFunction, 'function', 'utils.isFunction is a function');
    testIsFunction(assert, utils);

    assert.equal(typeof utils.isObject, 'function', 'utils.isObject is a function');
    testIsObject(assert, utils);

    assert.equal(typeof utils.isObjectLike, 'function', 'utils.isObjectLike is a function');
    testIsObjectLike(assert, utils);

    assert.equal(typeof utils.isPromiseAlike, 'function', 'utils.isPromiseAlike is a function');
    testIsPromiseAlike(assert, utils);
  }

  fix.testRunner('utils', {
    message: 'utils helper functions',
  }).then(function (assert, utils) {
    assert.strictEqual(typeof utils, 'function', 'utils is a function');

    utils('moduleName', 'utils');
    assert.strictEqual(utils.moduleName, 'utils', 'utils as a function, exposes new attributes to itself');

    var testUtilFunction;
    utils('testUtilFunction', (testUtilFunction = function () {
      return this.moduleName;
    }));

    assert.strictEqual(typeof utils.testUtilFunction, 'function', 'utils exposes functions');
    assert.strictEqual(utils.testUtilFunction, testUtilFunction, 'utils exposes functions');
    assert.strictEqual(utils.testUtilFunction(), 'utils', '"this" context in utils exposed functions, points to utils itself');

    testUtils(assert, utils);
  });
});