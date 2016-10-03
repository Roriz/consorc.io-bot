const TelegramBot = require('node-telegram-bot-api-latest');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const i18n = require("i18n");
const config = JSON.parse(fs.readFileSync('config/development.json', 'utf8'));



// ------------------------------------------ INITIALIZE AND CONFIG DEFAULT PLUGINS
// Setup polling way
var bot = new TelegramBot(config.token, {
  polling: true
});


i18n.configure({
  updateFiles: true,
  syncFiles: true,
  locales: ['en', 'pt'],
  // defaultLocale: 'en',
  directory: path.resolve(__dirname, config.i18n.folder),
  api: {
    '__': 't', //now req.__ becomes req.t 
  }
});

var catalog = {};
i18n.init(catalog, 'en');


// ------------------------------------------ CREATE MACRO METHODS AND CLASSES
var allClasses = [];
const runAnotherClass = (className, methodName, options) => {
  allClasses[className][methodName](options);
}

class MainController {
  constructor(msg) {
    this.msg = msg;
    this.setVariables();
    this.router();
  }

  setVariables() {
    this.user = this.msg.from;
    this.chat = this.msg.chat;
  }

  router() {
    if (/\/cancel_/.test(this.msg.text)) {
      this.cancel()
    } else {
      this.render()
    }
  }

  cancel() {
    return false;
  }
  render() {
    return false;
  }
}



// ------------------------------------------ RUN APPLICATION
// Use connect method to connect to the server
MongoClient.connect(config.mongo.url, function (err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const collections = {
    starters: db.collection('starters'),
    syndicate: db.collection('syndicate'),
    next_message: db.collection('next_message'),
    dones: db.collection('dones')
  };

  fs.readdir(path.resolve(__dirname, config.controller_folder), (err, files) => {
    assert.equal(null, err);

    _.each(files, (file) => {
      if (file) {
        var controller = require(path.resolve(__dirname, config.controller_folder, file))(MainController, collections, bot, runAnotherClass, catalog);
        var controllerName = file.replace('.js', '');

        bot.onText(new RegExp('/' + controllerName), function (msg, match) {
          allClasses[controllerName] = new controller(msg);
        });
        bot.onText(new RegExp('/cancel_' + controllerName), function (msg, match) {
          allClasses[controllerName] = new controller(msg);
        });
      }
    });

    // Any kind of message
    bot.on('message', function (msg) {

      // collections.syndicate.findOne({
      //   "chat.id": self.chat.id
      // }, (err, result) => {
      //   assert.equal(err, null);

      //   callback(result ? result : false);
      // });

    });

    console.log('Load all controllers');

  });


  // db.close();

});