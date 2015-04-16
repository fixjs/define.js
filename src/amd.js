define([
  './fixDefine',
  './fixRequire',
  './amd.core'
], function (fixDefine, fixRequire, core) {
  function amd() {
    if (amd.definejs) {
      return amd.definejs;
    }
    var definejs = function (_) {
      _ = core(_, amd);
      amd.define = fixDefine;
      amd.require = fixRequire;
    };
    amd.definejs = definejs;
    return definejs;
  }
  return amd;
});