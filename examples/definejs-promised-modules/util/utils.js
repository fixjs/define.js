define(['core/core'],
  function (core) {

    var utils = {
      version: core.getVersion(),
      isObject: function (o) {
        return o === Object(o);
      }
    };

    //expose the utils to the core object
    core.utils = utils;

    return utils;
  });
