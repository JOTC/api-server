const restify = require("restify");
const db = require("../model/db");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const log = require("bunyan").createLogger({ name: "image component", level: "debug" });
const fn = require("../common-fn");
const config = require("../config");

const ImageProcessor = require("./images.processor")();

const __FILE_PATH = config.www.getPath("galleryImages");

function isValidGallery(gallery) {
	let valid = false;
	if(gallery) {
		valid = true;
		valid = valid && (gallery.name && typeof gallery.name === "string");
	}

	return valid;
};

function validatePermissionsAndParameters(req, res, params) {
	if(!req.user || !req.user.permissions.pictures) {
		res.send(new restify.UnauthorizedError());
		return false;
	}
	
	return params.every(function(param) {
		if(/[0-9a-zA-Z]{24}/.test(req.params[param])) {
			 return true;
		}
		res.send(new restify.BadRequestError());
		return false;
	});
};

module.exports = {
	name: "images",
	paths: {
		"/galleries": {
			"get": fn.getModelLister(db.images.galleries, log),
			"post": fn.getModelCreator(db.images.galleries, "pictures", log, isValidGallery)
		},
		"/galleries/:galleryID": {
			"put": fn.getModelUpdater(db.images.galleries, "galleryID", "pictures", log, isValidGallery),
			"delete": fn.getModelDeleter(db.images.galleries, "galleryID", "pictures", log, function(gallery) {
				for(let image of gallery.images) {
					fs.unlinkSync(path.join(__FILE_PATH, gallery.image.path));
				}
			})
		},
		"/galleries/:galleryID/image": {
			"post": {
				options: {
					useBodyParser: false
				},
				function: function(req, res, next) {
					if(!validatePermissionsAndParameters(req, res, [ "galleryID" ])) {
						return next();
					}

					db.images.galleries.findOne({ _id: req.params.galleryID }).exec(function(err, gallery) {
						if(err) {
							log.error(err);
							return next(new restify.InternalServerError());
						}
						
						if(!gallery) {
							return next(new restify.NotFoundError());
						}

						const img = new db.images.images();

						const ext = req.headers["content-type"].replace(/image\//, "");
						img.path = img._id + "." + ext;

						let filePath = path.join(__FILE_PATH, "temp");
						if(!fs.existsSync(filePath)) {
							mkdirp.sync(filePath);
						}
						filePath = path.join(filePath, img.path);
						const out = fs.createWriteStream(filePath);
						req.pipe(out);

						req.once("end", function() {
							if(err) {
								log.error(err);
								res.send(new restify.InternalServerError());
							} else {
								ImageProcessor.process(filePath, path.join(__FILE_PATH, img.path), function(err) {
									fs.unlink(filePath);

									if(err) {
										log.error(err);
										res.send(new restify.InternalServerError());
									} else {
										gallery.images.push(img);
										gallery.save(function(err) {
											if(err) {
												log.error(err);
												res.send(new restify.InternalServerError());
											} else {
												res.send(200, img);
											}
										});
									}
								});
							}
						});

						next();
					});
				}
			}
		},
		"/galleries/:galleryID/image/:imageID": {
			"put": function(req, res, next) {
				if(!validatePermissionsAndParameters(req, res, [ "galleryID", "imageID" ])) {
					return next();
				}

				let image = req.body;
				if(image && typeof image === "object" && typeof image.description === "string") {
					image = { description: image.description };

					db.images.galleries.findOne({ _id: req.params.galleryID }).exec(function(err, gallery) {
						if(err) {
							log.error(err);
							res.send(new restify.InternalServerError());
							return;
						}
						
						if(!gallery) {
							res.send(new restify.NotFoundError());
							return;
						}

						let foundImage = false;
						for(let galleryImage of gallery.images) {
							if(galleryImage._id.toString() === req.params.imageID) {
								galleryImage.name = image.name;
								galleryImage.description = image.description;
								foundImage = true;
								break;
							}
						}
						
						if(!foundImage) {
							res.send(new restify.NotFoundError());
							return;
						}

						gallery.save(function(err) {
							if(err) {
								log.error(err);
								res.send(new restify.InternalServerError());
							} else {
								res.send(200, { });
							}
						});
					});
				} else {
					log.error("Invalid image object");
					log.error(image);
					res.send(new restify.BadRequestError());
				}
				next();
			},
			"delete": function(req, res, next) {
				if(!validatePermissionsAndParameters(req, res, [ "galleryID", "imageID" ])) {
					return next();
				}

				db.images.galleries.findOne({ _id: req.params.galleryID }).exec(function(err, gallery) {
					if(err) {
						log.error(err);
						res.send(new restify.InternalServerError());
						return;
					}
					
					if(!gallery) {
						res.send(new restify.NotFoundError());
						return;
					}

					let imageFound = false;
					for(let i = 0; i < gallery.images.length; i++) {
						if(gallery.images[i]._id.toString() === req.params.imageID) {
							fs.unlinkSync(path.join(__FILE_PATH, gallery.images[i].path));
							gallery.images.splice(i, 1);
							imageFound = true;
							break;
						}
					}
					if(!imageFound) {
						res.send(new restify.NotFoundError());
						return;
					}

					gallery.save(function(err) {
						if(err) {
							log.error(err);
							res.send(new restify.InternalServerError());
						} else {
							res.send(200, { });
						}
					});
				});
				next();
			}
		}
	}
};
