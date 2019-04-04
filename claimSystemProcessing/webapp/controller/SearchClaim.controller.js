sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	"sap/ui/core/ValueState"
], function (BaseController, ValueState) {
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
			var HeaderLinksModel = new sap.ui.model.json.JSONModel();
			HeaderLinksModel.setData({
				NewClaim: false,
				ViewUpdateClaims: false,
				QuickCoverageTool: false,
				ClaimInquiry: false,
				DealerLabourRateInquiry: false
			});
			this.getView().setModel(HeaderLinksModel, "HeaderLinksModel");
			sap.ui.getCore().setModel(HeaderLinksModel, "HeaderLinksModel");

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
					userType = "Dealer User";
					sap.ui.getCore().getModel("UserDataModel").setProperty("/LoggedInUser", userType);
					sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "");
					switch (userType) {
					case "Dealer_Parts_Admin":
						console.log("Dealer Parts");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAll");
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						break;
					case "Dealer_Services_Admin":

						console.log("Dealer_Services_Admin");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAll");
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						break;
					case "Dealer_User":
						console.log("Dealer_User");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyCoverageClaimLabour");
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						that.getOwnerComponent().getRouter().navTo("QueryCoverageTools");
						break;
					case "TCI_Admin":
						console.log("TCI_Admin");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyViewAll");
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						break;
					case "TCI_User":
						console.log("TCI_User");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyCoverageClaim");
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", false);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						that.getOwnerComponent().getRouter().navTo("QueryCoverageTools");
						break;
					case "Zone_User":
						console.log("Zone_User");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyViewAll");
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						break;
					case "Dealer_Services_Manager":
						console.log("Dealer_Services_Manager");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllShowAuthorization");
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						break;
					default:
						// raise a message, because this should not be allowed. 
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyViewAll");
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
					}
					console.log(sap.ui.getCore().getModel("UserDataModel"));
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
			oClaimModel.read("/ZC_CLAIM_GROUP", {
				urlParameters: {
					"$select": "ClaimGroupDes"

				},
				success: $.proxy(function (data) {
					for (var i = 0; i < data.results.length; i++) {
						if (data.results[i].ClaimGroupDes !== "" && oArrClaimGroup.indexOf(data.results[i].ClaimGroupDes) < 0) {
							oArrClaimGroup.push(data.results[i].ClaimGroupDes);
						}
					}
					for (var j = 0; j < oArrClaimGroup.length; j++) {
						oClaimGroup.push({
							"ClaimGroupDes": oArrClaimGroup[0]
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

		_onObjectMatched: function (oEvent) {
			var oProssingModel = this.getModel("ProssingModel");

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

		onEnterSearchText: function () {
			var oKey = this.getView().byId("idSearchBy").getSelectedKey();

			var oProssingModel = this.getModel("ProssingModel");
			if (oKey == "ExternalObjectNumber") {
				var oVin = this.getView().byId("idSearchText").getValue();
				oProssingModel.read("/ZC_GET_FORE_VIN(p_vhvin='" + oVin + "')/Set", {
					success: $.proxy(function (data) {
						if (data.results.length > 0) {
							//var oVinModel = data.results[0].Model;
							if (data.results[0].Message == "Invalid VIN Number") {

								this.getView().byId("idNewClaimMsgStrp").setProperty("visible", true);
								this.getView().byId("idNewClaimMsgStrp").setText("Please Enter a Valid VIN.");
								this.getView().byId("idNewClaimMsgStrp").setType("Error");
								this.getView().byId("idSearchText").setValueState(ValueState.Error);
							} else {

								this.getView().byId("idNewClaimMsgStrp").setProperty("visible", false);
								this.getView().byId("idNewClaimMsgStrp").setText("");
								this.getView().byId("idNewClaimMsgStrp").setType("None");
								this.getView().byId("idSearchText").setValueState(ValueState.None);
							}

						}
					}, this),
					error: function () {

					}
				});
			} else {
				this.getView().byId("idNewClaimMsgStrp").setProperty("visible", false);
				this.getView().byId("idNewClaimMsgStrp").setText("");
				this.getView().byId("idNewClaimMsgStrp").setType("None");
				this.getView().byId("idSearchText").setValueState(ValueState.None);
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
			// console.log(FromDateFormat, ToDateFormat);
			var sDate = "";
			var oResult = [];

			var oProssingModel = this.getModel("ProssingModel");
			if (sQuerySearchBy == "ExternalObjectNumber") {
				var oVin = this.getView().byId("idSearchText").getValue();
				oProssingModel.read("/ZC_GET_FORE_VIN(p_vhvin='" + oVin + "')/Set", {
					success: $.proxy(function (data) {
						if (data.results.length > 0) {
							//var oVinModel = data.results[0].Model;
							if (data.results[0].Message == "Invalid VIN Number") {

								this.getView().byId("idNewClaimMsgStrp").setProperty("visible", true);
								this.getView().byId("idNewClaimMsgStrp").setText("Please Enter a Valid VIN.");
								this.getView().byId("idNewClaimMsgStrp").setType("Error");
								this.getView().byId("idSearchText").setValueState(ValueState.Error);
							} else {

								this.getView().byId("idNewClaimMsgStrp").setProperty("visible", false);
								this.getView().byId("idNewClaimMsgStrp").setText("");
								this.getView().byId("idNewClaimMsgStrp").setType("None");
								this.getView().byId("idSearchText").setValueState(ValueState.None);
							}

						}
					}, this),
					error: function () {

					}
				});
			} else {
				this.getView().byId("idNewClaimMsgStrp").setProperty("visible", false);
				this.getView().byId("idNewClaimMsgStrp").setText("");
				this.getView().byId("idNewClaimMsgStrp").setType("None");
				this.getView().byId("idSearchText").setValueState(ValueState.None);
			}

			if (sQuerySearchBy === "RepairOrderNumberExternal") {
				sDate = "RepairDate";

			} else {
				sDate = "ReferenceDate";

			}

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
				this.getView().getModel("RowCountModel").setProperty("/rowCount", 50);
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
				this.getView().getModel("RowCountModel").setProperty("/rowCount", 10);
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

			if (sQueryDate != "" && sQueryDealer != "" && sQueryClaimGroup != "" && sQuerySearchText == "" && sQueryClaimType == "" &&
				sQueryStat == "") {

				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter("WarrantyClaimGroupDes", sap.ui.model.FilterOperator.EQ, sQueryClaimGroup)
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

			this.getView().getModel("RowCountModel").setProperty("/rowCount", 0);

			this.getView().byId("idSearchText").setValue("");
			this.getView().byId("idClaimGroup").setSelectedKey("");
			this.getView().byId("idClaimType").setSelectedKey("");
			this.getView().byId("idClaimStatus").setSelectedItems("");
		},
		onPressClaim: function (oEvent) {
			var oClaimNum = oEvent.getSource().getText();
			var oClaimModel = this.getModel("ProssingModel");

			oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
				urlParameters: {
					"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'"
				},
				success: $.proxy(function (sdata) {
					//console.log(sdata);
					//this.getModel("LocalDataModel").setProperty("/ClaimDetails", sdata.results[0]);
					var oClaimType = sdata.results[0].WarrantyClaimType;
					var oClaimGroup = sdata.results[0].WarrantyClaimGroupDes;

					if (oClaimType == "ZACD" || oClaimType == "ZAUT") {
						this.oSelectedClaimGroup = "Authorization";
					} else {
						this.oSelectedClaimGroup = "Claim";
					}
					if (oClaimGroup == "PART WAREHOUSE") {
						this.getOwnerComponent().getRouter().navTo("PartsMainSection", {
							claimNum: oClaimNum,
							oKey: oClaimType,
							oClaimGroup: this.oSelectedClaimGroup,
							oClaimNav: "Details"

						});
					} else {
						this.getOwnerComponent().getRouter().navTo("MainClaimSection", {
							claimNum: oClaimNum,
							oKey: oClaimType,
							oClaimGroup: this.oSelectedClaimGroup,
							oClaimNav: "Details"

						});
					}
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