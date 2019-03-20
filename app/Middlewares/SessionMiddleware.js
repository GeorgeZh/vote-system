const Redis = require('../Models/Redis');
const ResConstant = require('../Tools/ResConstant');
const UserModel = require('../Models/User');

module.exports = async function (ctx, next) {
  let token = ctx.request.header.token;
  if (!token || token.length < 1 || token == 'null') {
    token = ctx.request.body.token;
  }
  if (!token || token.length < 1 || token == 'null') {
    token = ctx.cookies.get('token');
  }
  if (!token || token.length < 1 || token == 'null') {
    throw new Error(ResConstant.CODE_NEED_LOGIN.key);
  }
  let sessionKey = `session:${token}`;
  let redisClient = Redis.getClient();
  let sessionObj = await redisClient.hgetallAsync(sessionKey);
  if (!sessionObj) {
    throw new Error(ResConstant.CODE_NEED_LOGIN.key);
  }
  let userObj = await UserModel.getUserByUid(sessionObj.uid);
  if (!userObj) {
    throw new Error(ResConstant.CODE_SYSTEM_ERROR.key);
  }
  ctx.user = sessionObj;
  await next();
}