define(function () {
  'use strict';

  function testBaseInfo(assert, baseInfo, doc) {
    var head = doc.head || doc.getElementsByTagName('head')[0],
      base = doc.getElementsByTagName('base')[0];
    
    baseInfo();

    if (baseInfo.baseElement) {
      assert.strictEqual(baseInfo.baseElement, base, 'baseInfo.baseElement stores the correct value');
      head = baseInfo.baseElement.parentNode;
    }

    equal(baseInfo.head, head, 'baseInfo.head  stores the correct value');

    assert.strictEqual(baseInfo.baseUrl, '../spec/', 'baseInfo.baseUrl  stores the correct value');
    assert.strictEqual(baseInfo.baseGlobal, 'GLOB', 'baseInfo.baseGlobal  stores the correct value');
  }

  fix.test('baseInfo', {
    message: 'is a expose function for AMD functions and more DefineJS attributes',
    module: {
      beforeEach: function () {
        var that = this;
        this.mainCurrentScript = document.currentScript;
        this.currentScript = $('<script>', {
          'src': 'spec/baseInfo.js',
          'global': 'GLOB',
          'base': '../spec/'
        }).get(0);

        Object.defineProperty(document, 'currentScript', {
          get: function () {
            return that.currentScript;
          }
        });
      },
      afterEach: function () {
        this.currentScript = this.mainCurrentScript;
      }
    },
    require: ['./baseInfo', './var/doc']
  }).then(function (assert, baseInfo, doc) {

    assert.strictEqual(typeof baseInfo, 'function', 'baseInfo is an object');
    
    assert.strictEqual(doc, document, 'doc is the global document object');

    testBaseInfo(assert, baseInfo, doc);
  });
});