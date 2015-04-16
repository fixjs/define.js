define(function () {
  'use strict';

  function testExecute(assert, execute, emptyArray) {

    var args = ['args', 'passing', 'to', 'the', 'fn.apply'],
      result,
      exp,
      callback;

    callback = sinon.stub();
    callback.withArgs('test').returns('return value');
    callback.withArgs('args', 'passing', 'to', 'the', 'fn.apply').returns(args);
    callback.withArgs('error').throws('TypeError');
    callback.returns('done');

    result = execute(callback, ['test']);

    assert.ok(callback.calledOnce, 'execute executes the callback exactly once:1');

    assert.ok(result instanceof Promise, 'execute returns a Promise:1');

    result = execute(callback, args)
      .then(function (value) {
        assert.ok(callback.calledTwice, 'execute executes the callback exactly once:2');
        assert.equal(value, args, 'execute returns a promise which holds the actual return value:2');
        return execute(function () {
          throw Error('A definejs error');
        }, ['error']);
      })
      .catch(function (err) {
        assert.equal(err.message, 'A definejs error', 'execute rejects the promise in case of any exception:2');

        //emptyArray.push('This shouldnt happen in the real world, emptyArray is just to prevent us from making new empty arrays!');

        return execute(callback);
      })
      .then(function(result){
        assert.equal(result, 'done', 'execute returns the promised value.');
        // assert.equal(result[0], emptyArray[0], 'execute correctly passes emptyArray to apply');
        // emptyArray.splice(0, 1);

        assert.done();
      });
  }

  FIX.test('execute', {
    message: 'execute works as a helper utils functions',
    require: ['execute', './var/emptyArray'],
    done: false
  }).then(function (assert, execute, emptyArray) {

    assert.strictEqual(typeof execute, 'function', 'utils.execute is a function');

    testExecute(assert, execute, emptyArray);

  });
});