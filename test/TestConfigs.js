module.exports = {
  mysql: {
    registerUser: {
      email: "register@test.com",
      password: "123456"
    },
    addTestCandidate: {
      name: 'test'
    },
    user: [
      {
        uid: 10000,
        email: "unenable@test.com",
        md5_password: "e0dab3d25d12900ddbc34fbc40e14fa4",
        password: "123456",
        isEnabled: -1
      },
      {
        uid: 10001,
        email: "needactivate@test.com",
        md5_password: "e0dab3d25d12900ddbc34fbc40e14fa4",
        isEnabled: -1
      },
      {
        uid: 10002,
        email: "enable@test.com",
        md5_password: "e0dab3d25d12900ddbc34fbc40e14fa4",
        password: "123456",
      },
      {
        uid: 10003,
        email: "admin@oo.xx",
        md5_password: "e0dab3d25d12900ddbc34fbc40e14fa4",
        password: "123456",
      },
      {
        uid: 10004,
        email: "vote@test.com",
        md5_password: "e0dab3d25d12900ddbc34fbc40e14fa4",
        password: "123456",
      }
    ],
    candidateList: [
      {
        candidateId: 20000,
        name: 'test'
      },
      {
        candidateId: 20001,
        name: 'test2'
      }
    ]
  },
  redis: {
    unEnableUser: {
      uid: 10001,
      urlToken: 'test0000'
    },
    notStartVoteTime: {
      startVoteTime: 4077323743000,
      endVoteTime: 4077323743000
    },
    hasOverVoteTime: {
      startVoteTime: 1552715743000,
      endVoteTime: 1552715743000
    },
    voteInfo: {
      uid: 10003,
      voteIds: '20003,20004',
      createdAt: 1552715743000
    },
    candidateList: [
      {
        candidateId: 20003,
        name: 'test000'
      },
      {
        candidateId: 20004,
        name: 'test001'
      },
      {
        candidateId: 20005,
        name: 'test002'
      },
      {
        candidateId: 20006,
        name: 'test003'
      }
    ]
  }
}