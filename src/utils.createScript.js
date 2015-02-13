define([
  './var/doc',
  './var/info',
  './baseInfo',
  './utils.getUrl'
], function (doc, info, baseInfo, utils) {
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

  return utils;
});