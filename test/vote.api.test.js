const should = require('should');
const supertest = require('supertest');
const app = require('../app');
const TestConfigs = require('./TestConfigs');
const MysqlPool = require('../app/Models/MysqlPool');
const Redis = require('../app/Models/Redis');

const ENABLE = 1;
const UNENABLE = -1;

const TEST_TIMESTAMPT = new Date().getTime();

let GLOBAL_ADMIN_TOKEN = '';
let GLOBAL_USER_TOKEN = '';
let GLOBAL_VOTE_USER_TOKEN = '';

function request() {
  return supertest(app.listen())
}

describe('Admin api test start...', () => {
  before(async () => {
    await cleanTestData();
    await cleanCacheTestData();
    await cleanVoteTestData(TestConfigs.mysql.user[4])
    for (let i in TestConfigs.mysql.user) {
      await initUserMysqlTestData(TestConfigs.mysql.user[i]);
    }
    for (let i in TestConfigs.mysql.candidate) {
      await initCandidateTestData(TestConfigs.redis.candidateList[i]);
    }
    for (let i in TestConfigs.redis.candidateList) {
      await initCandidateCacheTestDate(TestConfigs.redis.candidateList[i]);
    }
    await initVoteCacheTestData(TestConfigs.redis.voteInfo);
    GLOBAL_ADMIN_TOKEN = await initUserSession(TestConfigs.mysql.user[3]);
    GLOBAL_USER_TOKEN = await initUserSession(TestConfigs.mysql.user[2]);
    GLOBAL_VOTE_USER_TOKEN = await initUserSession(TestConfigs.mysql.user[4]);
  });

  after(async () => {
    await cleanTestData();
  });

  describe('#0-0-0 /api/v1/admin/candidate/list', () => {
    let router = '/api/v1/admin/candidate/list'
    it('#0-0-1 管理员获取投票信息', async () => {
      await new Promise((resolve, reject) => {
        request().get(router)
          .set('token', GLOBAL_ADMIN_TOKEN)
          .end(function (err, res) {
            res.body.code.should.be.eql(10000);
            resolve();
          })
      })
    })
    it('#0-0-2 没有权限', async () => {
      await new Promise((resolve, reject) => {
        request().get(router)
          .set('token', GLOBAL_USER_TOKEN)
          .end(function (err, res) {
            res.body.code.should.be.eql(10010);
            resolve();
          })
      })
    })
  })

  describe('#1-0-0 /api/v1/candidate/ballot', () => {
    let router = '/api/v1/candidate/ballot';
    it('#1-0-1 投票人数小于最小值', async () => {
      await setVoteTime({
        startVoteTime: TEST_TIMESTAMPT - 100000,
        endVoteTime: TEST_TIMESTAMPT + 100000
      });
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_VOTE_USER_TOKEN)
          .send({
            voteIds: `${TestConfigs.redis.candidateList[0].candidateId}`
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10002);
            resolve();
          })
      })
    })
    it('#1-0-2 投票人数大于候选人一半', async () => {
      await setVoteTime({
        startVoteTime: TEST_TIMESTAMPT - 100000,
        endVoteTime: TEST_TIMESTAMPT + 100000
      });
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_VOTE_USER_TOKEN)
          .send({
            voteIds: `${TestConfigs.redis.candidateList[0].candidateId},
            ${TestConfigs.redis.candidateList[1].candidateId},
            ${TestConfigs.redis.candidateList[2].candidateId}`
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10002);
            resolve();
          })
      })
    })
    it('#1-0-3 活动未开始', async () => {
      await setVoteTime(TestConfigs.redis.notStartVoteTime);
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_VOTE_USER_TOKEN)
          .send({
            voteIds: `${TestConfigs.redis.candidateList[0].candidateId},
            ${TestConfigs.redis.candidateList[1].candidateId}`
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10011);
            resolve();
          })
      })
    })
    it('#1-0-4 活动已结束', async () => {
      await setVoteTime(TestConfigs.redis.hasOverVoteTime);
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_VOTE_USER_TOKEN)
          .send({
            voteIds: `${TestConfigs.redis.candidateList[0].candidateId},
            ${TestConfigs.redis.candidateList[1].candidateId}`
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10012);
            resolve();
          })
      })
    })
    it('#1-0-5 已投过票', async () => {
      await setVoteTime({
        startVoteTime: TEST_TIMESTAMPT - 100000,
        endVoteTime: TEST_TIMESTAMPT + 100000
      });
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_ADMIN_TOKEN)
          .send({
            voteIds: `${TestConfigs.redis.candidateList[0].candidateId},${TestConfigs.redis.candidateList[1].candidateId}`
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10010);
            resolve();
          })
      })
    })
    it('#1-0-6 候选人重复', async () => {
      await setVoteTime({
        startVoteTime: TEST_TIMESTAMPT - 100000,
        endVoteTime: TEST_TIMESTAMPT + 100000
      });
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_VOTE_USER_TOKEN)
          .send({
            voteIds: `${TestConfigs.redis.candidateList[0].candidateId},${TestConfigs.redis.candidateList[0].candidateId}`
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10002);
            resolve();
          })
      })
    })
    it('#1-0-7 投票成功', async () => {
      await setVoteTime({
        startVoteTime: TEST_TIMESTAMPT - 100000,
        endVoteTime: TEST_TIMESTAMPT + 100000
      });
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_VOTE_USER_TOKEN)
          .send({
            voteIds: `${TestConfigs.redis.candidateList[0].candidateId},${TestConfigs.redis.candidateList[1].candidateId}`
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10001);
            resolve();
          })
      })
    })
  })

})

async function initUserMysqlTestData({ uid, email, md5_password, isEnabled = ENABLE }) {
  let sql = `INSERT user (uid,email,password,createdAt,isEnabled) VALUES (?,?,?,?,?)`;
  let args = [uid, email, md5_password, new Date().getTime(), isEnabled];
  await MysqlPool.queryAsync(sql, args);
}

async function initCandidateTestData({ candidateId, name }) {
  let sql = `INSERT candidate (candidateId,name) VALUES (?,?)`;
  let args = [candidateId, name];
  await MysqlPool.queryAsync(sql, args);
}

async function initCandidateCacheTestDate({ candidateId, name }) {
  let candidateListKey = 'candidateList';
  let candidateKey = `candidateInfo:${candidateId}`;
  let redisClient = Redis.getClient();
  await redisClient.lpushAsync(candidateListKey, candidateId);
  await redisClient.hmsetAsync(candidateKey, {
    candidateId: candidateId,
    name: name
  })
}

async function initVoteCacheTestData({ uid, voteIds, createdAt }) {
  let voteListKey = 'voteList';
  let voteInfoKey = `voteInfo:${uid}`;
  let redisClient = Redis.getClient();
  await redisClient.lpushAsync(voteListKey, uid);
  await redisClient.hmsetAsync(voteInfoKey, {
    uid: uid,
    voteIds: voteIds,
    createdAt: createdAt
  });
}

async function initUserSession({ email, password }) {
  let utoken = '';
  let router = '/api/v1/user/login';
  await new Promise((resolve, reject) => {
    request().post(router)
      .send({
        email: email,
        password: password
      })
      .end(function (err, res) {
        utoken = res.body.data.token;
        resolve()
      })
  })
  return utoken;
}

async function setVoteTime({ startVoteTime, endVoteTime }) {
  let voteTimeKey = `votetime`;
  let redisClient = Redis.getClient();
  await redisClient.hmsetAsync(voteTimeKey, {
    startVoteTime: startVoteTime,
    endVoteTime: endVoteTime
  });
}

async function cleanTestData() {
  await MysqlPool.queryAsync('TRUNCATE TABLE user');
  await MysqlPool.queryAsync('TRUNCATE TABLE vote');
  await MysqlPool.queryAsync('TRUNCATE TABLE candidate');
}

async function cleanCacheTestData() {
  let redisClient = Redis.getClient();
  await redisClient.ltrimAsync('candidateList', 1, 0);
  await redisClient.ltrimAsync('voteList', 1, 0);
}

async function cleanVoteTestData({ uid }) {
  let redisClient = Redis.getClient();
  await redisClient.hdelAsync(`voteInfo:${uid}`, 'uid', 'voteIds', 'createdAt');
}