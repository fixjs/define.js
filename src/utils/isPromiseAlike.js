define([
  './isFunction',
  './isObjectLike'
], function (isFunction, isObjectLike) {
  function isPromiseAlike(obj) {
    return isObjectLike(obj) && isFunction(obj.then) || false;
  }
  return isPromiseAlike;
});