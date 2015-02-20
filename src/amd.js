define([
  './var/info',
  './var/emptyArray',
  './loader',
  './utils'
], function (info, emptyArray, loader, utils) {
  function defineModuleDefinition() {
    function fxdefine(moduleName, array, moduleDefinition) {
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
        return;
      }

      if (moduleName === undefined) {
        moduleName = utils.getFileName(document.currentScript.src);
      }

      info.definedModules[moduleName] = true;

      if (utils.isArray(array) && array.length) {
        loader.loadAll(array, function () {
          var args = [],
            i = 0,
            len = array.length;
          for (; i < len; i += 1) {
            args.push(info.modules[utils.getFileName(array[i])]);
          }
          loader.setup(moduleName, moduleDefinition, args);
        });
      } else {
        loader.setup(moduleName, moduleDefinition);
      }
    }

    function fxrequire(array, fn) {
      if (typeof fn !== 'function') {
        console.error('Invalid input parameter to require a module');
        return;
      }

      if (utils.isArray(array) && array.length) {
        loader.loadAll(array, function () {
          var args = [],
            i = 0,
            len = array.length;
          for (; i < len; i += 1) {
            args.push(info.modules[utils.getFileName(array[i])]);
          }
          utils.execute(fn, args);
        });
      } else {
        utils.execute(fn);
      }
    }

    function promiseUse(array) {
      return new Promise(function (fulfill) {
        //this function accepts two params: fulfill, reject
        fxrequire(array, fulfill);
        //FIXME: think of a useful pattern for promised module rejection
        console.log(
          'Great to see that you are using this function on DefineJS (https://www.npmjs.org/package/definejs)\n',
          'This function provides a way of requiring your defined modules using a Promise based coding style.\n',
          'Actually as you might have noticed we are actively extending this module loader, and that\'s why we need your feedback on this.\n',
          'You could join the chat room on Gitter (https://gitter.im/fixjs/define.js) and provide us with your great ideas and feedbacks.'
        );
        /*
         * OPEN DISCUSSION:
         * module rejection could offer a cool pattern when developing new modules
         * but we first need to have the community's feedback on this
         */
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

    fxrequire.config = fxconfig;
    fxdefine.amd = {};
    fxdefine.info = info;

    function definejs(obj) {
      if (!utils.isObject(obj)) {
        obj = global;
      }
      obj.require = fxrequire;
      obj.define = fxdefine;
      obj.config = fxconfig;
      obj.use = promiseUse;
    }

    return definejs;
  }

  return defineModuleDefinition;
});