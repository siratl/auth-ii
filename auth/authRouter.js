const router = require('express').Router();
const knex = require('knex');
const knexConfig = require('../knexfile.js');

const bcrypt = require('bcryptjs');
const tokenService = require('./tokenService');
const db = knex(knexConfig.development);

//******************** REGISTER NEW USER ******************/
router.post('/register', (req, res) => {
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
          const token = tokenService.generateToken(user);
          res.status(201).json({ id: user.id, token });
        })
        .catch(err => res.status(500).send(err));
    })
    .catch(err => res.status(500).send(err));
});

//******************** LOGIN USER ******************/
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const creds = { username, password };

  db('users')
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        const token = tokenService.generateToken(user);

        res
          .status(200)
          .json({
            message: `Welcome ${user.username}! Token saved...`,
            token,
            roles: token.roles,
          });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(err => res.status(500).send(err));
});

module.exports = router;
