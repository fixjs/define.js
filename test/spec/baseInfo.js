define(function () {
  'use strict';

  function testBaseInfo(assert, baseInfo, doc) {
    var head = doc.head || doc.getElementsByTagName('head')[0];

    //First test run on baseInfo
    var baseEl = $('<base>', {
      href: '/baseUrl'
    }).appendTo(baseInfo.head);

    assert.currentScript = undefined;

    baseInfo.baseUrl = '/testBase';

    baseInfo();

    assert.strictEqual(baseInfo.baseElement, baseEl.get(0), 'baseInfo.baseElement stores the correct value');
    equal(baseInfo.head, baseInfo.baseElement.parentNode, 'baseInfo.head stores the correct value:with base element in page');
    assert.strictEqual(baseInfo.baseUrl, '', 'baseInfo.baseUrl is empty when there is no currentScript');

    baseEl.remove();

    //second test run on baseInfo
    assert.currentScript = $('<script>', {
      'src': 'spec/baseInfo.js',
      'global': 'GLOB',
      'base': '../spec/'
    }).get(0);

    baseInfo();

    equal(baseInfo.head, head, 'baseInfo.head  stores the correct value');

    assert.strictEqual(baseInfo.baseUrl, '../spec/', 'baseInfo.baseUrl  stores the correct value');
    assert.strictEqual(baseInfo.baseGlobal, 'GLOB', 'baseInfo.baseGlobal  stores the correct value');
  }

  fix.test('baseInfo', {
    message: 'is a expose function for AMD functions and more DefineJS attributes',
    module: {
      beforeEach: function (assert) {
        Object.defineProperty(document, 'currentScript', {
          get: function () {
            return assert.currentScript;
          },
          configurable: true
        });
      },
      afterEach: function (assert) {
        delete document.currentScript;
      }
    },
    require: ['./baseInfo', './var/doc']
  }).then(function (assert, baseInfo, doc) {

    assert.strictEqual(typeof baseInfo, 'function', 'baseInfo is an object');

    assert.strictEqual(doc, document, 'doc is the global document object');

    testBaseInfo(assert, baseInfo, doc);
  });
});