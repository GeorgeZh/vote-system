const config = require('../Configs');
const bluebird = require('bluebird');
const mysql = require('mysql');

let pool = mysql.createPool({
  connectionLimit: 10,
  host: config.db.mysql.host,
  port: config.db.mysql.port,
  user: config.db.mysql.user,
  password: config.db.mysql.password,
  database: config.db.mysql.database,
  charset: 'utf8mb4'
})

module.exports = bluebird.promisifyAll(pool);