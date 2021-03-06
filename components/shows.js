const restify = require("restify");
const fs = require("fs-extra");
const db = require("../model/db");
const dates = require("../dateHelper");
const fn = require("../common-fn");
const log = require("bunyan").createLogger({ name: "shows component", level: "debug" });
const config = require("../config");
const path = require("path");

function isValidShow(show) {
	let valid = false;
	if(show) {
		valid = true;
		valid = valid && (show.title && typeof show.title === "string");
		valid = valid && (show.location && typeof show.location === "string");
		valid = valid && (show.startDate && typeof show.startDate === "string");
		valid = valid && (show.endDate && typeof show.endDate === "string");
		valid = valid && (show.registrationDeadline && typeof show.registrationDeadline === "string");
		valid = valid && (show.classes && Array.isArray(show.classes));
	}

	if(valid) {
		valid = valid && !isNaN(Date.parse(show.startDate));
		valid = valid && !isNaN(Date.parse(show.endDate));
		valid = valid && !isNaN(Date.parse(show.registrationDeadline));
	}

	if(valid) {
		for(let c of show.classes) {
			valid = valid && (c && typeof c === "string");
		};
	}

	return valid;
};

function isValidRecurringShow(show) {
	let valid = false;
	if(show) {
		valid = true;
		valid = valid && (show.description && typeof show.description === "string");
		valid = valid && (show.categories && Array.isArray(show.categories));

		if(valid) {
			for(let category of show.categories) {
				valid = valid && (category.name && typeof category.name === "string");
				valid = valid && (category.classes && Array.isArray(category.classes));

				if(valid) {
					for(let c of category.classes) {
						valid = valid && (c && typeof c === "string");
					};
				}
			};
		}
	}

	return valid;
};

function moveRecurringShow(showID, direction, res) {
	if(+direction > 0) {
		direction = 1;
	} else {
		direction = -1;
	}

	if(!/[0-9a-zA-Z]{24}/.test(showID)) {
		res.send(new restify.BadRequestError());
		return;
	}

	db.shows.recurring.findOne({ _id: showID }).exec(function(err, show) {
		if(err) {
			log.error(err);
			res.send(new restify.InternalServerError());
			return;
		}

		if(!show) {
			res.send(new restify.NotFoundError());
			return;
		}

		db.shows.recurring.findOne({ ordering: (show.ordering + direction) }).exec(function(err, swapShow) {
			if(err) {
				log.error(err);
				res.send(new restify.InternalServerError());
				return;
			}

			if(swapShow) {
				show.ordering += direction;
				swapShow.ordering -= direction;

				show.save();
				swapShow.save();
			}

			res.send(200, { });
		});
	});
};

// __WWW_PATH is the relative path to this file
// from the website
const __WWW_PATH = "/files/shows";

// __FILE_PATH is the relative path to the file
// from the server's working director
const __FILE_PATH = config.www.getPath(__WWW_PATH);

function getObjectsInOrder(model, sortBy, callback) {
	const sort = { };
	sort[sortBy] = "asc";

	model.find({}).sort(sort).exec().then(callback);
};

function getFileUploadHandler() {
	return function(req, res, next) {
		if(!req.user || !req.user.permissions.shows) {
			return next(new restify.UnauthorizedError());
		}

		const handleError = function(err, ex) {
			if(!ex) {
				ex = new restify.InternalServerError();
			}

			log.error(err);
			res.send(ex);

			require("fs").unlinkSync(req.files.file.path);
		};

		if(!/[0-9a-zA-Z]{24}/.test(req.params.showID)) {
			handleError("Invalid show ID", new restify.BadRequestError());
			return;
		}
		if(typeof req.params.name !== "string") {
			handleError("Invalid document name", new restify.BadRequestError());
			return;
		}

		db.shows.shows.findOne({ _id: req.params.showID }).exec(function(err, show) {
			if(err) {
				handleError(err);
				next();
			} else if(show) {
				const filename = show.title + " File " + Date.now() + ".pdf";

				fs.mkdirp(path.join(__FILE_PATH, req.params.showID), () => {
					req.once("end", err => {
						log.info("Finished piping from the request");
						if(err) {
							handleError(err);
							next();
						} else {
							var wwwPath = path.join(__WWW_PATH, req.params.showID, filename);
							show.files.push({ name: req.params.name, path: wwwPath });
							show.save(function(err) {
								if(err) {
									handleError(err);
									fs.unlinkSync(path.join(__FILE_PATH, req.params.showID, filename));
								} else {
									res.send(200, show);
								}
								next();
							});
						}
					});

					const ws = fs.createWriteStream(path.join(__FILE_PATH, req.params.showID, filename));
					req.pipe(ws);
				});
			} else {
				handleError("Show ID [" + req.params.showID + "] not found", new restify.NotFoundError());
				next();
			}
		});
	};
};

function getFileDeleteHandler() {
	return function(req, res, next) {
		if(!req.user || !req.user.permissions.shows) {
			return next(new restify.UnauthorizedError());
		}

		if(!/[0-9a-zA-Z]{24}/.test(req.params.showID) || !/[0-9a-zA-Z]{24}/.test(req.params.fileID)) {
			return next(new restify.BadRequestError());
		}

		db.shows.shows.findOne({ _id: req.params.showID }).exec(function(err, show) {
			if(err) {
				log.error(err);
				res.send(new restify.InternalServerError());
			} else if(show) {

				let filename = "";

				const files = show.files.filter(file => file._id.toString() === req.params.fileID);
				if(files.length > 0) {
					filename = files[0].path;
				}

				if(!filename) {
					res.send(new restify.NotFoundError());
					return;
				}

				fs.unlink(path.join(__FILE_PATH, show._id.toString(), path.basename(filename)), function(err) {
					if(err) {
						log.error(err);
						res.send(new restify.InternalServerError());
					} else {

						show.files = show.files.filter(function(file) {
							return (file._id.toString() !== req.params.fileID);
						});

						show.save(function(err) {
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
	};
};

module.exports = {
	name: "shows",
	paths: {
		"/shows": {
			"get": function(req, res, next) {
				getObjectsInOrder(db.shows.shows, "startDate", function(objs, err) {
					if(err) {
						log.error(err);
						res.send(500);
					} else {
						const shows = {
							upcoming: [ ],
							past: [ ]
						};

						const now = new Date();
						objs.forEach(function(show) {
							if(show.startDate > now || show.endDate > now) {
								shows.upcoming.push(show);
							} else {
								shows.past.push(show);
							}
						});
						res.send(shows);
					}
				});
				next();
			},
			"post": fn.getModelCreator(db.shows.shows, "shows", log, isValidShow, function(obj) {
				obj.dateRange = dates.stringDateRange(obj.startDate, obj.endDate);
			})
		},
		"/shows/:showID":
		{
			"put": fn.getModelUpdater(db.shows.shows, "showID", "shows", log, isValidShow, function(obj) {
				obj.dateRange = dates.stringDateRange(new Date(obj.startDate), new Date(obj.endDate));
			}),
			"delete": fn.getModelDeleter(db.shows.shows, "showID", "shows", log, function(show) {
				if(show.files) {
					show.files.forEach(function(file) {
						fs.unlinkSync(path.join(__FILE_PATH, show._id.toString(), path.basename(file.path)));
					});
				}
				if(fs.existsSync(path.join(__FILE_PATH, show._id.toString()))) {
					fs.rmdirSync(path.join(__FILE_PATH, show._id.toString()));
				}
			})
		},
		"/shows/:showID/file": {
			"post": {
				options: {
					useBodyParser: false
				},
				function: getFileUploadHandler()
			}
		},
		"/shows/:showID/file/:fileID": {
			"delete": getFileDeleteHandler()
		},
		"/shows/recurring": {
			"post": fn.getModelCreator(db.shows.recurring, "shows", log, isValidRecurringShow, function(obj) {
				db.shows.recurring.find({}).sort({ ordering: "desc" }).exec(function(err, shows) {
					if(shows && shows.length > 0) {
						obj.ordering = shows[0].ordering + 1;
					} else {
						obj.ordering = 1;
					}
					obj.save();
				});
			}),
			"get": fn.getModelLister(db.shows.recurring, log, "ordering")
		},
		"/shows/recurring/:showID": {
			"put": fn.getModelUpdater(db.shows.recurring, "showID", "shows", log, isValidRecurringShow),
			"delete": fn.getModelDeleter(db.shows.recurring, "showID", "shows", log)
		},
		"/shows/recurring/:showID/up": {
			"put": function(req, res, next) {
				if(!req.user || !req.user.permissions.shows) {
					return next(new restify.UnauthorizedError());
				}

				moveRecurringShow(req.params.showID, -1, res);
				next();
			}
		},
		"/shows/recurring/:showID/down": {
			"put": function(req, res, next) {
				if(!req.user || !req.user.permissions.shows) {
					return next(new restify.UnauthorizedError());
				}

				moveRecurringShow(req.params.showID, 1, res);
				next();
			}
		}
	}
};
