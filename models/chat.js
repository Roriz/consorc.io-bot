const _ = require('lodash');


module.exports = (bot, i18n) => {
  return class Chat {
    constructor(args) {
      const self = this;
      _.each(args, function (v, k) {
        self[k] = v;
      });
    }
  }
}