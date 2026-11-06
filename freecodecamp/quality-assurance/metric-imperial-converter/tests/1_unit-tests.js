const chai = require('chai');
let assert = chai.assert;
const ConvertHandler = require('../controllers/convertHandler.js');

let convertHandler = new ConvertHandler();

suite('Unit Tests', function() {
  suite('getNum', function() {
    test('Reads a whole number', function() {
      assert.strictEqual(convertHandler.getNum('32L'), 32);
      assert.strictEqual(convertHandler.getNum('0kg'), 0);
      assert.strictEqual(convertHandler.getNum('-5mi'), -5);
    });

    test('Reads a decimal number', function() {
      assert.strictEqual(convertHandler.getNum('3.2L'), 3.2);
      assert.strictEqual(convertHandler.getNum('.5kg'), 0.5);
      assert.strictEqual(convertHandler.getNum('5.mi'), 5);
    });

    test('Reads a fraction', function() {
      assert.strictEqual(convertHandler.getNum('1/2L'), 0.5);
      assert.strictEqual(convertHandler.getNum('3/4kg'), 0.75);
    });

    test('Reads a fraction containing decimals', function() {
      assert.strictEqual(convertHandler.getNum('2.5/5L'), 0.5);
      assert.strictEqual(convertHandler.getNum('3/1.5kg'), 2);
      assert.strictEqual(convertHandler.getNum('2.5/0.5mi'), 5);
    });

    test('Rejects invalid numbers, double fractions and division by zero', function() {
      ['3/2/3L', '3/7.2/4kg', '1/0kg', '1/0.0L', '1//2mi',
        '2.3.4kg', '/2kg', '2/kg', '.kg', '--2kg'].forEach(function(input) {
        assert.strictEqual(convertHandler.getNum(input), 'invalid number', input);
      });
    });

    test('Defaults to 1 when no numerical input is provided', function() {
      ['gal', 'L', 'mi', 'km', 'lbs', 'kg'].forEach(function(input) {
        assert.strictEqual(convertHandler.getNum(input), 1, input);
      });
    });
  });

  suite('getUnit', function() {
    test('Reads all valid units and normalizes their case', function() {
      const cases = {
        '1gal': 'gal', '1GAL': 'gal', '1GaL': 'gal',
        '2l': 'L', '2L': 'L', '1mi': 'mi', '1MI': 'mi',
        '1km': 'km', '1KM': 'km', '1lbs': 'lbs', '1LBS': 'lbs',
        '1kg': 'kg', '1KG': 'kg', 'kg': 'kg'
      };
      Object.keys(cases).forEach(function(input) {
        assert.strictEqual(convertHandler.getUnit(input), cases[input], input);
      });
    });

    test('Rejects an invalid unit', function() {
      ['32g', '5kilomegagram', '2liter', '10L/gal', '32', '1constructor'].forEach(function(input) {
        assert.strictEqual(convertHandler.getUnit(input), 'invalid unit', input);
      });
    });
  });

  suite('getReturnUnit', function() {
    test('Returns the correct unit for every valid input unit', function() {
      const cases = { gal: 'L', L: 'gal', mi: 'km', km: 'mi', lbs: 'kg', kg: 'lbs' };
      Object.keys(cases).forEach(function(unit) {
        assert.strictEqual(convertHandler.getReturnUnit(unit), cases[unit], unit);
        assert.strictEqual(convertHandler.getReturnUnit(unit.toUpperCase()), cases[unit], unit);
      });
    });
  });

  suite('spellOutUnit', function() {
    test('Spells out every valid unit', function() {
      const cases = {
        gal: 'gallons', L: 'liters', mi: 'miles', km: 'kilometers',
        lbs: 'pounds', kg: 'kilograms'
      };
      Object.keys(cases).forEach(function(unit) {
        assert.strictEqual(convertHandler.spellOutUnit(unit), cases[unit], unit);
      });
    });
  });

  suite('convert', function() {
    test('Converts gal to L', function() {
      assert.strictEqual(convertHandler.convert(1, 'gal'), 3.78541);
      assert.strictEqual(convertHandler.convert(10, 'gal'), 37.8541);
      assert.strictEqual(convertHandler.getString(1, 'gal', 3.78541, 'L'),
        '1 gallons converts to 3.78541 liters');
    });

    test('Converts L to gal', function() {
      assert.strictEqual(convertHandler.convert(1, 'L'), 0.26417);
      assert.strictEqual(convertHandler.convert(10, 'L'), 2.64172);
    });

    test('Converts mi to km', function() {
      assert.strictEqual(convertHandler.convert(1, 'mi'), 1.60934);
      assert.strictEqual(convertHandler.convert(10, 'mi'), 16.0934);
    });

    test('Converts km to mi', function() {
      assert.strictEqual(convertHandler.convert(1, 'km'), 0.62137);
      assert.strictEqual(convertHandler.convert(10, 'km'), 6.21373);
    });

    test('Converts lbs to kg', function() {
      assert.strictEqual(convertHandler.convert(1, 'lbs'), 0.45359);
      assert.strictEqual(convertHandler.convert(10, 'lbs'), 4.53592);
    });

    test('Converts kg to lbs', function() {
      assert.strictEqual(convertHandler.convert(1, 'kg'), 2.20462);
      assert.strictEqual(convertHandler.convert(10, 'kg'), 22.04624);
    });
  });
});
