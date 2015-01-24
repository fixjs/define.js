define(function () {
  /* exported:true */
  var objToString = Object.prototype.toString,
    types = {},
    noop = function () {},
    objectTypes = {
      'boolean': 0,
      'function': 1,
      'object': 1,
      'number': 0,
      'string': 0,
      'undefined': 0
    },
    isArray = Array.isArray || isType('Array');

  function isObject(obj) {
    return !!(obj && objectTypes[typeof obj]);
  }

  function extend(base, obj) {
    var key;
    if (isObject(base) && isObject(obj)) {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          base[key] = obj[key];
        }
      }
    }
    return base;
  }

  function isType(type) {
    if (type) {
      return (types[type] || (types[type] = function (arg) {
        return objToString.call(arg) === '[object ' + type + ']';
      }));
    } else {
      return noop;
    }
  }

  function utils(name, obj) {
    if (typeof name === 'string') {
      utils[name] = obj;
    } else if (isObject(name)) {
      extend(utils, name);
    }
    return utils;
  }

  utils({
    extend: extend,
    isArray: isArray,
    isType: isType,
    isObject: isObject,
    isPromiseAlike: function (obj) {
      return obj && isType('Function')(obj.then);
    }
    /* exported:false */
  });

  return utils;
});