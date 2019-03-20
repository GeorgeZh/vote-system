let process = require('process');

module.exports = {
  host: process.env.SEND_HOST,
  email: process.env.SEND_EMAIL,
  password: process.env.SEND_PWD
}