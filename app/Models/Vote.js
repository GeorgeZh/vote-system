const Redis = require('./Redis');
const MysqlPool = require('./MysqlPool');
const MysqlPromise = require('./MysqlPromise');
const ResConstant = require('../Tools/ResConstant');

class Vote {

  /**
   * 设置投票开始和结束时间
   * @param {Int} startVoteTime 
   * @param {Int} endVoteTime 
   */
  async setVoteTime(startVoteTime, endVoteTime) {
    let voteKey = 'votetime';
    let redisClient = Redis.getClient();
    await redisClient.hmsetAsync(voteKey, {
      startVoteTime: startVoteTime,
      endVoteTime: endVoteTime
    });
  }

  /**
   * 获取投票开始和结束时间
   */
  async getVoteTime() {
    let voteKey = 'votetime';
    let redisClient = Redis.getClient();
    let result = await redisClient.hgetallAsync(voteKey);
    return result;
  }

  /**
   * 获取投票缓存信息
   * @param {Int} uid 
   */
  async getCacheInfo(uid) {
    let voteInfoKey = `voteInfo:${uid}`;
    let redisClient = Redis.getClient();
    let result = await redisClient.hgetallAsync(voteInfoKey);
    return result;
  }

  /**
   * 添加投票缓存
   * @param {*} uid 
   * @param {*} voteIds 
   */
  async addCache(uid, voteIds) {
    let voteListKey = 'voteList';
    let voteInfoKey = `voteInfo:${uid}`;
    let redisClient = Redis.getClient();
    await redisClient.hmsetAsync(voteInfoKey, {
      uid: uid,
      voteIds: voteIds,
      createdAt: new Date().getTime()
    });
    await redisClient.lpushAsync(voteListKey, uid);
  }

  /**
   * 添加用户投票信息
   * @param {Int} uid 
   * @param {String} voteIds 
   * @param {Int} createdAt 
   */
  async addVoteList(uid, voteIds, createdAt) {
    let conn = await MysqlPool.getConnectionAsync();
    let voteList = voteIds.split(',');
    try {
      await MysqlPromise.beginTransactionPromise(conn);
      for (let i in voteList) {
        let sql = 'INSERT vote (uid,candidateId,createdAt) VALUES (?,?,?)';
        let args = [uid, voteList[i], createdAt];
        await MysqlPromise.queryPromise(conn, sql, args);
      }
      await MysqlPromise.commitPromise(conn);
    } catch (err) {
      conn.rollback();
      conn.release();
      console.log(`uid:${uid} vote error`);
      throw new Error(ResConstant.CODE_MYSQL_ERROR.key);
    }
  }

  /**
   * 获取投票缓存uid
   * @param {Int} timeout 
   */
  async getUidFromList(timeout) {
    let voteListKey = 'voteList';
    let redisClient = Redis.getClient();
    let result = await redisClient.brpopAsync(voteListKey, timeout);
    if (!result) {
      return false;
    }
    return result[1];
  }

}

module.exports = new Vote();