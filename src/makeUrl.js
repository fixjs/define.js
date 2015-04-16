define([
  './var/fix',
  './baseInfo',
  './utils/forOwn'
], function (fix, baseInfo, forOwn) {
  function makeUrl(modulePath) {
    var url,
      urlArgs = (typeof fix.options.urlArgs === 'string') ?
      ('?' + fix.options.urlArgs) :
      (typeof fix.options.urlArgs === 'function') ? ('?' + fix.options.urlArgs()) : '';

    if (fix.options.baseUrl) {
      url = fix.options.baseUrl;
    } else {
      url = baseInfo.baseUrl;
    }

    forOwn(fix.options.paths, function (pathUrl, path) {
      if (typeof pathUrl === 'string' && modulePath.indexOf(path + '/') === 0) {
        modulePath = modulePath.replace(path, pathUrl);
        return false;
      }
    });

    if (url && url.charAt(url.length - 1) !== '/' && modulePath.charAt(0) !== '/') {
      url += '/';
    }
    url += modulePath + '.js' + urlArgs;
    return url;
  }
  return makeUrl;
});