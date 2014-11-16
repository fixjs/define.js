fix.define([], function () {

  function Core() {
    this._version = '0.0.1';
  }

  Core.prototype.getVersion = function () {
    return this._version;
  };

  return new Core();
});
