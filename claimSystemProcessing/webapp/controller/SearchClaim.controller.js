sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	"sap/ui/core/ValueState",
	"sap/ui/model/Sorter",
	"sap/m/ViewSettingsDialog",
	"sap/m/ViewSettingsItem"
], function (BaseController, ValueState, Sorter, ViewSettingsDialog, ViewSettingsItem) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.SearchClaim", {

		onInit: function () {
			this.getModel("LocalDataModel").setProperty("/oVisibleRowTR", 0);
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			this.counter = 0;
			this.oSkip = this.counter * 0;
			if (sLocation_conf == 0) {
				this.sPrefix = "/Claim_Destination"; //ecpSales_node_secured
				this.attributeUrl = "/userDetails/attributesforlocaltesting";
			} else {
				this.sPrefix = "";
				this.attributeUrl = "/userDetails/attributes";
			}
			var HeaderLinksModel = new sap.ui.model.json.JSONModel();
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/visibleNewBtn", true);
			/*Uncomment for security*/
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

			var oModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(oModel, "UserDataModel");
			var that = this;

			$.ajax({
				url: this.sPrefix + "/userDetails/currentScopesForUser",
				type: "GET",
				dataType: "json",
				success: function (oData) {
					var userType = oData.loggedUserType[0];
					//var userType = "Dealer_Parts_Admin";
					//var userType = "Dealer_Parts_Services_Admin";
					sap.ui.getCore().getModel("UserDataModel").setProperty("/LoggedInUser", userType);
					sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "");
					switch (userType) {
					case "Dealer_Parts_Admin":
						console.log("Dealer Parts");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllParts");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
						break;
					case "Dealer_Parts_Services_Admin":
						console.log("Dealer service part");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllWarrantyParts");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
						break;
					case "Dealer_Services_Admin":
						console.log("Dealer_Services_Admin");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllServices");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
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
						/*Uncomment for security*/
						break;
					case "TCI_Admin":
						console.log("TCI_Admin");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyViewAll");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						that.getOwnerComponent().getModel("LocalDataModel").setProperty("/visibleNewBtn", false);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
						break;
					case "TCI_User":
						console.log("TCI_User");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyCoverageClaim");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", false);

						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						that.getOwnerComponent().getRouter().navTo("QueryCoverageTools");
						/*Uncomment for security*/
						break;
					case "Zone_User":
						console.log("Zone_User");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyViewAll");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						that.getOwnerComponent().getModel("LocalDataModel").setProperty("/visibleNewBtn", false);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						// /*Uncomment for security*/
						break;
					case "Dealer_Services_Manager":
						console.log("Dealer_Services_Manager");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllShowAuthorization");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
						break;
					default:
						// console.log("Dealer_Services_Manager");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllShowAuthorization");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
					}
					// console.log(sap.ui.getCore().getModel("UserDataModel"));
				}
			});

			// get the attributes and BP Details - Minakshi to confirm if BP details needed	
			$.ajax({
				url: this.sPrefix + this.attributeUrl,
				type: "GET",
				dataType: "json",

				success: function (oData) {
					var BpDealer = [];
					var userAttributes = [];

					that.getModel("LocalDataModel").setProperty("/LoginId", oData.userProfile.id);

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

				}.bind(this),
				error: function (response) {
					sap.ui.core.BusyIndicator.hide();
				}
			}).done(function (data, textStatus, jqXHR) {
				that.getModel("LocalDataModel").setProperty("/currentIssueDealer", data.attributes[0].BusinessPartnerKey);
				var issueDealer = that.getModel("LocalDataModel").getProperty("/currentIssueDealer");
				var sSelectedLocale;
				//  get the locale to determine the language.
				var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
				if (isLocaleSent) {
					sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
				} else {
					sSelectedLocale = "en"; // default is english
				}

				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddTHH:mm:ss"
				});
				var andFilter = [];
				//var sQueryDate = this.getView().byId("DRS2").getValue();
				var FromDate = that.getView().getModel("DateModel").getProperty("/dateValueDRS2");
				var ToDate = that.getView().getModel("DateModel").getProperty("/secondDateValueDRS2");
				var FromDateFormat = oDateFormat.format(FromDate);
				var ToDateFormat = oDateFormat.format(ToDate);
				// console.log(FromDateFormat, ToDateFormat);
				var sDate = "";
				var oResult = [];

				// var oProssingModel = that.getModel("ProssingModel");
				// oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
				// 	urlParameters: {
				// 		"$filter": "Partner eq '" + issueDealer + "'and ReferenceDate ge datetime'" + FromDateFormat +
				// 			"'and ReferenceDate le datetime'" + ToDateFormat +
				// 			"'"
				// 	},
				// 	success: $.proxy(function (data) {
				// 		that.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
				// 	}, that)

				// });

				var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				oRouter.attachRouteMatched(that._onObjectMatched, that);
			});

			var oDateModel = new sap.ui.model.json.JSONModel();
			var PriorDate = new Date();
			oDateModel.setData({
				dateValueDRS2: new Date(new Date().setDate(PriorDate.getDate() - 30)),
				secondDateValueDRS2: PriorDate,
				dateCurrent: new Date(),
				tableBusyIndicator: false,
				prevBtnVsbl: false,
				nextBtnVsbl: false
			});
			this.getView().setModel(oDateModel, "DateModel");
			var oBusinessModel = this.getModel("ApiBusinessModel");
			this.getView().setModel(oBusinessModel, "OBusinessModel");
			//console.log(sap.ui.getCore().getConfiguration().getLanguage());
			this.getView().setModel(this.getModel("ProssingModel"));
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimGroup;
			//var oClaimGroupdata;
			var oClaimGroupObj = [];

			oClaimModel.read("/zc_claim_groupSet", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
				},
				success: $.proxy(function (data) {
					var oClaimData = data.results;
				
					var elements = oClaimData.reduce(function (previous, current) {

						var object = previous.filter(object => object.ClaimGroupDes === current.ClaimGroupDes);
						if (object.length == 0) {
							previous.push(current);
						}
						return previous;
					}, []);

					if (sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope") == "ManageAllParts") {
						oClaimGroup = elements.filter(function (val) {
							return val.ClaimGroup == "SCR" || val.ClaimGroup == "SSM" || val.ClaimGroup == "PWD" || val.ClaimGroup == "PMP";
						});
					} else if (sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope") == "ManageAllServices" || sap.ui.getCore().getModel(
							"UserDataModel").getProperty("/UserScope") == "ManageAllShowAuthorization") {
						oClaimGroup = elements.filter(function (val) {
							return val.ClaimGroup == "STR" || val.ClaimGroup == "WTY" || val.ClaimGroup == "CRC" || val.ClaimGroup == "VLC" || val.ClaimGroup ==
								"ECP" ||
								val.ClaimGroup == "FAC";
						});
					} else if (sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope") == "ManageAllWarrantyParts") {
						oClaimGroup = elements.filter(function (val) {
							return val.ClaimGroup == "SCR" || val.ClaimGroup == "SSM" || val.ClaimGroup == "PWD" || val.ClaimGroup == "STR" || val.ClaimGroup ==
								"WTY" || val.ClaimGroup == "CRC" || val.ClaimGroup == "VLC" || val.ClaimGroup ==
								"ECP" || val.ClaimGroup == "PMP" ||
								val.ClaimGroup == "FAC";
						});
					} else {
						oClaimGroup = elements;
					}
					this.getModel("LocalDataModel").setProperty("/oClaimGroupsDataResult", oClaimGroup);

					//this.getModel("LocalDataModel").setProperty("/oClaimGroupData", elements);

				}, this)

			});

			var oRowCount = {
				rowCount: 0
			};

			this.getView().setModel(new sap.ui.model.json.JSONModel(oRowCount), "RowCountModel");

			oClaimModel.read("/ZC_CLAIM_STATUS_DESC", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/OModelClaimGroupStatus", data.results);
				}, this)
			});
			// for sorting table
			this._mViewSettingsDialogs = {};

			this.getModel("LocalDataModel").setProperty("/oSelectedStatusKeys", ["ZTIC", "ZTMR", "ZTRC"]);

		},

		_onObjectMatched: function (oEvent) {

			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}

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
			var issueDealer = this.getModel("LocalDataModel").getProperty("/currentIssueDealer");
			var oProssingModel = this.getModel("ProssingModel");
			// 			oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
			// 				urlParameters: {
			// 					"$filter": "Partner eq '" + issueDealer + "'and ReferenceDate ge datetime'" + FromDateFormat +
			// 						"'and ReferenceDate le datetime'" + ToDateFormat +
			// 						"'"
			// 				},
			// 				success: $.proxy(function (data) {
			// 					this.getView().getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
			// 				}, this)

			// 			});

		},

		onAfterRendering: function () {

		},
		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				this.getView().addDependent(oDialog);
			}

			return oDialog;
		},

		handleSortButtonPressed: function () {
			this.createViewSettingsDialog("zclaimProcessing.view.fragments.SortOrder").open();
		},
		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("idClaimTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		fnOnSelectDealer: function (oEvent) {
			var ogetAdditionalText = oEvent.getParameters().selectedItem.getAdditionalText();
			var ogetDealer = this.getView().byId("idDealerCode").getValue();
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/DealerText", ogetDealer);
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/AdditionalText", ogetAdditionalText);
		},
		onSelectGroup: function (oEvent) {
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oText = oEvent.getParameters().selectedItem.getKey();

			var oProssingModel = this.getModel("ProssingModel");
			oProssingModel.read("/zc_claim_groupSet", {
				urlParameters: {
					"$filter": "ClaimGroup eq '" + oText + "'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/oClaimTypeData", data.results);

				}, this)
			});
		},

		onAddPartsComment: function (oEvent) {
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.ClaimComments", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
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
		onPressSearch: function () {
			this.getView().getModel("LocalDataModel").setProperty("/oVisibleRowTR", 30);
			this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", true);
			var oResultArray = [];
			//this.getView().getModel("ProssingModel").setSizeLimit(1000);
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
			var oResult;
			var sResults = [];

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
					//oResult.push(sQueryStat[j]);
					sResults.push("DecisionCode eq '" + sQueryStat[j] + "'");

				}
				oResult = sResults.join(" or ");
			}

			if (sQueryDate != "" && sQueryDealer != "" && sQueryClaimGroup == "" && sQuerySearchText == "" && sQueryClaimType == "" &&
				sQueryStat == "") {
				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and " + sDate + " le datetime'" + ToDateFormat +
							"' and Partner eq '" + sQueryDealer + "'"
					},
					success: $.proxy(function (data) {
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
					}, this)
				});

			} else if (sQueryDate != "" && sQueryDealer != "" && sQueryClaimGroup == "" && sQuerySearchText != "" && sQueryClaimType == "" &&
				sQueryStat == "") {
				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and " + sDate + " le datetime'" + ToDateFormat +
							"' and Partner eq '" + sQueryDealer + "' and " + sQuerySearchBy + " eq '" + sQuerySearchText + "'"
					},
					success: $.proxy(function (data) {
						// 		data.results.map(function(item){
						// 		    item.RepairDate = item.RepairDate.toISOString();
						// 		});
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
						//	this.getModel("LocalDataModel").setProperty("/HeadSet", data.results);
					}, this)
				});

			} else if (sQuerySearchText != "" && sQueryClaimType != "" && sQueryClaimGroup != "" && sQueryDate != "" && sQueryDealer != "" &&
				sQueryStat == "") {

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and " + sDate + " le datetime'" + ToDateFormat +
							"'and Partner eq '" + sQueryDealer + "' and WarrantyClaimType eq '" + sQueryClaimType + "'and " + sQuerySearchBy + " eq '" +
							sQuerySearchText + "'"
					},
					success: $.proxy(function (data) {
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
					}, this)
				});
			} else if (sQueryClaimType != "" && sQueryDate != "" && sQueryClaimGroup != "" && sQueryDealer != "" && sQueryStat == "" &&
				sQuerySearchText == "") {

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and " + sDate + " le datetime'" + ToDateFormat +
							"'and Partner eq '" + sQueryDealer + "' and WarrantyClaimType eq '" + sQueryClaimType + "'"
					},
					success: $.proxy(function (data) {
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
					}, this)
				});
			} else if (sQueryStat != "" && sQueryClaimType != "" && sQueryClaimGroup != "" && sQueryDate != "" && sQueryDealer != "" &&
				sQuerySearchText == "") {

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and " + sDate + " le datetime'" + ToDateFormat +
							"'and Partner eq '" + sQueryDealer + "' and WarrantyClaimType eq '" + sQueryClaimType + "'and (" + oResult + ")"
					},
					success: $.proxy(function (data) {
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
					}, this)
				});
			} else if (sQueryStat != "" && sQueryClaimType == "" && sQueryClaimGroup != "" && sQueryDate != "" && sQueryDealer != "" &&
				sQuerySearchText != "") {

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and " + sDate + " le datetime'" + ToDateFormat +
							"'and Partner eq '" + sQueryDealer + "'and  ClaimGroup eq '" + sQueryClaimGroup + "'and " + sQuerySearchBy + " eq '" +
							sQuerySearchText + "'and (" + oResult + ")"
					},
					success: $.proxy(function (data) {
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
					}, this)
				});
			} else if (sQueryStat == "" && sQueryClaimType == "" && sQueryClaimGroup != "" && sQueryDate != "" && sQueryDealer != "" &&
				sQuerySearchText != "") {

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and " + sDate + " le datetime'" + ToDateFormat +
							"'and Partner eq '" + sQueryDealer + "'and  ClaimGroup eq '" + sQueryClaimGroup + "'and " + sQuerySearchBy + " eq '" +
							sQuerySearchText + "'"
					},
					success: $.proxy(function (data) {
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
					}, this)
				});
			} else if (sQueryStat != "" && sQuerySearchText != "" && sQueryDate != "" && sQueryClaimGroup == "" && sQueryDealer != "" &&
				sQueryClaimType == "") {

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and " + sDate + " le datetime'" + ToDateFormat +
							"'and Partner eq '" + sQueryDealer + "'and " + sQuerySearchBy + " eq '" + sQuerySearchText + "'and (" + oResult + ")"
					},
					success: $.proxy(function (data) {
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
					}, this)
				});
			} else if (sQueryStat != "" && sQuerySearchText == "" && sQueryDate != "" && sQueryClaimGroup != "" && sQueryDealer != "" &&
				sQueryClaimType == "") {

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and " + sDate + " le datetime'" + ToDateFormat +
							"'and Partner eq '" + sQueryDealer + "' and  ClaimGroup eq '" + sQueryClaimGroup + "'and (" + oResult + ")"
					},
					success: $.proxy(function (data) {
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
					}, this)
				});
			} else if (sQueryStat != "" && sQueryDate != "" && sQueryDealer != "" && sQueryClaimGroup == "" && sQueryClaimType == "" &&
				sQuerySearchText == "") {

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and " + sDate + " le datetime'" + ToDateFormat +
							"'and Partner eq '" + sQueryDealer + "' and (" + oResult + ")"
					},
					success: $.proxy(function (data) {
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
					}, this)
				});
			} else if (sQueryDate != "" && sQueryDealer != "" && sQuerySearchText != "" && sQueryClaimGroup != "" && sQueryClaimType != "" &&
				sQueryStat != "") {

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and WarrantyClaimType eq '" + sQueryClaimType + "'and " + sDate + " le datetime'" + ToDateFormat +
							"'and Partner eq '" + sQueryDealer + "' and " + sQuerySearchBy + " eq '" + sQuerySearchText + "'and (" + oResult + ")"
					},
					success: $.proxy(function (data) {
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
					}, this)
				});
			} else if (sQueryDate != "" && sQueryDealer != "" && sQueryClaimGroup != "" && sQuerySearchText == "" && sQueryClaimType == "" &&
				sQueryStat == "") {

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
							"'and " + sDate + " le datetime'" + ToDateFormat +
							"'and Partner eq '" + sQueryDealer + "' and  ClaimGroup eq '" + sQueryClaimGroup + "'"
					},
					success: $.proxy(function (data) {
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
						this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
					}, this)
				});

			}

		},

		handleDealerLabourInq: function (oEvent) {
			var sDivision;
			var oDialog;
			var selectedKey = this.getView().byId("idDealerCode").getSelectedKey();
			//  get the locale to determine the language.
			var isDivision = window.location.search.match(/Division=([^&]*)/i);
			if (isDivision) {
				sDivision = window.location.search.match(/Division=([^&]*)/i)[1];
			} else {
				sDivision = "10"; // default is english
			}

			// 			this.getDealer();

			var oProssingModel = this.getModel("ProssingModel");
			oProssingModel.read("/zc_labour_rateSet(Partner='" + selectedKey + "',Division='" + sDivision +
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

		onPressClear: function () {

			var andFilter = [];

			var oTable = this.getView().byId("idClaimTable");
			var oBindItems = oTable.getBinding("items");
			oBindItems.filter(andFilter);

			this.getView().getModel("RowCountModel").setProperty("/rowCount", 0);

			this.getView().byId("idSearchText").setValue("");
			this.getView().byId("idClaimGroup").setSelectedKey("");
			this.getView().byId("idClaimType").setSelectedKey("");
			this.getView().byId("idClaimStatus").setSelectedItems("");
			this.getView().byId("idSearchBy").setSelectedKey("");
			this.getView().getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", "");

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
					if (oClaimType == "ZPDC" || oClaimType == "ZPMS" || oClaimType == "ZPPD" || oClaimType == "ZPTS") {
						this.getOwnerComponent().getRouter().navTo("PartsMainSection", {
							claimNum: oClaimNum,
							oKey: oClaimType,
							oClaimGroup: this.oSelectedClaimGroup,
							oClaimNav: "Details"

						});
					}else if (oClaimType == "ZSPM") {
						this.getOwnerComponent().getRouter().navTo("PMPMainSection", {
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