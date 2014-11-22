define(['conf', 'vendor/rsvp/rsvp'],
  function (conf, RSVP) {

    return (window._rsvpProm=new RSVP.Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();

      req.open('GET', conf.vendor.RSVP);
      req.onreadystatechange = function () {
        if (this.readyState === 4) {

          if (this.status === 200) {
            var jsonObject;
            try {
              jsonObject = JSON.parse(this.responseText);
              //Now the promise could get fulfilled
              resolve(jsonObject);
            } catch (e) {
              reject(new Error(e));
            }
          } else {
            reject(new Error('Bad XHR STATUS:' + this.status));
          }

        }
      };

      req.send(null);
    }));
  });
