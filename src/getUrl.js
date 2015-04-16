define([
  './var/urlCache',
  './makeUrl'
], function (urlCache, makeUrl) {
  function getUrl(url) {
    return urlCache[url] || (urlCache[url] = makeUrl(url));
  }
  return getUrl;
});