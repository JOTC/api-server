const mongoose = require("mongoose");

const linkSchema = mongoose.Schema({
	name: String,
	url: String
});

const groupSchema = mongoose.Schema({
	name: String,
	ordering: Number,
	links: [ linkSchema ]
});

module.exports = mongoose.model("linkGroups", groupSchema);