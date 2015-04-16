define([
  './isObjectLike'
], function (isObjectLike) {
  function isDeferred(obj) {
    return isObjectLike(obj) && obj.deferred === true;
  }
  return isDeferred;
});