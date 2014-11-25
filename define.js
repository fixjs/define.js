/**
 * DefineJS v0.2.2
 * Copyright (c) 2014 Mehran Hatami and define.js contributors.
 * Available via the MIT license.
 * license found at http://github.com/fixjs/define.js/raw/master/LICENSE
 */
(function (global, undefined) {
  'use strict';

  //polyfills
  if (!Array.isArray) {
    Array.isArray = function (arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }

  function defineModuleDefinition() {
    var
      doc = global.document,
      currentScript = document.currentScript,
      emptyArray = [],
      options = {},
      files = {},
      baseFileInfo,
      baseUrl = '',
      baseGlobal = '',
      waitingList = {},
      urlCache = {},
      definedModules = {},
      modules = {},
      installed = {},
      //So far we we only capture the failure, we need to define a scenario for failed items
      failedList = {};

    function isObject(obj) {
      return obj === Object(obj);
    }

    function isPromiseAlike(object) {
      return isObject(object) && typeof object.then === 'function';
    }

    function getFileInfo(url) {
      var info = files[url],
        ind;
      if (!isObject(info)) {
        info = {};

        ind = url.indexOf('#');
        if (-1 < ind) {
          info.hash = url.substring(ind);
          url = url.substring(0, ind);
        }

        ind = url.indexOf('?');
        if (-1 < ind) {
          info.search = url.substring(ind);
          url = url.substring(0, ind);
        }

        info.fileName = url.substring(url.lastIndexOf('/') + 1);
        ind = info.fileName.lastIndexOf('.');
        if (-1 < ind) {
          info.ext = info.fileName.substring(ind);
          info.fileName = info.fileName.substring(0, ind);
        }
        info.filePath = url.substring(0, url.lastIndexOf('/') + 1);
        files[url] = info;
      }
      return info;
    }

    function getUrl(modulePath) {
      var moduleInfo = getFileInfo(modulePath),
        moduleName = moduleInfo.fileName,
        url,
        urlArgs,
        path,
        pathUrl;

      if (typeof urlCache[moduleName] === 'string') {
        return urlCache[moduleName];
      }

      urlArgs = (typeof options.urlArgs === 'string') ?
        ('?' + options.urlArgs) :
        (typeof options.urlArgs === 'function') ? ('?' + options.urlArgs()) : '';

      if (options.baseUrl) {
        url = options.baseUrl;
      } else {
        url = baseUrl;
      }

      if (isObject(options.paths)) {
        for (path in options.paths) {
          if (options.paths.hasOwnProperty(path)) {
            pathUrl = options.paths[path];

            if (typeof pathUrl === 'string' &&
              modulePath.indexOf(path + '/') === 0) {
              modulePath = modulePath.replace(path, pathUrl);
              break;
            }

          }
        }
      }

      if (url.substring(url.length - 1) !== '/' &&
        modulePath.substring(0, 1) !== '/') {
        url += '/';
      }

      url += modulePath + '.js' + urlArgs;

      urlCache[moduleName] = url;

      return url;
    }

    //phantomjs does not provide the "currentScript" property in global document object
    if (currentScript !== undefined) {
      baseFileInfo = getFileInfo(currentScript.src);
      baseUrl = currentScript.getAttribute('base') || baseFileInfo.filePath;
      baseGlobal = currentScript.getAttribute('global');
    }

    function getScript(url, callback) {
      var el = doc.createElement('script');

      el.addEventListener('error', function (e) {
        //missing dependency
        console.error('The script ' + e.target.src + ' is not accessible.');
        if (typeof callback === 'function') {
          callback('error');
        }
      });

      el.addEventListener('load', function (e) {
        //dependency is loaded successfully
        if (typeof callback === 'function') {
          callback('success');
        }
      });
      doc.head.appendChild(el);
      el.src = getUrl(url);
    }

    function executeFN(fn, args) {
      var fnData;
      if (!Array.isArray(args)) {
        args = emptyArray;
      }

      try {
        fnData = fn.apply(undefined, args);
      } catch (ignore) {}

      return fnData;
    }

    function installModule(moduleName, status) {
      var callbacks, fn,
        i, len;

      if (status === 'success') {
        if (!installed[moduleName]) {
          installed[moduleName] = true;
        }
      } else {
        failedList[moduleName] = true;
      }

      callbacks = waitingList[moduleName];

      if (Array.isArray(callbacks)) {
        i = 0;
        len = callbacks.length;

        for (; i < len; i += 1) {
          fn = callbacks[i];
          try {
            fn(status);
          } catch (ignored) {}
        }
        waitingList[moduleName] = [];
      }
    }

    function loadModule(modulePath, callback) {
      var isFirstLoadDemand = false,
        moduleInfo = getFileInfo(modulePath),
        moduleName = moduleInfo.fileName;

      if (installed[moduleName]) {
        callback(modules[moduleName]);
      } else {
        if (!Array.isArray(waitingList[moduleName])) {
          waitingList[moduleName] = [];
          isFirstLoadDemand = true;
        }

        waitingList[moduleName].push(callback);

        if (isFirstLoadDemand) {
          getScript(modulePath, function (status) {
            if (definedModules[moduleName] === true) {
              //Do not need to do anything so far
            } else {
              //This code block allows using this library for regular javascript files
              //with no "define" or "require"
              installModule(moduleName, status);
            }
          });
        }
      }
    }

    function loadModules(array, callback) {
      var i = 0,
        len = array.length,
        loaded = [];

      function pCallback(status) {
        loaded.push(status);
        if (loaded.length === len && typeof callback === 'function') {
          callback(loaded);
        }
      }

      for (; i < len; i += 1) {
        loadModule(array[i], pCallback);
      }
    }

    function setUpModule(moduleName, moduleDefinition, args) {
      var moduleData = executeFN(moduleDefinition, args),
        setUp,
        //we could have checked it out with (moduleData instanceof Promise)
        //But this way we are actually being nice to nonnative promise libraries
        isPromise = isPromiseAlike(moduleData);

      setUp = (function (moduleData, moduleName, isPromise) {
        return function setUp(value) {
          if (isPromise) {
            modules[moduleName] = value;
          } else {
            modules[moduleName] = moduleData;
          }

          installModule(moduleName, 'success');

        };
      }(moduleData, moduleName, isPromise));

      if (isPromise) {
        moduleData.then(setUp);
      } else {
        setUp();
        // setTimeout(setUp, 0);
      }
    }

    function fxdefine(moduleName, array, moduleDefinition) {
      //define(moduleDefinition)
      if (typeof moduleName === 'function') {
        moduleDefinition = moduleName;
        moduleName = undefined;
        array = emptyArray;
      }
      //define(array, moduleDefinition)
      else if (Array.isArray(moduleName)) {
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

      var moduleUrl = document.currentScript.src,
        moduleInfo = getFileInfo(document.currentScript.src);

      if (moduleName === undefined) {
        moduleInfo = getFileInfo(moduleUrl);
        moduleName = moduleInfo.fileName;
      }

      definedModules[moduleName] = true;

      if (Array.isArray(array) && array.length) {
        loadModules(array, function () {
          var args = [],
            i = 0,
            len = array.length;
          for (; i < len; i += 1) {
            args.push(modules[getFileInfo(array[i]).fileName]);
          }
          setUpModule(moduleName, moduleDefinition, args);
        });
      } else {
        setUpModule(moduleName, moduleDefinition);
      }
    }

    function fxrequire(array, fn) {
      if (typeof fn !== 'function') {
        console.error('Invalid input parameter to require a module');
        return;
      }

      if (Array.isArray(array) && array.length) {
        loadModules(array, function () {
          var args = [],
            i = 0,
            len = array.length;
          for (; i < len; i += 1) {
            args.push(modules[getFileInfo(array[i]).fileName]);
          }
          executeFN(fn, args);
        });
      } else {
        executeFN(fn);
      }
    }

    function promiseUse(array) {
      return new Promise(function (fulfill) {
        //this function accepts two params: fulfill, reject

        fxrequire(array, fulfill);

        //FIXME: think of a useful pattern for promised module rejection

        console.log('Great to see that you are using this function on DefineJS (https://www.npmjs.org/package/definejs)');
        console.log('This function provides a way of requiring your defined modules using a Promise based coding style.');
        console.log('Actually as you might have noticed we are actively extending this module loader, and that\'s why we need your feedback on this.');
        console.log('You could join the chat room on Gitter (https://gitter.im/fixjs/define.js) and provide us with your great ideas and feedbacks.');

        /*
         * OPEN DISCUSSION:
         * module rejection could offer a cool pattern when developing new modules
         * but we first need to have the community's feedback on this
         */
      });
    }

    function fxconfig(cnfOptions) {
      if (!isObject(cnfOptions)) {
        return;
      }

      var keys = Object.keys(cnfOptions),
        len = keys.length,
        i = 0;

      while (i < len) {
        options[keys[i]] = cnfOptions[keys[i]];
        i++;
      }
    }

    fxdefine.amd = {};

    function fixDefine(g) {
      g.require = fxrequire;
      g.define = fxdefine;
      g.config = fxconfig;
      g.options = options;

      //Nonstandards
      g.use = promiseUse;

    }

    if (baseGlobal && isObject(global[baseGlobal])) {
      fixDefine(global[baseGlobal]);
      fixDefine._exposed = true;
    }

    return fixDefine;
  }

  if (typeof exports === 'object') {
    module.exports = defineModuleDefinition();
  } else if (typeof define === 'function' && define.amd) {
    define([], defineModuleDefinition);
  } else {
    var moduleFN = defineModuleDefinition();
    if (!moduleFN._exposed) {
      global.fixDefine = moduleFN;
    }
  }
}(this));
