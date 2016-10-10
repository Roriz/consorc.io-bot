const path = require('path');
const assert = require('assert');
const _ = require('lodash');

module.exports = (bot, i18n) => {
  const SharedMethods = require(path.resolve(__dirname + '/shared-methods.js'))(bot, i18n);

  return class CancelController extends SharedMethods {

    newRequest(data, collections) {
      const self = this;
      var message = data.message;
      if (message) {
        message.user = data.user;
        message.chat.id = _.get(data, 'user.id');
      } else {
        message = data;
      }

      self.valid(message, collections, function (err) {
        console.log("#cancel_true Chat:" + message.chat.id + '; User:' + message.user.id);
        bot.sendMessage(message.chat.id, i18n.__('cancel.success'));


        _.each(collections, function (collection, key) {
          collection.remove({
            "chat.id": message.chat.id
          }, (err, registers) => {
            assert.equal(null, err);

            if (registers && registers.n) {
              console.log("#cancel_remove_db runing in " + key + " Chat:" + message.chat.id + '; User:' + message.user.id);
            }

          });
        });

      });

    }

    valid(message, collections, callback) {
      const self = this;

      var asyncRequests = 0;
      var findAnyRegister = false;
      _.each(collections, function (collection) {
        collection.findOne({
          "chat.id": message.chat.id
        }, (err, registers) => {
          assert.equal(null, err);

          if (registers && findAnyRegister === false) {
            findAnyRegister = true;
            callback();
          }

          if (++asyncRequests >= Object.keys(collections).length && findAnyRegister === false) {
            console.log("#cancel_false Chat:" + message.chat.id + '; User:' + message.user.id);
            bot.sendMessage(message.chat.id, i18n.__('cancel.fail'));
          }
        });
      });

    }

    validEnd(callback) {}


  }

};