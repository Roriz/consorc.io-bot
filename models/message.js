const _ = require('lodash');
const path = require('path');

module.exports = (bot, i18n) => {
  const User = require(path.resolve(__dirname + '/user.js'))(bot, i18n);
  const Chat = require(path.resolve(__dirname + '/user.js'))(bot, i18n);

  return class Message {
    constructor(msg) {
      this.msg = msg;

      this.user = new User(_.get(this, 'msg.from'));
      this.chat = new Chat(_.get(this, 'msg.from'));
    }
  }
}