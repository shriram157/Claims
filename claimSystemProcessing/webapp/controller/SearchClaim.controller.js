sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	"sap/ui/core/ValueState",
	"sap/ui/model/Sorter",
	"sap/m/ViewSettingsDialog",
	"sap/m/ViewSettingsItem",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	'sap/m/MessageToast'
], function (BaseController, ValueState, Sorter, ViewSettingsDialog, ViewSettingsItem, Export, ExportTypeCSV, MessageToast) {
	"use strict";
	return BaseController.extend("zclaimProcessing.controller.SearchClaim", {
		onInit: function () {
			this.getModel("LocalDataModel").setProperty("/oVisibleRowTR", 0);
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
			this.getUser();

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
				nextBtnVsbl: false,
				FinalProcessFrom: null,
				FinalProcessTo: null
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

			this.getModel("LocalDataModel").setProperty("/oSelectedStatusKeys", ["ZTRC", "ZTIC", "ZTMR"]);

		},

		_onObjectMatched: function (oEvent) {

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
		},
		handleSortButtonPressed: function () {
			this._sortDialogPopUp();
		},
		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("idClaimTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				oSorter,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;

			if (sPath == "ClaimAmountSum") {
				oSorter = new Sorter(sPath, bDescending);
				oSorter.fnCompare = function (a, b) {
					return a - b;
				};
			} else {
				oSorter = new Sorter(sPath, bDescending);
			}

			aSorters.push(oSorter);

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
		//Changes done on 02/03/2021 by singhmi start

		onChangeSubDate: function (oEvent) {
			var DefaultToDate = new Date();
			var DefaulFromDate = new Date(new Date().setDate(DefaultToDate.getDate() - 30));
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			if (this.getView().getModel("DateModel").getProperty("/dateValueDRS2") != null && this.getView().getModel("DateModel").getProperty(
					"/secondDateValueDRS2") != null && this.getView().byId("idSearchText").getValue() == "") {

				var FinalSubFromFormated = moment(this.getView().getModel("DateModel").getProperty("/dateValueDRS2"), "YYYY-MM-DD");
				var FinalSubToFormated = moment(this.getView().getModel("DateModel").getProperty("/secondDateValueDRS2"), "YYYY-MM-DD");
				var DifferInDay = Math.round(moment.duration(FinalSubToFormated.diff(FinalSubFromFormated)).asDays());
				if (DifferInDay > 90) {
					MessageToast.show(oBundle.getText("seach90days"));
					this.getView().getModel("DateModel").setProperty("/dateValueDRS2", DefaulFromDate);
					this.getView().getModel("DateModel").setProperty("/secondDateValueDRS2", DefaultToDate);
				}
			}
		},
		onChangeFinalToDate: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			if (this.getView().getModel("DateModel").getProperty("/FinalProcessFrom") != null && this.getView().getModel("DateModel").getProperty(
					"/FinalProcessTo") != null) {

				var FinalProFromFormated = moment(this.getView().getModel("DateModel").getProperty("/FinalProcessFrom"), "YYYY-MM-DD");
				var FinalProToFormated = moment(this.getView().getModel("DateModel").getProperty("/FinalProcessTo"), "YYYY-MM-DD");
				var DifferInDay = Math.round(moment.duration(FinalProToFormated.diff(FinalProFromFormated)).asDays());
				if (DifferInDay > 90) {
					MessageToast.show(oBundle.getText("seach90days"));
					this.getView().getModel("DateModel").setProperty("/FinalProcessFrom", null);
					this.getView().getModel("DateModel").setProperty("/FinalProcessTo", null);
				}
			}
		},
		//Changes done on 02/03/2021 by singhmi end

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

			var FinalProFrom = this.getView().getModel("DateModel").getProperty("/FinalProcessFrom");
			var FinalProTo = this.getView().getModel("DateModel").getProperty("/FinalProcessTo");

			var FinalProFromFormat, FinalProToFormat;

			if (FinalProFrom != null && FinalProTo != null) {
				FinalProFromFormat = oDateFormat.format(FinalProFrom);
				FinalProToFormat = oDateFormat.format(FinalProTo);
			}
			//Changes done on 02/03/2021 by singhmi start
			if (FromDate != null && ToDate != null) {
				this.getView().byId("DRS2").setValueState("None");
				this.getView().byId("DRS3").setValueState("None");
				var FromDateFormat = oDateFormat.format(FromDate);
				var ToDateFormat = oDateFormat.format(ToDate);
			} else {
				this.getView().byId("DRS2").setValueState("Error");
				this.getView().byId("DRS3").setValueState("Error");
				this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
			}
			//Changes done on 02/03/2021 by singhmi end

			// console.log(FromDateFormat, ToDateFormat);
			var sDate = "";
			var oResult;
			var sResults = [];
			var sParam;

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
				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and " + sDate + " le datetime'" + ToDateFormat +
						"' and Partner eq '" + sQueryDealer + "'"
				}

			} else if (sQueryDate != "" && sQueryDealer != "" && sQueryClaimGroup == "" && sQuerySearchText != "" && sQueryClaimType == "" &&
				sQueryStat == "") {
				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and " + sDate + " le datetime'" + ToDateFormat +
						"' and Partner eq '" + sQueryDealer + "' and " + sQuerySearchBy + " eq '" + sQuerySearchText + "'"
				}

			} else if (sQuerySearchText != "" && sQueryClaimType != "" && sQueryClaimGroup != "" && sQueryDate != "" && sQueryDealer != "" &&
				sQueryStat == "") {

				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and " + sDate + " le datetime'" + ToDateFormat +
						"'and Partner eq '" + sQueryDealer + "' and WarrantyClaimType eq '" + sQueryClaimType + "'and " + sQuerySearchBy + " eq '" +
						sQuerySearchText + "'"
				}
			} else if (sQueryClaimType != "" && sQueryDate != "" && sQueryClaimGroup != "" && sQueryDealer != "" && sQueryStat == "" &&
				sQuerySearchText == "") {

				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and " + sDate + " le datetime'" + ToDateFormat +
						"'and Partner eq '" + sQueryDealer + "' and WarrantyClaimType eq '" + sQueryClaimType + "'"
				}
			} else if (sQueryStat != "" && sQueryClaimType != "" && sQueryClaimGroup != "" && sQueryDate != "" && sQueryDealer != "" &&
				sQuerySearchText == "") {

				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and " + sDate + " le datetime'" + ToDateFormat +
						"'and Partner eq '" + sQueryDealer + "' and WarrantyClaimType eq '" + sQueryClaimType + "'and (" + oResult + ")"
				}

			} else if (sQueryStat != "" && sQueryClaimType == "" && sQueryClaimGroup != "" && sQueryDate != "" && sQueryDealer != "" &&
				sQuerySearchText != "") {

				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and " + sDate + " le datetime'" + ToDateFormat +
						"'and Partner eq '" + sQueryDealer + "'and  ClaimGroup eq '" + sQueryClaimGroup + "'and " + sQuerySearchBy + " eq '" +
						sQuerySearchText + "'and (" + oResult + ")"
				}
			} else if (sQueryStat == "" && sQueryClaimType == "" && sQueryClaimGroup != "" && sQueryDate != "" && sQueryDealer != "" &&
				sQuerySearchText != "") {
				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and " + sDate + " le datetime'" + ToDateFormat +
						"'and Partner eq '" + sQueryDealer + "'and  ClaimGroup eq '" + sQueryClaimGroup + "'and " + sQuerySearchBy + " eq '" +
						sQuerySearchText + "'"
				}
			} else if (sQueryStat != "" && sQuerySearchText != "" && sQueryDate != "" && sQueryClaimGroup == "" && sQueryDealer != "" &&
				sQueryClaimType == "") {

				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and " + sDate + " le datetime'" + ToDateFormat +
						"'and Partner eq '" + sQueryDealer + "'and " + sQuerySearchBy + " eq '" + sQuerySearchText + "'and (" + oResult + ")"
				}

			} else if (sQueryStat != "" && sQuerySearchText == "" && sQueryDate != "" && sQueryClaimGroup != "" && sQueryDealer != "" &&
				sQueryClaimType == "") {

				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and " + sDate + " le datetime'" + ToDateFormat +
						"'and Partner eq '" + sQueryDealer + "' and  ClaimGroup eq '" + sQueryClaimGroup + "'and (" + oResult + ")"
				}
			} else if (sQueryStat != "" && sQueryDate != "" && sQueryDealer != "" && sQueryClaimGroup == "" && sQueryClaimType == "" &&
				sQuerySearchText == "") {

				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and " + sDate + " le datetime'" + ToDateFormat +
						"'and Partner eq '" + sQueryDealer + "' and (" + oResult + ")"
				}
			} else if (sQueryDate != "" && sQueryDealer != "" && sQuerySearchText != "" && sQueryClaimGroup != "" && sQueryClaimType != "" &&
				sQueryStat != "") {

				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and WarrantyClaimType eq '" + sQueryClaimType + "'and " + sDate + " le datetime'" + ToDateFormat +
						"'and Partner eq '" + sQueryDealer + "' and " + sQuerySearchBy + " eq '" + sQuerySearchText + "'and (" + oResult + ")"
				}
			} else if (sQueryDate != "" && sQueryDealer != "" && sQueryClaimGroup != "" && sQuerySearchText == "" && sQueryClaimType == "" &&
				sQueryStat == "") {

				sParam = {
					"$filter": "" + sDate + " ge datetime'" + FromDateFormat +
						"'and " + sDate + " le datetime'" + ToDateFormat +
						"'and Partner eq '" + sQueryDealer + "' and  ClaimGroup eq '" + sQueryClaimGroup + "'"
				}

			}

			if (FinalProFrom != null && FinalProTo != null) {
				sParam = {
					"$filter": sParam.$filter + "and FinalProcdDate ge datetime'" + FinalProFromFormat +
						"'and FinalProcdDate le datetime'" + FinalProToFormat + "' "
				}
			}
			// Phase2 changes for Claim Group multiple filter values start 18/02/2021 singhmi
			var sgroupSet = [];
			var sgroupdependingonuser;
			if ($.isEmptyObject(sQueryClaimGroup)) {
				for (var s = 0; s < this.getModel("LocalDataModel").getProperty("/oClaimGroupsDataResult").length; s++) {
					//oResult.push(sQueryStat[j]);
					sgroupSet.push("ClaimGroup eq '" + this.getModel("LocalDataModel").getProperty("/oClaimGroupsDataResult")[s].ClaimGroup +
						"'");

				}
				sgroupdependingonuser = sgroupSet.reverse().join(" or ");
				sParam = {
					"$filter": sParam.$filter + "and (" + sgroupdependingonuser + ")"
				}

			}
			// Phase2 changes for Claim Group multiple filter values end 18/02/2021 singhmi

			oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
				urlParameters: sParam,
				success: $.proxy(function (data) {
					this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
					this.getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", data.results);
				}, this),
				error: $.proxy(function () {
					this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
				}, this)
			});

		},

		handleDealerLabourInq: function (oEvent) {

			var oDialog;
			var selectedKey = this.getView().byId("idDealerCode").getSelectedKey();

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
			this.getView().getModel("LocalDataModel").setProperty("/ZcClaimHeadNewData", []);

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
					//var oClaimGroup = sdata.results[0].WarrantyClaimGroupDes;
					var claimTypeGroup = sdata.results[0].ClaimGroup;

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
							oClaimNav: "Details",
							claimTypeGroup: claimTypeGroup

						});
					} else if (oClaimType == "ZSPM") {
						this.getOwnerComponent().getRouter().navTo("PMPMainSection", {
							claimNum: oClaimNum,
							oKey: oClaimType,
							oClaimGroup: this.oSelectedClaimGroup,
							oClaimNav: "Details",
							claimTypeGroup: claimTypeGroup

						});
					} else {
						this.getOwnerComponent().getRouter().navTo("MainClaimSection", {
							claimNum: oClaimNum,
							oKey: oClaimType,
							oClaimGroup: this.oSelectedClaimGroup,
							oClaimNav: "Details",
							claimTypeGroup: claimTypeGroup

						});
					}

				}, this)
			});

			// setTimeout(function(){ 
			// 	$("html, body").animate({ scrollTop: 0 }, "slow");
			// 		scroll(0,0);
			// }, 3000);
		},
		onCreateNewClaim: function () {
			this.getRouter().navTo("NewClaimSelectGroup");

		},

		onTableExport: function (oEvent) {
			var that = this;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oExport = new sap.ui.core.util.Export({

				exportType: new sap.ui.core.util.ExportTypeCSV({

					separatorChar: "\t",

					mimeType: "application/vnd.ms-excel",

					charset: "utf-8",

					fileExtension: "xls"

				}),

				models: this.getOwnerComponent().getModel("LocalDataModel"),

				rows: {

					path: "/ZcClaimHeadNewData"

				},

				columns: [

					{

						name: oBundle.getText("TCIClaim"),

						template: {

							content: "{NumberOfWarrantyClaim}"

						}

					}, {

						name: oBundle.getText("DealerClaim"),

						template: {

							content: "{ExternalNumberOfClaim}"

						}

					}, {

						name: oBundle.getText("RepairOrder"),

						template: {

							content: "{RepairOrderNumberExternal}"

						}

					}, {

						name: oBundle.getText("RepairOrderDate"),

						template: {

							content: "{path:'RepairDate', formatter:'zclaimProcessing.utils.formatter.fnDateFormat'}"

						}

					}, {

						name: oBundle.getText("ClaimSubmissionDate"),

						template: {

							content: "{path:'ReferenceDate', formatter:'zclaimProcessing.utils.formatter.fnDateFormat'}"

						}

					}, {

						name: oBundle.getText("ClaimType"),

						template: {

							content: "{WarrantyClaimType}"

						}

					}, {

						name: oBundle.getText("VIN"),

						template: {

							content: "{ExternalObjectNumber}"

						}

					}, {

						name: oBundle.getText("ClaimStatus"),

						template: {

							content: "{DecisionCode}"

						}

					}, {

						name: oBundle.getText("OFP"),

						template: {

							content: "{OFP}"

						}

					}, {

						name: oBundle.getText("MainOpCode"),

						template: {

							content: "{MainOpsCode}"

						}

					}, {

						name: oBundle.getText("ClaimAge"),

						template: {

							content: "{ClaimAge}"

						}

					}, {

						name: oBundle.getText("ClaimAmount"),

						template: {

							content: "{ClaimAmountSum}"

						}

					}, {

						name: oBundle.getText("AuthorizationNumber"),

						template: {

							content: "{AuthorizationNumber}"

						}

					}, {

						name: oBundle.getText("FinalProcessedDate"),

						template: {

							content: "{path:'FinalProcdDate', formatter:'zclaimProcessing.utils.formatter.fnDateFormat'}"

						}

					}, {

						name: oBundle.getText("Odometer"),

						template: {

							content: "{Odometer}"

						}

					}, {

						name: oBundle.getText("Parts"),

						template: {

							content: "{PartPrice}"

						}

					}, {

						name: oBundle.getText("Labour"),

						template: {

							content: "{LabourPrice}"

						}

					}, {

						name: oBundle.getText("Sublet"),

						template: {

							content: "{SubletPrice}"

						}

					}
				]
			});

			//* download exported file

			oExport.saveFile().always(function () {

				this.destroy();

			});
		},

	});

});