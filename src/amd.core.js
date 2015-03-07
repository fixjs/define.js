define([
  './var/info',
  './var/emptyArray',
  './utils'
], function (info, emptyArray, utils) {
  function core(_, amd) {
    if (!utils.isObject(_)) {
      _ = global;
    }

    _.define = function (moduleName, array, moduleDefinition) {
      return core.define(amd, moduleName, array, moduleDefinition);
    };

    _.require = function (array, fn) {
      return amd.require(array, fn);
    };

    _.use = function (array) {
      return new Promise(function (fulfill) {
        _.require(array, fulfill);
      });
    };

    _.config = function (cnfOptions) {
      if (!utils.isObject(cnfOptions)) {
        console.error('Invalid parameter to set up the config');
        return;
      }

      var key;
      for (key in cnfOptions) {
        if (cnfOptions.hasOwnProperty(key)) {
          info.options[key] = cnfOptions[key];
        }
      }
    };

    _.require.config = _.config;
    _.define.amd = {};
    _.define.info = info;

    return _;
  }

  core.define = function (amd, moduleName, array, moduleDefinition) {
    //define(moduleDefinition)
    if (typeof moduleName === 'function') {
      moduleDefinition = moduleName;
      moduleName = undefined;
      array = emptyArray;
    }
    //define(array, moduleDefinition)
    else if (utils.isArray(moduleName)) {
      moduleDefinition = array;
      array = moduleName;
      moduleName = undefined;
    }
    /*
     * Note: (Not a good practice)
     * You can explicitly name modules yourself, but it makes the modules less portable
     * if you move the file to another directory you will need to change the name.
     */
    else if (typeof moduleName === 'string') {
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
      moduleName = utils.getFileName(document.currentScript.src);
    }

    amd.define(moduleName, array, moduleDefinition);
  };
  return core;
});