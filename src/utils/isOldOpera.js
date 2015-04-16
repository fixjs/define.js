define([
  './var/tags',
  './isObjectLike'
], function (tags, isObjectLike) {
  var isOldOpera = isObjectLike(global.opera) && global.opera.toString() === tags.opera;
  return isOldOpera;
});