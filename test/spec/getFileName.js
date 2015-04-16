define(function () {
  'use strict';

  function testMatchUrl(assert, matchUrl) {
    var patterns = [
      'http://mysite.org/fileName',
      'http://mysite.org/fileName.js',
      'http://mysite.org/path1/path2/fileName',
      'http://mysite.org/path1/path2/fileName.html',
      'path1/path2/fileName',
      'path1/path2/fileName.anyextenstion',
      'file:///Users/myuser/Documents/myapp/test/fileName.html',
      'fileName.js',
      'fileName',
      '../lib/fileName.js',
      '../../fileName.js',
      '../fileName',
      './var/fileName.js',
      './fileName.js',
      './fileName'
    ];
    patterns.forEach(function (pattern) {
      assert.equal(matchUrl(pattern), 'fileName', 'getFileName works for patterns like:' + pattern);
    });
  }

  function testGetFileName(assert, getFileName) {
    var url = '../../anyPath',
      fileName = 'anyPath',
      fileName1,
      fileName2,
      fileName3;

    // assert.stub(utils, 'matchUrl').returns(fileName);

    fileName1 = getFileName('../../anyPath');
    fileName2 = getFileName('../anyPath');
    fileName3 = getFileName('http://www.example.com/anyPath');

    assert.ok((fileName === fileName1) && (fileName1 === fileName2) && (fileName2 === fileName3), 'getFileName works as expected!');

    // assert.ok(utils.matchUrl.calledOnce, 'getFileName uses a cache system so that utils.matchUrl gets called just once for the same url');

    // utils.matchUrl.restore();
  }

  FIX.test('getFileName', {
    message: 'getFileName works as a helper url manipulation function',
    require: ['./matchUrl', './getFileName']
  }).then(function (assert, matchUrl, getFileName) {
    assert.strictEqual(typeof matchUrl, 'function', 'matchUrl is a function');
    testMatchUrl(assert, matchUrl);

    assert.strictEqual(typeof getFileName, 'function', 'getFileName is a function');
    testGetFileName(assert, getFileName);
  });
});