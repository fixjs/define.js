/**
 * DefineJS v0.2.1
 * Copyright (c) 2014 Mehran Hatami and define.js contributors.
 * Available via the MIT license.
 * license found at http://github.com/fixjs/define.js/raw/master/LICENSE
 */
(function (global, undefined) {

  function defineModuleDefinition() {
    'use strict';

    var
      doc = global.document,
      currentScript = document.currentScript,

      emptyArray = [],

      options = {},
      files = {},

      baseFileInfo,
      baseUrl = '',
      baseGlobal = '',

      moduleUrls = {},
      waitingList = {},
      urlCache = {},
      loadedModules = {},
      moduleDependencies = {},
      modules = {},
      installed = {},
      failedList = [];

    function isObject(obj) {
      return obj === Object(obj);
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
        moduleName = moduleInfo.fileName;

      if (typeof urlCache[moduleName] === 'string') {
        return urlCache[moduleName];
      }

      var url,
        urlArgs,
        path,
        pathUrl;

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
          if (options.paths.hasOwnProperty(path) &&
            typeof (pathUrl = options.paths[path]) === 'string') {
            if (modulePath.indexOf(path + '/') === 0) {
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
      var elem = doc.createElement('script');

      elem.addEventListener('error', function (e) {
        //missing dependency
        console.error('The script ' + e.target.src + ' is not accessible.');

        if (typeof callback === 'function') {
          callback('error');
        }
      });

      elem.addEventListener('load', function (e) {
        //dependency is loaded successfully
        if (typeof callback === 'function') {
          callback('success');
        }
      });

      doc.head.appendChild(elem);

      elem.src = getUrl(url);
    }

    function executeModule(moduleName, moduleDefinition, args) {
      var moduleData;

      if (!Array.isArray(args)) {
        args = emptyArray;
      }

      try {
        moduleData = moduleDefinition.apply(undefined, args);
      } catch (ignored) {}

      if (moduleName) {
        modules[moduleName] = moduleData;
      }
    }

    function installModule(moduleName, status) {
      var callbacks,
        i,
        len,
        fn;

      if (status === 'success') {
        if (!installed[moduleName]) {
          installed[moduleName] = true;
        }
      } else {
        failedList.push(moduleName);
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
            loadedModules[moduleName] = true;

            if (Array.isArray(moduleDependencies[moduleName]) &&
              moduleDependencies[moduleName].length) {
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
        moduleUrls[moduleName] = moduleUrl;
      }

      moduleDependencies[moduleName] = array.slice();

      if (Array.isArray(array) && array.length) {
        loadModules(array, function () {

          var args = [],
            i = 0,
            len = array.length;

          for (; i < len; i += 1) {
            args.push(modules[getFileInfo(array[i]).fileName]);
          }

          executeModule(moduleName, moduleDefinition, args);
          installModule(moduleName, 'success');

        });
      } else {
        executeModule(moduleName, moduleDefinition);
        installModule(moduleName, 'success');
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

          executeModule(false, fn, args);
        });
      } else {
        executeModule(false, fn);
      }

    }

    function promiseUse(array) {

      return new Promise(function (fulfill, reject) {
        fxrequire(array, fulfill);
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

    if (baseGlobal && typeof global[baseGlobal] === 'object') {
      fixDefine(global[baseGlobal]);
    }

    return fixDefine;
  }

  if (typeof exports === 'object') {
    module.exports = defineModuleDefinition();
  } else if (typeof define === 'function' && define.amd) {
    define([], defineModuleDefinition);
  } else {
    global.fixDefine = defineModuleDefinition();
  }

}(this));
