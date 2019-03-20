module.exports = {
  CODE_SUCCESS: {
    status: 200,
    code: 10000,
    message: '请求成功',
    key: 'CODE_SUCCESS'
  },
  CODE_CREATED_SUCCESS: {
    status: 201,
    code: 10001,
    message: '请求成功',
    key: 'CODE_CREATED_SUCCESS'
  },
  CODE_ARGS_NOT_MATCH: {
    status: 400,
    code: 10002,
    message: '请求参数错误',
    key: 'CODE_ARGS_NOT_MATCH'
  },
  CODE_SYSTEM_ERROR: {
    status: 500,
    code: 10003,
    message: '服务器发生未知错误',
    key: 'CODE_SYSTEM_ERROR'
  },
  CODE_MYSQL_ERROR: {
    status: 500,
    code: 10004,
    message: 'Mysql数据库发生错误',
    key: 'CODE_MYSQL_ERROR'
  },
  CODE_REDIS_ERROR: {
    status: 500,
    code: 10005,
    message: 'Redis数据库发生错误',
    key: 'CODE_REDIS_ERROR'
  },
  CODE_LOGIN_ERROR: {
    status: 401,
    code: 10006,
    message: '账号或密码错误',
    key: 'CODE_LOGIN_ERROR'
  },
  CODE_ACTIVATE_ERROR: {
    status: 400,
    code: 10007,
    message: '激活链接错误或已失效',
    key: 'CODE_ACTIVATE_ERROR'
  },
  CODE_HAS_ACTIVATED: {
    status: 400,
    code: 10008,
    message: '账号已激活',
    key: 'CODE_HAS_ACTIVATED'
  },
  CODE_NEED_LOGIN: {
    status: 401,
    code: 10009,
    message: '请先登录',
    key: 'CODE_NEED_LOGIN'
  },
  CODE_NOT_AUTHORIZED: {
    status: 403,
    code: 10010,
    message: '没有权限',
    key: 'CODE_NOT_AUTHORIZED'
  },
  CODE_VOTE_NOT_START: {
    status: 403,
    code: 10011,
    message: '活动未开始',
    key: 'CODE_VOTE_NOT_START'
  },
  CODE_VOTE_HAS_OVER: {
    status: 403,
    code: 10012,
    message: '活动已结束',
    key: 'CODE_VOTE_HAS_OVER'
  },
  CODE_VOTE_ERROR: {
    status: 403,
    code: 10013,
    message: '未设置活动时间',
    key: 'CODE_VOTE_ERROR'
  },
  CODE_DELETE_SUCCESS: {
    status: 204,
    code: 10014,
    message: '请求成功',
    key: 'CODE_DELETE_SUCCESS'
  },
  CODE_VOTE_ERROR: {
    status: 503,
    code: 10015,
    message: '投票系统异常',
    key: 'CODE_VOTE_ERROR'
  },
  CODE_USER_NOTFOUND: {
    status: 400,
    code: 10016,
    message: '用户不存在',
    key: 'CODE_USER_NOTFOUND'
  }
} 