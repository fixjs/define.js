define(function () {
  'use strict';

  function testUtilsSetup(assert, utils) {

    // assert.equal(typeof utils.extend, 'function', 'utils.extend is a function');
    // testExtend(assert, utils);

  }

  fix.test('utils.setup', {
    message: 'utils.setup works as a helper utils functions',
  }).then(function (assert, utils) {

    assert.strictEqual(typeof utils.setup, 'function', 'utils.setup is a function');

    testUtilsSetup(assert, utils);

  });
});