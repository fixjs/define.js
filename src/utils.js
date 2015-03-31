define(function () {
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

  //borrowed from lodash
  /**
   * A specialized version of `_.forEach` for arrays without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function each(array, iteratee) {
    var index = -1,
      length = array.length;
    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  function getNested(base, path) {
    var parts = path.split('.');
    each(parts, function (part) {
      return isObject(base = base[part]);
    });
    return base;
  }

  var utils = {
    extend: extend,
    isArray: isArray,
    isFunction: isFunction,
    isObject: isObject,
    each: each,
    getNested: getNested,
    isObjectLike: isObjectLike,
    isPromiseAlike: function (obj) {
      return obj && isFunction(obj.then) || false;
    }
  };

  return utils;
});