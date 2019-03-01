const express = require('express');
const knex = require('knex');
const router = express.Router();

const knexConfig = require('../knexfile.js');
const db = knex(knexConfig.development);
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets.js');

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

//******************** CHECKROLE MIDDLEWARE ******************/
// function checkRole(role) {
//   return function(req, res, next) {
//     if (req.decodedJwt.roles && req.decodedJwt.roles.includes(role)) {
//       next();
//     } else {
//       res.status(403).json({ you: 'you have no power here!' });
//     }
//   };
// }

//******************** GET ALL USERS ******************/
router.get('/', restricted, (req, res) => {
  db('users')
    .select('id', 'username', 'password', 'department')
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

module.exports = router;
