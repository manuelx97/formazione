'use strict';

const { MongoClient } = require('mongodb');
const connections = new Map();

async function connect(test) {
  const key = test ? 'test' : 'app';
  if (!connections.has(key)) {
    const uri = test
      ? process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/fcc_issue_tracker_test'
      : process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fcc_issue_tracker';
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    const ready = client.connect().then(async function() {
      const databaseName = decodeURIComponent(new URL(uri).pathname.slice(1)) ||
        (test ? 'fcc_issue_tracker_test' : 'fcc_issue_tracker');
      const db = client.db(databaseName);
      await db.collection('issues').createIndex({ project: 1 });
      return db;
    }).catch(async function(error) {
      connections.delete(key);
      await client.close();
      throw error;
    });
    connections.set(key, { client, ready });
  }
  return connections.get(key).ready;
}

async function close(test) {
  const key = test ? 'test' : 'app';
  const connection = connections.get(key);
  if (connection) {
    connections.delete(key);
    await connection.client.close();
  }
}

module.exports = {
  getDatabase: function() { return connect(false); },
  getTestDatabase: function() { return connect(true); },
  close: function() { return close(false); },
  closeTestConnection: function() { return close(true); }
};
