define([
  './var/tags',
  './var/objToString',
  './isObjectLike'
], function (tags, objToString, isObjectLike) {
  function isString(value) {
    return typeof value === 'string' || (isObjectLike(value) && objToString.call(value) === tags.string);
  }
  return isString;
});