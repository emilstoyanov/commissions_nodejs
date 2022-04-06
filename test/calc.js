const expect = require('expect.js');
const Calc = require('../src/Calc.js');

describe('Calc.getData()', function() {

  it('should return an object', function() {
    Calc.getData('https://developers.paysera.com/tasks/api/cash-in', (data,error) => {
      expect(data).to.be.an('object');
    })
  })

})  

describe('Calc.roundTo()', function() {

  it('should round a number to upper bound (ceil)', function() {
    expect(Calc.roundTo(1.241, 2)).to.equal(1.25);
    expect(Calc.roundTo(1.22123, 3)).to.equal(1.222);
  })
  
})

describe('Calc.calcCashIn()', function() {

  it('should return fee for cash-in operation', function() {
    expect(Calc.calcCashIn(100, 0.03, 5)).to.equal(0.03);
    expect(Calc.calcCashIn(100000, 0.03, 5)).to.equal(5.00);
  })

})  

describe('Calc.calcCashOutLegal()', function() {

  it('should return fee for cash-out operation for legal persons', function() {
    expect(Calc.calcCashOutLegal(100, 0.3, 0.5)).to.equal(0.50);
    expect(Calc.calcCashOutLegal(1000, 0.3, 0.5)).to.equal(3.00);
  })

})  

describe('Calc.getStartOfWeek()', function() {

  it('should return the start of week', function() {
    expect(Calc.getStartOfWeek("2022-04-06")).to.equal("2022-04-04");
  })

})  

describe('Calc.calcCashNatural()', function() {

  it('should calculate the fee for cash-out operations of natural persons', function() {
    Calc.getSettings(() => {
      Calc.output = [
        { date: '2022-01-06', user_id: 4, user_type: 'natural', type: 'cash_out', operation: { amount: 500, currency: 'EUR' }, fee: 0 },
        { date: '2022-01-07', user_id: 4, user_type: 'natural', type: 'cash_out', operation: { amount: 600, currency: 'EUR' }, fee: 0.3 },
        { date: '2022-01-07', user_id: 4, user_type: 'natural', type: 'cash_out', operation: { amount: 100, currency: 'EUR' }, fee: 0.3 }
      ];
      const line = { date: '2022-01-07', user_id: 4, user_type: 'natural', type: 'cash_out', operation: { amount: 100, currency: 'EUR' }, fee: 0.3 };

      expect(Calc.calcCashNatural(line,Calc.cashOutNatural.percents,Calc.cashOutNatural.week_limit.amount)).to.equal(0.30);
    })
  })

})

describe('Calc.getSettings()', function() {

  it('should retrive all settings from the server', function() {
    Calc.getSettings(() => {
      expect(Calc.cashIn).to.be.an('object');
      expect(Calc.cashOutNatural).to.be.an('object');
      expect(Calc.cashOutLegal).to.be.an('object');
    })

  })

})  

