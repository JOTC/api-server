const mongoose = require('mongoose');

const classTypesSchema = mongoose.Schema({
  name: String,
  description: String,
  prerequisite: String,
  isAdvanced: Boolean,
  priorityOrder: Number
});

const classSchema = mongoose.Schema({
  startDate: Date,
  endDate: Date,
  numberOfWeeks: { type: Number, default: 6 },
  hoursPerWeek: { type: Number, default: 1 },
  timeOfDay: String,
  location: String,
  classTypes: [classTypesSchema],
  registrationLink: String,
  registrationFormPath: String
});

module.exports = {
  classTypes: mongoose.model('classTypes', classTypesSchema),
  classes: mongoose.model('classes', classSchema)
};
