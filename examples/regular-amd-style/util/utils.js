fix.define(['core/core'], function (core) {

  var util = {
    version: core.getVersion(),
    isObject: function (o) {
      return o === Object(o);
    }
  };

  return util;
});
