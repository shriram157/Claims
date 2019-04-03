sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/Device"
], function (Controller, History, Device) {
	"use strict";

	return Controller.extend("zclaimProcessing.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */

		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		getModel: function (sName) {
			return this.getOwnerComponent().getModel(sName);
		},
		handleNavHeaderPress: function (oEvent) {

			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oGetText = oEvent.getSource().getText();
			if (oGetText === oBundle.getText("NewClaim")) {
				this.getOwnerComponent().getRouter().navTo("NewClaimSelectGroup");
				this.getModel("ProssingModel").refresh();
			} else if (oGetText === oBundle.getText("ViewUpdateClaims")) {
				this.getOwnerComponent().getRouter().navTo("SearchClaim");
				this.getModel("ProssingModel").refresh();
			} else if (oGetText === oBundle.getText("QuickCoverageTool")) {
				this.getOwnerComponent().getRouter().navTo("QueryCoverageTools");
				this.getModel("ProssingModel").refresh();
			} else if (oGetText === oBundle.getText("ClaimInquiry")) {
				this.getOwnerComponent().getRouter().navTo("ClaimInquiry");
				this.getModel("ProssingModel").refresh();
			} else if (oGetText === oBundle.getText("DealerLabourRateInquiry")) {
				var a_Dialog = sap.ui.xmlfragment("zclaimProcessing.view.fragments.DealerLabour",
					this);
				this.getDealer();
				this.getView().addDependent(a_Dialog);
				a_Dialog.open();
			}
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getDealer: function () {
			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				this.sPrefix = "/Claim_Destination"; //ecpSales_node_secured
				this.attributeUrl = "/userDetails/attributesforlocaltesting";
			} else {
				this.sPrefix = "";
				this.attributeUrl = "/userDetails/attributes";
			}

			//======================================================================================================================//			
			//  on init method,  get the token attributes and authentication details to the UI from node layer.  - begin
			//======================================================================================================================//		
			//  get the Scopes to the UI 
			//this.sPrefix ="";
			var oModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(oModel, "UserDataModel");
			var that = this;
			$.ajax({
				url: this.sPrefix + "/userDetails/currentScopesForUser",
				type: "GET",
				dataType: "json",
				success: function (oData) {
					// var userScopes = oData;
					// userScopes.forEach(function (data) {

					var userType = oData.loggedUserType[0];
					sap.ui.getCore().getModel("UserDataModel").setProperty("/LoggedInUser", userType);
					sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "");
					// sap.ui.getCore().getModel("UserDataModel").setProperty("/ManageAll",false);
					// sap.ui.getCore().getModel("UserDataModel").setProperty("/ShowAuthorization",false);
					// sap.ui.getCore().getModel("UserDataModel").setProperty("/NoNewUpdateViewOnly",false);
					// sap.ui.getCore().getModel("UserDataModel").setProperty("/ReadOnlyViewAll",false);
					// sap.ui.getCore().getModel("UserDataModel").setProperty("/ReadOnlyCoverageClaim",false);
					switch (userType) {
					case "Dealer_Parts_Admin":
						console.log("Dealer Parts");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAll");
						break;
					case "Dealer_Services_Admin":
						console.log("Dealer_Services_Admin");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAll");
						break;
					case "Dealer_User":
						console.log("Dealer_User");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "NoNewUpdateViewOnly");
						break;
					case "TCI_Admin":
						console.log("TCI_Admin");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyViewAll");
						break;
					case "TCI_User":
						console.log("TCI_User");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyCoverageClaim");
						break;
					case "Zone_User":
						console.log("Zone_User");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyViewAll");
						break;
					case "Dealer_Services_Manager":
						console.log("Dealer_Services_Manager");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllShowAuthorization");
						break;

					default:
						// raise a message, because this should not be allowed. 
						console.log("This condition should not be allowed");
					}
				}
			});

			// get the attributes and BP Details - Minakshi to confirm if BP details needed		// TODO: 
			$.ajax({
				url: this.sPrefix + this.attributeUrl,
				type: "GET",
				dataType: "json",

				success: function (oData) {
					var BpDealer = [];
					var userAttributes = [];

					$.each(oData.attributes, function (i, item) {
						var BpLength = item.BusinessPartner.length;

						BpDealer.push({
							"BusinessPartnerKey": item.BusinessPartnerKey,
							"BusinessPartner": item.BusinessPartner, //.substring(5, BpLength),
							"BusinessPartnerName": item.BusinessPartnerName, //item.OrganizationBPName1 //item.BusinessPartnerFullName
							"Division": item.Division,
							"BusinessPartnerType": item.BusinessPartnerType,
							"searchTermReceivedDealerName": item.SearchTerm2
						});

					});
					that.getModel("LocalDataModel").setProperty("/BpDealerModel", BpDealer);
					//that.getModel("LocalDataModel").setProperty("/BpDealerKey", BpDealer[0].BusinessPartnerKey);
					//that.getView().setModel(new sap.ui.model.json.JSONModel(BpDealer), "BpDealerModel");
					// read the saml attachments the same way 

				}.bind(this),
				error: function (response) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("SearchClaim", {}, true);
			}
		},
		onCloseDialogDealer: function (Oevent) {
			Oevent.getSource().getParent().close();
		},
		getDealerlabour: function (data) {
				var that = this;
				var oUrl = this.sPrefix + "/node/ZDLR_CLAIM_SRV/zc_labour_rateSet(Partner='" + data.BusinessPartnerKey + "',Division='" + data.Division +
					"')";
				$.ajax({
					url: oUrl,
					method: 'GET',
					async: false,
					dataType: 'json',
					success: function (zdata, textStatus, jqXHR) {
						var oModel = new sap.ui.model.json.JSONModel();
						zdata.d.Name = data.BusinessPartnerName;
						var zd1 = parseInt(zdata.d.ECPEffectiveDate.replace(/[^0-9]+/g, ''));
						zdata.d.ECPEffectiveDate = new Date(zd1);
						//var zd2 = parseInt(zdata.d.WTYEffectiveDate.replace(/[^0-9]+/g,''));
						zdata.d.WTYEffectiveDate = new Date(zd1);

						oModel.setData(zdata.d);

						that.getView().setModel(oModel, 'DealerLabour');
					},
					error: function (jqXHR, textStatus, errorThrown) {}
				});
			}
			//     	getListRow: function(proId, control) {
			// 	//var oStandardListItem =control.getParent();

		// 	if (proId % 2 === 0) {

		// 		this.addStyleClass("evenClass");
		// 	}
		// 	else{
		// 		this.addStyleClass("oddClass");
		// 	}
		// 	return proId;
		// }

	});
});