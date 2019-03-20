const Koa = require('koa');
const app = new Koa();

const bodyParser = require('koa-bodyparser');
const router = require('koa-router')({});

const ResConstant = require('./app/Tools/ResConstant');
const routerHandler = require('./app/Routers/api');
const HttpValidate = require('./app/Tools/HttpValidate');

//通用异常处理格式
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    let handlerRs = ResConstant[err.message] ? ResConstant[err.message] : false;
    if (!handlerRs) {
      console.log(err);
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = {
        message: err.name,
        data: err.message
      }
      return;
    }
    ctx.status = handlerRs.status
    ctx.body = {
      code: handlerRs.code,
      message: handlerRs.message
    }
  }
});

//通用返回格式
app.use(async (ctx, next) => {
  ctx.returnValue = (resKey, data = {}) => {
    if (!ResConstant[resKey]) {
      throw new Error(ResConstant.CODE_SYSTEM_ERROR.key);
    }
    ctx.status = ResConstant[resKey].status;
    ctx.body = {
      code: ResConstant[resKey].code,
      message: ResConstant[resKey].message,
      data: data
    }
  }
  await next();
})

app.use(bodyParser());

app.use(async (ctx, next) => {
  ctx.httpValidate = new HttpValidate(ctx);
  await next()
})

routerHandler(router);

app.use(router.routes())
  .use(router.allowedMethods());

if (module.parent) {
  module.exports = app;
} else {
  app.listen(3002);
}