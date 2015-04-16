define([
  './each',
  './isObject'
], function (each, isObject) {
  function extract(base, path) {
    if (typeof path !== 'string') {
      return;
    }
    var parts = path.split('.');
    each(parts, function (part) {
      return isObject(base = base[part]);
    });
    return base;
  }
  return extract;
});