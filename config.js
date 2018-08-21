const fs = require('fs-extra');
const path = require('path');

const defaults = {
  port: 9931,
  dbUrl: 'mongodb://db/jotc',
  session: {
    secret: 'session-secret-key',
    lifetimeInDays: 10
  },
  gmail: {
    username: 'gmail-username',
    password: 'gmail-password'
  },
  www: {
    root: './www-root',
    getPath(pathSegment) {
      let fullPath = path.join(defaults.www.root, pathSegment);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirpSync(fullPath);
      }

      return fullPath;
    }
  }
};

var configFile = require('./server-config.json');

module.exports = {
  port: +process.env.PORT || configFile.port || defaults.port,
  dbUrl: process.env.DB_URL || configFile.dbUrl || defaults.dbUrl,
  session: {
    secret:
      process.env.SESSION_SECRET ||
      configFile.session.secret ||
      defaults.session.secret,
    lifetimeInDays:
      +process.env.SESSION_LIFETIME ||
      configFile.session.lifetimeInDays ||
      defaults.session.lifetimeInDays
  },
  gmail: {
    username:
      process.env.GMAIL_USERNAME ||
      configFile.gmail.username ||
      defaults.gmail.username,
    password:
      process.env.GMAIL_PASSWORD ||
      configFile.gmail.password ||
      defaults.gmail.password
  },
  stripe: {
    key: process.env.STRIPE_KEY || configFile.stripe.key || defaults.stripe.key
  },
  www: defaults.www
};
