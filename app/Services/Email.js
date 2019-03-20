const config = require('../Configs');
const nodemailer = require('nodemailer');

class EmailService {

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      auth: {
        user: config.email.email,
        pass: config.email.password
      }
    });
  }

  sendEmail(title, content, reciver) {
    let mailOptions = {
      from: config.email.email,
      to: reciver,
      subject: title,
      html: content
    };
    this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
