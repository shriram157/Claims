sap.ui.define([
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/MessageToast',
	'sap/m/Text',
	"zclaimProcessing/controller/BaseController",
	"zclaimProcessing/libs/jQuery.base64",
	"sap/ui/core/ValueState",
	"zclaimProcessing/utils/Validator",
	'sap/ui/model/Filter',
	'sap/m/Button',
	"sap/ui/core/format/DateFormat"
], function (Dialog, Label, MessageToast, Text, BaseController, base64, ValueState, Validator, Filter, Button, DateFormat) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.MainClaimSection", {
		onInit: function () {
			this.getDealer();

			//Model data set for Header Links visibility as per User login
			console.log("HeaderLinksModel", sap.ui.getCore().getModel("HeaderLinksModel"));
			this.getView().setModel(sap.ui.getCore().getModel("HeaderLinksModel"), "HeaderLinksModel");

			this.setModel(this.getModel("ProductMaster"), "ProductMasterModel");
			this.setModel(this.getModel("ZVehicleMasterModel"), "ZVehicleMasterModel");
			this.setModel(this.getModel("ProssingModel"));
			var oProssingModel = this.getModel("ProssingModel");
			var sSelectedLocale;

			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}

			oProssingModel.read("/zc_dmg_type_codesSet", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/DataTypeCode", data.results);
				}, this),
				error: function () {

				}
			});

			oProssingModel.read("/zc_dmg_area_codesSet", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/DataAreaCode", data.results);
				}, this),
				error: function () {

				}
			});

			oProssingModel.read("/zc_dmg_sevr_codesSet", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/DataSeverety", data.results);
				}, this),
				error: function () {

				}
			});

			oProssingModel.read("/Zt1DescSrchhelpSet", {
				urlParameters: {
					"$filter": "Spras eq '" + sSelectedLocale.toUpperCase() + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/t1DescSrchhelpSet", data.results);
				}, this),
				error: function () {

				}
			});

			oProssingModel.read("/Zt2DescSrchhelpSet", {
				urlParameters: {
					"$filter": "Spras eq '" + sSelectedLocale.toUpperCase() + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/t2DescSrchhelpSet", data.results);
				}, this),
				error: function () {

				}
			});

			var partData = new sap.ui.model.json.JSONModel({
				"matnr": "",
				"quant": "",
				"PartDescription": ""
			});
			partData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(partData, "PartDataModel");

			this.LabourData = new sap.ui.model.json.JSONModel({
				"LabourOp": "",
				"LabourDescription": "",
				"ClaimedHours": ""
			});
			this.LabourData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(this.LabourData, "LabourDataModel");

			this.PercentData = new sap.ui.model.json.JSONModel({
				"CustomerPer": "",
				"DealerPer": "",
				"TCIPer": "",
				"PartPer": "",
				"LabourPer": "",
				"SubletPer": ""
			});
			this.PercentData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(this.PercentData, "DataPercetCalculate");

			var SubletData = new sap.ui.model.json.JSONModel({
				"SubletCode": "",
				"InvoiceNo": "",
				"description": "",
				"Amount": "",
				"days": "",
				"brand": "",
				"unitOfMeasure": ""
			});
			SubletData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(SubletData, "SubletDataModel");

			var PaintData = new sap.ui.model.json.JSONModel({
				PaintPositionCode: ""
			});
			PaintData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(PaintData, "PaintDataModel");

			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRoutMatched, this);

			this.ArrIndex = [];
			this.ArrIndexLabour = [];

			var HeadSetData = new sap.ui.model.json.JSONModel();
			HeadSetData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(HeadSetData, "HeadSetData");

			sap.ui.getCore().attachValidationError(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.Error);
			});
			sap.ui.getCore().attachValidationSuccess(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.None);
			});

		},

		_onRoutMatched: function (oEvent) {
			this.getDealer();
			var PercentData = [{
				"num": "0%",
				"okey": "0"
			}, {
				"num": "5%",
				"okey": "5"
			}, {
				"num": "10%",
				"okey": "10"
			}, {
				"num": "15%",
				"okey": "15"
			}, {
				"num": "20%",
				"okey": "20"
			}, {
				"num": "25%",
				"okey": "25"
			}, {
				"num": "30%",
				"okey": "30"
			}, {
				"num": "35%",
				"okey": "35"
			}, {
				"num": "40%",
				"okey": "40"
			}, {
				"num": "45%",
				"okey": "45"
			}, {
				"num": "50%",
				"okey": "50"
			}, {
				"num": "55%",
				"okey": "55"
			}, {
				"num": "60%",
				"okey": "60"
			}, {
				"num": "65%",
				"okey": "65"
			}, {
				"num": "70%",
				"okey": "70"
			}, {
				"num": "75%",
				"okey": "75"
			}, {
				"num": "80%",
				"okey": "80"
			}, {
				"num": "85%",
				"okey": "85"
			}, {
				"num": "90%",
				"okey": "90"
			}, {
				"num": "95%",
				"okey": "95"
			}, {
				"num": "100%",
				"okey": "100"
			}];
			this.getModel("LocalDataModel").setProperty("/DataPercent", PercentData);

			this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
			this.getModel("LocalDataModel").setProperty("/reCalculate", false);
			this.getModel("LocalDataModel").setProperty("/PercentState", false);
			this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
			this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
			this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
			this.getModel("LocalDataModel").setProperty("/PrintEnable", false);
			this.getModel("LocalDataModel").setProperty("/step01Next", false);
			this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
			this.getModel("LocalDataModel").setProperty("/oCurrentDealerLabour", "");
			this.getModel("LocalDataModel").setProperty("/enableEnterComment", false);
			this.getModel("LocalDataModel").setProperty("/FeedEnabled", false);
			this.getModel("LocalDataModel").setProperty("/discountBusyIndicator", false);
			this._ValidateOnLoad();
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			this.getModel("LocalDataModel").setProperty("/oErrorSet", "");
			var oDateModel = new sap.ui.model.json.JSONModel();
			oDateModel.setData({
				minDate: new Date(1999, 1, 1),
				dateValueDRS2: new Date(2018, 1, 1),
				secondDateValueDRS2: new Date(2018, 2, 1),
				dateCurrent: new Date(),
				Authorization: true,
				Parts: true,
				Labour: true,
				Paint: true,
				Sublet: true,
				partLine: false,
				labourLine: false,
				paintLine: false,
				subletLine: false,
				editablePartNumber: true,
				editableLabourNumber: true,
				editableSublNumber: true,
				oDamageLineBtn: false,
				damageLine: false,
				SuggestBtn: false,
				saveClaimSt: true,
				updateClaimSt: false,
				SaveClaim07: true,
				claimTypeEn: true,
				AcA1: false,
				P1p2: false,
				oFormEdit: true,
				claimEditSt: false,
				oztac: false,
				oFieldActionInput: false,
				updateEnable: true,
				OdometerReq: true,
				enableTab: false,
				RepairdDetailVisible: true,
				claimTypeState: "None",
				claimTypeState2: "None",
				warrantySubmissionClaim: false,
				LabourBtnVsbl: true,
				copyClaimEnable: true,
				authAcClm: false,
				authRejClm: false,
				ofpEnabled: true,
				enabledT2: true,
				enabledT1: true,
				oPrevInvNumReq: false,
				oPrevInvDateReq: false,
				DisableRadio: true,
				oBatteryTestEnable: true,
				commentEditable: false,
				ofpRequired: false,
				oDealerContactReq: false,
				oMainOps: true,
				foreignVinInd: false,
				writtenOffInd: false,
				specialVinInd: false,
				oMainOpsReq: false,
				oSlipVisible: false,
				oTciQtyAppr: false,
				oAddPartLine: true,
				oUpdatePartLine: true,
				authHide: true,
				oVisibleURL: "",
				nonVinHide: true,
				errorBusyIndicator: false,
				VisiblePageLine: false,
				oRadioVinIndex: 0,
				oVisibleRepDate: true,
				oVisibleReOrder: true,
				oOdoEnabled: true,
				OdometerReqMan: true,
				RadioSelectedOFP: false,
				NameOfPersonRespWhoChangedObj: "",
				ShipmentVisible: false
			});
			this.getView().setModel(oDateModel, "DateModel");
			this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", "");
			this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", "");
			this.getView().getModel("SubletDataModel").setProperty("/description", "");
			this.getView().getModel("SubletDataModel").setProperty("/Amount", "");
			//this.getView().getModel("DateModel").setProperty("/OdometerReq", true);
			var oValidator = new Validator();
			oValidator.validate("");
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getModel("LocalDataModel").setProperty("/DataVinDetails", "");
			this.getModel("LocalDataModel").setProperty("/VehicleMonths", "");
			this.getModel("LocalDataModel").setProperty("/selectedVehicle", "");
			this.getModel("LocalDataModel").setProperty("/DataAuthDetails", "");
			this.getView().getModel("DataPercetCalculate").setProperty("/CustomerAmt", "");
			this.getView().getModel("DataPercetCalculate").setProperty("/DealerAmt", "");
			this.getView().getModel("DataPercetCalculate").setProperty("/TCIAmt", "");
			this.getModel("LocalDataModel").setProperty("/oErrorSet", "");
			this.getModel("LocalDataModel").setProperty("/claim_commentSet", []);
			this.getModel("LocalDataModel").setProperty("/BPOrgName", "");

			this.getView().getModel("DataPercetCalculate").setProperty("/AuthorizationNumber", "");

			this.getView().getModel("DataPercetCalculate").setProperty("/CustomerPer", "");
			this.getView().getModel("DataPercetCalculate").setProperty("/DealerPer", "");
			this.getView().getModel("DataPercetCalculate").setProperty("/TCIPer", "");
			this.getView().getModel("DataPercetCalculate").setProperty("/PartPer", "");
			this.getView().getModel("DataPercetCalculate").setProperty("/LabourPer", "");
			this.getView().getModel("DataPercetCalculate").setProperty("/SubletPer", "");
			this.getView().getModel("DataPercetCalculate").setProperty("/PartPerAmt", "");
			this.getView().getModel("DataPercetCalculate").setProperty("/LabourPerAmt", "");
			this.getView().getModel("DataPercetCalculate").setProperty("/SubletPerAmt", "");

			this.getModel("LocalDataModel").setProperty("/ClaimSumAuth", "");
			this.getView().byId("id_Date").setValueState("None");
			this.getView().byId("idPrInvDate").setValueState("None");
			this.getView().byId("idPreInvNum").setValueState("None");
			this.getView().byId("idOFP").setValueState("None");
			this.getView().byId("idFieldActionInput").setValueState("None");
			this.getView().byId("idT1Field").setValueState("None");
			this.getView().byId("idT2Field").setValueState("None");
			this.getView().byId("idDealerContact").setValueState("None");
			this.getView().getModel("DateModel").setProperty("/foreignVinInd", false);
			this.getView().getModel("DateModel").setProperty("/writtenOffInd", false);
			this.getView().getModel("DateModel").setProperty("/specialVinInd", false);
			// 			this.getView().getModel("DateModel").setProperty("/authAcClm", false);
			// 			this.getView().getModel("DateModel").setProperty("/authRejClm", false);

			var oProssingModel = this.getModel("ProssingModel");
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);
			//oProssingModel.refresh();
			var oClaim = oEvent.getParameters().arguments.claimNum;
			var oGroupDescription = oEvent.getParameters().arguments.oKey;
			var oClaimAuthType = oEvent.getParameters().arguments.oClaimGroup;
			var oClaimTypeDetail = oEvent.getParameters().arguments.oKey;
			var oNavList = oEvent.getParameters().arguments.oClaimNav;
			this.getModel("LocalDataModel").setProperty("/NavList", oNavList);
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancekm"));
			var oClaimNav = oEvent.getParameters().arguments.oClaimNav;
			this.getModel("LocalDataModel").setProperty("/GroupDescriptionName", oGroupDescription);
			this.getModel("LocalDataModel").setProperty("/oFieldAction", oEvent.getParameters().arguments.oKey);
			this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaim);
			this.getModel("LocalDataModel").setProperty("/WarrantyClaimTypeGroup", oClaimAuthType);
			var oClaimSelectedGroup = oEvent.getParameters().arguments.oClaimGroup;

			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
			this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("MainSection"));
			this.getView().byId("idFilter02").setProperty("enabled", false);
			this.getView().byId("idFilter03").setProperty("enabled", false);
			this.getView().byId("idFilter04").setProperty("enabled", false);
			this.getView().byId("idFilter05").setProperty("enabled", false);
			this.getView().byId("idFilter06").setProperty("enabled", false);
			this.getView().byId("idFilter07").setProperty("enabled", false);
			this.getView().byId("idFilter08").setProperty("enabled", false);

			//this.getModel("LocalDataModel").setProperty("/oClaimSelectedGroup", );

			if (oClaim != "nun" && oClaim != undefined) {

				var sSelectedLocale;
				this.getModel("LocalDataModel").setProperty("/PrintEnable", true);

				//  get the locale to determine the language.
				var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
				if (isLocaleSent) {
					sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
				} else {
					sSelectedLocale = "en"; // default is english
				}

				if (oClaimSelectedGroup == "Authorization") {
					this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", true);
					this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
					this.getModel("LocalDataModel").setProperty("/reCalculate", true);
					this.getModel("LocalDataModel").setProperty("/PercentState", true);
					this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveAuth"));
					this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoClaim"));

					this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIAuthNumber") + " : " + oClaim);

					oProssingModel.read("/zc_authorization_detailsSet", {
						urlParameters: {
							"$filter": "AuthorizationNumber eq '" + oClaim + "'"
						},
						success: $.proxy(function (oAuthData) {
							this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
						}, this)
					});

					oProssingModel.read("/zc_authorizationSet", {
						urlParameters: {
							"$filter": "DBOperation eq 'READ'and AuthorizationNumber eq '" + oClaim +
								"'and DealerPer eq '00'and CustomerPer eq '00'and TCIPer eq '00'and PartPer eq '00'and LabourPer eq '00'and SubletPer eq '00'"
						},
						success: $.proxy(function (data) {
							this.getView().getModel("DataPercetCalculate").setData(data.results[0]);
							var ocust = parseInt(data.results[0].CustomerPer).toString();
							var odeal = parseInt(data.results[0].DealerPer).toString();
							var otci = parseInt(data.results[0].TCIPer).toString();
							var oPartPer = parseInt(data.results[0].PartPer).toString();
							var oLabourPer = parseInt(data.results[0].LabourPer).toString();
							var oSubletPer = parseInt(data.results[0].SubletPer).toString();
							if (oPartPer != "0" || oLabourPer != "0" || oSubletPer != "0") {
								this.getView().byId("idPricingOpt").setSelectedIndex(1);
								this.getView().byId("idParticiaptionTable").setProperty("visible", false);
								this.getView().byId("idDiscountTable").setProperty("visible", true);
							} else {
								this.getView().byId("idPricingOpt").setSelectedIndex(0);
								this.getView().byId("idParticiaptionTable").setProperty("visible", true);
								this.getView().byId("idDiscountTable").setProperty("visible", false);
							}

							this.getView().getModel("DataPercetCalculate").setProperty("/CustomerPer", ocust);
							this.getView().getModel("DataPercetCalculate").setProperty("/DealerPer", odeal);
							this.getView().getModel("DataPercetCalculate").setProperty("/TCIPer", otci);
							this.getView().getModel("DataPercetCalculate").setProperty("/PartPer", oPartPer);
							this.getView().getModel("DataPercetCalculate").setProperty("/LabourPer", oLabourPer);
							this.getView().getModel("DataPercetCalculate").setProperty("/SubletPer", oSubletPer);
							this._fnClaimSum();
							this._fnClaimSumPercent();
						}, this)
					});

				} else {
					this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
					this.getModel("LocalDataModel").setProperty("/reCalculate", false);
					this.getModel("LocalDataModel").setProperty("/PercentState", false);
					this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);
					this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoAuthorization"));
					this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveClaim"));
					this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber") + " : " + oClaim);
				}

				this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaim);
				this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idFilter05").setProperty("enabled", true);
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idFilter07").setProperty("enabled", true);

				this.getView().getModel("DateModel").setProperty("/saveClaimSt", false);
				this.getView().getModel("DateModel").setProperty("/updateClaimSt", true);

				this.getView().byId("idFilter01").setProperty("enabled", true);
				var oECPModel = this.getOwnerComponent().getModel("EcpSalesModel");
				var oBusinessModel = this.getModel("ApiBusinessModel");

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "' "
					},
					success: $.proxy(function (data) {
						var submissionType = data.results[0].WarrantyClaimSubType;

						var oPartner = data.results[0].Partner;

						var oTextUser = sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser");

						if (data.results[0].WarrantyClaimType == "ZECP") {
							this.getModel("LocalDataModel").setProperty("/oCurrentDealerLabour", this.getModel("LocalDataModel").getProperty(
								"/oDealerLabour/ECPNewLabourRate"));

							this.getModel("LocalDataModel").setProperty("/DealerPriceText", oBundle.getText("MSRP"));
						} else {
							this.getModel("LocalDataModel").setProperty("/oCurrentDealerLabour", this.getModel("LocalDataModel").getProperty(
								"/oDealerLabour/WTYNewLabourRate"));

							this.getModel("LocalDataModel").setProperty("/DealerPriceText", oBundle.getText("DealerNetPrice"));
						}

						if (data.results[0].ExternalObjectNumber == "") {
							this.getView().getModel("DateModel").setProperty("/OdometerReq", false);
							this.getView().getModel("DateModel").setProperty("/OdometerReqMan", false);

							this.getView().getModel("DateModel").setProperty("/oRadioVinIndex", 1);
							//this.getView().byId("idRequestType").setSelectedIndex(1);
						}

						if (oClaimSelectedGroup == "Claim") {

							if (data.results[0].AuthorizationNumber != "") {
								oProssingModel.read("/zc_authorization_detailsSet", {
									urlParameters: {
										"$filter": "AuthorizationNumber eq '" + data.results[0].AuthorizationNumber + "'"
									},
									success: $.proxy(function (oAuthData) {
										this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
									}, this)
								});

								oProssingModel.read("/zc_authorizationSet", {
									urlParameters: {
										"$filter": "DBOperation eq 'READ'and AuthorizationNumber eq '" + data.results[0].AuthorizationNumber +
											"'and DealerPer eq '00'and CustomerPer eq '00'and TCIPer eq '00'and PartPer eq '00'and LabourPer eq '00'and SubletPer eq '00'"
									},
									success: $.proxy(function (authData) {
										this.getView().getModel("DataPercetCalculate").setData(authData.results[0]);
										var ocust = parseInt(authData.results[0].CustomerPer).toString();
										var odeal = parseInt(authData.results[0].DealerPer).toString();
										var otci = parseInt(authData.results[0].TCIPer).toString();
										var oPartPer = parseInt(authData.results[0].PartPer).toString();
										var oLabourPer = parseInt(authData.results[0].LabourPer).toString();
										var oSubletPer = parseInt(authData.results[0].SubletPer).toString();

										if (oPartPer != "0" || oLabourPer != "0" || oSubletPer != "0") {
											this.getView().byId("idPricingOpt").setSelectedIndex(1);
											this.getView().byId("idParticiaptionTable").setProperty("visible", false);
											this.getView().byId("idDiscountTable").setProperty("visible", true);
										} else {
											this.getView().byId("idPricingOpt").setSelectedIndex(0);
											this.getView().byId("idParticiaptionTable").setProperty("visible", true);
											this.getView().byId("idDiscountTable").setProperty("visible", false);
										}

										this.getView().getModel("DataPercetCalculate").setProperty("/CustomerPer", ocust);
										this.getView().getModel("DataPercetCalculate").setProperty("/DealerPer", odeal);
										this.getView().getModel("DataPercetCalculate").setProperty("/TCIPer", otci);

										this.getView().getModel("DataPercetCalculate").setProperty("/PartPer", oPartPer);
										this.getView().getModel("DataPercetCalculate").setProperty("/LabourPer", oLabourPer);
										this.getView().getModel("DataPercetCalculate").setProperty("/SubletPer", oSubletPer);

										this._fnClaimSumPercent();
										this._fnClaimSum();

									}, this)
								});
							}
						}

						oProssingModel.read("/ZC_CLAIM_SUBLET_CODE", {
							urlParameters: {
								"$filter": "Clmty eq '" + data.results[0].WarrantyClaimType + "'and LanguageKey eq '" + sSelectedLocale.toUpperCase() +
									"'"
							},
							success: $.proxy(function (subData) {
								this.getModel("LocalDataModel").setProperty("/ClaimSubletCodeModel", subData.results);

							}, this),
							error: function (err) {
								console.log(err);
							}
						});

						if (data.results[0].ExternalObjectNumber != "") {
							//	this.getView().byId("idRequestType").setSelectedIndex(0);
							this.getView().getModel("DateModel").setProperty("/oRadioVinIndex", 0);
							oProssingModel.read("/zc_vehicle_informationSet", {
								urlParameters: {
									"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'and Vin eq '" + data.results[0].ExternalObjectNumber +
										"'",
									"$expand": "ZC_SPECIAL_HANDLINGVEHICLESET,ZC_WRITTENOFFVEHICLESET"

								},
								//	"$expand": "ZC_SPECIAL_HANDLINGVEHICLESET, ZC_WRITTENOFFVEHICLESET"
								success: $.proxy(function (vehData) {
									this.getModel("LocalDataModel").setProperty("/DataVinDetails", vehData.results[0]);
									var oRepDate = this.getView().getModel("HeadSetData").getProperty("/RepairDate");
									var regTime = new Date(vehData.results[0].RegDate).getTime();
									var repTime = new Date(oRepDate).getTime();
									var oMonth = (regTime - repTime) / (1000 * 60 * 60 * 24 * 30);
									//parseFloat(oMonth).toFixed(2);
									this.getModel("LocalDataModel").setProperty("/VehicleMonths", Math.abs(oMonth.toFixed(1)));

									if (vehData.results[0].ForeignVIN == "YES") {
										this.getView().getModel("DateModel").setProperty("/foreignVinInd", true);
										this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancemiles"));
									} else {
										this.getView().getModel("DateModel").setProperty("/foreignVinInd", false);
										this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancekm"));
									}

									if (vehData.results[0].WrittenOff == "YES") {
										this.getView().getModel("DateModel").setProperty("/writtenOffInd", true);
									} else {
										this.getView().getModel("DateModel").setProperty("/writtenOffInd", false);
									}

									if (vehData.results[0].SpecialVINReview == "YES") {

										this.getView().getModel("DateModel").setProperty("/specialVinInd", true);
									} else {

										this.getView().getModel("DateModel").setProperty("/specialVinInd", false);

									}

									this.getModel("LocalDataModel").setProperty("/DataSpecialHandlingSet", vehData.results[0].ZC_SPECIAL_HANDLINGVEHICLESET
										.results);
									this.getModel("LocalDataModel").setProperty("/DataWrittenOffSet", vehData.results[0].ZC_WRITTENOFFVEHICLESET.results);
								}, this),
								error: function () {}
							});

						} else {
							//this.getView().byId("idRequestType").setSelectedIndex(1);
							this.getView().getModel("DateModel").setProperty("/oRadioVinIndex", 1);
							this.getView().getModel("DateModel").setProperty("/foreignVinInd", false);
							this.getView().getModel("DateModel").setProperty("/writtenOffInd", false);
							this.getView().getModel("DateModel").setProperty("/specialVinInd", false);
						}

						if (oClaimTypeDetail == "ZECP") {
							this.getView().getModel("DateModel").setProperty("/oECPfields", true);

							oProssingModel.read("/zc_cliam_agreement", {
								urlParameters: {
									"$filter": "VIN eq '" + data.results[0].ExternalObjectNumber + "'"
								},
								success: $.proxy(function (agrData) {
									this.getModel("LocalDataModel").setProperty("/AgreementDataECP", agrData.results);
									var oTable = this.getView().byId("idECPAGR");
									var oLength = agrData.results.filter(function (item) {
										return item.AgreementStatus == "Active"
									}).length;
									var oTableSelectedRow = agrData.results.findIndex(function (item) {
										if (data.results[0].AgreementNumber != "") {
											return item.AgreementNumber == data.results[0].AgreementNumber

										} else {
											return item.AgreementStatus == "Active"
										}
									});

									for (let i = 0; i < agrData.results.length; i++) {
										if (agrData.results[i].AgreementStatus == "Suspended") {
											oTable.getItems()[i].getCells()[0].setProperty("enabled", false);
											oTable.getItems()[i].getCells()[0].setProperty("selected", false);
										} else if (agrData.results[i].AgreementStatus == "Expired" && agrData.results[i].AgreementthruDate < this.getView().getModel(
												"HeadSetData").getProperty("/RepairDate")) {
											oTable.getItems()[i].getCells()[0].setProperty("enabled", false);
											oTable.getItems()[i].getCells()[0].setProperty("selected", false);
										} else {
											oTable.getItems()[i].getCells()[0].setProperty("enabled", true);
											oTable.getItems()[i].getCells()[0].setProperty("selected", false);
										}
									}

									oTable.getItems()[oTableSelectedRow].getCells()[0].setProperty("selected", true);
									this.getView().getModel("HeadSetData").setProperty("/AgreementNumber", agrData.results[oTableSelectedRow].AgreementNumber);

								}, this),
								error: function () {}
							});

							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/authHide", false);
							this.getView().getModel("DateModel").setProperty("/oECPfields", true);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);
						} else if (oClaimTypeDetail == "ZWP2" || submissionType == "ZWP2") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", false);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", false);
							this.getView().getModel("DateModel").setProperty("/Labour", false);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Authorization", true);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", true);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", true);
							this.getView().getModel("DateModel").setProperty("/DisableRadio", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/P1p2", true);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/authHide", true);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
						} else if (oClaimTypeDetail == "ZWP1" || submissionType == "ZWP1") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/Authorization", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", true);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", true);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);

							this.getView().getModel("DateModel").setProperty("/authHide", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);
						} else if (oClaimTypeDetail == "ZWMS" || submissionType == "ZWMS") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", false);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Parts", false);
							this.getView().getModel("DateModel").setProperty("/Labour", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", true);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/DisableRadio", false);
							this.getView().getModel("DateModel").setProperty("/authHide", false);
						} else if (oClaimTypeDetail == "ZWA1" || submissionType == "ZWA1" || oClaimTypeDetail == "ZWA2" || submissionType == "ZWA2") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/authHide", false);
						} else if (oClaimTypeDetail == "ZWA2" || submissionType == "ZWA2") {
							this.getView().getModel("DateModel").setProperty("/DisableRadio", false);
						} else if (oClaimTypeDetail == "ZWAC" || submissionType == "ZWAC") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", true);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/authHide", false);
						} else if (oClaimTypeDetail == "ZWVE" || submissionType == "ZWVE") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", true);
							this.getView().getModel("DateModel").setProperty("/Authorization", true);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);
							this.getView().getModel("DateModel").setProperty("/authHide", true);
							this._fnClaimSumPercent();
						} else if (oClaimTypeDetail == "ZGGW" || submissionType == "ZGGW") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", true);
							this.getView().getModel("DateModel").setProperty("/Authorization", true);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/authHide", true);
							this._fnClaimSumPercent();
						} else if (oClaimTypeDetail == "ZCSR" || oClaimTypeDetail == "ZCER" || oClaimTypeDetail == "ZCLS") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", true);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/authHide", true);
						} else if (oClaimTypeDetail == "ZCWE") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", true);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/authHide", false);
						} else if (oClaimTypeDetail == "ZSSM") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Sublet", false);
							this.getView().getModel("DateModel").setProperty("/Labour", false);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);

							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/authHide", false);

						} else if (oClaimTypeDetail == "ZSCR") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Sublet", false);
							this.getView().getModel("DateModel").setProperty("/Labour", false);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/oVisibleRepDate", false);
							this.getView().getModel("DateModel").setProperty("/oVisibleReOrder", false);
							this.getView().getModel("DateModel").setProperty("/OdometerReqMan", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/authHide", false);

						} else if (oClaimTypeDetail == "ZSSE") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);
							this.getView().getModel("DateModel").setProperty("/authHide", false);
						} else if (oClaimTypeDetail == "ZRCR") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Parts", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Labour", false);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/authHide", false);
						} else if (oClaimTypeDetail == "ZLDC") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/damageLine", false);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", true);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", true);
							this.getView().getModel("DateModel").setProperty("/LabourBtnVsbl", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/authHide", false);
						} else {
							this.getView().getModel("DateModel").setProperty("/LabourBtnVsbl", true);
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/authHide", false);
						}

						var HeadSetData = new sap.ui.model.json.JSONModel(data.results[0]);
						HeadSetData.setDefaultBindingMode("TwoWay");
						this.getView().setModel(HeadSetData, "HeadSetData");

						this.getView().getModel("LocalDataModel").setProperty("/step01Next", true);

						if (data.results[0].DecisionCode == "") {
							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", false);
							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getModel("LocalDataModel").setProperty("/PercentState", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
						} else if (data.results[0].DecisionCode == "ZTAC") {
							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", true);
							this.getView().getModel("DateModel").setProperty("/updateEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", false);

							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);
							this.getView().getModel("DateModel").setProperty("/damageLine", false);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
							this.getModel("LocalDataModel").setProperty("/PercentState", false);
						} else if (data.results[0].DecisionCode == "ZTAA") {
							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", false);
							this.getView().getModel("DateModel").setProperty("/damageLine", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);
							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
							this.getModel("LocalDataModel").setProperty("/PercentState", false);

						} else if (data.results[0].DecisionCode == "ZTMR" && sap.ui.getCore().getModel("UserDataModel").getProperty(
								"/LoggedInUser") == "Dealer_Services_Manager") {

							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
							this.getView().getModel("DateModel").setProperty("/damageLine", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", false);

							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
							this.getView().getModel("DateModel").setProperty("/authAcClm", true);
							this.getView().getModel("DateModel").setProperty("/authRejClm", true);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", true);
							this.getModel("LocalDataModel").setProperty("/PercentState", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);

						} else if (data.results[0].DecisionCode == "ZTMR") {

							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
							this.getView().getModel("DateModel").setProperty("/damageLine", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", false);

							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
							this.getModel("LocalDataModel").setProperty("/PercentState", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
						} else {
							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);

							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);
							this.getView().getModel("DateModel").setProperty("/damageLine", false);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
							this.getModel("LocalDataModel").setProperty("/PercentState", false);

						}

						if (data.results[0].DecisionCode == "ZTIC" && oClaimNav != "Inq" && sap.ui.getCore().getModel(
								"UserDataModel").getProperty("/LoggedInUser") != "Zone_User" &&
							sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") != "TCI_Admin") {

							if (oClaimSelectedGroup == "Authorization") {
								this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
								this.getModel("LocalDataModel").setProperty("/PercentState", true);
							} else {
								this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
								this.getModel("LocalDataModel").setProperty("/PercentState", false);
							}
							this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
							this.getModel("LocalDataModel").setProperty("/FeedEnabled", true);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", true);
							//this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", true);

							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);

							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", true);

						} else if (data.results[0].DecisionCode == "ZTRC" && oClaimNav != "Inq" && sap.ui.getCore().getModel(
								"UserDataModel").getProperty("/LoggedInUser") != "Zone_User" &&
							sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") != "TCI_Admin") {
							//	sap.ui.getCore().getModel(	"UserDataModel").getProperty("/LoggedInUser") != "Zone_User" && sap.ui.getCore().getModel("UserDataModel").getProperty(
							//	"/LoggedInUser") != "TCI_Admin"

							if (oClaimSelectedGroup == "Authorization") {
								this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
								this.getModel("LocalDataModel").setProperty("/PercentState", true);
							} else {
								this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
								this.getModel("LocalDataModel").setProperty("/PercentState", false);
							}
							this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
							this.getModel("LocalDataModel").setProperty("/FeedEnabled", true);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", true);

							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", true);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", true);
							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", true);

							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);
						}

						//this.onP2Claim(oClaimTypeDetail);
						this._fnOFPenabled();
						this._fnDealerContact();

						if (oClaimTypeDetail == "ZSCR" && data.results[0].DecisionCode != "ZTIC") {
							this.getView().getModel("DateModel").setProperty("/oSlipVisible", true);
						} else if (oClaimTypeDetail == "ZSCR" && data.results[0].DecisionCode == "ZTIC") {
							this.getView().getModel("DateModel").setProperty("/oSlipVisible", false);
						} else if (oClaimTypeDetail == "ZSCR" && data.results[0].DecisionCode == "ZTRC") {
							this.getView().getModel("DateModel").setProperty("/oSlipVisible", false);
						}

						if (oClaimTypeDetail == "ZSCR") {
							this.getView().getModel("DateModel").setProperty("/oTciQtyAppr", true);
						} else {
							this.getView().getModel("DateModel").setProperty("/oTciQtyAppr", false);
						}

						if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZACD" &&
							this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWVE") {
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
						}
						if (oClaimTypeDetail == "ZSSM") {
							this.getView().getModel("DateModel").setProperty("/oUpdatePartLine", false);
							this.getView().getModel("DateModel").setProperty("/oAddPartLine", false);

						} else {
							this.getView().getModel("DateModel").setProperty("/oUpdatePartLine", true);
							this.getView().getModel("DateModel").setProperty("/oAddPartLine", true);
						}
					}, this),
					error: function () {}
				});

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "'"
					},
					success: $.proxy(function (sdata) {

						this.getModel("LocalDataModel").setProperty("/ClaimDetails", sdata.results[0]);
						this.getView().getModel("HeadSetData").setData(sdata.results[0]);
						var oBusinessModel = this.getModel("ApiBusinessModel");
						oBusinessModel.read("/A_BusinessPartner", {
							urlParameters: {
								"$filter": "BusinessPartner eq '" + this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner") + "'"
							},
							success: $.proxy(function (busData) {
								this.getModel("LocalDataModel").setProperty("/BPOrgName", busData.results[0].OrganizationBPName1);
							}, this)
						});

						oProssingModel.read("/zc_headSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + oClaim +
									"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'",
								"$expand": "zc_claim_commentSet,zc_claim_vsrSet,zc_claim_read_descriptionSet"
							},
							success: $.proxy(function (errorData) {
								this.getModel("LocalDataModel").setProperty("/oErrorSet", errorData.results[0].zc_claim_vsrSet.results);
								this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", errorData.results[0].zc_claim_read_descriptionSet
									.results[
										0].OFPDescription);
								this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", errorData.results[0].zc_claim_read_descriptionSet
									.results[0].MainOpsCodeDescription);

								this.getView().getModel("HeadSetData").setProperty("/ReferenceDate", errorData.results[0].zc_claim_read_descriptionSet
									.results[0].ReferenceDate);

								this.getView().getModel("HeadSetData").setProperty("/DateOfApplication", errorData.results[0].zc_claim_read_descriptionSet
									.results[0].DateOfApplication);
								this.getView().getModel("HeadSetData").setProperty("/RepairDate", errorData.results[0].zc_claim_read_descriptionSet
									.results[0].RepairDate);
								this.getView().getModel("HeadSetData").setProperty("/PreviousROInvoiceDate", errorData.results[0].zc_claim_read_descriptionSet
									.results[0].PreviousROInvoiceDate);
								this.getView().getModel("HeadSetData").setProperty("/DeliveryDate", errorData.results[0].zc_claim_read_descriptionSet
									.results[0].DeliveryDate);
								this.getView().getModel("HeadSetData").setProperty("/AccessoryInstallDate", errorData.results[0].zc_claim_read_descriptionSet
									.results[0].AccessoryInstallDate);
								this.getModel("LocalDataModel").setProperty("/claim_commentSet", errorData.results[0].zc_claim_commentSet.results);

							}, this),
							error: function (err) {
								console.log(err);
							}
						});

					}, this)
				});

				oProssingModel.read("/zc_claim_item_price_dataSet", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
							"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "

					},
					success: $.proxy(function (data) {
						oProssingModel.read("/zc_claim_item_damageSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
									"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "
							},
							success: $.proxy(function (sddata) {

								this.getModel("LocalDataModel").setProperty("/DataItemDamageSet", sddata.results);

								var oDamageItem = sddata.results.map(function (item) {
									return {
										DmgAreaCode: item.DmgAreaCode,
										DmgSevrCode: item.DmgSevrCode,
										DmgTypeCode: item.DmgTypeCode

									};

								});

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
										PartQty: item.PartQty
									};

								});

								var oIndexMat = PartItem.findIndex($.proxy(function (item) {
									return item.MaterialNumber == this.getView().getModel("HeadSetData").getProperty("/OFP")
								}), this);
								if (oIndexMat > -1) {
									this.getView().byId("idTableParts").getItems()[oIndexMat].getCells()[1].setProperty("selected", true);
								}
								var oFilteredDataLabour = pricinghData.filter(function (val) {
									return val.ItemType === "FR" && val.LabourNumber[0] != "P";
								});
								var LabourItem = oFilteredDataLabour.map(function (item) {
									return {
										ItemType: "FR",
										Type: "LABOUR",
										LabourNumber: item.LabourNumber,
										LabourDescription: item.LabourDescription,
										ClaimedHours: item.QtyHrs
									};

								});

								this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredDataLabour);
								var oIndexLab = LabourItem.findIndex($.proxy(function (item) {
									return item.LabourNumber == this.getView().getModel("HeadSetData").getProperty("/MainOpsCode")
								}), this);
								if (oIndexLab > -1) {
									this.getView().byId("idLabourTable").getItems()[oIndexLab].getCells()[1].setProperty("selected", true);
								}

								var oFilteredDataPaint = pricinghData.filter(function (val) {
									return val.ItemType === "FR" && val.LabourNumber[0] == "P";
								});
								this.getModel("LocalDataModel").setProperty("/PaintPricingDataModel", oFilteredDataPaint);

								var PaintItem = oFilteredDataPaint.map(function (item) {
									return {
										ItemType: "FR",
										PaintPositionCode: item.LabourNumber,
										ClaimedHours: item.QtyHrs
									};

								});

								var oIndexPaint = PaintItem.findIndex($.proxy(function (item) {
									return item.PaintPositionCode == this.getView().getModel("HeadSetData").getProperty("/MainOpsCode")
								}), this);
								if (oIndexPaint > -1) {
									this.getView().byId("idPaintTable").getItems()[oIndexPaint].getCells()[1].setProperty("selected", true);
								}

								var oFilteredDataSubl = pricinghData.filter(function (val) {
									return val.ItemType === "SUBL";
								});

								this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredDataSubl);
								var SubletItem = oFilteredDataSubl.map(function (item) {
									return {
										ItemType: "SUBL",
										InvoiceNo: item.InvoiceNo,
										UnitOfMeasure: item.Meinh,
										Amount: item.Amount,
										SubletDescription: item.SubletDescription,
										URI: item.URI,
										SubletType: item.ItemKey,
										Brand: item.Brand,
										Days: item.Days
									};

								});

								this.obj = {
									"DBOperation": "SAVE",
									"Message": "",
									"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
									"Partner": this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner"),
									"ActionCode": "",
									"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
									"PartnerRole": "AS",
									"ReferenceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate")),
									"DateOfApplication": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication")),
									"FinalProcdDate": null,
									"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
									"RepairOrderNumberExternal": this.getView().getModel("HeadSetData").getProperty("/RepairOrderNumberExternal"),
									"ExternalNumberOfClaim": this.getView().getModel("HeadSetData").getProperty("/ExternalNumberOfClaim"),
									"ExternalObjectNumber": this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber"),
									"Odometer": this.getView().getModel("HeadSetData").getProperty("/Odometer"),
									"Delivery": "",
									"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
									"TCIWaybillNumber": "",
									"ShipmentReceivedDate": null,
									"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
									"DeliveringCarrier": "",
									"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
									"OFP": this.getView().getModel("HeadSetData").getProperty("/OFP"),
									"WTYClaimRecoverySource": "",
									"MainOpsCode": this.getView().getModel("HeadSetData").getProperty("/MainOpsCode"),
									"T1WarrantyCodes": this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes"),
									"BatteryTestCode": this.getView().getModel("HeadSetData").getProperty("/BatteryTestCode"),
									"T2WarrantyCodes": this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes"),
									"FieldActionReference": this.getView().getModel("HeadSetData").getProperty("/FieldActionReference").toUpperCase(),
									"ZCondition": this.getView().getModel("HeadSetData").getProperty("/ZCondition"),
									"Cause": this.getView().getModel("HeadSetData").getProperty("/Cause"),
									"Remedy": this.getView().getModel("HeadSetData").getProperty("/Remedy"),
									"PreviousROInvoiceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty(
										"/PreviousROInvoiceDate")),
									"PreviousROOdometer": this.getView().getModel("HeadSetData").getProperty("/PreviousROOdometer"),
									"PreviousROInvoice": this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoice"),
									"AccessoryInstallOdometer": this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallOdometer"),
									"AccessoryInstallDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty(
										"/AccessoryInstallDate")),
									"AgreementNumber": this.getView().getModel("HeadSetData").getProperty("/AgreementNumber"),
									"CustomerPostalCode": this.getView().getModel("HeadSetData").getProperty("/CustomerPostalCode"),
									"CustomerFullName": this.getView().getModel("HeadSetData").getProperty("/CustomerFullName"),
									"WarrantyClaimSubType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType"),
									"zc_itemSet": {
										"results": PartItem
									},
									"zc_claim_item_labourSet": {
										"results": LabourItem
									},
									"zc_claim_item_paintSet": {
										"results": PaintItem
									},
									"zc_item_subletSet": {
										"results": SubletItem
									},
									"zc_claim_attachmentsSet": {
										"results": []
									},
									"zc_claim_item_damageSet": {
										"results": oDamageItem
									},
									"zc_claim_commentSet": {
										"results": this.getModel("LocalDataModel").getProperty("/claim_commentSet")
									},
									"zc_claim_vsrSet": {
										"results": []
									},
									"zc_claim_item_price_dataSet": {
										"results": pricinghData
									}
								};
							}, this)
						});

					}, this),
					error: function () {}
				});

				oProssingModel.read("/zc_claim_attachmentsSet", {
					urlParameters: {
						// "$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'"
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'"
					},
					success: $.proxy(function (odata) {
						// var oFilteredItem = odata.results.filter(function (item) {
						// 	return !item.FileName.startsWith("sub");

						// });
						// this.getModel("LocalDataModel").setProperty("/oAttachmentSet", );
						var oArr = odata.results;
						var oAttachSet = oArr.map(function (item) {
							item.FileName = item.FileName.replace("HEAD@@@", "");
							return item;

						});
						// this.getView().getModel("ClaimModel").setProperty("/" + "/items", oArr);
						this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", oAttachSet);
					}, this)
				});
				if (oClaimTypeDetail == "ZECP") {
					this.getView().getModel("DateModel").setProperty("/oECPfields", true);
				} else {
					this.getView().getModel("DateModel").setProperty("/oECPfields", false);
				}
				if (oClaimNav === "Inq") {
					this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
					this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
					this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
					this.getView().getModel("DateModel").setProperty("/updateEnable", false);
					this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
					this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
				}
				//this._fnOFPenabled();
				this._fnClaimSum();
				//this._fnDealerContact();
				this._fnClaimSumPercent();

			} else {
				var oPartner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
				var oBusinessModel = this.getModel("ApiBusinessModel");
				oBusinessModel.read("/A_BusinessPartner", {
					urlParameters: {
						"$filter": "BusinessPartner eq '" + oPartner + "'"
					},
					success: $.proxy(function (sdata) {
						this.getModel("LocalDataModel").setProperty("/BPOrgName", sdata.results[0].OrganizationBPName1);
					}, this)
				});

				if (oClaimSelectedGroup == "Authorization") {
					this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", true);

				} else {
					this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);
				}

				this.getModel("LocalDataModel").setProperty("/step01Next", false);
				this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
				this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", "");
				this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", "");
				oProssingModel.read("/zc_claim_groupSet", {
					urlParameters: {
						"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
					},
					success: $.proxy(function (data) {
						var oResult = data.results;
						var oSubmissionData = oResult.filter(function (v, t) {
							return v.AuthorizationApply != "";
						});

						this.getModel("LocalDataModel").setProperty("/DataSubmissionClaim", oSubmissionData);

					}, this)
				});

				this.getModel("LocalDataModel").setProperty("/DataItemDamageSet", "");
				if (oClaimAuthType == "Authorization") {
					this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveAuth"));
					this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoClaim"));
					this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIAuthNumber"));
					this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
					this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
					this.getModel("LocalDataModel").setProperty("/reCalculate", true);
					this.getModel("LocalDataModel").setProperty("/PercentState", true);
				} else {
					this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber"));
					this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
					this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoAuthorization"));
					this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveClaim"));
					this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
					this.getModel("LocalDataModel").setProperty("/reCalculate", false);
					this.getModel("LocalDataModel").setProperty("/PercentState", false);
				}
				//this.getView().getModel("DateModel").setProperty("/enableTab", false);
				this.getView().byId("idFilter02").setProperty("enabled", false);
				this.getView().byId("idFilter03").setProperty("enabled", false);
				this.getView().byId("idFilter04").setProperty("enabled", false);
				this.getView().byId("idFilter05").setProperty("enabled", false);
				this.getView().byId("idFilter06").setProperty("enabled", false);
				this.getView().byId("idFilter07").setProperty("enabled", false);
				this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
				oProssingModel.refresh();
				// this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
				// this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
				this.getModel("LocalDataModel").setProperty("/PricingDataModel", "");
				// this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
				this.getModel("LocalDataModel").setProperty("/AgreementDataECP", "");
				//this.getView().getModel("ClaimModel").setProperty("/" + "/items", "");
				this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", "");
				this.getView().getModel("DateModel").setProperty("/saveClaimSt", true);
				this.getView().getModel("DateModel").setProperty("/updateClaimSt", false);
				this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", "");
				this.getModel("LocalDataModel").setProperty("/PaintPricingDataModel", "");
				this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", "");
				this.HeadSetData = new sap.ui.model.json.JSONModel({
					"WarrantyClaimType": "",
					"WarrantyClaimSubType": "",
					"Partner": "",
					"PartnerRole": "",
					"ReferenceDate": null,
					"DateOfApplication": null,
					"FinalProcdDate": null,
					"Delivery": "",
					"DeliveryDate": null,
					"TCIWaybillNumber": "",
					"ShipmentReceivedDate": null,
					"DealerContact": "",
					"DeliveringCarrier": "",
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
					"NameOfPersonRespWhoChangedObj": "",
					"AccessoryInstallOdometer": "",
					"AccessoryInstallDate": null,
					"AgreementNumber": "",
					"CustomerPostalCode": "",
					"CustomerFullName": ""
				});
				this.HeadSetData.setDefaultBindingMode("TwoWay");

				this.getModel("LocalDataModel").setProperty("/ClaimDetails", "");
				this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
				this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
				//this.getView().getModel("DateModel").setProperty("/OdometerReq", true);
				this.obj = {
					"DBOperation": "SAVE",
					"NameOfPersonRespWhoChangedObj": "",
					"Message": "",
					"WarrantyClaimType": "",
					"WarrantyClaimSubType": "",
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
					"Delivery": "",
					"DeliveryDate": null,
					"TCIWaybillNumber": "",
					"ShipmentReceivedDate": null,
					"DealerContact": "",
					"DeliveringCarrier": "",
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
					"CustomerFullName": ""
				};
				// this.obj.DBOperation = "SAVE";
				this.obj.zc_itemSet = {};
				this.obj.zc_itemSet.results = [];
				this.obj.zc_item_subletSet = {
					"results": []
				};

				this.obj.zc_claim_item_labourSet = {
					"results": []
				};

				this.obj.zc_claim_item_paintSet = {
					"results": []
				};
				this.obj.zc_claim_attachmentsSet = {
					"results": []
				};

				this.obj.zc_claim_vsrSet = {
					"results": []
				};

				this.obj.zc_claim_item_price_dataSet = {
					"results": [{
						"PartQty": "0.000",
						"AmtClaimed": "0.000",
						"clmno": "",
						"DealerNet": "0.000",
						"DiffAmt": "0.000",
						"ExtendedValue": "0.000",
						"ItemType": "",
						"kappl": "",
						"kateg": "",
						"kawrt": "0.000",
						"kbetr": "0.000",
						"knumv": "",
						"kposn": "",
						"kschl": "",
						"kvsl1": "",
						"kwert": "0.000",
						"MarkUp": "0.000",
						"matnr": "",
						"posnr": "",
						"QtyHrs": "0.000",
						"quant": "0.000",
						"TCIApprAmt": "0.000",
						"TCIApprQty": "0.000",
						"TotalAfterDisct": "0.000",
						"v_rejcd": "",
						"valic": "0.000",
						"valoc": "0.000",
						"verknumv": "",
						"versn": ""
					}]
				};
				this.getView().getModel("DateModel").setProperty("/claimTypeEn", true);

				var sSelectedLocale;
				//  get the locale to determine the language.
				var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
				if (isLocaleSent) {
					sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
				} else {
					sSelectedLocale = "en"; // default is english
				}

				if (oGroupDescription == "WTY") {
					oProssingModel.read("/zc_claim_groupSet", {
						urlParameters: {
							"$filter": "ClaimGroup eq 'WTY'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
						},
						success: $.proxy(function (data) {

							var oResult = data.results;

							if (oClaimSelectedGroup == "Authorization") {
								this.oFilteredData = oResult.filter(function (v, t) {
									return v.TMCClaimType == "ZACD" || v.TMCClaimType == "ZAUT";
								});
								this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", true);
								this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
								this.getModel("LocalDataModel").setProperty("/reCalculate", true);
								this.getModel("LocalDataModel").setProperty("/PercentState", true);
							} else if (oClaimSelectedGroup == "Claim") {
								this.oFilteredData = oResult.filter(function (v, t) {
									return v.TMCClaimType != "ZACD" && v.TMCClaimType != "ZAUT";
								});
								this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);

							} else {
								this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);
							}
							this.getModel("LocalDataModel").setProperty("/ClaimGroupSet", this.oFilteredData);
						}, this),
						error: function () {}
					});
					this.getView().getModel("DateModel").setProperty("/Paint", true);
					this.getView().getModel("DateModel").setProperty("/Authorization", true);
				}
				if (oGroupDescription == "FAC") {

					oProssingModel.read("/zc_claim_groupSet", {
						urlParameters: {
							"$filter": "ClaimGroup eq 'FAC'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
						},
						success: $.proxy(function (data) {

							this.oFilteredData = data.results;
							this.getModel("LocalDataModel").setProperty("/ClaimGroupSet", this.oFilteredData);
						}, this),
						error: function () {
							console.log("Error");
						}
					});

					this.getView().getModel("DateModel").setProperty("/Paint", false);
					this.getView().getModel("DateModel").setProperty("/Sublet", true);
					this.getView().getModel("DateModel").setProperty("/Labour", true);
					this.getView().getModel("DateModel").setProperty("/Parts", true);
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
					this.getView().getModel("DateModel").setProperty("/Authorization", false);
					this.getView().getModel("DateModel").setProperty("/oECPfields", false);
					this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
					this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
					this.getView().getModel("DateModel").setProperty("/AcA1", false);
					this.getView().getModel("DateModel").setProperty("/P1p2", false);
					this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
				} else if (oGroupDescription == "STR") {
					oProssingModel.read("/zc_claim_groupSet", {
						urlParameters: {
							"$filter": "ClaimGroup eq 'STR'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
						},
						success: $.proxy(function (data) {

							this.oFilteredData = data.results;
							this.getModel("LocalDataModel").setProperty("/ClaimGroupSet", this.oFilteredData);
						}, this),
						error: function () {
							console.log("Error");
						}
					});
					this.getView().getModel("DateModel").setProperty("/Paint", true);
					this.getView().getModel("DateModel").setProperty("/Sublet", true);
					this.getView().getModel("DateModel").setProperty("/Parts", true);
					this.getView().getModel("DateModel").setProperty("/Labour", true);
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
					this.getView().getModel("DateModel").setProperty("/Authorization", false);
					this.getView().getModel("DateModel").setProperty("/oECPfields", false);
					this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
					this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
					this.getView().getModel("DateModel").setProperty("/AcA1", false);
					this.getView().getModel("DateModel").setProperty("/P1p2", false);
					this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);
				} else {
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);

				}

				if (oGroupDescription == "ECP") {
					oProssingModel.read("/zc_claim_groupSet", {
						urlParameters: {
							"$filter": "ClaimGroup eq 'ECP'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
						},
						success: $.proxy(function (data) {

							this.oFilteredData = data.results;
							this.getModel("LocalDataModel").setProperty("/ClaimGroupSet", this.oFilteredData);
						}, this),
						error: function () {
							console.log("Error");
						}
					});
					this.getView().getModel("DateModel").setProperty("/Paint", false);
					this.getView().getModel("DateModel").setProperty("/Sublet", true);
					this.getView().getModel("DateModel").setProperty("/Parts", true);
					this.getView().getModel("DateModel").setProperty("/Labour", true);
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
					this.getView().getModel("DateModel").setProperty("/Authorization", false);
					this.getView().getModel("DateModel").setProperty("/oECPfields", true);
					this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
					this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
					this.getView().getModel("DateModel").setProperty("/AcA1", false);
					this.getView().getModel("DateModel").setProperty("/P1p2", false);
					this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);
					this.getView().getModel("DateModel").setProperty("/authHide", false);

				} else {
					this.getView().getModel("DateModel").setProperty("/oECPfields", false);
				}

				if (oGroupDescription == "SCR") {
					oProssingModel.read("/zc_claim_groupSet", {
						urlParameters: {
							"$filter": "ClaimGroup eq 'SCR'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
						},
						success: $.proxy(function (data) {

							this.oFilteredData = data.results;
							this.getModel("LocalDataModel").setProperty("/ClaimGroupSet", this.oFilteredData);
						}, this),
						error: function () {
							console.log("Error");
						}
					});
					this.getView().getModel("DateModel").setProperty("/Paint", false);
					this.getView().getModel("DateModel").setProperty("/Sublet", false);
					this.getView().getModel("DateModel").setProperty("/Labour", false);
					this.getView().getModel("DateModel").setProperty("/Parts", true);
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
					this.getView().getModel("DateModel").setProperty("/Authorization", false);
					this.getView().getModel("DateModel").setProperty("/oECPfields", false);
					this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", false);
					this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
					this.getModel("LocalDataModel").setProperty("/step01Next", false);
					this.getView().getModel("DateModel").setProperty("/AcA1", false);
					this.getView().getModel("DateModel").setProperty("/P1p2", false);
					this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
					this.getView().getModel("DateModel").setProperty("/oVisibleRepDate", false);
					this.getView().getModel("DateModel").setProperty("/oVisibleReOrder", false);
					this.getView().getModel("DateModel").setProperty("/OdometerReqMan", false);
				}
				if (oGroupDescription == "VLC") {
					oProssingModel.read("/zc_claim_groupSet", {
						urlParameters: {
							"$filter": "ClaimGroup eq 'VLC'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
						},
						success: $.proxy(function (data) {

							this.oFilteredData = data.results;
							this.getModel("LocalDataModel").setProperty("/ClaimGroupSet", this.oFilteredData);
						}, this),
						error: function () {
							console.log("Error");
						}
					});
					this.getView().getModel("DateModel").setProperty("/Paint", false);
					this.getView().getModel("DateModel").setProperty("/LabourBtnVsbl", false);
					this.getView().getModel("DateModel").setProperty("/Sublet", true);
					this.getView().getModel("DateModel").setProperty("/Labour", true);
					this.getView().getModel("DateModel").setProperty("/Parts", true);
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
					this.getView().getModel("DateModel").setProperty("/Authorization", false);
					this.getView().getModel("DateModel").setProperty("/oECPfields", false);
					this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", false);
					this.getView().getModel("DateModel").setProperty("/ShipmentVisible", true);
					this.getModel("LocalDataModel").setProperty("/step01Next", false);
					this.getView().getModel("DateModel").setProperty("/damageLine", false);
					this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
					this.getView().getModel("DateModel").setProperty("/AcA1", false);
					this.getView().getModel("DateModel").setProperty("/P1p2", false);
					this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
					this.getView().getModel("DateModel").setProperty("/authHide", false);

				}

				if (oGroupDescription == "CRC") {
					oProssingModel.read("/zc_claim_groupSet", {
						urlParameters: {
							"$filter": "ClaimGroup eq 'CRC'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
						},
						success: $.proxy(function (data) {

							this.oFilteredData = data.results;
							this.getModel("LocalDataModel").setProperty("/ClaimGroupSet", this.oFilteredData);
						}, this),
						error: function () {
							console.log("Error");
						}
					});
					this.getView().getModel("DateModel").setProperty("/Paint", false);
					this.getView().getModel("DateModel").setProperty("/Sublet", true);
					this.getView().getModel("DateModel").setProperty("/Labour", false);
					this.getView().getModel("DateModel").setProperty("/Parts", false);
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
					this.getView().getModel("DateModel").setProperty("/Authorization", false);
					this.getView().getModel("DateModel").setProperty("/oECPfields", false);
					this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
					this.getModel("LocalDataModel").setProperty("/step01Next", false);
					this.getView().getModel("DateModel").setProperty("/AcA1", false);
					this.getView().getModel("DateModel").setProperty("/P1p2", false);
					this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
					this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
					this.getView().getModel("DateModel").setProperty("/authHide", false);
				}

				this._fnOFPenabled();
				this._fnDealerContact();
				this.getModel("LocalDataModel").setProperty("/ClaimSum", "");

			}
			this.getView().setModel(this.HeadSetData, "HeadSetData");
		},
		// _fnEnableEdit: function () {
		// 	if (this.getModel("LocalDataModel").getProperty("/UploadEnable") == false) {
		// 		this.getView().byId("idHeadAttachment").addStyleClass("hideDltBtn");
		// 	} else {
		// 		this.getView().byId("idHeadAttachment").addStyleClass("showDltBtn");
		// 	}
		// },
		_fnOFPenabled: function () {
			if (
				this.getModel("LocalDataModel").getProperty("/oFieldAction") == "FAC" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZCSR" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZCER" ||

				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZCLS" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZCER" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZCLS" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZCSR"

			) {
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", false);
				this.getView().getModel("DateModel").setProperty("/enabledT2", false);
				this.getView().getModel("DateModel").setProperty("/enabledT1", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
				this.getView().getModel("DateModel").setProperty("/authHide", true);

			} else if (this.getModel("LocalDataModel").getProperty("/oFieldAction") == "STR" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSSE") {
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", false);
				this.getView().getModel("DateModel").setProperty("/enabledT1", false);
				this.getView().getModel("DateModel").setProperty("/enabledT2", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", false);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
				this.getView().getModel("DateModel").setProperty("/authHide", false);
			} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZCWE" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZCWE") {
				this.getView().getModel("DateModel").setProperty("/enabledT2", false);
				this.getView().getModel("DateModel").setProperty("/enabledT1", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", true);
				this.getView().getModel("DateModel").setProperty("/authHide", true);
			} else {
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/enabledT2", true);
				this.getView().getModel("DateModel").setProperty("/enabledT1", true);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
			}

		},

		_fnDealerContact: function () {
			if (this.getModel("LocalDataModel").getProperty("/oFieldAction") == "VLC" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZLDC") {
				this.getView().getModel("DateModel").setProperty("/oDealerContactReq", true);
				this.getView().getModel("DateModel").setProperty("/enabledT2", false);
				this.getView().getModel("DateModel").setProperty("/enabledT1", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", false);
				this.getView().getModel("DateModel").setProperty("/authHide", false);
			} else {
				this.getView().getModel("DateModel").setProperty("/oDealerContactReq", false);

			}
		},

		onChangeDate: function (oEvent) {
			var oClaimModel = this.getModel("ProssingModel");
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZECP") {
				oClaimModel.read("/zc_cliam_agreement", {
					urlParameters: {
						"$filter": "VIN eq '" + this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber") +
							"'"
					},
					success: $.proxy(function (data) {

						this.getModel("LocalDataModel").setProperty("/AgreementDataECP", data.results);
						var oTable = this.getView().byId("idECPAGR");
						var oLength = data.results.filter(function (item) {
							return item.AgreementStatus == "Active"
						}).length;
						var oTableSelectedRow = data.results.findIndex(function (item) {
							return item.AgreementStatus == "Active"
						});

						for (let i = 0; i < data.results.length; i++) {
							if (data.results[i].AgreementStatus == "Suspended") {
								oTable.getItems()[i].getCells()[0].setProperty("enabled", false);
								oTable.getItems()[i].getCells()[0].setProperty("selected", false);
							} else if (data.results[i].AgreementStatus == "Expired" && data.results[i].AgreementthruDate <
								this.getView().getModel("HeadSetData").getProperty("/RepairDate")) {
								oTable.getItems()[i].getCells()[0].setProperty("enabled", false);
								oTable.getItems()[i].getCells()[0].setProperty("selected", false);
							} else {
								oTable.getItems()[i].getCells()[0].setProperty("enabled", true);
								oTable.getItems()[i].getCells()[0].setProperty("selected", false);
							}

						}
						if (oLength > 1) {
							//this.getView().byId("idECPAGR").removeSelections();
							oTable.getItems()[oTableSelectedRow].getCells()[0].setProperty("selected", false);
						} else if (oLength == 1) {
							//oTable.setSelectedIndex(oTableSelectedRow);

							oTable.getItems()[oTableSelectedRow].getCells()[0].setProperty("selected", true);
							this.getView().getModel("HeadSetData").setProperty("/AgreementNumber", data.results[
								oTableSelectedRow].AgreementNumber);
						}
					}, this),
					error: function () {}
				});
			}

			//console.log(oEvent.getSource().getDateValue());
		},

		onAddComment: function (oEvent) {
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.ClaimComments", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
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
		onEnterCommentText: function (oEvent) {
			var oText = oEvent.getParameters().value;
			if (oText.length >= 2) {
				this.getModel("LocalDataModel").setProperty("/enableEnterComment", true);
			} else {
				this.getModel("LocalDataModel").setProperty("/enableEnterComment", false);
			}
		},

		onPost: function (oEvent) {

			var oBusinessModel = this.getModel("ApiBusinessModel");
			this.getModel("LocalDataModel").setProperty("/commentIndicator", true);

			var oPartner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");

			var oClaimModel = this.getModel("ProssingModel");

			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oFormat = DateFormat.getDateTimeInstance({
				style: "medium"
			});

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd HH:mm:ss"
			});
			var oDate = oDateFormat.format(new Date());
			// 			var oObject = this.getView().getBindingContext().getObject();
			var sValue = oEvent.getParameter("value");

			var oCurrentDt = new Date();

			var oEntry = {

				"HeadText": this.getModel("LocalDataModel").getProperty("/BPOrgName") + "(" + oDate + ") " + " : " + sValue,
				"NumberOfWarrantyClaim": this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum"),
				"LanguageKey": sSelectedLocale.toUpperCase(),
				"User": "",
				"Date": null
			};
			this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");

			this.obj.zc_claim_commentSet.results.push(oEntry);

			oClaimModel.refreshSecurityToken();
			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					this.getModel("LocalDataModel").setProperty("/commentIndicator", false);
					oClaimModel.read("/zc_headSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
								"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'",
							"$expand": "zc_claim_commentSet"
						},
						success: $.proxy(function (sdata) {
							this.getModel("LocalDataModel").setProperty("/claim_commentSet", sdata.results[0].zc_claim_commentSet.results);
						}, this)
					});
				}, this)
			});
		},

		onEnterComment: function () {
			this.getModel("LocalDataModel").setProperty("/enableEnterComment", false);
			var oPrevComment = this.getView().getModel("HeadSetData").getProperty("/HeadText");
			var oPartner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd HH:mm:ss"
			});
			var oDate = oDateFormat.format(new Date());
			var oText = this.getView().getModel("HeadSetData").getProperty("/NewText");

			var oBusinessModel = this.getModel("ApiBusinessModel");
			oBusinessModel.read("/A_BusinessPartner", {
				urlParameters: {
					"$filter": "BusinessPartner eq '" + oPartner + "'"
				},
				success: $.proxy(function (data) {
					var oPartnerName = data.results[0].OrganizationBPName1;
					//var oFinalText = `${oPrevComment} \n  ${oPartnerName} ( ${oDate} ) ${oText}`;
					var oFinalText = oPrevComment + "\r\n" + "/" +
						oPartnerName + "(" + oDate + ") " + " : " + oText;
					this.getView().getModel("HeadSetData").setProperty("/HeadText", oFinalText);
					this.getView().getModel("HeadSetData").setProperty("/NewText", "");
					// console.log(oFinalText);
				}, this)
			});
		},
		onCloseComment: function (oEvent) {
			oEvent.getSource().getParent().getParent().getParent().getParent().getParent().close();
		},

		// 		onChangeSubClaimType: function (oEvent) {
		// 			if (oEvent.getParameters().value != "") {
		// 				this.getView().getModel("DateModel").setProperty("/claimTypeState2", "None");
		// 			} else {
		// 				this.getView().getModel("DateModel").setProperty("/claimTypeState2", "Error");
		// 			}
		// 		},
		onSelectClaimTpe: function (oEvent) {
			// this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") = oEvent.getSource().getSelectedKey();
			// this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			//var oClaimType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			//var oClaimSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			this.getView().getModel("DateModel").setProperty("/claimTypeState2", "None");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oKey = oEvent.getSource().getSelectedKey();
			if (oKey != "") {
				this.getView().getModel("DateModel").setProperty("/claimTypeState2", "None");
			}

			if (oKey == "ZGGW") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", true);
				this.getView().getModel("DateModel").setProperty("/Paint", true);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", true);
				this.getView().getModel("DateModel").setProperty("/P1p2", false);
				this.getView().getModel("DateModel").setProperty("/AcA1", false);
				this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
				this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
				this.getView().getModel("DateModel").setProperty("/authHide", true);
				this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
			} else if (oKey == "ZWA1") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", true);
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Authorization", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/AcA1", false);
				this.getView().getModel("DateModel").setProperty("/P1p2", false);
				this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
				this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
				this.getView().getModel("DateModel").setProperty("/authHide", false);
				this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
			} else if (oKey == "ZWA2") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", true);
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Authorization", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/AcA1", false);
				this.getView().getModel("DateModel").setProperty("/P1p2", false);
				this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
				this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
				this.getView().getModel("DateModel").setProperty("/authHide", false);
				this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
			} else if (oKey == "ZWAC") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", false);
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/AcA1", true);
				this.getView().getModel("DateModel").setProperty("/P1p2", false);
				this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
				this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
				this.getView().getModel("DateModel").setProperty("/authHide", false);
				this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
			} else if (oKey == "ZWMS") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", false);
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Parts", false);
				this.getView().getModel("DateModel").setProperty("/Labour", false);
				this.getView().getModel("DateModel").setProperty("/Authorization", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/P1p2", false);
				this.getView().getModel("DateModel").setProperty("/AcA1", false);
				this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
				this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
				this.getView().getModel("DateModel").setProperty("/authHide", false);
				this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
			} else if (oKey == "ZWP1") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", true);
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", true);
				this.getView().getModel("DateModel").setProperty("/P1p2", true);
				this.getView().getModel("DateModel").setProperty("/AcA1", false);
				this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
				this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", true);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/authHide", true);
				this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);
			} else if (oKey == "ZWP2") {
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/oMainOps", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", false);
				this.getView().getModel("DateModel").setProperty("/Labour", false);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", true);
				this.getView().getModel("DateModel").setProperty("/P1p2", true);
				this.getView().getModel("DateModel").setProperty("/AcA1", false);
				this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", true);
				this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", true);
				this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/authHide", true);
				this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
			} else if (oKey == "ZWVE") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", true);
				this.getView().getModel("DateModel").setProperty("/Paint", true);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", true);
				this.getView().getModel("DateModel").setProperty("/P1p2", false);
				this.getView().getModel("DateModel").setProperty("/AcA1", false);
				this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
				this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/authHide", true);
				this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);

			} else if (oKey == "ZCER" || oKey == "ZCLS" || oKey == "ZCSR") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", true);
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", true);
				this.getView().getModel("DateModel").setProperty("/P1p2", false);
				this.getView().getModel("DateModel").setProperty("/AcA1", false);
				this.getView().getModel("DateModel").setProperty("/oECPfields", false);
				this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
				this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
				this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", false);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/authHide", true);
				this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
			} else if (oKey == "ZCWE") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", true);
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", true);
				this.getView().getModel("DateModel").setProperty("/P1p2", false);
				this.getView().getModel("DateModel").setProperty("/AcA1", false);
				this.getView().getModel("DateModel").setProperty("/oECPfields", false);
				this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
				this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", false);
				this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", false);
				this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", true);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", false);
				this.getView().getModel("DateModel").setProperty("/authHide", true);
				this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
			} else if (oKey == "ZSCR") {
				this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", false);
			} else {
				this.getView().getModel("DateModel").setProperty("/authHide", false);
			}
			this.onP2Claim(oKey);
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZACD" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWVE") {
				this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
			}

			if (oKey == "ZSCR") {
				this.getView().getModel("DateModel").setProperty("/oTciQtyAppr", true);

			} else {
				this.getView().getModel("DateModel").setProperty("/oTciQtyAppr", false);
			}

			if (oKey == "ZECP") {
				this.getModel("LocalDataModel").setProperty("/DealerPriceText", oBundle.getText("MSRP"));
			} else {
				this.getModel("LocalDataModel").setProperty("/DealerPriceText", oBundle.getText("DealerNetPrice"));

			}

		},

		onSelectRequestType: function (oEvent) {
			var oIndex = oEvent.getSource().getSelectedIndex();
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);
			if (oIndex == 1) {
				this.getModel("LocalDataModel").setProperty("/DataVinDetails", "");
				this.getModel("LocalDataModel").setProperty("/VehicleMonths", "");

				this.getView().byId("idVinNum").setProperty("enabled", false);
				//this.getView().byId("idVinNum").STRequired(false);
				this.getView().getModel("DateModel").setProperty("/OdometerReq", false);
				this.getView().getModel("DateModel").setProperty("/OdometerReqMan", false);
				this.getView().getModel("HeadSetData").setProperty("/Odometer", "");
				this.getView().byId("idVinNum").setValue("");
				this.getView().getModel("HeadSetData").setProperty("/ExternalObjectNumber", "");
				this.getView().getModel("DateModel").setProperty("/foreignVinInd", false);
				this.getView().getModel("DateModel").setProperty("/writtenOffInd", false);
				this.getView().getModel("DateModel").setProperty("/specialVinInd", false);

			} else {

				this.getView().byId("idVinNum").setProperty("enabled", true);
				this.getView().byId("idVinNum").setRequired(true);
				if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSCR") {
					this.getView().getModel("DateModel").setProperty("/OdometerReq", true);
					this.getView().getModel("DateModel").setProperty("/OdometerReqMan", true);
				}
			}

		},

		onP2Claim: function (elm) {
			if (elm == "ZLDC") {
				this.getView().getModel("DateModel").setProperty("/nonVinHide", false);
			} else {
				this.getView().getModel("DateModel").setProperty("/nonVinHide", true);
			}
			if (elm == "ZWP2" || elm == "ZWMS" || elm == "ZWA2") {
				this.getView().getModel("DateModel").setProperty("/DisableRadio", false);
				this.getView().getModel("DateModel").setProperty("/OdometerReq", false);
				this.getView().getModel("DateModel").setProperty("/OdometerReqMan", false);
				//this.getView().byId("idRequestType").setSelectedIndex(1);
				this.getView().getModel("DateModel").setProperty("/oRadioVinIndex", 1);
			} else if (elm == "ZSCR") {
				this.getView().getModel("DateModel").setProperty("/OdometerReqMan", false);
				this.getView().getModel("DateModel").setProperty("/oVisibleRepDate", false);
				this.getView().getModel("DateModel").setProperty("/oVisibleReOrder", false);

			} else {
				this.getView().getModel("DateModel").setProperty("/DisableRadio", true);
				this.getView().getModel("DateModel").setProperty("/OdometerReq", true);
				this.getView().getModel("DateModel").setProperty("/OdometerReqMan", true);
				this.getView().byId("idRequestType").setSelectedIndex(0);
			}
		},

		onLiveVINEnter: function (oEvent) {
			var oVin = oEvent.getParameters().value.toUpperCase();

			this.getView().getModel("HeadSetData").setProperty("/ExternalObjectNumber", oVin);
			if (oVin.length > 17) {
				this.getView().getModel("HeadSetData").setProperty("/ExternalObjectNumber", "");
				this.getView().byId("idVinNum").setValue("");
			}
		},
		onChangeLabourOp: function (oEvent) {
			var oLabourOp = oEvent.getParameters().value;
			this.getView().getModel("LabourDataModel").setProperty("/LabourOp", oLabourOp.toUpperCase());
		},

		onEnterVIN: function (oEvent) {
			this.getView().byId("idECPAGR").removeSelections();
			this.getView().getModel("HeadSetData").setProperty("/AgreementNumber", "");

			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oVin = oEvent.getParameters().value;
			this.getView().getModel("HeadSetData").setProperty("/ExternalObjectNumber", oVin.toUpperCase());
			this.getModel("LocalDataModel").setProperty("/selectedVehicle", oVin);
			var oProssingModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oRepDate;
			//var oECPModel = this.getOwnerComponent().getModel("EcpSalesModel");

			if (oVin != "") {

				if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZECP") {
					oProssingModel.read("/zc_cliam_agreement", {
						urlParameters: {
							"$filter": "VIN eq '" + oVin + "'"
						},
						success: $.proxy(function (data) {

							this.getModel("LocalDataModel").setProperty("/AgreementDataECP", data.results);
							var oTable = this.getView().byId("idECPAGR");
							var oLength = data.results.filter(function (item) {
								return item.AgreementStatus == "Active"
							}).length;
							var oTableSelectedRow = data.results.findIndex(function (item) {
								return item.AgreementStatus == "Active"
							});

							for (let i = 0; i < data.results.length; i++) {
								if (data.results[i].AgreementStatus == "Suspended") {
									oTable.getItems()[i].getCells()[0].setProperty("enabled", false);
									oTable.getItems()[i].getCells()[0].setProperty("selected", false);
								} else if (data.results[i].AgreementStatus == "Expired" && data.results[i].AgreementthruDate < this.getView().getModel(
										"HeadSetData").getProperty("/RepairDate")) {
									oTable.getItems()[i].getCells()[0].setProperty("enabled", false);
									oTable.getItems()[i].getCells()[0].setProperty("selected", false);
								} else {
									oTable.getItems()[i].getCells()[0].setProperty("enabled", true);
									oTable.getItems()[i].getCells()[0].setProperty("selected", false);
								}

							}
							if (oLength > 1) {
								//this.getView().byId("idECPAGR").removeSelections();
								oTable.getItems()[oTableSelectedRow].getCells()[0].setProperty("selected", false);
							} else if (oLength == 1) {
								//oTable.setSelectedIndex(oTableSelectedRow);

								oTable.getItems()[oTableSelectedRow].getCells()[0].setProperty("selected", true);
								this.getView().getModel("HeadSetData").setProperty("/AgreementNumber", data.results[oTableSelectedRow].AgreementNumber);
							}
						}, this),
						error: function () {}
					});
				}

				oProssingModel.read("/ZC_GET_FORE_VIN(p_vhvin='" + oVin + "')/Set", {
					success: $.proxy(function (data) {
						if (data.results.length > 0) {
							var oVinModel = data.results[0].Model;
							this.getModel("LocalDataModel").setProperty("/invalidVinMsg", data.results[0].Message);
							if (oVinModel == "I_VEH_US") {
								this.getView().getModel("HeadSetData").setProperty("/ForeignVINIndicator", "Yes");
								this.oText = "true";
								this.getView().byId("idMainClaimMessage").setProperty("visible", false);
								this.getView().byId("idMainClaimMessage").setText("");
								this.getView().byId("idMainClaimMessage").setType("None");
							} else if (data.results[0].Message == "Invalid VIN Number") {
								this.oText = "false";
								this.getModel("LocalDataModel").setProperty("/DataVinDetails", "");
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
								this.getModel("LocalDataModel").setProperty("/VehicleMonths", "");
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseEnterValidVIN"));
								this.getView().byId("idMainClaimMessage").setType("Error");
								this.getView().getModel("HeadSetData").setProperty("/ForeignVINIndicator", "No");
							} else {
								this.getView().getModel("HeadSetData").setProperty("/ForeignVINIndicator", "No");
								this.oText = "true";
								this.getView().byId("idMainClaimMessage").setProperty("visible", false);
								this.getView().byId("idMainClaimMessage").setText("");
								this.getView().byId("idMainClaimMessage").setType("None");
							}

							if (data.results[0].Message != "Invalid VIN Number") {
								oProssingModel.read("/zc_vehicle_informationSet", {
									urlParameters: {
										"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'and Vin eq '" + oVin + "'",
										"$expand": "ZC_SPECIAL_HANDLINGVEHICLESET,ZC_WRITTENOFFVEHICLESET"
									},
									//"$expand": "ZC_SPECIAL_HANDLINGVEHICLESET, ZC_WRITTENOFFVEHICLESET"
									success: $.proxy(function (sdata) {
										this.getModel("LocalDataModel").setProperty("/DataVinDetails", sdata.results[0]);
										if (this.getView().getModel("HeadSetData").getProperty("/RepairDate") != undefined) {
											oRepDate = this.getView().getModel("HeadSetData").getProperty("/RepairDate");
										} else {
											oRepDate = new Date();
										}
										//var oRepDate = this.getView().getModel("HeadSetData").getProperty("/RepairDate");
										var regTime = new Date(sdata.results[0].RegDate).getTime();
										var repTime = new Date(oRepDate).getTime();
										var oMonth = (regTime - repTime) / (1000 * 60 * 60 * 24 * 30);
										//parseFloat(oMonth).toFixed(2);
										this.getModel("LocalDataModel").setProperty("/VehicleMonths", Math.abs(oMonth.toFixed(1)));
										if (sdata.results[0].ForeignVIN == "YES") {
											this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancemiles"));
											this.getView().getModel("DateModel").setProperty("/foreignVinInd", true);
										} else if (sdata.results[0].ForeignVIN == "NO") {
											this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancekm"));
											this.getView().getModel("DateModel").setProperty("/foreignVinInd", false);

										}

										if (sdata.results[0].WrittenOff == "YES") {

											this.getView().getModel("DateModel").setProperty("/writtenOffInd", true);
										} else if (sdata.results[0].WrittenOff == "NO") {

											this.getView().getModel("DateModel").setProperty("/writtenOffInd", false);

										}

										if (sdata.results[0].SpecialVINReview == "YES") {

											this.getView().getModel("DateModel").setProperty("/specialVinInd", true);
										} else if (sdata.results[0].SpecialVINReview == "NO") {

											this.getView().getModel("DateModel").setProperty("/specialVinInd", false);

										}

										this.getModel("LocalDataModel").setProperty("/DataSpecialHandlingSet",
											sdata.results[0].ZC_SPECIAL_HANDLINGVEHICLESET.results);
										this.getModel("LocalDataModel").setProperty("/DataWrittenOffSet", sdata.results[0].ZC_WRITTENOFFVEHICLESET.results);
									}, this),
									error: function () {}
								});

							}

						}
					}, this),
					error: function () {

					}

				});

			} else {
				this.getModel("LocalDataModel").setProperty("/DataVinDetails", "");
				this.getModel("LocalDataModel").setProperty("/VehicleMonths", "");
				this.getView().getModel("DateModel").setProperty("/writtenOffInd", false);
				this.getView().getModel("DateModel").setProperty("/specialVinInd", false);
				this.getView().getModel("DateModel").setProperty("/foreignVinInd", false);
				this.getModel("LocalDataModel").setProperty("/AgreementDataECP", "");
			}

		},
		onPressAgreement: function (oEvent) {
			var oECPAgr = oEvent.getSource().getText();
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var sDivision = window.location.search.match(/Division=([^&]*)/i)[1];

			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var isProxy = "";
			var oHref = window.location.href.substr(0, 8);
			var oInput = window.location.href.substr(8, 4);

			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}

			var w = window.open(this.getModel("LocalDataModel").getProperty("/oECPURL") + "?Division=" + sDivision + "&Language=" +
				sSelectedLocale +
				"#/AgreementInquiry/" + oECPAgr + "",
				'_blank');

			if (w == null) {
				console.log("Error");
				//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
			}
		},

		onPressLookUpECP: function () {
			var oAgreement = this.getView().getModel("HeadSetData").getProperty("/AgreementNumber");
			var oECPModel = this.getOwnerComponent().getModel("EcpSalesModel");
			oECPModel.read("/zc_ecp_agreement", {
				urlParameters: {
					"$filter": "AgreementNumber eq '" + oAgreement + "'"
				},
				success: $.proxy(function (data) {
					this.getView().getModel("LocalDataModel").setProperty("/AgreementLookUpData", data.results[0]);
				}, this)
			});
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.AgreementLookup", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},
		onChangeOdometer: function (oEvent) {
			var oOdoVal = oEvent.getSource().getValue();

			if (oOdoVal.length > 6) {
				//oOdoVal = oOdoVal.substr(0, 6);
				//this.getView().getModel("HeadSetData").setProperty("/Odometer", oOdoVal.slice(0, 6));

			} else {
				//this.getView().getModel("HeadSetData").setProperty("/Odometer", oOdoVal);
			}
		},
		onChangeCustomerPer: function (oEvent) {
			console.log(oEvent);
		},

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

		_fnDateFormat01: function (elm) {
			if (elm != "" && elm != null && elm != NaN) {
				// var oNumTime = Date.UTC(elm.getFullYear(), elm.getMonth(), elm.getDate(),
				// 	elm.getHours(), elm.getMinutes(), elm.getSeconds(), elm.getMilliseconds());
				var oNumTime = elm.toISOString().split("T")[0].split("-").join("");
				var oTime = oNumTime;
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

		_fnSaveClaim: function () {

			var oValidator = new Validator();
			//var oValid = oValidator.validate(this.getView().byId("idClaimMainForm"));
			// var oValid01 = oValidator.validate(this.getView().byId("idVehicleInfo"));
			var oValid02 = oValidator.validate(this.getView().byId("idpart01Form"));
			oValidator.validate(!(this.getView().byId("id_Date")));
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("ProssingModel");
			var oCurrentDt = new Date();
			var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
			var oClmType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oClmSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			var that = this;
			var oView = this.getView();
			var aInputs;
			var aInputsArr = [
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
				oView.byId("idCondition")
			];

			var aInputsArrCoreRet = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("idVinNum")
			];

			var aInputsArrZWAC = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("idAccDate"),
				oView.byId("idInsOdo"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsArrZWP2 = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("idPreInvNum"),
				oView.byId("idPrInvDate"),
				oView.byId("id_Date"),
				oView.byId("idRepairOrder"),

				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsArrZWMS = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idRepairOrder"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsFieldAct = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idFieldActionInput"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsFieldActZCWE = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOFP"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idFieldActionInput"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsOECP = [
				oView.byId("idClaimType"),
				oView.byId("id_Date"),
				oView.byId("idDealerClaim"),
				oView.byId("idClientLastName"),
				oView.byId("idPostalCode"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idMainOps"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputVehiclLog = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("idDealerContact"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("iDdelivCarrier"),
				oView.byId("idProbill"),
				oView.byId("idDelivery"),
				oView.byId("idDeliveryDate")

			];

			var aInputsSETR = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idFieldActionInput"),
				oView.byId("idMainOps"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsZWVE = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idMainOps"),
				oView.byId("idVinNum"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsZWVEZACD = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idMainOps"),
				oView.byId("idFieldActionInput"),
				oView.byId("idVinNum"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var bValidationError = false;

			if (oClmSubType == "ZCER" || oClmSubType == "ZCLS" || oClmSubType == "ZCSR") {
				aInputs = aInputsFieldAct;
			} else if (oClaimtype == "FAC" && oClmType == "ZCWE") {
				aInputs = aInputsFieldActZCWE;
			} else if (oClmSubType == "ZCWE") {
				aInputs = aInputsFieldActZCWE;
			} else if (oClaimtype == "FAC") {
				aInputs = aInputsFieldAct;
			} else if (oClaimtype == "ECP") {
				aInputs = aInputsOECP;
			} else if (oClaimtype == "STR") {
				aInputs = aInputsSETR;
			} else if (oClaimtype == "VLC") {
				aInputs = aInputVehiclLog;
			} else if (oClmType == "ZWAC" || oClmSubType == "ZWAC") {
				aInputs = aInputsArrZWAC;
			} else if (oClmType == "ZWP2" || oClmSubType == "ZWP2") {
				aInputs = aInputsArrZWP2;
			} else if (oClmType == "ZWMS" || oClmSubType == "ZWMS") {
				aInputs = aInputsArrZWMS;
			} else if (oClmType == "ZWVE") {
				oView.byId("idFieldActionInput").setProperty("valueState", "None");
				aInputs = aInputsZWVE;
			} else if (oClmType == "ZWP1") {
				aInputs = aInputsZWVE;
			} else if (oClaimtype == "WTY") {
				aInputs = aInputsArr;
			} else if (oClaimtype == "CRC") {
				aInputs = aInputsArr;
			} else if (oClaimtype == "SCR") {
				aInputs = aInputsArrCoreRet;
			}

			jQuery.each(aInputs, function (i, oInput) {
				if (oInput.getVisible() == true) {
					bValidationError = that._validateInput(oInput) || bValidationError;
				}
			});

			if (bValidationError) {
				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			} else if (oClaimtype == "ECP" && this.getView().getModel("HeadSetData").getProperty("/AgreementNumber") == "") {
				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseSelectAgreement"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			} else if (this.getModel("LocalDataModel").getProperty("/invalidVinMsg") == "Invalid VIN Number") {
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseEnterValidVIN"));
				this.getView().byId("idMainClaimMessage").setType("Error");
			} else if (oGroupType == "Authorization" && oClmSubType ==
				"") {
				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
				this.getView().getModel("DateModel").setProperty("/claimTypeState2", "Error");
				MessageToast.show(
					oBundle.getText("submissionTypeMandatory"), {
						my: "center center",
						at: "center center"
					});
				// this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				// this.getView().byId("idMainClaimMessage").setType("Error");
				// this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().byId("id_Date").setValueState("None");
				this.getView().byId("idPrInvDate").setValueState("None");
				this.getView().byId("idPreInvNum").setValueState("None");
				this.getView().byId("idT2Field").setValueState("None");
				this.getView().byId("idT1Field").setValueState("None");
				this.getView().byId("idOFP").setValueState("None");
				this.getView().byId("idMainOps").setValueState("None");
				this.getView().byId("idDealerContact").setValueState("None");
				this.getView().byId("idFieldActionInput").setValueState("None");
				var oActionCode = "";
				if (this.getView().getModel("DateModel").getProperty("/oztac") == true) {
					oActionCode = "ZTEA";
				} else {
					oActionCode = "";
				}
				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
				this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
				this.getView().getModel("DateModel").setProperty("/claimTypeState2", "None");
				this.obj = {
					"DBOperation": "SAVE",
					"Message": "",
					"ActionCode": oActionCode,
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
					"NameOfPersonRespWhoChangedObj": this.getModel("LocalDataModel").getProperty("/LoginId").substr(0, 12),
					"ShipmentReceivedDate": null,
					"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
					"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
					"OFP": this.getView().getModel("HeadSetData").getProperty("/OFP"),
					"WTYClaimRecoverySource": "",
					"MainOpsCode": this.getView().getModel("HeadSetData").getProperty("/MainOpsCode"),
					"T1WarrantyCodes": this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes"),
					"BatteryTestCode": this.getView().getModel("HeadSetData").getProperty("/BatteryTestCode"),
					"T2WarrantyCodes": this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes"),
					"FieldActionReference": this.getView().getModel("HeadSetData").getProperty("/FieldActionReference").toUpperCase(),
					"ZCondition": this.getView().getModel("HeadSetData").getProperty("/ZCondition"),
					"Cause": this.getView().getModel("HeadSetData").getProperty("/Cause"),
					"Remedy": this.getView().getModel("HeadSetData").getProperty("/Remedy"),
					"PreviousROInvoiceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoiceDate")),
					"PreviousROOdometer": this.getView().getModel("HeadSetData").getProperty("/PreviousROOdometer"),
					"PreviousROInvoice": this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoice"),
					"AccessoryInstallOdometer": this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallOdometer"),
					"AccessoryInstallDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallDate")),
					"AgreementNumber": this.getView().getModel("HeadSetData").getProperty("/AgreementNumber"),
					"CustomerPostalCode": this.getView().getModel("HeadSetData").getProperty("/CustomerPostalCode"),
					"CustomerFullName": this.getView().getModel("HeadSetData").getProperty("/CustomerFullName"),
					"ProbillNum": this.getView().getModel("HeadSetData").getProperty("/ProbillNum"),
					"Delivery": this.getView().getModel("HeadSetData").getProperty("/Delivery"),
					"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
					"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
					"WarrantyClaimSubType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType"),
					"zc_itemSet": {
						"results": []
					},
					"zc_claim_item_labourSet": {
						"results": []
					},
					"zc_claim_item_paintSet": {
						"results": []
					},
					"zc_item_subletSet": {
						"results": []
					},
					"zc_claim_attachmentsSet": {
						"results": []
					},
					"zc_claim_item_damageSet": {
						"results": []
					},
					"zc_claim_commentSet": {
						"results": []
					},
					"zc_claim_vsrSet": {
						"results": []
					},
					"zc_claim_item_price_dataSet": {
						"results": [{
							"PartQty": "0.000",
							"AmtClaimed": "0.000",
							"clmno": "",
							"DealerNet": "0.000",
							"DiffAmt": "0.000",
							"ExtendedValue": "0.000",
							"ItemType": "",
							"kappl": "",
							"kateg": "",
							"kawrt": "0.000",
							"kbetr": "0.000",
							"knumv": "",
							"kposn": "",
							"kschl": "",
							"kvsl1": "",
							"kwert": "0.000",
							"MarkUp": "0.000",
							"matnr": "",
							"posnr": "",
							"QtyHrs": "0.000",
							"quant": "0.000",
							"TCIApprAmt": "0.000",
							"TCIApprQty": "0.000",
							"TotalAfterDisct": "0.000",
							"v_rejcd": "",
							"valic": "0.000",
							"valoc": "0.000",
							"verknumv": "",
							"versn": ""
						}]
					}
				};

				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
						this.getView().byId("idMainClaimMessage").setProperty("visible", false);
						this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
						this.getModel("LocalDataModel").setProperty("/step01Next", true);
						this.getModel("LocalDataModel").setProperty("/FeedEnabled", true);
						this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
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
						this._fnClaimSumPercent();
						oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "'"
							},
							success: $.proxy(function (sdata) {
								console.log(sdata);
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

								this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", sdata.results[0].OfpDescription);
								this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", sdata.results[0].Main_opsDescription);
								this.getView().getModel("HeadSetData").setData(sdata.results[0]);
								if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZECP") {
									this.getModel("LocalDataModel").setProperty("/oCurrentDealerLabour", this.getModel("LocalDataModel").getProperty(
										"/oDealerLabour/ECPNewLabourRate"));
								} else {
									this.getModel("LocalDataModel").setProperty("/oCurrentDealerLabour", this.getModel("LocalDataModel").getProperty(
										"/oDealerLabour/WTYNewLabourRate"));
								}
								//this.getModel("LocalDataModel").getProperty("/oDealerLabour/WTYNewLabourRate");

								this.getView().getModel("HeadSetData").setProperty("/RepairDate", response.data.RepairDate);
								this.getView().getModel("HeadSetData").setProperty("/ReferenceDate", response.data.ReferenceDate);
								this.getView().getModel("HeadSetData").setProperty("/DateOfApplication", response.data.DateOfApplication);
								this.getView().getModel("HeadSetData").setProperty("/AccessoryInstallDate", response.data.AccessoryInstallDate);
								this.getView().getModel("HeadSetData").setProperty("/PreviousROInvoiceDate", response.data.PreviousROInvoiceDate);
								this.getView().getModel("HeadSetData").setProperty("/DeliveryDate", response.data.DeliveryDate);
								var oCLaim = this.getModel("LocalDataModel").getProperty("/ClaimDetails/NumberOfWarrantyClaim");
								this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", oCLaim);
								if (oGroupType == "Authorization") {
									this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIAuthNumber") + " : " + oCLaim);
									this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
									this.getModel("LocalDataModel").setProperty("/reCalculate", true);
									this.getModel("LocalDataModel").setProperty("/PercentState", true);
									oClaimModel.read("/zc_authorization_detailsSet", {
										urlParameters: {
											"$filter": "AuthorizationNumber eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "'"
										},
										success: $.proxy(function (oAuthData) {
											this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
										}, this)
									});
								} else if (oGroupType == "Claim") {
									this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber") + " : " +
										oCLaim);
									this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
									this.getModel("LocalDataModel").setProperty("/reCalculate", false);
									this.getModel("LocalDataModel").setProperty("/PercentState", false);
								}

								oClaimModel.read("/ZC_CLAIM_SUBLET_CODE", {
									urlParameters: {
										"$filter": "Clmty eq '" + sdata.results[0].WarrantyClaimType + "'and LanguageKey eq '" + sSelectedLocale.toUpperCase() +
											"'"
									},
									success: $.proxy(function (subData) {
										this.getModel("LocalDataModel").setProperty("/ClaimSubletCodeModel", subData.results);

									}, this),
									error: function (err) {
										console.log(err);
									}
								});

							}, this),
							error: function (Error) {
								console.log(Error);
							}
						});

						oClaimModel.read("/zc_headSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
									"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'",
								"$expand": "zc_claim_vsrSet,zc_claim_read_descriptionSet"
							},
							success: $.proxy(function (errorData) {
								this.getModel("LocalDataModel").setProperty("/oErrorSet", errorData.results[0].zc_claim_vsrSet.results);
								this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", errorData.results[0].zc_claim_read_descriptionSet
									.results[0].OFPDescription);
								this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", errorData.results[0].zc_claim_read_descriptionSet
									.results[0].MainOpsCodeDescription);

								this.getView().getModel("HeadSetData").setProperty("/HeadText", errorData.results[0].zc_claim_read_descriptionSet
									.results[0].HeadText);
							}, this)
						});

						if (oGroupType == "Authorization") {
							oClaimModel.read("/zc_authorization_detailsSet", {
								urlParameters: {
									"$filter": "AuthorizationNumber eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "'"
								},
								success: $.proxy(function (oAuthData) {
									this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
								}, this)
							});
						}
						this.getModel("LocalDataModel").setProperty("/CancelEnable", true);

					}, this),
					error: $.proxy(function (err) {
						MessageToast.show(oBundle.getText("SystemInternalError"));
						this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
					}, this)
				});

			}
		},
		onSaveClaim: function (oEvent) {
			this._fnSaveClaim();
		},
		onValidateContact: function (oEvent) {
			console.log(oEvent);
		},
		onCancelClaim: function () {
			var sSelectedLocale;
			this.getModel("LocalDataModel").setProperty("/PrintEnable", true);
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			this.obj.DBOperation = "ZTCD";
			var obj = {
				NumberOfWarrantyClaim: oClaimNum,
				DBOperation: "ZTCD"
			};
			var dialog = new Dialog({
				title: oBundle.getText("CancelClaim"),
				type: "Message",
				content: new Text({
					text: oBundle.getText("AreyouSureWanttoCancelClaim")
				}),

				buttons: [
					new Button({
						text: oBundle.getText("Yes"),
						press: $.proxy(function () {
							this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
							$.ajaxSetup({
								headers: {
									'X-CSRF-Token': this._oToken
								}
							});

							//oClaimModel.refreshSecurityToken();

							oClaimModel.create("/zc_headSet", obj, {

								success: $.proxy(function (response) {
									this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
									this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
									this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
									this.getView().getModel("DateModel").setProperty("/updateEnable", false);
									this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
									this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
									this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
									this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
									this.getView().getModel("DateModel").setProperty("/authRejClm", false);
									this.getView().getModel("DateModel").setProperty("/authAcClm", false);
									this.getModel("LocalDataModel").setProperty("/PercentState", false);

									oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
										urlParameters: {
											"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
												"'"
										},
										success: $.proxy(function (sdata) {
											this.getView().getModel("HeadSetData").setProperty("/DecisionCode", sdata.results[0].DecisionCode);
										}, this)
									});
									MessageToast.show(oBundle.getText("Claimcancelledsuccessfully"), {
										my: "center center",
										at: "center center"
									});
									this._fnClaimSumPercent();
									this._fnClaimSum();
									this.getView().getModel("LocalDataModel").setProperty("/CancelEnable", false);
								}, this),
								error: function () {

								}
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

		},

		onApproveClaim: function () {
			var sSelectedLocale;
			this.getModel("LocalDataModel").setProperty("/PrintEnable", true);
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oClaimModel = this.getModel("ProssingModel");
			var obj = {
				NumberOfWarrantyClaim: oClaimNum,
				DBOperation: "ZADR"

			};
			this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
			oClaimModel.update("/zc_headSet(NumberOfWarrantyClaim='" + oClaimNum + "')", obj, {
				method: "PUT",
				success: $.proxy(function (response) {
					this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
					this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
					this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
					this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
					this.getView().getModel("DateModel").setProperty("/updateEnable", false);
					this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
					this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
					this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
					this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
					this.getModel("LocalDataModel").setProperty("/PercentState", false);

					oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
								"'"
						},
						success: $.proxy(function (sdata) {
							MessageToast.show(oBundle.getText("Authorizationapprovedsuccessfully"), {
								my: "center center",
								at: "center center"
							});
							this._fnClaimSumPercent();
							this._fnClaimSum();
							this._fnPricingData(oClaimNum);
							this.getView().getModel("HeadSetData").setProperty("/DecisionCode", sdata.results[0].DecisionCode);
							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);

						}, this)
					});
				}, this),
				error: $.proxy(function (err) {
					this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
				}, this)
			});
		},
		onRejectClaim: function () {
			var sSelectedLocale;
			this.getModel("LocalDataModel").setProperty("/PrintEnable", true);
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oClaimModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var obj = {
				NumberOfWarrantyClaim: oClaimNum,
				DBOperation: "ZTCM"

			};

			var dialog = new Dialog({
				title: oBundle.getText("RejectClaim"),
				type: "Message",
				content: new Text({
					text: oBundle.getText("DoyouwantCancelAuthorization")
				}),

				buttons: [
					new Button({
						text: oBundle.getText("Yes"),
						press: $.proxy(function () {
							this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
							oClaimModel.update("/zc_headSet(NumberOfWarrantyClaim='" + oClaimNum + "')", obj, {
								method: "PUT",
								success: $.proxy(function (response) {
									this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
									this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
									this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
									this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
									this.getView().getModel("DateModel").setProperty("/updateEnable", false);
									this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
									this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
									this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
									this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
									this.getModel("LocalDataModel").setProperty("/PercentState", false);
									oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
										urlParameters: {
											"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
												"'"
										},
										success: $.proxy(function (sdata) {
											MessageToast.show(oBundle.getText("AuthorizationRejected"), {
												my: "center center",
												at: "center center"
											});
											this.getView().getModel("HeadSetData").setProperty("/DecisionCode", sdata.results[0].DecisionCode);
											this._fnClaimSumPercent();
											this._fnClaimSum();
											this._fnPricingData(oClaimNum);
											this.getView().getModel("DateModel").setProperty("/authAcClm", false);
											this.getView().getModel("DateModel").setProperty("/authRejClm", false);
										}, this)
									});
								}, this),
								error: $.proxy(function (err) {
									this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
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

		},

		_fnUpdateClaim: function (oEvent) {
			var sSelectedLocale;
			this.getModel("LocalDataModel").setProperty("/PrintEnable", true);
			var oId = oEvent.getSource().getText();
			this.getModel("LocalDataModel").setProperty("/oIDBtn", oId);
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oValidator = new Validator();
			var oValid = oValidator.validate(this.getView().byId("idClaimMainForm"));
			var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			// var oValid01 = oValidator.validate(this.getView().byId("idVehicleInfo"));
			var oValid02 = oValidator.validate(this.getView().byId("idpart01Form"));

			// 	var oCurrentDt = new Date();
			var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
			var oClmType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oClmSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			//var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			var that = this;
			var oView = this.getView();
			var aInputs;
			var aInputsArr = [

				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsArrCoreRet = [

				oView.byId("idDealerClaim"),
				oView.byId("idVinNum")
			];

			var aInputsArrZWAC = [

				oView.byId("idDealerClaim"),
				oView.byId("idAccDate"),
				oView.byId("idInsOdo"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsArrZWP2 = [

				oView.byId("idDealerClaim"),
				oView.byId("idPreInvNum"),
				oView.byId("idPrInvDate"),
				oView.byId("id_Date"),
				oView.byId("idRepairOrder"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsArrZWMS = [
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idRepairOrder"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsFieldAct = [

				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idFieldActionInput"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsFieldActZCWE = [

				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOFP"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idFieldActionInput"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsOECP = [

				oView.byId("id_Date"),
				oView.byId("idDealerClaim"),
				oView.byId("idClientLastName"),
				oView.byId("idPostalCode"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idMainOps"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputVehiclLog = [

				oView.byId("idDealerClaim"),
				oView.byId("idDealerContact"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("iDdelivCarrier"),
				oView.byId("idProbill"),
				oView.byId("idDelivery"),
				oView.byId("idDeliveryDate")

			];

			var aInputsSETR = [

				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idFieldActionInput"),
				oView.byId("idMainOps"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsZWVE = [

				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idMainOps"),
				oView.byId("idVinNum"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var bValidationError = false;

			if (oClmSubType == "ZCER" || oClmSubType == "ZCLS" || oClmSubType == "ZCSR" || oClmType == "ZCER" || oClmType == "ZCLS" || oClmType ==
				"ZCSR") {
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idMainOps").addStyleClass("clNotReq");
				aInputs = aInputsFieldAct;
			} else if (oClmType == "ZCWE" || oClmSubType == "ZCWE") {
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				aInputs = aInputsFieldActZCWE;
			} else if (oClmType == "ZECP") {
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsOECP;
			} else if (oClmType == "ZSSE") {
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsSETR;
			} else if (oClmType == "ZLDC") {
				aInputs = aInputVehiclLog;
			} else if (oClmType == "ZWAC" || oClmSubType == "ZWAC") {
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idMainOps").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsArrZWAC;
			} else if (oClmType == "ZWP2" || oClmSubType == "ZWP2") {
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsArrZWP2;
			} else if (oClmType == "ZWMS" || oClmSubType == "ZWMS") {
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsArrZWMS;
			} else if (oClmType == "ZWVE" || oClmSubType == "ZWVE") {
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsZWVE;

			} else if (oClmType == "ZGGW" || oClmSubType == "ZGGW" || oClmType == "ZWA1" || oClmType == "ZWA2") {
				aInputs = aInputsArr;
				oView.byId("idMainOps").addStyleClass("clNotReq");
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
			} else if (oClmType == "ZWP1" || oClmSubType == "ZWP1") {
				aInputs = aInputsZWVE;
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
			} else if (oClmType == "ZRCR") {
				aInputs = aInputsArr;
				oView.byId("idMainOps").addStyleClass("clNotReq");
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
			} else if (oClmType == "ZSCR") {
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				aInputs = aInputsArrCoreRet;
			}

			jQuery.each(aInputs, function (i, oInput) {
				if (oInput.getVisible() == true && oInput.mProperties.enabled == true) {
					bValidationError = that._validateInput(oInput) || bValidationError;
				} else {
					oInput.setValueState("None");
				}
			});

			//var oPartner = this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner");

			// 			var oBusinessModel = this.getModel("ApiBusinessModel");
			// 			oBusinessModel.read("/A_BusinessPartner", {
			// 				urlParameters: {
			// 					"$filter": "BusinessPartner eq '" + oPartner + "'"
			// 				},
			// 				success: $.proxy(function (data) {
			// 					this.getModel("LocalDataModel").setProperty("/BPOrgName", data.results[0].OrganizationBPName1);
			// 				}, this)
			// 			});

			var oActionCode = "";
			if (this.getView().getModel("DateModel").getProperty("/oztac") == true) {
				oActionCode = "ZTEA";
			} else {
				oActionCode = "";
			}

			oClaimModel.read("/ZC_GET_FORE_VIN(p_vhvin='" + this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber") +
				"')/Set", {
					success: $.proxy(function (data) {
						if (data.results.length > 0) {
							var oVinModel = data.results[0].Model;
							if (oVinModel == "I_VEH_US") {
								this.getView().getModel("HeadSetData").setProperty("/ForeignVINIndicator", "Yes");
								this.oText = "true";
								this.getView().byId("idMainClaimMessage").setProperty("visible", false);
								this.getView().byId("idMainClaimMessage").setText("");
								this.getView().byId("idMainClaimMessage").setType("None");
							} else if (data.results[0].Message == "Invalid VIN Number") {
								this.oText = "false";
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
								this.getView().byId("idMainClaimMessage").setText("Please Enter a Valid VIN.");
								this.getView().byId("idMainClaimMessage").setType("Error");
							} else {
								this.getView().getModel("HeadSetData").setProperty("/ForeignVINIndicator", "No");
								this.oText = "true";
								this.getView().byId("idMainClaimMessage").setProperty("visible", false);
								this.getView().byId("idMainClaimMessage").setText("");
								this.getView().byId("idMainClaimMessage").setType("None");
							}

						}
					}, this),
					error: function () {

					}
				});

			var oDamageItem = [];

			oClaimModel.read("/zc_claim_item_price_dataSet", {
				urlParameters: {
					"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "

				},
				success: $.proxy(function (data) {

					oClaimModel.read("/zc_claim_item_damageSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum +
								"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "
						},
						success: $.proxy(function (sddata) {

							this.getModel("LocalDataModel").setProperty("/DataItemDamageSet", sddata.results);
							if (sddata.results.length > 0) {
								oDamageItem = sddata.results.map(function (item) {
									return {
										DmgAreaCode: item.DmgAreaCode,
										DmgSevrCode: item.DmgSevrCode,
										DmgTypeCode: item.DmgTypeCode

									};

								});
							} else {
								oDamageItem = [];
							}

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
									PartQty: item.QtyHrs
								};

							});

							var oFilteredDataLabour = pricinghData.filter(function (val) {
								return val.ItemType === "FR" && val.LabourNumber[0] != "P";
							});
							var LabourItem = oFilteredDataLabour.map(function (item) {
								return {
									ItemType: "FR",
									Type: "LABOUR",
									LabourNumber: item.LabourNumber,
									LabourDescription: item.LabourDescription,
									ClaimedHours: item.QtyHrs
								};

							});

							this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredDataLabour);

							var oFilteredDataPaint = pricinghData.filter(function (val) {
								return val.ItemType === "FR" && val.LabourNumber[0] == "P";
							});
							this.getModel("LocalDataModel").setProperty("/PaintPricingDataModel", oFilteredDataPaint);

							var PaintItem = oFilteredDataPaint.map(function (item) {
								return {
									ItemType: "FR",
									PaintPositionCode: item.LabourNumber,
									ClaimedHours: item.QtyHrs
								};

							});

							var oFilteredDataSubl = pricinghData.filter(function (val) {
								return val.ItemType === "SUBL";
							});

							this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredDataSubl);
							var SubletItem = oFilteredDataSubl.map(function (item) {
								return {
									ItemType: "SUBL",
									InvoiceNo: item.InvoiceNo,
									UnitOfMeasure: item.Meinh,
									Amount: item.AmtClaimed,
									SubletDescription: item.SubletDescription,
									URI: item.URI,
									SubletType: item.ItemKey,
									Brand: item.Brand,
									Days: item.Days
								};

							});

							this.obj = {
								"DBOperation": "SAVE",
								"Message": "",
								"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
								"Partner": this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner"),
								"ActionCode": oActionCode,
								"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
								"PartnerRole": "AS",
								"NameOfPersonRespWhoChangedObj": this.getModel("LocalDataModel").getProperty("/LoginId").substr(0, 12),
								"ReferenceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate")),
								"DateOfApplication": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication")),
								"FinalProcdDate": null,
								"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
								"RepairOrderNumberExternal": this.getView().getModel("HeadSetData").getProperty("/RepairOrderNumberExternal"),
								"ExternalNumberOfClaim": this.getView().getModel("HeadSetData").getProperty("/ExternalNumberOfClaim"),
								"ExternalObjectNumber": this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber"),
								"Odometer": this.getView().getModel("HeadSetData").getProperty("/Odometer"),
								"TCIWaybillNumber": "",
								"ShipmentReceivedDate": null,
								"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
								"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
								"OFP": this.getView().byId("idOFP").getValue(),
								"WTYClaimRecoverySource": "",
								"MainOpsCode": this.getView().getModel("HeadSetData").getProperty("/MainOpsCode"),
								"T1WarrantyCodes": this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes"),
								"BatteryTestCode": this.getView().getModel("HeadSetData").getProperty("/BatteryTestCode"),
								"T2WarrantyCodes": this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes"),
								"FieldActionReference": this.getView().getModel("HeadSetData").getProperty("/FieldActionReference").toUpperCase(),
								"ZCondition": this.getView().getModel("HeadSetData").getProperty("/ZCondition"),
								"Cause": this.getView().getModel("HeadSetData").getProperty("/Cause"),
								"Remedy": this.getView().getModel("HeadSetData").getProperty("/Remedy"),
								"PreviousROInvoiceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty(
									"/PreviousROInvoiceDate")),
								"PreviousROOdometer": this.getView().getModel("HeadSetData").getProperty("/PreviousROOdometer"),
								"PreviousROInvoice": this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoice"),
								"AccessoryInstallOdometer": this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallOdometer"),
								"AccessoryInstallDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallDate")),
								"AgreementNumber": this.getView().getModel("HeadSetData").getProperty("/AgreementNumber"),
								"CustomerPostalCode": this.getView().getModel("HeadSetData").getProperty("/CustomerPostalCode"),
								"CustomerFullName": this.getView().getModel("HeadSetData").getProperty("/CustomerFullName"),
								"ProbillNum": this.getView().getModel("HeadSetData").getProperty("/ProbillNum"),
								"Delivery": this.getView().getModel("HeadSetData").getProperty("/Delivery"),
								"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
								"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
								"WarrantyClaimSubType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType"),
								"zc_itemSet": {
									"results": PartItem
								},
								"zc_claim_item_labourSet": {
									"results": LabourItem
								},
								"zc_claim_item_paintSet": {
									"results": PaintItem
								},
								"zc_item_subletSet": {
									"results": SubletItem
								},
								"zc_claim_attachmentsSet": {
									"results": []
								},
								"zc_claim_commentSet": {
									"results": this.getModel("LocalDataModel").getProperty("/claim_commentSet")
								},
								"zc_claim_item_damageSet": {
									"results": oDamageItem
								},
								"zc_claim_vsrSet": {
									"results": []
								},
								"zc_claim_item_price_dataSet": {
									"results": pricinghData
								}
							};

							if (bValidationError) {
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
								this.getView().byId("idMainClaimMessage").setType("Error");
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
							} else if (oClaimtype == "ZECP" && this.getView().getModel("HeadSetData").getProperty("/AgreementNumber") == "") {
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseSelectAgreement"));
								this.getView().byId("idMainClaimMessage").setType("Error");
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
							} else if (this.getModel("LocalDataModel").getProperty("/invalidVinMsg") == "Invalid VIN Number") {
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseEnterValidVIN"));
								this.getView().byId("idMainClaimMessage").setType("Error");
							} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZACD" &&
								this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "") {
								this.getView().byId("idSubmissionClaim").setProperty("enabled", true);
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
								this.getView().getModel("DateModel").setProperty("/claimTypeState2", "Error");
								MessageToast.show(
									oBundle.getText("submissionTypeMandatory"), {
										my: "center center",
										at: "center center"
									});
							} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZAUT" &&
								this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "") {
								this.getView().byId("idSubmissionClaim").setProperty("enabled", true);
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
								this.getView().getModel("DateModel").setProperty("/claimTypeState2", "Error");
								MessageToast.show(
									oBundle.getText("submissionTypeMandatory"), {
										my: "center center",
										at: "center center"
									});
							} else {
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
								this.getView().byId("idMainClaimMessage").setProperty("visible", false);
								this.getView().byId("idMainClaimMessage").setText("");
								this.getView().byId("idMainClaimMessage").setType("None");
								this.getView().byId("idOFP").setValueState("None");
								this.getView().byId("idMainOps").setValueState("None");
								this.getView().byId("idFieldActionInput").setValueState("None");
								this.getView().byId("idT2Field").setValueState("None");
								this.getView().byId("idT1Field").setValueState("None");
								this.getView().byId("idPreInvNum").setValueState("None");
								this.getView().getModel("DateModel").setProperty("/claimTypeState2", "None");
								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/zc_headSet", this.obj, {

									success: $.proxy(function (response) {
										this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
										console.log(oEvent);
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
										this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
										this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);
										MessageToast.show(oBundle.getText("ClaimUpdatedsuccessfully"), {
											my: "center center",
											at: "center center"
										});
										this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
										oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
											urlParameters: {
												"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
													"'"
											},
											success: $.proxy(function (sdata) {
												this.getView().getModel("HeadSetData").setData(sdata.results[0]);
												if (this.getModel("LocalDataModel").getProperty("/oIDBtn") != this.getModel("LocalDataModel").getProperty(
														"/SaveAuthClaim")) {
													this.getRouter().navTo("SearchClaim");
												}

												var oIndexMat = PartItem.findIndex($.proxy(function (item) {
													return item.MaterialNumber == this.getView().getModel("HeadSetData").getProperty("/OFP")
												}), this);
												if (oIndexMat > -1) {
													this.getView().byId("idTableParts").getItems()[oIndexMat].getCells()[1].setProperty("selected", true);
												}

												var oIndexLab = LabourItem.findIndex($.proxy(function (item) {
													return item.LabourNumber == this.getView().getModel("HeadSetData").getProperty("/MainOpsCode")
												}), this);

												if (oIndexLab > -1) {
													this.getView().byId("idLabourTable").getItems()[oIndexLab].getCells()[1].setProperty("selected", true);
												}

												var oIndexPaint = PaintItem.findIndex($.proxy(function (item) {
													return item.PaintPositionCode == this.getView().getModel("HeadSetData").getProperty("/MainOpsCode")
												}), this);
												if (oIndexPaint > -1) {
													this.getView().byId("idPaintTable").getItems()[oIndexPaint].getCells()[1].setProperty("selected", true);
												}

												this.getView().getModel("HeadSetData").setProperty("/RepairDate", response.RepairDate);
												this.getView().getModel("HeadSetData").setProperty("/ReferenceDate", response.ReferenceDate);
												this.getView().getModel("HeadSetData").setProperty("/DateOfApplication", response.DateOfApplication);
												this.getView().getModel("HeadSetData").setProperty("/AccessoryInstallDate", response.AccessoryInstallDate);
												this.getView().getModel("HeadSetData").setProperty("/PreviousROInvoiceDate", response.PreviousROInvoiceDate);
												this.getView().getModel("HeadSetData").setProperty("/DeliveryDate", response.DeliveryDate);

												oClaimModel.read("/zc_headSet", {
													urlParameters: {
														"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty(
																"/WarrantyClaimNum") +
															"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'",
														"$expand": "zc_claim_read_descriptionSet"
													},
													success: $.proxy(function (errorData) {

														this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", errorData.results[0].zc_claim_read_descriptionSet
															.results[0].OFPDescription);
														this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", errorData.results[0]
															.zc_claim_read_descriptionSet
															.results[0].MainOpsCodeDescription);
														this.getView().getModel("HeadSetData").setProperty("/HeadText", errorData.results[0].zc_claim_read_descriptionSet
															.results[0].HeadText);

													}, this)
												});

												if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZECP") {
													oClaimModel.read("/zc_cliam_agreement", {
														urlParameters: {
															"$filter": "VIN eq '" + this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber") +
																"'"
														},
														success: $.proxy(function (data) {
															this.getModel("LocalDataModel").setProperty("/AgreementDataECP", data.results);
															var oTable = this.getView().byId("idECPAGR");
															var oLength = data.results.filter(function (item) {
																return item.AgreementStatus == "Active"
															}).length;
															// 			var oTableSelectedRow = data.results.findIndex(function (item) {
															// 				return item.AgreementStatus == "Active"
															// 			});

															var oTableSelectedRow = data.results.findIndex(function (item) {
																if (sdata.results[0].AgreementNumber != "") {
																	return item.AgreementNumber == sdata.results[0].AgreementNumber

																} else {
																	return item.AgreementStatus == "Active"
																}
															});

															for (let i = 0; i < data.results.length; i++) {
																if (data.results[i].AgreementStatus == "Suspended") {
																	oTable.getItems()[i].getCells()[0].setProperty("enabled", false);
																	oTable.getItems()[i].getCells()[0].setProperty("selected", false);
																} else if (data.results[i].AgreementStatus == "Expired" && data.results[i].AgreementthruDate <
																	this.getView().getModel(
																		"HeadSetData").getProperty("/RepairDate")) {
																	oTable.getItems()[i].getCells()[0].setProperty("enabled", false);
																	oTable.getItems()[i].getCells()[0].setProperty("selected", false);
																} else {
																	oTable.getItems()[i].getCells()[0].setProperty("enabled", true);
																	oTable.getItems()[i].getCells()[0].setProperty("selected", false);
																}

															}
															if (oLength > 1) {
																//this.getView().byId("idECPAGR").removeSelections();
																oTable.getItems()[oTableSelectedRow].getCells()[0].setProperty("selected", false);
															} else if (oLength == 1) {
																oTable.getItems()[oTableSelectedRow].getCells()[0].setProperty("selected", true);
																this.getView().getModel("HeadSetData").setProperty("/AgreementNumber", data.results[
																	oTableSelectedRow].AgreementNumber);
															}

														}, this),
														error: function () {}
													});
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
						}, this),
						error: function () {}
					});

				}, this),
				error: function () {}
			});

		},
		onUpdateClaim: function (oEvent) {
			this._fnUpdateClaim(oEvent);
		},

		onEditClaim: function (e) {
			//var that = this;
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var GroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			if (GroupType == "Authorization") {
				this.getView().getModel("LocalDataModel").setProperty("/EditClaimAuthText", oBundle.getText("EditAuth"));
				this.getView().getModel("LocalDataModel").setProperty("/ClaimContentEditMessageText", oBundle.getText(
					"AuthAcceptedAcceptedStillEdit"));
			} else if (GroupType == "Claim") {
				this.getView().getModel("LocalDataModel").setProperty("/EditClaimAuthText", oBundle.getText("EditClaim"));
				this.getView().getModel("LocalDataModel").setProperty("/ClaimContentEditMessageText", oBundle.getText(
					"ClaimAcceptedAcceptedStillEdit"));
			}
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oClaimModel = this.getModel("ProssingModel");
			var obj = {
				NumberOfWarrantyClaim: oClaimNum,
				DBOperation: "ZTEA"
			};
			var dialog = new Dialog({
				title: this.getView().getModel("LocalDataModel").getProperty("/EditClaimAuthText"),
				type: "Message",
				content: new Text({
					text: this.getView().getModel("LocalDataModel").getProperty("/ClaimContentEditMessageText")
				}),

				buttons: [
					new Button({
						text: "Yes",
						press: $.proxy(function () {
							this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
							oClaimModel.update("/zc_headSet(NumberOfWarrantyClaim='" + oClaimNum + "')", obj, {
								method: "PUT",
								success: $.proxy(function (response) {
									this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
									oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
										urlParameters: {
											"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
												"'"
										},
										success: $.proxy(function (sdata) {

											this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
											this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
											this.getView().getModel("DateModel").setProperty("/updateEnable", true);
											this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
											this.getView().getModel("LocalDataModel").setProperty("/PercentState", true);
											this.getView().getModel("DateModel").setProperty("/oztac", true);
											this.getView().getModel("DateModel").setProperty("/authAcClm", false);
											this.getView().getModel("DateModel").setProperty("/authRejClm", false);
											this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
											this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
											this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);
											this._fnClaimSumPercent();
											this._fnClaimSum();
											this._fnPricingData(oClaimNum);
											this.getView().getModel("HeadSetData").setProperty("/DecisionCode", sdata.results[0].DecisionCode);
											if (sdata.results[0].DecisionCode == "ZTAA") {
												this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
											} else {
												this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
											}
										}, this)
									});
								}, this),
								error: $.proxy(function (err) {
									this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
								}, this)
							});
							dialog.close();
						}, this)
					}),
					new Button({
						text: "Cancel",
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
		},

		_fnClaimSum: function (e) {
			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.read("/ZC_CLAIM_SUM(p_clmno='" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "')/Set", {
				success: $.proxy(function (data) {

					this.getModel("LocalDataModel").setProperty("/ClaimSum", data.results);

				}, this)
			});
		},

		_fnClaimSumPercent: function (e) {
			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.read("/ZC_CLAIM_AUTH_SUM(p_clmno='" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "')/Set", {
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/ClaimSumAuth", data.results);
					var oRepAmt = data.results[data.results.length - 1].SubtotalAmt;
					var oClaimAmt = data.results[data.results.length - 1].ClaimAmt;
					this.getView().getModel("LocalDataModel").setProperty("/oRepairAmt", oRepAmt);
					this.getView().getModel("LocalDataModel").setProperty("/DataAuthDetails/TotalClaimAmountCAD", oClaimAmt);
					this.getModel("LocalDataModel").setProperty("/ClaimSumAuth/3/DiscountRate", "");
					this.getModel("LocalDataModel").setProperty("/ClaimSumAuth/3/MarkupRate", "");
				}, this)
			});
		},

		onChangeMainOp: function (oEvent) {
			if (this.getView().getModel("DateModel").getProperty("/oMainOpsReq") == false && oEvent.getParameters().value == "") {
				this.getView().byId("idMainOps").setValueState("None");
			}
			var partPricingModel = this.getModel("LocalDataModel").getProperty("/LabourPricingDataModel");

			var PaintPricingModel = this.getModel("LocalDataModel").getProperty("/PaintPricingDataModel");

			if (partPricingModel != "") {
				var oItems = this.getView().byId("idLabourTable").getItems();

				var oIndexMat = partPricingModel.findIndex($.proxy(function (item) {
					return item.ItemKey == oEvent.getParameters().value
				}), this);
				console.log(oIndexMat);

				for (var i = 0; i < partPricingModel.length; i++) {
					if (oEvent.getParameters().value == "" || partPricingModel[i].ItemKey != oEvent.getParameters().value) {
						this.getView().byId("idLabourTable").getItems()[i].getCells()[1].setProperty("selected", false);
						this.getView().getModel("HeadSetData").setProperty("/MainOpsCode", oEvent.getParameters().value);
					}

				}

				if (oIndexMat > -1) {
					this.getView().byId("idLabourTable").getItems()[oIndexMat].getCells()[1].setProperty("selected", true);
				}
			}

			if (PaintPricingModel != "") {
				var oIndexPaint = PaintPricingModel.findIndex($.proxy(function (item) {
					return item.ItemKey == this.getView().getModel("HeadSetData").getProperty("/MainOpsCode")
				}), this);

				for (var i = 0; i < PaintPricingModel.length; i++) {
					if (oEvent.getParameters().value == "" || PaintPricingModel[i].ItemKey != oEvent.getParameters().value) {
						this.getView().byId("idPaintTable").getItems()[i].getCells()[1].setProperty("selected", false);
						this.getView().getModel("HeadSetData").setProperty("/MainOpsCode", oEvent.getParameters().value);
					}

				}

				if (oIndexPaint > -1) {
					this.getView().byId("idPaintTable").getItems()[oIndexPaint].getCells()[1].setProperty("selected", true);
				}
			}

		},

		onChangeOFP: function (oEvent) {
			if (this.getView().getModel("DateModel").getProperty("/ofpRequired") == false && oEvent.getParameters().value == "") {
				this.getView().byId("idOFP").setValueState("None");
			}
			var partPricingModel = this.getModel("LocalDataModel").getProperty("/PricingDataModel");
			if (partPricingModel != "") {
				var oItems = this.getView().byId("idTableParts").getItems();
				var oIndexMat = partPricingModel.findIndex($.proxy(function (item) {
					return item.ItemKey == oEvent.getParameters().value
				}), this);
				console.log(oIndexMat);

				for (var i = 0; i < partPricingModel.length; i++) {
					if (oEvent.getParameters().value == "" || partPricingModel[i].ItemKey != oEvent.getParameters().value) {
						this.getView().byId("idTableParts").getItems()[i].getCells()[1].setProperty("selected", false);
						this.getView().getModel("HeadSetData").setProperty("/OFP", oEvent.getParameters().value);
					}

				}

				if (oIndexMat > -1) {
					this.getView().byId("idTableParts").getItems()[oIndexMat].getCells()[1].setProperty("selected", true);
				}
			}
		},

		onBeforeUpload: function () {

		},
		onUplaodChange: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.getModel("LocalDataModel").setProperty("/IndicatorState", true);
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			//this.obj.Message = "";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			var reader = new FileReader();

			if (oClaimNum != "" && oClaimNum != undefined) {
				this.oUploadedFile = oEvent.getParameter("files")[0];
				if (FileReader.prototype.readAsBinaryString === undefined) {
					FileReader.prototype.readAsBinaryString = function (fileData) {
						var binary = "";
						var pt = this;

						reader.onload = function (e) {
							var bytes = new Uint8Array(reader.result);
							var length = bytes.byteLength;
							for (var i = 0; i < length; i++) {
								binary += String.fromCharCode(bytes[i]);
							}
							//pt.result  - readonly so assign content to another property
							pt.content = binary;
							pt.onload(); // thanks to @Denis comment
						};
						reader.readAsArrayBuffer(fileData);
					};
				}
				reader.readAsBinaryString(this.oUploadedFile);

				reader.onload = $.proxy(function (e) {
					var strCSV = e.target.result;
					if (reader.result) reader.content = reader.result;
					this.oBase = btoa(reader.content);

				}, this);

			} else {
				MessageToast.show(oBundle.getText("PleaseSaveClaimtryAttachments"), {
					my: "center center",
					at: "center center"
				});
			}

			/****************To Fetch CSRF Token*******************/

		},
		// getCurrentFolderPath: function () {
		// 	var aHistory = this.getView().getModel("ClaimModel").getProperty("/history");
		// 	// get the current folder path
		// 	var sPath = aHistory.length > 0 ? aHistory[aHistory.length - 1].path : "/";
		// 	return sPath;
		// },

		onFileSizeExceed: function () {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			MessageToast.show(oBundle.getText("FileSizeExceed"), {
				my: "center center",
				at: "center center"
			});
		},
		onUploadComplete: function (oEvent) {

			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var fileType = this.oUploadedFile.type;
			//var oUploadedFileArr = this.oUploadedFile.name.split(".").reverse();
			//var oFileExt = oUploadedFileArr[0].length;
			var oFileName = this.oUploadedFile.name;
			//oFileName = this.oUploadedFile.name.replace("." + oFileExt, "");

			// if (oFileExt > 3) {
			// 	oFileName = this.oUploadedFile.name.slice(0, -1);
			// } else {
			// 	oFileName = this.oUploadedFile.name;
			// }

			var fileNamePrior = "HEAD@@@" + oFileName;
			var fileName = fileNamePrior;
			var isProxy = "";
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			var oURI = isProxy + "/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + fileName +
				"')/$value";

			if (oURI == null) {
				console.log("Error");
				//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
			}
			console.log(oURI);

			var itemObj = {
				"NumberOfWarrantyClaim": oClaimNum,
				"COMP_ID": fileName,
				"ContentLine": this.oBase,
				"Mimetype": fileType,
				"URI": oURI,
				"AttachLevel": "HEAD"
			};

			this.obj.zc_claim_attachmentsSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
					this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.OFPDescription);
					this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.MainOpsCodeDescription);
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

		onSubletUploadComplete: function (oEvent) {

			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oSubletType = this.getView().getModel("SubletDataModel").getProperty("/SubletCode");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oSubLength = this.getModel("LocalDataModel").getProperty("/SubletAtchmentData").length;
			console.log(oSubLength);
			if (oSubletType != "") {
				var fileType = this.oUploadedFile.type;
				var oFileName = this.oUploadedFile.name;
				var fileNamePrior = oSubletType + "@@@" + oFileName;
				var fileName = fileNamePrior;

				var isProxy = "";
				if (window.document.domain == "localhost") {
					isProxy = "proxy";
				}
				var oURI = isProxy + "/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + fileName +
					"')/$value";

				if (oURI == null) {
					console.log("Error");
					//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
				}
				console.log(oURI);

				var itemObj = {
					"NumberOfWarrantyClaim": oClaimNum,
					"ContentLine": this.oBase,
					"COMP_ID": fileName,
					"MIMEType": fileType,
					"URI": oURI,
					"AttachLevel": "SUBL",
					"DBOperation": "POST"
				};

				var oClaimModel = this.getModel("ProssingModel");

				oClaimModel.refreshSecurityToken();

				oClaimModel.create("/zc_claim_subletattachmentSet", itemObj, {
					success: $.proxy(function (data, response) {
						this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
						MessageToast.show(oBundle.getText("SuccesFullyUploaded"), {
							my: "center center",
							at: "center center"
						});
						//	var oFileName = "sub" + fileName;
						oClaimModel.read("/zc_claim_subletattachmentSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'SUBL' and FileName eq'" + fileName + "'"
							},
							success: $.proxy(function (subletData) {
								this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
								var oAttachSet = subletData.results.map(function (item) {
									item.FileName = item.FileName.replace(oSubletType + "@@@", "");
									return item;
								});
								this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", oAttachSet);
							}, this)
						});
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {

				this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
				MessageToast.show(oBundle.getText("SelectSubletTypeGoForAttachment"), {
					my: "center center",
					at: "center center"
				});
			}

		},

		// onSelectUpload: function (oEvent) {
		// 	console.log(OEvent);
		// },
		onClickURISublet: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (oEvent.getSource().getHref() == "") {
				MessageToast.show(oBundle.getText("Noattachmentsexists"), {
					my: "center center",
					at: "center center"
				});
			}
		},
		onFileDeleted: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var oClaimModel = this.getModel("ProssingModel");

			var oLine = oEvent.getSource()._oItemForDelete._iLineNumber;
			var oFileName = this.getModel("LocalDataModel").getProperty("/HeadAtchmentData/" + oLine + "/FileName");
			var oFileToDelete = "HEAD@@@" + oFileName;

			oClaimModel.refreshSecurityToken();

			oClaimModel.remove("/zc_claim_attachmentsSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + oFileToDelete + "')", {
				method: "DELETE",
				success: $.proxy(function () {
					MessageToast.show(oBundle.getText("Filedeletedsuccessfully"), {
						my: "center center",
						at: "center center"
					});
					oClaimModel.read("/zc_claim_attachmentsSet", {
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
		onFileSubletDeleted: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oSubletType = this.getView().getModel("SubletDataModel").getProperty("/SubletCode");
			var oFileName = oEvent.getParameters().item.getFileName();
			var oFileDeleteName = oSubletType + "@@@" + oFileName;
			var oClaimModel = this.getModel("ProssingModel");
			var itemObj = {
				"NumberOfWarrantyClaim": oClaimNum,
				"COMP_ID": oFileName,
				"DBOperation": "DELT"
			};
			oClaimModel.refreshSecurityToken();

			// oClaimModel.create("/zc_claim_subletattachmentSet", itemObj, {

			// 	success: $.proxy(function () {
			// 		oClaimModel.refresh();

			// 		oClaimModel.read("/zc_claim_subletattachmentSet", {
			// 			urlParameters: {
			// 				"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'SUBL' and FileName  eq ''"
			// 			},
			// 			//	startswith(CompanyName, 'Alfr') eq true
			// 			success: $.proxy(function (subletData) {
			// 				this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", subletData.results);
			// 			}, this)
			// 		});
			// 		MessageToast.show(oBundle.getText("Filedeletedsuccessfully"));
			// 	}, this)
			// });

			oClaimModel.remove("/zc_claim_attachmentsSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + oFileDeleteName + "')", {
				method: "DELETE",
				success: $.proxy(function () {
					MessageToast.show(oBundle.getText("Filedeletedsuccessfully"), {
						my: "center center",
						at: "center center"
					});
					oClaimModel.read("/zc_claim_subletattachmentSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'SUBL' and FileName eq'" + oFileDeleteName +
								"'"
						},
						success: $.proxy(function (subletData) {
							var oAttachSet = subletData.results.map(function (item) {
								item.FileName = item.FileName.replace(oSubletType + "@@@", "");
								return item;

							});
							this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", oAttachSet);
							this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);
						}, this)
					});
				}, this)
			});
		},

		onPressTCIQty: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("ProssingModel");
			var oPartNumber = oEvent.getSource().getParent().getCells()[2].getText();
			oClaimModel.read("/zc_claim_item_price_dataSet", {
				urlParameters: {
					"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'"
				},
				success: $.proxy(function (data) {
					var oFilterText = data.results.filter(function (item) {
						return item.ItemKey == oPartNumber
					})

					var oFinalText = oBundle.getText("QTY") + " : " + oFilterText[0].CoreRej1 + " " + " " +
						oBundle.getText("RejectionCode") + " : " + "1" + "\n" +
						oBundle.getText("QTY") + " : " + oFilterText[0].CoreRej2 + " " + " " +
						oBundle.getText("RejectionCode") + " : " + "2" + "\n" +
						oBundle.getText("QTY") + " : " + oFilterText[0].CoreRej3 + " " + " " +
						oBundle.getText("RejectionCode") + " : " + "3" + "\n" +
						oBundle.getText("QTY") + " : " + oFilterText[0].CoreRej4 + " " + " " +
						oBundle.getText("RejectionCode") + " : " + "4" + "\n" +
						oBundle.getText("QTY") + " : " + oFilterText[0].CoreRej5 + " " + " " +
						oBundle.getText("RejectionCode") + " : " + "5" + "\n" +
						oBundle.getText("QTY") + " : " + oFilterText[0].CoreRej6 + " " + " " +
						oBundle.getText("RejectionCode") + " : " + "6";

					this.getView().getModel("LocalDataModel").setProperty("/RejectionCodeData", oFinalText);

				}, this)
			});
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.ViewRejectionCode", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},

		onPressAddPart: function () {
			var oTable = this.getView().byId("idTableParts");
			oTable.removeSelections("true");
			this.getView().getModel("DateModel").setProperty("/partLine", true);
			this.getView().getModel("DateModel").setProperty("/editablePartNumber", true);

			var sSelectedLocale;
			var sDivision;

			var isDivisionSent = window.location.search.match(/Division=([^&]*)/i);
			if (isDivisionSent) {
				sDivision = window.location.search.match(/Division=([^&]*)/i)[1];
			} else {
				sDivision = 10;
			}
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oClaimModel = this.getModel("ProssingModel");
			var productModel = this.getModel("ProductMaster");

		},
		onPressAddLabour: function () {

			var oTable = this.getView().byId("idLabourTable");
			oTable.removeSelections("true");
			this.getView().getModel("DateModel").setProperty("/labourLine", true);
			this.getView().getModel("DateModel").setProperty("/editableLabourNumber", true);
		},
		onPressAddPaint: function () {
			var oTable = this.getView().byId("idPaintTable");
			oTable.removeSelections("true");
			this.getView().getModel("DateModel").setProperty("/paintLine", true);
		},
		onPressAddSublet: function () {
			var oTable = this.getView().byId("idSubletTable");
			oTable.removeSelections("true");
			this.getView().getModel("DateModel").setProperty("/subletLine", true);
			this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);
			this.getView().getModel("DateModel").setProperty("/editableSublNumber", true);
		},
		onPressRecalculate: function () {

			var oRadioInd = this.getView().byId("idPricingOpt").getSelectedIndex();
			var oCustomerPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/CustomerPer"));
			var oDealerPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/DealerPer"));
			var oTciPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/TCIPer"));
			var PartPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/PartPer"));
			var LabourPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/LabourPer"));
			var SublPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/SubletPer"));

			var oAuthNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("ProssingModel");

			if (oRadioInd == 0) {
				if ((oCustomerPer + oDealerPer + oTciPer) == 100) {
					this.getModel("LocalDataModel").setProperty("/discountBusyIndicator", true);
					oClaimModel.read("/zc_authorizationSet", {
						urlParameters: {
							"$filter": "PricingOption eq'P'and DBOperation eq 'POST'and AuthorizationNumber eq '" + oAuthNum + "'and DealerPer eq '" +
								oDealerPer +
								"'and CustomerPer eq '" + oCustomerPer +
								"'and TCIPer eq '" + oTciPer + "'"
						},
						success: $.proxy(function (sdata) {
							this.getModel("LocalDataModel").setProperty("/discountBusyIndicator", false);
							this.getView().getModel("DataPercetCalculate").setData(sdata.results[0]);
							var ocust = parseInt(sdata.results[0].CustomerPer).toString();
							var odeal = parseInt(sdata.results[0].DealerPer).toString();
							var otci = parseInt(sdata.results[0].TCIPer).toString();
							var oPartPer = parseInt(sdata.results[0].PartPer).toString();
							var oLabourPer = parseInt(sdata.results[0].LabourPer).toString();
							var oSubletPer = parseInt(sdata.results[0].SubletPer).toString();
							this.getView().getModel("DataPercetCalculate").setProperty("/CustomerPer", ocust);
							this.getView().getModel("DataPercetCalculate").setProperty("/DealerPer", odeal);
							this.getView().getModel("DataPercetCalculate").setProperty("/TCIPer", otci);

							this.getView().getModel("DataPercetCalculate").setProperty("/PartPer", oPartPer);
							this.getView().getModel("DataPercetCalculate").setProperty("/LabourPer", oLabourPer);
							this.getView().getModel("DataPercetCalculate").setProperty("/SubletPer", oSubletPer);
							this._fnClaimSumPercent();
							this._fnClaimSum();
							this._fnPricingData(oAuthNum);

						}, this)

					});
				} else {
					MessageToast.show(oBundle.getText("TheSumpercentwithin100"), {
						my: "center center",
						at: "center center"
					});

				}

			} else if (oRadioInd == 1) {
				// if ((PartPer + LabourPer + SublPer) == 100) {
				this.getModel("LocalDataModel").setProperty("/discountBusyIndicator", true);
				oClaimModel.read("/zc_authorizationSet", {
					urlParameters: {
						"$filter": "PricingOption eq 'D'and DBOperation eq 'POST'and AuthorizationNumber eq '" + oAuthNum + "'and PartPer eq '" +
							PartPer +
							"'and LabourPer eq '" + LabourPer +
							"'and SubletPer eq '" + SublPer + "'"
					},
					success: $.proxy(function (sdata) {
						this.getModel("LocalDataModel").setProperty("/discountBusyIndicator", false);
						this.getView().getModel("DataPercetCalculate").setData(sdata.results[0]);
						var ocust = parseInt(sdata.results[0].CustomerPer).toString();
						var odeal = parseInt(sdata.results[0].DealerPer).toString();
						var otci = parseInt(sdata.results[0].TCIPer).toString();
						var oPartPer = parseInt(sdata.results[0].PartPer).toString();
						var oLabourPer = parseInt(sdata.results[0].LabourPer).toString();
						var oSubletPer = parseInt(sdata.results[0].SubletPer).toString();
						this.getView().getModel("DataPercetCalculate").setProperty("/CustomerPer", ocust);
						this.getView().getModel("DataPercetCalculate").setProperty("/DealerPer", odeal);
						this.getView().getModel("DataPercetCalculate").setProperty("/TCIPer", otci);

						this.getView().getModel("DataPercetCalculate").setProperty("/PartPer", oPartPer);
						this.getView().getModel("DataPercetCalculate").setProperty("/LabourPer", oLabourPer);
						this.getView().getModel("DataPercetCalculate").setProperty("/SubletPer", oSubletPer);
						this._fnClaimSumPercent();
						this._fnClaimSum();
						this._fnPricingData(oAuthNum);

					}, this)

				});

				// } else {
				// 	MessageToast.show(oBundle.getText("TheSumpercentwithin100"), {
				// 		my: "center center",
				// 		at: "center center"
				// 	});

				// }

			}

		},

		_fnPricingData: function (oAuthNum) {
			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.read("/zc_claim_item_price_dataSet", {
				urlParameters: {
					"$filter": "NumberOfWarrantyClaim eq '" + oAuthNum + "' "

				},
				success: $.proxy(function (data) {

					var pricinghData = data.results;
					var oFilteredData = pricinghData.filter(function (val) {
						return val.ItemType === "MAT";
					});

					this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);

					var oFilteredDataLabour = pricinghData.filter(function (val) {
						return val.ItemType === "FR" && val.LabourNumber[0] != "P";
					});

					this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredDataLabour);

					var oFilteredDataPaint = pricinghData.filter(function (val) {
						return val.ItemType === "FR" && val.LabourNumber[0] == "P";
					});
					this.getModel("LocalDataModel").setProperty("/PaintPricingDataModel", oFilteredDataPaint);

					var oFilteredDataSubl = pricinghData.filter(function (val) {
						return val.ItemType === "SUBL";
					});

					this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredDataSubl);
				}, this)
			});
		},
		onPressForeignVin: function () {
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.ForeignVinNotification", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},
		onPressWrittenOff: function () {
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.WrittenOff", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},
		onCloseWrittenOf: function (oEvent) {
			oEvent.getSource().getParent().getParent().close();
		},
		onCloseForeinNotification: function (oEvent) {
			oEvent.getSource().getParent().getParent().close();
		},
		onPressSpecialVin: function () {
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.SpecialHandling", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
			this.getView().getModel("HeadSetData").setProperty("/SpecialVINReview", "Yes");
		},
		onCopyClaim: function () {
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			//HeadSetData>/NumberOfWarrantyClaim
			var oClaimType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oClaimModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimGroup = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			var oAuthNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			if (oAuthNum != "" && oAuthNum != undefined) {

				if (oClaimType == "ZAUT" || oClaimType == "ZACD") {
					this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
					oClaimModel.read("/zc_auth_copy_to_claimSet(NumberOfAuth='" + oAuthNum + "')", {

						success: $.proxy(function (data) {
							var oClaimNum = data.NumberOfWarrantyClaim;
							this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
							this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);
							oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
								urlParameters: {
									"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'"
								},
								success: $.proxy(function (cdata) {
									this.getView().getModel("HeadSetData").setData(cdata.results[0]);

									oClaimModel.read("/zc_headSet", {
										urlParameters: {
											"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum +
												"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'",
											"$expand": "zc_claim_vsrSet,zc_claim_read_descriptionSet"
										},
										success: $.proxy(function (errorData) {
											this.getModel("LocalDataModel").setProperty("/oErrorSet", errorData.results[0].zc_claim_vsrSet.results);
											this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].OFPDescription);
											this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].MainOpsCodeDescription);
											this.getView().getModel("HeadSetData").setProperty("/ReferenceDate", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].ReferenceDate);
											this.getView().getModel("HeadSetData").setProperty("/DateOfApplication", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].DateOfApplication);
											this.getView().getModel("HeadSetData").setProperty("/RepairDate", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].RepairDate);
											this.getView().getModel("HeadSetData").setProperty("/PreviousROInvoiceDate", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].PreviousROInvoiceDate);
											this.getView().getModel("HeadSetData").setProperty("/DeliveryDate", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].DeliveryDate);
											this.getView().getModel("HeadSetData").setProperty("/AccessoryInstallDate", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].AccessoryInstallDate);
											this.getView().getModel("HeadSetData").setProperty("/HeadText", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].HeadText);
										}, this)
									});

									this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaimNum);
									this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber") + " : " +
										oClaimNum);

									this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
									this.getModel("LocalDataModel").setProperty("/reCalculate", false);

									//this.getModel("LocalDataModel").setProperty("/PercentState", false);
									this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoAuthorization"));
									this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveClaim"));

									this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
									this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
									this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
									this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
									this.getView().getModel("DateModel").setProperty("/updateEnable", true);
									//this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
									this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
									this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);

									this.getView().getModel("DateModel").setProperty("/authAcClm", false);
									this.getView().getModel("DateModel").setProperty("/authRejClm", false);
									this.getModel("LocalDataModel").setProperty("/PercentState", false);

									oClaimModel.read("/zc_authorization_detailsSet", {
										urlParameters: {
											"$filter": "AuthorizationNumber eq '" + oAuthNum + "'"
										},
										success: $.proxy(function (oAuthData) {
											this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
										}, this)
									});

									oClaimModel.read("/zc_authorizationSet", {
										urlParameters: {
											"$filter": "DBOperation eq 'READ'and AuthorizationNumber eq '" +
												oAuthNum +
												"'and DealerPer eq '00'and CustomerPer eq '00'and TCIPer eq '00'and PartPer eq '00'and LabourPer eq '00'and SubletPer eq '00'"
										},
										success: $.proxy(function (sdata) {

											this.getView().getModel("DataPercetCalculate").setData(sdata.results[0]);
											var ocust = parseInt(sdata.results[0].CustomerPer).toString();
											var odeal = parseInt(sdata.results[0].DealerPer).toString();
											var otci = parseInt(sdata.results[0].TCIPer).toString();
											var oPartPer = parseInt(sdata.results[0].PartPer).toString();
											var oLabourPer = parseInt(sdata.results[0].LabourPer).toString();
											var oSubletPer = parseInt(sdata.results[0].SubletPer).toString();

											if (oPartPer != "0" || oLabourPer != "0" || oSubletPer != "0") {
												this.getView().byId("idPricingOpt").setSelectedIndex(1);
												this.getView().byId("idParticiaptionTable").setProperty("visible", false);
												this.getView().byId("idDiscountTable").setProperty("visible", true);
											} else {
												this.getView().byId("idPricingOpt").setSelectedIndex(0);
												this.getView().byId("idParticiaptionTable").setProperty("visible", true);
												this.getView().byId("idDiscountTable").setProperty("visible", false);
											}

											this.getView().getModel("DataPercetCalculate").setProperty("/CustomerPer", ocust);
											this.getView().getModel("DataPercetCalculate").setProperty("/DealerPer", odeal);
											this.getView().getModel("DataPercetCalculate").setProperty("/TCIPer", otci);

											this.getView().getModel("DataPercetCalculate").setProperty("/PartPer", oPartPer);
											this.getView().getModel("DataPercetCalculate").setProperty("/LabourPer", oLabourPer);
											this.getView().getModel("DataPercetCalculate").setProperty("/SubletPer", oSubletPer);
											this._fnClaimSum();
											this._fnClaimSumPercent();
											this._fnPricingData(oClaimNum);

											this.getView().getModel("DateModel").setProperty("/updateEnable", true);
										}, this)
									});

									this.getView().getModel("DateModel").setProperty("/updateEnable", true);
								}, this)
							});
						}, this),
						error: $.proxy(function (error) {
							this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
							MessageToast.show(JSON.parse(error.responseText).error.message.value, {
								my: "center center",
								at: "center center"
							});
						}, this)

					});

				} else if (oClaimType != "ZAUT" || oClaimType != "ZACD") {
					this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
					oClaimModel.read("/zc_claim_copy_to_authSet(NumberOfWarrantyClaim='" + oAuthNum + "')", {

						success: $.proxy(function (data) {
							this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
							var oClaimNum = data.NumberOfAuth;
							this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", true);
							oClaimModel.read("/zc_authorization_detailsSet", {
								urlParameters: {
									"$filter": "AuthorizationNumber eq '" + oClaimNum + "'"
								},
								success: $.proxy(function (oAuthData) {
									this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
								}, this)
							});
							oClaimModel.read("/zc_authorizationSet", {
								urlParameters: {
									"$filter": "DBOperation eq 'LINK'and Numberofwarrantyclaim eq '" + oClaimNum + "'and  AuthorizationNumber eq '" +
										oAuthNum +
										"'and DealerPer eq '00'and CustomerPer eq '00'and TCIPer eq '00'and PartPer eq '00'and LabourPer eq '00'and SubletPer eq '00'"
								},
								success: $.proxy(function (sdata) {

									this.getView().getModel("DataPercetCalculate").setData(sdata.results[0]);
									var ocust = parseInt(sdata.results[0].CustomerPer).toString();
									var odeal = parseInt(sdata.results[0].DealerPer).toString();
									var otci = parseInt(sdata.results[0].TCIPer).toString();
									var oPartPer = parseInt(sdata.results[0].PartPer).toString();
									var oLabourPer = parseInt(sdata.results[0].LabourPer).toString();
									var oSubletPer = parseInt(sdata.results[0].SubletPer).toString();
									if (oPartPer != "0" || oLabourPer != "0" || oSubletPer != "0") {
										this.getView().byId("idPricingOpt").setSelectedIndex(1);
										this.getView().byId("idParticiaptionTable").setProperty("visible", false);
										this.getView().byId("idDiscountTable").setProperty("visible", true);
									} else {
										this.getView().byId("idPricingOpt").setSelectedIndex(0);
										this.getView().byId("idParticiaptionTable").setProperty("visible", true);
										this.getView().byId("idDiscountTable").setProperty("visible", false);
									}
									this.getView().getModel("DataPercetCalculate").setProperty("/CustomerPer", ocust);
									this.getView().getModel("DataPercetCalculate").setProperty("/DealerPer", odeal);
									this.getView().getModel("DataPercetCalculate").setProperty("/TCIPer", otci);

									this.getView().getModel("DataPercetCalculate").setProperty("/PartPer", oPartPer);
									this.getView().getModel("DataPercetCalculate").setProperty("/LabourPer", oLabourPer);
									this.getView().getModel("DataPercetCalculate").setProperty("/SubletPer", oSubletPer);
									this._fnClaimSum();
									this._fnClaimSumPercent();
									this._fnPricingData(oClaimNum);

									this.getView().getModel("DateModel").setProperty("/updateEnable", true);
								}, this)
							});
							oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
								urlParameters: {
									"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'"
								},
								success: $.proxy(function (cdata) {
									this.getView().getModel("HeadSetData").setData(cdata.results[0]);

									if (cdata.results[0].DecisionCode == "ZTAA") {
										this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
									} else {
										this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
									}

									oClaimModel.read("/zc_headSet", {
										urlParameters: {
											"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum +
												"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'",
											"$expand": "zc_claim_vsrSet,zc_claim_read_descriptionSet"
										},
										success: $.proxy(function (errorData) {
											this.getModel("LocalDataModel").setProperty("/oErrorSet", errorData.results[0].zc_claim_vsrSet.results);
											this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].OFPDescription);
											this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].MainOpsCodeDescription);
											this.getView().getModel("HeadSetData").setProperty("/ReferenceDate", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].ReferenceDate);

											this.getView().getModel("HeadSetData").setProperty("/DateOfApplication", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].DateOfApplication);

											this.getView().getModel("HeadSetData").setProperty("/RepairDate", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].RepairDate);
											this.getView().getModel("HeadSetData").setProperty("/PreviousROInvoiceDate", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].PreviousROInvoiceDate);
											this.getView().getModel("HeadSetData").setProperty("/DeliveryDate", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].DeliveryDate);
											this.getView().getModel("HeadSetData").setProperty("/AccessoryInstallDate", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].AccessoryInstallDate);
											this.getView().getModel("HeadSetData").setProperty("/HeadText", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].HeadText);
										}, this)
									});

									this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaimNum);
									this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIAuthNumber") + " : " +
										oClaimNum);

									this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
									this.getModel("LocalDataModel").setProperty("/reCalculate", true);
									this.getModel("LocalDataModel").setProperty("/PercentState", true);
									this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoClaim"));
									this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveAuth"));
								}, this)
							});
						}, this),
						error: $.proxy(function (error) {
							this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
							MessageToast.show(JSON.parse(error.responseText).error.message.value, {
								my: "center center",
								at: "center center"
							});
						}, this)
					});
				}
			} else {
				MessageToast.show(oBundle.getText("PleasecreateclaimNumber"), {
					my: "center center",
					at: "center center"
				});
			}

		},
		onPressLinkAuthorization: function () {
			var oProssingModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oClaim = this.getView().getModel("DataPercetCalculate").getProperty("/AuthorizationNumber");
			oProssingModel.read("/zc_authorization_detailsSet", {
				urlParameters: {
					"$filter": "AuthorizationNumber eq '" + oClaim + "'"
				},
				success: $.proxy(function (oAuthData) {
					this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
				}, this)
			});

			oProssingModel.read("/zc_authorizationSet", {
				urlParameters: {
					"$filter": "DBOperation eq 'LINK'and Numberofwarrantyclaim eq '" + oClaimNum + "'and  AuthorizationNumber eq '" + oClaim +
						"'and DealerPer eq '00'and CustomerPer eq '00'and TCIPer eq '00'and PartPer eq '00'and LabourPer eq '00'and SubletPer eq '00'"
				},
				success: $.proxy(function (data) {
					if (data.results[0].Message == "") {
						this.getView().getModel("DataPercetCalculate").setData(data.results[0]);
						var ocust = parseInt(data.results[0].CustomerPer).toString();
						var odeal = parseInt(data.results[0].DealerPer).toString();
						var otci = parseInt(data.results[0].TCIPer).toString();
						var oPartPer = parseInt(data.results[0].PartPer).toString();
						var oLabourPer = parseInt(data.results[0].LabourPer).toString();
						var oSubletPer = parseInt(data.results[0].SubletPer).toString();
						if (oPartPer != "0" || oLabourPer != "0" || oSubletPer != "0") {
							this.getView().byId("idPricingOpt").setSelectedIndex(1);
							this.getView().byId("idParticiaptionTable").setProperty("visible", false);
							this.getView().byId("idDiscountTable").setProperty("visible", true);
						} else {
							this.getView().byId("idPricingOpt").setSelectedIndex(0);
							this.getView().byId("idParticiaptionTable").setProperty("visible", true);
							this.getView().byId("idDiscountTable").setProperty("visible", false);
						}
						this.getView().getModel("DataPercetCalculate").setProperty("/CustomerPer", ocust);
						this.getView().getModel("DataPercetCalculate").setProperty("/DealerPer", odeal);
						this.getView().getModel("DataPercetCalculate").setProperty("/TCIPer", otci);
						this.getView().getModel("DataPercetCalculate").setProperty("/PartPer", oPartPer);
						this.getView().getModel("DataPercetCalculate").setProperty("/LabourPer", oLabourPer);
						this.getView().getModel("DataPercetCalculate").setProperty("/SubletPer", oSubletPer);
						this._fnClaimSum();
						this._fnClaimSumPercent();
						this._fnPricingData(oClaimNum);

					} else if (data.results[0].Message != "") {
						MessageToast.show(data.results[0].Message, {
							my: "center center",
							at: "center center"
						});
					}
				}, this)
			});
		},
		onStep01Next: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWMS" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWMS" || this.getModel("LocalDataModel").getProperty(
					"/GroupDescriptionName") === "CRC" || this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") ===
				"ZRCR") {
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
				this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimSubletSection"));
				this.getView().byId("idSubletCode").focus();
			} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZLDC" &&
				this.getModel("LocalDataModel").getProperty("/DataItemDamageSet").length <= 0) {
				this.getView().byId("idDamageArea").focus();
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseAddatleastoneDamageLine"));
				this.getView().byId("idMainClaimMessage").setType("Error");
			} else {
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
				this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().byId("idPartNumber").focus();
			}

		},
		onStep03Next: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
			var oProssingModel = this.getModel("ProssingModel");
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}

			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWP2" || this.getView().getModel("HeadSetData")
				.getProperty(
					"/WarrantyClaimSubType") == "ZWP2") {
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ValidatePartsSection"));
			} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSCR" || this.getView().getModel(
					"HeadSetData").getProperty(
					"/WarrantyClaimType") == "ZSSM") {
				this.getView().byId("idFilter07").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ValidatePartsSection"));
			} else {
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimLabourSection"));
				this.getView().byId("idOperationLabour").focus();
			}

		},
		onStep03Back: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getView().byId("idFilter01").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
			this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("MainSection"));
		},

		onStep04Next: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" && this.getView().getModel("HeadSetData")
				.getProperty(
					"/WarrantyClaimType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA2" && this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimType") != "ZWP1" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" && this.getView().getModel("HeadSetData")
				.getProperty(
					"/WarrantyClaimSubType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA2" &&
				this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimSubType") != "ZWP1" &&
				this.getModel("LocalDataModel").getProperty("/oFieldAction") != "FAC" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimType") != "ZECP" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCSR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCER" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCWE" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCLS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZLDC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCER" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCLS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCSR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCWE"
			) {
				this.getView().byId("idFilter05").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab5");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimPaintRustSection"));
			} else {
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimSubletSection"));
			}
		},
		onStep04Back: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getView().byId("idFilter03").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
			this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimPartsSection"));

		},

		onStep05Next: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" && this.getView().getModel("HeadSetData")
				.getProperty(
					"/WarrantyClaimType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA2" && this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" && this.getView().getModel("HeadSetData")
				.getProperty(
					"/WarrantyClaimSubType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA2" &&
				this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC" &&
				this.getModel("LocalDataModel").getProperty(
					"/oFieldAction") != "FAC" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZECP" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCSR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCER" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCWE" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCLS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCER" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCLS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCSR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCWE"
			) {
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimSubletSection"));
			}
		},
		onStep05Back: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getView().byId("idFilter04").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
			this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimLabourSection"));

		},

		onStep06Next: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			// 	if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWP2") {
			// 	this.getView().byId("idFilter07").setProperty("enabled", true);
			// 	this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
			// }else 
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA1" && this.getView().getModel("HeadSetData")
				.getProperty(
					"/WarrantyClaimType") != "ZWA2" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" && this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA1" && this.getView().getModel("HeadSetData")
				.getProperty(
					"/WarrantyClaimSubType") != "ZWA2" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC" &&
				this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" &&

				this.getView().getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "ZSSE" &&

				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZECP" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCSR" &&

				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSSM" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZLDC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZRCR"
			) {
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimAuthorizationSection"));
			} else {
				this.getView().byId("idFilter07").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ValidatePartsSection"));
			}
		},
		onStep06Back: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWA1" || this.getView().getModel("HeadSetData")
				.getProperty(
					"/WarrantyClaimType") == "ZWA2" || this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWAC" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWA1" || this.getView().getModel("HeadSetData")
				.getProperty(
					"/WarrantyClaimSubType") == "ZWA2" || this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWAC" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWP1" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWP1" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZLDC"
			) {
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimLabourSection"));
			} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWMS" || this.getView().getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") == "ZRCR") {
				this.getView().byId("idFilter01").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("MainSection"));
			} else {
				this.getView().byId("idFilter05").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab5");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimPaintRustSection"));
			}
			if (this.getModel("LocalDataModel").getProperty("/oFieldAction") == "FAC") {
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimLabourSection"));
			}

			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZECP") {
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimLabourSection"));
			}

			if (
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZCSR" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZCLS" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZCWE" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZCER" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZCSR" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZCLS" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZCWE" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZCER"

			) {
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimLabourSection"));
			}

		},
		onStep02Next: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" && this.getView().getModel("HeadSetData")
				.getProperty(
					"/WarrantyClaimType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA2" && this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" && this.getView().getModel("HeadSetData")
				.getProperty(
					"/WarrantyClaimSubType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA2" &&
				this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC") {
				this.getView().byId("idFilter07").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ValidatePartsSection"));
			}
		},
		onStep02Back: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getView().byId("idFilter06").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
			this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimSubletSection"));
		},

		onStep07Back: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWP2" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWP2" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSCR" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSSM"
			) {
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimPartsSection"));
			} else if (
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA1" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA2" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA1" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA2" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC" &&

				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZECP" &&

				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSCR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZLDC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSSM") {
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimAuthorizationSection"));
			} else {
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimSubletSection"));
			}

		},

		onSelectTab: function (oSelectedKey) {
			// debugger;
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (oSelectedKey.getParameters().selectedKey == "Tab1") {
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("MainSection"));
			} else if (oSelectedKey.getParameters().selectedKey == "Tab2") {
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimAuthorizationSection"));
			} else if (oSelectedKey.getParameters().selectedKey == "Tab3") {
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimPartsSection"));
			} else if (oSelectedKey.getParameters().selectedKey == "Tab4") {
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimLabourSection"));
			} else if (oSelectedKey.getParameters().selectedKey == "Tab5") {
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimPaintRustSection"));
			} else if (oSelectedKey.getParameters().selectedKey == "Tab6") {
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ClaimSubletSection"));
			} else if (oSelectedKey.getParameters().selectedKey == "Tab7") {
				this.getView().byId("mainSectionTitle").setTitle(this.oBundle.getText("ValidatePartsSection"));
			}
		},
		onPressBack: function (oEvent) {
			var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			this.ogetSelectedKey = this.getView().byId("idIconTabMainClaim").getSelectedKey();
			var ogetKey = this.ogetSelectedKey.split("Tab")[1];
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var that = this;

			if (that.getModel("LocalDataModel").getProperty("/NavList") == "Inq") {
				that.getRouter().navTo("ClaimInquiry");
			} else {
				if (oClaimNum == undefined) {
					that.fnOpenDialogOnBack();
				} else if (
					that.getView().getModel("HeadSetData").getProperty("/DecisionCode") == "ZTIC" && sap.ui.getCore().getModel("UserDataModel").getProperty(
						"/LoggedInUser") == "Dealer_Services_Admin" ||
					that.getView().getModel("HeadSetData").getProperty("/DecisionCode") == "ZTIC" && sap.ui.getCore().getModel("UserDataModel").getProperty(
						"/LoggedInUser") == "Dealer_Services_Manager" ||
					that.getView().getModel("HeadSetData").getProperty("/DecisionCode") == "ZTRC" && sap.ui.getCore().getModel("UserDataModel").getProperty(
						"/LoggedInUser") == "Dealer_Services_Manager" ||
					that.getView().getModel("HeadSetData").getProperty("/DecisionCode") == "ZTRC" && sap.ui.getCore().getModel("UserDataModel").getProperty(
						"/LoggedInUser") == "Dealer_Services_Admin") {
					var dialog = new Dialog({
						title: oBundle.getText("SaveChanges"),
						type: "Message",
						content: new Text({
							text: oBundle.getText("WillYouLikeSaveChanges")
						}),

						buttons: [
							new Button({
								text: oBundle.getText("Yes"),
								press: function () {

									that._fnUpdateClaim(oEvent);

									//that._fnUpdateClaim();
									//that.getRouter().navTo("SearchClaim");

									dialog.close();

								}
							}),

							new Button({
								text: oBundle.getText("No"),
								press: function () {

									that.getRouter().navTo("SearchClaim");

									dialog.close();
								}
							})

						],

						afterClose: function () {
							dialog.destroy();
						}
					});

					dialog.open();
				} else if (
					sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "Dealer_User" ||
					sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "TCI_Admin" ||
					sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "TCI_User" ||
					sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "Zone_User"
				) {
					that.getRouter().navTo("SearchClaim");
				} else {
					that.getRouter().navTo("SearchClaim");
				}
			}

		},

		fnOpenDialogOnBack: function () {
			var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			this.ogetSelectedKey = this.getView().byId("idIconTabMainClaim").getSelectedKey();
			var ogetKey = this.ogetSelectedKey.split("Tab")[1];
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var that = this;

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

		_handleValueHelpSearch: function (evt) {
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

		_handleValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			this.oSelectedTitle = evt.mParameters.selectedItems[0].getCells()[0].getText();
			var oBaseUint = evt.mParameters.selectedItems[0].getCells()[2].getText();
			var oDescription = evt.mParameters.selectedItems[0].getCells()[1].getText();
			var oProductModel = this.getModel("ProductMaster");
			oProductModel.read("/ZC_Characteristic_InfoSet", {
				urlParameters: {
					"$filter": "MATERIAL eq '" + this.oSelectedTitle + "' and CLASS eq 'WARRANTY_INFO' and CHARAC eq 'Warranty Alternate Unit'"
				},
				success: $.proxy(function (data) {
					if (data.results.length > 0) {
						if (data.results[0].VALUE != "?") {
							this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", data.results[0].VALUE);
						} else {
							this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", oBaseUint);
						}

					} else {
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

		onSelectAgreement: function (oEvent) {
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);
			// 			var oPath = oEvent.getSource().getSelectedContextPaths()[0];
			// 			var oObj = this.getModel("LocalDataModel").getProperty(oPath);
			this.getView().getModel("HeadSetData").setProperty("/AgreementNumber", oEvent.getSource().getParent().getCells()[1].getText());
		},
		onPressSavePart: function () {

			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
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
				"MaterialNumber": this.getView().getModel("PartDataModel").getProperty("/matnr"),
				"PartQty": this.getView().getModel("PartDataModel").getProperty("/quant"),
				"PartDescription": this.getView().getModel("PartDataModel").getProperty("/PartDescription"),
				"UnitOfMeasure": this.getView().getModel("LocalDataModel").getProperty("/BaseUnit")
			};

			var oArrNew = this.obj.zc_itemSet.results.filter(function (val) {
				return val.MaterialNumber === itemObj.MaterialNumber;
			}).length;

			console.log(oArrNew);

			var oTableIndex = oTable._aSelectedPaths;

			var oClaimModel = this.getModel("ProssingModel");

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
				MessageToast.show(oBundle.getText("PartNumExists"), {
					my: "center center",
					at: "center center"
				});
			} else {
				this.obj.zc_itemSet.results.push(itemObj);
				this.getView().byId("idPartQty").setValueState("None");
				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
						var pricinghData = response.data.zc_claim_item_price_dataSet.results;

						this.getView().getModel("HeadSetData").setProperty("/OFP", response.data.OFP);

						var oFilteredData = pricinghData.filter(function (val) {
							return val.ItemType === "MAT";
						});
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);

						var oIndexMat = oFilteredData.findIndex($.proxy(function (item) {
							return item.ItemKey == this.getView().getModel("HeadSetData").getProperty("/OFP")
						}), this);
						if (oIndexMat > -1) {
							this.getView().byId("idTableParts").getItems()[oIndexMat].getCells()[1].setProperty("selected", true);
						}
						MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"), {
							my: "center center",
							at: "center center"
						});
						this.getView().getModel("DateModel").setProperty("/partLine", false);
						this.getView().getModel("PartDataModel").setProperty("/matnr", "");
						this.getView().getModel("PartDataModel").setProperty("/quant", "");
						this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
						this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "");
						//this.getView().byId("idPartDes").setValue("");

						oTable.removeSelections("true");

						this._fnClaimSum();
						this._fnClaimSumPercent();

					}, this),
					error: $.proxy(function (err) {
						MessageToast.show(oBundle.getText("SystemInternalError"));
						this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
					}, this)
				});
			}

		},

		onFieldActionInput: function (oEvent) {
			var FieldAction = oEvent.getParameters().value.toUpperCase();
			var ODealer = oEvent.getSource().getValue().toUpperCase();
			this.getView().getModel("HeadSetData").setProperty("/FieldActionReference", ODealer);

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
				this.getView().getModel("PartDataModel").setProperty("/PartDescription", obj.PartDescription);
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
		},
		onPressDeletePart: function () {

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
								if (PartNum == this.getView().getModel("HeadSetData").getProperty("/OFP")) {
									this.getView().getModel("HeadSetData").setProperty("/OFP", "");
								}

								var oIndex = parseInt(oTable._aSelectedPaths.toString().split("/")[2]);
								this.obj.zc_itemSet.results.splice(oFindIndexOfSelectedObj, 1);

								var oClaimModel = this.getModel("ProssingModel");
								this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
								this.obj.DBOperation = "SAVE";
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/zc_headSet", this.obj, {
									success: $.proxy(function (data, response) {
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
										this.getView().getModel("DateModel").setProperty("/RadioSelectedOFP", false);
										var pricinghData = response.data.zc_claim_item_price_dataSet.results;
										var oFilteredData = pricinghData.filter(function (val) {
											return val.ItemType === "MAT";
										});

										this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);
										console.log(oFilteredData);
										this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
										oTable.removeSelections("true");
										MessageToast.show(oBundle.getText("ItemDeletedSuccessfully"), {
											my: "center center",
											at: "center center"
										});
										this._fnClaimSum();
										this._fnClaimSumPercent();
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
		onSelectOFP: function (oEvent) {
			//this.getView().getModel("DateModel").setProperty("/RadioSelectedOFP", true);
			var table = this.getView().byId("idTableParts");
			var oSelectedPart = oEvent.getSource().getParent().getCells()[2].getText();
			this.getView().byId("idOFPart").setText(oSelectedPart);
			table.removeSelections("true");
		},
		onSelectOFPLabour: function (oEvent) {
			var table = this.getView().byId("idLabourTable");
			var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
			var oSelectedPart = oEvent.getSource().getParent().getCells()[2].getText();
			//var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.getView().byId("idOFPLabour").setText(oSelectedPart);
		},
		onSelectOFPPrint: function (oEvent) {
			var table = this.getView().byId("idPaintTable");
			var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
			var oSelectedPart = oEvent.getSource().getParent().getCells()[2].getText();
			//var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.getView().byId("idOFPLabour").setText(oSelectedPart);
		},
		onPressSuggestLabour: function (oEvent) {

			var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			//var oSelectedPart = oEvent.getSource().getParent().getCells()[2].getText();
			var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			//this.getView().byId("idOFPLabour").setText(oSelectedPart);
			var oProssingModel = this.getModel("ProssingModel");
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.operationList", this);

			if (oOFP != "") {
				oProssingModel.read("/zc_get_suggested_operationsSet", {
					urlParameters: {
						"$filter": "CLMNO eq '" + oClaimNum + "'and OFP_GROUP eq '" + oOFP + "' and VHVIN eq '" + oVin + "' and Langu eq '" +
							sSelectedLocale.toUpperCase() + "'"
					},
					success: $.proxy(function (data) {
						this.getModel("LocalDataModel").setProperty("/SuggetionOperationListFiltered", data.results);

						this.getView().addDependent(oDialogBox);
						oDialogBox.open();
					}, this),
					error: function () {
						console.log("Error");
					}
				});
			} else {
				MessageToast.show(oBundle.getText("PlsFillupOFP"));
			}
		},
		onCloseLabour: function (oEvent) {
			oEvent.getSource().getParent().getParent().getParent().close();
		},
		onCloseRejectionCode: function (oEvent) {
			oEvent.getSource().getParent().getParent().close();
		},
		onCloseLoop: function (oEvent) {
			oEvent.getSource().getParent().getParent().close();
		},
		onSelectPositionCode: function (oEvent) {
			if (oEvent) {
				var oItem = oEvent.getParameter("selectedItem");
				var SelectedVal = oItem ? oItem.getText() : "";
				var OAdditionalText = oItem ? oItem.getAdditionalText() : "";
				//this.getModel("LocalDataModel").setProperty("/labourDes", oText);
				//this.getView().byId("idLabourDes").setValue(oText);
				this.getView().getModel("LabourDataModel").setProperty("/LabourOp", SelectedVal);
				this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", OAdditionalText);
			}

		},

		_handleValueHelpSearchLabour: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"J_3GKATNRC",
				sap.ui.model.FilterOperator.StartsWith, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleLiveChangeLabour: function (evt) {
			var sValue = evt.getParameter("value");

			if (sValue) {
				var oFilter = new Filter(
					"J_3GKATNRC",
					sap.ui.model.FilterOperator.StartsWith, sValue
				);
				//console.log(oFilter);
				evt.getSource().getBinding("items").filter([oFilter]);
			} else {
				evt.getSource().getBinding("items").filter([]);
			}
		},
		_handleValueHelpCloseLabour: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
			var oProssingModel = this.getModel("ProssingModel");
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}

			if (oSelectedItem) {
				var oTitle = oSelectedItem.getTitle();
				var oDescription = oSelectedItem.getDescription();
				var oGetHr = oSelectedItem.getInfo();
				this.getView().getModel("LabourDataModel").setProperty("/LabourOp", oTitle);
				this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", oDescription);
				this.getView().getModel("LabourDataModel").setProperty("/ClaimedHours", oGetHr);

			}
			evt.getSource().getBinding("items").filter([]);
		},

		_handleValueHelpClosePaint: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var oTitle = oSelectedItem.getTitle();
				//var oDescription = oSelectedItem.getDescription();

				this.getView().getModel("PaintDataModel").setProperty("/PaintPositionCode", oTitle);

			}
			evt.getSource().getBinding("items").filter([]);
		},

		handleValueHelpLabour: function (oEvent) {
			this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", true);
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
			var oProssingModel = this.getModel("ProssingModel");
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			oProssingModel.read("/zc_get_operation_numberSet", {
				urlParameters: {
					"$filter": "CLMNO eq '" + oClaimNum + "' and VHVIN eq '" + oVin + "' and Langu eq '" + sSelectedLocale.toUpperCase() + "'"
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", false);
					var oLabourArray = data.results.filter(function (item) {

						return item.J_3GKATNRC[0] != "P";
						//return item.ItemKey[14] == "P";
					});
					this.getModel("LocalDataModel").setProperty("/SuggetionOperationList", oLabourArray);
					var oPaintData = data.results.filter(function (item) {

						return item.J_3GKATNRC[0] == "P";

					});
					console.log(oPaintData);
					this.getModel("LocalDataModel").setProperty("/oPaintList", oPaintData);

				}, this),
				error: $.proxy(function (err) {
					MessageToast.show(oBundle.getText("SystemInternalError"));
					this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
				}, this)
			});

			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog01) {
				this._valueHelpDialog01 = sap.ui.xmlfragment(
					"zclaimProcessing.view.fragments.LabourValueHelp",
					this
				);

				// var oValHelp = this._valueHelpDialog01.mAggregations._dialog;
				// this._valueHelpDialog01.bindAggregation({
				// 	path: "/zc_get_operation_numberSet",
				// 	filters: [{
				// 		filters: [{
				// 			path: 'CLMNO',
				// 			operator: 'EQ',
				// 			value1: oClaimNum
				// 		}, {
				// 			path: 'VHVIN',
				// 			operator: 'EQ',
				// 			value1: oVin
				// 		}, {
				// 			path: 'Langu',
				// 			operator: 'EQ',
				// 			value1: sSelectedLocale.toUpperCase()
				// 		}],
				// 		and: true
				// 	}],
				// 	template: new sap.m.StandardListItem({
				// 		title: "{J_3GKATNRC}",
				// 		description: "{LTEXT}",
				// 		info: "{TIME}"
				// 	})
				// });
				this.getView().addDependent(this._valueHelpDialog01);
			}

			// create a filter for the binding
			this._valueHelpDialog01.getBinding("items").filter([new Filter(
				"J_3GKATNRC",
				sap.ui.model.FilterOperator.Contains, sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog01.open(sInputValue);
		},

		handleValueHelpPaint: function (oEvent) {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
			var oProssingModel = this.getModel("ProssingModel");
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", true);
			oProssingModel.read("/zc_get_operation_numberSet", {
				urlParameters: {
					"$filter": "CLMNO eq '" + oClaimNum + "' and VHVIN eq '" + oVin + "' and Langu eq '" + sSelectedLocale.toUpperCase() + "'"
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", false);
					var oLabourArray = data.results.filter(function (item) {

						return item.J_3GKATNRC[0] != "P";
						//return item.ItemKey[14] == "P";
					});
					this.getModel("LocalDataModel").setProperty("/SuggetionOperationList", oLabourArray);
					var oPaintData = data.results.filter(function (item) {

						return item.J_3GKATNRC[0] == "P";

					});
					console.log(oPaintData);
					this.getModel("LocalDataModel").setProperty("/oPaintList", oPaintData);

				}, this),
				error: $.proxy(function (err) {
					MessageToast.show(this.oBundle.getText("SystemInternalError"));
					this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
				}, this)
			});

			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog02) {
				this._valueHelpDialog02 = sap.ui.xmlfragment(
					"zclaimProcessing.view.fragments.PaintValueHelp",
					this
				);
				this.getView().addDependent(this._valueHelpDialog02);
			}

			// create a filter for the binding
			this._valueHelpDialog02.getBinding("items").filter([new Filter(
				"J_3GKATNRC",
				sap.ui.model.FilterOperator.Contains, sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog02.open(sInputValue);
		},

		onSelectPositionPaintCode: function (oEvent) {
			if (oEvent) {
				var oItem = oEvent.getParameter("selectedItem");
				var SelectedVal = oItem ? oItem.getText() : "";
				this.getView().getModel("PaintDataModel").setProperty("/PaintPositionCode", SelectedVal);

			}

		},

		onSelectOperation: function (oEvent) {
			var oPath = oEvent.getSource().getSelectedContexts()[0].sPath;
			var obj = this.getModel("LocalDataModel").getProperty(oPath);
			this.SelectedOpNum = {
				"J_3GKATNRC": obj.J_3GKATNRC,
				"CLMNO": obj.CLMNO,
				"RELOB_EXT": obj.RELOB_EXT
			};
			this.getView().getModel("LabourDataModel").setProperty("/LabourOp", obj.J_3GKATNRC);
			this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", obj.LTEXT);
			this.getView().getModel("LabourDataModel").setProperty("/ClaimedHours", obj.TIME);
			this.getView().getModel("DateModel").setProperty("/SuggestBtn", true);
			this.getView().getModel("DateModel").setProperty("/labourLine", true);
		},
		handleConfirmLabour: function (oEvent) {
			var oOperationListSuggestion = this.getModel("LocalDataModel").getProperty("/SuggetionOperationListFiltered");
			var oOperationList = this.getModel("LocalDataModel").getProperty("/SuggetionOperationList");
			// for(var i=0; i<oOperationListSuggestion.length; i++){
			// 	if(oOperationList.indexOf(oOperationListSuggestion[i].J_3GKATNRC) < 0){
			// 		oOperationList.push(this.SelectedOpNum);

			// 	}else {
			// 		MessageToast.show("Operation Number Already Exist");
			// 	}
			// }
			// oOperationList.push(this.SelectedOpNum);
			// oOperationListSuggestion.pop(this.SelectedOpNum);

			// this.getModel("LocalDataModel").setProperty("/SuggetionOperationList", oOperationList);
			// this.getModel("LocalDataModel").setProperty("/SuggetionOperationListFiltered", oOperationListSuggestion);
			oEvent.getSource().getParent().getParent().getParent().close();
		},
		onPressSaveClaimItemLabour: function () {

			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oTable = this.getView().byId("idLabourTable");
			var oTableIndex = oTable._aSelectedPaths;

			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			// this.obj.Message = "";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
			this.obj.DBOperation = "SAVE";
			this.obj.WarrantyClaimSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			var oClaimHr = this.getView().getModel("LabourDataModel").getProperty("/ClaimedHours");
			if (oClaimHr == "") {
				oClaimHr = "0.0";
			}

			if (oTableIndex.length == 1) {

				var oIndex = this.obj.zc_claim_item_labourSet.results.findIndex(({
					LabourNumber
				}) => LabourNumber == this.getView().getModel("LabourDataModel").getProperty("/LabourOp"));
				this.obj.zc_claim_item_labourSet.results.splice(oIndex, 1);
			}

			var itemObj = {
				"Type": "LABOUR",
				"ItemType": "FR",
				"LabourNumber": this.getView().getModel("LabourDataModel").getProperty("/LabourOp"),
				"ClaimedHours": oClaimHr,
				"LabourDescription": this.getView().getModel("LabourDataModel").getProperty("/LabourDescription")
			};

			var oIndexItem = this.obj.zc_claim_item_labourSet.results.findIndex(function (item) {
				return item.LabourNumber == itemObj.LabourNumber;
			});

			if (oIndexItem == -1) {
				this.obj.zc_claim_item_labourSet.results.push(itemObj);
			}

			var oClaimModel = this.getModel("ProssingModel");

			oClaimModel.refreshSecurityToken();
			if (itemObj.LabourNumber != "") {
				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
						console.log(response);
						var pricinghData = response.data.zc_claim_item_price_dataSet.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.ItemType === "FR" && val.ItemKey[0] != "P";
						});

						this.getView().getModel("HeadSetData").setProperty("/OFP", response.data.OFP);

						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredData);
						var oIndexMat = oFilteredData.findIndex($.proxy(function (item) {
							return item.ItemKey == this.getView().getModel("HeadSetData").getProperty("/MainOpsCode")
						}), this);
						if (oIndexMat > -1) {
							this.getView().byId("idLabourTable").getItems()[oIndexMat].getCells()[1].setProperty("selected", true);
						}

						//this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
						MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"), {
							my: "center center",
							at: "center center"
						});
						this.getView().getModel("DateModel").setProperty("/labourLine", false);
						this.getView().getModel("LabourDataModel").setProperty("/LabourOp", "");
						this.getView().getModel("LabourDataModel").setProperty("/ClaimedHours", "");
						this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", "");
						this._fnClaimSum();
						this._fnClaimSumPercent();
						oTable.removeSelections("true");
					}, this),
					error: $.proxy(function (err) {
						MessageToast.show(oBundle.getText("SystemInternalError"));
						this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
					}, this)
				});

			} else {
				MessageToast.show(oBundle.getText("OperationNumberinputfieldblank"), {
					my: "center center",
					at: "center center"
				});
			}

		},

		onPressDeleteLabour: function () {

			var oTable = this.getView().byId("idLabourTable");
			var oTableIndex = oTable._aSelectedPaths;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oSelectedRow = oTableIndex.toString();
			var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
			var LabourNum = obj.ItemKey;

			var oFindIndexOfSelectedObj = this.obj.zc_claim_item_labourSet.results.findIndex(function (elm) {
				return elm.LabourNumber === LabourNum;
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
								if (LabourNum == this.getView().getModel("HeadSetData").getProperty("/MainOpsCode")) {
									this.getView().getModel("HeadSetData").setProperty("/MainOpsCode", "");
								}

								var oIndex = parseInt(oTable._aSelectedPaths.toString().split("/")[2]);
								this.obj.zc_claim_item_labourSet.results.splice(oFindIndexOfSelectedObj, 1);
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
								var oClaimModel = this.getModel("ProssingModel");
								this.obj.DBOperation = "SAVE";
								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/zc_headSet", this.obj, {
									success: $.proxy(function (data, response) {
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
										var pricinghData = response.data.zc_claim_item_price_dataSet.results;
										var oFilteredData = pricinghData.filter(function (val) {
											return val.ItemType === "FR" && val.ItemKey[0] != "P";
										});

										this.getView().getModel("HeadSetData").setProperty("/OFP", response.data.OFP);

										console.log(oFilteredData);
										this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredData);
										MessageToast.show(oBundle.getText("ItemDeletedSuccessfully"), {
											my: "center center",
											at: "center center"
										});
										oTable.removeSelections("true");
										this._fnClaimSum();
										this._fnClaimSumPercent();

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

		onPressUpdateLabour: function (oEvent) {
			var oTable = this.getView().byId("idLabourTable");
			var oTableIndex = oTable._aSelectedPaths;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			if (oTableIndex.length == 1) {
				// var oString = oTableIndex.toString();
				var oSelectedRow = oTableIndex.toString();
				var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
				var LabourNum = obj.ItemKey;
				var LabourHr = obj.QtyHrs;
				this.getView().getModel("LabourDataModel").setProperty("/LabourOp", LabourNum);
				this.getView().getModel("LabourDataModel").setProperty("/ClaimedHours", LabourHr);
				this.getView().getModel("DateModel").setProperty("/labourLine", true);
				this.getView().getModel("DateModel").setProperty("/editableLabourNumber", false);
				//this.getView().byId("idLabourDes").setText(obj.LabourDescription);
				this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", obj.LabourDescription);
				// for (var j = 0; j < this.obj.zc_claim_item_labourSet.results.length; j++) {
				// 	if (this.obj.zc_claim_item_labourSet.results[j].LabourNumber == LabourNum) {
				// 		this.obj.zc_claim_item_labourSet.results.splice(j);
				// 	}
				// }
				//var oIndex = parseInt(oTable._aSelectedPaths.toString().split("/")[2]);
				//this.obj.zc_claim_item_labourSet.results.splice(oIndex, 1);
				var oClaimModel = this.getModel("ProssingModel");

			} else {
				MessageToast.show(oBundle.getText("Pleaseselect1row"), {
					my: "center center",
					at: "center center"
				});
				oTable.removeSelections("true");
			}
		},
		onPressCancelLabour: function () {
			this.getView().getModel("LabourDataModel").setProperty("/LabourOp", "");
			this.getView().getModel("LabourDataModel").setProperty("/ClaimedHours", "");
			this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", "");
		},

		onPressSavePaint: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.obj.Message = "";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
			this.obj.DBOperation = "SAVE";
			this.obj.WarrantyClaimSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			var oTable = this.getView().byId("idPaintTable");
			var itemObj = {
				"ItemType": "PAINT",
				"PaintPositionCode": this.getView().getModel("PaintDataModel").getProperty("/PaintPositionCode"),
				"ClaimedHours": "0.00"
			};

			var oIndexItem = this.obj.zc_claim_item_paintSet.results.findIndex(function (item) {
				return item.PaintPositionCode == itemObj.PaintPositionCode;
			});

			if (oIndexItem == -1) {
				this.obj.zc_claim_item_paintSet.results.push(itemObj);
			}

			//this.obj.zc_claim_item_paintSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");
			// this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
			// $.ajaxSetup({
			// 	headers: {
			// 		'X-CSRF-Token': this._oToken
			// 	}
			// });

			this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);

			this.obj.DBOperation = "SAVE";

			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
					console.log(response);
					var pricinghData = response.data.zc_claim_item_price_dataSet.results;
					var oFilteredData = pricinghData.filter(function (val) {
						return val.ItemType === "FR" && val.ItemKey[0] == "P";
					});

					console.log(oFilteredData);
					this.getModel("LocalDataModel").setProperty("/PaintPricingDataModel", oFilteredData);
					var oIndexMat = oFilteredData.findIndex($.proxy(function (item) {
						return item.ItemKey == this.getView().getModel("HeadSetData").getProperty("/MainOpsCode")
					}), this);
					if (oIndexMat > -1) {
						this.getView().byId("idPaintTable").getItems()[oIndexMat].getCells()[1].setProperty("selected", true);
					}
					//this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
					MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"), {
						my: "center center",
						at: "center center"
					});
					this.getView().getModel("DateModel").setProperty("/paintLine", false);
					this.getView().getModel("PaintDataModel").setProperty("/PaintPositionCode", "");
					oTable.removeSelections("true");
				}, this),
				error: $.proxy(function (err) {
					MessageToast.show(oBundle.getText("SystemInternalError"));
					this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
				}, this)
			});

		},
		onPressCancelPaint: function () {
			this.getView().getModel("PaintDataModel").setProperty("/PaintPositionCode", "");
		},
		onPressDeletePaint: function () {
			var oTable = this.getView().byId("idPaintTable");
			var oTableIndex = oTable._aSelectedPaths;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			if (oTableIndex.length == 1) {

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
								this.obj.zc_claim_item_paintSet.results.splice(oIndex, 1);
								this.obj.DBOperation = "SAVE";
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
								var oClaimModel = this.getModel("ProssingModel");
								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/zc_headSet", this.obj, {
									success: $.proxy(function (data, response) {
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
										var pricinghData = response.data.zc_claim_item_price_dataSet.results;
										var oFilteredData = pricinghData.filter(function (val) {
											return val.ItemType === "FR" && val.ItemKey[0] == "P";
										});

										this.getModel("LocalDataModel").setProperty("/PaintPricingDataModel", oFilteredData);
										MessageToast.show(oBundle.getText("ItemDeletedSuccessfully"), {
											my: "center center",
											at: "center center"
										});
										oTable.removeSelections("true");
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
		onChangeSublet: function (oEvent) {
			var AdditonalUnit = oEvent.getParameters().selectedItem.getAdditionalText();
			this.getView().getModel("SubletDataModel").setProperty("/unitOfMeasure", AdditonalUnit);
			var oSelectedSublet = oEvent.getParameters().selectedItem.getKey();
			if (oSelectedSublet == "L2" || oSelectedSublet == "L3" ||
				oSelectedSublet == "L4" ||
				oSelectedSublet == "C2" ||
				oSelectedSublet == "C3" || oSelectedSublet == "C4" ||
				oSelectedSublet == "RT" || oSelectedSublet == "RL" || oSelectedSublet == "RO") {
				this.getView().getModel("DateModel").setProperty("/disableBrandDays", true);

			} else {
				this.getView().getModel("DateModel").setProperty("/disableBrandDays", false);
			}
		},
		onPressSaveClaimItemSublet: function () {

			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oTable = this.getView().byId("idSubletTable");
			this.obj.Message = "";
			this.obj.DBOperation = "SAVE";
			this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			this.obj.WarrantyClaimSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			var oDays;
			var oTableIndex = oTable._aSelectedPaths;
			if (oTableIndex.length == 1) {
				// var oIndex = parseInt(oTable._aSelectedPaths.toString().split("/")[2]);
				// this.obj.zc_item_subletSet.results.splice(oIndex, 1);

				var oIndex = this.obj.zc_item_subletSet.results.findIndex(({
					SubletType
				}) => SubletType == this.getView().getModel("SubletDataModel").getProperty("/SubletCode"));
				this.obj.zc_item_subletSet.results.splice(oIndex, 1);
			}

			if (this.getView().getModel("SubletDataModel").getProperty("/days") == "") {
				oDays = null;
			} else {
				oDays = this.getView().getModel("SubletDataModel").getProperty("/days");
			}
			if (this.getModel("LocalDataModel").getProperty("/SubletAtchmentData") != undefined && this.getModel("LocalDataModel").getProperty(
					"/SubletAtchmentData") != "") {

				var itemObj = {
					"ItemType": "SUBL",
					"SubletType": this.getView().getModel("SubletDataModel").getProperty("/SubletCode"),
					"InvoiceNo": this.getView().getModel("SubletDataModel").getProperty("/InvoiceNo"),
					"Amount": this.getView().getModel("SubletDataModel").getProperty("/Amount") || "0.00",
					"SubletDescription": this.getView().getModel("SubletDataModel").getProperty("/description"),
					"URI": this.getModel("LocalDataModel").getProperty("/SubletAtchmentData/0/URI"),
					"UnitOfMeasure": this.getView().getModel("SubletDataModel").getProperty("/unitOfMeasure"),
					"Brand": this.getView().getModel("SubletDataModel").getProperty("/brand"),
					"Days": oDays
				};
				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
				var oIndexItem = this.obj.zc_item_subletSet.results.findIndex(function (item) {
					return item.SubletType == itemObj.SubletType;
				});

				if (oIndexItem == -1) {
					this.obj.zc_item_subletSet.results.push(itemObj);
				}

				var oClaimModel = this.getModel("ProssingModel");

				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
						var pricinghData = response.data.zc_claim_item_price_dataSet.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.ItemType === "SUBL";
						});

						this.getView().getModel("HeadSetData").setProperty("/OFP", response.data.OFP);

						this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredData);

						var oFilteredDataLabour = pricinghData.filter(function (val) {
							return val.ItemType === "FR" && val.ItemKey[0] != "P";
						});

						this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredDataLabour);

						MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"), {
							my: "center center",
							at: "center center"
						});
						this.getView().getModel("DateModel").setProperty("/subletLine", false);
						this.getView().getModel("SubletDataModel").setProperty("/SubletCode", "");
						this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", "");
						this.getView().getModel("SubletDataModel").setProperty("/Amount", "");
						this.getView().getModel("SubletDataModel").setProperty("/description", "");
						this.getView().getModel("SubletDataModel").setProperty("/brand", "");
						this.getView().getModel("SubletDataModel").setProperty("/days", "");
						oTable.removeSelections("true");
						this._fnClaimSum();
						this._fnClaimSumPercent();
						this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", "");

					}, this),
					error: $.proxy(function (err) {
						MessageToast.show(oBundle.getText("SystemInternalError"));
						this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
					}, this)
				});
			} else {
				MessageToast.show("Attachment is required.", {
					my: "center center",
					at: "center center"
				});
			}
		},

		fnUrlFormat: function (oVal) {
			var ogetVal;
			if (oVal) {
				//this.getView().getModel("DateModel").setProperty("/oVisibleURL", "View");
				//ogetVal = oVal;
				oVal.fontsize(20);
				ogetVal = oVal;
			} else {
				this.getView().getModel("DateModel").setProperty("/oVisibleURL", "");
				oVal.fontcolor("ff0");
				ogetVal = oVal;
			}
			return ogetVal;

		},

		onPressUpdateSublet: function (oEvent) {
			var oSubLength = this.getModel("LocalDataModel").getProperty("/SubletAtchmentData").length;
			this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
			//Math.abs(
			this.getView().getModel("DateModel").setProperty("/subletLine", false);
			var oTable = this.getView().byId("idSubletTable");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oClaimModel = this.getModel("ProssingModel");

			var oTableIndex = oTable._aSelectedPaths;
			if (oTableIndex.length == 1) {

				//var oString = oTableIndex.toString();
				var oSelectedRow = oTableIndex.toString();
				var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
				this.getView().getModel("DateModel").setProperty("/editableSublNumber", false);
				console.log(obj.URI);
				if (obj.matnr == "L2" || obj.matnr == "L3" ||
					obj.matnr == "L4" ||
					obj.matnr == "C2" ||
					obj.matnr == "C3" || obj.matnr == "C4" ||
					obj.matnr == "RT" || obj.matnr == "RL" || obj.matnr == "RO") {
					this.getView().getModel("DateModel").setProperty("/disableBrandDays", true);

				} else {
					this.getView().getModel("DateModel").setProperty("/disableBrandDays", false);
				}
				this.getModel("LocalDataModel").setProperty("/IndicatorState", true);

				var SubletNum = obj.matnr;
				var SubletInv = obj.InvoiceNo;
				var SubletAmount = obj.AmtClaimed;

				var oDays = Math.abs(parseInt(obj.Days));

				this.getView().getModel("SubletDataModel").setProperty("/SubletCode", SubletNum);
				this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", SubletInv);
				this.getView().getModel("SubletDataModel").setProperty("/Amount", SubletAmount);
				this.getView().getModel("SubletDataModel").setProperty("/description", obj.SubletDescription);
				this.getView().getModel("SubletDataModel").setProperty("/brand", obj.Brand);

				this.getView().getModel("SubletDataModel").setProperty("/days", oDays.toString());

				this.getView().getModel("SubletDataModel").setProperty("/unitOfMeasure", obj.Meinh);
				if (obj.URI != "") {
					var oFile = obj.URI.split(",")[1].split("=")[1].split(")")[0];
					var oFileReplaced = oFile.replace(/'/g, "");

					oClaimModel.read("/zc_claim_subletattachmentSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'SUBL' and FileName eq'" + oFileReplaced + "'"
						},
						success: $.proxy(function (subletData) {
							this.getView().getModel("DateModel").setProperty("/subletLine", true);
							this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
							var oAttachSet = subletData.results.map(function (item) {
								item.FileName = item.FileName.replace(SubletNum + "@@@", "");
								return item;

							});
							this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", oAttachSet);
						}, this),
						error: $.proxy(function () {
							MessageToast.show(oBundle.getText("Noattachmentsexists"), {
								my: "center center",
								at: "center center"
							});
							this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);
							this.getModel("LocalDataModel").setProperty("/IndicatorState", false);

						}, this)
					});
				} else {
					this.getView().getModel("DateModel").setProperty("/subletLine", true);
					MessageToast.show(oBundle.getText("Noattachmentsexists"), {
						my: "center center",
						at: "center center"
					});
					this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);
					this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
				}

			} else {
				MessageToast.show(oBundle.getText("Pleaseselect1row"), {
					my: "center center",
					at: "center center"
				});
				oTable.removeSelections("true");
			}
		},
		onPressDeleteSublet: function () {
			var oTable = this.getView().byId("idSubletTable");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oTableIndex = oTable._aSelectedPaths;
			var oPath = oTableIndex.toString();
			//var oSelectedRow = oTableIndex.toString();
			var obj = this.getView().getModel("LocalDataModel").getProperty(oPath);
			var oSelectedItem = obj.ItemKey;

			var oFile = this.getModel("LocalDataModel").getProperty(oPath).URI.split(",")[1].split("=")[1].split(")")[0];
			var oFileReplaced = oFile.replace(/'/g, "");

			var oFindIndexOfSelectedObj = this.obj.zc_item_subletSet.results.findIndex(function (elm) {
				return elm.SubletType === oSelectedItem;
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
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
								var oIndex = parseInt(oTable._aSelectedPaths.toString().split("/")[2]);
								this.obj.zc_item_subletSet.results.splice(oFindIndexOfSelectedObj, 1);
								var oClaimModel = this.getModel("ProssingModel");
								this.obj.DBOperation = "SAVE";

								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/zc_headSet", this.obj, {
									success: $.proxy(function (data, response) {
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
										var pricinghData = response.data.zc_claim_item_price_dataSet.results;
										var oFilteredData = pricinghData.filter(function (val) {
											return val.ItemType === "SUBL";
										});

										this.getView().getModel("HeadSetData").setProperty("/OFP", response.data.OFP);

										this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredData);

										MessageToast.show(oBundle.getText("ItemDeletedSuccessfully"), {
											my: "center center",
											at: "center center"
										});
										oTable.removeSelections("true");
										this._fnClaimSum();
										this._fnClaimSumPercent();
									}, this),
									error: $.proxy(function (err) {
										MessageToast.show(oBundle.getText("SystemInternalError"));
										this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
									}, this)
								});
								oClaimModel.refreshSecurityToken();

								oClaimModel.remove("/zc_claim_attachmentsSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + oFileReplaced +
									"')", {
										method: "DELETE",
										success: function () {
											MessageToast.show(oBundle.getText("Filedeletedsuccessfully"));
										}
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
		onPressCancelSublet: function () {

			this.getView().getModel("SubletDataModel").setProperty("/SubletCode", "");
			this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", "");
			this.getView().getModel("SubletDataModel").setProperty("/Amount", "");
			this.getView().getModel("SubletDataModel").setProperty("/description", "");
			this.getView().getModel("SubletDataModel").setProperty("/brand", "");
			this.getView().getModel("SubletDataModel").setProperty("/days", "");
			this.getView().getModel("SubletDataModel").setProperty("/unitOfMeasure", "");
		},

		onRevalidate: function () {
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.obj.Message = "";
			this.obj.DBOperation = "SAVE";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			// this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
			// $.ajaxSetup({
			// 	headers: {
			// 		'X-CSRF-Token': this._oToken
			// 	}
			// });
			this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
			oClaimModel.refreshSecurityToken();
			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
					MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"), {
						my: "center center",
						at: "center center"
					});
				}, this),
				error: $.proxy(function () {
					this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
					MessageToast.show(oBundle.getText("ClaimnotSaved"), {
						my: "center center",
						at: "center center"
					});
				}, this)

			});
		},

		onSaveDamage: function (oEvent) {
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.obj.Message = "";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
			var oClaimModel = this.getModel("ProssingModel");

			var itemObj = {
				"DmgAreaCode": this.getView().getModel("HeadSetData").getProperty("/DmgAreaCode"),
				"DmgTypeCode": this.getView().getModel("HeadSetData").getProperty("/DmgTypeCode"),
				"DmgSevrCode": this.getView().getModel("HeadSetData").getProperty("/DmgSevrCode")
			};
			this.obj.zc_claim_item_damageSet.results.push(itemObj);
			this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					// console.log(response);
					this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
					oClaimModel.read("/zc_claim_item_damageSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "
						},
						success: $.proxy(function (sdata) {
							this.getModel("LocalDataModel").setProperty("/DataItemDamageSet", sdata.results);
							this.getView().getModel("HeadSetData").setProperty("/DmgAreaCode", "");
							this.getView().getModel("HeadSetData").setProperty("/DmgTypeCode", "");
							this.getView().getModel("HeadSetData").setProperty("/DmgSevrCode", "");
							this.getView().getModel("DateModel").setProperty("/damageLine", false);
							this.getView().byId("idMainClaimMessage").setProperty("visible", false);
						}, this)
					});
				}, this),
				error: $.proxy(function (err) {
					MessageToast.show(oBundle.getText("SystemInternalError"));
					this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
					console.log(err);
				}, this)
			});

		},
		onAddDamageLine: function () {
			this.getView().getModel("DateModel").setProperty("/damageLine", true);
		},

		onUpdateDamageLine: function () {
			var oTable = this.getView().byId("idDamageDetailTable");
			var oTableIndex = oTable._aSelectedPaths;
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			if (oTableIndex.length == 1) {
				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
				//var oString = oTableIndex.toString();
				var oSelectedRow = oTableIndex.toString();
				var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
				var oDmgAreaCode = obj.DmgAreaCode;
				var oDmgTypeCode = obj.DmgTypeCode;
				var oDmgSevrCode = obj.DmgSevrCode;
				this.getView().getModel("HeadSetData").setProperty("/DmgAreaCode", oDmgAreaCode);
				this.getView().getModel("HeadSetData").setProperty("/DmgTypeCode", oDmgTypeCode);
				this.getView().getModel("HeadSetData").setProperty("/DmgSevrCode", oDmgSevrCode);

				this.getView().getModel("DateModel").setProperty("/subletLine", true);

				var oIndex = parseInt(oTable._aSelectedPaths.toString().split("/")[2]);
				this.obj.zc_claim_item_damageSet.results.splice(oIndex, 1);
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var oClaimModel = this.getModel("ProssingModel");

				var sSelectedLocale;
				//  get the locale to determine the language.
				var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
				if (isLocaleSent) {
					sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
				} else {
					sSelectedLocale = "en"; // default is english
				}

				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
						oClaimModel.read("/zc_claim_item_damageSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "
							},
							success: $.proxy(function (sdata) {
								this.getModel("LocalDataModel").setProperty("/DataItemDamageSet", sdata.results);;
							}, this)
						});
						//MessageToast.show("Claim has been deleted successfully");
					}, this),
					error: $.proxy(function (err) {
						MessageToast.show(oBundle.getText("SystemInternalError"));
						this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
					}, this)
				});
			}
		},
		onDeleteDamageLine: function () {
			var oTable = this.getView().byId("idDamageDetailTable");
			var oTableIndex = oTable._aSelectedPaths;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");

			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}

			if (oTableIndex.length == 1) {
				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
				var oIndex = parseInt(oTableIndex.toString().split("/")[2]);
				this.obj.zc_claim_item_damageSet.results.splice(oIndex, 1);

				var oClaimModel = this.getModel("ProssingModel");

				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
						oClaimModel.read("/zc_claim_item_damageSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and LanguageKey eq '" + sSelectedLocale.toLocaleLowerCase() +
									"' "
							},
							success: $.proxy(function (sdata) {
								this.getModel("LocalDataModel").setProperty("/DataItemDamageSet", sdata.results);

								MessageToast.show(oBundle.getText("DamageLineDeletedsuccessfully"), {
									my: "center center",
									at: "center center"
								});
							}, this)
						});
					}, this),
					error: $.proxy(function (err) {
						MessageToast.show(oBundle.getText("SystemInternalError"));
						this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
					}, this)
				});
			}
		},
		onSubmitTci: function (oEvent) {

			var sSelectedLocale;

			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}

			this.fnDisableLine();
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.obj.WarrantyClaimType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			this.obj.WarrantyClaimSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			this.obj.Partner = this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner");
			this.obj.ActionCode = "";
			this.obj.NameOfPersonRespWhoChangedObj = this.getModel("LocalDataModel").getProperty("/LoginId").substr(0, 12);
			this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			this.obj.PartnerRole = "AS";
			this.obj.ReferenceDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate"));
			this.obj.DateOfApplication = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication"));
			this.obj.FinalProcdDate = null;
			this.obj.RepairDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate"));
			this.obj.RepairOrderNumberExternal = this.getView().getModel("HeadSetData").getProperty("/RepairOrderNumberExternal");
			this.obj.ExternalNumberOfClaim = this.getView().getModel("HeadSetData").getProperty("/ExternalNumberOfClaim");
			this.obj.ExternalObjectNumber = this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber");
			this.obj.Odometer = this.getView().getModel("HeadSetData").getProperty("/Odometer");
			this.obj.DeliveryDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate"));
			this.obj.TCIWaybillNumber = "";
			this.obj.ShipmentReceivedDate = null;
			this.obj.DealerContact = this.getView().getModel("HeadSetData").getProperty("/DealerContact");
			this.obj.HeadText = this.getView().getModel("HeadSetData").getProperty("/HeadText");
			this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			this.obj.WTYClaimRecoverySource = "";
			this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
			this.obj.T1WarrantyCodes = this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes");
			this.obj.BatteryTestCode = this.getView().getModel("HeadSetData").getProperty("/BatteryTestCode");
			this.obj.T2WarrantyCodes = this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes");
			this.obj.FieldActionReference = this.getView().getModel("HeadSetData").getProperty("/FieldActionReference").toUpperCase();
			this.obj.ZCondition = this.getView().getModel("HeadSetData").getProperty("/ZCondition");
			this.obj.Cause = this.getView().getModel("HeadSetData").getProperty("/Cause");
			this.obj.Remedy = this.getView().getModel("HeadSetData").getProperty("/Remedy");
			this.obj.PreviousROInvoiceDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoiceDate"));
			this.obj.PreviousROOdometer = this.getView().getModel("HeadSetData").getProperty("/PreviousROOdometer");
			this.obj.PreviousROInvoice = this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoice");
			this.obj.AccessoryInstallOdometer = this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallOdometer");
			this.obj.AgreementNumber = this.getView().getModel("HeadSetData").getProperty("/AgreementNumber");
			this.obj.CustomerPostalCode = this.getView().getModel("HeadSetData").getProperty("/CustomerPostalCode");
			this.obj.CustomerFullName = this.getView().getModel("HeadSetData").getProperty("/CustomerFullName");
			this.obj.AccessoryInstallDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallDate"));
			this.obj.ProbillNum = this.getView().getModel("HeadSetData").getProperty("/ProbillNum");
			this.obj.Delivery = this.getView().getModel("HeadSetData").getProperty("/Delivery");
			this.obj.DeliveringCarrier = this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier");

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

			var oIndexLabour = this.obj.zc_claim_item_labourSet.results.findIndex($.proxy(function (item) {
				return item.LabourNumber == this.getView().getModel("HeadSetData").getProperty("/MainOpsCode")
			}), this);

			var oIndexPaint = this.obj.zc_claim_item_paintSet.results.findIndex($.proxy(function (item) {
				return item.PaintPositionCode == this.getView().getModel("HeadSetData").getProperty("/MainOpsCode")
			}), this);

			if (oIndexLabour > -1) {
				this.obj.zc_claim_item_labourSet.results[oIndexLabour].MainOpIndicator = "X";

			}

			if (oIndexPaint > -1) {
				this.obj.zc_claim_item_paintSet.results[oIndexPaint].MainOpIndicator = "X";

			}

			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var GroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			oEvent.getSource().getParent().getParent().addStyleClass("clMinHeight");

			var dialog = new Dialog({
				title: oBundle.getText("SubmitClaimTCI"),
				type: "Message",
				content: new Text({
					text: oBundle.getText("AresubmitClaimTCI?")
				}),

				buttons: [
					new Button({
						text: oBundle.getText("Yes"),
						press: $.proxy(function () {
							dialog.close();
							if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZACD" &&
								this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "") {
								this.getView().getModel("DateModel").setProperty("/claimTypeState2", "Error");
								MessageToast.show(
									oBundle.getText("submissionTypeMandatory"), {
										my: "center center",
										at: "center center"
									});

								this.getView().byId("idSubmissionClaim").setProperty("enabled", true);
							} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZAUT" &&
								this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "") {
								this.getView().getModel("DateModel").setProperty("/claimTypeState2", "Error");
								MessageToast.show(
									oBundle.getText("submissionTypeMandatory"), {
										my: "center center",
										at: "center center"
									});

								this.getView().byId("idSubmissionClaim").setProperty("enabled", true);
							} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZLDC" &&
								this.getModel("LocalDataModel").getProperty("/DataItemDamageSet").length <= 0) {
								this.getView().byId("idDamageArea").focus();
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseAddatleastoneDamageLine"));
								this.getView().byId("idMainClaimMessage").setType("Error");
							} else {
								this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
								this.getView().getModel("DateModel").setProperty("/claimTypeState2", "None");
								this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", true);
								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/zc_headSet", this.obj, {
									success: $.proxy(function (data, response) {
										var pricinghData = response.data.zc_claim_item_price_dataSet.results;

										this.getView().getModel("HeadSetData").setProperty("/ReferenceDate", response.data.ReferenceDate);
										this.getView().getModel("HeadSetData").setProperty("/DateOfApplication", response.data.DateOfApplication);

										var oFilteredData = pricinghData.filter(function (val) {
											return val.ItemType === "MAT";
										});
										console.log(oFilteredData);
										this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);

										this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
										oClaimModel.read("/zc_headSet", {
											urlParameters: {
												"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
													"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'",
												"$expand": "zc_claim_vsrSet,zc_claim_read_descriptionSet"
											},
											success: $.proxy(function (errorData) {
												this.getModel("LocalDataModel").setProperty("/oErrorSet", errorData.results[0].zc_claim_vsrSet.results);
												this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", errorData.results[0].zc_claim_read_descriptionSet
													.results[0].OFPDescription);
												this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", errorData.results[0].zc_claim_read_descriptionSet
													.results[0].MainOpsCodeDescription);

												// this.getView().getModel("HeadSetData").setProperty("/ReferenceDate", errorData.results[0].zc_claim_read_descriptionSet
												// 	.results[0].ReferenceDate);

												// this.getView().getModel("HeadSetData").setProperty("/DateOfApplication", errorData.results[0].zc_claim_read_descriptionSet
												// 	.results[0].DateOfApplication);

												this.getView().getModel("HeadSetData").setProperty("/RepairDate", errorData.results[0].zc_claim_read_descriptionSet
													.results[0].RepairDate);
												this.getView().getModel("HeadSetData").setProperty("/PreviousROInvoiceDate", errorData.results[0].zc_claim_read_descriptionSet
													.results[0].PreviousROInvoiceDate);
												this.getView().getModel("HeadSetData").setProperty("/DeliveryDate", errorData.results[0].zc_claim_read_descriptionSet
													.results[0].DeliveryDate);
												this.getView().getModel("HeadSetData").setProperty("/AccessoryInstallDate", errorData.results[0].zc_claim_read_descriptionSet
													.results[0].AccessoryInstallDate);
												this.getView().getModel("HeadSetData").setProperty("/HeadText", errorData.results[0].zc_claim_read_descriptionSet
													.results[0].HeadText);

												this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
												this.obj.zc_claim_vsrSet.results.pop(oObj);
											}, this)
										});

										oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
											urlParameters: {
												"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
													"'"
											},
											success: $.proxy(function (sdata) {

												if (oIndexLabour > -1) {
													this.getView().byId("idLabourTable").getItems()[oIndexLabour].getCells()[1].setProperty("selected", true);
												}

												if (oIndexPaint > -1) {
													this.getView().byId("idPaintTable").getItems()[oIndexPaint].getCells()[1].setProperty("selected", true);
												}

												this.getView().getModel("HeadSetData").setProperty("/DecisionCode", sdata.results[0].DecisionCode);

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

												if (sdata.results[0].DecisionCode == "ZTIC" || sdata.results[0].DecisionCode ==
													"ZTRC") {

													if (GroupType == "Authorization") {
														this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
														this.getModel("LocalDataModel").setProperty("/PercentState", true);
													} else {
														this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
														this.getModel("LocalDataModel").setProperty("/PercentState", false);
													}
													this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
													this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
													this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
													this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
													this.getView().getModel("DateModel").setProperty("/updateEnable", true);
													//this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
													this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
													this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);
													this.getView().getModel("DateModel").setProperty("/authAcClm", false);
													this.getView().getModel("DateModel").setProperty("/authRejClm", false);

													this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", true);
												} else if (sdata.results[0].DecisionCode == "ZTAC") {
													this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
													this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
													this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
													this.getView().getModel("DateModel").setProperty("/claimEditSt", true);
													this.getView().getModel("DateModel").setProperty("/updateEnable", false);
													this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
													this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
													this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
													this.getView().getModel("DateModel").setProperty("/authAcClm", false);
													this.getView().getModel("DateModel").setProperty("/authRejClm", false);

													this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
												} else if (sdata.results[0].DecisionCode == "ZTMR" && sap.ui.getCore().getModel(
														"UserDataModel").getProperty("/LoggedInUser") == "Dealer_Services_Manager") {
													this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
													this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
													this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
													this.getView().getModel("DateModel").setProperty("/claimEditSt", true);
													this.getView().getModel("DateModel").setProperty("/updateEnable", false);
													this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
													this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
													this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
													this.getView().getModel("DateModel").setProperty("/authAcClm", true);
													this.getView().getModel("DateModel").setProperty("/authRejClm", true);

													this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
												} else if (sdata.results[0].DecisionCode == "ZTAA") {
													this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
													this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
													this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
													this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
													this.getView().getModel("DateModel").setProperty("/updateEnable", false);
													this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
													this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
													this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
													this.getView().getModel("DateModel").setProperty("/authAcClm", false);
													this.getView().getModel("DateModel").setProperty("/authRejClm", false);

													this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
												} else {
													this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
													this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
													this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
													this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
													this.getView().getModel("DateModel").setProperty("/updateEnable", false);
													this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
													this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
													this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
													this.getView().getModel("DateModel").setProperty("/authAcClm", false);
													this.getView().getModel("DateModel").setProperty("/authRejClm", false);

													this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
												}

												if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSCR" &&
													sdata.results[0].DecisionCode != "ZTIC") {
													this.getView().getModel("DateModel").setProperty("/oSlipVisible", true);
												} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSCR" &&
													sdata.results[0].DecisionCode == "ZTIC") {
													this.getView().getModel("DateModel").setProperty("/oSlipVisible", false);
												} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSCR" &&
													sdata.results[0].DecisionCode == "ZTRC") {
													this.getView().getModel("DateModel").setProperty("/oSlipVisible", false);
												}

												this._fnClaimSum();
												this._fnClaimSumPercent();
												this._fnPricingData(oClaimNum);
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

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zclaimProcessing.view.MainClaimSection
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zclaimProcessing.view.MainClaimSection
		 */
		onAfterRendering: function () {
			var oDate = this.getView().byId("id_Date");
			console.log(oDate);
		},
		onPressPackingSlip: function () {

			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var isProxy = "";
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			var w = window.open(isProxy +
				"/node/ZDLR_CLAIM_SRV/zc_claim_printSet(NumberOfWarrantyClaim='" + oClaimNum + "',PrintType='CORE_PK')/$value",
				'_blank');
			if (w == null) {
				console.log("Error");
				//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
			}

		},

		onPressPrint: function () {
			var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var isProxy = "";
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			if (oClaimtype == "FAC" || oClaimtype == "ECP" || oClaimtype == "STR" || oClaimtype == "CRC" ||
				oClaimtype ==
				"WTY" ||
				oClaimtype == "ZCSR" || oClaimtype == "ZCLS" || oClaimtype == "ZCWE" || oClaimtype == "ZCER" ||
				oClaimtype == "ZECP" || oClaimtype == "ZSSE" || oClaimtype == "ZRCR" || oClaimtype == "ZWVE" ||
				oClaimtype == "ZWP1" || oClaimtype == "ZWP2" || oClaimtype == "ZWMS" || oClaimtype == "ZWAC" ||
				oClaimtype == "ZGGW" || oClaimtype == "ZWA1" || oClaimtype == "ZWA2") {

				var w = window.open(isProxy +
					"/node/ZDLR_CLAIM_SRV/zc_claim_printSet(NumberOfWarrantyClaim='" + oClaimNum + "',PrintType='WTY')/$value",
					'_blank');
				if (w == null) {
					console.log("Error");
					//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
				}
			} else if (oClaimtype == "SCR" || oClaimtype == "SSM" || oClaimtype == "VLC" ||
				oClaimtype == "ZSCR" || oClaimtype == "ZSSM" || oClaimtype == "ZLDC") {
				var w = window.open(isProxy +
					"/node/ZDLR_CLAIM_SRV/zc_claim_printSet(NumberOfWarrantyClaim='" + oClaimNum + "',PrintType='NON_WTY')/$value",
					'_blank');
				if (w == null) {
					console.log("Error");
					//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
				}
			}
		},
		onPressSuggestPart: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var isProxy = "";
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			var w = window.open(isProxy +
				"/node/ZDLR_CLAIM_SRV/zc_claim_printSet(NumberOfWarrantyClaim='" + oClaimNum + "',PrintType='CORE_PK')/$value",
				'_blank');
			if (w == null) {
				console.log("Error");
				//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
			}
		},
		onPressAbbr: function () {
			//var oCCR = new sap.ui.model.json.JSONModel();
			//oCCR.loadData(jQuery.sap.getModulePath("zclaimProcessing.utils", "/ccr.json"));

			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}

			var sPath = sap.ui.require.toUrl("zclaimProcessing/utils") + "/ccr.json";
			var sPathFR = sap.ui.require.toUrl("zclaimProcessing/utils") + "/ccrFR.json";

			if (sSelectedLocale == "en") {
				this.getView().setModel(new sap.ui.model.json.JSONModel(sPath), "ccrModel");
			} else {
				this.getView().setModel(new sap.ui.model.json.JSONModel(sPathFR), "ccrModel");
			}
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.CCRAbbr", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},
		onChangeT1: function (oEvent) {
			var oVal = oEvent.getSource().getSelectedKey();
			if (oVal.length > 0) {

				this.getView().byId("idT1Field").setValueState("None");
			}
		},
		onChangeT2: function (oEvent) {
			var oVal = oEvent.getSource().getSelectedKey();
			if (oVal.length > 0) {
				this.getView().byId("idT2Field").setValueState("None");
			}
		},

		fnDisableLine: function () {
			this.getView().getModel("DateModel").setProperty("/partLine", false);
			this.getView().getModel("PartDataModel").setProperty("/matnr", "");
			this.getView().getModel("PartDataModel").setProperty("/quant", "");
			this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
			this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "");
			this.getView().getModel("DateModel").setProperty("/labourLine", false);
			this.getView().getModel("LabourDataModel").setProperty("/LabourOp", "");
			this.getView().getModel("LabourDataModel").setProperty("/ClaimedHours", "");
			this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", "");
			this.getView().getModel("DateModel").setProperty("/paintLine", false);
			this.getView().getModel("PaintDataModel").setProperty("/PaintPositionCode", "");
			this.getView().getModel("DateModel").setProperty("/subletLine", false);
			this.getView().getModel("SubletDataModel").setProperty("/SubletCode", "");
			this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", "");
			this.getView().getModel("SubletDataModel").setProperty("/Amount", "");
			this.getView().getModel("SubletDataModel").setProperty("/description", "");
			this.getView().getModel("SubletDataModel").setProperty("/brand", "");
			this.getView().getModel("SubletDataModel").setProperty("/days", "");
		},
		onPressCIC: function () {
			var oCICUrl = this.getModel("LocalDataModel").getProperty("/oCICURL");
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			var sSelectedLocale;
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			window.open("" + oCICUrl + "?.lang=" + sSelectedLocale + "", '_blank');
		},
		onPressCVSH: function () {
			var oDivision;
			var isDivisionSent = window.location.search.match(/Division=([^&]*)/i);
			var oCVSHUrl = this.getModel("LocalDataModel").getProperty("/oCVSHURL");
			if (isDivisionSent) {
				this.sDivision = window.location.search.match(/Division=([^&]*)/i)[1];

				if (this.sDivision == "10") {
					oDivision = "toyota";
				} else if (this.sDivision == "20") {
					oDivision = "lexus";
				} else {
					oDivision = "toyota";
				}

			} else {
				oDivision = "toyota";
			}

			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			var sSelectedLocale;
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			window.open("" + oCVSHUrl + "?.lang=" + sSelectedLocale + "&franchise=" + oDivision + "", '_blank');
		},

		onSelectAuthPricingOpt: function (oEvent) {
			var oSelectedRadio = oEvent.getSource().getSelectedIndex();
			if (oSelectedRadio == 1) {
				this.getView().byId("idDiscountTable").setProperty("visible", true);
				this.getView().byId("idParticiaptionTable").setProperty("visible", false);
			} else {
				this.getView().byId("idParticiaptionTable").setProperty("visible", true);
				this.getView().byId("idDiscountTable").setProperty("visible", false);
			}
		}

	});

});