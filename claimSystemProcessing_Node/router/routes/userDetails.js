/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
"use strict";

module.exports = function () {

	var async = require('async');
	var express = require('express');
	var request = require('request');
	var xsenv = require("@sap/xsenv");

	var auth64;

var winston = require('winston');
 

//var express = require('express');
// const correlator = require('correlation-id');
var log = require('cf-nodejs-logging-support');
var app = express();

// Set the minimum logging level (Levels: error, warn, info, verbose, debug, silly)
log.setLoggingLevel("info");

// Bind to express app
app.use(log.logNetwork);

  
//	var app = express.Router();
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

		
		req.logMessage("info", "attributes fetch started");
			//	res.type("application/json").status(200).send(JSON.stringify(req.authInfo.userAttributes));
		var receivedData = {};

		var sendToUi = {
			"attributes": [],
			"samlAttributes": [],
			legacyDealer: "",
			legacyDealerName: ""
		};
		
// =====================================================================================

       req.logMessage('info', "user Attributes", req.authInfo.userAttributes);

	//	console.log(req.authInfo.userAttributes);
		var parsedData = JSON.stringify(req.authInfo.userAttributes);
	//	console.log('After Json Stringify', parsedData);
 
        req.logMessage('info','After Json Stringify', parsedData);
		var obj = JSON.stringify(req.authInfo.userAttributes);
		var obj_parsed = JSON.parse(obj);

		var csrfToken;
		var samlData = parsedData;
        
			var obj_data = JSON.parse(parsedData);
		console.log('saml data', samlData);
			  req.logMessage('info','saml data', samlData);
		console.log('send to ui data', sendToUi);
			  req.logMessage('info', 'send to ui data', sendToUi);
		let checkSAMLDetails;
		try {
			checkSAMLDetails = obj_data.DealerCode[0];
		} catch (e) {
		  req.logMessage('info', "No SAML Authentication happened Must be local Run")
 
			var nosamlData = true;
		}


		// } else {
			sendToUi.samlAttributes.push(obj_parsed);
	//	}

		//		 console.log('After Json Stringify', parsedData);

		// =========================================
		var obj_data = JSON.parse(parsedData);
	  req.logMessage('info', 'after json Parse', obj_data);
		var userType = obj_data.UserType[0];

		if (userType == 'Dealer') {
			var legacyDealer = obj_data.DealerCode[0];
		}
		
		if (userType == 'Zone') {
			var zoneToWhichUSerBelongs = obj_data.Zone;
		}
		// var userType = obj_data.UserType[0];
        req.logMessage('info','Dealer Number logged in and accessed parts Availability App', legacyDealer);


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
	  req.logMessage('info','Final url being fetched', url + url1);
	  
	  
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
					  req.logMessage('info',"The Data is sent without Attribute value for the BP", json.d.results[i].BusinessPartner);
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

				if ((receivedData.BusinessPartner == legacyDealer || receivedData.SearchTerm2 == legacyDealer)  && (userType == 'Dealer')) {
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
			  req.logMessage('info','Results sent successfully');
			//	ctx.logMessage('Results sent successfully')
			} else {

				var result = JSON.stringify(body);
				res.type('application/json').status(400).send(result);
			}
		});
		


	});

    // call with multiple requests. 
    
    


	return app;
};