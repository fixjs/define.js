define([
  './var/info',
  './baseInfo',
  './utils.getFileName'
], function (info, baseInfo, utils) {
  'use strict';
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
    if (url.charAt(url.length - 1) !== '/' && modulePath.charAt(0) !== '/') {
      url += '/';
    }
    url += modulePath + '.js' + urlArgs;
    return url;
  };
  return utils;
});