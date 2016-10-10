const _ = require('lodash');
const path = require('path');

module.exports = (bot, i18n) => {
  const User = require(path.resolve(__dirname + '/user.js'))(bot, i18n);
  const Chat = require(path.resolve(__dirname + '/user.js'))(bot, i18n);

  return class Message {
    constructor(msg) {
      this.user = new User(_.get(msg, 'from'));
      this.chat = new Chat(_.get(msg, 'from'));
      this.text = _.get(msg, 'text');
      this.date = _.get(msg, 'date');
      this.id = _.get(msg, 'message_id');
    }
  }
}