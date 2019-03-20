let process = require('process');

module.exports = {
  host: "smtp.exmail.qq.com",
  email: process.env.SEND_EMAIL,
  password: process.env.SEND_PWD
}