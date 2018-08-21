const db = require('../model/db');
const log = require('bunyan').createLogger({
  name: 'payment component',
  level: 'debug'
});
const config = require('../config');
const stripe = require('stripe')(config.stripe.key);

module.exports = {
  name: 'payments',
  paths: {
    '/payments': {
      get: (req, res) => {
        try {
          if (!req.user || !req.user.permissions.payments) {
            res.status(401);
            return res.end();
          }

          db.payments.find({}).exec((err, models) => {
            if (err) {
              res.status(500);
              return res.end();
            }

            return res.send(
              models.map(
                ({ email, amount, classLocation, chargeToken, charged }) => ({
                  email,
                  amount: `$${amount / 100}`,
                  class: classLocation,
                  stripeID: chargeToken,
                  date: charged
                })
              )
            );
          });
        } catch (e) {
          log.error(e);
          res.status(500);
          return res.end();
        }
      },
      post: (req, res) => {
        try {
          db.classes.classes
            .findOne({ _id: req.body.classID })
            .exec((err, classModel) => {
              if (err) {
                log.error(err);
                res.status(500);
                return res.end();
              }

              stripe.charges
                .create({
                  amount: req.body.amount,
                  currency: 'usd',
                  description: `Class registration for ${req.body.email}, ${
                    classModel.location
                  }`,
                  receipt_email: req.body.email,
                  source: req.body.token
                })
                .then(charge => {
                  const toSave = {
                    chargeToken: charge.id,
                    email: req.body.email,
                    amount: req.body.amount,
                    charged: new Date(),
                    classID: req.body.classID,
                    classLocation: classModel.location
                  };

                  const payment = new db.payments(toSave);

                  log.info('Saving payment:');
                  log.info(toSave);

                  payment.save(err => {
                    if (err) {
                      log.error('Error saving charge to database!');
                      log.error(err);
                    }

                    res.send();
                  });
                })
                .catch(err => {
                  log.error('Error creating charge with Stripe');
                  log.error(err);
                  res.status(500);
                  res.end();
                });
            });
        } catch (e) {
          log.error(e);
          res.status(500);
          res.end();
        }
      }
    }
  }
};
