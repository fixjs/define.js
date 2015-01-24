define([
  './var/doc',
  './var/info',
  './utils.getFileName',
  './baseInfo'
], function (doc, info, utils, baseInfo) {
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

  return utils;
});