const _ = require('lodash');
const path = require('path');
const assert = require('assert');
const fs = require('fs');

module.exports = (SharedMethods, collections, bot, runAnotherClass, catalog) => {
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

    valid(callback) {
      const self = this;

      collections.starters.findOne({
        "chat.id": self.chat.id
      }, (err, starters) => {
        collections.syndicate.findOne({
          "chat.id": self.chat.id
        }, (err, syndicate) => {
          callback(syndicate ? true : (starters ? true : false));
        });
      });
    }

    render() {
      const self = this;

      self.valid(function (err) {
        if (err) {
          console.log("#start_false Chat:" + self.chat.id + '; User:' + self.user.id);
          bot.sendMessage(self.chat.id, catalog.t('start.fail'));
        } else {
          bot.getChatMembersCount(self.chat.id).then((count) => {
            count = count - 1;

            const image = self.first_image();

            bot.sendDocument(self.chat.id, image).then(() => {
              console.log("#start_true Chat:" + self.chat.id + '; User:' + self.user.id);
              bot.sendMessage(self.chat.id, catalog.t('start.success', count));
            });

          });

          collections.starters.insert({
            chat: self.chat,
            joins: [self.user]
          }, (err, result) => {
            assert.equal(null, err);

            console.log("#start_db Chat:" + self.chat.id + '; User:' + self.user.id);
          });
        }
      });

    }

    cancel() {
      const self = this;

      collections.starters.remove({
        "chat.id": self.chat.id
      }, (err, result) => {
        assert.equal(null, err);

        console.log("#start_cancel Chat:" + self.chat.id);
        bot.sendMessage(self.chat.id, catalog.t('start.canceled'));
      });
    }

  }

};