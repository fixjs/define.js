define([
  './toObject',
  './forOwn'
], function (toObject, forOwn) {
  function extend(base, obj) {
    base = toObject(base);
    forOwn(obj, function (value, key) {
      base[key] = value;
    });
    return base;
  }
  return extend;
});