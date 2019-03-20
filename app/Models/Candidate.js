const MysqlPool = require('./MysqlPool');
const ResConstant = require('../Tools/ResConstant');
const Redis = require('./Redis');

class Candidate {

  /**
   * 添加候选人
   * @param {String} name 
   */
  async add(name) {
    let sql = `INSERT candidate (name) VALUES (?)`;
    let result = await MysqlPool.queryAsync(sql, name);
    if (!result.insertId) {
      throw new Error(ResConstant.CODE_MYSQL_ERROR.key);
    }
    return result.insertId;
  }

  /**
   * 添加候选人缓存
   * @param {Int} candidateId 
   * @param {String} name 
   */
  async addCache(candidateId, name) {
    let candidateListKey = 'candidateList';
    let candidateKey = `candidateInfo:${candidateId}`;
    let redisClient = Redis.getClient();
    await redisClient.lpushAsync(candidateListKey, candidateId);
    await redisClient.hmsetAsync(candidateKey, {
      candidateId: candidateId,
      name: name,
      voteCount: 0
    });
  }

  /**
   * 删除候选人
   * @param {Int} candidateId 
   */
  async drop(candidateId) {
    let sql = `DELETE FROM candidate WHERE candidateId=?`;
    let result = await MysqlPool.queryAsync(sql, candidateId);
    if (result.affectedRows == 0) {
      return false;
    }
    return true;
  }

  /**
   * 删除候选人缓存
   * @param {Int} candidateId 
   */
  async dropCache(candidateId) {
    let candidateListKey = 'candidateList';
    let candidateKey = `candidateInfo:${candidateId}`;
    let redisClient = Redis.getClient();
    await redisClient.lremAsync(candidateListKey, 0, candidateId);
    await redisClient.hdelAsync(candidateKey, 'candidateId', 'name');
  }

  /**
   * 获取候选人信息
   * @param {Int} candidateId 
   */
  async getCandidateById(candidateId) {
    let sql = `SELECT * FROM candidate WHERE candidateId=? LIMIT 1`;
    let result = await MysqlPool.queryAsync(sql, candidateId);
    if (result.length == 0) {
      return false;
    }
    return result[0];
  }

  /**
   * 修改候选人信息
   * @param {Int} candidateId 
   * @param {String} name 
   */
  async update(candidateId, name) {
    let sql = `UPDATE candidate SET name=? WHERE candidateId=?`;
    let args = [name, candidateId];
    let result = await MysqlPool.queryAsync(sql, args);
    if (result.affectedRows == 0) {
      return false;
    }
    return true;
  }

  /**
   * 修改候选人缓存信息
   * @param {Int} candidateId 
   * @param {String} name 
   */
  async updateCache(candidateId, name) {
    let candidateKey = `candidateInfo:${candidateId}`;
    let redisClient = Redis.getClient();
    await redisClient.hmsetAsync(candidateKey, {
      name: name
    })
  }

  /**
   * 获取候选人列表
   */
  async getList() {
    let sql = 'SELECT * FROM candidate';
    let result = await MysqlPool.queryAsync(sql);
    return result;
  }

  /**
   * 获取候选人缓存列表
   */
  async getCacheList() {
    let candidateListKey = 'candidateList';
    let redisClient = Redis.getClient();
    let result = await redisClient.lrangeAsync(candidateListKey, 0, 999);
    return result;
  }

  /**
   * 获取候选人缓存信息
   * @param {Int} candidateId 
   */
  async getCacheInfo(candidateId) {
    let candidateKey = `candidateInfo:${candidateId}`;
    let redisClient = Redis.getClient();
    let result = await redisClient.hgetallAsync(candidateKey);
    return result;
  }

  /**
   * 候选人投票数加一
   * @param {Int} candidateId 
   */
  async addVoteCount(candidateId) {
    let candidateKey = `candidateInfo:${candidateId}`;
    let voteCountKey = 'voteCount';
    let redisClient = Redis.getClient();
    await redisClient.hincrbyAsync(candidateKey, voteCountKey, 1);
  }

}

module.exports = new Candidate();