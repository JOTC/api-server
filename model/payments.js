const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
  chargeToken: String,
  email: String,
  amount: Number,
  charged: Date,
  classID: String,
  classLocation: String
});

module.exports = mongoose.model('payments', paymentSchema);
