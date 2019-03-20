class HttpValidate {
  constructor(ctx) {
    this.ctx = ctx;
    this.errorMsg = [];
    this.arg = "";
    this.source = "";
    this.value = null;
  }

  body(arg) {
    this.value = null;
    this.arg = arg;
    this.source = "body";
    return this;
  }

  params(arg) {
    this.value = null;
    this.arg = arg;
    this.source = "params";
    return this;
  }

  query(arg) {
    this.value = null;
    this.arg = arg;
    this.source = "query";
    return this;
  }

  getArg() {
    if (!this.value && this.source == 'query') {
      this.value = this.ctx.query[this.arg];
    }
    if (!this.value && this.source == 'body') {
      this.value = this.ctx.request[this.source][this.arg];
    }
    if (!this.value && this.source == 'params') {
      this.value = this.ctx[this.source][this.arg];
    }
    return this.value;
  }

  /**
   * 需要该参数，但是允许为空
   */
  required() {
    if (typeof this.getArg() == 'undefined') {
      this.errorMsg.push(`Arguments ${this.arg} should not empty`);
    }
    return this;
  }

  issetArg() {
    return typeof this.getArg() != 'undefined' ? true : false;
  }

  /**
   * 需要该参数，不允许为空
   */
  notEmpty() {
    if (typeof this.getArg() == 'undefined' || this.getArg().length == 0) {
      this.errorMsg.push(`Arguments ${this.arg} should not empty`);
    }
    return this;
  }

  /**
   * 结束验证，返回当期校验的值
   */
  end() {
    return this.getArg();
  }

  /**
   * 字符串限制
   */
  lengthLimit(oper, num) {
    if (!this.issetArg()) {
      this.errorMsg.push(`Arguments ${this.arg} should not empty`);
      return this;
    }
    if (oper == ">") {
      if (this.issetArg() && this.getArg().toString().length <= num) {
        this.errorMsg.push(`Arguments ${this.arg} not in the limit scope`);
        return this;
      }
    }
    if (oper == "<") {
      if (this.issetArg() && this.getArg().toString().length >= num) {
        this.errorMsg.push(`Arguments ${this.arg} not in the limit scope`);
        return this;
      }
    }
    if (oper == ">=") {
      if (this.issetArg() && this.getArg().toString().length < num) {
        this.errorMsg.push(`Arguments ${this.arg} not in the limit scope`);
        return this;
      }
    }
    if (oper == "<=") {
      if (this.issetArg() && this.getArg().length > num) {
        this.errorMsg.push(`Arguments ${this.arg} not in the limit scope`);
        return this;
      }
    }
    return this;
  }

  isString() {
    if (!this.issetArg()) {
      this.errorMsg.push(`Arguments ${this.arg} should not empty`);
      return this;
    }
    if (this.issetArg() && typeof this.getArg() != 'string') {
      this.errorMsg.push(`Arguments ${this.arg} should be string`);
      return this;
    }
    return this;
  }

  isEmail() {
    let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!reg.test(this.getArg())) {
      this.errorMsg.push(`Arguments ${this.arg} is not a email`);
    }
    return this;
  }

  isArray() {
    if (!this.issetArg()) {
      this.errorMsg.push(`Arguments ${this.arg} should not empty`);
      return this;
    }
    if (!Array.isArray(this.getArg())) {
      this.errorMsg.push(`Arguments ${this.arg} should be array`);
    }
    return this;
  }

  isObject() {
    if (typeof this.getArg() != 'object') {
      this.errorMsg.push(`Arguments ${this.arg} should be object`);
    }
    return this;
  }

  isNumber() {
    if (!this.issetArg()) {
      this.errorMsg.push(`Arguments ${this.arg} should not empty`);
      return this;
    }
    let num = /^[0-9]*$/;
    let ret = num.test(this.getArg())
    if (!ret) {
      this.errorMsg.push(`Arguments ${this.arg} should be number`);
    }
    return this;
  }

  isInteger() {
    let reg = /^\d+$/;
    if (!reg.test(this.getArg())) {
      this.errorMsg.push(`Arguments ${this.arg} should be integer, now is ${typeof this.arg}`);
    }
    return this;
  }

  isBoolean() {
    if (typeof this.getArg() != 'boolean') {
      this.errorMsg.push(`Arguments ${this.arg} should be boolean`);
    }
    return this;
  }

  isObjectId() {
    let checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    if (!checkForHexRegExp.test(this.getArg())) {
      this.errorMsg.push(`Arguments ${this.arg} is not a objectId`);
    }
    return this;
  }

  error() {
    if (this.errorMsg.length == 0) {
      return false;
    }
    return {
      errMsg: this.errorMsg
    };
  }

  xssfilter() {
    if (typeof this.getArg() == 'undefined' || this.getArg().length == 0) {
      return this;
    }
    this.value = this.value.replace(/</g, "&#60");
    this.value = this.value.replace(/>/g, "&#62");
    return this;
  }
}

module.exports = HttpValidate;