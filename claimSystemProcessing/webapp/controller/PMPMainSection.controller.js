sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/ValueState",
	"zclaimProcessing/utils/Validator",
	'sap/ui/model/Filter',
	"sap/m/Dialog",
	"sap/m/Button",
	'sap/m/Label',
	'sap/m/Text',
	"zclaimProcessing/control/DistanceMatrix"

], function (BaseController, MessageToast, DateFormat, ValueState, Validator, Filter, Dialog, Button, Label, Text, DistanceMatrix) {
	"use strict";

	var oCurrentDt = new Date();

	return BaseController.extend("zclaimProcessing.controller.PMPMainSection", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.PMPMainSection
		 */

		onInit: function () {

			// 			var oCtrl = new SearchAddressInput({
			// 				GoogleAPI: "AIzaSyAz7irkOJQ4ydE2dHYrg868QV5jUQ-5FaY"
			// 			});

			// 			this.getView().byId("idAddressAuto").addItem(oCtrl);

			this.getOnlyDealer();
			this.setModel(this.getModel("ProssingModel"));
			this.setModel(this.getModel("ProductMaster"), "ProductMasterModel");
			var partData = new sap.ui.model.json.JSONModel({
				"matnr": "",
				"quant": "",
				"PartDescription": "",
				"PartManufacturer": "",
				"PartType": ""
			});

			partData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(partData, "PartDataModel");
			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRoutMatched, this);
			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");
			oClaimModel.read("/zc_company_detailSet", {
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/company_detailSet", data.results);
				}, this),
				error: function (err) {
					console.log(err);
				}
			});

			var jsonTemplate = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("zclaimProcessing/utils", "/Nodes.json"));
			// 			jsonTemplate.attachRequestCompleted($.proxy(function (oEvent) {
			// 				var ModelNEW = oEvent.getSource().getData();
			// 				var unionArr = [];
			// 				var unionSet = [];

			// 				this.getModel("LocalDataModel").setProperty("/cities", ModelNEW);
			// 				this.getModel("LocalDataModel").setProperty("/itemList", ModelNEW);
			// 				for (var i in ModelNEW) {

			// 					if (unionArr.indexOf(ModelNEW[i].admin) == -1) {
			// 						unionArr.push(ModelNEW[i].admin);
			// 						console.log(unionArr);
			// 					}

			// 				}

			// 				for (var j in unionArr) {
			// 					unionSet.push({
			// 						"admin": unionArr[j]
			// 					});
			// 				}

			// 				this.getModel("LocalDataModel").setProperty("/ProviceSet", unionSet);

			// 			}, this));
			// 			console.log(jsonTemplate);
			// 			this.getView().setModel(jsonTemplate, "CityModel");
			// 			this.getView().getModel("CityModel").setSizeLimit(6000);

			sap.ui.getCore().attachValidationError(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.Error);
			});
			sap.ui.getCore().attachValidationSuccess(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.None);
			});

		},
		_onRoutMatched: function (oEvent) {
			var oValidator = new Validator();
			oValidator.validate("");
			var HeadSetData = new sap.ui.model.json.JSONModel();
			HeadSetData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(HeadSetData, "HeadSetData");
			var oDateModel = new sap.ui.model.json.JSONModel();
			this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
			this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
			this.getModel("LocalDataModel").setProperty("/step01Next", false);
			this.getModel("LocalDataModel").setProperty("/enableEnterComment", false);
			this.getModel("LocalDataModel").setProperty("/FeedEnabled", false);
			this.getModel("LocalDataModel").setProperty("/commentIndicator", false);

			this.obj = {
				"DBOperation": "",
				"Message": "",
				"WarrantyClaimType": "",
				"Partner": "",
				"PartnerRole": "",
				"ReferenceDate": null,
				"DateOfApplication": null,
				"FinalProcdDate": null,
				"RepairDate": null,
				"RepairOrderNumberExternal": "",
				"ExternalNumberOfClaim": "",
				"ExternalObjectNumber": "",
				"Odometer": "",
				"TCIWaybillNumber": "",
				"NameOfPersonRespWhoChangedObj": "",
				"ShipmentReceivedDate": null,
				"DealerContact": "",
				"HeadText": "",
				"OFP": "",
				"WTYClaimRecoverySource": "",
				"MainOpsCode": "",
				"T1WarrantyCodes": "",
				"BatteryTestCode": "",
				"T2WarrantyCodes": "",
				"FieldActionReference": "",
				"ZCondition": "",
				"Cause": "",
				"Remedy": "",
				"PreviousROInvoiceDate": null,
				"PreviousROOdometer": "",
				"PreviousROInvoice": "",
				"AccessoryInstallOdometer": "",
				"AccessoryInstallDate": null,
				"AgreementNumber": "",
				"CustomerPostalCode": "",
				"CustomerFullName": "",
				"ProbillNum": "",
				"Delivery": "",
				"DeliveryDate": null,
				"DeliveringCarrier": "",
				"WarrantyClaimSubType": "",
				"DeliveryType": "",
				"DealerInvoice": "",
				"DealerInvoiceDate": null,
				"DealerRO": "",
				"CompetitorName": "",
				"CompetitorAddr": "",
				"CompetitorCity": "",
				"CompetitorProv": "",
				"CompetitorPost": "",
				"QuoteDate": "",
				"PartManufacturer": "",
				"PartType": "",
				"zc_itemSet": {
					"results": []
				},

				"zc_claim_item_price_dataSet": {
					"results": []
				},

				"zc_claim_attachmentsSet": {
					"results": []
				},
				"zc_claim_commentSet": {
					"results": []
				},
				"zc_claim_vsrSet": {
					"results": []
				}
			};

			oDateModel.setData({
				Parts: true,
				lableVisible: false,
				partLine: false,
				editablePartNumber: true,
				SuggestBtn: false,
				saveClaimSt: true,
				updateClaimSt: false,
				SaveClaim07: true,
				claimTypeEn: true,
				oFormEdit: true,
				claimEditSt: false,
				oztac: false,
				updateEnable: true,
				OdometerReq: true,
				enableTab: false,
				RepairdDetailVisible: true,
				claimTypeState: "None",
				claimTypeState2: "None",
				warrantySubmissionClaim: false,
				oAddPartLine: true,
				oUpdatePartLine: true,
				authHide: true,
				oVisibleURL: "",
				nonVinHide: true,
				errorBusyIndicator: false,
				VisiblePageLine: false,
				CopareDistanceText: "",
				oSlipVisible: false
			});
			this.getView().setModel(oDateModel, "DateModel");

			this.getView().byId("idMainClaimMessage").setProperty("visible", false);

			var oClaim = oEvent.getParameters().arguments.claimNum;
			var oGroupDescription = oEvent.getParameters().arguments.oKey;
			var oProssingModel = this.getModel("ProssingModel");
			var oPMPModel = this.getModel("zDLRCLAIMPMPSRV");

			this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaim);
			// 			var oClaimAuthType = oEvent.getParameters().arguments.oClaimGroup;
			// 			var oClaimTypeDetail = oEvent.getParameters().arguments.oKey;
			// 			var oNavList = oEvent.getParameters().arguments.oClaimNav;

			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
			//this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("MainSection"));
			this.getView().byId("idFilter02").setProperty("enabled", false);
			this.getView().byId("idFilter03").setProperty("enabled", false);
			this.getView().byId("idFilter07").setProperty("enabled", false);
			this.getView().byId("idFilter08").setProperty("enabled", false);

			if (oClaim != "nun" && oClaim != undefined) {
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idFilter07").setProperty("enabled", true);
				this.getView().byId("idFilter08").setProperty("enabled", false);
				this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
				this.getModel("LocalDataModel").setProperty("/step01Next", true);
				this.getModel("LocalDataModel").setProperty("/FeedEnabled", true);

				this.getView().getModel("DateModel").setProperty("/saveClaimSt", false);
				this.getView().getModel("DateModel").setProperty("/updateClaimSt", true);
				oPMPModel.read("/ZC_CLAIM_HEAD_PMP", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'"
					},
					success: $.proxy(function (sdata) {
						// console.log(sdata);
						this.getModel("LocalDataModel").setProperty("/ClaimDetails", sdata.results[0]);

						this.getView().getModel("HeadSetData").setData(sdata.results[0]);
						this._fnStatusCheck();

						// 		if (sdata.results[0].DecisionCode == "ZTAC" || sdata.results[0].DecisionCode == "ZTSM") {
						// 			this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
						// 			this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
						// 			this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
						// 			this.getView().getModel("DateModel").setProperty("/claimEditSt", true);
						// 			this.getView().getModel("DateModel").setProperty("/updateEnable", false);
						// 			this.getModel("LocalDataModel").setProperty("/UploadEnable", false);

						// 		} else {
						// 			this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
						// 			this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
						// 			this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
						// 			this.getView().getModel("DateModel").setProperty("/claimEditSt", true);
						// 			this.getView().getModel("DateModel").setProperty("/updateEnable", true);
						// 			this.getModel("LocalDataModel").setProperty("/UploadEnable", true);

						// 		}

						if (sdata.results[0].DecisionCode == "ZTIC" || sdata.results[0].DecisionCode == "ZTRC") {
							this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", true);
							this.getView().getModel("DateModel").setProperty("/updateEnable", true);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
						} else {
							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", false);

						}

						var oPartner = this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner");

						var oBusinessModel = this.getModel("ApiBusinessModel");
						oBusinessModel.read("/A_BusinessPartner", {
							urlParameters: {
								"$filter": "BusinessPartner eq '" + oPartner + "'"
							},
							success: $.proxy(function (dBp) {
								this.getModel("LocalDataModel").setProperty("/BPOrgName", dBp.results[0].OrganizationBPName1);
							}, this)
						});

						oPMPModel.read("/ZC_HEAD_PMPSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + oClaim +
									"'and LanguageKey eq '" + this.fnReturnLanguage() + "'",
								"$expand": "zc_claim_commentSet,zc_claim_vsrSet"
							},
							success: $.proxy(function (errorData) {
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
								this.getModel("LocalDataModel").setProperty("/oErrorSet", errorData.results[0].zc_claim_vsrSet.results);

								this.getModel("LocalDataModel").setProperty("/claim_commentSet", errorData.results[0].zc_claim_commentSet.results);

							}, this),
							error: $.proxy(function () {
								console.log(err);
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
							}, this)
						});

						oPMPModel.read("/zc_claim_attachmentsSet", {
							urlParameters: {
								// "$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'"
								"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'"
							},
							success: $.proxy(function (odata) {

								var oArr = odata.results;
								var oAttachSet = oArr.map(function (item) {
									item.FileName = item.FileName.replace("HEAD@@@", "");
									return item;

								});
								// this.getView().getModel("ClaimModel").setProperty("/" + "/items", oArr);
								this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", oAttachSet);
							}, this)
						});

						var oCLaim = this.getModel("LocalDataModel").getProperty("/ClaimDetails/NumberOfWarrantyClaim");
						this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", oCLaim);

						oPMPModel.read("/zc_claim_item_price_dataSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
									"'and LanguageKey eq '" + this.fnReturnLanguage() + "' "

							},
							success: $.proxy(function (data) {

								this._fnDistanceCalculate();

								var pricinghData = data.results;
								var oFilteredData = pricinghData.filter(function (val) {
									return val.ItemType === "MAT";
								});

								this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
								var PartItem = oFilteredData.map(function (item) {
									return {
										Type: "PART",
										ItemType: "",
										ControllingItemType: "MAT",
										UnitOfMeasure: item.UnitOfMeasure,
										MaterialNumber: item.matnr,
										PartDescription: item.PartDescription,
										PartQty: item.QtyHrs,
										Posnr: item.posnr,
										"ItemKey": "",
										PartManufacturer: item.PartManufacturer,
										PartType: item.PartType,
										CompetitorPrice: item.CompetitorPrice
									};

								});

								this.obj = {
									"DBOperation": "SAVE",
									"Message": "",
									"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
									"Partner": this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey"),
									"PartnerRole": "AS",
									"ReferenceDate": this._fnDateFormat(oCurrentDt),
									"DateOfApplication": this._fnDateFormat(oCurrentDt),
									"FinalProcdDate": null,
									"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
									"RepairOrderNumberExternal": this.getView().getModel("HeadSetData").getProperty("/RepairOrderNumberExternal"),
									"ExternalNumberOfClaim": this.getView().getModel("HeadSetData").getProperty("/ExternalNumberOfClaim"),
									"ExternalObjectNumber": this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber"),
									"Odometer": this.getView().getModel("HeadSetData").getProperty("/Odometer"),
									"TCIWaybillNumber": "",
									"NameOfPersonRespWhoChangedObj": "",
									"ShipmentReceivedDate": null,
									"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
									"HeadText": "",
									"OFP": "",
									"WTYClaimRecoverySource": "",
									"MainOpsCode": "",
									"T1WarrantyCodes": "",
									"BatteryTestCode": "",
									"T2WarrantyCodes": "",
									"FieldActionReference": "",
									"ZCondition": "",
									"Cause": "",
									"Remedy": "",
									"PreviousROInvoiceDate": null,
									"PreviousROOdometer": "",
									"PreviousROInvoice": "",
									"AccessoryInstallOdometer": "",
									"AccessoryInstallDate": null,
									"AgreementNumber": "",
									"CustomerPostalCode": "",
									"CustomerFullName": this.getView().getModel("HeadSetData").getProperty("/CustomerFullName"),
									"ProbillNum": "",
									"Delivery": "",
									"DeliveryDate": null,
									"DeliveringCarrier": "",
									"WarrantyClaimSubType": "",
									"DeliveryType": "",
									"DealerInvoice": this.getView().getModel("HeadSetData").getProperty("/DealerInvoice"),
									"DealerInvoiceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DealerInvoiceDate")),
									"DealerRO": this.getView().getModel("HeadSetData").getProperty("/DealerRO"),
									"CompetitorName": this.getView().getModel("HeadSetData").getProperty("/CompetitorName"),
									"CompetitorAddr": this.getView().getModel("HeadSetData").getProperty("/CompetitorAddr"),
									"CompetitorCity": this.getView().getModel("HeadSetData").getProperty("/CompetitorCity"),
									"CompetitorProv": this.getView().getModel("HeadSetData").getProperty("/CompetitorProv"),
									"CompetitorPost": this.getView().getModel("HeadSetData").getProperty("/CompetitorPost"),
									"QuoteDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/QuoteDate")),
									"RebateAmount": this.getView().getModel("HeadSetData").getProperty("/RebateAmount"),
									"zc_itemSet": {
										"results": PartItem
									},
									"zc_claim_attachmentsSet": {
										"results": []
									},

									"zc_claim_commentSet": {
										"results": this.getModel("LocalDataModel").getProperty("/claim_commentSet") || []
									},
									"zc_claim_vsrSet": {
										"results": this.getModel("LocalDataModel").getProperty("/oErrorSet") || []
									},
									"zc_claim_item_price_dataSet": {
										"results": pricinghData
									}

								};

							}, this),
							error: function () {}
						});

					}, this),
					error: function (Error) {
						console.log(Error);
					}
				})
			} else {

				this.obj = {
					"DBOperation": "",
					"Message": "",
					"WarrantyClaimType": "",
					"Partner": "",
					"PartnerRole": "",
					"ReferenceDate": null,
					"DateOfApplication": null,
					"FinalProcdDate": null,
					"RepairDate": null,
					"RepairOrderNumberExternal": "",
					"ExternalNumberOfClaim": "",
					"ExternalObjectNumber": "",
					"Odometer": "",
					"TCIWaybillNumber": "",
					"NameOfPersonRespWhoChangedObj": "",
					"ShipmentReceivedDate": null,
					"DealerContact": "",
					"HeadText": "",
					"OFP": "",
					"WTYClaimRecoverySource": "",
					"MainOpsCode": "",
					"T1WarrantyCodes": "",
					"BatteryTestCode": "",
					"T2WarrantyCodes": "",
					"FieldActionReference": "",
					"ZCondition": "",
					"Cause": "",
					"Remedy": "",
					"PreviousROInvoiceDate": null,
					"PreviousROOdometer": "",
					"PreviousROInvoice": "",
					"AccessoryInstallOdometer": "",
					"AccessoryInstallDate": null,
					"AgreementNumber": "",
					"CustomerPostalCode": "",
					"CustomerFullName": "",
					"ProbillNum": "",
					"Delivery": "",
					"DeliveryDate": null,
					"DeliveringCarrier": "",
					"WarrantyClaimSubType": "",
					"DeliveryType": "",
					"DealerInvoice": "",
					"DealerInvoiceDate": null,
					"DealerRO": "",
					"CompetitorName": "",
					"CompetitorAddr": "",
					"CompetitorCity": "",
					"CompetitorProv": "",
					"CompetitorPost": "",
					"QuoteDate": "",
					"PartManufacturer": "",
					"PartType": "",
					"zc_itemSet": {
						"results": []
					},

					"zc_claim_item_price_dataSet": {
						"results": []
					},

					"zc_claim_attachmentsSet": {
						"results": []
					},
					"zc_claim_commentSet": {
						"results": []
					},
					"zc_claim_vsrSet": {
						"results": []
					}
				};

				this.getModel("LocalDataModel").setProperty("/PricingDataModel", "");
				this.getModel("LocalDataModel").setProperty("/ClaimDetails", "");
				this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
				this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
				this.getModel("LocalDataModel").setProperty("/step01Next", false);
				this.getModel("LocalDataModel").setProperty("/CancelEnable", false);

				if (oGroupDescription == "PMP") {
					oProssingModel.read("/zc_claim_groupSet", {
						urlParameters: {
							"$filter": "ClaimGroup eq 'PMP'and LanguageKey eq '" + this.fnReturnLanguage() + "'"
						},
						success: $.proxy(function (data) {
							this.oFilteredData = data.results;
							this.getModel("LocalDataModel").setProperty("/ClaimGroupSet", this.oFilteredData);
							this.getView().getModel("HeadSetData").setProperty("//WarrantyClaimType", data.results[0].TMCClaimType);
						}, this),
						error: function () {
							console.log("Error");
						}
					});

				}
			}

		},

		onUpdateClaim: function (oEvent) {
			this._fnUpdateClaim();
		},

		onCalculateDistance: function (oEvent) {

		},
		onClearAddress: function (oEvent) {

			this.getView().byId("street_number").setValue("");
			this.getView().byId("locality").setValue("");
			this.getView().byId("administrative_area_level_1").setValue("");
			this.getView().byId("autocomplete").setValue("");
			this.getView().byId("postal_code").setValue("");

		},

		_fnStatusCheck: function () {
			var oStatus = this.getView().getModel("HeadSetData").getProperty("/DecisionCode");
			var oClaimModel = this.getModel("ProssingModel");

			oClaimModel.read("/ZC_CLAIM_STATUS_DESC", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + this.fnReturnLanguage() + "'and Status eq '" + oStatus + "'"
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/StatusDes", data.results[0].Description);
				}, this),
				error: function () {

				}
			})

			// 			if (oStatus == "ZTIC") {
			// 				this.getModel("LocalDataModel").setProperty("/StatusDes", "Incomplete");
			// 			} else if (oStatus == "ZTCD") {
			// 				this.getModel("LocalDataModel").setProperty("/StatusDes", "Cancelled by Dealer");
			// 			} else if (oStatus == "ZTRC") {
			// 				this.getModel("LocalDataModel").setProperty("/StatusDes", "Returned to Dealer");
			// 			} else if (oStatus == "ZTSM") {
			// 				this.getModel("LocalDataModel").setProperty("/StatusDes", "Submitted to TCI");
			// 			} else if (oStatus == "ZTAC") {
			// 				this.getModel("LocalDataModel").setProperty("/StatusDes", "Accepted");
			// 			} else if (oStatus == "ZTPD") {
			// 				this.getModel("LocalDataModel").setProperty("/StatusDes", "Paid to Dealer");
			// 			}
		},

		_fnClaimSum: function (e) {
			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");
			oClaimModel.read("/ZC_CLAIM_SUM(p_clmno='" + this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
				"')/Set", {
					success: $.proxy(function (data) {

						this.getModel("LocalDataModel").setProperty("/ClaimSum", data.results);

					}, this)
				});
		},

		fnReturnLanguage: function () {
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			return sSelectedLocale.toUpperCase();
		},

		_fnUpdateClaim: function () {
			// 			var oFinalDistanceNum;
			// 			if (this.getView().byId("postal_code").getValue() != "") {

			// 				var oGetDistance = this.getView().byId("idDist").getContent()[0].getText();
			// 				var oDistanceRemoveComma = oGetDistance.replace(/,/g, '');
			// 				var oDistanceRemoveKM = oDistanceRemoveComma.replace(/km/g, '');
			// 				oFinalDistanceNum = parseInt(oDistanceRemoveKM);
			// 			} else {
			// 				oFinalDistanceNum = "";
			// 			}

			this._fnDistanceCalculate();

			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");

			var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
			var oClmType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oClmSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			var that = this;
			var oView = this.getView();
			// 			var aInputs;
			var aInputsArr = [
				oView.byId("idClaimType"),
				oView.byId("idDealerRO"),
				oView.byId("idDealerINVDate"),
				oView.byId("idDealerInvoice")
			];

			var bValidationError;
			jQuery.each(aInputsArr, function (i, oInput) {
				if (oInput.getVisible() == true) {
					bValidationError = that._validateInput(oInput) || bValidationError;
				}
			});

			if (bValidationError) {
				// this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);

				oClaimModel.read("/zc_claim_item_price_dataSet", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
							"'and LanguageKey eq '" + this.fnReturnLanguage() + "' "

					},
					success: $.proxy(function (data) {

						var pricinghData = data.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.ItemType === "MAT";
						});

						this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
						var PartItem = oFilteredData.map(function (item) {
							return {
								Type: "PART",
								ItemType: "",
								ControllingItemType: "MAT",
								UnitOfMeasure: item.UnitOfMeasure,
								MaterialNumber: item.matnr,
								PartDescription: item.PartDescription,
								PartQty: item.QtyHrs,
								Posnr: item.posnr,
								ItemKey: "",
								PartManufacturer: item.PartManufacturer,
								PartType: item.PartType,
								CompetitorPrice: item.CompetitorPrice
							};

						});

						this.obj = {
							"DBOperation": "SAVE",
							"Message": "",
							"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
							"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
							"Partner": this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey"),
							"PartnerRole": "AS",
							"ReferenceDate": this._fnDateFormat(oCurrentDt),
							"DateOfApplication": this._fnDateFormat(oCurrentDt),
							"FinalProcdDate": null,
							"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
							"RepairOrderNumberExternal": this.getView().getModel("HeadSetData").getProperty("/RepairOrderNumberExternal"),
							"ExternalNumberOfClaim": this.getView().getModel("HeadSetData").getProperty("/ExternalNumberOfClaim"),
							"ExternalObjectNumber": this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber"),
							"Odometer": this.getView().getModel("HeadSetData").getProperty("/Odometer"),
							"TCIWaybillNumber": "",
							"NameOfPersonRespWhoChangedObj": "",
							"ShipmentReceivedDate": null,
							"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
							"HeadText": "",
							"OFP": "",
							"WTYClaimRecoverySource": "",
							"MainOpsCode": "",
							"T1WarrantyCodes": "",
							"BatteryTestCode": "",
							"T2WarrantyCodes": "",
							"FieldActionReference": "",
							"ZCondition": "",
							"Cause": "",
							"Remedy": "",
							"PreviousROInvoiceDate": null,
							"PreviousROOdometer": "",
							"PreviousROInvoice": "",
							"AccessoryInstallOdometer": "",
							"AccessoryInstallDate": null,
							"AgreementNumber": "",
							"CustomerPostalCode": "",
							"CustomerFullName": this.getView().getModel("HeadSetData").getProperty("/CustomerFullName"),
							"ProbillNum": "",
							"Delivery": "",
							"DeliveryDate": null,
							"DeliveringCarrier": "",
							"WarrantyClaimSubType": "",
							"DeliveryType": "",
							"DealerInvoice": this.getView().getModel("HeadSetData").getProperty("/DealerInvoice"),
							"DealerInvoiceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DealerInvoiceDate")),
							"DealerRO": this.getView().getModel("HeadSetData").getProperty("/DealerRO"),
							"CompetitorName": this.getView().getModel("HeadSetData").getProperty("/CustomerFullName"),
							"CompetitorAddr": this.getView().byId("street_number").getValue() || "",
							"CompetitorCity": this.getView().byId("locality").getValue() || "",
							"CompetitorProv": this.getView().byId("administrative_area_level_1").getValue() || "",
							"CompetitorPost": this.getView().byId("postal_code").getValue() || "",
							"QuoteDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/QuoteDate")),
							"RebateAmount": this.getView().getModel("HeadSetData").getProperty("/RebateAmount"),
							"zc_itemSet": {
								"results": PartItem
							},
							"zc_item_subletSet": {
								"results": []
							},
							"zc_claim_item_paintSet": {
								"results": []
							},
							"zc_claim_item_labourSet": {
								"results": []
							},
							"zc_claim_item_price_dataSet": {
								"results": []
							},
							"zc_claim_attachmentsSet": {
								"results": []
							},
							"zc_claim_commentSet": {
								"results": []
							},
							"zc_claim_vsrSet": {
								"results": []
							}

						};

						oClaimModel.refreshSecurityToken();
						oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
							success: $.proxy(function (data, response) {
								MessageToast.show(oBundle.getText("ClaimUpdatedsuccessfully"), {
									my: "center center",
									at: "center center"
								});

								this.getModel("LocalDataModel").setProperty("/commentIndicator", false);
								this._fnClaimSum();
								oClaimModel.read("/ZC_CLAIM_HEAD_PMP", {
									urlParameters: {
										"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty(
												"/NumberOfWarrantyClaim") +
											"'"

									},
									success: $.proxy(function (sdata) {
										this.getView().getModel("HeadSetData").setData(sdata.results[0]);
									}, this),
									error: function (err) {
										console.log(err);
									}
								});
							}, this),
							error: function (err) {
								console.log(err);
							}
						});

					}, this),
					error: $.proxy(function (err) {
						console.log(err);
					}, this)

				});

			}

		},

		onRecalculate: function (oEvent) {
			this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			this.obj.RebateAmount = this.getView().getModel("HeadSetData").getProperty("/RebateAmount");

			this._fnUpdateClaim();

		},

		onPost: function (oEvent) {

			var oBusinessModel = this.getModel("ApiBusinessModel");
			this.getModel("LocalDataModel").setProperty("/commentIndicator", true);

			var oPartner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");

			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");

			var oFormat = DateFormat.getDateTimeInstance({
				style: "medium"
			});

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd HH:mm:ss"
			});
			var oDate = oDateFormat.format(new Date());
			// 			var oObject = this.getView().getBindingContext().getObject();
			var sValue = oEvent.getParameter("value");

			var oEntry = {

				"HeadText": this.getModel("LocalDataModel").getProperty("/BPOrgName") + "(" + oDate + ") " + " : " + sValue,
				"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
				"LanguageKey": this.fnReturnLanguage(),
				"User": "",
				"Date": null
			};
			this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");

			this.obj.zc_claim_commentSet.results.push(oEntry);

			oClaimModel.refreshSecurityToken();
			oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
				success: $.proxy(function (data, response) {
					this.getModel("LocalDataModel").setProperty("/commentIndicator", false);
					oClaimModel.read("/ZC_HEAD_PMPSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
								"'and LanguageKey eq '" + this.fnReturnLanguage() + "'",
							"$expand": "zc_claim_commentSet"
						},
						success: $.proxy(function (sdata) {
							this.getModel("LocalDataModel").setProperty("/claim_commentSet", sdata.results[0].zc_claim_commentSet.results);
						}, this)
					});
				}, this)
			});
		},

		onPressSavePart: function (oEvent) {
			var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");

			var oTable = this.getView().byId("idTableParts");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			// this.obj.Message = "";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			this.obj.DBOperation = "SAVE";
			this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");

			var itemObj = {
				"Type": "PART",
				"ItemType": "",
				"ControllingItemType": "MAT",
				"ItemKey": "",
				"MaterialNumber": this.getView().getModel("PartDataModel").getProperty("/matnr"),
				"PartQty": this.getView().getModel("PartDataModel").getProperty("/quant"),
				"PartDescription": this.getView().getModel("PartDataModel").getProperty("/PartDescription"),
				"UnitOfMeasure": this.getView().getModel("LocalDataModel").getProperty("/BaseUnit"),
				"Posnr": "",
				"PartManufacturer": this.getView().getModel("PartDataModel").getProperty("/PartManufacturer"),
				"PartType": this.getView().getModel("PartDataModel").getProperty("/PartType"),
				"CompetitorPrice": this.getView().getModel("PartDataModel").getProperty("/CompetitorPrice")
			};

			var oArrNew = this.obj.zc_itemSet.results.filter(function (val) {
				return val.MaterialNumber === itemObj.MaterialNumber;
			}).length;

			var oTableIndex = oTable._aSelectedPaths;

			var oPMPModel = this.getModel("zDLRCLAIMPMPSRV");

			if (oTableIndex.length == 1) {
				// var oIndex = parseInt(oTableIndex.toString().split("/")[2]);
				// this.obj.zc_itemSet.results.splice(oIndex, 1);
				var oIndex = this.obj.zc_itemSet.results.findIndex(({
					MaterialNumber
				}) => MaterialNumber == this.getView().getModel("PartDataModel").getProperty("/matnr"));
				this.obj.zc_itemSet.results.splice(oIndex, 1);
			}

			var oGetIndex = this.obj.zc_itemSet.results.findIndex(({
				MaterialNumber
			}) => MaterialNumber == this.getView().getModel("PartDataModel").getProperty("/matnr"));

			if (this.getView().getModel("PartDataModel").getProperty("/quant") == "") {
				this.getView().byId("idPartQty").setValueState("Error");
			} else if (oGetIndex > -1) {
				this.getView().getModel("PartDataModel").setProperty("/matnr", "");
				this.getView().getModel("PartDataModel").setProperty("/quant", "");
				this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
				this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "");
				this.getView().getModel("PartDataModel").setProperty("/PartManufacturer", "");
				this.getView().getModel("PartDataModel").setProperty("/PartType", "");
				this.getView().getModel("PartDataModel").setProperty("/CompetitorPrice", "");
				MessageToast.show(oBundle.getText("PartNumExists"), {
					my: "center center",
					at: "center center"
				});
			} else {
				this.obj.zc_itemSet.results.push(itemObj);
				this.getView().byId("idPartQty").setValueState("None");
				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
				oPMPModel.create("/ZC_HEAD_PMPSet", this.obj, {

					success: $.proxy(function (data, response) {
						this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);

						this._fnClaimSum();

						oPMPModel.read("/zc_claim_item_price_dataSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "' "

							},

							success: $.proxy(function (pricingData) {
								var pricinghData = pricingData.results;
								var oFilteredData = pricinghData.filter(function (val) {
									return val.ItemType === "MAT";
								});

								this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
								MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"), {
									my: "center center",
									at: "center center"
								});
								this.getView().getModel("PartDataModel").setProperty("/matnr", "");
								this.getView().getModel("PartDataModel").setProperty("/quant", "");
								this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
								this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "");
								this.getView().getModel("PartDataModel").setProperty("/PartManufacturer", "");
								this.getView().getModel("PartDataModel").setProperty("/PartType", "");
								this.getView().getModel("PartDataModel").setProperty("/CompetitorPrice", "");

								oTable.removeSelections("true");

							}, this),
							error: $.proxy(function (err) {
								MessageToast.show(oBundle.getText("SystemInternalError"));
								this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
							}, this)
						});

						// 		this.getView().getModel("HeadSetData").setProperty("/OFP", response.data.OFP);

						// 		var oFilteredData = pricinghData.filter(function (val) {
						// 			return val.ItemType === "MAT";
						// 		});

						// 		var oIndexMat = oFilteredData.findIndex($.proxy(function (item) {
						// 			return item.ItemKey == this.getView().getModel("HeadSetData").getProperty("/OFP")
						// 		}), this);
						// 		if (oIndexMat > -1) {
						// 			this.getView().byId("idTableParts").getItems()[oIndexMat].getCells()[1].setProperty("selected", true);
						// 		}

					}, this),
					error: $.proxy(function (err) {
						MessageToast.show(oBundle.getText("SystemInternalError"));
						this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
					}, this)
				});
			}
		},

		onSelectCompetitorCity: function (oEvent) {
			var SelectedCity = oEvent.getSource().getSelectedKey();
			var oCities = this.getModel("LocalDataModel").getProperty("/itemList");
			var oSelectedProvince = oCities.filter(function (item) {
				return item.city === SelectedCity;
			});
			this.getModel("LocalDataModel").setProperty("/ProviceSet", oSelectedProvince);

		},
		// 		onSelectCompetitorProv: function (oEvent) {
		// 			var SelectedCity = oEvent.getSource().getSelectedKey();
		// 			var oCities = this.getModel("LocalDataModel").getProperty("/itemList");
		// 			var oSelectedProvince = oCities.filter(function (item) {
		// 				return item.admin === SelectedCity;
		// 			});
		// 			this.getModel("LocalDataModel").setProperty("/cities", oSelectedProvince);
		// 		},
		_fnDateFormat: function (elm) {
			if (elm != "" && elm != null && elm != NaN) {
				// var oNumTime = Date.UTC(elm.getFullYear(), elm.getMonth(), elm.getDate(),
				// 	elm.getHours(), elm.getMinutes(), elm.getSeconds(), elm.getMilliseconds());
				var oNumTime = moment.utc(new Date(elm)).valueOf();
				var oTime = "\/Date(" + oNumTime + ")\/";
				return oTime;
			} else {
				return null;
			}

		},

		_ValidateOnLoad: function () {
			var oView = this.getView();
			var InputArr = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition"),
				oView.byId("idAccDate"),
				oView.byId("idInsOdo"),
				oView.byId("idPreInvNum"),
				oView.byId("idPrInvDate"),
				oView.byId("idPrvOdomtr"),
				oView.byId("idFieldActionInput"),
				oView.byId("idOFP"),
				oView.byId("idClientLastName"),
				oView.byId("idPostalCode"),
				oView.byId("iDdelivCarrier"),
				oView.byId("idProbill"),
				oView.byId("idDelivery"),
				oView.byId("idMainOps")
			];
			jQuery.each(InputArr, $.proxy(function (i, oInput) {
				oInput.setValueState("None");
			}), this);
		},

		_validateInput: function (oInput) {
			var oBinding = oInput.getBinding("value");
			var sValueState = "None";
			var bValidationError = false;

			try {
				oBinding.getType().validateValue(oInput.getValue());
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
			}
			if (oInput.getValue() == "" && oInput.mProperties.required == true) {
				sValueState = "Error";
				bValidationError = true;
			}
			oInput.setValueState(sValueState);

			return bValidationError;
		},

		_fnMatrixControl: function () {
			var oControl = new DistanceMatrix({
				origin: this.getModel("LocalDataModel").getProperty("/dealerPostalCode"),
				destination: this.getView().byId("postal_code").getValue(),
				key: "AIzaSyAz7irkOJQ4ydE2dHYrg868QV5jUQ-5FaY",

			});
			return oControl;

		},

		_fnDistanceMatrix: function () {

			this.getView().byId("idDist").addContent(this._fnMatrixControl());
		},

		_fnDistanceCalculate: function () {
			if (this.getView().byId("idDist").getContent().length == 0) {
				this._fnDistanceMatrix();
			} else {
				this.getView().byId("idDist").removeAllContent();
				this._fnDistanceMatrix();
			}
		},

		_fnSaveClaim: function () {
			this._fnDistanceCalculate();
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");

			var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
			var oClmType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oClmSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			var that = this;
			var oView = this.getView();
			// 			var aInputs;
			var aInputsArr = [
				oView.byId("idClaimType"),
				oView.byId("idDealerRO"),
				oView.byId("idDealerINVDate"),
				oView.byId("idDealerInvoice")
			];

			var bValidationError;
			jQuery.each(aInputsArr, function (i, oInput) {
				if (oInput.getVisible() == true) {
					bValidationError = that._validateInput(oInput) || bValidationError;
				}
			});

			if (bValidationError) {
				// this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.obj = {
					"DBOperation": "SAVE",
					"Message": "",
					"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
					"Partner": this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey"),
					"PartnerRole": "AS",
					"ReferenceDate": this._fnDateFormat(oCurrentDt),
					"DateOfApplication": this._fnDateFormat(oCurrentDt),
					"FinalProcdDate": null,
					"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
					"RepairOrderNumberExternal": this.getView().getModel("HeadSetData").getProperty("/RepairOrderNumberExternal"),
					"ExternalNumberOfClaim": this.getView().getModel("HeadSetData").getProperty("/ExternalNumberOfClaim"),
					"ExternalObjectNumber": this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber"),
					"Odometer": this.getView().getModel("HeadSetData").getProperty("/Odometer"),
					"TCIWaybillNumber": "",
					"NameOfPersonRespWhoChangedObj": "",
					"ShipmentReceivedDate": null,
					"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
					"HeadText": "",
					"OFP": "",
					"WTYClaimRecoverySource": "",
					"MainOpsCode": "",
					"T1WarrantyCodes": "",
					"BatteryTestCode": "",
					"T2WarrantyCodes": "",
					"FieldActionReference": "",
					"ZCondition": "",
					"Cause": "",
					"Remedy": "",
					"PreviousROInvoiceDate": null,
					"PreviousROOdometer": "",
					"PreviousROInvoice": "",
					"AccessoryInstallOdometer": "",
					"AccessoryInstallDate": null,
					"AgreementNumber": "",
					"CustomerPostalCode": "",
					"CustomerFullName": this.getView().getModel("HeadSetData").getProperty("/CustomerFullName"),
					"ProbillNum": "",
					"Delivery": "",
					"DeliveryDate": null,
					"DeliveringCarrier": "",
					"WarrantyClaimSubType": "",
					"DeliveryType": "",
					"DealerInvoice": this.getView().getModel("HeadSetData").getProperty("/DealerInvoice"),
					"DealerInvoiceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DealerInvoiceDate")),
					"DealerRO": this.getView().getModel("HeadSetData").getProperty("/DealerRO"),
					"CompetitorName": this.getView().getModel("HeadSetData").getProperty("/CustomerFullName"),
					"CompetitorAddr": this.getView().byId("street_number").getValue() || "",
					"CompetitorCity": this.getView().byId("locality").getValue() || "",
					"CompetitorProv": this.getView().byId("administrative_area_level_1").getValue() || "",
					"CompetitorPost": this.getView().byId("postal_code").getValue() || "",
					"QuoteDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/QuoteDate")),
					"RebateAmount": this.getView().getModel("HeadSetData").getProperty("/RebateAmount"),
					"zc_itemSet": {
						"results": []
					},
					"zc_item_subletSet": {
						"results": []
					},
					"zc_claim_item_paintSet": {
						"results": []
					},
					"zc_claim_item_labourSet": {
						"results": []
					},
					"zc_claim_item_price_dataSet": {
						"results": []
					},
					"zc_claim_attachmentsSet": {
						"results": []
					},
					"zc_claim_commentSet": {
						"results": []
					},
					"zc_claim_vsrSet": {
						"results": []
					}

				};

				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
					success: $.proxy(function (data, response) {
						this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
						this.getView().byId("idMainClaimMessage").setProperty("visible", false);
						this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
						this.getModel("LocalDataModel").setProperty("/step01Next", true);
						this.getModel("LocalDataModel").setProperty("/FeedEnabled", true);
						this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", data.NumberOfWarrantyClaim);
						MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"), {
							my: "center center",
							at: "center center"
						});

						this.getView().getModel("DateModel").setProperty("/saveClaimSt", false);
						this.getView().getModel("DateModel").setProperty("/updateClaimSt", true);
						this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
						this.getModel("LocalDataModel").setProperty("/PrintEnable", true);
						this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
						this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);
						this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", true);

						this._fnClaimSum();

						oClaimModel.read("/ZC_CLAIM_HEAD_PMP", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + data.NumberOfWarrantyClaim +
									"'"
							},
							success: $.proxy(function (sdata) {
								// console.log(sdata);
								this.getView().getModel("HeadSetData").setData(sdata.results[0]);

								this._fnStatusCheck();
								this.getModel("LocalDataModel").setProperty("/ClaimDetails", sdata.results[0]);

								var oPartner = this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner");

								var oBusinessModel = this.getModel("ApiBusinessModel");
								oBusinessModel.read("/A_BusinessPartner", {
									urlParameters: {
										"$filter": "BusinessPartner eq '" + oPartner + "'"
									},
									success: $.proxy(function (dBp) {
										this.getModel("LocalDataModel").setProperty("/BPOrgName", dBp.results[0].OrganizationBPName1);
									}, this)
								});

								var oCLaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
								this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", oCLaim);

							}, this),
							error: function (Error) {
								console.log(Error);
							}
						});

						this.getModel("LocalDataModel").setProperty("/CancelEnable", true);

					}, this),
					error: $.proxy(function (err) {
						MessageToast.show(oBundle.getText("SystemInternalError"));
						this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
					}, this)
				});
			}

		},

		onUploadComplete: function (oEvent) {

			var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			var fileType = this.oUploadedFile.type;
			//var oUploadedFileArr = this.oUploadedFile.name.split(".").reverse();
			//var oFileExt = oUploadedFileArr[0].length;
			var oFileName = this.oUploadedFile.name;

			var fileNamePrior = "HEAD@@@" + oFileName;
			var fileName = fileNamePrior;
			var isProxy = "";
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			var oURI = isProxy + "/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + fileName +
				"')/$value";

			if (oURI == null) {

				//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
			}

			var itemObj = {
				"NumberOfWarrantyClaim": oClaimNum,
				"COMP_ID": fileName,
				"ContentLine": this.oBase,
				"Mimetype": fileType,
				"URI": oURI,
				"AttachLevel": "HEAD"
			};

			// 			this.obj = Object.assign({
			// 				"zc_claim_attachmentsSet": {
			// 					"results": []
			// 				}
			// 			}, this.obj);
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			this.obj.zc_claim_attachmentsSet.results.push(itemObj);

			//var oClaimModel = this.getModel("ProssingModel");
			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
				success: $.proxy(function (data, response) {
					this.getModel("LocalDataModel").setProperty("/IndicatorState", false);

					MessageToast.show(oBundle.getText("SuccesFullyUploaded"), {
						my: "center center",
						at: "center center"
					});
					this.obj.zc_claim_attachmentsSet.results.pop();
					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
						},
						//	startswith(CompanyName, 'Alfr') eq true
						success: $.proxy(function (odata) {
							var oArr = odata.results;
							var oAttachSet = oArr.map(function (item) {
								item.FileName = item.FileName.replace("HEAD@@@", "");
								return item;

							});

							//this.getModel("LocalDataModel").setProperty("/oAttachmentSet", odata.results);
							//this.getView().getModel("ClaimModel").setProperty("/" + "/items", oArr);
							this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", oAttachSet);
							this.getView().byId("idMainClaimMessage").setProperty("visible", false);

							// // this.getModel("LocalDataModel").setProperty("/oAttachmentSet", );
							// this.getView().getModel("ClaimModel").setProperty(sCurrentPath + "/items", odata.results);
						}, this)
					});

				}, this),
				error: function (err) {
					console.log(err);
				}
			});

		},

		onSaveClaim: function (oEvent) {
			this._fnSaveClaim();
		},

		onFileDeleted: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var oPMPModel = this.getModel("zDLRCLAIMPMPSRV");

			var oLine = oEvent.getSource()._oItemForDelete._iLineNumber;
			var oFileName = this.getModel("LocalDataModel").getProperty("/HeadAtchmentData/" + oLine + "/FileName");
			var oFileToDelete = "HEAD@@@" + oFileName;

			oPMPModel.refreshSecurityToken();

			oPMPModel.remove("/zc_claim_attachmentsSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + oFileToDelete + "')", {
				method: "DELETE",
				success: $.proxy(function () {
					MessageToast.show(oBundle.getText("Filedeletedsuccessfully"), {
						my: "center center",
						at: "center center"
					});
					oPMPModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
						},

						success: $.proxy(function (odata) {
							var oArr = odata.results;
							var oAttachSet = oArr.map(function (item) {
								item.FileName = item.FileName.replace("HEAD@@@", "");
								return item;

							});
							// this.getView().getModel("ClaimModel").setProperty("/" + "/items", oArr);
							this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", oAttachSet);

						}, this)
					});
				}, this)
			});

		},

		_handleLiveSearch: function (evt) {
			var sValue = evt.getParameter("value");

			if (sValue) {
				var oFilter = new Filter(
					"Material",
					sap.ui.model.FilterOperator.StartsWith, sValue
				);
				//console.log(oFilter);
				evt.getSource().getBinding("items").filter([oFilter]);
			} else {
				evt.getSource().getBinding("items").filter([]);
			}
		},

		handleValueHelp: function (oController) {
			//  var oModel = new sap.ui.model.odata.v2.ODataModel(myServiceUrl);

			//debugger;
			this.inputId = oController.getParameters().id;
			//console.log(this.inputId);
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"zclaimProcessing.view.fragments.partList",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
				// this._valueHelpDialog._dialog.attachAfterOpen(()=> this._valueHelpDialog._dialog.getCustomHeader().getContentMiddle()[0].focus());
			}

			// open value help dialog
			this._valueHelpDialog.open();
		},
		_handleValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			this.oSelectedTitle = evt.mParameters.selectedItems[0].getCells()[0].getText();
			var oBaseUint = evt.mParameters.selectedItems[0].getCells()[2].getText();
			var oDescription = evt.mParameters.selectedItems[0].getCells()[1].getText();
			var oProductModel = this.getModel("ProductMaster");
			oProductModel.read("/ZC_Characteristic_InfoSet", {
				urlParameters: {
					"$filter": "MATERIAL eq '" + this.oSelectedTitle + "' and CLASS eq 'TIRE_INFORMATION'"
				},
				success: $.proxy(function (data) {
					if (data.results.length > 0) {
						var oManufacturer = data.results.filter(function (item) {
							return item.CHARAC == "TIRE_BRAND_NAME"
						});
						var oManuFactureValue = oManufacturer[0].VALUE;

						var oPartType = data.results.filter(function (item) {
							return item.CHARAC == "TIRE_CATEGORY"
						});
						var oPartTypeValue = oPartType[0].VALUE;
						if (oManuFactureValue != "") {
							this.getView().getModel("PartDataModel").setProperty("/PartManufacturer", oManuFactureValue);

						}

						if (oManuFactureValue != "") {
							this.getView().getModel("PartDataModel").setProperty("/PartType", oPartTypeValue);

						}

						// 		if (data.results[0].VALUE != "?") {
						// 			this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", data.results[0].VALUE);
						// 		} else {
						// 			this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", oBaseUint);
						// 		}
						this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", oBaseUint);
					} else {
						this.getView().getModel("PartDataModel").setProperty("/PartManufacturer", "");
						this.getView().getModel("PartDataModel").setProperty("/PartType", "");
						this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", oBaseUint);
					}

				}, this)
			});

			this.getView().getModel("PartDataModel").setProperty("/PartDescription", oDescription);
			if (oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(this.oSelectedTitle);
			}
			evt.getSource().getBinding("items").filter([]);
		},
		onPressAddPart: function () {
			this.getView().getModel("PartDataModel").setProperty("/matnr", "");
			this.getView().getModel("PartDataModel").setProperty("/quant", "");
			this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
			this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "");

			var oTable = this.getView().byId("idTableParts");
			oTable.removeSelections("true");
			this.getView().getModel("DateModel").setProperty("/partLine", true);
			this.getView().getModel("DateModel").setProperty("/editablePartNumber", true);

		},
		onPressUpdatePart: function (oEvent) {
			var oTable = this.getView().byId("idTableParts");
			var oTableIndex = oTable._aSelectedPaths;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			if (oTableIndex.length == 1) {

				var oSelectedRow = oTableIndex.toString();
				var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
				var PartNum = obj.matnr;
				var PartQt = obj.QtyHrs;
				this.getView().getModel("DateModel").setProperty("/editablePartNumber", false);
				//var PartUnit = obj.Meins;

				this.getView().getModel("PartDataModel").setProperty("/matnr", obj.matnr);
				this.getView().getModel("PartDataModel").setProperty("/quant", obj.QtyHrs);
				this.getView().getModel("PartDataModel").setProperty("/PartDescription", obj.ALMDiscreDesc);
				this.getView().getModel("PartDataModel").setProperty("/PartType", obj.PartType);
				this.getView().getModel("PartDataModel").setProperty("/CompetitorPrice", obj.CompetitorPrice);
				this.getView().getModel("PartDataModel").setProperty("/PartManufacturer", obj.PartManufacturer);
				this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", obj.Meins);
				//this.getView().getModel("LocalDataModel").setProperty("/BaseUnit"
				this.getView().getModel("DateModel").setProperty("/partLine", true);

			} else {
				MessageToast.show(oBundle.getText("Pleaseselect1row"), {
					my: "center center",
					at: "center center"
				});
				oTable.removeSelections("true");
			}
		},

		onPressCancelPart: function () {
			this.getView().getModel("PartDataModel").setProperty("/matnr", "");
			this.getView().getModel("PartDataModel").setProperty("/quant", "");
			this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
			this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "");
			this.getView().getModel("PartDataModel").setProperty("/PartType", "");
			this.getView().getModel("PartDataModel").setProperty("/CompetitorPrice", "");
			this.getView().getModel("PartDataModel").setProperty("/PartManufacturer", "");
		},

		onPressDeletePart: function () {
			var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			var oTable = this.getView().byId("idTableParts");
			var oTableIndex = oTable._aSelectedPaths;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			//var oValOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			var oSelectedRow = oTableIndex.toString();
			var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
			var PartNum = obj.matnr;
			var PartQt = obj.QtyHrs;

			var oFindIndexOfSelectedObj = this.obj.zc_itemSet.results.findIndex(function (elm) {
				return elm.MaterialNumber === PartNum;
			});

			if (oTableIndex.length == 1 && oFindIndexOfSelectedObj != -1) {

				var dialog = new Dialog({
					title: oBundle.getText("deleteLine"),
					type: "Message",
					content: new Text({
						text: oBundle.getText("Aredeleteitem")
					}),

					buttons: [
						new Button({
							text: oBundle.getText("Yes"),
							press: $.proxy(function () {

								var oIndex = parseInt(oTable._aSelectedPaths.toString().split("/")[2]);
								this.obj.zc_itemSet.results.splice(oFindIndexOfSelectedObj, 1);

								var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");

								this.obj.DBOperation = "SAVE";
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
									success: $.proxy(function (data, response) {
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);

										var pricinghData = response.data.zc_claim_item_price_dataSet.results;
										var oFilteredData = pricinghData.filter(function (val) {
											return val.ItemType === "MAT";
										});

										this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);

										this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
										oTable.removeSelections("true");
										MessageToast.show(oBundle.getText("ItemDeletedSuccessfully"), {
											my: "center center",
											at: "center center"
										});

										this._fnClaimSum();

									}, this),
									error: $.proxy(function (err) {
										MessageToast.show(oBundle.getText("SystemInternalError"));
										this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
									}, this)
								});
								dialog.close();
							}, this)
						}),
						new Button({
							text: "No",
							press: function () {
								dialog.close();
							}
						})

					],

					afterClose: function () {
						dialog.destroy();
					}
				});

				dialog.open();

			} else {
				MessageToast.show(oBundle.getText("Pleaseselect1row"), {
					my: "center center",
					at: "center center"
				});
				oTable.removeSelections("true");
			}
		},
		onEnterPostalCode: function (oEvent) {
			// 			var that = this;
			// 			var oControl = new DistanceMatrix({
			// 				origin: this.getModel("LocalDataModel").getProperty("/dealerPostalCode"),
			// 				destination: this.getView().getModel("HeadSetData").getProperty("/CompetitorPost"),
			// 				key: "AIzaSyAz7irkOJQ4ydE2dHYrg868QV5jUQ-5FaY",
			// 				id: "idPostalDistInput"
			// 			});

			// 			this.getView().byId("idDist").addItem(oControl);

			// 			console.log(this.getView().byId("idPostalDistInput").getText());

			// 			this.getView().getModel("DateModel").setProperty("/lableVisible", true);

			var getText = this.isValidPostalCode(oEvent.getSource().getValue(), "CA");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (!getText) {
				this.getView().getModel("HeadSetData").setProperty("/CompetitorPost", "");
				MessageToast.show(
					oBundle.getText("InvalidPostalCode"), {
						my: "center center",
						at: "center center"
					});
			}
		},

		isValidPostalCode: function (postalCode, countryCode) {
			var postalCodeRegex;
			switch (countryCode) {
			case "CA":
				postalCodeRegex = /[a-zA-Z][0-9][a-zA-Z](-| |)[0-9][a-zA-Z][0-9]/;
				break;
			default:
				postalCodeRegex = /^(?:[A-Z0-9]+([- ]?[A-Z0-9]+)*)?$/;
			}
			return postalCodeRegex.test(postalCode);
		},

		onSubmitTci: function (oEvent) {
			var oFinalDistanceNum;
			if (this.getView().byId("postal_code").getValue() != "") {

				var oGetDistance = this.getView().byId("idDist").getContent()[0].getText();;
				var oDistanceRemoveComma = oGetDistance.replace(/,/g, '');
				var oDistanceRemoveKM = oDistanceRemoveComma.replace(/km/g, '');
				oFinalDistanceNum = parseInt(oDistanceRemoveKM);
			} else {
				oFinalDistanceNum = "";
			}

			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var sSelectedLocale, bValidationError;

			var that = this;

			// 	jQuery.each(that._modelValidate(), function (i, oInput) {
			// 		if (oInput.getVisible() == true && oInput.mProperties.enabled == true) {
			// 			bValidationError = that._validateInput(oInput) || bValidationError;
			// 		} else {
			// 			oInput.setValueState("None");
			// 		}
			// 	});

			//this.fnDisableLine();
			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");
			var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");

			this.obj.Message = "";
			this.obj.DBOperation = "SUB";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			var oObj = {
				"NumberOfWarrantyClaim": oClaimNum,
				"POSNR": "",
				"NUMBER": "",
				"TYPE": "",
				"MESSAGE": ""
			};

			this.obj.zc_claim_vsrSet.results.push(oObj);

			//this.obj.zc_claim_item_price_dataSet.results.push(this.getModel("LocalDataModel").getProperty("/PricingDataModel"));

			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			//var GroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			//oEvent.getSource().getParent().getParent().addStyleClass("clMinHeight");

			var dialog = new Dialog({
				title: that.oBundle.getText("SubmitClaimTCI"),
				type: "Message",
				content: new Text({
					text: that.oBundle.getText("AresubmitClaimTCI?")
				}),

				buttons: [
					new Button({
						text: oBundle.getText("Yes"),
						press: $.proxy(function () {
							dialog.close();
							// 		if (bValidationError) {
							// 			this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
							// 			this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
							// 			this.getView().byId("idMainClaimMessage").setType("Error");
							// 			this.getView().byId("idMainClaimMessage").setProperty("visible", true);
							// 		} else {
							// 		this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
							// 		this.getView().getModel("DateModel").setProperty("/claimTypeState2", "None");

							if (oFinalDistanceNum > 80 && this.getView().byId("postal_code").getValue() != "") {
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("CompareDistanceError"));
								this.getView().byId("idMainClaimMessage").setType("Error");
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
							} else if (this.getModel("LocalDataModel").getProperty("/HeadAtchmentData").length == 0) {
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PMPSupportingDocumentErr"));
								this.getView().byId("idMainClaimMessage").setType("Error");
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
							} else if (
								this.getView().getModel("HeadSetData").getProperty("/CompetitorAddr") == "" ||
								this.getView().getModel("HeadSetData").getProperty("/CompetitorCity") == "" ||
								this.getView().getModel("HeadSetData").getProperty("/CompetitorProv") == "" ||
								this.getView().getModel("HeadSetData").getProperty("/CompetitorPost") == "" ||
								this.getView().getModel("HeadSetData").getProperty("/QuoteDate") == "" ||
								this.getView().getModel("HeadSetData").getProperty("/CustomerFullName") == ""

							) {
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("Competitorinformationcannotblank"));
								this.getView().byId("idMainClaimMessage").setType("Error");
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
							} else {
								this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", true);
								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
									success: $.proxy(function (data, response) {
										this.getView().byId("idMainClaimMessage").setProperty("visible", false);

										//this.getView().byId("idMainClaimMessage").setProperty("visible", false);
										//var pricinghData = response.data.zc_claim_item_price_dataSet.results;

										// 	var oFilteredData = pricinghData.filter(function (val) {
										// 		return val.ItemType === "MAT";
										// 	});

										// 	this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
										// 	this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);

										this._fnClaimSum();

										oClaimModel.read("/zc_claim_item_price_dataSet", {
											urlParameters: {
												"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "' "

											},

											success: $.proxy(function (pricingData) {
												var pricinghData = pricingData.results;
												var oFilteredData = pricinghData.filter(function (val) {
													return val.ItemType === "MAT";
												});

												this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);

											}, this),
											error: $.proxy(function (err) {
												MessageToast.show(oBundle.getText("SystemInternalError"));
												this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
											}, this)
										});

										oClaimModel.read("/ZC_HEAD_PMPSet", {
											urlParameters: {
												"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum +
													"'and LanguageKey eq '" + this.fnReturnLanguage() + "'",
												"$expand": "zc_claim_vsrSet"
											},
											success: $.proxy(function (errorData) {

												// 			var pricinghData = errorData.results[0].zc_claim_item_price_dataSet.results;

												// 			var oFilteredData = pricinghData.filter(function (val) {
												// 				return val.ItemType === "MAT";
												// 			});

												// 			this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);

												this.getModel("LocalDataModel").setProperty("/oErrorSet", errorData.results[0].zc_claim_vsrSet.results);

												this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
												this.obj.zc_claim_vsrSet.results.pop(oObj);
											}, this)
										});

										oClaimModel.read("/ZC_CLAIM_HEAD_PMP", {
											urlParameters: {
												"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum +
													"'"
											},
											success: $.proxy(function (sdata) {

												this.getView().getModel("HeadSetData").setProperty("/DecisionCode", sdata.results[0].DecisionCode);

												this._fnStatusCheck();

												if (sdata.results[0].DecisionCode == "ZTIC") {
													MessageToast.show(
														oBundle.getText("ClaimNumber") + " " + oClaimNum + " " + oBundle.getText(
															"RejectedTCIValidationResultsdetails"), {
															my: "center center",
															at: "center center"
														});

												} else {
													this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
													MessageToast.show(oBundle.getText("ClaimNumber") + " " + oClaimNum + " " + oBundle.getText(
														"successfullysubmittedTCI"), {
														my: "center center",
														at: "center center"
													});

												}

												if (sdata.results[0].DecisionCode == "ZTIC" || sdata.results[0].DecisionCode == "ZTRC") {
													this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
													this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
													this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
													this.getView().getModel("DateModel").setProperty("/claimEditSt", true);
													this.getView().getModel("DateModel").setProperty("/updateEnable", true);
													this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
												} else {
													this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
													this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
													this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
													this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
													this.getView().getModel("DateModel").setProperty("/updateEnable", false);
													this.getModel("LocalDataModel").setProperty("/UploadEnable", false);

												}

											}, this)
										});

									}, this),
									error: $.proxy(function (err) {
										MessageToast.show(oBundle.getText("SystemInternalError"));
										this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
									}, this)
								});
							}

						}, this)
					}),
					new Button({
						text: oBundle.getText("Cancel"),
						press: $.proxy(function () {
							this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
							dialog.close();
						}, this)
					})

				],

				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();

		},

		onStep01Next: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getView().byId("idFilter02").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
			this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);
		},

		onStep02Next: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getView().byId("idFilter03").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
			this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);
		},
		onStep03Next: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var that = this;
			var oRebt = parseInt(this.getView().getModel("HeadSetData").getProperty("/RebateAmount"));
			//this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
			if (this.getView().getModel("HeadSetData").getProperty("/CustomerFullName") != "") {
				var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");
				oClaimModel.read("/ZC_COMPTREBATE", {
					urlParameters: {
						"$filter": "CompetitorName eq '" + this.getView().getModel("HeadSetData").getProperty("/CustomerFullName") + "'"
					},
					success: $.proxy(function (data) {
						if (data.results[0].RebateApply == "Y" && oRebt == 0) {

							var dialog = new Dialog({
								title: oBundle.getText("EnterRebate"),
								type: "Message",
								content: new Text({
									text: oBundle.getText("DoyouwishApplyManufacturerRebate")
								}),

								buttons: [
									new Button({
										text: oBundle.getText("Yes"),
										press: $.proxy(function () {
											this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);

											dialog.close();
											document.getElementById(this.getView().byId("idRebateAmt").sId + "-inner").focus();

										}, this)
									}),
									new Button({
										text: oBundle.getText("No"),
										press: $.proxy(function () {
											this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
											this.getView().byId("idFilter07").setProperty("enabled", true);
											this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
											this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
											this.getView().byId("idMainClaimMessage").setProperty("visible", false);
											dialog.close();
										}, this)
									})

								],

								afterClose: function () {
									dialog.destroy();
								}
							});

							dialog.open();

							//this.getView().byId("idRebateAmt").focus();

						} else {
							this.getView().byId("idFilter07").setProperty("enabled", true);
							this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
							this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
							this.getView().byId("idMainClaimMessage").setProperty("visible", false);
						}
					}, this)
				});
			} else {
				this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
				this.getView().byId("idFilter07").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
				this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
			}

		},

		onPressBack: function () {
			this.getRouter().navTo("SearchClaim");
		},

		onStep01Back: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getView().byId("idFilter01").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
			this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);
		},

		onStep02Back: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getView().byId("idFilter02").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
			this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);
		},

		onStep03Back: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getView().byId("idFilter03").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
			this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zclaimProcessing.view.PMPMainSection
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zclaimProcessing.view.PMPMainSection
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.PMPMainSection
		 */
		//	onExit: function() {
		//
		//	}

	});

});