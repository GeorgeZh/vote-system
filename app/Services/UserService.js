const EmailService = require('../Services/Email');
const SessionModel = require('../Models/Session');
const UserModel = require('../Models/User');
const config = require('../Configs');
const ResConstant = require('../Tools/ResConstant');

const crypto = require('crypto')

const ENABLE = 1;
const PASSWORD_SALT = 'zero';

class UserService {

  /**
   * 以uid判断用户是否已注册
   * @param {Int} uid 
   */
  async isRegisteredByUid(uid) {
    let user = await UserModel.getUserByUid(uid);
    if (!user) {
      return false;
    }
    return true;
  }

  /**
   * 以email判断用户是否已注册 
   * @param {String} email 
   */
  async isRegisteredByEmail(email) {
    let user = await UserModel.getUserByEmail(email);
    if (!user) {
      return false;
    }
    return true;
  }

  /**
   * 判断用户是否已激活
   * @param {Int} uid 
   */
  async isEnabled(uid) {
    let user = await UserModel.getUserByUid(uid);
    if (!user) {
      throw new Error(ResConstant.CODE_USER_NOTFOUND.key);
    }
    let isEnabled = user.isEnabled;
    if (isEnabled != ENABLE) {
      return false;
    }
    return true;
  }

  /**
   * 判断urlToken是否正确
   * @param {Int} uid 
   * @param {String} targetUrlToken 
   */
  async isUrlToken(uid, targetUrlToken) {
    let urlToken = await UserModel.getUrlToken(uid);
    if (!urlToken || targetUrlToken != urlToken) {
      return false;
    }
    return true;
  }

  /**
   * 激活用户
   * @param {Int} uid 
   */
  async activateUser(uid) {
    let user = await UserModel.getUserByUid(uid);
    if (!user) {
      throw new Error(ResConstant.CODE_USER_NOTFOUND.key);
    }
    await UserModel.activate(uid);
    let token = await SessionModel.save(user);
    return token;
  }

  /**
   * 注册用户
   * @param {String} email 
   * @param {String} password 
   */
  async register(email, password) {
    let md5 = crypto.createHash("md5");
    md5.update(PASSWORD_SALT + password);
    let md5_password = md5.digest('hex');
    let uid = await UserModel.register(email, md5_password);
    let urlToken = await UserModel.saveUrlToken(uid);
    sendActivateEmail(email, uid, urlToken);
  }

  /**
   * 判断用户密码是否正确
   * @param {Int} uid 
   * @param {String} password 
   */
  async isPassword(uid, password) {
    let md5 = crypto.createHash("md5");
    md5.update(PASSWORD_SALT + password);
    let md5_password = md5.digest('hex');
    let user = await UserModel.getUserByUid(uid);
    if (!user) {
      throw new Error(ResConstant.CODE_USER_NOTFOUND.key);
    }
    if (md5_password != user.password) {
      return false;
    }
    return true;
  }

  /**
   * 已注册未激活用户再次激活
   * @param {String} email
   */
  async newlyActivate(email) {
    let user = await UserModel.getUserByEmail(email);
    if (!user) {
      throw new Error(ResConstant.CODE_USER_NOTFOUND.key);
    }
    let uid = user.uid;
    let urlToken = await UserModel.saveUrlToken(uid);
    sendActivateEmail(email, uid, urlToken);
  }

  /**
   * 登录
   * @param {String} email 
   */
  async login(email) {
    let user = await UserModel.getUserByEmail(email);
    if (!user) {
      throw new Error(ResConstant.CODE_USER_NOTFOUND.key);
    }
    let token = await SessionModel.save(user);
    return token;
  }

  /**
   * 通过邮箱获取用户uid
   * @param {String} email 
   */
  async getUidByEmail(email) {
    let user = await UserModel.getUserByEmail(email);
    if (!user) {
      throw new Error(ResConstant.CODE_USER_NOTFOUND.key);
    }
    let uid = user.uid;
    return uid;
  }

}

/**
 * 发送用户激活链接邮件
 * @param {String} email 
 * @param {Int} uid 
 * @param {String} urlToken 
 */
function sendActivateEmail(email, uid, urlToken) {
  let emailTitle = '注册邮件';
  let emailContent = `请点击链接或复制打开进行激活<a target="_blank" href="${config.host.url}/api/v1/user/activate/${uid}/${urlToken}">${config.host.url}/api/v1/user/activate/${uid}/${urlToken}</a>`;
  EmailService.sendEmail(emailTitle, emailContent, email);
}

module.exports = new UserService();