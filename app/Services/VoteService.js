const ResConstant = require('../Tools/ResConstant');
const VoteModel = require('../Models/Vote');
const CandidateModel = require('../Models/Candidate');

class VoteSevice {

  /**
   * 判断活动是否已结束
   */
  async isActivityOver() {
    let voteTimeObj = await VoteModel.getVoteTime();
    if (!voteTimeObj) {
      throw new Error(ResConstant.CODE_VOTE_ERROR.key);
    }
    let { endVoteTime } = voteTimeObj;
    let nowTime = new Date().getTime();
    if (nowTime > endVoteTime) {
      return true;
    }
    return false;
  }

  /**
   * 判断活动是否已开始
   */
  async isActivityStart() {
    let voteTimeObj = await VoteModel.getVoteTime();
    if (!voteTimeObj) {
      throw new Error(ResConstant.CODE_VOTE_ERROR.key);
    }
    let { startVoteTime } = voteTimeObj;
    let nowTime = new Date().getTime();
    if (nowTime < startVoteTime) {
      return false;
    }
    return true;
  }

  /**
   * 普通用户获取候选人列表
   */
  async userGetCandidateCacheList() {
    let candidateIdList = await CandidateModel.getCacheList();
    if (candidateIdList.length < 4) {
      throw new Error(ResConstant.CODE_VOTE_ERROR.key);
    }
    let candidateList = [];
    for (let i in candidateIdList) {
      let candidateInfo = await CandidateModel.getCacheInfo(candidateIdList[i]);
      delete candidateInfo.voteCount;
      candidateList.push(candidateInfo);
    }
    return candidateList;
  }

  /**
   * 管理员获取候选人列表
   */
  async adminGetCandidateCacheList() {
    let candidateIdList = await CandidateModel.getCacheList();
    let candidateList = [];
    for (let i in candidateIdList) {
      let candidateInfo = await CandidateModel.getCacheInfo(candidateIdList[i]);
      if (!candidateInfo) {
        throw new Error(ResConstant.CODE_REDIS_ERROR.key);
      }
      candidateList.push(candidateInfo);
    }
    return candidateList;
  }

  /**
   * 投票ID数量格式是否合规
   * @param {String} voteIds 
   */
  async isVoteId(voteIds) {
    let voteList = voteIds.split(',');
    let candidateList = await CandidateModel.getCacheList();
    let voteLength = voteList.length;
    let candidateLength = candidateList.length;
    if (voteLength < 2 || voteLength > 5 || voteLength > candidateLength / 2) {
      return false;
    }
    let isRepeat = arrayIsRepeat(voteList);
    if (isRepeat) {
      return false;
    }
    for (let i in voteList) {
      let isExisted = await CandidateModel.getCacheInfo(voteList[i]);
      if (!isExisted) {
        return false;
      }
    }
    return true;
  }

  /**
   * 判断用户是否已投过票
   * @param {Int} uid 
   */
  async isVoted(uid) {
    let voteInfo = await VoteModel.getCacheInfo(uid);
    if (!voteInfo) {
      return false;
    }
    return true;
  }

  /**
   * 投票
   * @param {Int} uid 
   * @param {String} voteIds 
   */
  async vote(uid, voteIds) {
    await VoteModel.addCache(uid, voteIds);
    let voteList = voteIds.split(',');
    for (let i in voteList) {
      await CandidateModel.addVoteCount(voteList[i]);
    }
  }

  /**
   * 设置活动时间
   * @param {Int} startVoteTime 
   * @param {Int} endVoteTime 
   */
  async setVoteTime(startVoteTime, endVoteTime) {
    await VoteModel.setVoteTime(startVoteTime, endVoteTime);
  }

  /**
   * 添加候选人
   * @param {String} name 
   */
  async addCandidate(name) {
    let candidateId = await CandidateModel.add(name);
    await CandidateModel.addCache(candidateId, name);
    return candidateId;
  }

  /**
   * 判断候选人是否存在
   * @param {Int} candidateId 
   */
  async isCandidate(candidateId) {
    let candidate = await CandidateModel.getCandidateById(candidateId);
    if (!candidate) {
      return false;
    }
    return true;
  }

  /**
   * 删除候选人
   * @param {Int} candidateId 
   */
  async dropCandidate(candidateId) {
    await CandidateModel.drop(candidateId);
    await CandidateModel.dropCache(candidateId);
  }

  /**
   * 更新候选人信息
   * @param {Int} candidateId 
   * @param {String} name 
   */
  async updateCandidate(candidateId, name) {
    await CandidateModel.update(candidateId, name);
    await CandidateModel.updateCache(candidateId, name);
  }

}

/**
 * 检查数组元素是否重复
 * @param {Array} arr
 */
function arrayIsRepeat(arr) {
  let obj = {};
  for (let i in arr) {
    let indexStr = String(arr[i])
    if (obj[indexStr]) {
      return true;
    }
    obj[indexStr] = 1;
  }
  return false;
}

module.exports = new VoteSevice();