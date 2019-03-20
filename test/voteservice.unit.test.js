const sinon = require('sinon');
const should = require('should');

const VoteService = require('../app/Services/VoteService');
const VoteModel = require('../app/Models/Vote');
const CandidateModel = require('../app/Models/Candidate');

describe('VoteService unit test start...', () => {
  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#0-0-0 isActivityOver', () => {

    it('#0-0-1 活动时间未设置', async () => {
      sandbox.stub(VoteModel, 'getVoteTime').returns(null);
      try {
        await VoteService.isActivityOver();
        throw new Error();
      } catch (err) {
        err.message.should.be.eql('CODE_VOTE_ERROR');
      }
    });

    it('#0-0-2 当前时间小于活动结束时间', async () => {
      sandbox.stub(VoteModel, 'getVoteTime').returns({ endVoteTime: new Date().getTime() + 10000 });
      let res = await VoteService.isActivityOver();
      res.should.be.false();
    });

    it('#0-0-3 当前时间大于活动结束时间', async () => {
      sandbox.stub(VoteModel, 'getVoteTime').returns({ endVoteTime: new Date().getTime() - 10000 });
      let res = await VoteService.isActivityOver();
      res.should.be.eql(true);
    });

  })

  describe('#1-0-0 isActivityStart', () => {

    it('#1-0-1 活动时间未设置', async () => {
      sandbox.stub(VoteModel, 'getVoteTime').returns(null);
      try {
        await VoteService.isActivityStart();
        throw new Error();
      } catch (err) {
        err.message.should.be.eql('CODE_VOTE_ERROR');
      }
    });

    it('#1-0-2 当前时间小于活动开始时间', async () => {
      sandbox.stub(VoteModel, 'getVoteTime').returns({ startVoteTime: new Date().getTime() + 10000 });
      let res = await VoteService.isActivityStart();
      res.should.be.false();
    });

    it('#1-0-3 当前时间大于活动开始时间', async () => {
      sandbox.stub(VoteModel, 'getVoteTime').returns({ startVoteTime: new Date().getTime() - 10000 });
      let res = await VoteService.isActivityStart();
      res.should.be.true();
    });

  })

  describe('#2-0-0 userGetCandidateCacheList', () => {

    it('#2-0-1 候选人小于4个', async () => {
      sandbox.stub(CandidateModel, 'getCacheList').returns([]);
      try {
        await VoteService.userGetCandidateCacheList();
        throw new Error();
      } catch (err) {
        err.message.should.be.eql('CODE_VOTE_ERROR');
      }
    });

    it('#2-0-2 返回列表', async () => {
      sandbox.stub(CandidateModel, 'getCacheList').returns([1, 2, 3, 4]);
      sandbox.stub(CandidateModel, 'getCacheInfo').returns({});
      let ret = await VoteService.userGetCandidateCacheList();
      ret.should.be.Array();
    });

  })

  describe('#3-0-0 adminGetCandidateCacheList', () => {

    it('#3-0-1 候选人不存在', async () => {
      sandbox.stub(CandidateModel, 'getCacheList').returns([1]);
      sandbox.stub(CandidateModel, 'getCacheInfo').withArgs(1).returns(false);
      try {
        await VoteService.adminGetCandidateCacheList();
        throw new Error();
      } catch (err) {
        err.message.should.be.eql('CODE_REDIS_ERROR');
      }
    });

    it('#3-0-2 返回列表', async () => {
      sandbox.stub(CandidateModel, 'getCacheList').returns([1, 2, 3, 4]);
      sandbox.stub(CandidateModel, 'getCacheInfo').returns({});
      let ret = await VoteService.adminGetCandidateCacheList();
      ret.should.be.Array();
    });

  })

  describe('#4-0-0 isVoteId', () => {

    it('#4-0-1 投票数小于2', async () => {
      sandbox.stub(CandidateModel, 'getCacheList').returns([1, 2, 3, 4]);
      let res = await VoteService.isVoteId('1');
      res.should.be.false();
    });

    it('#4-0-2 投票数大于5', async () => {
      sandbox.stub(CandidateModel, 'getCacheList').returns([1, 2, 3, 4]);
      let res = await VoteService.isVoteId('1,2,3,4,5,6');
      res.should.be.false();
    });

    it('#4-0-3 投票数大于候选人一半', async () => {
      sandbox.stub(CandidateModel, 'getCacheList').returns([1, 2, 3, 4]);
      let res = await VoteService.isVoteId('1,2,3');
      res.should.be.false();
    });

    it('#4-0-4 投票重复', async () => {
      sandbox.stub(CandidateModel, 'getCacheList').returns([1, 2, 3, 4]);
      let res = await VoteService.isVoteId('1,1');
      res.should.be.false();
    });

    it('#4-0-5 候选人不存在', async () => {
      sandbox.stub(CandidateModel, 'getCacheList').returns([1, 2, 3, 4]);
      sandbox.stub(CandidateModel, 'getCacheInfo').withArgs(1).returns(null);
      let res = await VoteService.isVoteId('1,2');
      res.should.be.false();
    });

    it('#4-0-5 投票Id正常', async () => {
      sandbox.stub(CandidateModel, 'getCacheList').returns([1, 2, 3, 4]);
      sandbox.stub(CandidateModel, 'getCacheInfo').returns({});
      let res = await VoteService.isVoteId('1,2');
      res.should.be.true();
    });

  })

  describe('#5-0-0 isVoted', () => {

    it('#5-0-1 未投过票', async () => {
      sandbox.stub(VoteModel, 'getCacheInfo').withArgs(1).returns(null);
      let res = await VoteService.isVoted(1);
      res.should.be.false();
    });

    it('#5-0-2 已投过票', async () => {
      sandbox.stub(VoteModel, 'getCacheInfo').withArgs(1).returns({});
      let res = await VoteService.isVoted(1);
      res.should.be.true();
    });

  })

  describe('#6-0-0 vote', () => {

    it('‘#6-0-1 添加投票记录', async () => {
      let spy = sandbox.spy(VoteModel, 'addCache');
      await VoteService.vote(1, '');
      sinon.assert.calledWith(spy, 1, '');
    });

    it('‘#6-0-2 候选人增加投票数', async () => {
      let spy = sandbox.spy(CandidateModel, 'addVoteCount');
      await VoteService.vote(1, '1,2');
      sinon.assert.calledWith(spy, '1');
      sinon.assert.calledWith(spy, '2');
    });

  })

  describe('#7-0-0 setVoteTime', () => {

    it('#7-0-1 设置活动时间', async () => {
      let spy = sandbox.spy(VoteModel, 'setVoteTime');
      await VoteService.setVoteTime(1, 2);
      sinon.assert.calledWith(spy, 1, 2);
    });

  })

  describe('#8-0-0 addCandidate', () => {

    it('#8-0-1 添加候选人返回候选人Id', async () => {
      sandbox.stub(CandidateModel, 'add').withArgs('test').returns(1);
      let res = await VoteService.addCandidate('test');
      res.should.be.eql(1);
    });

    it('#8-0-2 添加候选人缓存', async () => {
      sandbox.stub(CandidateModel, 'add').withArgs('test').returns(1);
      let spy = sandbox.spy(CandidateModel, 'addCache');
      await VoteService.addCandidate('test');
      sinon.assert.calledWith(spy, 1, 'test');
    });

  })

  describe('#9-0-0 isCandidate', () => {

    it('#9-0-1 候选人不存在', async () => {
      sandbox.stub(CandidateModel, 'getCandidateById').withArgs(1).returns(false);
      let res = await VoteService.isCandidate(1);
      res.should.be.false();
    });

    it('#9-0-2 候选人存在', async () => {
      sandbox.stub(CandidateModel, 'getCandidateById').withArgs(1).returns({});
      let res = await VoteService.isCandidate(1);
      res.should.be.true();
    });

  })

  describe('#10-0-0 dropCandidate', () => {

    it('#10-0-1 删除候选人', async () => {
      let spy = sandbox.spy(CandidateModel, 'drop');
      await VoteService.dropCandidate(1);
      sinon.assert.calledWith(spy, 1);
    });

    it('#10-0-2 删除候选人缓存', async () => {
      let spy = sandbox.spy(CandidateModel, 'dropCache');
      await VoteService.dropCandidate(1);
      sinon.assert.calledWith(spy, 1);
    });

  });

  describe('#11-0-0 updateCandidate', () => {

    it('#11-0-1 更新候选人信息', async () => {
      sandbox.stub(CandidateModel, 'updateCache');
      let stub = sandbox.stub(CandidateModel, 'update');
      await VoteService.updateCandidate(1);
      sinon.assert.calledWith(stub, 1);
    });

    it('#11-0-2 更新候选人缓存信息', async () => {
      sandbox.stub(CandidateModel, 'update');
      let stub = sandbox.stub(CandidateModel, 'updateCache');
      await VoteService.updateCandidate(1);
      sinon.assert.calledWith(stub, 1);
    });

  });

})