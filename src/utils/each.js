define([
  './toObject',
  './isLength',
  './forOwn'
], function (toObject, isLength, forOwn) {
  function each(array, iteratee) {
    var length = array ? array.length : 0;
    if (!isLength(length)) {
      return forOwn(array, iteratee);
    }
    var index = -1,
      iterable = toObject(array);

    while (++index < length) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return array;
  }
  return each;
});