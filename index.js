const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knexConfig = require('./knexfile.js');

const db = knex(knexConfig.development);

const secret = 'keep this secret safe';
const server = express();

server.use(express.json());
server.use(helmet());
server.use(cors());

//************ GENERATE TOKEN ***************/
function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };

  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, secret, options);
}

//********** RESTRICTING MIDDLEWARE ************/
function restricted(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, secret, (err, decodedToken) => {
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

//******************** REGISTER NEW USER ******************/
server.post('/api/register', (req, res) => {
  const { username, password, department } = req.body;
  const creds = { username, password, department };
  const hash = bcrypt.hashSync(creds.password, 10);
  creds.password = hash;

  db('users')
    .insert(creds)
    .then(ids => {
      const id = ids[0];

      db('users')
        .where({ id })
        .first()
        .then(user => {
          const token = generateToken(user);
          res.status(201).json({ id: user.id, token });
        })
        .catch(err => res.status(500).send(err));
    })
    .catch(err => res.status(500).send(err));
});

//******************** LOGIN USER ******************/
server.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const creds = { username, password };

  db('users')
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        const token = generateToken(user);

        res
          .status(200)
          .json({ message: `Welcome ${user.username}! Token saved...`, token });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(err => res.status(500).send(err));
});

//******************** GET ALL USERS ******************/
server.get('/api/users', restricted, (req, res) => {
  db('users')
    .then(users => {
      res.status(200).json({ users });
    })
    .catch();
});

const port = 5000;

server.listen(port, () => console.log(`Server running on port: ${port}`));
