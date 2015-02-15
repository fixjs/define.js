define([
  './var/info',
  './var/emptyArray',
  './moduleLoader.promise',
  './async',
  './utils.isGenerator'
], function (info, emptyArray, moduleLoader, async, utils) {
  function defineModuleDefinition() {
    function * defineGenerator(moduleName, array, moduleDefinition) {
      var args;
      info.definedModules[moduleName] = true;
      if (utils.isArray(array) && array.length) {
        args = yield moduleLoader.loadAll(array);
      }
      moduleLoader.setup(moduleName, moduleDefinition, args);
    }

    function * requireGenerator(array, fn) {
      var args;
      if (utils.isArray(array) && array.length) {
        args = yield moduleLoader.loadAll(array);
      }
      utils.execute(fn, args);
    }

    //the new CommonJS style
    function CJS(asyncFN) {
      return async(function * cjs() {
        var exportsObj = {},
          moduleObj = {
            exports: exportsObj
          };

        var data = yield asyncFN(exportsObj, moduleObj);
        if (data) {
          return data;
        }

        if (moduleObj.exports !== exportsObj || Object.keys(exportsObj).length > 0) {
          return moduleObj.exports;
        }
      });
    }

    function fxdefine(moduleName, array, moduleDefinition) {
      //define(moduleDefinition)
      if (typeof moduleName === 'function') {
        if (utils.isGenerator(moduleName)) {
          var asyncFunc = async(moduleName);
          return fxdefine(CJS(asyncFunc));
        }
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
        return;
      }
      if (moduleName === undefined) {
        moduleName = utils.getFileName(document.currentScript.src);
      }
      async(defineGenerator)(moduleName, array, moduleDefinition);
    }

    function fxrequire(array, fn) {
      if (typeof array === 'function' && utils.isGenerator(array)) {
        return async(array)();
      }
      if (typeof array === 'string' && typeof fn === 'undefined') {
        return async(loadModuleGenerator)(array);
      }
      async(requireGenerator)(array, fn);
    }

    function * loadModuleGenerator(modulePath) {
      var args = yield moduleLoader.loadAll([modulePath]);
      return args[0];
    }

    function promiseUse(array) {
      return new Promise(function (fulfill) {
        fxrequire(array, fulfill);
      });
    }

    function fxconfig(cnfOptions) {
      if (!utils.isObject(cnfOptions)) {
        return;
      }

      var key;

      for (key in cnfOptions) {
        if (cnfOptions.hasOwnProperty(key)) {
          info.options[key] = cnfOptions[key];
        }
      }
    }

    fxdefine.amd = {};
    fxrequire.config = fxconfig;

    function definejs(obj) {
      if (!utils.isObject(obj)) {
        obj = global;
      }
      obj.require = fxrequire;
      obj.define = fxdefine;
      obj.config = fxconfig;

      obj.options = info.options;
      obj.use = promiseUse;
      obj.info = info;
    }

    return definejs;
  }

  return defineModuleDefinition;
});