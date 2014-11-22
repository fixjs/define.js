define([],
  function () {
    function Core() {
      this.config = 'conf.json';
    }

    Core.prototype.getVersion = function () {
      return this._version;
    };

    return new Core();
  });
