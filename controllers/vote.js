const _ = require('lodash');
const path = require('path');
const assert = require('assert');


module.exports = (bot, i18n) => {
  const SharedMethods = require(path.resolve(__dirname + '/shared-methods.js'))(bot, i18n);

  return class VoteController extends SharedMethods {

    newRequest(callback, collections) {
      const self = this;

      self.valid(callback.message, collections, () => {

        self.addUser(callback.message, collections, () => {

          console.log("#vote_add Chat:" + callback.message.chat.id + '; User:' + callback.message.user.id);
          bot.answerCallbackQuery(callback.id, 'Vote registed!');

        });

      });
    }


    start(message, collections) {
      const self = this;

      self.valid(message, collections, () => {

        self.addUser(message, collections, () => {

          console.log("#vote_start Chat:" + message.chat.id + '; User:' + message.user.id);
          bot.sendMessage(message.chat.id, i18n.__('vote.start'), {
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [{
                  text: 'Yes',
                  callback_data: '/vote'
                }, {
                  text: 'No',
                  callback_data: '/cancel'
                }]
              ]
            })
          });

          self.updateVote(message, collections);
        });


      });

    }

    addUser(message, collections, callback) {
      collections.starters.updateOne({
        "chat.id": message.chat.id
      }, {
        $push: {
          "joins": message.user
        }
      }, (err, result) => {
        assert.equal(err, null);

        callback();
      });
    }


    valid(message, collections, callback) {
      const self = this;

      collections.starters.findOne({
        "chat.id": message.chat.id,
        "joins.id": message.user.id
      }, (err, result) => {
        assert.equal(err, null);

        if (result) {
          console.log("#join_false Chat:" + message.chat.id + '; User:' + message.user.id);
          bot.sendMessage(message.chat.id, i18n.__('vote.fail'));
        } else {
          callback();
        }
      });

    }


    updateVote(message, collections) {
      const self = this;

      self.getMembers(message.chat, function (count) {

        collections.starters.findOne({
          "chat.id": message.chat.id
        }, (err, starter) => {
          assert.equal(err, null);
          if (!starter) { // Broke plix
            return false
          }
          const curretVotes = starter.joins.length

          console.log("#vote_update " + curretVotes + '/' + count);
          bot.sendMessage(message.chat.id, i18n.__('vote.statitics', curretVotes, count)).then(() => {
            // need record this id to update message.
          });

          if (curretVotes / count > 2 / 3) {
            console.log("#vote_end Chat: " + message.chat.id);
            self.endVote(message, collections, starter);
          }
        });

      })
    }


    endVote(message, collections, starter) {
      const self = this;

      collections.syndicate.insert(starter, (err, result) => {
        assert.equal(null, err);

        collections.starters.remove({
          "chat.id": message.chat.id
        }, (err, result) => {
          assert.equal(null, err);

          bot.sendMessage(message.chat.id, 'Still on dev. Thank you for using this bot.');
          // global['StoreController'].newRequest(message, collections);
        });

      });

    }
  }

};