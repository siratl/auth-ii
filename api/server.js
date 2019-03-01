const express = require('express');

const configureMiddleware = require('./middleware');
const authRouter = require('../auth/authRouter');
const usersRouter = require('../users/usersRoutes');

const server = express();

configureMiddleware(server);

server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

module.exports = server;
