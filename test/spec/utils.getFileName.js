define(function () {
  'use strict';

  function testMatchUrl(assert, utils) {
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
      assert.equal(utils.matchUrl(pattern), 'fileName', 'utils.getFileName works for patterns like:' + pattern);
    });
  }

  function testGetFileName(assert, utils) {
    var url = 'Any desired url or static file path!',
      fileName = 'the desired file name',
      fileName1,
      fileName2,
      fileName3;

    assert.stub(utils, 'matchUrl').returns(fileName);

    fileName1 = utils.getFileName(url);
    fileName2 = utils.getFileName(url);
    fileName3 = utils.getFileName(url);

    assert.ok((fileName === fileName1) && (fileName1 === fileName2) && (fileName2 === fileName3), 'utils.getFileName works as expected!');
    
    assert.ok(utils.matchUrl.calledOnce, 'utils.getFileName uses a cache system so that utils.matchUrl gets called just once for the same url');

    utils.matchUrl.restore();
  }

  fix.test('utils.getFileName', {
    message: 'utils.getFileName works as a helper utils functions'
  }).then(function (assert, utils) {
    assert.strictEqual(typeof utils.matchUrl, 'function', 'utils.matchUrl is a function');
    testMatchUrl(assert, utils);
    
    assert.strictEqual(typeof utils.getFileName, 'function', 'utils.getFileName is a function');
    testGetFileName(assert, utils);
  });
});