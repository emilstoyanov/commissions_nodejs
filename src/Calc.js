const https = require('https');

class Calc {

  constructor() {
    // settings from the API
    this.cashIn = null;
    this.cashOutNatural = null;
    this.cashOutLegal = null;
    // input and output arrays
    this.input = [];
    this.output = [];
  }

  /** Calls the given url, decodes the data from JSON and calls the callback function fith data and error message if any
  * @param url (string) the url to call
  * @param callback (function) the callback function
  */
  getData = (url, callback) => {
    let data = ''
    https.get(url, (res) => {
      res.on('data', (d) => data += d );
      res.on('end', () => {
        if (res.statusCode !== 200) {
          callback(null, 'Bad status code '+res.statusCode+' for URL: '+url);
        } else {
          try {
            data = JSON.parse(data);
            callback(data, null);
          } catch (error) {
            callback(null, error.message);
          }
        }
      })
    }).on('error', (e) => callback(null, e))
  };

  /** Rounds the given number with given precision
  * @param number (number) the number to be rounded
  * @param precision (number) the presicion for rounding
  * @return (number) the rounded number
  */
  roundTo = (number, precision) => {
    const multiplier = Math.pow(10, precision);
    return Math.ceil(number * multiplier) / multiplier;
  };

  /** Calculates the fee for cash-in operations
  * @param amount (number) the value for calculation
  * @param percents (number) the percent of fee
  * @param maxFee (number) maximal fee
  * @return (number) the calculated fee
  */
  calcCashIn = (amount, percents, maxFee) => {
    const fee = this.roundTo(amount * percents / 100, 2);
    return (fee > maxFee ? maxFee : fee);
  };

  /** Calculates the fee for cash-out operations of legal persons
  * @param amount (number) the value for calculation
  * @param percents (number) the percent of fee
  * @param minFee (number) minimal fee
  * @return (number) the calculated fee
  */
  calcCashOutLegal = (amount, percents, minFee) => {
    const fee = this.roundTo(amount * percents / 100,2);
    return (fee < minFee ? minFee : fee);
  };

  /** Returns the date of monday before given date
  * @param today (date) the date from input file
  * @returns (date) date of monday before given date in format "YYYY-MM-DD"
  */
  getStartOfWeek = (today) => {
    const date = new Date(today);
    const day = date.getDay();
    let startOfWeek = new Date(today);

    if (day === 0) { 
      startOfWeek.setDate(date.getDate() - 6); 
    } else { 
      startOfWeek.setDate(date.getDate() - day + 1); 
    }
    // returnded date is formatted as is in the input file "YYYY-MM-DD"
    return startOfWeek.toISOString().substring(0,10);
  };

  /** Calculates the fee for cash-out operations of natural persons
   * @param line (object) one element from the input file
   * @param percents (number) the percent of fee
   * @param limit (number) weekly limit
   * @return (number) the calculated fee
   */
  calcCashNatural = (line,percents,limit) => {
    const startOfWeek = this.getStartOfWeek(line.date);  // get the first day of week (monday) from given date
    let weekSum = 0;
    let result = 0;

    /**
     * loop the output with already calculated elements to sum 
     * all payments for the user_id in this week from the given element
     */
    for(let i=this.output.length-1; i>=0; i-=1) {
      // prevent loop of all output array
      if (this.output[i].date < startOfWeek) {
        break
      };

      if (this.output[i].user_id === line.user_id && this.output[i].type === 'cash_out') {
        weekSum += this.output[i].operation.amount;
      };
    };

    // check all possible variants and calculate the fee if needed
    if (weekSum >= limit) { 
      // the limit already is exceeded
      result = this.roundTo(line.operation.amount * percents / 100,2); 
    } else {
      if (weekSum + line.operation.amount < limit) { 
        // sum of the week + current amount is less than limit - no fee
        result = 0;
      } else {
        // calculate the fee based on sum of the week + current amount - limit
        result = this.roundTo((weekSum + line.operation.amount - limit) * percents / 100,2);
      };
    };

    return result;
  };

  /** Retrives the settings for all payment types from the API   
   * @param callback (function) the callback function
   */
  getSettings = (callback) => {

    this.getData('https://developers.paysera.com/tasks/api/cash-in',(data,error) => {
      if (!data) {
        console.error(error);
      } else {
        this.cashIn = data;
        this.getData('https://developers.paysera.com/tasks/api/cash-out-natural',(data,error) => {
          if (!data) {
            console.error(error);
          } else {
            this.cashOutNatural = data;
            this.getData('https://developers.paysera.com/tasks/api/cash-out-juridical',(data,error) => {
              if (!data) {
                console.error(error);
              } else {
                this.cashOutLegal = data;
                callback();
              }
            });
          }
        });
      }
    });
    
  }

};

module.exports = new Calc;

