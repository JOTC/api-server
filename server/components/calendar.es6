const db = require("../model/db");
const fn = require("../common-fn");
const log = require("bunyan").createLogger({ name: "calendar component", level: "debug" });
const restify = require("restify");

function isValidCalendarEvent(event) {
	let valid = false;
	if(event) {
		valid = true;
		valid = valid && (event.title && typeof event.title === "string");
		valid = valid && (event.startDate && typeof event.startDate === "string");
		valid = valid && (!isNaN(Date.parse(event.startDate)));

		if(event.endDate) {
			valid = valid && (typeof event.endDate === "string");
			valid = valid && (!isNaN(Date.parse(event.endDate)));
		} else {
			event.endDate = event.startDate;
		}
	}

	return valid;
};

module.exports = {
	name: "calendar",
	paths: {
		"/calendar": {
			"get": function(req, res, next) {
				db.calendar.find({ endDate: { "$gte": new Date() } }).exec(function(err, events) {
					if(err) {
						log.error(err);
						res.send(new restify.InternalServerError());
					} else {
						res.send(200, events);
					}
				});

				next();
			},
			"post": fn.getModelCreator(db.calendar, "calendar", log, isValidCalendarEvent)
		},
		"/calendar/:eventID": {
			"put": fn.getModelUpdater(db.calendar, "eventID", "calendar", log, isValidCalendarEvent),
			"delete": fn.getModelDeleter(db.calendar, "eventID", "calendar", log)
		}
	}
};
