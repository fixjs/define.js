define(function () {
  'use strict';

  function testGetScript(assert, utils, info, baseInfo) {

    assert.strictEqual(typeof utils.createScript, 'function', 'utils.createScript is a dependency');

    var el = $('<script>', {
        src: 'lib/testModule.js'
      }),
      scriptEl,
      callback = sinon.stub();

    assert.stub(utils, 'createScript');
    utils.createScript.withArgs('lib/testModule', callback, callback).returns(el);

    scriptEl = utils.getScript('lib/testModule', callback);

    assert.ok(utils.createScript.calledOnce, 'utils.getScript uses utils.createScript');

    assert.strictEqual(el, scriptEl, 'utils.getScript uses utils.createScript to create new script tags');

    utils.createScript.restore();

    //more DOM tests
  }

  fix.test('utils.getScript', {
    message: 'utils.getScript works as a helper utils functions',
    require: ['./utils.getScript', './var/info', './baseInfo']
  }).then(function (assert, utils, info, baseInfo) {

    assert.strictEqual(typeof utils.getScript, 'function', 'utils.getScript is a function');
    testGetScript(assert, utils, info, baseInfo);

  });
});