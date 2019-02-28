const express = require('express');

const knex = require('knex');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets.js');

const knexConfig = require('../knexfile.js');
const db = knex(knexConfig.development);
const configureMiddleware = require('./middleware');
const authRouter = require('../auth/authRouter');

const server = express();

configureMiddleware(server);
server.use('/api/auth', authRouter);

//********** RESTRICTING MIDDLEWARE ************/
function restricted(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, secrets.jwtSecret, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: 'Invalid token' });
      } else {
        next();
      }
    });
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
}

//******************** GET ALL USERS ******************/
server.get('/api/users', restricted, (req, res) => {
  db('users')
    .then(users => {
      res.status(200).json({ users });
    })
    .catch();
});

module.exports = server;
