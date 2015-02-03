var expect = chai.expect;

describe('definejs()', function () {
  it('the main definejs function', function () {
    expect(definejs).to.be.a('function');
  });

  var testGlobal = {};
  
  definejs(testGlobal);

  describe('global.define and global.require', function () {
    it('global.define', function () {
      expect(testGlobal.define).to.be.a('function');
    });

    it('global.require', function () {
      expect(testGlobal.require).to.be.a('function');
    });

  });
});
