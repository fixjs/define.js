var expect = chai.expect;

describe('fixDefine()', function () {
  it('the main fixDefine function', function () {
    expect(fixDefine).to.be.a('function');
  });

  var testGlobal = {};
  
  fixDefine(testGlobal);

  describe('global.define and global.require', function () {
    it('global.define', function () {
      expect(testGlobal.define).to.be.a('function');
    });

    it('global.require', function () {
      expect(testGlobal.require).to.be.a('function');
    });

    // @if DEBUG
    it('global.modules', function () {
      expect(testGlobal.modules).to.be.an('object');
    });
    it('global.installed', function () {
      expect(testGlobal.installed).to.be.an('object');
    });
    it('global.failedList', function () {
      expect(testGlobal.failedList).to.be.an('array');
    });
    it('global.waitingList', function () {
      expect(testGlobal.waitingList).to.be.an('object');
    });
    it('global.scriptsTiming', function () {
      expect(testGlobal.scriptsTiming).to.be.an('object');
    });
    // @endif
  });
});
