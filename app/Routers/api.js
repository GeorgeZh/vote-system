const UserController = require('../Controllers/UserController');
const AdminController = require('../Controllers/AdminController');

const SessionMiddleware = require('../Middlewares/SessionMiddleware');
const AdminMiddleware = require('../Middlewares/AdminMiddleware');

module.exports = router => {
  //注册登录接口
  router.post('/api/v1/user/login', UserController.registerOrLogin);
  //激活用户接口
  router.get('/api/v1/user/activate/:uid/:urltoken', UserController.activate);
  //投票接口
  router.post('/api/v1/candidate/ballot', SessionMiddleware, UserController.vote);
  //获取候选人列表接口
  router.get('/api/v1/candidate/list', UserController.getCandidateList);
  //管理员添加候选人接口
  router.post('/api/v1/admin/candidate', AdminMiddleware, AdminController.addCandidate);
  //管理员删除候选人接口
  router.delete('/api/v1/admin/candidate/:candidateId', AdminMiddleware, AdminController.removeCandidate);
  //管理员修改候选人信息
  router.put('/api/v1/admin/candidate/info', AdminMiddleware, AdminController.updateCandidate);
  //管理员获取候选人投票信息接口
  router.get('/api/v1/admin/candidate/list', AdminMiddleware, AdminController.getCandidateList);
  //管理员提交投票时间
  router.post('/api/v1/admin/candidate/votetime', AdminMiddleware, AdminController.setVoteTime);
}