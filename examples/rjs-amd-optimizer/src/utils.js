define([], function () {

  var utils = {
    isObject: function (o) {
      return o === Object(o);
    },
    isString: function (o) {
      return typeof o === 'string';
    }
  };

  return utils;
});
