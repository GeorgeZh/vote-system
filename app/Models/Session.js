const Redis = require('./Redis');
const UUID = require('uuid');
const SESSION_EXPIRE_TIME = 7 * 24 * 3600;

class Session {

  /**
   * 保存Session
   * @param {Object} {用户id,邮箱,创建时间}
   */
  async save({ uid, email, createdAt = 0 }) {
    let token = UUID.v1();
    let sessionKey = `session:${token}`;
    let redisClient = Redis.getClient();
    await redisClient.hmsetAsync(sessionKey, { uid, email, createdAt, token });
    await redisClient.expireAsync(sessionKey, SESSION_EXPIRE_TIME);
    return token;
  }

}

module.exports = new Session();