const expect = require('expect.js');
const Calc = require('./app.js');

describe('calculate()', function() {

  it('application test - should return an array', function() {
    expect( console.log.calledOnce ).to.be.true;
    expect( console.log ).to.be.true;  
  })
})