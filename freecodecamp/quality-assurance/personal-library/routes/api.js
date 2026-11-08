'use strict';

const { ObjectId } = require('mongodb');
const database = require('../database');

function asObjectId(id) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id
    ? new ObjectId(id)
    : null;
}

function publicBook(book) {
  return {
    _id: book._id.toString(),
    title: book.title,
    comments: book.comments || []
  };
}

module.exports = function (app) {
  app.route('/api/books')
    .get(async function (req, res, next) {
      try {
        const books = await (await database.getCollection())
          .find({})
          .project({ title: 1, comments: 1 })
          .toArray();

        res.json(books.map(function (book) {
          return {
            _id: book._id.toString(),
            title: book.title,
            commentcount: (book.comments || []).length
          };
        }));
      } catch (error) {
        next(error);
      }
    })

    .post(async function (req, res, next) {
      const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
      if (!title) {
        return res.type('text').send('missing required field title');
      }

      try {
        const collection = await database.getCollection();
        const result = await collection.insertOne({ title: title, comments: [] });
        res.json({ _id: result.insertedId.toString(), title: title });
      } catch (error) {
        next(error);
      }
    })

    .delete(async function (req, res, next) {
      try {
        await (await database.getCollection()).deleteMany({});
        res.type('text').send('complete delete successful');
      } catch (error) {
        next(error);
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res, next) {
      const bookId = asObjectId(req.params.id);
      if (!bookId) {
        return res.type('text').send('no book exists');
      }

      try {
        const book = await (await database.getCollection()).findOne({ _id: bookId });
        if (!book) {
          return res.type('text').send('no book exists');
        }
        res.json(publicBook(book));
      } catch (error) {
        next(error);
      }
    })

    .post(async function (req, res, next) {
      const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
      if (!comment) {
        return res.type('text').send('missing required field comment');
      }

      const bookId = asObjectId(req.params.id);
      if (!bookId) {
        return res.type('text').send('no book exists');
      }

      try {
        const result = await (await database.getCollection()).findOneAndUpdate(
          { _id: bookId },
          { $push: { comments: comment } },
          { returnDocument: 'after' }
        );
        const book = result && result.value ? result.value : result;
        if (!book) {
          return res.type('text').send('no book exists');
        }
        res.json(publicBook(book));
      } catch (error) {
        next(error);
      }
    })

    .delete(async function (req, res, next) {
      const bookId = asObjectId(req.params.id);
      if (!bookId) {
        return res.type('text').send('no book exists');
      }

      try {
        const result = await (await database.getCollection()).deleteOne({ _id: bookId });
        if (result.deletedCount === 0) {
          return res.type('text').send('no book exists');
        }
        res.type('text').send('delete successful');
      } catch (error) {
        next(error);
      }
    });
};
