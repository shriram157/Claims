/*eslint new-cap: 0, no-console: 0, no-shadow: 0, no-unused-vars: 0*/
/*eslint-env es6, node*/

"use strict";

var express = require('express');
var request = require('request');
var xsenv = require("@sap/xsenv");

var app = express();

// Use the session middleware

// vehicle Locator Node Module. 
module.exports = function (appContext) {
	var app = express.Router();

	// SAP Calls Start from here
	var options = {};
	options = Object.assign(options, xsenv.getServices({
		api: {
			name: "CLAIM_SYSTEM_PROCESSING_CUPS"
		}
	}));

	var uname = options.api.user,
		pwd = options.api.password,
		url = options.api.host,
		APIKey = options.api.APIKey,
		client = options.api.client;

	console.log('The API Management URL', url);

	var auth64 = 'Basic ' + new Buffer(uname + ':' + pwd).toString('base64');

	var reqHeader = {
		"Authorization": auth64,
		"Content-Type": "application/json",
		"APIKey": APIKey
			/*,
					"x-csrf-token": "Fetch"*/
	};

	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");

		next();
	});

	var csrfToken;

	app.all('/*', function (req, res, next) {

		let headOptions = {};

		headOptions.Authorization = auth64;

		let method = req.method;
		let xurl = url + req.url;
		console.log('Method', method);
		console.log('Incoming Url', xurl);
		//console.log('csrfToken before GET&POST', csrfToken);

		// console.log(req.headers.cookie);
		//  delete (req.headers.cookie);
		//   console.log(req.headers.cookie);

		if (method == 'GET') {

			var reqHeader = {
				"Authorization": auth64,
				"Content-Type": "application/json",
				"APIKey": APIKey
					/*,
									"x-csrf-token": "Fetch"*/
			};

		}

		//  the backeend request is only taking PUT, not post
		//if (method == 'POST') {
		//	method = 'PUT';
		//}

		if (method == 'POST' || method == 'DELETE' || method == 'PUT' || method == 'HEAD') {
			reqHeader = {
				"Authorization": auth64,
				"Content-Type": "application/json",
				"APIKey": APIKey
					/*,
									"x-csrf-token": csrfToken*/
			};
			//console.log('csrfToken for POST', csrfToken);
		}

		// Pass through x-csrf-token from request to proxied request to S4/HANA
		// This requires manual handling of CSRF tokens from the front-end
		// Note: req.get() will get header in a case-insensitive manner 
		var csrfTokenHeaderValue = req.get("X-Csrf-Token");
		reqHeader["X-Csrf-Token"] = csrfTokenHeaderValue;

		console.log('headerData', reqHeader);

		let xRequest =
			request({
				method: method,
				url: xurl,
				headers: reqHeader
			});

		req.pipe(xRequest);

		xRequest.on('response', (response) => {

			delete(response.headers.cookie);

			if (response.headers['x-csrf-token']) {
				if (response.headers['x-csrf-token'] !== 'Required') {
					csrfToken = response.headers['x-csrf-token'];
					console.log("csrfToken received from SAP");
				} else {
					console.log("Csrf is received as Required.");
				}

			}
			console.log("csrfToken NOT received for", method);

			if (method == 'GET' && !(response.headers['x-csrf-token'])) {
				csrfToken = csrfToken; //self assign this to retain the value. 
				console.log("The earlier call returned blank CSRF and so we are reusing this one", csrfToken);
			}

			console.log('Response from sap Received Success and if csrf available it will be here & Csrf Token', method, csrfToken);

			xRequest.pipe(res);

		}).on('error', (error) => {
			next(error);

			console.log("This is inside error");
		});

	});

	return app;
};