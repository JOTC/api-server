const mongoose = require("mongoose");

const fileSchema = mongoose.Schema({
	filename: String,
	mime: String,
	size: String
});

module.exports = mongoose.model("files", fileSchema);