const sinon = require('sinon');
const should = require('should');

const UserService = require('../app/Services/UserService');
const UserModel = require('../app/Models/User');
const SessionModel = require('../app/Models/Session');

describe('UserService unit test start...', () => {
  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#0-0-0 isRegisteredByUid', () => {

    it('#0-0-1 用户已注册', async () => {
      sandbox.stub(UserModel, 'getUserByUid').withArgs(1).returns(true);
      let res = await UserService.isRegisteredByUid(1);
      res.should.be.true();
    });

    it('#0-0-2 用户未注册', async () => {
      sandbox.stub(UserModel, 'getUserByUid').withArgs(1).returns(false);
      let res = await UserService.isRegisteredByUid(1);
      res.should.be.false();
    });

  })

  describe('#1-0-0 isRegisteredByEmail', () => {

    it('#1-0-1 用户已注册', async () => {
      sandbox.stub(UserModel, 'getUserByEmail').withArgs(1).returns(true);
      let res = await UserService.isRegisteredByEmail(1);
      res.should.be.true();
    });

    it('#1-0-2 用户未注册', async () => {
      sandbox.stub(UserModel, 'getUserByEmail').withArgs(1).returns(false);
      let res = await UserService.isRegisteredByEmail(1);
      res.should.be.false();
    });

  })

  describe('#2-0-0 isEnabled', () => {

    it('#2-0-1 用户不存在', async () => {
      sandbox.stub(UserModel, 'getUserByUid').withArgs(1).returns(false);
      try {
        await UserService.isEnabled(1);
        throw new Error();
      } catch (err) {
        err.message.should.be.eql('CODE_USER_NOTFOUND');
      }
    });

    it('#2-0-2 用户未激活', async () => {
      sandbox.stub(UserModel, 'getUserByUid').withArgs(1).returns({ isEnabled: -1 });
      let res = await UserService.isEnabled(1);
      res.should.be.false();
    });

    it('#2-0-3 用户已激活', async () => {
      sandbox.stub(UserModel, 'getUserByUid').withArgs(1).returns({ isEnabled: 1 });
      let res = await UserService.isEnabled(1);
      res.should.be.true();
    });

  })

  describe('#3-0-0 isUrlToken', () => {

    it('#3-0-1 urlToken不存在', async () => {
      sandbox.stub(UserModel, 'getUrlToken').withArgs(1).returns(false);
      let res = await UserService.isUrlToken(1, 1);
      res.should.be.false();
    });

    it('#3-0-1 urlToken错误', async () => {
      sandbox.stub(UserModel, 'getUrlToken').withArgs(1).returns(0);
      let res = await UserService.isUrlToken(1, 1);
      res.should.be.false();
    });

    it('#3-0-2 urlToken正确', async () => {
      sandbox.stub(UserModel, 'getUrlToken').withArgs(1).returns(1);
      let res = await UserService.isUrlToken(1, 1);
      res.should.be.true();
    });

  })

  describe('#4-0-0 activateUser', () => {

    it('#4-0-1 用户不存在', async () => {
      sandbox.stub(UserModel, 'getUserByUid').withArgs(1).returns(false);
      try {
        await UserService.activateUser(1);
        throw new Error();
      } catch (err) {
        err.message.should.be.eql('CODE_USER_NOTFOUND');
      }
    });

    it('#4-0-2 激活用户', async () => {
      sandbox.stub(UserModel, 'getUserByUid').withArgs(1).returns(true);
      sandbox.stub(SessionModel, 'save').withArgs(1).returns(1);
      let stub = sandbox.stub(UserModel, 'activate');
      await UserService.activateUser(1);
      sinon.assert.calledOnce(stub);
    })

    it('#4-0-3 保存会话', async () => {
      sandbox.stub(UserModel, 'getUserByUid').withArgs(1).returns({});
      sandbox.stub(UserModel, 'activate');
      let stub = sandbox.stub(SessionModel, 'save');
      stub.withArgs({}).returns(1);
      let res = await UserService.activateUser(1);
      sinon.assert.calledOnce(stub);
      res.should.be.eql(1);
    });

  })

  describe('#5-0-0 register', () => {

    it('#5-0-1 注册用户', async () => {
      sandbox.stub(UserModel, 'saveUrlToken').withArgs(1).returns('test');
      let stub = sandbox.stub(UserModel, 'register');
      stub.withArgs('test@t.com', 123456).returns(1);
      await UserService.register('test@t.com', 123456);
      sinon.assert.calledOnce(stub);
    });

  })

  describe('#6-0-0 isPassword', () => {

    it('#6-0-1 用户不存在', async () => {
      sandbox.stub(UserModel, 'getUserByUid').withArgs(1).returns(false);
      try {
        await UserService.isPassword(1, 123456);
        throw new Error();
      } catch (err) {
        err.message.should.be.eql('CODE_USER_NOTFOUND');
      }
    });

    it('#6-0-2 密码正确', async () => {
      sandbox.stub(UserModel, 'getUserByUid').withArgs(1).returns({ password: "e0dab3d25d12900ddbc34fbc40e14fa4" });
      let res = await UserService.isPassword(1, 123456);
      res.should.be.true();
    });

    it('#6-0-3 密码错误', async () => {
      sandbox.stub(UserModel, 'getUserByUid').withArgs(1).returns({ password: 123456 });
      let res = await UserService.isPassword(1, 123456);
      res.should.be.false();
    });

  })

  describe('#7-0-0 newlyActivate', () => {

    it('#7-0-1 用户不存在', async () => {
      sandbox.stub(UserModel, 'getUserByEmail').withArgs('test@t.com').returns(false);
      try {
        await UserService.newlyActivate('test@t.com');
        throw new Error();
      } catch (err) {
        err.message.should.be.eql('CODE_USER_NOTFOUND');
      }
    });

    it('#7-0-2 更新urlToken', async () => {
      sandbox.stub(UserModel, 'getUserByEmail').withArgs('test@t.com').returns({ uid: 1 });
      let spy = sandbox.spy(UserModel, 'saveUrlToken');
      await UserService.newlyActivate('test@t.com');
      sinon.assert.calledWith(spy, 1);
    });

  })

  describe('#8-0-0 login', () => {

    it('#8-0-1 用户不存在', async () => {
      sandbox.stub(UserModel, 'getUserByEmail').withArgs('test@t.com').returns(false);
      try {
        await UserService.login('test@t.com');
        throw new Error();
      } catch (err) {
        err.message.should.be.eql('CODE_USER_NOTFOUND');
      }
    });

    it('#8-0-2 保存会话', async () => {
      sandbox.stub(UserModel, 'getUserByEmail').withArgs('test@t.com').returns({ uid: 1 });
      let stub = sandbox.stub(SessionModel, 'save');
      let res = await UserService.login('test@t.com');
      sinon.assert.calledWith(stub, { uid: 1 });
    });

    it('#8-0-3 返回会话token', async () => {
      sandbox.stub(UserModel, 'getUserByEmail').withArgs('test@t.com').returns({ uid: 1 });
      let stub = sandbox.stub(SessionModel, 'save');
      stub.withArgs({ uid: 1 }).returns('test');
      let res = await UserService.login('test@t.com');
      res.should.be.eql('test');
    });

  })

  describe('#9-0-0 getUidByEmail', () => {

    it('#9-0-1 用户不存在', async () => {
      sandbox.stub(UserModel, 'getUserByEmail').withArgs('test@t.com').returns(false);
      try {
        await UserService.getUidByEmail('test@t.com');
        throw new Error();
      } catch (err) {
        err.message.should.be.eql('CODE_USER_NOTFOUND');
      }
    });

    it('#9-0-2 获取用户uid', async () => {
      sandbox.stub(UserModel, 'getUserByEmail').withArgs('test@t.com').returns({ uid: 1 });
      let res = await UserService.getUidByEmail('test@t.com');
      res.should.be.eql(1);
    });

  })
})