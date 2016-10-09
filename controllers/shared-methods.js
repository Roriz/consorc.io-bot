module.exports = (bot, i18n) => {
  return class SharedMethods {
    constructor() {
      this.i18n = i18n;
    }

    getMembers(chat, callback) {
      bot.getChatMembersCount(chat.id).then((count) => {
        count = count - 1;
        callback(count);
      });
    }

  }
}