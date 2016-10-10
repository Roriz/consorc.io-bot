const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const _ = require('lodash');

module.exports = (bot, i18n) => {
  return class Application {
    constructor(config, bot) {
      this.config = config;
      this.collections = {};
      this.db = false;
      this.bot = bot;
    }

    get routes() {
      return {
        '/start': 'StartController#newRequest',
        '/vote': 'VoteController#newRequest',
        '/cancel': 'CancelController#newRequest'
      }
    }

    start() {
      const self = this;

      self.connections(() => {

        self.setCollections();
        self.setRoutes();;
        console.log('Aplication Started!');

      });
    }

    connections(callback) {
      const self = this;

      MongoClient.connect(self.config.mongo.url, (err, db) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        self.db = db;
        callback();

        // db.close();
      });
    }

    setCollections() {
      if (this.db) {
        this.collections = {
          starters: this.db.collection('starters'),
          syndicate: this.db.collection('syndicate'),
          next_message: this.db.collection('next_message'),
          dones: this.db.collection('dones')
        };
      } else {
        console.log('To loadCollections need load db before.');
      }
    }

    setRoutes() {
      const self = this;

      self.bot.on('callback_query', (msg) => {
        var callback = new Callback(msg);

        self.compareRoutes(callback.text, callback);
      });

      self.bot.on('message', (msg) => {
        var message = new Message(msg);

        self.compareRoutes(message.text, message);
      });

    }

    compareRoutes(text, data) {
      const self = this;

      _.each(self.routes, function (route, key) {
        var regex = new RegExp(key + /\s+.*/.source, 'i');
        var route = route.split('#');
        const className = route[0];
        const methodName = route[1];

        if (regex.test(text) || key == text) {
          global[className][methodName](data, self.collections)
        }

      });
    }

  }
}