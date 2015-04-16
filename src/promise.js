define([
  './will',
  './GeneratorFunction',
  './utils/isGenerator',
  './utils/isArray',
  './utils/isFunction',
  './utils/isPromiseAlike'
], function (will, GeneratorFunction, isGenerator, isArray, isFunction, isPromiseAlike) {
  var NativePromise = global.Promise,
    genCache = new Map();

  //A function by Forbes Lindesay which helps us code in synchronous style
  //using yield keyword, whereas the actual scenario is an asynchronous process
  //https://www.promisejs.org/generators/
  function forbesAsync(makeGenerator) {
    return function () {
      var generator = makeGenerator.apply(this, arguments);

      function handle(result) {
        // result => { done: [Boolean], value: [Object] }
        if (result.done) return Promise.resolve(result.value);

        return Promise.resolve(result.value).then(function (res) {
          return handle(generator.next(res));
        }, function (err) {
          return handle(generator.throw(err));
        });
      }

      try {
        return handle(generator.next());
      } catch (ex) {
        return Promise.reject(ex);
      }
    };
  }

  function async(makeGenerator) {
    var asyncGenerator;
    if (genCache.has(makeGenerator)) {
      return genCache.get(makeGenerator);
    }
    asyncGenerator = forbesAsync(makeGenerator);
    genCache.set(makeGenerator, asyncGenerator);
    return asyncGenerator;
  }

  GeneratorFunction.prototype.async = function () {
    return async(this);
  };
  GeneratorFunction.prototype.go = function () {
    return this.async().apply(undefined, arguments);
  };
  // Note: It is up to devs who use this prototype function to first check if isArray(args)
  GeneratorFunction.prototype.goWith = function (args) {
    return this.async().apply(undefined, args);
  };
  GeneratorFunction.prototype.goThen = function (onFulfilled, onRejected) {
    return this.goWith().then(onFulfilled, onRejected);
  };

  function makeAsync(fn) {
    return isGenerator(fn) ? fn.async() : fn;
  }

  function Promise(fn) {
    this.promise = isPromiseAlike(fn) ? fn : new NativePromise(makeAsync(fn));
  }
  Promise.prototype.then = function (onFulfilled, onRejected) {
    return new Promise(this.promise.then(makeAsync(onFulfilled), makeAsync(onRejected)));
  };
  Promise.prototype['catch'] = function (onRejected) {
    return new Promise(this.promise['catch'](makeAsync(onRejected)));
  };
  Promise.prototype.done = function (onFulfilled, onRejected) {
    will(this.promise).done(makeAsync(onFulfilled), makeAsync(onRejected));
  };
  Promise.all = function (obj) {
    return new Promise(NativePromise.all(obj));
  };
  Promise.race = function (obj) {
    return new Promise(NativePromise.race(obj));
  };
  Promise.resolve = function (obj) {
    return new Promise(NativePromise.resolve(obj));
  };
  Promise.reject = function (obj) {
    return new Promise(NativePromise.reject(obj));
  };
  Promise.async = async;
  return Promise;
});