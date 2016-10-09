const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

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
        'start': 'StartController',
        'confirm': 'ConfirmController',
        'store': 'StoreController'
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

      // Any kind of message
      self.bot.on('message', (msg) => {
        Alkdfjglkdfjgkldfjlk.newRequest(msg, self.collections)
      });

    }

  }
}