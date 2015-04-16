define(function () {
  /**
   * A specialized version of `_.map` for arrays without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function map(array, iteratee) {
    var index = -1,
      length = array.length,
      result;
    /* jshint ignore:start */
    result = Array(length);
    /* jshint ignore:end */
    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }
  return map;
});