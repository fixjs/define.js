define([
  './isObjectLike',
  './isLength',
  './var/objToString',
  './var/tags'
], function (isObjectLike, isLength, objToString, tags) {
  var isArray = Array.isArray || function (value) {
    return (isObjectLike(value) && isLength(value.length) && objToString.call(value) === tags.array) || false;
  };
  return isArray;
});