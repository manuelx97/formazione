const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const { ObjectId } = require('mongodb');
const database = require('../database');
const server = require('../server').createApp({ getDatabase: database.getTestDatabase });

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(15000);
  const project = 'functional-' + new ObjectId().toHexString();
  const otherProject = project + '-other';
  const url = '/api/issues/' + project;
  let collection;
  let fixtures;

  suiteSetup(async function() {
    const db = await database.getTestDatabase();
    collection = db.collection('issues');
  });

  setup(async function() {
    await collection.deleteMany({ project: { $in: [project, otherProject] } });
    const now = new Date();
    function issue(title, creator, assignee, open, target = project) {
      return { _id: new ObjectId(), project: target, issue_title: title,
        issue_text: 'Test description', created_by: creator, assigned_to: assignee,
        status_text: '', open, created_on: now, updated_on: now };
    }
    fixtures = {
      first: issue('First issue', 'Alice', 'Bob', true),
      second: issue('Second issue', 'Alice', 'Eric', true),
      closed: issue('Closed issue', 'Carol', 'Eric', false),
      other: issue('Other project', 'Alice', 'Bob', true, otherProject)
    };
    await collection.insertMany(Object.values(fixtures));
  });

  suiteTeardown(async function() {
    try {
      if (collection) await collection.deleteMany({ project: { $in: [project, otherProject] } });
    } finally {
      await database.closeTestConnection();
    }
  });

  test('Create an issue with every field: POST /api/issues/{project}', async function() {
    const input = { issue_title: 'Full issue', issue_text: 'Every field', created_by: 'Tester',
      assigned_to: 'Maintainer', status_text: 'In progress' };
    const response = await chai.request(server).post(url).type('form').send(input);
    assert.strictEqual(response.status, 200);
    assert.include(response.body, input);
    assert.isTrue(response.body.open);
    assert.match(response.body._id, /^[a-f\d]{24}$/i);
    assert.isFalse(Number.isNaN(Date.parse(response.body.created_on)));
    assert.strictEqual(response.body.created_on, response.body.updated_on);
    assert.notProperty(response.body, 'project');
  });

  test('Create an issue with only required fields: POST /api/issues/{project}', async function() {
    const input = { issue_title: 'Required fields', issue_text: 'Only required', created_by: 'Tester' };
    const response = await chai.request(server).post(url).send(input);
    assert.strictEqual(response.status, 200);
    assert.include(response.body, input);
    assert.strictEqual(response.body.assigned_to, '');
    assert.strictEqual(response.body.status_text, '');
    assert.isTrue(response.body.open);
    assert.isString(response.body._id);
  });

  test('Create an issue with missing required fields: POST /api/issues/{project}', async function() {
    const inputs = [{}, { created_by: 'Tester' },
      { issue_title: ' ', issue_text: 'Description', created_by: 'Tester' },
      { issue_title: 'Title', issue_text: 'Description', created_by: { $ne: null } }];
    for (const input of inputs) {
      const response = await chai.request(server).post(url).send(input);
      assert.strictEqual(response.status, 200);
      assert.deepEqual(response.body, { error: 'required field(s) missing' });
    }
    assert.strictEqual(await collection.countDocuments({ project }), 3);
  });

  test('View issues on a project: GET /api/issues/{project}', async function() {
    const response = await chai.request(server).get(url);
    assert.strictEqual(response.status, 200);
    assert.lengthOf(response.body, 3);
    assert.notInclude(response.body.map(function(issue) { return issue._id; }), fixtures.other._id.toHexString());
    response.body.forEach(function(issue) {
      assert.hasAllKeys(issue, ['_id', 'issue_title', 'issue_text', 'created_by', 'assigned_to',
        'status_text', 'open', 'created_on', 'updated_on']);
    });
    const empty = await chai.request(server).get('/api/issues/' + project + '-empty');
    assert.deepEqual(empty.body, []);
  });

  test('View issues with one filter: GET /api/issues/{project}', async function() {
    const response = await chai.request(server).get(url).query({ created_by: 'Alice' });
    assert.strictEqual(response.status, 200);
    assert.lengthOf(response.body, 2);
    response.body.forEach(function(issue) { assert.strictEqual(issue.created_by, 'Alice'); });
    const byId = await chai.request(server).get(url).query({ _id: fixtures.first._id.toHexString() });
    assert.lengthOf(byId.body, 1);
    assert.strictEqual(byId.body[0]._id, fixtures.first._id.toHexString());
    const invalid = await chai.request(server).get(url).query({ _id: 'not-an-id' });
    assert.deepEqual(invalid.body, []);
  });

  test('View issues with multiple filters: GET /api/issues/{project}', async function() {
    const response = await chai.request(server).get(url).query({ created_by: 'Alice', assigned_to: 'Bob', open: 'true' });
    assert.strictEqual(response.status, 200);
    assert.lengthOf(response.body, 1);
    assert.strictEqual(response.body[0]._id, fixtures.first._id.toHexString());
    const closed = await chai.request(server).get(url).query({ open: 'false' });
    assert.lengthOf(closed.body, 1);
    assert.isFalse(closed.body[0].open);
    const injection = await chai.request(server).get(url + '?created_by[$ne]=Nobody');
    assert.deepEqual(injection.body, []);
  });

  test('Update one field on an issue: PUT /api/issues/{project}', async function() {
    const id = fixtures.first._id.toHexString();
    const response = await chai.request(server).put(url).send({ _id: id, issue_text: 'New text' });
    assert.strictEqual(response.status, 200);
    assert.deepEqual(response.body, { result: 'successfully updated', _id: id });
    const updated = (await chai.request(server).get(url).query({ _id: id })).body[0];
    assert.strictEqual(updated.issue_text, 'New text');
    assert.strictEqual(updated.issue_title, fixtures.first.issue_title);
    assert.strictEqual(Date.parse(updated.created_on), fixtures.first.created_on.getTime());
    assert.isAbove(Date.parse(updated.updated_on), Date.parse(updated.created_on));
    const sameValue = await chai.request(server).put(url).send({ _id: id, issue_text: 'New text' });
    assert.deepEqual(sameValue.body, { result: 'successfully updated', _id: id });
  });

  test('Update multiple fields on an issue: PUT /api/issues/{project}', async function() {
    const id = fixtures.first._id.toHexString();
    const response = await chai.request(server).put(url).send({ _id: id,
      issue_title: 'Updated title', assigned_to: 'Dana', status_text: 'Resolved', open: false });
    assert.strictEqual(response.status, 200);
    assert.deepEqual(response.body, { result: 'successfully updated', _id: id });
    const updated = (await chai.request(server).get(url).query({ _id: id })).body[0];
    assert.include(updated, { issue_title: 'Updated title', assigned_to: 'Dana', status_text: 'Resolved', open: false });
    const reopen = await chai.request(server).put(url).type('form').send({ _id: id, open: 'true' });
    assert.deepEqual(reopen.body, { result: 'successfully updated', _id: id });
    assert.isTrue((await chai.request(server).get(url).query({ _id: id })).body[0].open);
  });

  test('Update an issue with missing _id: PUT /api/issues/{project}', async function() {
    const response = await chai.request(server).put(url).send({ issue_text: 'Cannot update' });
    assert.strictEqual(response.status, 200);
    assert.deepEqual(response.body, { error: 'missing _id' });
    const noBody = await chai.request(server).put(url);
    assert.deepEqual(noBody.body, { error: 'missing _id' });
  });

  test('Update an issue with no fields to update: PUT /api/issues/{project}', async function() {
    const id = fixtures.first._id.toHexString();
    for (const input of [{ _id: id }, { _id: id, issue_title: '', status_text: '' },
      { _id: id, project: otherProject, created_on: '2000-01-01' }]) {
      const response = await chai.request(server).put(url).send(input);
      assert.strictEqual(response.status, 200);
      assert.deepEqual(response.body, { error: 'no update field(s) sent', _id: id });
    }
  });

  test('Update an issue with an invalid _id: PUT /api/issues/{project}', async function() {
    for (const id of [new ObjectId().toHexString(), 'invalid-id', fixtures.other._id.toHexString()]) {
      const response = await chai.request(server).put(url).send({ _id: id, issue_text: 'Cannot update' });
      assert.strictEqual(response.status, 200);
      assert.deepEqual(response.body, { error: 'could not update', _id: id });
    }
    assert.strictEqual((await collection.findOne({ _id: fixtures.other._id })).issue_text, 'Test description');
  });

  test('Delete an issue: DELETE /api/issues/{project}', async function() {
    const id = fixtures.first._id.toHexString();
    const response = await chai.request(server).delete(url).send({ _id: id });
    assert.strictEqual(response.status, 200);
    assert.deepEqual(response.body, { result: 'successfully deleted', _id: id });
    const deleted = await chai.request(server).get(url).query({ _id: id });
    assert.deepEqual(deleted.body, []);
    assert.strictEqual(await collection.countDocuments({ project: otherProject }), 1);
  });

  test('Delete an issue with an invalid _id: DELETE /api/issues/{project}', async function() {
    for (const id of [new ObjectId().toHexString(), 'invalid-id', fixtures.other._id.toHexString()]) {
      const response = await chai.request(server).delete(url).send({ _id: id });
      assert.strictEqual(response.status, 200);
      assert.deepEqual(response.body, { error: 'could not delete', _id: id });
    }
    assert.strictEqual(await collection.countDocuments({ project: otherProject }), 1);
  });

  test('Delete an issue with missing _id: DELETE /api/issues/{project}', async function() {
    const response = await chai.request(server).delete(url);
    assert.strictEqual(response.status, 200);
    assert.deepEqual(response.body, { error: 'missing _id' });
    const empty = await chai.request(server).delete(url).send({ _id: '' });
    assert.deepEqual(empty.body, { error: 'missing _id' });
  });
});
