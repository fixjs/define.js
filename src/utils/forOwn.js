define([
  './toObject'
], function (toObject) {
  function forOwn(object, iteratee) {
    var iterable = toObject(object),
      props = Object.keys(iterable),
      length = props.length,
      index = -1,
      key;
    while (++index < length) {
      key = props[index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  }
  return forOwn;
});