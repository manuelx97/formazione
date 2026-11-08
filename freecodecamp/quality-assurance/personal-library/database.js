'use strict';

const { MongoClient } = require('mongodb');
const connections = new Map();

async function connect(test) {
  const key = test ? 'test' : 'app';
  if (!connections.has(key)) {
    const uri = test
      ? process.env.DB_TEST || 'mongodb://127.0.0.1:27017/fcc_personal_library_test'
      : process.env.DB || 'mongodb://127.0.0.1:27017/fcc_personal_library';
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    const ready = client.connect().then(function() {
      const name = decodeURIComponent(new URL(uri).pathname.slice(1)) ||
        (test ? 'fcc_personal_library_test' : 'fcc_personal_library');
      return client.db(name);
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
  getCollection: async function() { return (await connect(false)).collection('books'); },
  getTestDatabase: function() { return connect(true); },
  close: function() { return close(false); },
  closeTestConnection: function() { return close(true); }
};
