sap.ui.define([
	"zclaimProcessing/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.NewClaimSelectGroup", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.NewClaimSelectGroup
		 */
		onInit: function () {
			var oProssingModel = this.getModel("ProssingModel");
			var oClaimGroup;
			var oClaimData = [];
			var oClaimGroupJson = [];
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/RadioEdit", false);
			this.getDealer();
			//Model data set for Header Links visibility as per User login
			console.log("HeaderLinksModel", sap.ui.getCore().getModel("HeaderLinksModel"));
			this.getView().setModel(sap.ui.getCore().getModel("HeaderLinksModel"), "HeaderLinksModel");

			// 			oProssingModel.read("/ZC_CLAIM_GROUP", {
			// 				success: $.proxy(function (data) {
			// 					var odata = data.results;
			// 					for (var i = 0; i < odata.length; i++) {
			// 						if (oClaimData.indexOf(odata[i].ClaimGroupDes) < 0 && !$.isEmptyObject(odata[i].ClaimGroupDes)) {
			// 							oClaimData.push(
			// 								odata[i].ClaimGroupDes
			// 							);
			// 						}
			// 					}

			// 					if (sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope") == "ManageAllParts") {
			// 						oClaimGroup = oClaimData.filter(function (val) {
			// 							return val == "CORE RETURN" || val == "SMART PARTS" || val == "PART WAREHOUSE";
			// 						});
			// 					} else if (sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope") == "ManageAllServices" || sap.ui.getCore().getModel(
			// 							"UserDataModel").getProperty("/UserScope") == "ManageAllShowAuthorization") {
			// 						oClaimGroup = oClaimData.filter(function (val) {
			// 							return val == "SETR" || val == "WARRANTY" || val == "CUSTOMER RELATIONS" || val == "VEHICLE LOGISTICS" || val == "ECP" ||
			// 								val == "FIELD ACTION";
			// 						});
			// 					} else {
			// 						oClaimGroup = oClaimData;
			// 					}

			// 					for (var j = 0; j < oClaimGroup.length; j++) {
			// 						oClaimGroupJson.push({
			// 							ClaimGroupDes: oClaimGroup[j]
			// 						});
			// 					}
			// 					this.getOwnerComponent().getModel("LocalDataModel").setProperty("/ClaimGroupData", oClaimGroupJson);
			// 					var oKey = oClaimGroupJson[0].ClaimGroupDes;
			// 					if (oKey === "WARRANTY") {
			// 						this.getOwnerComponent().getModel("LocalDataModel").setProperty("/RadioEdit", true);
			// 					} else {
			// 						this.getOwnerComponent().getModel("LocalDataModel").setProperty("/RadioEdit", false);
			// 					}

			// 				}, this),
			// 				error: function () {}
			// 			});

			oProssingModel.read("/zc_claim_groupSet", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
				},
				success: $.proxy(function (data) {
					var oClaimData = data.results;
					// 	for (var i = 0; i < oClaimData.length; i++) {
					// 		if (oClaimGroup.indexOf(oClaimData[i].ClaimGroupDes) == -1) {
					// 			oClaimGroup.push(oClaimData[i]);
					// 		}
					// 	}

					var elements = oClaimData.reduce(function (previous, current) {

						var object = previous.filter(function (sobj) {
							return sobj.ClaimGroupDes === current.ClaimGroupDes;
						});
						if (object.length == 0) {
							previous.push(current);
						}
						return previous;
					}, []);

					if (sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope") == "ManageAllParts") {
						oClaimGroup = elements.filter(function (val) {
							return val.ClaimGroup == "SCR" || val.ClaimGroup == "SSM" || val.ClaimGroup == "PWD";
						});
					} else if (sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope") == "ManageAllServices" || sap.ui.getCore().getModel(
							"UserDataModel").getProperty("/UserScope") == "ManageAllShowAuthorization") {
						oClaimGroup = elements.filter(function (val) {
							return val.ClaimGroup == "STR" || val.ClaimGroup == "WTY" || val.ClaimGroup == "CRC" || val.ClaimGroup == "VLC" || val.ClaimGroup ==
								"ECP" ||
								val.ClaimGroup == "FAC";
						});
					} else {
						oClaimGroup = elements;
					}
					this.getModel("LocalDataModel").setProperty("/oClaimGroupData", oClaimGroup);

					//this.getOwnerComponent().getModel("LocalDataModel").setProperty("/ClaimGroupData", oClaimGroupJson);
					var oKey = oClaimGroup[0].ClaimGroup;
					if (oKey === "WTY") {
						this.getOwnerComponent().getModel("LocalDataModel").setProperty("/RadioEdit", true);
					} else {
						this.getOwnerComponent().getModel("LocalDataModel").setProperty("/RadioEdit", false);
					}

				}, this)

			});

		},

		onSelectClaimType: function (oEvent) {
			//mainSectionTitle
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oSelectedKey = this.getView().byId("idClaimType").getSelectedKey();

			if (oSelectedKey === "WTY") {
				this.getOwnerComponent().getModel("LocalDataModel").setProperty("/RadioEdit", true);
			} else {
				this.getOwnerComponent().getModel("LocalDataModel").setProperty("/RadioEdit", false);
				this.getView().byId("idRequestType").setSelectedIndex(0);
			}
		},

		onClaimAuthorization: function (oEvent) {
			//var oSelectedIndex = this.getView().byId("idRequestType").getSelectedIndex();
			var oSelectedKey = this.getView().byId("idClaimType").getSelectedKey();
			var oClaimNum = "nun";

			var oUniqIndex = this.getView().byId("idRequestType").getSelectedIndex();
			if (oUniqIndex == 1) {
				this.oSelectedClaimGroup = "Authorization";
			} else if (oUniqIndex == 0) {
				this.oSelectedClaimGroup = "Claim";
			}

			if (oSelectedKey === "WTY") {

				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "WTY",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New"

				});

			} else if (oSelectedKey === "PWD") {
				this.getRouter().navTo("PartsMainSection", {
					claimNum: oClaimNum,
					oKey: "PWD",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New"
				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "FAC") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "FAC",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New"

				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "ECP") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "ECP",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New"

				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "STR") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "STR",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New"

				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "SCR") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "SCR",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New"
				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "VLC") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "VLC",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New"

				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "CRC") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "CRC",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New"

				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			}
		},

		onSelectRequestType01: function (oEvent) {

			// sap.ui.getCore().getEventBus().publish("App", "oType", {text : oUniqIndex});
		},

		onPressCancel: function () {
			this.getRouter().navTo("SearchClaim");
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zclaimProcessing.view.NewClaimSelectGroup
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zclaimProcessing.view.NewClaimSelectGroup
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.NewClaimSelectGroup
		 */
		//	onExit: function() {
		//
		//	}

	});

});