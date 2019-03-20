const VoteModel = require('./app/Models/Vote');
const co = require('co');

const POP_TIMEOUT = 5;


co(async function () {
  while (true) {
    let uid = await VoteModel.getUidFromList(POP_TIMEOUT);
    if (!uid) continue;
    let voteInfo = await VoteModel.getCacheInfo(uid);
    if (!voteInfo) {
      console.log(`uid:${uid} vote error`);
      continue;
    }
    let voteIds = voteInfo.voteIds;
    let createdAt = voteInfo.createdAt;
    await VoteModel.addVoteList(uid, voteIds, createdAt);
  }
})
