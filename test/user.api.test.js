const should = require('should');
const supertest = require('supertest');
const app = require('../app');
const TestConfigs = require('./TestConfigs');
const MysqlPool = require('../app/Models/MysqlPool');
const Redis = require('../app/Models/Redis');

const ENABLE = 1;
const UNENABLE = -1;

const URLTOKEN_EXPIRE_TIME = 60;
const TEST_TIMESTAMPT = new Date().getTime();

function request() {
  return supertest(app.listen())
}

describe('User api test start...', () => {
  before(async () => {
    await cleanTestData();
    for (let i in TestConfigs.mysql.user) {
      await initUserMysqlTestData(TestConfigs.mysql.user[i]);
    }
    await initUrlTokenTestData(TestConfigs.redis.unEnableUser);
  });

  after(async () => {
    await cleanTestData();
  });

  describe('#0-0-0 /api/v1/user/login', () => {
    let router = '/api/v1/user/login';
    it('#0-0-1 用户注册', async () => {
      await new Promise((resolve, reject) => {
        request().post(router)
          .send({
            email: TestConfigs.mysql.registerUser.email,
            password: TestConfigs.mysql.registerUser.password
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10001);
            resolve();
          })
      })
    })
    it('#0-0-2 已注册未激活用户登录', async () => {
      await new Promise((resolve, reject) => {
        request().post(router)
          .send({
            email: TestConfigs.mysql.user[0].email,
            password: TestConfigs.mysql.user[0].password
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10000);
            resolve();
          })
      })
    })
    it('#0-0-3 已注册用户密码错误', async () => {
      await new Promise((resolve, reject) => {
        request().post(router)
          .send({
            email: TestConfigs.mysql.user[0].email,
            password: 'xxxxxxx'
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10006);
            resolve();
          })
      })
    })
    it('#0-0-4 已激活用户登录', async () => {
      await new Promise((resolve, reject) => {
        request().post(router)
          .send({
            email: TestConfigs.mysql.user[2].email,
            password: TestConfigs.mysql.user[2].password
          })
          .end(function (err, res) {
            res.body.code.should.be.eql(10001);
            resolve();
          })
      })
    })
  })

  describe('#1-0-0 /api/v1/user/activate/:uid/:urltoken', () => {
    let { uid, urlToken } = TestConfigs.redis.unEnableUser;
    let router = `/api/v1/user/activate/${uid}/${urlToken}`;
    it('#1-0-1 激活注册用户', async () => {
      await new Promise((resolve, reject) => {
        request().get(router)
          .end(function (err, res) {
            res.body.code.should.be.eql(10000);
            resolve();
          })
      })
    })
  })

  describe('#2-0-0 /api/v1/candidate/list', () => {
    let router = `/api/v1/candidate/list`;
    it('#2-0-1 获取候选人列表', async () => {
      await setVoteTime({
        startVoteTime: TEST_TIMESTAMPT - 1000,
        endVoteTime: TEST_TIMESTAMPT + 1000
      });
      await new Promise((resolve, reject) => {
        request().get(router)
          .end(function (err, res) {
            res.body.code.should.be.eql(10000);
            resolve();
          })
      })
    })
    it('#2-0-2 活动开始前拒绝获取候选人列表', async () => {
      await setVoteTime(TestConfigs.redis.notStartVoteTime);
      await new Promise((resolve, reject) => {
        request().get(router)
          .end(function (err, res) {
            res.body.code.should.be.eql(10011);
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

async function initUrlTokenTestData({ uid, urlToken }) {
  let urlTokenKey = `uid:${uid}`;
  let redisClient = Redis.getClient();
  await redisClient.hmsetAsync(urlTokenKey, { urlToken: urlToken });
  await redisClient.expireAsync(urlTokenKey, URLTOKEN_EXPIRE_TIME);
}

async function cleanTestData() {
  await MysqlPool.queryAsync('TRUNCATE TABLE user');
}

async function setVoteTime({ startVoteTime, endVoteTime }) {
  let voteTimeKey = `votetime`;
  let redisClient = Redis.getClient();
  await redisClient.hmsetAsync(voteTimeKey, {
    startVoteTime: startVoteTime,
    endVoteTime: endVoteTime
  });
}