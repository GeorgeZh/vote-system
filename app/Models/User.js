const MysqlPool = require('./MysqlPool');
const ResConstant = require('../Tools/ResConstant');
const Redis = require('./Redis');
const UUID = require('uuid');

const ENABLE = 1;
const UNENABLE = -1;

const URLTOKEN_EXPIRE_TIME = 5 * 60;

class User {

  /**
   * 根据email获取用户信息
   * @param {String} email 
   */
  async getUserByEmail(email) {
    let sql = `SELECT * FROM user WHERE email=? LIMIT 1`;
    let result = await MysqlPool.queryAsync(sql, email);
    if (result.length == 0) {
      return false;
    }
    return result[0];
  }

  /**
   * 根据uid获取用户信息
   * @param {Int} uid 
   */
  async getUserByUid(uid) {
    let sql = `SELECT * FROM user WHERE uid=? LIMIT 1`;
    let result = await MysqlPool.queryAsync(sql, uid);
    if (result.length == 0) {
      return false;
    }
    return result[0];
  }

  /**
   * 用户注册
   * @param {String} email 
   * @param {String} password 
   */
  async register(email, password) {
    let sql = `INSERT user (email,password,createdAt,isEnabled) VALUES (?,?,?,?)`;
    let args = [email, password, new Date().getTime(), UNENABLE];
    let result = await MysqlPool.queryAsync(sql, args);
    if (!result.insertId) {
      throw new Error(ResConstant.CODE_MYSQL_ERROR.key);
    }
    return result.insertId;
  }

  /**
   * 保存用户激活urltoken
   * @param {Int} uid 
   */
  async saveUrlToken(uid) {
    let urlTokenKey = `uid:${uid}`;
    let urlToken = UUID.v1();
    let redisClient = Redis.getClient();
    await redisClient.hmsetAsync(urlTokenKey, { urlToken: urlToken });
    await redisClient.expireAsync(urlTokenKey, URLTOKEN_EXPIRE_TIME);
    return urlToken;
  }

  /**
   * 获取激活用户urltoken
   * @param {Int} uid 
   */
  async getUrlToken(uid) {
    let urlTokenKey = `uid:${uid}`;
    let redisClient = Redis.getClient();
    let result = await redisClient.hgetallAsync(urlTokenKey);
    if (!result) {
      return false;
    }
    return result.urlToken;
  }

  /**
   * 激活用户
   * @param {Int} uid 
   */
  async activate(uid) {
    let sql = `UPDATE user SET isEnabled=? WHERE uid=?`;
    let args = [ENABLE, uid];
    let result = await MysqlPool.queryAsync(sql, args);
    if (result.affectedRows == 0) {
      throw new Error(ResConstant.CODE_MYSQL_ERROR.key);
    }
  }

}

module.exports = new User();