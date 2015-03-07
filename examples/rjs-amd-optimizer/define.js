/**
 * DefineJS v0.2.4 2015-03-02T07:52Z
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

  utils.getScript = function (url, callback) {
    return utils.createScript(url, callback, callback);
  };

  var loader = {
    install: function install(moduleName, status) {
      var callbacks, fn,
        i, len;

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
          fn = callbacks[i];
          try {
            fn(status);
          } catch (ignored) {}
        }
        callbacks.length = 0;
      }
    },
    load: function load(modulePath, callback) {
      var isFirstLoadDemand = false,
        moduleName = utils.getFileName(modulePath),
        fileName,
        modulesList;

      if (info.installed[moduleName]) {
        callback(info.modules[moduleName]);
      } else {
        if (!utils.isArray(info.waitingList[moduleName])) {
          info.waitingList[moduleName] = [];
          isFirstLoadDemand = true;
        }

        info.waitingList[moduleName].push(callback);

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
          utils.getScript(modulePath, function (status) {
            if (info.definedModules[moduleName] === true) {
              //Do not need to do anything so far
            } else {
              //This code block allows using this library for regular javascript files
              //with no "define" or "require"
              loader.install(moduleName, status);
            }
          });
        }
      }
    },
    loadAll: function loadAll(array, callback) {
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
        loader.load(array[i], pCallback);
      }
    },
    setup: function (moduleName, moduleDefinition, args) {
      setup(moduleName, moduleDefinition, this, args);
    }
  };

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

  function amd() {
    if (amd.definejs) {
      return amd.definejs;
    }

    var definejs = function (_) {
      _ = core(_, amd);

      amd.define = function (moduleName, array, moduleDefinition) {
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
      };

      amd.require = function (array, fn) {
        if (typeof array === 'string') {
          array = [array];
        } else if (typeof array === 'function') {
          fn = array;
          array = [];
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
      };
    };

    amd.definejs = definejs;
    return definejs;
  }

  if (typeof exports === 'object') {
    module.exports = amd();
  } else if (typeof define === 'function' && define.amd) {
    define([], amd);
  } else {
    var definejs = amd();
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
