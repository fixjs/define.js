define([
  './utils/identity',
  './utils/extend',
  './utils/isArray',
  './utils/isString',
  './utils/isFunction',
  './utils/isObject',
  './utils/each',
  './utils/forOwn',
  './utils/map',
  './utils/extract',
  './utils/isObjectLike',
  './utils/isPromiseAlike',
  './utils/isDeferred',
  './defer'
], function (identity, extend, isArray, isString, isFunction, isObject, each, forOwn, map, extract, isObjectLike, isPromiseAlike, isDeferred, defer) {
  return {
    identity: identity,
    extend: extend,
    isArray: isArray,
    isString: isString,
    isFunction: isFunction,
    isObject: isObject,
    each: each,
    forOwn: forOwn,
    map: map,
    extract: extract,
    isObjectLike: isObjectLike,
    isPromiseAlike: isPromiseAlike,
    isDeferred: isDeferred,
    defer: defer
  };
});