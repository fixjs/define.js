define(function () {
  function will(promise) {
    return {
      done: function (onFulfilled, onRejected) {
        var self = arguments.length ? promise.then.apply(promise, arguments) : promise;
        self.then(null, function (err) {
          setTimeout(function () {
            throw err;
          }, 0);
        });
      }
    };
  }
  return will;
});