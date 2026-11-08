'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const database = require('./database');
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

function createApp(options = {}) {
  const app = express();
  app.use('/public', express.static(path.join(__dirname, 'public')));
  app.use(cors({ origin: '*' })); // For FCC testing purposes only
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/index.html'));
  });
  fccTestingRoutes(app);
  apiRoutes(app, options.getDatabase || database.getDatabase);
  app.get('/:project/', function(req, res) {
    res.sendFile(path.join(__dirname, 'views/issue.html'));
  });
  app.use(function(req, res) {
    res.status(404).type('text').send('Not Found');
  });
  app.use(function(error, req, res, next) {
    res.status(500).json({ error: 'database or request error' });
  });
  return app;
}

const app = createApp();
module.exports = app;
module.exports.createApp = createApp;

if (require.main === module) {
  database.getDatabase().then(function() {
    const port = process.env.PORT || 3002;
    app.listen(port, function() {
      console.log('Issue Tracker listening on port ' + port);
      if (process.env.NODE_ENV === 'test') {
        setTimeout(function() { runner.run(); }, 1500);
      }
    });
  }).catch(function() {
    console.error('Unable to connect to MongoDB. Start MongoDB Server and check MONGO_URI.');
    process.exitCode = 1;
  });
}
