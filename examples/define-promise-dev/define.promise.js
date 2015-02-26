/**
 * DefineJS v0.2.4 2015-02-26T17:26Z
 * Copyright (c) 2014 Mehran Hatami and define.js contributors.
 * Available via the MIT license.
 * license found at http://github.com/fixjs/define.js/raw/master/LICENSE
 */
(function (g, undefined) {
  
  var global = g();
  //The official polyfill for promise.done()
  if (typeof Promise.prototype.done !== 'function') {
    Promise.prototype.done = function () {
      var self = arguments.length ? this.then.apply(this, arguments) : this;
      self.then(null, function (err) {
        setTimeout(function () {
          throw err;
        }, 0);
      });
    };
  }
  var info = {
    options: {
      paths: null
    },
    modules: {},
    installed: {},
    waitingList: {},
    failedList: {},
    definedModules: {}
  };

  var emptyArray = [];


  /* exported:true */
  var
  //Part of the utils functions are borrowed from lodash
    MAX_SAFE_INTEGER = Math.pow(2, 53) - 1,
    arrayTag = '[object Array]',
    funcTag = '[object Function]',
    objToString = Object.prototype.toString,
    isArray,
    isFunction;

  function isObject(value) {
    // Avoid a V8 JIT bug in Chrome 19-20.
    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
    var type = typeof value;
    return type === 'function' || (value && type === 'object') || false;
  }

  function isObjectLike(value) {
    return (value && typeof value === 'object') || false;
  }

  function isLength(value) {
    return typeof value === 'number' && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER;
  }

  isArray = Array.isArray || function (value) {
    return (isObjectLike(value) && isLength(value.length) && objToString.call(value) === arrayTag) || false;
  };

  isFunction = function (value) {
    // Avoid a Chakra JIT bug in compatibility modes of IE 11.
    // See https://github.com/jashkenas/underscore/issues/1621 for more details.
    return typeof value === 'function' || false;
  };
  // Fallback for environments that return incorrect `typeof` operator results.
  if (isFunction(/x/) || (Uint8Array && !isFunction(Uint8Array))) {
    isFunction = function (value) {
      return objToString.call(value) === funcTag;
    };
  }

  function extend(base, obj) {
    var key;
    if (isObject(base) && isObject(obj)) {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          base[key] = obj[key];
        }
      }
    }
    return base;
  }

  function utils(name, obj) {
    if (typeof name === 'string') {
      utils[name] = obj;
    } else if (isObject(name)) {
      extend(utils, name);
    }
    return utils;
  }

  utils({
    extend: extend,
    isArray: isArray,
    isFunction: isFunction,
    isObject: isObject,
    isObjectLike: isObjectLike,
    isPromiseAlike: function (obj) {
      return obj && isFunction(obj.then) || false;
    }
    /* exported:false */
  });

  utils.execute = function (fn, args) {
    var fnData;
    if (utils.isFunction(fn)) {
      if (!utils.isArray(args)) {
        args = emptyArray;
      }
      try {
        fnData = fn.apply(undefined, args);
      } catch (ignore) {}
    }
    return fnData;
  };

  function setup(moduleName, moduleDefinition, loader, args) {
    var moduleData = utils.execute(moduleDefinition, args);

    function setupModule(value) {
      if (value) {
        info.modules[moduleName] = value;
      } else {
        info.modules[moduleName] = moduleData;
      }
      loader.install(moduleName, 'success');
    }

    if (utils.isPromiseAlike(moduleData)) {
      moduleData.then(setupModule);
    } else {
      setTimeout(setupModule, 0);
    }
  }

  var genCache = new Map();

  //A function by Forbes Lindesay which helps us code in synchronous style
  //using yield keyword, whereas the actual scenario is an asynchronous process
  //https://www.promisejs.org/generators/
  function forbesAsync(makeGenerator) {
    return function () {
      var generator = makeGenerator.apply(this, arguments);
      console.log('>>>>generator covered:10');
      function handle(result) {
        console.log('>>>>handle covered:12');
        // result => { done: [Boolean], value: [Object] }
        if (result.done) return Promise.resolve(result.value);

        return Promise.resolve(result.value).then(function (res) {
          console.log('>>>>Promise.resolve covered:17');
          return handle(generator.next(res));
        }, function (err) {
          console.log('>>>>rejection covered:20');
          return handle(generator.throw(err));
        });
      }

      try {
        console.log('>>>>try handle call covered:26');
        return handle(generator.next());
      } catch (ex) {
        console.log('>>>>catch covered:29');
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

  async.Promise = function asyncPromise(starredFN) {
    return new Promise(async(starredFN));
  };
  var doc = global.document;


  function baseInfo() {
    var currentScript = doc.currentScript,
      filePathRgx = /^(.*[\\\/])/;
    //script injection when using BASE tag is now supported
    baseInfo.head = doc.head || doc.getElementsByTagName('head')[0];
    baseInfo.baseElement = doc.getElementsByTagName('base')[0];

    if (baseInfo.baseElement) {
      baseInfo.head = baseInfo.baseElement.parentNode;
    }

    //phantomjs does not provide the "currentScript" property in global document object
    if (currentScript) {
      baseInfo.baseUrl = currentScript.getAttribute('base') || currentScript.src.match(filePathRgx)[1];
      baseInfo.baseGlobal = currentScript.getAttribute('global');
    } else {
      baseInfo.baseUrl = '';
    }
  }
  
  baseInfo();

  var files = {},
    cleanUrlRgx = /[\?|#]([^]*)$/,
    fileNameRgx = /\/([^/]*)$/,
    cleanExtRgx = /.*?(?=\.|$)/;
  utils.matchUrl = function (url) {
    var fileName,
      matchResult;
    url = url.replace(cleanUrlRgx, '');
    fileName = (matchResult = url.match(fileNameRgx)) ? matchResult[1] : url;
    fileName = fileName.match(cleanExtRgx)[0];
    return fileName;
  };
  utils.getFileName = function (url) {
    return files[url] || (files[url] = utils.matchUrl(url));
  };

  
  var urlCache = {};
  utils.getUrl = function (modulePath) {
    var moduleName = utils.getFileName(modulePath);
    return urlCache[moduleName] || (urlCache[moduleName] = utils.makeUrl(modulePath));
  };
  utils.makeUrl = function (modulePath) {
    var url,
      urlArgs,
      path,
      pathUrl;

    urlArgs = (typeof info.options.urlArgs === 'string') ?
      ('?' + info.options.urlArgs) :
      (typeof info.options.urlArgs === 'function') ? ('?' + info.options.urlArgs()) : '';

    if (info.options.baseUrl) {
      url = info.options.baseUrl;
    } else {
      url = baseInfo.baseUrl;
    }

    if (utils.isObject(info.options.paths)) {
      for (path in info.options.paths) {
        if (info.options.paths.hasOwnProperty(path)) {
          pathUrl = info.options.paths[path];

          if (typeof pathUrl === 'string' &&
            modulePath.indexOf(path + '/') === 0) {
            modulePath = modulePath.replace(path, pathUrl);
            break;
          }

        }
      }
    }
    if (url && url.charAt(url.length - 1) !== '/' && modulePath.charAt(0) !== '/') {
      url += '/';
    }
    url += modulePath + '.js' + urlArgs;
    return url;
  };

  var
    isOldOpera = typeof global.opera !== 'undefined' && global.opera.toString() === '[object Opera]',
    readyStateLoadedRgx = /^(complete|loaded)$/;

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

  utils.createScript = function (url, callback, errorCallback) {
    var el;
    //in case DefineJS were used along with something like svg in XML based use-cases,
    //then "xhtml" should be set to "true" like config({ xhtml: true });
    if (info.options.xhtml) {
      el = doc.createElementNS('http://www.w3.org/1999/xhtml', 'script');
    } else {
      el = doc.createElement('script');
    }
    el.async = true;
    el.type = info.options.scriptType || 'text/javascript';
    el.charset = 'utf-8';

    url = utils.getUrl(url);

    if (el.attachEvent && !isOldOpera) {
      el.attachEvent('onreadystatechange', loadFN(callback));
    } else {
      el.addEventListener('load', loadFN(callback), false);
      el.addEventListener('error', errorFN(errorCallback), false);
    }

    if (baseInfo.baseElement) {
      baseInfo.head.insertBefore(el, baseInfo.baseElement);
    } else {
      baseInfo.head.appendChild(el);
    }

    el.src = url;

    return el;
  };

  utils('getScript', function (url) {
    return new Promise(function (fulfill, reject) {
      return utils.createScript(url, fulfill, reject);
    });
  });

  var globalPromise = new Promise(function (fulfill) {
      fulfill(global);
    }),
    promiseStorage = {
      global: globalPromise,
      g: globalPromise
    },
    loader;

  loader = {
    install: function install(moduleName, status) {
      var callbacks,
        fulfill, reject,
        i,
        len;

      if (status === 'success') {
        if (!info.installed[moduleName]) {
          info.installed[moduleName] = true;
        }
      } else {
        info.failedList[moduleName] = true;
      }

      callbacks = info.waitingList[moduleName];

      if (utils.isArray(callbacks)) {
        i = 0;
        len = callbacks.length;

        for (; i < len; i += 1) {
          fulfill = callbacks[i][0];
          reject = callbacks[i][1];
          try {
            fulfill(info.modules[moduleName]);
          } catch (e) {
            reject(e);
          }
        }
        info.waitingList[moduleName] = [];
      }
    },
    load: function load(modulePath) {
      if (promiseStorage[modulePath] === undefined) {
        promiseStorage[modulePath] = loader.loadPromise(modulePath);
      }
      return promiseStorage[modulePath];
    },
    loadPromise: function loadPromise(modulePath) {
      return async.Promise(function * (fulfill, reject) {
        var isFirstLoadDemand = false,
          moduleName = utils.getFileName(modulePath),
          status,
          fileName,
          modulesList;

        if (info.installed[moduleName]) {
          if (info.modules[moduleName] !== undefined) {
            fulfill(info.modules[moduleName]);
          } else {

            //REVIEW NEEDED
            info.installed[moduleName] = undefined;

            reject(new Error(moduleName + ': has no returned module definition.'));
          }
        } else {
          if (!utils.isArray(info.waitingList[moduleName])) {
            info.waitingList[moduleName] = [];
            isFirstLoadDemand = true;
          }

          info.waitingList[moduleName].push([fulfill, reject]);

          if (isFirstLoadDemand) {
            //This code blog solves #10 issue but it still needs some review
            if (utils.isObject(info.options.dependencyMap)) {
              for (fileName in info.options.dependencyMap) {
                if (info.options.dependencyMap.hasOwnProperty(fileName)) {
                  modulesList = info.options.dependencyMap[fileName];
                  if (modulesList.indexOf(modulePath) > -1) {
                    modulePath = fileName;
                    break;
                  }
                }
              }
            }
            status = yield utils.getScript(modulePath);
            if (info.definedModules[moduleName] === true) {
              //Do not need to do anything so far
            } else {
              //This code block allows using this library for regular javascript files
              //with no "define" or "require"
              loader.install(moduleName, status);
            }
          }
        }
      });
    },
    loadAll: function loadModules(array) {
      return Promise.all(array.map(loader.load));
    },
    setup: function (moduleName, moduleDefinition, args) {
      setup(moduleName, moduleDefinition, this, args);
    }
  };

  utils.isGenerator = function (fn) {
    if (typeof fn === 'function') {
      //Function.prototype.isGenerator is supported in Firefox 5.0 or later
      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/isGenerator
      if (typeof fn.isGenerator === 'function') {
        return fn.isGenerator();
      }
      return /^function\s*\*/.test(fn.toString());
    }
    return false;
  };

  function defineModuleDefinition() {
    function * defineGenerator(moduleName, array, moduleDefinition) {
      var args;
      info.definedModules[moduleName] = true;
      if (utils.isArray(array) && array.length) {
        args = yield loader.loadAll(array);
      }
      loader.setup(moduleName, moduleDefinition, args);
    }

    function * requireGenerator(array, fn) {
      var args;
      if (utils.isArray(array) && array.length) {
        args = yield loader.loadAll(array);
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
      var args = yield loader.loadAll([modulePath]);
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

  if (typeof exports === 'object') {
    module.exports = defineModuleDefinition();
  } else if (typeof define === 'function' && define.amd) {
    define([], defineModuleDefinition);
  } else {
    var definejs = defineModuleDefinition();
    if (baseInfo.baseGlobal && utils.isObject(global[baseInfo.baseGlobal])) {
      definejs(global[baseInfo.baseGlobal]);
    } else {
      global.definejs = definejs;
    }
  }
}(
  function g() {
    return this;
  }
));
