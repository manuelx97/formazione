const chaiHttp = require('chai-http');
const chai = require('chai');
let assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('GET /api/convert with a valid input such as 10L', function() {
    return chai.request(server).get('/api/convert').query({ input: '10L' })
      .then(function(res) {
        assert.strictEqual(res.status, 200);
        assert.deepEqual(res.body, {
          initNum: 10,
          initUnit: 'L',
          returnNum: 2.64172,
          returnUnit: 'gal',
          string: '10 liters converts to 2.64172 gallons'
        });
      });
  });

  test('GET /api/convert with an invalid unit such as 32g', function() {
    return chai.request(server).get('/api/convert').query({ input: '32g' })
      .then(function(res) {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body, 'invalid unit');
      });
  });

  test('GET /api/convert with an invalid number such as 3/7.2/4kg', function() {
    return chai.request(server).get('/api/convert').query({ input: '3/7.2/4kg' })
      .then(function(res) {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body, 'invalid number');
      });
  });

  test('GET /api/convert with an invalid number and unit', function() {
    return chai.request(server).get('/api/convert').query({ input: '3/7.2/4kilomegagram' })
      .then(function(res) {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body, 'invalid number and unit');
      });
  });

  test('GET /api/convert without a number, such as kg', function() {
    return chai.request(server).get('/api/convert').query({ input: 'kg' })
      .then(function(res) {
        assert.strictEqual(res.status, 200);
        assert.deepEqual(res.body, {
          initNum: 1,
          initUnit: 'kg',
          returnNum: 2.20462,
          returnUnit: 'lbs',
          string: '1 kilograms converts to 2.20462 pounds'
        });
      });
  });
});
