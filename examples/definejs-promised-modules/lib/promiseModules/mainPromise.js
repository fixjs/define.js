define(['core/core'],
  function (core) {

    return new Promise(function (fulfill, reject) {

      var req = new XMLHttpRequest();

      req.open('GET', core.config);

      req.onreadystatechange = function () {
        if (this.readyState === 4) {

          if (this.status === 200) {
            var jsonObject;
            try {
              jsonObject = JSON.parse(this.responseText);
              //Now the promise could get fulfilled
              fulfill(jsonObject);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error('Bad XHR STATUS:' + this.status));
          }

        }
      };

      req.send(null);

    });

  });
