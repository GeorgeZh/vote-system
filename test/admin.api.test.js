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

function request() {
  return supertest(app.listen())
}

describe('Admin api test start...', () => {
  before(async () => {
    await cleanTestData();
    for (let i in TestConfigs.mysql.user) {
      await initUserMysqlTestData(TestConfigs.mysql.user[i]);
    }
    for (let i in TestConfigs.mysql.candidateList) {
      await initCandidateTestData(TestConfigs.mysql.candidateList[i]);
    }
    for (let i in TestConfigs.redis.candidateList) {
      await initCandidateCacheTestDate(TestConfigs.redis.candidateList[i]);
    }
    GLOBAL_ADMIN_TOKEN = await initUserSession(TestConfigs.mysql.user[3]);
    GLOBAL_USER_TOKEN = await initUserSession(TestConfigs.mysql.user[2]);
  });

  after(async () => {
    await cleanTestData();
  });

  describe('#0-0-0 /api/v1/admin/candidate/votetime', () => {
    let router = '/api/v1/admin/candidate/votetime'
    it('#0-0-1 管理员设置投票开始结束时间', async () => {
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_ADMIN_TOKEN)
          .send({
            startVoteTime: TEST_TIMESTAMPT,
            endVoteTime: TEST_TIMESTAMPT
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10001);
            resolve();
          })
      })
    })
    it('#0-0-2 普通用户没有权限', async () => {
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_USER_TOKEN)
          .send({
            startVoteTime: TEST_TIMESTAMPT,
            endVoteTime: TEST_TIMESTAMPT
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10010);
            resolve();
          })
      })
    })
  })

  describe('#1-0-0 /api/v1/admin/candidate', () => {
    let router = '/api/v1/admin/candidate';
    it('#1-0-1 添加候选人', async () => {
      await setVoteTime(TestConfigs.redis.notStartVoteTime);
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_ADMIN_TOKEN)
          .send({
            name: TestConfigs.mysql.addTestCandidate.name
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10001);
            resolve();
          })
      })
    })
    it('#1-0-2 没有权限', async () => {
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_USER_TOKEN)
          .send({
            name: TestConfigs.mysql.addTestCandidate.name
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10010);
            resolve();
          })
      })
    })
    it('#1-0-3 活动开始后禁止修改', async () => {
      await setVoteTime({
        startVoteTime: TEST_TIMESTAMPT - 1000,
        endVoteTime: TEST_TIMESTAMPT + 1000
      });
      await new Promise((resolve, reject) => {
        request().post(router)
          .set('token', GLOBAL_ADMIN_TOKEN)
          .send({
            name: TestConfigs.mysql.addTestCandidate.name
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10010);
            resolve();
          })
      })
    })
  })

  describe('#2-0-0 /api/v1/admin/candidate/:candidateId', () => {
    let router = `/api/v1/admin/candidate/${TestConfigs.mysql.candidateList[0].candidateId}`;
    it('#2-0-1 删除候选人', async () => {
      await setVoteTime(TestConfigs.redis.notStartVoteTime);
      await new Promise((resolve, reject) => {
        request().delete(router)
          .set('token', GLOBAL_ADMIN_TOKEN)
          .end(function (err, res) {
            res.status.should.be.eql(204);
            resolve();
          })
      })
    })
  })

  describe('#3-0-0 /api/v1/admin/candidate/info', () => {
    let router = `/api/v1/admin/candidate/info`;
    it('#3-0-1 修改候选人信息', async () => {
      await new Promise((resolve, reject) => {
        request().put(router)
          .set('token', GLOBAL_ADMIN_TOKEN)
          .send({
            candidateId: TestConfigs.mysql.candidateList[1].candidateId,
            name: 'xxxx'
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10000);
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
  await MysqlPool.queryAsync('TRUNCATE TABLE candidate');
}