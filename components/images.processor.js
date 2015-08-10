"use strict";
var log = require("bunyan").createLogger({ name: "image processor", level: "debug" });

process.on("message", function(msg) {
    var sharp = require("sharp");

    sharp(msg.inPath).rotate().resize(1024, 1024).max().toFile(msg.outPath, function(err) {
        log.debug("Image processed [%s]", msg.outPath);
        process.send({ path: msg.outPath, error: err });
    });
});
