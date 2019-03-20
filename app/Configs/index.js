let process = require('process');
let NODE_ENV = process.env.NODE_ENV;

let CONFIG_PATH = 'local';

if (NODE_ENV == 'dev') {
  CONFIG_PATH = 'dev'
}

let db = require(`./${CONFIG_PATH}/db`);
let email = require(`./${CONFIG_PATH}/email`);
let host = require(`./${CONFIG_PATH}/host`);
let admin = require(`./${CONFIG_PATH}/admin`);

module.exports = {
  db: db,
  email: email,
  host: host,
  admin: admin
}