const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const server = express();

server.use(express.json());
server.use(helmet());
server.use(cors());

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Server running on port: ${port}`));
