const mongoose = require("mongoose");

const showSchema = mongoose.Schema({
	startDate: Date,
	endDate: Date,
	dateRange: String,
	registrationDeadline: Date,
	title: String,
	location: String,
	description: String,
	registrationLink: String,
	classes: [ String ],
	files: [ { name: String, path: String } ],
	resultsPath: String
});

const recurringShowSchema = mongoose.Schema({
	description: String,
	ordering: Number,
	categories: [{
		name: String,
		classes: [ String ]
	}]
});

module.exports = {
	shows: mongoose.model("shows", showSchema),
	recurring: mongoose.model("recurringShows", recurringShowSchema)
};