'use strict';

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const database = require('../database');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let bookId;
  const missingBookId = '507f1f77bcf86cd799439011';

  suiteSetup(async function () {
    const collection = await database.getCollection();
    await collection.deleteMany({});
    await collection.insertOne({ title: 'Example Book', comments: [] });
  });

  suiteTeardown(async function () {
    await (await database.getCollection()).deleteMany({});
    await database.close();
  });

  test('#example Test GET /api/books', function (done) {
    chai.request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.notExists(err);
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount');
        assert.property(res.body[0], 'title');
        assert.property(res.body[0], '_id');
        done();
      });
  });

  suite('Routing tests', function () {
    suite('POST /api/books with title => create book object/expect book object', function () {
      test('Test POST /api/books with title', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'The Hobbit' })
          .end(function (err, res) {
            assert.notExists(err);
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'The Hobbit');
            assert.property(res.body, '_id');
            bookId = res.body._id;
            done();
          });
      });

      test('Test POST /api/books with no title given', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function (err, res) {
            assert.notExists(err);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });
    });

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai.request(server)
          .get('/api/books')
          .end(function (err, res) {
            assert.notExists(err);
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            const book = res.body.find(function (item) { return item._id === bookId; });
            assert.exists(book);
            assert.equal(book.title, 'The Hobbit');
            assert.equal(book.commentcount, 0);
            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai.request(server)
          .get('/api/books/' + missingBookId)
          .end(function (err, res) {
            assert.notExists(err);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .get('/api/books/' + bookId)
          .end(function (err, res) {
            assert.notExists(err);
            assert.equal(res.status, 200);
            assert.equal(res.body._id, bookId);
            assert.equal(res.body.title, 'The Hobbit');
            assert.isArray(res.body.comments);
            done();
          });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function () {
      test('Test POST /api/books/[id] with comment', function (done) {
        chai.request(server)
          .post('/api/books/' + bookId)
          .send({ comment: 'A timeless adventure' })
          .end(function (err, res) {
            assert.notExists(err);
            assert.equal(res.status, 200);
            assert.equal(res.body._id, bookId);
            assert.equal(res.body.title, 'The Hobbit');
            assert.include(res.body.comments, 'A timeless adventure');
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function (done) {
        chai.request(server)
          .post('/api/books/' + bookId)
          .send({})
          .end(function (err, res) {
            assert.notExists(err);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function (done) {
        chai.request(server)
          .post('/api/books/' + missingBookId)
          .send({ comment: 'This book does not exist' })
          .end(function (err, res) {
            assert.notExists(err);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function () {
      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .delete('/api/books/' + bookId)
          .end(function (err, res) {
            assert.notExists(err);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', function (done) {
        chai.request(server)
          .delete('/api/books/' + missingBookId)
          .end(function (err, res) {
            assert.notExists(err);
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
    });
  });
});
