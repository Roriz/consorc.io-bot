const path = require('path');
const assert = require('assert');

module.exports = (bot, i18n) => {
  const SharedMethods = require(path.resolve(__dirname + '/shared-methods.js'))(bot, i18n);

  return class StartController extends SharedMethods {

    get images() {
      return [
        path.resolve(__dirname, '..', 'gifs', 'start_1.gif'),
        // path.resolve(__dirname, '..', 'gifs', 'start_2.gif'), // a lot bigger, this apply slowly on /start
        path.resolve(__dirname, '..', 'gifs', 'start_3.gif'),
        // path.resolve(__dirname, '..', 'gifs', 'start_4.gif'), // a lot bigger, this apply slowly on /start
        // path.resolve(__dirname, '..', 'gifs', 'start_5.gif') // a lot bigger, this apply slowly on /start
      ]
    }

    first_image() {
      const pos = Math.random() * this.images.length;
      return this.images[parseInt(pos)]
    }

    newRequest(mgs, collections) {
      const self = this;
      var message = new Message(mgs);

      self.valid(message, collections, function (err) {

        self.getMembers(message.chat, function (count) {

          bot.sendDocument(message.chat.id, self.first_image()).then(() => {
            console.log("#start_true Chat:" + message.chat.id + '; User:' + message.user.id);
            bot.sendMessage(message.chat.id, catalog.t('start.success', count));
          });

        });

        collections.starters.insert({
          chat: message.chat,
          joins: [message.user]
        }, (err, result) => {
          assert.equal(null, err);

          console.log("#start_db Chat:" + message.chat.id + '; User:' + message.user.id);
        });

      });

    }

    valid(message, collections, callback) {
      const self = this;

      collections.starters.findOne({
        "chat.id": message.chat.id
      }, (err, starters) => {
        assert.equal(null, err);

        collections.syndicate.findOne({
          "chat.id": message.chat.id
        }, (err, syndicate) => {
          assert.equal(null, err);

          if (syndicate || starters) {
            console.log("#start_false Chat:" + message.chat.id + '; User:' + message.user.id);
            bot.sendMessage(message.chat.id, catalog.t('start.fail'));

          } else {
            callback();
          }
        });
      });
    }


  }

};