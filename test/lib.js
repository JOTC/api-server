/*eslint no-unused-expressions:0 */
"use strict";

var DBUsers = require("../model/db").users;
var request = require("request");
var crypto = require("crypto");
var bcrypt = require("bcryptjs");
require("should");

request.delete = request.del;

var _users = {
	withoutPermission: {
		db: null,
		email: "em@il.com",
		username: "test1",
		password: crypto.createHash("sha256").update("test-password-1").digest("hex").toString(16),
		cookie: ""
	},
	withPermission: {
		db: null,
		email: "em@il.com",
		username: "test2",
		password: crypto.createHash("sha256").update("test-password-2").digest("hex"),
		cookie: ""
	}
};

var baseURL = "http://127.0.0.1:9931";

function getCookie(withPermission) {
	return function() {
		return _users[withPermission ? "withPermission" : "withoutPermission"].cookie;
	};
}

function getAUserEmail() {
	return _users.withoutPermission.email;
}

function statusAndJSON(verb, url, cookieFn, body, expectedStatus, after) {
	return function() {
		var _response;
		var _body;

		before(function(done) {
			if(typeof url === "function") {
				url = url();
			}

			var urlOptions = { url: baseURL + url, json: true };
			if(body && typeof body === "object") {
				urlOptions.body = body;
			}

			if(typeof cookieFn === "function") {
				urlOptions.headers = { Cookie: cookieFn() };
			}

			request[verb](urlOptions, function(_, res, responseBody) {
				_response = res;
				_body = responseBody;
				done();
			});
		});

		it("should return a " + expectedStatus + " status code", function() {
			_response.statusCode.should.be.exactly(expectedStatus);
		});

		it("should return a JSON content-type", function() {
			_response.headers["content-type"].toLowerCase().should.be.exactly("application/json");
		});

		if(typeof after === "function") {
			after(function() { return _response; }, function() { return _body; });
		}
	};
}

var hasInitialized = false;

module.exports = {
	getCookie: getCookie,
	statusAndJSON: statusAndJSON,
	init: function() {
		if(!hasInitialized) {
			hasInitialized = true;

			before(function(done) {
				_users.withoutPermission.db = new DBUsers({ name: "Test User 1", email: _users.withoutPermission.email, local: { username: _users.withoutPermission.username, secret: bcrypt.hashSync(_users.withoutPermission.password) }, permissions: { "links": false, "officers": false, "shows": false, "classes": false, "pictures": false, "calendar": false, "users": false }});
				_users.withPermission.db = new DBUsers({ name: "Test User 2", email: _users.withoutPermission.email, local: { username: _users.withPermission.username, secret: bcrypt.hashSync(_users.withPermission.password) }, permissions: { "links": true, "officers": true, "shows": true, "classes": true, "pictures": true, "calendar": true, "users": true }});

				_users.withoutPermission.db.save(function() {
					_users.withPermission.db.save(done);
				});
			});

			before(function(done) {
				request.post("http://127.0.0.1:9931/auth/local", { form: { username: _users.withoutPermission.username, password: _users.withoutPermission.password }}, function(_, response) {
					var cookie = response.headers["set-cookie"][0];
					_users.withoutPermission.cookie = cookie.substr(0, cookie.indexOf(";"));
					done();
				});
			});

			before(function(done) {
				request.post("http://127.0.0.1:9931/auth/local", { form: { username: _users.withPermission.username, password: _users.withPermission.password }}, function(_, response) {
					var cookie = response.headers["set-cookie"][0];
					_users.withPermission.cookie = cookie.substr(0, cookie.indexOf(";"));
					done();
				});
			});

			after(function(done) {
				_users.withoutPermission.db.remove(function() {
					_users.withPermission.db.remove(done);
				});
			});
		}
	},
	getFullURL: function(path) {
		return baseURL + path;
	},
	getEmail: getAUserEmail
};
