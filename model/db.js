const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(process.env["MONGO_URL"] || "mongodb://localhost/jotc");

module.exports = {
	calendar: require("./calendar"),
	classes: require("./classes"),
	files: require("./files"),
	shows: require("./shows"),
	images: require("./images"),
	officers: require("./officers"),
	users: require("./users"),
	linkGroups: require("./links")
};

const initializedModels = {
	"./initial/classTypes": module.exports.classes.classTypes,
	"./initial/links": module.exports.linkGroups,
	"./initial/recurringShows": module.exports.shows.recurring
};

function getInserter(DBModel, module) {
	return function(objs) {
		if(objs.length === 0) {
			for(let obj of require(module)) {
				let modelObj = new DBModel(obj);
				modelObj.save();
			};
		}
	};
};

for(let mod of Object.keys(initializedModels)) {
	initializedModels[mod].find({}).exec().then(getInserter(initializedModels[mod], mod));
}
