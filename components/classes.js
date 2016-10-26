const restify = require("restify");
const fs = require("fs-extra");
const db = require("../model/db");
const fn = require("../common-fn");
const log = require("bunyan").createLogger({ name: "classes component", level: "debug" });
const config = require("../config");
const path = require("path");

const __WWW_PATH = "/files/classes";
const __FILE_PATH = config.www.getPath(__WWW_PATH);

function getFutureClasses(callback) {
	let midnightToday = Date.now();
	midnightToday = new Date(midnightToday - (midnightToday % 86400000));
	db.classes.classes.find({ endDate: { $gte: midnightToday }}).sort({ startDate: "asc" }).exec(callback);
};

function isValidClass(clss) {
	let valid = false;

	if(clss) {
		valid = true;
		valid = valid && (clss.location && typeof clss.location === "string");
		valid = valid && (clss.startDate && typeof clss.startDate === "string");
		valid = valid && (!isNaN(Date.parse(clss.startDate)));
		valid = valid && !isNaN(clss.numberOfWeeks);
		valid = valid && !isNaN(clss.hoursPerWeek);
		valid = valid && (clss.classTypes && Array.isArray(clss.classTypes));

		if(valid) {
			valid = valid && (clss.classTypes.length > 0);

			for(let classType of clss.classTypes) {
				valid = valid && (classType._id && typeof classType._id === "string");
				valid = valid && (classType.name && typeof classType.name === "string");
				valid = valid && (classType.description && typeof classType.description === "string");
				valid = valid && (typeof classType.isAdvanced === "boolean");
			};
		}
	}

	return valid;
};

function getRegistrationFormFilename(clss) {
	return "JOTC_Class_Registration.pdf";
};

module.exports = {
	name: "classes",
	paths: {
		"/classes": {
			"get": function(req, res, next) {
				getFutureClasses(function(error, classes) {
					if(error) {
						log.error(error);
						res.send(new restify.InternalServerError());
					} else {
						res.send(classes);
					}
				});
				next();
			},
			"post": fn.getModelCreator(db.classes.classes, "classes", log, isValidClass, function(obj) {
				obj.endDate = new Date(obj.startDate.getTime() + ((obj.numberOfWeeks - 1) * 604800000));
			})
		},
		"/classes/:classID": {
			"put": fn.getModelUpdater(db.classes.classes, "classID", "classes", log, isValidClass, function(obj) {
				obj.startDate = new Date(obj.startDate);

				// Subtract one because otherwise a 1-week class would end
				// a week after the first day of class, which is wrong.
				obj.endDate = new Date(obj.startDate.getTime() + ((obj.numberOfWeeks - 1) * 604800000));
			}),
			"delete": fn.getModelDeleter(db.classes.classes, "classID", "classes", log, function(obj) {
				if(fs.existsSync(path.join(__FILE_PATH, obj._id.toString()))) {
					if(obj.registrationFormPath) {
						fs.unlinkSync(path.join(__FILE_PATH, obj._id.toString(), getRegistrationFormFilename(obj)));
					}
					fs.rmdir(path.join(__FILE_PATH, obj._id.toString()));
				}
			})
		},
		"/classes/:classID/registrationForm": {
			"post": function(req, res, next) {
				if(!req.user || !req.user.permissions.classes) {
					return next(new restify.UnauthorizedError());
				}

				const handleError = function(err) {
					log.error(err);
					res.send(new restify.InternalServerError());
					require("fs").unlinkSync(req.files.file.path);
				};

				if(!/[0-9a-zA-Z]{24}/.test(req.params.classID)) {
					return next(new restify.BadRequestError());
				}

				db.classes.classes.findOne({ _id: req.params.classID }).exec(function(err, clss) {
					if(err) {
						handleError(err);
						next();
					} else if(clss) {
						const filename = getRegistrationFormFilename(clss);
						fs.move(req.files.file.path, path.join(__FILE_PATH, req.params.classID, filename), { mkdirp: true }, function(err) {
							if(err) {
								handleError(err);
								next();
							} else {
								clss.registrationFormPath = path.join(__WWW_PATH, req.params.classID, filename);
								clss.save(function(err) {
									if(err) {
										handleError(err);
										require("fs").unlinkSync(path.join(__FILE_PATH, req.params.classID, filename));
									} else {
										res.send(200, clss);
									}
									next();
								});
							}
						});
					} else {
						res.send(new restify.NotFoundError());
						if(req.files && req.files.file && req.files.file.path) {
							require("fs").unlinkSync(req.files.file.path);
						}
						next();
					}
				});
			},
			"delete": function(req, res, next) {
				if(!req.user || !req.user.permissions.classes) {
					return next(new restify.UnauthorizedError());
				}

				if(!/[0-9a-zA-Z]{24}/.test(req.params.classID)) {
					return next(new restify.BadRequestError());
				}

				db.classes.classes.findOne({ _id: req.params.classID }).exec(function(err, clss) {
					if(err) {
						log.error(err);
						res.send(new restify.InternalServerError());
					} else if(clss) {
						fs.unlink(path.join(__FILE_PATH, req.params.classID, getRegistrationFormFilename(clss)), function(err) {
							if(err) {
								log.error(err);
								res.send(new restify.InternalServerError());
							} else {
								clss.registrationFormPath = "";
								clss.save(function(err) {
									if(err) {
										log.error(err);
										res.send(new restify.InternalServerError());
									} else {
										res.send(200, { });
									}
								});
							}
						});
					} else {
						res.send(new restify.NotFoundError());
					}
				});

				next();
			}
		},
		"/classes/types/": {
			"get": function(req, res, next) {
				db.classes.classTypes.find({}).sort({ priorityOrder: "asc" }).exec(function(err, classTypes) {
					if(err) {
						log.error(err);
						res.send(new restify.InternalServerError());
					} else {
						res.send(classTypes);
					}
				});

				next();
			}
		}
	}
};
