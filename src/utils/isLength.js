define([
  './var/MAX_SAFE_INTEGER'
], function (MAX_SAFE_INTEGER) {
  function isLength(value) {
    return typeof value === 'number' && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER;
  }
  return isLength;
});