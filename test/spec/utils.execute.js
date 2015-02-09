define(function () {
  'use strict';

  function testExecute(assert, utils, emptyArray) {

    var args = ['args', 'passing', 'to', 'the', 'fn.apply'],
      result,
      exp;

    function func() {
      return arguments;
    }

    result = utils.execute(func, args);
    assert.equal(typeof result, 'object', 'utils.execute returns the actual return value');
    assert.equal(result.length, args.length, 'utils.execute manages the args correctly');

    emptyArray.push('This shouldnt happen in the real world, emptyArray is just to prevent us from making new empty arrays!');
    result = utils.execute(func);
    assert.equal(result.length, 1, 'utils.execute returns the arguments with one single member (we made it to do that of course).');
    assert.equal(result[0], emptyArray[0], 'utils.execute correctly passes emptyArray to apply');
    emptyArray.splice(0, 1);

    result = utils.execute(func);
    assert.equal(result.length, 0, 'utils.execute doesnt pass any args when the second arg is empty');

    try {
      utils.execute(function () {
        throw new Error('Nothing serious!');
      });
      exp = false;
    } catch (err) {
      exp = err;
    }

    assert.strictEqual(exp, false, 'utils.execute ignores the exception if the passed function throws any');
  }

  fix.testRunner('utils.execute', {
    message: 'utils.execute works as a helper utils functions',
    require: ['utils.execute', './var/emptyArray']
  }).then(function (assert, utils, emptyArray) {

    assert.strictEqual(typeof utils.execute, 'function', 'utils.execute is a function');

    testExecute(assert, utils, emptyArray);

  });
});