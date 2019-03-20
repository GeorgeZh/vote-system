const redis = require('redis');
const bluebird = require('bluebird');

const config = require('../Configs');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class Redis {
  constructor() {
    this.redisClient = redis.createClient({
      port: config.db.redis.port,
      host: config.db.redis.host,
      password: config.db.redis.password ? config.db.redis.password : ''
    });
    this.redisClient.on("error", function (err) {
      console.log(err)
    });
  }

  getClient() {
    return this.redisClient;
  }
}

module.exports = new Redis();