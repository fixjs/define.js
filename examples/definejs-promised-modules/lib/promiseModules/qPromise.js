define([
    'promiseModules/mainPromise',
    'vendor/q/q'
  ],
  function (mainPromise, Q) {

    window.Q = Q;

    var deferred = Q.defer(),
      req = new XMLHttpRequest();

    req.open('GET', mainPromise.vendor.Q);
    req.onreadystatechange = function () {
      if (this.readyState === 4) {

        if (this.status === 200) {
          var jsonObject;
          try {
            jsonObject = JSON.parse(this.responseText);
            //Now the promise could get fulfilled
            deferred.resolve(jsonObject);
          } catch (e) {
            deferred.reject(new Error(e));
          }
        } else {
          deferred.reject(new Error('Bad XHR STATUS:' + this.status));
        }

      }
    };

    req.send(null);

    return deferred.promise;

  });
