define([
  './var/doc',
  './var/fix',
  './baseInfo',
  './defer',
  './getUrl',
  './utils/isOldOpera'
], function (doc, fix, baseInfo, defer, getUrl, isOldOpera) {
  var readyStateLoadedRgx = /^(complete|loaded)$/;

  function loadFN(callback) {
    return function fn(e) {
      var el = e.currentTarget || e.srcElement;
      if (e.type === 'load' || readyStateLoadedRgx.test(el.readyState)) {
        callback('success');
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
        callback('error');
      }
      if (typeof el.removeEventListener === 'function') {
        el.removeEventListener('error', fn, false);
      }
    };
  }

  function createScript(url) {
    var el,
      dfd = defer();
    //in case DefineJS were used along with something like svg in XML based use-cases,
    //then "xhtml" should be set to "true" like config({ xhtml: true });
    if (fix.options.xhtml) {
      el = doc.createElementNS('http://www.w3.org/1999/xhtml', 'script');
    } else {
      el = doc.createElement('script');
    }
    el.async = true;
    el.type = fix.options.scriptType || 'text/javascript';
    el.charset = 'utf-8';
    
    url = getUrl(url);

    if (el.attachEvent && !isOldOpera) {
      el.attachEvent('onreadystatechange', loadFN(dfd.resolve));
    } else {
      el.addEventListener('load', loadFN(dfd.resolve), false);
      el.addEventListener('error', errorFN(dfd.reject), false);
    }

    if (baseInfo.baseElement) {
      baseInfo.head.insertBefore(el, baseInfo.baseElement);
    } else {
      baseInfo.head.appendChild(el);
    }
    el.src = url;
    return dfd.promise;
  }

  return createScript;
});