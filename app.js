/* eslint-disable array-callback-return */
/* eslint-disable comma-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
const fs = require('fs');
// eslint-disable-next-line import/extensions
const Calc = require('./src/Calc.js');

calculate = () => {
  Calc.getSettings(() => {
    fs.readFile(process.argv[2], 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      try {
        Calc.input = JSON.parse(data);
        Calc.input.map((value) => {
          if (value.type === 'cash_in') {
            value.fee = Calc.calcCashIn(
              value.operation.amount,
              Calc.cashIn.percents,
              Calc.cashIn.max.amount
            );
          } else if (value.type === 'cash_out' && value.user_type === 'juridical') {
            value.fee = Calc.calcCashOutLegal(
              value.operation.amount,
              Calc.cashOutLegal.percents,
              Calc.cashOutLegal.min.amount
            );
          } else if (value.type === 'cash_out' && value.user_type === 'natural') {
            value.fee = Calc.calcCashNatural(
              value,
              Calc.cashOutNatural.percents,
              Calc.cashOutNatural.week_limit.amount
            );
          }
          Calc.output.push(value);
        });

        Calc.output.map((value) => {
          console.log(value.fee.toFixed(2));
        });
      } catch (error) {
        console.log(error.message);
      }
    });
  });
};

calculate();
