const _ = require('lodash');
const path = require('path');
const assert = require('assert');

module.exports = (SharedMethods, collections, bot, runAnotherClass) => {
  return class StoreController extends SharedMethods {

    validate(callback) {
      const self = this;

      collections.syndicate.findOne({
        "chat.id": self.chat.id
      }, (err, result) => {
        assert.equal(err, null);

        callback(result ? result : false);
      });
    }


    endVote(currentVotes, totalVotes) {
      const self = this;

      if (currentVotes / totalVotes > 2 / 3) {
        console.log("#end_vote Chat: " + self.chat.id);
        bot.sendMessage(self.chat.id, 'Already have more than half.');
      }
    }

    updateVote() {
      const self = this;

      bot.getChatMembersCount(self.chat.id).then((count) => {
        count = count - 1;

        collections.syndicate.findOne({
          "chat.id": self.chat.id
        }, (err, result) => {
          assert.equal(err, null);
          if (!result) { // Broke plix
            return false
          }
          const curretVotes = result.joins.length

          console.log("#update_vote " + curretVotes + '/' + count);
          bot.sendMessage(self.chat.id, 'Current we have ' + curretVotes + '/' + count);

          self.endVote(curretVotes, count);
        });

      })
    }

    render() {
      const self = this;
      if (!self.text) {
        return false;
      }

      self.validate(function (resp) {
        if (resp) {
          collections.syndicate.updateOne({
            "chat.id": self.chat.id
          }, {
            $push: {
              "stores": self.text
            }
          }, (err, result) => {
            assert.equal(err, null);
            if (!result) { // Broke plix
              return false
            }

            collections.syndicate.findOne({
              "chat.id": self.chat.id
            }, (err, result) => {
              assert.equal(err, null);
              if (!result) { // Broke plix
                return false
              }

              console.log("#store_new Chat:" + self.chat.id + '; Store:' + self.text);
              bot.sendMessage(self.chat.id, 'Success add a new option.', {
                reply_markup: JSON.stringify({
                  keyboard: self.parseKeyboardStore(result.stores),
                  one_time_keyboard: true
                })
              });
            });

          });
        } else {
          console.log("#store_fail Chat:" + self.chat.id);
          bot.sendMessage(self.chat.id, "Don't have any active syndicate.");
        }
      });


    }

    parseKeyboardStore(storesDB) {
      const self = this;

      var stores = [];
      _.each(storesDB, function (store, key) {
        stores.push([{
          text: (key + 1) + ' - ' + store,
          callback_data: '/vote ' + key
        }]);
      });

      return stores;
    }


    cancel($) {
      const self = this;

      collections.syndicate.findOne({
        "chat.id": self.chat.id
      }, (err, syndicate) => {
        assert.equal(err, null);

        collections.starters.findOne({
          "chat.id": self.chat.id
        }, (err, starters) => {
          assert.equal(err, null);
        });

        if (!syndicate) { // Broke plix
          return false
        }
        var removed = _.remove(syndicate.stores, function (n, k) {
          return k == parseInt(self.text) - 1;
        });


        collections.syndicate.updateOne({
          "chat.id": self.chat.id
        }, {
          $set: {
            "stores": syndicate.stores
          }
        }, (err, result) => {
          assert.equal(err, null);
          if (!result) { // Broke plix
            return false
          }
        });

        console.log("#store_cancel Chat:" + self.chat.id + '; Store:' + self.text);
        bot.sendMessage(self.chat.id, 'Success remove a option ' + _.first(removed) + '.', {
          reply_markup: JSON.stringify({
            keyboard: self.parseKeyboardStore(syndicate.stores),
            one_time_keyboard: true
          })
        });
      });


    }

  }

};