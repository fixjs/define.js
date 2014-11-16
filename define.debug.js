/*! define.debug.js v0.1.1a - MIT license */
(function (global, undefined) {

  function defineModuleDefinition() {
    'use strict';

    var
    // @if NODE
      isNode = true,
      // @endif
      doc = global.document,
      currentScript = document.currentScript,

      emptyArray = [],

      options = {},
      files = {},

      // @if DEBUG
      scriptsTiming = {
        timeStamp: {},
        scripts: {}
      },
      debugStorage = {},
      // @endif

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

      if (typeof options.paths === 'object') {
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
        // @if DEBUG
        if (options.captureTiming) {
          scriptsTiming.timeStamp[e.timeStamp] = url;
          scriptsTiming.scripts[url].loadedAt = e.timeStamp;
        }
        // @endif

        //dependency is loaded successfully
        if (typeof callback === 'function') {
          callback('success');
        }
      });

      doc.head.appendChild(elem);

      // @if DEBUG
      if (options.captureTiming) {
        scriptsTiming.scripts[url] = {
          startedAt: new Date().getTime()
        };
      }
      // @endif

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
      g.options = options;

      // @if DEBUG
      g.modules = modules;
      g.installed = installed;
      g.failedList = failedList;
      g.waitingList = waitingList;
      g.scriptsTiming = scriptsTiming;

      g.urlCache = urlCache;
      g.moduleUrls = moduleUrls;
      // @endif
    }

    // @if DEBUG
    /*
     * This way you can reduce the pain of exposing the DefineJS functionality to your global object
     * for instance if your global object is "myGlobal":
     * <script>
     *   var myGlobal = {};
     *   window.myGlobal = myGlobal;
     * </script>
     *
     * you can expose it by adding the global attribute to the script tag like:
     *
     * <script global="myGlobal" src="define.js"></script>
     *
     * Then you can require modules and require them like:
     * myGlobal.define(['dependency'], function(dependency){
     *   //module code
     * });
     *
     * and to require them:
     * myGlobal.require(['dependency'], function(dependency){
     *   console.log(dependency);
     * });
     *
     */
    // @endif
    if (baseGlobal && typeof global[baseGlobal] === 'object') {
      fixDefine(global[baseGlobal]);
    }

    return fixDefine;
  }

  // @if DEBUG
  /*
   * Note:
   * Just remember that the exposed "fixDefine" function provides you a way of exposing the library
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
     *require("define", function(fixDefine){
     *   fixDefine(myGlobal);
     *
     *   //Now you can use it to define and require your modules
     *   myGlobal.require('something', function(something){
     *     doSomthing(something);
     *   });
     * });
     */
    // @endif
    define([], defineModuleDefinition);
  } else {
    // @if DEBUG
    console.warn('Not a good practice! you\'d better add "global" attribute to your script tag!');
    console.warn(
      'But anyway here we go! you could expose the DefineJS by passing your global object to the fixDefine function'
    );
    // @endif
    global.fixDefine = defineModuleDefinition();
  }

}(this));
