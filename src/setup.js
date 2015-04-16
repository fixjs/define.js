define([
  './var/fix',
  './install',
  './defer',
  './execute',
  './utils/isFunction',
  './utils/isString'
], function (fix, install, defer, execute, isFunction, isString) {
  function setup(name, definition, deps) {
    var dfd = defer();
    if (!isString(name) || !isFunction(definition)) {
      dfd.reject(new TypeError('Expected a string and a function'));
      return;
    } else {
      return execute(definition, deps)
        .then(function (value) {
          fix.modules[name] = value;
          install(name, 'success');
          dfd.resolve(fix.modules[name]);
        });
    }
    return dfd.promise;
  }
  return setup;
});