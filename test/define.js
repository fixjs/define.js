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

  });
});
