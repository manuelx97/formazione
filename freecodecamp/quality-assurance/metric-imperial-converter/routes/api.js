'use strict';

const ConvertHandler = require('../controllers/convertHandler.js');

module.exports = function (app) {
  
  let convertHandler = new ConvertHandler();

  app.get('/api/convert', function(req, res) {
    const input = req.query.input;
    const initNum = convertHandler.getNum(input);
    const initUnit = convertHandler.getUnit(input);
    const invalidNumber = initNum === 'invalid number';
    const invalidUnit = initUnit === 'invalid unit';

    if (invalidNumber && invalidUnit) {
      return res.json('invalid number and unit');
    }
    if (invalidNumber) {
      return res.json('invalid number');
    }
    if (invalidUnit) {
      return res.json('invalid unit');
    }

    const returnNum = convertHandler.convert(initNum, initUnit);
    if (returnNum === 'invalid number') {
      return res.json('invalid number');
    }

    const returnUnit = convertHandler.getReturnUnit(initUnit);
    res.json({
      initNum,
      initUnit,
      returnNum,
      returnUnit,
      string: convertHandler.getString(initNum, initUnit, returnNum, returnUnit)
    });
  });
};
