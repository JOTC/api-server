const restify = require("restify");
const passport = require("passport");
const sessions = require("client-sessions");
const fs = require("fs");
const config = require("./config");
const log = require("bunyan").createLogger({ name: "main", level: "debug" });

const app = restify.createServer({ name: "JOTC Data API Server" });

app.use(function(req, res, next) {
	log.debug(`Got request: [${req.route.method}] ${req.url}`);
	next();
});
app.use(restify.queryParser());
app.use(sessions({
	cookieName: "session",
	secret: config.session.secret,
	duration: (86400000 * config.session.lifetimeInDays), // milliseconds
	activeDuration: (86400000 * config.session.lifetimeInDays) // milliseconds
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
	res.redirect = function(address) {
		res.header("Location", address);
		res.send(302);
	};
	next();
});
app.delete = app.del;

require("./auth")(passport);

app.post("/auth/local", restify.bodyParser({ mapParams: false }), passport.authenticate("custom-local"), function(req, res) { res.send(200); });

app.get("/auth/user", function(req, res, next) {
	let user = { };
	if(req.user) {
		user = JSON.parse(JSON.stringify(req.user));
	}
	delete user.local;

	res.send(user);
	next();
});

app.get("/auth/logout", function(req, res, next) {
	req.logout();
	req.session.destroy();
	res.send(200);
	next();
});

for(let file of fs.readdirSync("./components")) {
	const component = require("./components/" + file);
	if(!component.paths) {
		continue;
	}

	for(let path of Object.keys(component.paths)) {
		for(let verb of Object.keys(component.paths[path])) {
			var handler = component.paths[path][verb];
			if(typeof(handler) === "function") {
				app[verb.toLowerCase()](path, restify.bodyParser({ mapParams: false }), handler);
				log.info(`${verb.toUpperCase()}\t${path}`);
			} else if(handler.options && handler.function) {
				var middleware = [ ];
				if(handler.options.useBodyParser) {
					middleware.push(restify.bodyParser({ mapParams: false }));
				}

				app[verb.toLowerCase()](path, middleware, handler.function);
				log.info(`${verb.toUpperCase()}\t${path}`);
			}
		}
	}
};

app.listen(config.port, function() {
	log.info(`${app.name} ready at ${app.url}`);
	require("./model/db.js");
});

process.on("SIGINT", function() {
  process.exit();
});
