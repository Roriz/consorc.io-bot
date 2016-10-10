const _ = require('lodash');
const path = require('path');

module.exports = (bot, i18n) => {
  const User = require(path.resolve(__dirname + '/user.js'))(bot, i18n);
  const Message = require(path.resolve(__dirname + '/message.js'))(bot, i18n);

  return class Callback {
    constructor(msg) {
      this.id = msg.id;
      this.message = new Message(msg.message);
      this.user = new User(msg.from);
      this.chat_instance = msg.chat_instance;
      this.text = msg.data;
    }
  }
}