const TelegramBot = require('node-telegram-bot-api-latest');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
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
  defaultLocale: 'en',
  directory: path.resolve(__dirname, config.i18n.folder),
  api: {
    '__': 't', //now req.__ becomes req.t 
  }
});


// ------------------------------------------ SERVER
class Server {
  constructor() {
    const self = this;

    self.load('models', false, () => {
      self.load('controllers', true, () => {

        var app = new Application(config, bot);
        app.start();

      });
    });
  }

  pathTo(to, from) {
    return path.resolve((from ? from : __dirname), to);
  }

  loadFolder(folder, callback) {
    fs.readdir(this.pathTo(folder), (err, files) => {
      assert.equal(null, err);

      callback(files);
    });
  };

  loadFiles(folder, files, needArgs) {
    const self = this;

    _.each(files, (file) => {
      if (file) {
        var controller = require(self.pathTo(file, folder))(bot, i18n);

        global[controller.name] = controller;
      }
    });
  };

  load(name, needArgs, callback) {
    const self = this;

    self.loadFolder(name, (files) => {
      self.loadFiles(name, files, needArgs);
      console.log('Load all ' + name);

      callback();
    });
  }
}



new Server();