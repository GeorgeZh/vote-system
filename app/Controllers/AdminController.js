const ResConstant = require('../Tools/ResConstant');
const VoteService = require('../Services/VoteService');

class AdminController {

  /**
   * @api {POST} /api/v1/admin/candidate/votetime 管理员设置活动时间
   * @apiGroup Admin
   * @apiHeader {String} token 用户令牌
   * @apiParam  {Int} startVoteTime 活动开始时间戳
   * @apiParam  {Int} endVoteTime 活动结束时间戳
   * @apiSuccessExample 201 Success-Response:
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
   * @apiErrorExample 403 Error-Response:
   *    {
   *      "code": 10010,
   *      "message": "没有权限"
   *    }
   */
  async setVoteTime(ctx) {
    let startVoteTime = ctx.httpValidate.body('startVoteTime').lengthLimit(">", 12).lengthLimit("<", 14).end();
    let endVoteTime = ctx.httpValidate.body('endVoteTime').lengthLimit(">", 12).lengthLimit("<", 14).end();
    if (ctx.httpValidate.error()) {
      throw new Error(ResConstant.CODE_ARGS_NOT_MATCH.key);
    }
    await VoteService.setVoteTime(startVoteTime, endVoteTime);
    ctx.returnValue(ResConstant.CODE_CREATED_SUCCESS.key);
  }

  /**
   * @api {POST} /api/v1/admin/candidate 添加候选人
   * @apiGroup Admin
   * @apiHeader {String} token 用户令牌
   * @apiParam  {String} name 候选人名称
   * @apiSuccessExample 201 Success-Response:
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
   * @apiErrorExample 403 Error-Response:
   *    {
   *      "code": 10010,
   *      "message": "没有权限"
   *    } 
   */
  async addCandidate(ctx) {
    let name = ctx.httpValidate.body('name').notEmpty().end();
    if (ctx.httpValidate.error()) {
      throw new Error(ResConstant.CODE_ARGS_NOT_MATCH.key);
    }

    //判断活动是否已开始
    let isActivityStart = await VoteService.isActivityStart();
    if (isActivityStart) {
      throw new Error(ResConstant.CODE_NOT_AUTHORIZED.key);
    }

    let candidateId = await VoteService.addCandidate(name);
    ctx.returnValue(ResConstant.CODE_CREATED_SUCCESS.key, {
      candidateId: candidateId,
      name: name
    });
  }

  /**
   * @api {DELETE} /api/v1/admin/candidate/:candidateId 移除候选人
   * @apiGroup Admin
   * @apiHeader {String} token 用户令牌
   * @apiParam  {String} candidateId 候选人Id
   * @apiSuccessExample 204 Success-Response:
   *    defalut
   * @apiErrorExample 400 Error-Response:
   *    {
   *      "code": 10002,
   *      "message": "请求参数不正确"
   *    }
   * @apiErrorExample 403 Error-Response:
   *    {
   *      "code": 10010,
   *      "message": "没有权限"
   *    }
   */
  async removeCandidate(ctx) {
    let candidateId = ctx.httpValidate.params('candidateId').notEmpty().end();
    if (ctx.httpValidate.error()) {
      throw new Error(ResConstant.CODE_ARGS_NOT_MATCH.key);
    };

    //判断活动是否已开始
    let isActivityStart = await VoteService.isActivityStart();
    if (isActivityStart) {
      throw new Error(ResConstant.CODE_NOT_AUTHORIZED.key);
    }

    //判断候选人是否存在
    let isCandidate = await VoteService.isCandidate(candidateId);
    if (!isCandidate) {
      throw new Error(ResConstant.CODE_ARGS_NOT_MATCH.key);
    }

    await VoteService.dropCandidate(candidateId);
    ctx.returnValue(ResConstant.CODE_DELETE_SUCCESS.key);
  }

  /**
   * @api {PUT} /api/v1/admin/candidate/info 修改候选人信息
   * @apiGroup Admin
   * @apiHeader {String} token 用户令牌
   * @apiParam  {String} candidateId 候选人Id
   * @apiParam  {String} name 候选人名称
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
   * @apiErrorExample 403 Error-Response:
   *    {
   *      "code": 10010,
   *      "message": "没有权限"
   *    }
   */
  async updateCandidate(ctx) {
    let candidateId = ctx.httpValidate.body('candidateId').notEmpty().end();
    let name = ctx.httpValidate.body('name').notEmpty().end();
    if (ctx.httpValidate.error()) {
      throw new Error(ResConstant.CODE_ARGS_NOT_MATCH.key);
    };

    //判断活动是否已开始
    let isActivityStart = await VoteService.isActivityStart();
    if (isActivityStart) {
      throw new Error(ResConstant.CODE_NOT_AUTHORIZED.key);
    }

    //判断候选人是否存在
    let isCandidate = await VoteService.isCandidate(candidateId);
    if (!isCandidate) {
      throw new Error(ResConstant.CODE_ARGS_NOT_MATCH.key);
    }

    await VoteService.updateCandidate(candidateId, name);
    ctx.returnValue(ResConstant.CODE_SUCCESS.key);
  }

  /**
   * @api {GET} /api/v1/admin/candidate/list 获取候选人投票列表
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
   *            "name": "test",
   *            "voteCount": 0
   *          }
   *        ]
   *      }
   *    }
   */
  async getCandidateList(ctx) {
    let candidateList = await VoteService.adminGetCandidateCacheList();
    ctx.returnValue(ResConstant.CODE_SUCCESS.key, {
      candidateList: candidateList
    })
  }

}

module.exports = new AdminController();