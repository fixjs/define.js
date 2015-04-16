define([
  './deferImpl',
  './promise'
], function (deferImpl, Promise) {
  var defer = deferImpl(Promise);
  return defer;
});