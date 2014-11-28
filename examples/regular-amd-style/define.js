/**
 * DefineJS v0.2.2
 * Copyright (c) 2014 Mehran Hatami and define.js contributors.
 * Available via the MIT license.
 * license found at http://github.com/fixjs/define.js/raw/master/LICENSE
 */
(function (global, undefined) {
  'use strict';

  var doc = global.document,
    objToString = Object.prototype.toString,
    types = {},
    noop = function () {},
    isArray = Array.isArray || isType('Array');

  function isType(type) {
    if (type) {
      return (types[type] || (types[type] = function (arg) {
        return objToString.call(arg) === '[object ' + type + ']';
      }));
    } else {
      return noop;
    }
  }

  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  }

  function isPromiseAlike(obj) {
    return obj && isType('Function')(obj.then);
  }

  function defineModuleDefinition() {
    var
      isOldOpera = typeof global.opera !== 'undefined' && global.opera.toString() === '[object Opera]',
      currentScript = document.currentScript,
      emptyArray = [],
      options = {
        paths: null
      },
      baseUrl = '',
      baseGlobal = '',
      waitingList = {},
      urlCache = {},
      definedModules = {},
      modules = {},
      installed = {},
      //So far we we only capture the failure, we need to define a scenario for failed items
      failedList = {},
      files = {},
      cleanUrlRgx = /[\?|#]([^]*)$/,
      fileNameRgx = /\/([^/]*)$/,
      cleanExtRgx = /.*?(?=\.|$)/,
      filePathRgx = /^(.*[\\\/])/,
      readyStateLoadedRgx = /^(complete|loaded)$/,

      baseElement,
      head;

    function getFileName(url) {
      var fileName = files[url],
        matchResult;
      if (typeof fileName === 'string') {
        return fileName;
      }
      url = url.replace(cleanUrlRgx, '');
      matchResult = url.match(fileNameRgx);
      if (matchResult) {
        fileName = matchResult[1];
      } else {
        fileName = url;
      }
      fileName = fileName.match(cleanExtRgx)[0];
      files[url] = fileName;
      return fileName;
    }

    function getUrl(modulePath) {
      var moduleName = getFileName(modulePath),
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

      if (url.charAt(url.length - 1) !== '/' && modulePath.charAt(0) !== '/') {
        url += '/';
      }

      url += modulePath + '.js' + urlArgs;

      urlCache[moduleName] = url;

      return url;
    }

    //phantomjs does not provide the "currentScript" property in global document object
    if (currentScript !== undefined) {
      baseUrl = currentScript.getAttribute('base') || currentScript.src.match(filePathRgx)[1];
      baseGlobal = currentScript.getAttribute('global');
    }

    //script injection when using BASE tag is now supported
    head = doc.head || doc.getElementsByTagName('head')[0];
    baseElement = doc.getElementsByTagName('base')[0];
    if (baseElement) {
      head = baseElement.parentNode;
    }

    function createScript() {
      var el;
      //in case DefineJS were used along with something like svg in XML based use-cases,
      //then "xhtml" should be set to "true" like config({ xhtml: true });
      if (options.xhtml) {
        el = doc.createElementNS('http://www.w3.org/1999/xhtml', 'script');
      } else {
        el = doc.createElement('script');
      }
      el.async = true;
      el.type = options.scriptType || 'text/javascript';
      el.charset = 'utf-8';
      return el;
    }

    function loadFN(callback, url) {
      return function fn(e) {
        var el = e.currentTarget || e.srcElement;
        if (e.type === 'load' || readyStateLoadedRgx.test(el.readyState)) {
          //dependency is loaded successfully
          if (typeof callback === 'function') {
            callback('success');
          }
        }
        if (el.detachEvent && !isOldOpera) {
          el.detachEvent('onreadystatechange', fn);
        } else {
          el.removeEventListener('load', fn, false);
        }
      };
    }

    function errorFN(callback) {
      return function fn(e) {
        var el = e.currentTarget || e.srcElement;
        if (e.type === 'load' || readyStateLoadedRgx.test(el.readyState)) {
          if (typeof callback === 'function') {
            callback('error');
          }
        }
        if (typeof el.removeEventListener === 'function') {
          el.removeEventListener('error', fn, false);
        }
      };
    }

    function getScript(url, callback) {
      var el = createScript(),
        scriptUrl = getUrl(url);

      if (el.attachEvent && !isOldOpera) {
        el.attachEvent('onreadystatechange', loadFN(callback, scriptUrl));
      } else {
        el.addEventListener('load', loadFN(callback, scriptUrl), false);
        el.addEventListener('error', errorFN(callback), false);
      }

      if (baseElement) {
        head.insertBefore(el, baseElement);
      } else {
        head.appendChild(el);
      }
      el.src = scriptUrl;
    }

    function executeFN(fn, args) {
      var fnData;
      if (!isArray(args)) {
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

      if (isArray(callbacks)) {
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
        moduleName = getFileName(modulePath);

      if (installed[moduleName]) {
        callback(modules[moduleName]);
      } else {
        if (!isArray(waitingList[moduleName])) {
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
      else if (isArray(moduleName)) {
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
        moduleName = getFileName(document.currentScript.src);
      }

      definedModules[moduleName] = true;

      if (isArray(array) && array.length) {
        loadModules(array, function () {
          var args = [],
            i = 0,
            len = array.length;
          for (; i < len; i += 1) {
            args.push(modules[getFileName(array[i])]);
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

      if (isArray(array) && array.length) {
        loadModules(array, function () {
          var args = [],
            i = 0,
            len = array.length;
          for (; i < len; i += 1) {
            args.push(modules[getFileName(array[i])]);
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

      var key;

      for (key in cnfOptions) {
        if (cnfOptions.hasOwnProperty(key)) {
          options[key] = cnfOptions[key];
        }
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
