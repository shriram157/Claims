sap.ui.define([
	"zclaimProcessing/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.SearchClaim", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.SearchClaim
		 */
		onInit: function () {
			
			
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
			var that = this;
			$.ajax({
				url: this.sPrefix + "/userDetails/currentScopesForUser",
				type: "GET",
				dataType: "json",
				success: function (oData) {
					// var userScopes = oData;
					// userScopes.forEach(function (data) {

					var userType = oData.loggedUserType[0];
					switch (userType) {
					case "Dealer_Parts_Admin":
						console.log("Dealer Parts");

						break;
					case "Dealer_Services_Admin":

						console.log("Dealer_Services_Admin");
						break;

					case "Dealer_User":
						console.log("Dealer_User");

						break;
					case "TCI_Admin":
						console.log("TCI_Admin");
						break;
					case "TCI_User":
						console.log("TCI_User");
						break;

					case "Zone_User":
						console.log("Zone_User");
						break;
					default:
						// raise a message, because this should not be allowed. 

					}
				}

				// if (data === "ecpSales!t1188.Manage_ECP_Application") {
				// 	that.getView().getModel("oDateModel").setProperty("/oCreateButton", true);
				// 	that.getModel("LocalDataModel").setProperty("/newAppLink", true);
				// } 

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
					that.getModel("LocalDataModel").setProperty("/BpDealerKey", BpDealer[0].BusinessPartnerKey);
					//that.getView().setModel(new sap.ui.model.json.JSONModel(BpDealer), "BpDealerModel");
					// read the saml attachments the same way 
					$.each(oData.samlAttributes, function (i, item) {
						userAttributes.push({
							"UserType": item.UserType[0],
							"DealerCode": item.DealerCode[0],
							"Language": item.Language[0]
								// "Zone": item.Zone[0]   ---    Not yet available
						});

					});

					that.getView().setModel(new sap.ui.model.json.JSONModel(userAttributes), "userAttributesModel");

					//	that._getTheUserAttributes();

				}.bind(this),
				error: function (response) {
					sap.ui.core.BusyIndicator.hide();
				}
			}).done(function (data, textStatus, jqXHR) {

				var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				oRouter.attachRouteMatched(that._onObjectMatched, that);
			});

			// scopes to be used as below. // TODO: Minakshi to continue the below integration

			//if you see scopes   Manage_ECP_Application,  then treat the user as Dealer Sales USer,  this is the only user with manage application
			// TODO:  in the ui for this user,  everything is available and default landing page need to be set view/update application page

			// if you see scopes view ECP Claim & view ECP Agreement & inquiry with  user attribute dealer code then this is a Dealer Service user. 
			// TODO: Suppress the tabs new application and View/update application.  only enable Agreement inquiry and make this a landing page. 

			//if you see scopes view ecp application, view ecp claim, view ecp agreement, view inquiry with no dealer code and no zone then this is a Internal TCIUser Admin[ECP Dept]
			// TODO: Make view/update application as the landing page,  suppress new applicaiton creation button  ( Internal user cannot create an application but view/update is allowed)

			//if you see scopes view ecp application, view ecp claim, view ecp agreement, view inquiry with no dealer code and  zone then this is a  ECP ZONE USER
			// TODO: For ECP Zone user restrict the Drop down of dealers only from that zone you received from the attribute. 
			//suppress new application creation button and make landing page as view/update application

			// if you see scopes View ECP Claim, view ECP Agreement, Inqyiry with no delaer code no zone then this is a Internal TCI User
			// TODO: Suppress the tabs new application and View/update application.  only enable Agreement inquiry and make this a landing page. 

			//======================================================================================================================//			
			//  on init method,  get the token attributes and authentication details to the UI from node layer.  - End
			//======================================================================================================================//	

			var oDateModel = new sap.ui.model.json.JSONModel();
			var PriorDate = new Date();
			oDateModel.setData({
				dateValueDRS2: new Date(new Date().setDate(PriorDate.getDate() - 30)),
				secondDateValueDRS2: PriorDate,
				dateCurrent: new Date()
			});
			this.getView().setModel(oDateModel, "DateModel");
			var oBusinessModel = this.getModel("ApiBusinessModel");
			this.getView().setModel(oBusinessModel, "OBusinessModel");
			//console.log(sap.ui.getCore().getConfiguration().getLanguage());
			this.getView().setModel(this.getModel("ProssingModel"));
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimGroupdata = [];
			var oClaimGroupObj = [];
			oClaimModel.read("/ZC_CLAIM_GROUP", {

				success: $.proxy(function (data) {
					var oClaimData = data.results;
					for (var i = 0; i < oClaimData.length; i++) {
						if (oClaimGroupdata.indexOf(oClaimData[i].ClaimGroupDes) < 0) {

							oClaimGroupdata.push(
								oClaimData[i].ClaimGroupDes
							);

						}
					}

					oClaimGroupdata.forEach(function (item) {
						oClaimGroupObj.push({
							CLaimGroupDes: item
						});
					});
					console.log(oClaimGroupObj);
					this.getModel("LocalDataModel").setProperty("/ClaimStatusDataGroup", oClaimGroupObj);
				}, this)
			});

			if (sap.ui.getCore().getConfiguration().getLanguage() === "fr") {
				//	this.getModel("LocalDataModel").setProperty("/lang", "FR");
				oClaimModel.read("/ZC_CLAIM_STATUS_DESC", {
					urlParameters: {
						"$filter": "LanguageKey eq 'FR'"
					},
					success: function (data) {
						console.log(data);
						//this.getModel("LocalDataModel").setProperty("/ClaimStatus", data.results);
					}
				});
			} else {
				oClaimModel.read("/ZC_CLAIM_STATUS_DESC", {
					urlParameters: {
						"$filter": "LanguageKey eq 'EN'"
					},
					success: $.proxy(function (data) {
						console.log(data);
						this.getModel("LocalDataModel").setProperty("/ClaimStatus", data.results);
					}, this)
				});
			}
			var oArrClaimGroup = [];
			var oClaimGroup = [];
			oClaimModel.read("/ZC_CLAIM_HEAD?", {
				urlParameters: {
					"$select": "WarrantyClaimGroup"

				},
				success: $.proxy(function (data) {
					for (var i = 0; i < data.results.length; i++) {
						if (data.results[i].WarrantyClaimGroup !== "" && oArrClaimGroup.indexOf(data.results[i].WarrantyClaimGroup) < 0) {
							oArrClaimGroup.push(data.results[i].WarrantyClaimGroup);
						}
					}
					for (var j = 0; j < oArrClaimGroup.length; j++) {
						oClaimGroup.push({
							"WarrantyClaimGroup": oArrClaimGroup[0]
						});
					}
					console.log(oClaimGroup);

					this.getModel("LocalDataModel").setProperty("/WarrantyClaimGroups", oClaimGroup);
				}, this)
			});

			var oRowCount = {
				rowCount: 0
			};

			this.getView().setModel(new sap.ui.model.json.JSONModel(oRowCount), "RowCountModel");
		},
		onAfterRendering: function () {
			// this.getView().byId("idDealerCode").setSelectedKey("2400042350");
			// this.getView().byId("idDealerCode").setValue("42350");

			// this.getOwnerComponent().getModel("LocalDataModel").setProperty("/DealerText", "42350");
			// this.getOwnerComponent().getModel("LocalDataModel").setProperty("/AdditionalText", "Bolton Toyota 2033664 ONTARIO LTD.");
			//var ogetAdditionalText = this.getView().byId("idDealerCode").getValue();
		},
		fnOnSelectDealer: function (oEvent) {
			var ogetAdditionalText = oEvent.getParameters().selectedItem.getAdditionalText();
			var ogetDealer = this.getView().byId("idDealerCode").getValue();
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/DealerText", ogetDealer);
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/AdditionalText", ogetAdditionalText);
		},
		onSelectGroup: function (oEvent) {
			var oText = oEvent.getParameters().selectedItem.getText();
			var oProssingModel = this.getModel("ProssingModel");
			oProssingModel.read("/ZC_CLAIM_GROUP", {
				urlParameters: {
					"$filter": "ClaimGroupDes eq '" + oText + "'"
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/ClaimType", data.results);

				}, this)
			});
		},

		handleSelectClaimGroupFinish: function (oEvent) {
			this.oArr = oEvent.getParameters().selectedItems;
			this.oStatusKey = [];
			for (var i in this.oArr) {
				if (!$.isEmptyObject(this.oArr[i].getKey())) {
					this.oStatusKey.push(this.oArr[i].getKey());
				}
			}
			console.log(this.oStatusKey);
		},
		onSearchBy: function (oEvent) {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oKey = oEvent.getParameters().selectedItem.getKey();
			if (oKey === "RepairOrderNumberExternal") {
				this.getView().byId("idCLREDate").setText(this.oBundle.getText("RepairOrderDate"));
			} else {
				this.getView().byId("idCLREDate").setText(this.oBundle.getText("ClaimSubmissionDate"));
			}
		},
		onPressSearch: function (oEvent) {

			var sQueryDealer = this.getView().byId("idDealerCode").getSelectedKey();
			// console.log(sQueryDealer, this.oStatusKey);
			var sQuerySearchBy = this.getView().byId("idSearchBy").getSelectedKey();
			var sQuerySearchText = this.getView().byId("idSearchText").getValue();
			var sQueryClaimGroup = this.getView().byId("idClaimGroup").getSelectedKey();
			var sQueryClaimType = this.getView().byId("idClaimType").getSelectedKey();

			var sQueryStat = this.byId("idClaimStatus").getSelectedKeys();
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			var andFilter = [];
			var sQueryDate = this.getView().byId("DRS2").getValue();
			var FromDate = this.getView().getModel("DateModel").getProperty("/dateValueDRS2");
			var ToDate = this.getView().getModel("DateModel").getProperty("/secondDateValueDRS2");
			var FromDateFormat = oDateFormat.format(FromDate);
			var ToDateFormat = oDateFormat.format(ToDate);
			console.log(FromDateFormat, ToDateFormat);
			var sDate = "";
			var oResult = [];
			if (sQuerySearchBy === "RepairOrderNumberExternal") {
				sDate = "RepairDate";

			} else {
				sDate = "ReferenceDate";

			}

			//var oFilterArr = [];
			//var orFilter = [];
			//var newFilter = [];
			//	console.log(sQueryDealer, sQuerySearchBy, sQuerySearchText, sQueryClaimGroup, sQueryClaimType, this.oStatusKey);

			if (!$.isEmptyObject(sQueryStat)) {

				for (var j = 0; j < sQueryStat.length; j++) {

					oResult.push(new sap.ui.model.Filter("ProcessingStatusOfWarrantyClm", sap.ui.model.FilterOperator.EQ, sQueryStat[j]));

				}
				this.getView().getModel("RowCountModel").setProperty("/rowCount", 10);
			}

			if (sQueryDate != "" && sQueryDealer != "" && sQuerySearchText == "" && sQueryClaimType == "" && sQueryStat == "") {

				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat)
					],
					and: true
				});
			} else if (sQueryDate != "" && sQueryDealer != "" && sQuerySearchText != "" && sQueryClaimType == "" && sQueryStat == "") {

				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sQuerySearchBy, sap.ui.model.FilterOperator.EQ, sQuerySearchText)

					],
					and: true
				});
				this.getView().getModel("RowCountModel").setProperty("/rowCount", 10);
			} else if (sQuerySearchText != "" && sQueryClaimType != "" && sQueryDate != "" && sQueryDealer != "" && sQueryStat == "") {
				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sQuerySearchBy, sap.ui.model.FilterOperator.EQ, sQuerySearchText),
						new sap.ui.model.Filter("WarrantyClaimType", sap.ui.model.FilterOperator.EQ, sQueryClaimType)
					],
					and: true
				});
			} else if (sQueryClaimType != "" && sQueryDate != "" && sQueryDealer != "" && sQueryStat == "" && sQuerySearchText == "") {
				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("WarrantyClaimType", sap.ui.model.FilterOperator.EQ, sQueryClaimType),
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer)

					],
					and: true
				});
				this.getView().getModel("RowCountModel").setProperty("/rowCount", 10);
			} else if (sQueryStat != "" && sQueryClaimType != "" && sQueryDate != "" && sQueryDealer != "" && sQuerySearchText == "") {

				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter("WarrantyClaimType", sap.ui.model.FilterOperator.EQ, sQueryClaimType),
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter(oResult)

					],
					and: true
				});

				this.getView().getModel("RowCountModel").setProperty("/rowCount", 10);

			} else if (sQueryStat != "" && sQuerySearchText != "" && sQueryDate != "" && sQueryDealer != "" && sQueryClaimType == "") {
				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sQuerySearchBy, sap.ui.model.FilterOperator.EQ, sQuerySearchText),
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter(oResult)

					],
					and: true
				});
				this.getView().getModel("RowCountModel").setProperty("/rowCount", 10);
			} else if (sQueryStat != "" && sQueryDate != "" && sQueryDealer != "" && sQueryClaimType == "" && sQuerySearchText == "") {

				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter(oResult)
					],
					and: true
				});
				this.getView().getModel("RowCountModel").setProperty("/rowCount", 10);

			} else if (sQueryDate != "" && sQueryDealer != "" && sQuerySearchText != "" && sQueryClaimType != "" && sQueryStat != "") {

				andFilter = new sap.ui.model.Filter({
					filters: [

						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sQuerySearchBy, sap.ui.model.FilterOperator.EQ, sQuerySearchText),
						new sap.ui.model.Filter("WarrantyClaimType", sap.ui.model.FilterOperator.EQ, sQueryClaimType),
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter(oResult)
					],
					and: true
				});
				this.getView().getModel("RowCountModel").setProperty("/rowCount", 10);
			}
			var oTable = this.getView().byId("idClaimTable");
			var oBindItems = oTable.getBinding("rows");
			oBindItems.filter(andFilter);

		},

		onPressClear: function () {

			var andFilter = [];
			var oTable = this.getView().byId("idClaimTable");
			var oBindItems = oTable.getBinding("rows");
			oBindItems.filter(andFilter);
			this.getView().byId("idSearchText").setValue("");
			this.getView().byId("idClaimGroup").setSelectedKey("");
			this.getView().byId("idClaimType").setSelectedKey("");
			this.getView().byId("idClaimStatus").setSelectedItems("");
		},
		onPressClaim: function (oEvent) {
			var oClaimNum = oEvent.getSource().getText();
			var oClaimModel = this.getModel("ProssingModel");

			oClaimModel.read("/ZC_CLAIM_HEAD", {
				urlParameters: {
					"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'"
				},
				success: $.proxy(function (sdata) {
					//console.log(sdata);
					//this.getModel("LocalDataModel").setProperty("/ClaimDetails", sdata.results[0]);
					var oClaimType = sdata.results[0].WarrantyClaimType;

					if (oClaimType == "ZACD" || oClaimType == "ZAUT") {
						this.oSelectedClaimGroup = "Authorization";
					} else {
						this.oSelectedClaimGroup = "Claim";
					}

					this.getOwnerComponent().getRouter().navTo("MainClaimSection", {
						claimNum: oClaimNum,
						oKey: "nun",
						oClaimGroup: this.oSelectedClaimGroup
					
					});

				}, this)
			});

		},
		onCreateNewClaim: function () {
			this.getRouter().navTo("NewClaimSelectGroup");

		}

		/**
		 * {
				customerNum : this.getModel("LocalDataModel").getProperty("/BpDealerKey")
			}
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zclaimProcessing.view.SearchClaim
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zclaimProcessing.view.SearchClaim
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.SearchClaim
		 */
		//	onExit: function() {
		//
		//	}

	});

});