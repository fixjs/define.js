/**
 * DefineJS v0.2.4 2015-01-24T01:05Z
 * Copyright (c) 2014 Mehran Hatami and define.js contributors.
 * Available via the MIT license.
 * license found at http://github.com/fixjs/define.js/raw/master/LICENSE
 */
(function (g, undefined) {
  

  var global = g();
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
  var objToString = Object.prototype.toString,
    types = {},
    noop = function () {},
    objectTypes = {
      'boolean': 0,
      'function': 1,
      'object': 1,
      'number': 0,
      'string': 0,
      'undefined': 0
    },
    isArray = Array.isArray || isType('Array');

  function isObject(obj) {
    return !!(obj && objectTypes[typeof obj]);
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

  function isType(type) {
    if (type) {
      return (types[type] || (types[type] = function (arg) {
        return objToString.call(arg) === '[object ' + type + ']';
      }));
    } else {
      return noop;
    }
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
    isType: isType,
    isObject: isObject,
    isPromiseAlike: function (obj) {
      return obj && isType('Function')(obj.then);
    }
    /* exported:false */
  });

  utils('execute', function (fn, args) {
    var fnData;
    if (!utils.isArray(args)) {
      args = emptyArray;
    }
    try {
      fnData = fn.apply(undefined, args);
    } catch (ignore) {}

    return fnData;
  });

  utils('setup', function (moduleName, moduleDefinition, install, args) {
    var moduleData = utils.execute(moduleDefinition, args);

    function setupModule(value) {
      if (value) {
        info.modules[moduleName] = value;
      } else {
        info.modules[moduleName] = moduleData;
      }
      install(moduleName, 'success');
    }

    if (utils.isPromiseAlike(moduleData)) {
      moduleData.then(setupModule);
    } else {
      setTimeout(setupModule, 0);
    }
  });

  var genCache = new Map();

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

  async.Promise = function asyncPromise(starredFN) {
    return new Promise(async(starredFN));
  };
  var doc = global.document;


  var files = {},
    cleanUrlRgx = /[\?|#]([^]*)$/,
    fileNameRgx = /\/([^/]*)$/,
    cleanExtRgx = /.*?(?=\.|$)/;
  utils('getFileName', function (url) {
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
  });

  var currentScript = document.currentScript,
    filePathRgx = /^(.*[\\\/])/,
    //script injection when using BASE tag is now supported
    baseInfo = {
      head: doc.head || doc.getElementsByTagName('head')[0],
      baseElement: doc.getElementsByTagName('base')[0]
    };

  if (baseInfo.baseElement) {
    baseInfo.head = baseInfo.baseElement.parentNode;
  }

  //phantomjs does not provide the "currentScript" property in global document object
  if (currentScript) {
    baseInfo.baseUrl = currentScript.getAttribute('base') || currentScript.src.match(filePathRgx)[1];
    baseInfo.baseGlobal = currentScript.getAttribute('global');
  }

  var
    isOldOpera = typeof global.opera !== 'undefined' && global.opera.toString() === '[object Opera]',
    urlCache = {},
    readyStateLoadedRgx = /^(complete|loaded)$/;

  function getUrl(modulePath) {
    var moduleName = utils.getFileName(modulePath),
      url,
      urlArgs,
      path,
      pathUrl;

    if (typeof urlCache[moduleName] === 'string') {
      return urlCache[moduleName];
    }

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

    if (url.charAt(url.length - 1) !== '/' && modulePath.charAt(0) !== '/') {
      url += '/';
    }

    url += modulePath + '.js' + urlArgs;

    urlCache[moduleName] = url;

    return url;
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

  utils('createScript', function (url, callback, errorCallback) {
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

    url = getUrl(url);

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
  });

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
    moduleLoader;

  moduleLoader = {
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
        promiseStorage[modulePath] = moduleLoader.loadPromise(modulePath);
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
              moduleLoader.install(moduleName, status);
            }
          }
        }
      });
    },
    loadAll: function loadModules(array) {
      return Promise.all(array.map(moduleLoader.load));
    }
  };

  utils('isGenerator', function (fn) {
    if (typeof fn === 'function') {
      //Function.prototype.isGenerator is supported in Firefox 5.0 or later
      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/isGenerator
      if (typeof fn.isGenerator === 'function') {
        return fn.isGenerator();
      }
      return /^function\s*\*/.test(fn.toString());
    }
    return false;
  });

  function defineModuleDefinition() {
    function * defineGenerator(moduleName, array, moduleDefinition) {
      var args;
      info.definedModules[moduleName] = true;
      if (utils.isArray(array) && array.length) {
        args = yield moduleLoader.loadAll(array);
      }
      utils.setup(moduleName, moduleDefinition, moduleLoader.install, args);
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

    function definejs(obj) {
      if (!utils.isObject(obj)) {
        obj = global;
      }
      obj.require = fxrequire;
      obj.define = fxdefine;
      obj.config = fxconfig;
      obj.options = info.options;

      //Nonstandards
      obj.use = promiseUse;

      // @if DEBUG
      obj.info = info;
      // @endif
    }

    return definejs;
  }

// @if DEBUG
  /*
   * Note:
   * Just remember that the exposed "definejs" function provides you a way of exposing the library
   */
  // @endif
  if (typeof exports === 'object') {
    module.exports = defineModuleDefinition();
  } else if (typeof define === 'function' && define.amd) {
    // @if DEBUG
    console.warn('It is funny!');
    console.warn('You already have an amd module loader why do you need me!');
    console.warn('But anyway here we go! you could require it now!');
    /*
     * require("define", function(definejs){
     *   definejs(myGlobal);
     *
     *   //Now you can use it to define and require your modules
     *   //something.js
     *   myGlobal.define(function(){
     *     var something = {};
     *     return something;
     *   });
     *   myGlobal.require('something', function(something){
     *     doSomthing(something);
     *   });
     * });
     */
    // @endif
    define([], defineModuleDefinition);
  } else {
    var definejs = defineModuleDefinition();
    if (baseInfo.baseGlobal && utils.isObject(global[baseInfo.baseGlobal])) {
      definejs(global[baseInfo.baseGlobal]);
    } else {
      // @if DEBUG
      console.warn('Not a good practice! you\'d better add "global" attribute to your script tag!');
      console.warn(
        'But anyway here we go! you could expose the DefineJS by passing your global object to the definejs function'
      );
      // @endif
      global.definejs = definejs;
    }
  }
}(
  function g( /*key, value*/ ) {
    // var global = this;
    // if (key) {
    //   if (value) {
    //     //expose???
    //     global[key] = value;
    //     return g;
    //   } else {
    //     return global[key];
    //   }
    // }
    return this;
  }
));
