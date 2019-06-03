/*eslint new-cap: 0, no-console: 0, no-shadow: 0, no-unused-vars: 0*/
/*eslint-env es6, node*/

"use strict";

module.exports = function (appContext) {
	var express = require("express");
	var xsenv = require("@sap/xsenv");

	var router = express.Router({
		strict: true
	});

	// Get UPS name from env var UPS_NAME
	var apimServiceName = process.env.UPS_NAME;
	var options = {};
	options = Object.assign(options, xsenv.getServices({
		apim: {
			name: apimServiceName
		}
	}));

	router.get("/", function (req, res, next) {
		if (req.originalUrl.slice(-1) === "/") {
			return next();
		}
		return res.type("application/json").status(200).send(JSON.stringify(options.apim.appConfig || {}));
	});

	return router;
};