function ConvertHandler() {
  const units = {
    gal: { symbol: 'gal', returnUnit: 'L', name: 'gallons' },
    l: { symbol: 'L', returnUnit: 'gal', name: 'liters' },
    mi: { symbol: 'mi', returnUnit: 'km', name: 'miles' },
    km: { symbol: 'km', returnUnit: 'mi', name: 'kilometers' },
    lbs: { symbol: 'lbs', returnUnit: 'kg', name: 'pounds' },
    kg: { symbol: 'kg', returnUnit: 'lbs', name: 'kilograms' }
  };

  function splitInput(input) {
    const value = input.trim();
    const unitIndex = value.search(/[a-z]/i);
    return {
      number: (unitIndex === -1 ? value : value.slice(0, unitIndex)).trim(),
      unit: unitIndex === -1 ? '' : value.slice(unitIndex).toLowerCase()
    };
  }

  function unitData(unit) {
    if (typeof unit !== 'string') return null;
    const key = unit.toLowerCase();
    return Object.prototype.hasOwnProperty.call(units, key) ? units[key] : null;
  }

  this.getNum = function(input) {
    if (typeof input !== 'string') return 'invalid number';
    const number = splitInput(input).number;
    if (number === '') return 1;

    const parts = number.split('/');
    const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
    if (parts.length > 2 || !parts.every(function(part) { return decimal.test(part); })) {
      return 'invalid number';
    }

    const numerator = Number(parts[0]);
    const denominator = parts.length === 2 ? Number(parts[1]) : 1;
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return 'invalid number';
    }

    const result = numerator / denominator;
    return Number.isFinite(result) ? result : 'invalid number';
  };

  this.getUnit = function(input) {
    if (typeof input !== 'string') return 'invalid unit';
    const unit = unitData(splitInput(input).unit);
    return unit ? unit.symbol : 'invalid unit';
  };

  this.getReturnUnit = function(initUnit) {
    const unit = unitData(initUnit);
    return unit ? unit.returnUnit : 'invalid unit';
  };

  this.spellOutUnit = function(unit) {
    const data = unitData(unit);
    return data ? data.name : 'invalid unit';
  };

  this.convert = function(initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;
    let result;

    if (typeof initNum !== 'number' || !Number.isFinite(initNum)) return 'invalid number';
    if (typeof initUnit !== 'string') return 'invalid unit';
    switch (initUnit.toLowerCase()) {
      case 'gal': result = initNum * galToL; break;
      case 'l': result = initNum / galToL; break;
      case 'lbs': result = initNum * lbsToKg; break;
      case 'kg': result = initNum / lbsToKg; break;
      case 'mi': result = initNum * miToKm; break;
      case 'km': result = initNum / miToKm; break;
      default: return 'invalid unit';
    }

    return Number.isFinite(result) ? Number(result.toFixed(5)) : 'invalid number';
  };

  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    return initNum + ' ' + this.spellOutUnit(initUnit) + ' converts to ' +
      returnNum + ' ' + this.spellOutUnit(returnUnit);
  };
}

module.exports = ConvertHandler;
