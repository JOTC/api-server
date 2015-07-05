/*eslint no-unused-expressions:0 */
"use strict";

var DBUsers = require("../model/db").users;
var request = require("request");
var crypto = require("crypto");
var bcrypt = require("bcryptjs");
require("should");

var _user = {
	db: null,
	username: "test",
	password: crypto.createHash("sha256").update("test-password").digest("hex"),
	cookie: ""
};

before(function(done) {
	var pwHash = bcrypt.hashSync(_user.password);
	_user.db = new DBUsers({ name: "Test User 1", email: "em@il.com", local: { username: _user.username, secret: pwHash }, permissions: { "links": false, "officers": false, "shows": false, "classes": false, "pictures": false, "calendar": false, "users": false }});
	_user.db.save(done);
});

after(function(done) {
	_user.db.remove(done);
});

describe("Local Authentication API", function() {
    describe("Fake user", function() {
        var _response;

        before(function(done) {
            request.post("http://127.0.0.1:9931/auth/local", { form: { username: "fake", password: "fake" }}, function(_, response) {
                _response = response;
                done();
            });
        });

        it("returns a 401 status code", function() {
            _response.statusCode.should.be.exactly(401);
        });
    });

    describe("Real user, fake password", function() {
        var _response;

        before(function(done) {
            request.post("http://127.0.0.1:9931/auth/local", { form: { username: _user.username, password: "fake" }}, function(_, response) {
                _response = response;
                done();
            });
        });

        it("returns a 401 status code", function() {
            _response.statusCode.should.be.exactly(401);
        });
    });

    describe("Real user, real password", function() {
        var _response;

        before(function(done) {
            request.post("http://127.0.0.1:9931/auth/local", { form: { username: _user.username, password: _user.password }}, function(_, response) {
                _response = response;
                done();
            });
        });

        it("returns a 200 status code", function() {
            _response.statusCode.should.be.exactly(200);
        });

        it("sets a session ID cookie", function() {
            var cookie = _response.headers["set-cookie"].toString();
            cookie = cookie.substr(0, cookie.indexOf(";"));
            cookie.should.match(/session=[a-zA-Z0-9.-_]+/);
        });
    });
});
