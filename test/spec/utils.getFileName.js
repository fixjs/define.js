define(function () {
  'use strict';

  function testGetFileName(assert, utils) {

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
      assert.equal(utils.getFileName(pattern), 'fileName', 'utils.getFileName works for patterns like:' + pattern);
    });

    //assert.equal(utils.getFileName('http://mysite.org/fileName'), 'fileName', 'utils.getFileName works for this pattern:' + 'http://mysite.org/fileName');
  }

  fix.testRunner('utils.getFileName', {
    message: 'utils.getFileName works as a helper utils functions'
  }).then(function (assert, utils) {

    assert.strictEqual(typeof utils.getFileName, 'function', 'utils.getFileName is a function');

    testGetFileName(assert, utils);

  });
});