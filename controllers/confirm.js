const _ = require('lodash');
const path = require('path');
const assert = require('assert');


module.exports = (bot, i18n) => {
  const SharedMethods = require(path.resolve(__dirname + '/shared-methods.js'))(bot, i18n);

  return class ConfirmController extends SharedMethods {

    validate(callback) {
      const self = this;

      collections.starters.findOne({
        "chat.id": self.chat.id,
        "joins.id": self.user.id
      }, (err, result) => {
        assert.equal(err, null);

        callback(result ? result : false);
      });
    }


    endVote(currentVotes, totalVotes) {
      const self = this;
      if (currentVotes / totalVotes > 2 / 3) {
        console.log("#end_vote Chat: " + self.chat.id);
        bot.sendMessage(self.chat.id, catalog.t('confirm.has_two_of_three'));
        collections.starters.findOne({
          "chat.id": self.chat.id
        }, (err, result) => {
          assert.equal(err, null);
          if (!result) { // Broke plix
            return false
          }



          collections.syndicate.insert(result, (err, result) => {
            assert.equal(null, err);

            bot.sendMessage(self.chat.id, catalog.t('confirm.success.approved'));

            collections.starters.remove({
              "chat.id": self.chat.id
            }, (err, result) => {
              assert.equal(null, err);

            });

          });



        });

      }
    }

    updateVote() {
      const self = this;

      bot.getChatMembersCount(self.chat.id).then((count) => {
        count = count - 1;

        collections.starters.findOne({
          "chat.id": self.chat.id
        }, (err, result) => {
          assert.equal(err, null);
          if (!result) { // Broke plix
            return false
          }
          const curretVotes = result.joins.length

          console.log("#update_vote " + curretVotes + '/' + count);
          bot.sendMessage(self.chat.id, catalog.t('confirm.current_state', curretVotes, count));

          self.endVote(curretVotes, count);
        });

      })
    }

    render() {
      const self = this;

      self.validate(function (err) {
        if (err) {
          console.log("#join_false Chat:" + self.chat.id + '; User:' + self.user.id);
          bot.sendMessage(self.chat.id, catalog.t('confirm.validate.user'));

          self.updateVote();
        } else {
          collections.starters.updateOne({
            "chat.id": self.chat.id
          }, {
            $push: {
              "joins": self.user
            }
          }, (err, result) => {
            assert.equal(err, null);

            console.log("#join_true Chat:" + self.chat.id + '; User:' + self.user.id);
            bot.sendMessage(self.chat.id, catalog.t('confirm.success.vote', self.user.first_name));

            self.updateVote();
          });

        }
      });
    }


    cancel($) {
      const self = this;

      collections.starters.updateOne({
        "chat.id": self.chat.id
      }, {
        $pull: {
          "joins": self.user
        }
      }, (err, result) => {
        assert.equal(err, null);

        console.log("#join_cancel User:" + self.user.id);
        bot.sendMessage(self.chat.id, catalog.t('confirm.fail.vote', self.user.first_name));

        self.updateVote();
      });

    }

  }

};