let process = require('process');

module.exports = {
  mysql: {
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'abc123123',
    database: 'vote-system'
  },
  redis: {
    port: '6379',
    host: '127.0.0.1',
    password: '123456'
  }
}