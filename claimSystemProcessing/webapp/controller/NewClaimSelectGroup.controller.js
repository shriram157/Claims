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

			oProssingModel.read("/zc_claim_groupSet", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
				},
				success: $.proxy(function (data) {
					oClaimData = data.results;

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
							return val.ClaimGroup == "SCR" || val.ClaimGroup == "PWD" || val.ClaimGroup == "PMP";
						});
					} else if (sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope") == "ManageAllServices" || sap.ui.getCore().getModel(
							"UserDataModel").getProperty("/UserScope") == "ManageAllShowAuthorization") {
						oClaimGroup = elements.filter(function (val) {
							return val.ClaimGroup == "STR" || val.ClaimGroup == "WTY" || val.ClaimGroup == "CRC" || val.ClaimGroup == "VLC" || val.ClaimGroup ==
								"ECP" || val.ClaimGroup == "FAC";
						});
					}else if (sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope") == "ManageAllWarrantyParts") {
						oClaimGroup = elements.filter(function (val) {
							return val.ClaimGroup == "SCR" || val.ClaimGroup == "PWD" || val.ClaimGroup == "STR" ||
								val.ClaimGroup == "WTY" || val.ClaimGroup == "CRC" || val.ClaimGroup == "VLC" || val.ClaimGroup ==
								"ECP" || val.ClaimGroup == "PMP" || val.ClaimGroup == "FAC";

						});
					} else {
						oClaimGroup = elements;
					}

					// 	oClaimGroup.push({

					// 		ClaimGroupDes: "PRICE MATCH",

					// 		ClaimGroup: "PMP"

					// 	});
					this.getModel("LocalDataModel").setProperty("/oClaimGroupData", oClaimGroup);
					console.log(sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope"), oClaimGroup);

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
					oClaimNav: "New",
					claimTypeGroup: "WTY"

				});

			} else if (oSelectedKey === "PWD") {
				this.getRouter().navTo("PartsMainSection", {
					claimNum: oClaimNum,
					oKey: "PWD",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New",
					claimTypeGroup: "PWD"
				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "PMP") {
				this.getRouter().navTo("PMPMainSection", {
					claimNum: oClaimNum,
					oKey: "PMP",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New",
					claimTypeGroup: "PMP"
				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "FAC") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "FAC",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New",
					claimTypeGroup: "FAC"

				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "ECP") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "ECP",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New",
					claimTypeGroup: "ECP"

				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "STR") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "STR",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New",
					claimTypeGroup: "STR"

				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "SCR") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "SCR",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New",
					claimTypeGroup: "SCR"
				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "VLC") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "VLC",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New",
					claimTypeGroup: "VLC"

				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			} else if (oSelectedKey === "CRC") {
				this.getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: "CRC",
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "New",
					claimTypeGroup: "CRC"

				});
				this.getView().byId("idRequestType").setSelectedIndex(0);
			}
		},

		onSelectRequestType01: function (oEvent) {

			// sap.ui.getCore().getEventBus().publish("App", "oType", {text : oUniqIndex});
		},
		handleDealerLabourInq: function (oEvent) {
			var sDivision;
			var oDialog;
			var oPartner;
			//this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner");
			//console.log(this.getModel("LocalDataModel").getProperty("/ClaimDetails"));
			if (this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner") != "" &&
				this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner") != undefined) {
				oPartner = this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner");
			} else {
				oPartner = this.getView().getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
			}

			//	var selectedKey = this.getView().byId("idDealerCode").getSelectedKey();
			//  get the locale to determine the language.
			var isDivision = window.location.search.match(/Division=([^&]*)/i);
			if (isDivision) {
				sDivision = window.location.search.match(/Division=([^&]*)/i)[1];
			} else {
				sDivision = "10"; // default is english
			}

			// 			this.getDealer();

			var oProssingModel = this.getModel("ProssingModel");
			oProssingModel.read("/zc_labour_rateSet(Partner='" + oPartner + "',Division='" + sDivision +
				"')", {
					success: $.proxy(function (data) {
						this.getModel("LocalDataModel").setProperty("/oDealerLabour", data);
						if (!oDialog) {
							oDialog = sap.ui.xmlfragment("zclaimProcessing.view.fragments.DealerLabour",
								this);
							this.getView().addDependent(oDialog);
						}
						oDialog.open();
					}, this),
					error: function () {

					}
				});

		},

		onPressCancel: function () {
			this.getRouter().navTo("SearchClaim");
		}

	});

});