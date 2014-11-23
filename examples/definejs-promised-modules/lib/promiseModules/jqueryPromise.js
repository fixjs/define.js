define([
    'promiseModules/mainPromise',
    'vendor/jquery/jquery'
  ],
  function (mainPromise, $) {

    var deferred = $.Deferred(),
      req = new XMLHttpRequest();

    req.open('GET', mainPromise.vendor.jQuery);
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

    return deferred.promise();

  });
