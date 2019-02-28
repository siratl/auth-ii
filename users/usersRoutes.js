const express = require('express');

const knex = require('knex');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const knexConfig = require('../knexfile.js');

const db = knex(knexConfig.development);

const secret = 'keep this secret safe';

//************ GENERATE TOKEN ***************/
function generateToken(user) {
  const payload = {
    username: user.username,
  };

  const options = {
    expiresIn: '1h',
    jwtid: '54321',
  };
  return jwt.sign(payload, secret, options);
}

//********** RESTRICTING MIDDLEWARE ************/
function restricted(req, res, next) {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: 'Invalid Credentials' });
      } else {
        next();
      }
    });
  } else {
    res.status(401).json({ message: 'No Credentials provided' });
  }
}

//******************** REGISTER NEW USER ******************/
router.post('/register', (req, res) => {
  const user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  db('users')
    .insert(user)
    .then(ids => {
      const id = ids[0];

      const token = generateToken(user);
      res.status(201).json({ id, token });
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

//******************** LOGIN USER ******************/
router.post('/login', (req, res) => {
  const { username, department, password } = req.body;
  const creds = { username, department, password };

  db('users')
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        const token = makeToken(user);

        res.status(200).json({ token });
      } else {
        res.status(401).json({ message: 'You shall not pass!' });
      }
    })
    .catch(err => res.status(500).send(err));
});

//******************** GET ALL USERS ******************/
router.get('/users', restricted, (req, res) => {
  db('users')
    .select('id', 'username', 'password', 'department')
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

module.exports = router;
