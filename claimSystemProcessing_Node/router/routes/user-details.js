/*eslint new-cap: 0, no-console: 0, no-shadow: 0, no-unused-vars: 0*/
/*eslint-env es6, node*/

"use strict";

module.exports = function (appContext) {
	var express = require('express');
	var request = require('request');
	var xsenv = require("@sap/xsenv");

	var auth64;

	var uaaService = xsenv.getServices({
		uaa: {
			tag: "xsuaa"
		}
	});
	var uaa = uaaService.uaa;

	var app = express();

	//	var app = express.Router();
  
	// Get UPS name from env var UPS_NAME
	var apimServiceName = process.env.UPS_NAME;
	var options = {};
	options = Object.assign(options, xsenv.getServices({
		api: {
			name: apimServiceName
		}
	}));

	var uname = options.api.user,
		pwd = options.api.password,
		url = options.api.host,
		APIKey = options.api.APIKey,
		client = options.api.client;

	auth64 = 'Basic ' + new Buffer(uname + ':' + pwd).toString('base64');

	var reqHeader = {
		"Authorization": auth64,
		"Content-Type": "application/json",
		"APIKey": APIKey,
		"x-csrf-token": "Fetch"
	};

	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	//Security Attributes received via UserAttributes via Passport
	app.get("/attributes", (req, res) => {
		var logger = req.loggingContext.getLogger("/Application/Route/UserDetails/Attributes");
		var tracer = req.loggingContext.getTracer(__filename);

		logger.info("attributes fetch started");
		//	res.type("application/json").status(200).send(JSON.stringify(req.authInfo.userAttributes));
		var receivedData = {};

		var sendToUi = {
			"attributes": [],
			"samlAttributes": [],
			legacyDealer: "",
			legacyDealerName: ""
		};

		// =====================================================================================

		logger.info("user Attributes: %s", req.authInfo.userAttributes);

		//	console.log(req.authInfo.userAttributes);
		var parsedData = JSON.stringify(req.authInfo.userAttributes);
		//	console.log('After Json Stringify', parsedData);

		logger.info("After Json Stringify: %s", parsedData);
		var obj = JSON.stringify(req.authInfo.userAttributes);
		var obj_parsed = JSON.parse(obj);

		var csrfToken;
		var samlData = parsedData;

		var obj_data = JSON.parse(parsedData);
		logger.info("saml data: %s", samlData);
		logger.info("send to ui data: %s", sendToUi);
		let checkSAMLDetails;
		try {
			checkSAMLDetails = obj_data.DealerCode[0];
		} catch (e) {
			logger.info("No SAML Authentication happened Must be local Run")

			var nosamlData = true;
		}

		// } else {
		sendToUi.samlAttributes.push(obj_parsed);
		//	}

		//		 console.log('After Json Stringify', parsedData);

		// =========================================
		var obj_data = JSON.parse(parsedData);
		logger.info('after json Parse: %s', obj_data);
		var userType = obj_data.UserType[0];

		if (userType == 'Dealer') {
			var legacyDealer = obj_data.DealerCode[0];
		}

		if (userType == 'Zone') {
			var zoneToWhichUSerBelongs = obj_data.Zone;
		}
		// var userType = obj_data.UserType[0];
		logger.info("Dealer Number logged in and accessed parts Availability App: %s", legacyDealer);

		if (userType == 'Dealer') {

			var url1 = "/API_BUSINESS_PARTNER/A_BusinessPartner/?$format=json&$filter=SearchTerm2 eq'" + legacyDealer +
				"' &$expand=to_Customer&$format=json&?sap-client=" + client;

		} else {

			//           if (userType == 'Zone') {

			//// he is a zone user.            	
			//           	var userZone;
			//           	  switch (zoneToWhichUSerBelongs) {
			//                   case "1":
			//                      userZone = "1000";
			//                       break;
			//                   case "2":
			//                       userZone = "2000";
			//                       break;
			//                   case "3":
			//                      userZone = "3000";   
			//                       break;
			//                   case "4":
			//                      userZone = "5000";
			//                       break;
			//                   case "5":
			//                       userZone = "4000";  
			//                       break;
			//                   case "7":
			//                        userZone = "9000";  
			//                       break;                      

			//                   default:

			//                   }

			//           	var url1 = "API_BUSINESS_PARTNER/A_CustomerSalesArea?&sap-client=" + client +"&$format=json&$filter=SalesOffice eq "+ userZone ; 

			//           } else {
			var url1 = "/API_BUSINESS_PARTNER/A_BusinessPartner/?$format=json&$expand=to_Customer&?sap-client=" + client +
				"&$filter=(BusinessPartnerType eq 'Z001' or BusinessPartnerType eq 'Z004' or BusinessPartnerType eq 'Z005') and zstatus ne 'X' &$orderby=BusinessPartner asc";
			//   }
		}
		//	ctx.logMessage('Final url being fetched', url + url1);
		logger.info("Final url being fetched: %s", url + url1);

		request({
			url: url + url1,
			headers: reqHeader

		}, function (error, response, body) {

			var attributeFromSAP;
			if (!error && response.statusCode == 200) {
				csrfToken = response.headers['x-csrf-token'];

				var json = JSON.parse(body);

				for (var i = 0; i < json.d.results.length; i++) {

					receivedData = {};

					var BpLength = json.d.results[i].BusinessPartner.length;
					receivedData.BusinessPartnerName = json.d.results[i].OrganizationBPName1;
					receivedData.BusinessPartnerKey = json.d.results[i].BusinessPartner;
					receivedData.BusinessPartner = json.d.results[i].BusinessPartner.substring(5, BpLength);
					receivedData.BusinessPartnerType = json.d.results[i].BusinessPartnerType;
					receivedData.SearchTerm2 = json.d.results[i].SearchTerm2;

					let attributeFromSAP;
					try {
						attributeFromSAP = json.d.results[i].to_Customer.Attribute1;
					} catch (e) {
						logger.info("The Data is sent without Attribute value for the BP: %s", json.d.results[i].BusinessPartner);
						//		ctx.logMessage("The Data is sent without Attribute value for the BP", json.d.results[i].BusinessPartner);
						// return;
					}

					switch (attributeFromSAP) {
					case "01":
						receivedData.Division = "10";
						receivedData.Attribute = "01"
						break;
					case "02":
						receivedData.Division = "20";
						receivedData.Attribute = "02"
						break;
					case "03":
						receivedData.Division = "Dual";
						receivedData.Attribute = "03"
						break;
					case "04":
						receivedData.Division = "10";
						receivedData.Attribute = "04"
						break;
					case "05":
						receivedData.Division = "Dual";
						receivedData.Attribute = "05"
						break;
					default:
						receivedData.Division = "10"; //  lets put that as a toyota dealer
						receivedData.Attribute = "01"

					}

					if ((receivedData.BusinessPartner == legacyDealer || receivedData.SearchTerm2 == legacyDealer) && (userType == 'Dealer')) {
						sendToUi.legacyDealer = receivedData.BusinessPartner,
							sendToUi.legacyDealerName = receivedData.BusinessPartnerName
						sendToUi.attributes.push(receivedData);
						break;
					}

					if (userType == 'Dealer') {
						continue;
					} else {
						sendToUi.attributes.push(receivedData);
					}
				}

				res.type("application/json").status(200).send(sendToUi);
				logger.info('Results sent successfully');
				//	ctx.logMessage('Results sent successfully')
			} else {

				var result = JSON.stringify(body);
				res.type('application/json').status(400).send(result);
			}
		});

	});

	app.get("/currentScopesForUser", (req, res) => {
		var xsAppName = uaa.xsappname;
		var userAttributes = JSON.parse(JSON.stringify(req.authInfo.userAttributes));
		var scopeData = req.authInfo.scopes;

		var manageServiceClaims = false;
		var managePartsClaims = false;
		var viewServiceClaims = false;
		var viewPartsClaims = false;
		var viewClaimInquiry = false;
		var viewQuickCoverageTool = false;
		var viewDealerLaborRate = false;
		var submitServiceClaims = false;

		var sendUserData = {
			"loggedUserType": [],
			"scopeData": scopeData
		};

		for (var i = 0; i < scopeData.length; i++) {
			if (scopeData[i] === xsAppName + ".Manage_Service_Claims") {
				manageServiceClaims = true;
			}
			if (scopeData[i] === xsAppName + ".Manage_Parts_Claims") {
				managePartsClaims = true;
			}
			if (scopeData[i] === xsAppName + ".View_Service_Claims") {
				viewServiceClaims = true;
			}
			if (scopeData[i] === xsAppName + ".View_Parts_Claims") {
				viewPartsClaims = true;
			}
			if (scopeData[i] === xsAppName + ".View_Claim_Inquiry") {
				viewClaimInquiry = true;
			}
			if (scopeData[i] === xsAppName + ".View_Quick_Coverage_Tool") {
				viewQuickCoverageTool = true;
			}
			if (scopeData[i] === xsAppName + ".View_Dealer_Labor_Rate") {
				viewDealerLaborRate = true;
			}
			if (scopeData[i] === xsAppName + ".Submit_Service_Claims") {
				submitServiceClaims = true;
			}
		}

		console.log("manageServiceClaims: " + manageServiceClaims);
		console.log("managePartsClaims: " + managePartsClaims);
		console.log("viewServiceClaims: " + viewServiceClaims);
		console.log("viewPartsClaims: " + viewPartsClaims);
		console.log("viewClaimInquiry: " + viewClaimInquiry);
		console.log("viewQuickCoverageTool: " + viewQuickCoverageTool);
		console.log("viewDealerLaborRate: " + viewDealerLaborRate);
		console.log("submitServiceClaims: " + submitServiceClaims);
		console.log("userAttributes: " + userAttributes);

		if (manageServiceClaims && !managePartsClaims && !viewServiceClaims && !viewPartsClaims && viewClaimInquiry && viewQuickCoverageTool &&
			viewDealerLaborRate && !submitServiceClaims) {
			sendUserData.loggedUserType.push("Dealer_Services_Admin");
		} else if (!manageServiceClaims && managePartsClaims && !viewServiceClaims && !viewPartsClaims && viewClaimInquiry &&
			viewQuickCoverageTool && viewDealerLaborRate && !submitServiceClaims) {
			sendUserData.loggedUserType.push("Dealer_Parts_Admin");
		} else if (!manageServiceClaims && !managePartsClaims && !viewServiceClaims && !viewPartsClaims && viewClaimInquiry &&
			viewQuickCoverageTool && viewDealerLaborRate && !submitServiceClaims) {
			sendUserData.loggedUserType.push("Dealer_User");
		} else if (!manageServiceClaims && !managePartsClaims && viewServiceClaims && viewPartsClaims && viewClaimInquiry &&
			viewQuickCoverageTool && viewDealerLaborRate && !submitServiceClaims) {
			sendUserData.loggedUserType.push(userAttributes.Zone ? "Zone_User" : "TCI_Admin");
		} else if (!manageServiceClaims && !managePartsClaims && !viewServiceClaims && !viewPartsClaims && viewClaimInquiry &&
			viewQuickCoverageTool && !viewDealerLaborRate && !submitServiceClaims) {
			sendUserData.loggedUserType.push("TCI_User");
		} else if (manageServiceClaims && !managePartsClaims && !viewServiceClaims && !viewPartsClaims && viewClaimInquiry &&
			viewQuickCoverageTool && viewDealerLaborRate && submitServiceClaims) {
			sendUserData.loggedUserType.push("Dealer_Services_Manager");
		} else {
			sendUserData.loggedUserType.push("Unknown");
		}
		return res.type("text/plain").status(200).send(JSON.stringify(sendUserData));
	});

	app.get("/attributesforlocaltesting", (req, res) => {

		var receivedData = {};

		var sendToUi = {
			"attributes": [],
			"samlAttributes": [],
			legacyDealer: "",
			legacyDealerName: ""

		};

		// ===================only for local testing - remove next deploy
		var obj_temp = {
			Language: ['English', 'English'],
			UserType: ['National', 'National'],
			DealerCode: [' ', ' ']
		};
		// console.log(req.authInfo.userAttributes);
		var parsedData = JSON.stringify(obj_temp);
		//		 console.log('After Json Stringify', parsedData);
		var obj_parsed = JSON.parse(parsedData);
		sendToUi.samlAttributes.push(obj_parsed);

		// =========================================

		//	var parsedData = JSON.stringify(req.authInfo.userAttributes);

		//	var obj = JSON.stringify(req.authInfo.userAttributes);
		//		var obj_parsed = JSON.parse(obj);
		var csrfToken;
		var obj_data = JSON.parse(parsedData);
		var csrfToken;
		var samlData = parsedData;

		//	console.log('saml data', samlData);

		//		console.log('send to ui data', sendToUi);

		let checkSAMLDetails;
		try {
			checkSAMLDetails = obj_data.DealerCode[0];
		} catch (e) {

			// return;
			var nosamlData = true;
		}
		sendToUi.samlAttributes.push(obj_parsed);

		var userType = obj_data.UserType[0];

		if (userType == 'Dealer') {
			var legacyDealer = obj_data.DealerCode[0];
		}

		//	if  usertype eq dealer then just get the details for that dealer,  otherwise get everything else

		if (userType == 'Dealer') {

			var url1 = "/API_BUSINESS_PARTNER/A_BusinessPartner/?$format=json&$filter=SearchTerm2 eq'" + legacyDealer +
				"' &$expand=to_Customer&$format=json&?sap-client=" + client;

		} else {

			var url1 = "/API_BUSINESS_PARTNER/A_BusinessPartner/?$format=json&$expand=to_Customer&?sap-client=" + client +
				"&$filter=(BusinessPartnerType eq 'Z001' or BusinessPartnerType eq 'Z004' or BusinessPartnerType eq 'Z005') and zstatus ne 'X' &$orderby=BusinessPartner asc";

		}

		request({
			url: url + url1,
			headers: reqHeader

		}, function (error, response, body) {

			var attributeFromSAP;
			if (!error && response.statusCode == 200) {
				csrfToken = response.headers['x-csrf-token'];

				var json = JSON.parse(body);
				// console.log(json);  // // TODO: delete it Guna

				for (var i = 0; i < json.d.results.length; i++) {

					receivedData = {};

					var BpLength = json.d.results[i].BusinessPartner.length;
					receivedData.BusinessPartnerName = json.d.results[i].OrganizationBPName1;
					receivedData.BusinessPartnerKey = json.d.results[i].BusinessPartner;
					receivedData.BusinessPartner = json.d.results[i].BusinessPartner.substring(5, BpLength);
					receivedData.BusinessPartnerType = json.d.results[i].BusinessPartnerType;
					receivedData.SearchTerm2 = json.d.results[i].SearchTerm2;

					let attributeFromSAP;
					try {
						attributeFromSAP = json.d.results[i].to_Customer.Attribute1;
					} catch (e) {

						// return;
					}

					switch (attributeFromSAP) {
					case "01":
						receivedData.Division = "10";
						receivedData.Attribute = "01"
						break;
					case "02":
						receivedData.Division = "20";
						receivedData.Attribute = "02"
						break;
					case "03":
						receivedData.Division = "Dual";
						receivedData.Attribute = "03"
						break;
					case "04":
						receivedData.Division = "10";
						receivedData.Attribute = "04"
						break;
					case "05":
						receivedData.Division = "Dual";
						receivedData.Attribute = "05"
						break;
					default:
						receivedData.Division = "10"; //  lets put that as a toyota dealer
						receivedData.Attribute = "01"

					}

					if ((receivedData.BusinessPartner == legacyDealer || receivedData.SearchTerm2 == legacyDealer) && (userType == 'Dealer')) {
						sendToUi.legacyDealer = receivedData.BusinessPartner,
							sendToUi.legacyDealerName = receivedData.BusinessPartnerName
						sendToUi.attributes.push(receivedData);
						break;
					}

					if (userType == 'Dealer') {
						continue;
					} else {
						sendToUi.attributes.push(receivedData);
					}
				}

				res.type("application/json").status(200).send(sendToUi);

			} else {

				var result = JSON.stringify(body);
				res.type('application/json').status(400).send(result);
			}
		});

	});
	return app;
};