/*! define.js v0.1.1a - MIT license */
(function (global, undefined) {
  'use strict';

  var
    doc = global.document,
    currentScript = document.currentScript,
    emptyArray = [],
    options = {},
    files = {},
    baseFileInfo,
    baseUrl = '',
    baseGlobal,
    waitingList = {},
    urlCache = {},
    loadedModules = {},
    moduleDependencies = {},
    modules = {},
    installed = {},
    failedList = [];

  function getFileInfo(url) {
    var info = files[url],
      ind;
    if (typeof info !== 'object') {
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

  function getUrl(moduleName) {
    if (typeof urlCache[moduleName] === 'string') {
      return urlCache[moduleName];
    }

    var url,
      urlArgs;

    urlArgs = (typeof options.urlArgs === 'string') ?
      ('?' + options.urlArgs) :
      (typeof options.urlArgs === 'function') ? ('?' + options.urlArgs()) : '';

    if (options.baseUrl) {
      url = options.baseUrl;
    } else {
      url = baseUrl;
    }

    if (typeof options.paths === 'object') {
      if (typeof options.paths[moduleName] === 'string') {
        moduleName = options.paths[moduleName];
      }
    }

    if (url.substring(url.length - 1) !== '/' &&
      moduleName.substring(0, 1) !== '/') {
      url += '/';
    }

    url += moduleName + '.js' + urlArgs;

    urlCache[moduleName] = url;

    return url;
  }

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

  function loadModule(moduleName, callback) {
    var isFirstLoadDemand = false;

    if (installed[moduleName]) {

      callback(modules[moduleName]);

    } else {

      if (!Array.isArray(waitingList[moduleName])) {
        waitingList[moduleName] = [];
        isFirstLoadDemand = true;
      }

      waitingList[moduleName].push(callback);

      if (isFirstLoadDemand) {

        getScript(moduleName, function (status) {
          loadedModules[moduleName] = true;

          if (Array.isArray(moduleDependencies[moduleName]) &&
            moduleDependencies[moduleName].length) {} else {
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
    if (typeof moduleName === 'function') {
      moduleDefinition = moduleName;
      moduleName = undefined;
      array = emptyArray;
    } else if (Array.isArray(moduleName)) {
      moduleDefinition = array;
      array = moduleName;
      moduleName = undefined;
    } else if (typeof moduleName === 'string') {
      if (typeof array === 'function') {
        moduleDefinition = array;
        array = emptyArray;
      }
    }

    if (typeof moduleDefinition !== 'function') {
      console.error('Invalid input parameter to define a module');
      return;
    }

    var moduleInfo = getFileInfo(document.currentScript.src);

    if (moduleName === undefined) {
      moduleInfo = getFileInfo(document.currentScript.src);
      moduleName = moduleInfo.fileName;
    }

    moduleDependencies[moduleName] = array.slice();

    if (Array.isArray(array) && array.length) {
      loadModules(array, function () {

        var args = [],
          i = 0,
          len = array.length;

        for (; i < len; i += 1) {
          args.push(modules[array[i]]);
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
          args.push(modules[array[i]]);
        }

        executeModule(false, fn, args);
      });
    } else {
      executeModule(false, fn);
    }

  }

  function fxconfig(cnfOptions) {
    if (typeof cnfOptions !== 'object') {
      return;
    }
    var keys = Object.keys(cnfOptions),
      i = 0,
      len = keys.length,
      key;
    for (; i < len; i += 1) {
      key = keys[i];
      options[key] = cnfOptions[key];
    }
  }

  fxdefine.amd = {};

  function fixDefine(g) {
    g.require = fxrequire;
    g.define = fxdefine;
    g.config = fxconfig;
  }

  if (baseGlobal && typeof global[baseGlobal] === 'object') {
    fixDefine(global[baseGlobal]);
  }

  if (typeof exports === 'object') {
    module.exports = fixDefine;
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return fixDefine;
    });
  } else {
    global.fixDefine = fixDefine;
  }

}(this));
