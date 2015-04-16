define([],
  function () {
    function Core() {
      this.config = 'conf.json';
      this._version = '0.0.2';
    }

    Core.prototype.getVersion = function () {
      return this._version;
    };

    return new Core();
  });
