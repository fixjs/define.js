define([
  './deferImpl'
], function (deferImpl) {
  var defer = deferImpl(global.Promise);
  return defer;
});