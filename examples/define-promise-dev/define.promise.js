/**
 * DefineJS v0.2.31
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
    isArray = Array.isArray || isType('Array'),
    genCache = new Map();

  if (typeof Promise.prototype.done !== 'function') {
    Promise.prototype.done = function () {
      var that = arguments.length ? this.then.apply(this, arguments) : this;
      that.then(null, function (err) {
        setTimeout(function () {
          throw err;
        }, 0);
      });
    };
  }

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

  function isGenerator(fn) {
    if (typeof fn === 'function') {
      //Function.prototype.isGenerator is supported in Firefox 5.0 or later
      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/isGenerator
      if (typeof fn.isGenerator === 'function') {
        return fn.isGenerator();
      }
      return /^function\s*\*/.test(fn.toString());
    }
    return false;
  }

  //A function by Forbes Lindesay which helps us code in synchronous style
  //using yield keyword, whereas the actual scenario is an asynchronous process
  //https://www.promisejs.org/generators/
  function forbesAsync(makeGenerator) {
    return function () {
      var generator = makeGenerator.apply(this, arguments);

      function handle(result) {
        // result => { done: [Boolean], value: [Object] }
        if (result.done) return Promise.resolve(result.value);

        return Promise.resolve(result.value).then(function (res) {
          return handle(generator.next(res));
        }, function (err) {
          return handle(generator.throw(err));
        });
      }

      try {
        return handle(generator.next());
      } catch (ex) {
        return Promise.reject(ex);
      }
    };
  }

  function async(makeGenerator) {
    var asyncGenerator;
    if (genCache.has(makeGenerator)) {
      return genCache.get(makeGenerator);
    }
    asyncGenerator = forbesAsync(makeGenerator);
    genCache.set(makeGenerator, asyncGenerator);
    return asyncGenerator;
  }

  function asyncPromise(starredFN) {
    return new Promise(async(starredFN));
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
      head,

      globalPromise = new Promise(function (fulfill) {
        fulfill(global);
      }),
      promiseStorage = {
        global: globalPromise,
        g: globalPromise
      };

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

    function loadFN(callback) {
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

    function loadScript(url) {
      return new Promise(function (fulfill, reject) {
        var el = createScript(),
          scriptUrl = getUrl(url);

        if (el.attachEvent && !isOldOpera) {
          el.attachEvent('onreadystatechange', loadFN(fulfill));
        } else {
          el.addEventListener('load', loadFN(fulfill), false);
          el.addEventListener('error', errorFN(reject), false);
        }

        if (baseElement) {
          head.insertBefore(el, baseElement);
        } else {
          head.appendChild(el);
        }
        el.src = scriptUrl;
      });
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
      var callbacks,
        fulfill, reject,
        i,
        len;

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
          fulfill = callbacks[i][0];
          reject = callbacks[i][1];
          try {
            fulfill(modules[moduleName]);
          } catch (e) {
            reject(e);
          }
        }
        waitingList[moduleName] = [];
      }
    }

    function loadModule(modulePath) {
      if (promiseStorage[modulePath] === undefined) {
        promiseStorage[modulePath] = loadModulePromise(modulePath);
      }
      return promiseStorage[modulePath];
    }

    function loadModulePromise(modulePath) {
      return asyncPromise(function * (fulfill, reject) {
        var isFirstLoadDemand = false,
          moduleName = getFileName(modulePath),
          status,
          fileName,
          modulesList;

        if (installed[moduleName]) {
          if (modules[moduleName] !== undefined) {
            fulfill(modules[moduleName]);
          } else {

            //REVIEW NEEDED
            installed[moduleName] = undefined;

            reject(new Error(moduleName + ': has no returned module definition.'));
          }
        } else {
          if (!isArray(waitingList[moduleName])) {
            waitingList[moduleName] = [];
            isFirstLoadDemand = true;
          }

          waitingList[moduleName].push([fulfill, reject]);

          if (isFirstLoadDemand) {
            //This code blog solves #10 issue but it still needs some review
            if (isObject(options.dependencyMap)) {
              for (fileName in options.dependencyMap) {
                if (options.dependencyMap.hasOwnProperty(fileName)) {
                  modulesList = options.dependencyMap[fileName];
                  if (modulesList.indexOf(modulePath) > -1) {
                    modulePath = fileName;
                    break;
                  }
                }
              }
            }
            status = yield loadScript(modulePath);
            if (definedModules[moduleName] === true) {
              //Do not need to do anything so far
            } else {
              //This code block allows using this library for regular javascript files
              //with no "define" or "require"
              installModule(moduleName, status);
            }
          }
        }
      });
    }

    function loadModules(array) {
      return Promise.all(array.map(loadModule));
    }

    function setUpModule(moduleName, moduleDefinition, args) {
      var moduleData = executeFN(moduleDefinition, args);

      function setUp(value) {
        if (value) {
          modules[moduleName] = value;
        } else {
          modules[moduleName] = moduleData;
        }
        installModule(moduleName, 'success');
      }

      if (isPromiseAlike(moduleData)) {
        moduleData.then(setUp);
      } else {
        setTimeout(setUp, 0);
      }
    }

    function * defineGenerator(moduleName, array, moduleDefinition) {
      var args;
      definedModules[moduleName] = true;
      if (isArray(array) && array.length) {
        args = yield loadModules(array);
      }
      setUpModule(moduleName, moduleDefinition, args);
    }

    function * requireGenerator(array, fn) {
      var args;
      if (isArray(array) && array.length) {
        args = yield loadModules(array);
      }
      executeFN(fn, args);
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
        if (isGenerator(moduleName)) {
          var asyncFunc = async(moduleName);
          return fxdefine(CJS(asyncFunc));
        }
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
      async(defineGenerator)(moduleName, array, moduleDefinition);
    }

    function fxrequire(array, fn) {
      if (typeof array === 'function' && isGenerator(array)) {
        return async(array)();
      }
      if (typeof array === 'string' && typeof fn === 'undefined') {
        return async(loadModuleGenerator)(array);
      }
      async(requireGenerator)(array, fn);
    }

    function * loadModuleGenerator(modulePath) {
      var args = yield loadModules([modulePath]);
      return args[0];
    }

    function promiseUse(array) {
      return new Promise(function (fulfill) {
        fxrequire(array, fulfill);
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
}((function () {
  return this;
}())));