define(function () {
  'use strict';

  function testCreateScript(assert, utils) {

    // test("should inspect jQuery.getJSON's
    //   usage of jQuery.ajax", function () {
    //   this.spy(jQuery, "ajax");
    //   jQuery.getJSON("/some/resource");

    //   ok(jQuery.ajax.calledOnce);
    //   equals(jQuery.ajax.getCall(0).args[0].url, "/some/resource");
    //   equals(jQuery.ajax.getCall(0).args[0].dataType, "json");
    // });

    // var scriptEl = utils.createScript(url, callback, errorCallback);

    // assert.equal(, 'fileName', 'utils.createScript works for this pattern:' + 'http://mysite.org/fileName');
  }

  fix.test('utils.createScript', {
    message: 'utils.createScript works as a helper utils functions'
  }).then(function (assert, utils) {

    assert.strictEqual(typeof utils.createScript, 'function', 'utils.createScript is a function');

    testCreateScript(assert, utils);

  });
});