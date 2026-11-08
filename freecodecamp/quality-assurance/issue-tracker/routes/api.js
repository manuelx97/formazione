'use strict';

const { ObjectId } = require('mongodb');
const textFields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text'];
const requiredFields = ['issue_title', 'issue_text', 'created_by'];
const validId = function(value) {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
};

module.exports = function(app, getDatabase) {
  app.route('/api/issues/:project')
    .get(async function(req, res, next) {
      const query = { project: req.params.project };
      for (const [field, value] of Object.entries(req.query)) {
        if (typeof value !== 'string') return res.json([]);
        if (field === '_id') {
          if (!validId(value)) return res.json([]);
          query._id = new ObjectId(value);
        } else if (field === 'open') {
          if (value !== 'true' && value !== 'false') return res.json([]);
          query.open = value === 'true';
        } else if (field === 'created_on' || field === 'updated_on') {
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return res.json([]);
          query[field] = date;
        } else if (textFields.includes(field)) {
          query[field] = value;
        } else {
          return res.json([]);
        }
      }
      try {
        const db = await getDatabase();
        const issues = await db.collection('issues').find(query, { projection: { project: 0 } }).toArray();
        return res.json(issues);
      } catch (error) {
        return next(error);
      }
    })
    .post(async function(req, res, next) {
      const body = req.body || {};
      if (requiredFields.some(function(field) {
        return typeof body[field] !== 'string' || body[field].trim() === '';
      })) {
        return res.json({ error: 'required field(s) missing' });
      }
      const now = new Date();
      const issue = {
        issue_title: body.issue_title,
        issue_text: body.issue_text,
        created_by: body.created_by,
        assigned_to: typeof body.assigned_to === 'string' ? body.assigned_to : '',
        status_text: typeof body.status_text === 'string' ? body.status_text : '',
        created_on: now,
        updated_on: now,
        open: true
      };
      try {
        const db = await getDatabase();
        const result = await db.collection('issues').insertOne({ ...issue, project: req.params.project });
        return res.json({ ...issue, _id: result.insertedId });
      } catch (error) {
        return next(error);
      }
    })
    .put(async function(req, res) {
      const body = req.body || {};
      const id = body._id;
      if (!id) return res.json({ error: 'missing _id' });

      const updates = {};
      let invalid = false;
      textFields.forEach(function(field) {
        if (body[field] === undefined || body[field] === null || body[field] === '') return;
        if (typeof body[field] !== 'string') invalid = true;
        else updates[field] = body[field];
      });
      if (body.open !== undefined && body.open !== null && body.open !== '') {
        if (body.open === true || body.open === 'true') updates.open = true;
        else if (body.open === false || body.open === 'false') updates.open = false;
        else invalid = true;
      }
      if (invalid) return res.json({ error: 'could not update', _id: id });
      if (Object.keys(updates).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id: id });
      }
      if (!validId(id)) return res.json({ error: 'could not update', _id: id });
      try {
        const db = await getDatabase();
        const collection = db.collection('issues');
        const query = { project: req.params.project, _id: new ObjectId(id) };
        const existing = await collection.findOne(query);
        if (!existing) return res.json({ error: 'could not update', _id: id });
        updates.updated_on = new Date(Math.max(Date.now(), existing.updated_on.getTime() + 1));
        const result = await collection.updateOne(query, { $set: updates });
        return res.json(result.matchedCount === 1
          ? { result: 'successfully updated', _id: id }
          : { error: 'could not update', _id: id });
      } catch (error) {
        return res.json({ error: 'could not update', _id: id });
      }
    })
    .delete(async function(req, res) {
      const id = (req.body || {})._id;
      if (!id) return res.json({ error: 'missing _id' });
      if (!validId(id)) return res.json({ error: 'could not delete', _id: id });
      try {
        const db = await getDatabase();
        const result = await db.collection('issues').deleteOne({ project: req.params.project, _id: new ObjectId(id) });
        return res.json(result.deletedCount === 1
          ? { result: 'successfully deleted', _id: id }
          : { error: 'could not delete', _id: id });
      } catch (error) {
        return res.json({ error: 'could not delete', _id: id });
      }
    });
};
