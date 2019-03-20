const ResConstant = require('../Tools/ResConstant');
const UserService = require('../Services/UserService');
const VoteService = require('../Services/VoteService');

class UserController {

  /**
   * @api {GET} /api/v1/user/activate/:uid/:urltoken 用户激活
   * @apiGroup User
   * @apiParam  {Int} uid 用户uid
   * @apiParam  {String} urltoken 用户激活令牌
   * @apiSuccessExample 200 Success-Response:
   *    {
   *      "code": 10001,
   *      "message": "请求成功",
   *      "data": {}
   *    }
   * @apiErrorExample 400 Error-Response:
   *    {
   *      "code": 10002,
   *      "message": "请求参数不正确"
   *    }
   * @apiErrorExample 400 Error-Response:
   *    {
   *      "code": 10008,
   *      "message": "账号已激活"
   *    }
   * @apiErrorExample 400 Error-Response:
   *    {
   *      "code": 10007,
   *      "message": "激活链接错误或已失效"
   *    }
   */
  async activate(ctx) {
    let uid = ctx.httpValidate.params('uid').notEmpty().end();
    let urlToken = ctx.httpValidate.params('urltoken').notEmpty().end();
    if (ctx.httpValidate.error()) {
      throw new Error(ResConstant.CODE_ARGS_NOT_MATCH.key);
    }

    //判断激活用户是否已注册
    let isRegistered = await UserService.isRegisteredByUid(uid);
    if (!isRegistered) {
      throw new Error(ResConstant.CODE_ARGS_NOT_MATCH.key);
    }

    //判断激活用户是否已激活
    let isEnabled = await UserService.isEnabled(uid);
    if (isEnabled) {
      throw new Error(ResConstant.CODE_HAS_ACTIVATED.key);
    }

    //判断激活令牌是否正确
    let isRight = await UserService.isUrlToken(uid, urlToken);
    if (!isRight) {
      throw new Error(ResConstant.CODE_ACTIVATE_ERROR.key);
    }

    let token = await UserService.activateUser(uid);
    ctx.cookies.set('token', token);

    ctx.returnValue(ResConstant.CODE_SUCCESS.key);
  };

  /**
   * @api {POST} /api/v1/user/login 用户注册或登录
   * @apiGroup User
   * @apiParam  {String} email 用户邮箱
   * @apiParam  {String} password 用户密码
   * @apiSuccessExample 201 Success-Response:
   *    {
   *      "code": 10001,
   *      "message": "请求成功",
   *      "data": {}
   *    }
   * @apiSuccessExample 201 Success-Response:
   *    {
   *      "code": 10001,
   *      "message": "请求成功",
   *      "data": {
   *        "uid": "1",
   *        "emial": "172671317@qq.com",
   *        "token": "1yriaiji"
   *      }
   *    }
   * @apiSuccessExample 200 Success-Response:
   *    {
   *      "code": 10000,
   *      "message": "请求成功",
   *      "data": {}
   *    }
   * @apiErrorExample 400 Error-Response:
   *    {
   *      "code": 10002,
   *      "message": "请求参数不正确"
   *    }
   * @apiErrorExample 401 Error-Response:
   *    {
   *      "code": 10006,
   *      "message": "账号或密码错误"
   *    }
   */
  async registerOrLogin(ctx) {
    let email = ctx.httpValidate.body('email').isEmail().end();
    let password = ctx.httpValidate.body('password').isString().lengthLimit(">=", 6).lengthLimit("<=", 20).end();
    if (ctx.httpValidate.error()) {
      throw new Error(ResConstant.CODE_ARGS_NOT_MATCH.key);
    }

    let isRegistered = await UserService.isRegisteredByEmail(email);
    if (!isRegistered) {
      //用户注册流程
      await UserService.register(email, password);
      ctx.returnValue(ResConstant.CODE_CREATED_SUCCESS.key);
      return;
    }

    //判断用户秘密是否正确
    let uid = await UserService.getUidByEmail(email);
    let isPassword = await UserService.isPassword(uid, password);
    if (!isPassword) {
      throw new Error(ResConstant.CODE_LOGIN_ERROR.key);
    }

    //用户已注册未激活登录流程
    let isEnabled = await UserService.isEnabled(uid);
    if (!isEnabled) {
      await UserService.newlyActivate(email);
      ctx.returnValue(ResConstant.CODE_SUCCESS.key);
      return;
    }

    //用户登录流程
    let token = await UserService.login(email);
    ctx.cookies.set('token', token);
    ctx.returnValue(ResConstant.CODE_CREATED_SUCCESS.key, {
      uid: uid,
      email: email,
      token: token
    });
  };

  /**
   * @api {GET} /api/v1/candidate/list 获取候选人列表
   * @apiGroup User
   * @apiHeader {String} token 用户令牌
   * @apiSuccessExample 200 Success-Response:
   *    {
   *      "code": 10000,
   *      "message": "请求成功",
   *      "data": {
   *        "candidateList": [
   *          {
   *            "candidateId": 1,
   *            "name": "test"
   *          }
   *        ]
   *      }
   *    }
   * @apiErrorExample 403 Error-Response:
   *    {
   *      "code": 10011,
   *      "message": "活动未开始"
   *    }
   * @apiErrorExample 403 Error-Response:
   *    {
   *      "code": 10012,
   *      "message": "活动已结束"
   *    }
   */
  async getCandidateList(ctx) {

    //判断活动是否已开始
    let isActivityStart = await VoteService.isActivityStart();
    if (!isActivityStart) {
      throw new Error(ResConstant.CODE_VOTE_NOT_START.key);
    }

    //判断活动是否已结束
    let isActivityOver = await VoteService.isActivityOver();
    if (isActivityOver) {
      throw new Error(ResConstant.CODE_VOTE_HAS_OVER.key);
    }

    let candidateList = await VoteService.userGetCandidateCacheList();

    ctx.returnValue(ResConstant.CODE_SUCCESS.key, {
      candidateList: candidateList
    });
  }

  /**
   * @api {POST} /api/v1/candidate/ballot 提交投票
   * @apiGroup User
   * @apiHeader {String} token 用户令牌
   * @apiParam  {String} voteIds 候选人Id以逗号隔开,例:1,2,3
   * @apiSuccessExample 201 Success-Response:
   *    {
   *      "code": 10001,
   *      "message": "请求成功",
   *      "data": {}
   *    }
   * @apiErrorExample 403 Error-Response:
   *    {
   *      "code": 10010,
   *      "message": "没有权限"
   *    }
   * @apiErrorExample 403 Error-Response:
   *    {
   *      "code": 10011,
   *      "message": "活动未开始"
   *    }
   * @apiErrorExample 403 Error-Response:
   *    {
   *      "code": 10012,
   *      "message": "活动已结束"
   *    }
   * @apiErrorExample 400 Error-Response:
   *    {
   *      "code": 10002,
   *      "message": "请求参数不正确"
   *    }
   */
  async vote(ctx) {
    let uid = ctx.user.uid;
    let voteIds = ctx.httpValidate.body('voteIds').isString().end();
    if (ctx.httpValidate.error()) {
      throw new Error(ResConstant.CODE_ARGS_NOT_MATCH.key);
    }

    //判断是否已投过票
    let hasVoted = await VoteService.isVoted(uid);
    if (hasVoted) {
      throw new Error(ResConstant.CODE_NOT_AUTHORIZED.key);
    }

    //判断活动是否已开始
    let isActivityStart = await VoteService.isActivityStart();
    if (!isActivityStart) {
      throw new Error(ResConstant.CODE_VOTE_NOT_START.key);
    }

    //判断活动是否已结束
    let isActivityOver = await VoteService.isActivityOver();
    if (isActivityOver) {
      throw new Error(ResConstant.CODE_VOTE_HAS_OVER.key);
    }

    //判断投票Ids参数是否合理
    let isRight = await VoteService.isVoteId(voteIds);
    if (!isRight) {
      throw new Error(ResConstant.CODE_ARGS_NOT_MATCH.key);
    }

    await VoteService.vote(uid, voteIds);

    ctx.returnValue(ResConstant.CODE_CREATED_SUCCESS.key);
  }

}


module.exports = new UserController();