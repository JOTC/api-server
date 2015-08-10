const db = require("../model/db");
const log = require("bunyan").createLogger({ name: "officers component", level: "debug" });
const fn = require("../common-fn");

function isValidOfficer(officer) {
	let valid = false;
	if(officer) {
		valid = true;
		valid = valid && (officer.name && typeof officer.name === "string");
		valid = valid && (officer.titles && Array.isArray(officer.titles));
		valid = valid && (officer.contacts && Array.isArray(officer.contacts));

		if(valid) {
			for(let title of officer.titles) {
				valid = valid && (title && typeof title === "string");
			};
		}

		if(valid) {
			for(let contact of officer.contacts) {
				valid = valid && (contact.type && (contact.type === "email" || contact.type === "phone"));
				valid = valid && (contact.value && typeof contact.value === "string");
			};
		}
	}

	return valid;
};

module.exports = {
	name: "officers",
	paths: {
		"/officers": {
			"get": fn.getModelLister(db.officers, log),
			"post": fn.getModelCreator(db.officers, "officers", log, isValidOfficer, function(officer, done) {
				db.officers.find({}, function(err, officers) {
					officer.ordering = officers.length + 1;
					done();
				});
			})
		},
		"/officers/:officerID": {
			"put": fn.getModelUpdater(db.officers, "officerID", "officers", log, isValidOfficer),
			"delete": fn.getModelDeleter(db.officers, "officerID", "officers", log)
		}
	}
};
