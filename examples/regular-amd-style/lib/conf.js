fix.define([],
  function () {

    return function loadConf(callback, onerror) {
      var req = new XMLHttpRequest();
      req.open('GET', 'conf.json');
      req.onreadystatechange = function () {
        if (this.readyState === 4) {
          var jsonObject;
          try {
            jsonObject = JSON.parse(this.responseText);
            callback(jsonObject);
          } catch (e) {
            onerror(e);
          }
        }
      };
      req.send(null);
    };

  });
