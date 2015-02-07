define(function () {
  var genCache = new Map();

  //The official polyfill for promise.done()
  if (typeof Promise.prototype.done !== 'function') {
    Promise.prototype.done = function () {
      var self = arguments.length ? this.then.apply(this, arguments) : this;
      self.then(null, function (err) {
        setTimeout(function () {
          throw err;
        }, 0);
      });
    };
  }

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

  async.Promise = function asyncPromise(starredFN) {
    return new Promise(async(starredFN));
  };

  return async;
});
