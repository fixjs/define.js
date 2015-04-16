define(function () {
  'use strict';

  function testMakeUrl(assert, utils, makeUrl, baseInfo, fix) {
    var origBaseUrl = baseInfo.baseUrl;
    baseInfo.baseUrl = '../spec';
    var baseUrl = fix.options.baseUrl || baseInfo.baseUrl;

    assert.equal(utils.makeUrl('fileName'), baseUrl + '/fileName.js', 'utils.makeUrl works for simple file names');

    fix.options.paths = {
      'test': 'app/test'
    };

    assert.equal(utils.makeUrl('test/fileName'), baseUrl + '/app/test/fileName.js', 'utils.makeUrl works for specified paths');

    //More tests

    baseInfo.baseUrl = origBaseUrl;
  }

  function testGetUrl(assert, utils, getUrl) {
    var url = 'AnyDesired_modulePath_or_static_filePath',
      newUrl = 'AnyDesired_modulePath_or_static_filePath.js',
      url1,
      url2,
      url3;

    // assert.stub(utils, 'makeUrl').returns(newUrl);

    console.log('>>url:', getUrl(url));

    url1 = getUrl(url);
    url2 = getUrl(url);
    url3 = getUrl(url);

    assert.ok((newUrl === url1) && (url1 === url2) && (url2 === url3), 'getUrl works as expected!');

    // assert.ok(utils.makeUrl.calledOnce, 'getUrl uses a cache system so that utils.makeUrl gets called just once for the same url');

    // utils.makeUrl.restore();
  }

  FIX.test('getUrl', {
    message: 'getUrl works as a helper utils functions',
    require: ['./utils', './makeUrl', './getUrl', './baseInfo', './var/fix']
  }).then(function (assert, utils, makeUrl, getUrl, baseInfo, fix) {

    assert.strictEqual(typeof makeUrl, 'function', 'utils.makeUrl is a function');
    testMakeUrl(assert, utils, makeUrl, baseInfo, fix);

    assert.strictEqual(typeof getUrl, 'function', 'getUrl is a function');
    testGetUrl(assert, utils, getUrl);
  });
});