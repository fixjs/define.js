define([
  './loader',
  './fixDefine',
  './fixRequire',
  './amd.core',
  './promise',
  './utils/isGenerator'
], function (loader, fixDefine, fixRequire, core, Promise, isGenerator) {
  function amd() {
    if (amd.definejs) {
      return amd.definejs;
    }
    var definejs = function (_) {
      _ = core(_, amd);

      function * loadGenerator(modulePath) {
        return yield loader.load(modulePath);
      }

      function CJS(definition) {
        return function * cjs() {
          var exportsObj = {},
            moduleObj = {
              exports: exportsObj
            };

          var data = yield definition.go(exportsObj, moduleObj);
          if (data) {
            return data;
          }

          if (moduleObj.exports !== exportsObj || Object.keys(exportsObj).length > 0) {
            return moduleObj.exports;
          }
        };
      }

      amd.define = function (moduleName, array, definition) {
        if (isGenerator(definition)) {
          return _.define(CJS(definition).async());
        }
        return fixDefine(moduleName, array, definition);
      };

      amd.require = function (array, fn) {
        if (typeof array === 'function' && isGenerator(array)) {
          return array.go();
        }
        if (typeof array === 'string' && typeof fn === 'undefined') {
          return loadGenerator.go(array);
        }
        return fixRequire(array, fn);
      };
      _.define.Promise = Promise;
    };
    amd.definejs = definejs;
    return definejs;
  }
  return amd;
});