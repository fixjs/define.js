define([
  './var/fix',
  './var/emptyArray',
  './getFileName',
  './defer',
  './utils/isArray',
  './utils/isObject',
  './utils/forOwn'
], function (fix, emptyArray, getFileName, defer, isArray, isObject, forOwn) {
  function core(_, amd) {
    if (!isObject(_)) {
      _ = global;
    }
    _.define = function (moduleName, array, moduleDefinition) {
      return core.define(amd, moduleName, array, moduleDefinition);
    };
    _.require = function (array, fn) {
      return amd.require(array, fn);
    };
    _.use = function (array) {
      return _.require(array);
    };
    _.config = function (cnfOptions) {
      if (!isObject(cnfOptions)) {
        console.error('Invalid parameter to set up the config');
        return;
      }
      forOwn(cnfOptions, function (option, key) {
        fix.options[key] = option;
      });
    };
    _.require.config = _.config;
    _.define.amd = {};
    _.define.fix = fix;
    _.define.defer = defer;
    return _;
  }

  core.define = function (amd, moduleName, array, moduleDefinition) {
    if (typeof moduleName === 'function') {
      //define(moduleDefinition)
      moduleDefinition = moduleName;
      moduleName = undefined;
      array = emptyArray;
    } else if (isArray(moduleName)) {
      //define(array, moduleDefinition)
      moduleDefinition = array;
      array = moduleName;
      moduleName = undefined;
    } else if (typeof moduleName === 'string') {
      //define(moduleName, moduleDefinition)
      if (typeof array === 'function') {
        moduleDefinition = array;
        array = emptyArray;
      }
    }
    if (typeof moduleDefinition !== 'function') {
      console.error('Invalid input parameter to define a module');
      return false;
    }
    if (moduleName === undefined) {
      moduleName = getFileName(document.currentScript.src);
    }
    return amd.define(moduleName, array, moduleDefinition);
  };
  return core;
});