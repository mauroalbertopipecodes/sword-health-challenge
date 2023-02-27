const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");
const Bluebird = require("bluebird");
const jsonwebtoken = require('jsonwebtoken');
const sequelize = require('./database/database');

require("dotenv").config();
require('./services/crons');
const apiRouter = require('./routes')

fetch.Promise = Bluebird;

const app = express();
const port = process.env.PORT;

app.use(express.static('public'));
app.use(cors());

// Test the database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database!');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
})();

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * This block of code checks if the
 * bearer token exists, and if so,
 * checks if the token is valid, in
 * which case it will attach to the
 * request object a property called
 * "user" with the information stored
 * in the token.
 */
app.use((req, res, next) => {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET, (err, decode) => {
      if (err) req.user = undefined;
      req.user = decode;
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});

app.use('/', apiRouter)

app.listen(port, function () {
  console.log(`Listening for app on port ${port}`);
});
