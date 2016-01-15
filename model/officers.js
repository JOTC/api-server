const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
	type: String,
	value: String
});

const officerSchema = mongoose.Schema({
	name: String,
	titles: [ String ],
	contacts: [ contactSchema ],
	ordering: Number
});

module.exports = mongoose.model("officers", officerSchema);