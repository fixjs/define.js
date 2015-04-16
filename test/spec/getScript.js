define(function () {
  'use strict';

  function testGetScript(assert, utils, getScript, createScript) {

    assert.strictEqual(typeof createScript, 'function', 'createScript is a dependency');

    var el = $('<script>', {
        src: 'lib/testModule.js'
      }).get(0),
      scriptEl,
      callback = sinon.stub();

    assert.stub(utils, 'createScript');
    createScript.withArgs('lib/testModule', callback, callback).returns(el);

    scriptEl = utils.getScript('lib/testModule', callback);

    assert.ok(createScript.calledOnce, 'utils.getScript uses createScript');

    assert.strictEqual(el, scriptEl, 'utils.getScript uses createScript to create new script tags');

    createScript.restore();

    //more DOM tests
  }

  FIX.test('getScript', {
    message: 'getScript works as a helper utils functions',
    require: ['./utils', './getScript', './createScript']
  }).then(function (assert, utils, getScript, createScript) {

    assert.strictEqual(typeof utils, 'object', 'getScript is a function');

    assert.strictEqual(typeof getScript, 'function', 'getScript is a function');

    testGetScript(assert, utils, getScript, createScript);

  });
});