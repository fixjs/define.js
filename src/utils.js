define(function () {
  /* exported:true */
  var
  //Part of the utils functions are borrowed from lodash
    MAX_SAFE_INTEGER = Math.pow(2, 53) - 1,
    arrayTag = '[object Array]',
    funcTag = '[object Function]',
    objToString = Object.prototype.toString,
    isArray,
    isFunction;

  function isObject(value) {
    // Avoid a V8 JIT bug in Chrome 19-20.
    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
    var type = typeof value;
    return type === 'function' || (value && type === 'object') || false;
  }

  function isObjectLike(value) {
    return (value && typeof value === 'object') || false;
  }

  function isLength(value) {
    return typeof value === 'number' && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER;
  }

  isArray = Array.isArray || function (value) {
    return (isObjectLike(value) && isLength(value.length) && objToString.call(value) === arrayTag) || false;
  };

  isFunction = function (value) {
    // Avoid a Chakra JIT bug in compatibility modes of IE 11.
    // See https://github.com/jashkenas/underscore/issues/1621 for more details.
    return typeof value === 'function' || false;
  };
  // Fallback for environments that return incorrect `typeof` operator results.
  if (isFunction(/x/) || (Uint8Array && !isFunction(Uint8Array))) {
    isFunction = function (value) {
      return objToString.call(value) === funcTag;
    };
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
    isFunction: isFunction,
    isObject: isObject,
    isObjectLike: isObjectLike,
    isPromiseAlike: function (obj) {
      return obj && isFunction(obj.then) || false;
    }
    /* exported:false */
  });

  return utils;
});