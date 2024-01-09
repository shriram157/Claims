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
			"sap/ui/core/format/DateFormat",
			"sap/ui/model/resource/ResourceModel",
			"zclaimProcessing/utils/WarrantyDataManager",
			"zclaimProcessing/utils/PmpDataManager"
		], function (Dialog, Label, MessageToast, Text, BaseController, base64, ValueState, Validator, Filter, Button, DateFormat, ResourceModel,
			WarrantyDataManager, PmpDataManager) {
			"use strict";
			var oBundle;
			return BaseController.extend("zclaimProcessing.controller.MainClaimSection", {
					onInit: function () {
						this.getDealer();

						this.getView().setModel(sap.ui.getCore().getModel("HeaderLinksModel"), "HeaderLinksModel");
						this.setModel(this.getModel("ProductMaster"), "ProductMasterModel");
						this.setModel(this.getModel("ZVehicleMasterModel"), "ZVehicleMasterModel");
						this.setModel(this.getModel("ProssingModel"));
						var oProssingModel = this.getModel("ProssingModel");
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

						sap.ui.getCore().attachValidationError(function (oEvent) {
							oEvent.getParameter("element").setValueState(ValueState.Error);
						});
						sap.ui.getCore().attachValidationSuccess(function (oEvent) {
							oEvent.getParameter("element").setValueState(ValueState.None);
						});

					},
					_fnAfterGetData: function (oGroupDescription, oClaimSelectedGroup, oClaim) {
						var clmNumAuth, clmAuthNum;
						if (oGroupDescription == "ZSSM") {
							this.getView().getModel("DateModel").setProperty("/oRepOrdReq", false);
							this.getView().getModel("DateModel").setProperty("/oRepOrdDateReq", false);
							this.getView().byId("idRepairOrder").setValueState("None");
						}
						if (oClaimSelectedGroup == "Authorization" || oGroupDescription == "ZGGW" || oGroupDescription == "ZWP1") {
							if (oClaimSelectedGroup == "Authorization") {
								clmNumAuth = "AuthorizationNumber";
								clmAuthNum = "AuthorizationNumber";
								this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIAuthNumber") + " : " + oClaim);
								this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveAuth"));
								this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoClaim"));
								this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", true);

								this.getModel("LocalDataModel").setProperty("/AuthGWVisible", false);
								this.getView().byId("idAuthorizationForm").setProperty("visible", true);
							} else if (oGroupDescription == "ZGGW") {
								clmNumAuth = "Numberofwarrantyclaim";
								clmAuthNum = "NumberOfWarrantyClaim";

								this.getModel("LocalDataModel").setProperty("/AuthGWVisible", true);
								this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber") + " : " + oClaim);
								this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveClaim"));
								this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoAuthorization"));
								this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);
								this.getView().byId("idAuthorizationForm").setProperty("visible", true);
								this.getView().byId("idPricingOptGW").setSelectedIndex(0);
							} else if (oGroupDescription == "ZWP1") {
								clmNumAuth = "Numberofwarrantyclaim";
								clmAuthNum = "NumberOfWarrantyClaim";
								this.getModel("LocalDataModel").setProperty("/AuthGWVisible", false);
								this.getModel("LocalDataModel").setProperty("/AuthP1Visible", true);
								this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber") + " : " + oClaim);
								this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveClaim"));
								this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoAuthorization"));
								this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);
								this.getView().byId("idAuthorizationForm").setProperty("visible", true);
								this.getView().byId("idPricingOptP1").setSelectedIndex(0);
							}

							this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
							this.getModel("LocalDataModel").setProperty("/reCalculate", true);
							this.getModel("LocalDataModel").setProperty("/PercentState", true);
							this.getModel("ProssingModel").read("/zc_authorization_detailsSet", {
								urlParameters: {
									"$filter": "ClaimNumber eq '" + oClaim + "'"
								},
								success: $.proxy(function (oAuthData) {
									if (oAuthData.results.length > 0) {
										this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
									}
								}, this)
							});

							this.getModel("ProssingModel").read("/zc_authorizationSet", {
								urlParameters: {
									"$filter": "DBOperation eq 'READ'and " + clmNumAuth + " eq '" + oClaim +
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
									// 			this._fncheckClaimWithZGGW(oPartPer, oLabourPer, oSubletPer);
									if (oClaimSelectedGroup == "Authorization") {
										this.getView().byId("idAuthorizationLinkForm").setProperty("visible", true);
										this.getView().byId("idClaimPrOpt").setProperty("visible", true);
										this.getView().byId("idAuthorizationForm").setProperty("visible", true);

										this.getModel("LocalDataModel").setProperty("/AuthGWVisible", false);
										if (oPartPer != "0" || oLabourPer != "0" || oSubletPer != "0") {
											this.getView().byId("idPricingOpt").setSelectedIndex(1);
											this.getView().byId("idParticiaptionTable").setProperty("visible", false);
											this.getView().byId("idDiscountTable").setProperty("visible", true);
										} else {
											this.getView().byId("idPricingOpt").setSelectedIndex(0);
											this.getView().byId("idParticiaptionTable").setProperty("visible", true);
											this.getView().byId("idDiscountTable").setProperty("visible", false);
										}
									} else if (oGroupDescription == "ZGGW") {
										this.getView().byId("idClaimPrOpt").setProperty("visible", false);
										this.getModel("LocalDataModel").setProperty("/AuthGWVisible", true);
										this.getView().byId("idPricingOptGW").setSelectedIndex(0);
										this.getView().byId("idParticiaptionTable").setProperty("visible", true);
										this.getView().byId("idDiscountTable").setProperty("visible", false);
										this.getView().byId("idAuthorizationLinkForm").setProperty("visible", false);
									} else if (oGroupDescription == "ZWP1") {
										this.getView().byId("idClaimPrOpt").setProperty("visible", false);
										this.getModel("LocalDataModel").setProperty("/AuthP1Visible", true);
										this.getView().byId("idPricingOptP1").setSelectedIndex(0);
										this.getView().byId("idParticiaptionTable").setProperty("visible", false);
										this.getView().byId("idDiscountTable").setProperty("visible", true);
										this.getView().byId("idAuthorizationLinkForm").setProperty("visible", false);
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

						} else if (oClaimSelectedGroup == "Claim" && oGroupDescription != "ZGGW" && oGroupDescription != "ZWP1") {
							this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
							this.getModel("LocalDataModel").setProperty("/reCalculate", false);
							this.getModel("LocalDataModel").setProperty("/PercentState", false);
							this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);
							this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoAuthorization"));
							this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveClaim"));
							this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber") + " : " + oClaim);
							this.getModel("LocalDataModel").setProperty("/AuthGWVisible", false);
							this.getView().byId("idClaimPrOpt").setProperty("visible", true);
							this.getView().byId("idAuthorizationLinkForm").setProperty("visible", true);
							this.getView().byId("idAuthorizationForm").setProperty("visible", true);
						}
					},

					_onRoutMatched: function (oEvent) {
						oBundle = this.getView().getModel("i18n").getResourceBundle();
						this.getView().byId("ObjectPageLayout")._scrollTo(0, 0);
						this.getModel("LocalDataModel").setProperty("/AuthGWVisible", false);
						this.getModel("LocalDataModel").setProperty("/AuthP1Visible", false);
						var HeadSetData = new sap.ui.model.json.JSONModel();
						HeadSetData.setDefaultBindingMode("TwoWay");
						this.getView().setModel(HeadSetData, "HeadSetData");
						this.getDealer();
						this.getModel("LocalDataModel").setProperty("/DataPercent", WarrantyDataManager.PercentData);
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
						this._fnClmGroupDescAll();
						this.getModel("LocalDataModel").setProperty("/oErrorSet", "");
						WarrantyDataManager.fnDateModel(this);
						this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", []);
						this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", "");
						this.getView().getModel("SubletDataModel").setProperty("/description", "");
						this.getView().getModel("SubletDataModel").setProperty("/Amount", "");
						//this.getView().getModel("DateModel").setProperty("/OdometerReq", true);
						var oValidator = new Validator();
						oValidator.validate("");
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
						var oProssingModel = this.getModel("ProssingModel");
						this.getView().byId("idMainClaimMessage").setProperty("visible", false);
						//oProssingModel.refresh();
						var oClaim = oEvent.getParameters().arguments.claimNum;

						var oClaimAuthType = oEvent.getParameters().arguments.oClaimGroup;
						var oGroupDescription = oEvent.getParameters().arguments.oKey;
						var oNavList = oEvent.getParameters().arguments.oClaimNav;
						var sClaimGroup = oEvent.getParameters().arguments.claimTypeGroup;
						this.getModel("LocalDataModel").setProperty("/clmTypeGroup", sClaimGroup);
						this.getModel("LocalDataModel").setProperty("/NavList", oNavList);
						this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancekm"));
						var oClaimNav = oEvent.getParameters().arguments.oClaimNav;
						this.getModel("LocalDataModel").setProperty("/GroupDescriptionName", oGroupDescription);
						this.getModel("LocalDataModel").setProperty("/oFieldAction", oEvent.getParameters().arguments.oKey);
						this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaim);
						this.getModel("LocalDataModel").setProperty("/WarrantyClaimTypeGroup", oClaimAuthType);
						var oClaimSelectedGroup = oEvent.getParameters().arguments.oClaimGroup;
						this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
						this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("MainSection"));
						this.getView().byId("idFilter02").setProperty("enabled", false);
						this.getView().byId("idFilter03").setProperty("enabled", false);
						this.getView().byId("idFilter04").setProperty("enabled", false);
						this.getView().byId("idFilter05").setProperty("enabled", false);
						this.getView().byId("idFilter06").setProperty("enabled", false);
						this.getView().byId("idFilter07").setProperty("enabled", false);
						this.getView().byId("idFilter08").setProperty("enabled", false);
						this.getModel("LocalDataModel").setProperty("/oClaimSelectedGroup", oClaimSelectedGroup);
						if (sClaimGroup == "VLC") {
							this.fn_damageCallforVLC();
							this.getView().getModel("DateModel").setProperty("/enableVLC", true);
							this.getView().getModel("DateModel").setProperty("/MainOpEnabled", false);
							if (sSelectedLocale == "fr") {
								this.getModel("LocalDataModel").setProperty("/DamageDiscSet", WarrantyDataManager.DamageDiscolsureData.frn)
							} else {
								this.getModel("LocalDataModel").setProperty("/DamageDiscSet", WarrantyDataManager.DamageDiscolsureData.eng)

							}
						}
						WarrantyDataManager._fnSrNumVisible(this, sClaimGroup, oClaimSelectedGroup);

						if (oClaim != "nun" && oClaim != undefined) {
							this.getModel("LocalDataModel").setProperty("/PrintEnable", true);
							this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);

							var clmNumAuth;
							var clmAuthNum;

							if ((sClaimGroup == "WTY" || sClaimGroup == "FAC") && this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup") !=
								"Authorization") {
								this.getView().getModel("DateModel").setProperty("/chngClaimTypeVisible", true);
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
									"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "'"
								},
								success: $.proxy(function (data) {

									var oGroupDescription = data.results[0].WarrantyClaimType;
									var submissionType = data.results[0].WarrantyClaimSubType;

									var oPartner = data.results[0].Partner;

									var oTextUser = sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser");

									this._fnAfterGetData(oGroupDescription, oClaimSelectedGroup, oClaim);

									WarrantyDataManager._fnSrNumVisible(this, data.results[0].ClaimGroup, this.getModel("LocalDataModel").getProperty(
										"/oClaimSelectedGroup"));

									if (data.results[0].WarrantyClaimType == "ZECP" || submissionType == "ZECP") {

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

											if (oGroupDescription == "ZWP1") {
												this.getView().byId("RB4-5").setProperty("editable", false);
												this.getView().byId("RB4-6").setProperty("enabled", true);
											} else if (oGroupDescription == "ZGGW") {
												this.getView().byId("RB4-4").setProperty("editable", false);
												this.getView().byId("RB4-3").setProperty("enabled", true);
											}

											oProssingModel.read("/zc_authorization_detailsSet", {
												urlParameters: {
													"$filter": "ClaimNumber eq '" + data.results[0].NumberOfWarrantyClaim + "'"
												},
												success: $.proxy(function (oAuthData) {
													if (oAuthData.results.length > 0) {
														this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
													}
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
													this._fncheckClaimWithZGGW(oPartPer, oLabourPer, oSubletPer);

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
										} else if (data.results[0].AuthorizationNumber == "") {
											if (oGroupDescription == "ZWP1" && this.getView().getModel("DataPercetCalculate").getProperty(
													"/PartPer") != "0" || this.getView().getModel("DataPercetCalculate").getProperty(
													"/LabourPer") != "0" || this.getView().getModel("DataPercetCalculate").getProperty(
													"/SubletPer") != "0") {
												this.getView().byId("RB4-5").setProperty("enabled", true);
												this.getView().byId("RB4-6").setProperty("editable", false);
											} else if (oGroupDescription == "ZGGW" &&
												this.getView().getModel("DataPercetCalculate").getProperty("/CustomerPer") != "0" ||
												this.getView().getModel("DataPercetCalculate").getProperty(
													"/DealerPer") != "0" ||
												this.getView().getModel("DataPercetCalculate").getProperty(
													"/TCIPer") != "0") {
												this.getView().byId("RB4-4").setProperty("enabled", true);
												this.getView().byId("RB4-3").setProperty("editable", false);
											}
										}
									}

									this._fnSubletDropdown(data.results[0].WarrantyClaimType, sSelectedLocale);

									// oProssingModel.read("/ZC_CLAIM_SUBLET_CODE", {
									// 	urlParameters: {
									// 		"$filter": "Clmty eq '" + data.results[0].WarrantyClaimType + "'and LanguageKey eq '" + sSelectedLocale.toUpperCase() +
									// 			"'"
									// 	},
									// 	success: $.proxy(function (subData) {
									// 		this.getModel("LocalDataModel").setProperty("/ClaimSubletCodeModel", subData.results);

									// 	}, this),
									// 	error: function (err) {
									// 		MessageToast.show(err);
									// 	}
									// });

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
												var oMonth = (regTime - repTime) / (1000 * 60 * 60 * 24 * 30.4167);
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

									if (data.results[0].WarrantyClaimType == "ZECP" || submissionType == "ZECP") {
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
										this.getView().getModel("DateModel").setProperty("/Authorization", true);
										this.getView().getModel("DateModel").setProperty("/Sublet", true);
										this.getView().getModel("DateModel").setProperty("/Labour", true);
										this.getView().getModel("DateModel").setProperty("/Parts", true);
										this.getView().getModel("DateModel").setProperty("/authHide", true);
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
									} else if (oGroupDescription == "ZWP2" || submissionType == "ZWP2" || oGroupDescription == "ZWA2" || submissionType ==
										"ZWA2") {
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
										this.getView().getModel("DateModel").setProperty("/DisableRadio", true);
										this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
										this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
										this.getView().getModel("DateModel").setProperty("/P1p2", true);
										this.getView().getModel("DateModel").setProperty("/AcA1", false);
										this.getView().getModel("DateModel").setProperty("/authHide", true);
										this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
									} else if (oGroupDescription == "ZWP1" || submissionType == "ZWP1") {
										this.getView().getModel("DateModel").setProperty("/oMainOps", true);
										this.getView().getModel("DateModel").setProperty("/oPrvOdomtrReq", true);
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
										this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", true);
										this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", true);
										this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", true);
										this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);

										this.getView().getModel("DateModel").setProperty("/authHide", true);
										this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);
									} else if (oGroupDescription == "ZWMS" || submissionType == "ZWMS") {
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
										this.getView().getModel("DateModel").setProperty("/DisableRadio", true);
										this.getView().getModel("DateModel").setProperty("/authHide", false);
									} else if (oGroupDescription == "ZWAC" || submissionType == "ZWAC" || oGroupDescription == "ZWA1" || submissionType ==
										"ZWA1") {
										this.getView().getModel("DateModel").setProperty("/oMainOps", true);
										this.getView().getModel("DateModel").setProperty("/Paint", false);
										this.getView().getModel("DateModel").setProperty("/Authorization", true);
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
										this.getView().getModel("DateModel").setProperty("/authHide", true);
									} else if (oGroupDescription == "ZWVE" || submissionType == "ZWVE") {
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
									} else if (oGroupDescription == "ZGGW" || submissionType == "ZGGW") {
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
									} else if (oGroupDescription == "ZCSR" || oGroupDescription == "ZCER" || oGroupDescription == "ZCLS") {
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
									} else if (oGroupDescription == "ZCWE") {
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
									} else if (oGroupDescription == "ZSSM") {
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
									} else if (oGroupDescription == "ZSCR") {
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

									} else if (oGroupDescription == "ZSSE") {
										this.getView().getModel("DateModel").setProperty("/oMainOps", true);
										this.getView().getModel("DateModel").setProperty("/Paint", false);
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
									} else if (oGroupDescription == "ZRCR") {
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
									} else if (oGroupDescription == "ZLDC") {
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

										this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
										this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", false);
										this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
									} else if (data.results[0].DecisionCode == "ZTAC" &&
										this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSSM" &&
										this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZLDC" &&
										this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSCR"
									) {
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
										this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
										this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
										if (
											sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "Dealer_Services_Manager" ||
											sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "Dealer_Services_Admin" ||
											sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "Dealer_Parts_Services_Admin" ||
											sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "TCI_Admin"
										) {
											this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
										}

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

									}

									if (data.results[0].DecisionCode == "ZTIC" && oClaimNav != "Inq" && sap.ui.getCore().getModel(
											"UserDataModel").getProperty("/LoggedInUser") != "Zone_User") {

										this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
										if (oClaimSelectedGroup == "Authorization") {
											this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
											this.getModel("LocalDataModel").setProperty("/PercentState", true);
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
											"UserDataModel").getProperty("/LoggedInUser") != "Zone_User") {
										//	sap.ui.getCore().getModel(	"UserDataModel").getProperty("/LoggedInUser") != "Zone_User" && sap.ui.getCore().getModel("UserDataModel").getProperty(
										//	"/LoggedInUser") != "TCI_Admin"
										this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
										if (oClaimSelectedGroup == "Authorization") {
											this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
											this.getModel("LocalDataModel").setProperty("/PercentState", true);
										}
										this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
										this.getModel("LocalDataModel").setProperty("/FeedEnabled", true);
										this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
										this.getModel("LocalDataModel").setProperty("/CancelEnable", true);

										this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", true);
										this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
										this.getView().getModel("DateModel").setProperty("/updateEnable", true);
										//this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
										this.getModel("LocalDataModel").setProperty("/UploadEnable", true);

										this.getView().getModel("DateModel").setProperty("/authAcClm", false);
										this.getView().getModel("DateModel").setProperty("/authRejClm", false);
									}

									//this.onP2Claim(oGroupDescription);
									this._fnOFPenabled();
									this._fnDealerContact();

									if (oGroupDescription == "ZSCR" && data.results[0].DecisionCode != "ZTIC") {
										this.getView().getModel("DateModel").setProperty("/oSlipVisible", true);
									} else if (oGroupDescription == "ZSCR" && data.results[0].DecisionCode == "ZTIC") {
										this.getView().getModel("DateModel").setProperty("/oSlipVisible", false);
									} else if (oGroupDescription == "ZSCR" && data.results[0].DecisionCode == "ZTRC") {
										this.getView().getModel("DateModel").setProperty("/oSlipVisible", false);
									}

									if (oGroupDescription == "ZSCR") {
										this.getView().getModel("DateModel").setProperty("/oTciQtyAppr", true);
									} else {
										this.getView().getModel("DateModel").setProperty("/oTciQtyAppr", false);
									}

									if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZACD" &&
										this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZAUT" &&
										this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWVE") {
										this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
									}

									if (oGroupDescription == "ZSSM") {
										this.getView().getModel("DateModel").setProperty("/oUpdatePartLine", false);
										this.getView().getModel("DateModel").setProperty("/oAddPartLine", false);

									} else {
										this.getView().getModel("DateModel").setProperty("/oUpdatePartLine", true);
										this.getView().getModel("DateModel").setProperty("/oAddPartLine", true);
									}

									this._fnGetClaimTypeDescENFR();
									this.getModel("LocalDataModel").setProperty("/ClaimDetails", data.results[0]);
									this.getView().getModel("HeadSetData").setData(data.results[0]);
									this.getView().getModel("HeadSetData").setProperty("/OFP", data.results[0].OFP.trim());
									var oBusinessModel = this.getModel("ApiBusinessModel");
									PmpDataManager._fnStatusCheck(this);
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
											this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
											this.getModel("LocalDataModel").setProperty("/oErrorSet", errorData.results[0].zc_claim_vsrSet.results);
											this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", errorData.results[0].zc_claim_read_descriptionSet
												.results[
													0].OFPDescription);
											this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", errorData.results[0].zc_claim_read_descriptionSet
												.results[0].MainOpsCodeDescription);
											this.getModel("LocalDataModel").setProperty("/claim_commentSet", errorData.results[0].zc_claim_commentSet.results);

											oProssingModel.read("/zc_claim_item_price_dataSet", {
												// oProssingModel.read("/zc_claim_item_labourSet", {
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
																	PartQty: item.PartQty,
																	Posnr: item.posnr
																};

															});

															var oIndexMat = PartItem.findIndex($.proxy(function (item) {
																return item.MaterialNumber == this.getView().getModel("HeadSetData").getProperty("/OFP")
															}), this);
															if (oIndexMat > -1) {
																if (this.getView().byId("idTableParts").getItems()[oIndexMat] != undefined) {
																	this.getView().byId("idTableParts").getItems()[oIndexMat].getCells()[1].setProperty("selected", true);
																}
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
																if (this.getView().byId("idLabourTable").getItems()[oIndexLab] != undefined) {
																	this.getView().byId("idLabourTable").getItems()[oIndexLab].getCells()[1].setProperty("selected", true);
																}
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
																"DateOfApplication": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty(
																	"/DateOfApplication")),
																"FinalProcdDate": null,
																"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
																"RepairOrderNumberExternal": this.getView().getModel("HeadSetData").getProperty(
																	"/RepairOrderNumberExternal"),
																"ExternalNumberOfClaim": this.getView().getModel("HeadSetData").getProperty("/ExternalNumberOfClaim"),
																"ExternalObjectNumber": this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber"),
																"Odometer": this.getView().getModel("HeadSetData").getProperty("/Odometer"),
																"Delivery": this.getView().getModel("HeadSetData").getProperty("/Delivery"),
																"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
																"TCIWaybillNumber": "",
																"ShipmentReceivedDate": null,
																"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
																"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
																"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
																"OFP": this.getView().getModel("HeadSetData").getProperty("/OFP").toUpperCase(),
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
																"AccessoryInstallOdometer": this.getView().getModel("HeadSetData").getProperty(
																	"/AccessoryInstallOdometer"),
																"AccessoryInstallDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty(
																	"/AccessoryInstallDate")),
																"AgreementNumber": this.getView().getModel("HeadSetData").getProperty("/AgreementNumber"),
																"CustomerPostalCode": this.getView().getModel("HeadSetData").getProperty("/CustomerPostalCode").toUpperCase(),
																"CustomerFullName": this.getView().getModel("HeadSetData").getProperty("/CustomerFullName"),
																"WarrantyClaimSubType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType"),
																"SerialNumber": this.getView().getModel("HeadSetData").getProperty("/SerialNumber"),
																"DamageDisclosure": this.getView().getModel("HeadSetData").getProperty("/DamageDisclosure"),
																"ProbillNum": this.getView().getModel("HeadSetData").getProperty("/ProbillNum"),
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
												error: function (err) {
													MessageToast.show(err);
												}
											});

										}, this),
										error: $.proxy(function (err) {
											MessageToast.show(err);
											this.getModel("LocalDataModel").setProperty("/oSavePerrartIndicator", false);
										}, this)
									});

								}, this),
								error: $.proxy(function (err) {
									MessageToast.show(err);
									this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
								}, this)
							});

							oProssingModel.read("/zc_claim_attachmentsSet", {
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
							if (oGroupDescription == "ZECP") {
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

							if (oGroupDescription == "ZRCR" || oGroupDescription == "ZLDC") {
								this.getView().getModel("DateModel").setProperty("/nonVinHide", false);
							} else {
								this.getView().getModel("DateModel").setProperty("/nonVinHide", true);
							}

						} else {

							if (oClaimSelectedGroup == "Authorization") {
								this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", true);
								this.getView().byId("idAuthorizationForm").setProperty("visible", true);
								this.getView().byId("idAuthorizationLinkForm").setProperty("visible", true);
								this.getView().byId("idClaimPrOpt").setProperty("visible", true);

								this.getModel("LocalDataModel").setProperty("/AuthGWVisible", false);
								this.getModel("LocalDataModel").setProperty("/PercentState", true);
								this.getModel("LocalDataModel").setProperty("/reCalculate", true);
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

							} else if (oClaimSelectedGroup == "Claim") {
								this.getView().byId("idAuthorizationForm").setProperty("visible", true);
								this.getView().byId("idClaimPrOpt").setProperty("visible", true);
								this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);

								this.getModel("LocalDataModel").setProperty("/AuthGWVisible", false);
								this.getModel("LocalDataModel").setProperty("/PercentState", false);
								this.getModel("LocalDataModel").setProperty("/reCalculate", false);
							}

							this.getModel("LocalDataModel").setProperty("/step01Next", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", "");
							this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", "");

							this.getModel("LocalDataModel").setProperty("/DataItemDamageSet", "");
							if (oClaimAuthType == "Authorization") {
								this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveAuth"));
								this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoClaim"));
								this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIAuthNumber"));
								//this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
								this.getModel("LocalDataModel").setProperty("/linkToAuth", false);

							} else {
								this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber"));
								//this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
								this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoAuthorization"));
								this.getModel("LocalDataModel").setProperty("/SaveAuthClaim", oBundle.getText("SaveClaim"));
								this.getModel("LocalDataModel").setProperty("/linkToAuth", true);

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
								"SerialNumber": "",
								"DamageDisclosure": "",
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
								"CustomerFullName": "",
								"ProbillNum": "",
							});
							this.HeadSetData.setDefaultBindingMode("TwoWay");
							this.getModel("LocalDataModel").setProperty("/ClaimDetails", "");
							this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
							WarrantyDataManager.fnReturnObj(this);
							this.getView().getModel("DateModel").setProperty("/claimTypeEn", true);
							if (sClaimGroup == "WTY") {
								oProssingModel.read("/zc_claim_groupSet", {
									urlParameters: {
										"$filter": "ClaimGroup eq 'WTY'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
									},
									success: $.proxy(function (data) {
										//var oResult = data.results;
										var oResult = data.results.filter(e => e.CreationApply == "X");

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

							if (sClaimGroup == "FAC") {
								this._fnValidClaimTYpeList(oGroupDescription);
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
							} else if (sClaimGroup == "STR") {
								this._fnValidClaimTYpeList(oGroupDescription);
								this.getView().getModel("DateModel").setProperty("/Paint", false);
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
							}

							if (sClaimGroup == "ECP") {
								this._fnValidClaimTYpeList(oGroupDescription);
								this.getView().getModel("DateModel").setProperty("/Paint", false);
								this.getView().getModel("DateModel").setProperty("/Sublet", true);
								this.getView().getModel("DateModel").setProperty("/Parts", true);
								this.getView().getModel("DateModel").setProperty("/Labour", true);
								this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
								this.getView().getModel("DateModel").setProperty("/Authorization", true);
								this.getView().getModel("DateModel").setProperty("/oECPfields", true);
								this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
								this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
								this.getView().getModel("DateModel").setProperty("/AcA1", false);
								this.getView().getModel("DateModel").setProperty("/P1p2", false);
								this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);
								this.getView().getModel("DateModel").setProperty("/authHide", true);

							}

							if (sClaimGroup == "SCR") {
								this._fnValidClaimTYpeList(oGroupDescription);
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
							if (sClaimGroup == "VLC") {
								this._fnValidClaimTYpeList(oGroupDescription);
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

							if (sClaimGroup == "CRC") {
								this._fnValidClaimTYpeList(oGroupDescription);
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
							this.getView().setModel(this.HeadSetData, "HeadSetData");
						}

					},

					_fnGetClaimTypeDescENFR: function (elm) {
						var clmDescENFR = this.getModel("LocalDataModel").getProperty("/ClaimGroupList");
						var that = this;
						var clmTypeDesc = clmDescENFR.filter(e => e.TMCClaimType == that.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"))[
							0];
						this.getModel("LocalDataModel").setProperty("/ALMClaimTypeDes", clmTypeDesc.ALMClaimTypeDes);
					},

					_fnValidClaimTYpeList: function (oClaimGroup) {
						var oClaimModel = this.getModel("ProssingModel");
						//var oClaimGroup = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
						oClaimModel.read("/zc_claim_groupSet", {
							urlParameters: {
								"$filter": "ClaimGroup eq '" + oClaimGroup + "'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
							},
							success: $.proxy(function (data) {
								this.oFilteredData = data.results.filter(e => e.CreationApply == "X");
								this.getModel("LocalDataModel").setProperty("/ClaimGroupSet", this.oFilteredData);
								if (this.oFilteredData.length == 1) {
									this.getView().getModel("HeadSetData").setProperty("/WarrantyClaimType", this.oFilteredData[0].WarrantyClaimType);
								}
							}, this),
							error: function (err) {
								MessageToast.show(err);
							}
						});

					},

					_fnClmGroupDescAll: function (oClaimGroup) {
						var oClaimModel = this.getModel("ProssingModel");
						//var oClaimGroup = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
						oClaimModel.read("/zc_claim_groupSet", {
							urlParameters: {
								"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
							},
							success: $.proxy(function (data) {
								this.getModel("LocalDataModel").setProperty("/ClaimGroupList", data.results);
							}, this),
							error: function (err) {
								MessageToast.show(err);
							}
						});

					},

					_fncheckClaimWithZGGW: function (oPartPer, oLabourPer, oSubletPer) {
						var Authorization
						var oGroupDescription = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
						var oClaimSelectedGroup = this.getModel("LocalDataModel").getProperty("/oClaimSelectedGroup");

						if (oClaimSelectedGroup == "Claim" && oGroupDescription != "ZGGW" && oGroupDescription != "ZWP1") {
							this.getView().byId("idAuthorizationForm").setProperty("visible", true);
							this.getView().byId("idClaimPrOpt").setProperty("visible", true);
							if (oPartPer != "0" || oLabourPer != "0" || oSubletPer != "0") {
								this.getView().byId("idPricingOpt").setSelectedIndex(1);
								this.getView().byId("idParticiaptionTable").setProperty("visible", false);
								this.getView().byId("idDiscountTable").setProperty("visible", true);
							} else {
								this.getView().byId("idPricingOpt").setSelectedIndex(0);
								this.getView().byId("idParticiaptionTable").setProperty("visible", true);
								this.getView().byId("idDiscountTable").setProperty("visible", false);
							}
						} else if (oGroupDescription == "ZGGW" && oClaimSelectedGroup == "Claim") {

							this.getView().byId("idAuthorizationForm").setProperty("visible", false);
							this.getView().byId("idClaimPrOpt").setProperty("visible", false);
							this.getView().byId("idPricingOptGW").setSelectedIndex(0);
							this.getView().byId("idParticiaptionTable").setProperty("visible", true);
							this.getView().byId("idDiscountTable").setProperty("visible", false);
						} else if (oGroupDescription == "ZWP1" && oClaimSelectedGroup == "Claim") {

							this.getView().byId("idAuthorizationForm").setProperty("visible", false);
							this.getView().byId("idClaimPrOpt").setProperty("visible", false);
							this.getView().byId("idPricingOptP1").setSelectedIndex(0);
							this.getView().byId("idParticiaptionTable").setProperty("visible", false);
							this.getView().byId("idDiscountTable").setProperty("visible", true);
						}
					},

					_fnOFPenabled: function () {
						if (
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
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
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

						if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSSM") {
							this.getView().getModel("DateModel").setProperty("/ofpEnabled", false);
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
						var bvalidate = oEvent.getParameters().valid;
						var oBundle = this.getView().getModel("i18n").getResourceBundle();
						this._fnValidateDatePicker(oEvent);
						if (bvalidate) {
							if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZECP" ||
								this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZECP") {
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
						}
						//console.log(oEvent.getSource().getDateValue());
					},

					onPrevDateChange: function (oEvent) {

						var oBundle = this.getView().getModel("i18n").getResourceBundle();
						this._fnValidateDatePicker(oEvent);

						if (oEvent.getSource().getDateValue() <= new Date()) {
							this.getView().byId("idMainClaimMessage").setProperty("visible", false);
							this.getView().byId("idMainClaimMessage").setType("None");
						} else {
							this.getView().byId("idMainClaimMessage").setProperty("visible", true);
							this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FutureDateNotallowed"));
							this.getView().byId("idMainClaimMessage").setType("Error");
						}
					},

					onDateEnter: function (oEvent) {
						this._fnValidateDatePicker(oEvent);
					},

					_fnValidateDatePicker: function (oEvent) {
						var oBundle = this.getView().getModel("i18n").getResourceBundle();
						var bvalidate = oEvent.getParameters().valid;
						if (!bvalidate) {
							oEvent.getSource().setValue(null);
							MessageToast.show(
								oBundle.getText("InvalidDate"), {
									my: "center center",
									at: "center center"
								});

						}
					},

					onAddComment: function (oEvent) {
						var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.ClaimComments", this);
						this.getView().addDependent(oDialogBox);
						oDialogBox.open();
					},
					handleDealerLabourInq: function (oEvent) {

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
					// onEnterCommentText: function (oEvent) {
					// 	var oText = oEvent.getParameters().value;
					// 	if (oText.length >= 2) {
					// 		this.getModel("LocalDataModel").setProperty("/enableEnterComment", true);
					// 	} else {
					// 		this.getModel("LocalDataModel").setProperty("/enableEnterComment", false);
					// 	}
					// },

					onPost: function (oEvent) {

						var oBusinessModel = this.getModel("ApiBusinessModel");
						this.getModel("LocalDataModel").setProperty("/commentIndicator", true);

						var oPartner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");

						var oClaimModel = this.getModel("ProssingModel");
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
							"HeadText": this.getModel("LocalDataModel").getProperty("/BPOrgName") + "(" + oDate + ")" + ":" + sValue,
							"NumberOfWarrantyClaim": this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum"),
							"LanguageKey": sSelectedLocale.toUpperCase(),
							"User": "",
							"Date": null
						};
						this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");

						this.obj.zc_claim_commentSet.results.push(oEntry);
						this.obj.DBOperation = "SAVE";

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

					// onEnterComment: function () {
					// 	this.getModel("LocalDataModel").setProperty("/enableEnterComment", false);
					// 	var oPrevComment = this.getView().getModel("HeadSetData").getProperty("/HeadText");
					// 	var oPartner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
					// 	var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					// 		pattern: "yyyy-MM-dd HH:mm:ss"
					// 	});
					// 	var oDate = oDateFormat.format(new Date());
					// 	var oText = this.getView().getModel("HeadSetData").getProperty("/NewText");

					// 	var oBusinessModel = this.getModel("ApiBusinessModel");
					// 	oBusinessModel.read("/A_BusinessPartner", {
					// 		urlParameters: {
					// 			"$filter": "BusinessPartner eq '" + oPartner + "'"
					// 		},
					// 		success: $.proxy(function (data) {
					// 			var oPartnerName = data.results[0].OrganizationBPName1;
					// 			//var oFinalText = `${oPrevComment} \n  ${oPartnerName} ( ${oDate} ) ${oText}`;
					// 			var oFinalText = oPrevComment + "\r\n" + "/" +
					// 				oPartnerName + "(" + oDate + ") " + " : " + oText;
					// 			this.getView().getModel("HeadSetData").setProperty("/HeadText", oFinalText);
					// 			this.getView().getModel("HeadSetData").setProperty("/NewText", "");
					// 			// console.log(oFinalText);
					// 		}, this)
					// 	});
					// },
					// onCloseComment: function (oEvent) {
					// 	oEvent.getSource().getParent().getParent().getParent().getParent().getParent().close();
					// },

					onSelectClaimTpe: function (oEvent) {
						this.getView().getModel("DateModel").setProperty("/claimTypeState2", "None");

						var oKey = oEvent.getSource().getSelectedKey();
						this._fnChangeClaimTYpe_sub(oKey);
					},

					_fnChangeClaimTYpe_sub: function (oKey) {
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
							this.getView().getModel("DateModel").setProperty("/oPrvOdomtrReq", false);
						} else if (oKey == "ZWAC" || oKey == "ZWA1") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Authorization", true);
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
							this.getView().getModel("DateModel").setProperty("/authHide", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrvOdomtrReq", false);
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
							this.getView().getModel("DateModel").setProperty("/oPrvOdomtrReq", false);

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
							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", true);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", true);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", true);
							this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
							this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
							this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
							this.getView().getModel("DateModel").setProperty("/authHide", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);
							this.getView().getModel("DateModel").setProperty("/oPrvOdomtrReq", true);
						} else if (oKey == "ZWP2" || oKey == "ZWA2") {
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
							this.getView().getModel("DateModel").setProperty("/oPrvOdomtrReq", false);
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
							this.getView().getModel("DateModel").setProperty("/oPrvOdomtrReq", false);

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
							this.getView().getModel("DateModel").setProperty("/oPrvOdomtrReq", false);
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
							// this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
							//this.getView().getModel("DateModel").setProperty("/ofpRequired", true);
							this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", false);
							this.getView().getModel("DateModel").setProperty("/authHide", true);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", false);
							this.getView().getModel("DateModel").setProperty("/oPrvOdomtrReq", false);
						} else if (oKey == "ZSCR") {
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", false);
						} else {
							this.getView().getModel("DateModel").setProperty("/authHide", false);
						}
						this.onP2Claim(oKey);
						if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZACD" &&
							this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZAUT" &&
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
							this.getView().getModel("DateModel").setProperty("/authHide", true);
							this.getView().getModel("DateModel").setProperty("/oECPfields", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", true);

							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
							this.getView().getModel("DateModel").setProperty("/P1p2", false);
							this.getView().getModel("DateModel").setProperty("/oMainOpsReq", true);

						} else {
							this.getModel("LocalDataModel").setProperty("/DealerPriceText", oBundle.getText("DealerNetPrice"));
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
						}
						this._fnClaimAuthvisible(oKey);
						this._fnOFPenabled();
					},

					_fnClaimAuthvisible: function (key) {
						var claimType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
						if (claimType == "Claim" && key != "ZGGW" && key != "ZWP1") {
							this.getView().byId("idAuthorizationForm").setProperty("visible", true);
							this.getView().byId("idClaimPrOpt").setProperty("visible", true);
							this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);
							this.getModel("LocalDataModel").setProperty("/AuthGWVisible", false);
							this.getView().byId("idAuthorizationLinkForm").setProperty("visible", true);
							this.getView().byId("idParticiaptionTable").setProperty("visible", true);
							this.getModel("LocalDataModel").setProperty("/PercentState", false);
							this.getModel("LocalDataModel").setProperty("/reCalculate", false);

							// 	this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
							// 	this.getModel("LocalDataModel").setProperty("/reCalculate", false);
						} else if (claimType == "Claim" && key == "ZGGW") {
							this.getView().byId("idClaimPrOpt").setProperty("visible", false);
							this.getModel("LocalDataModel").setProperty("/AuthGWVisible", true);
							this.getModel("LocalDataModel").setProperty("/AuthP1Visible", false);
							this.getView().byId("idPricingOptGW").setSelectedIndex(0);
							this.getModel("LocalDataModel").setProperty("/reCalculate", true);
							this.getModel("LocalDataModel").setProperty("/PercentState", true);
							this.getView().byId("idParticiaptionTable").setProperty("visible", true);
							this.getView().byId("idDiscountTable").setProperty("visible", false);
							this.getView().byId("idAuthorizationLinkForm").setProperty("visible", false);
						} else if (claimType == "Claim" && key == "ZWP1") {
							this.getView().byId("idClaimPrOpt").setProperty("visible", false);
							this.getModel("LocalDataModel").setProperty("/AuthGWVisible", false);
							this.getModel("LocalDataModel").setProperty("/AuthP1Visible", true);
							this.getView().byId("idPricingOptP1").setSelectedIndex(0);
							this.getModel("LocalDataModel").setProperty("/reCalculate", true);
							this.getModel("LocalDataModel").setProperty("/PercentState", true);
							this.getView().byId("idParticiaptionTable").setProperty("visible", false);
							this.getView().byId("idDiscountTable").setProperty("visible", true);
							this.getView().byId("idAuthorizationLinkForm").setProperty("visible", false);
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
						if (elm == "ZLDC" || elm == "ZRCR") {
							this.getView().getModel("DateModel").setProperty("/nonVinHide", false);
						} else {
							this.getView().getModel("DateModel").setProperty("/nonVinHide", true);
						}
						if (elm == "ZWMS") {
							this.getView().getModel("DateModel").setProperty("/DisableRadio", true);
							this.getView().getModel("DateModel").setProperty("/OdometerReq", true);
							this.getView().getModel("DateModel").setProperty("/OdometerReqMan", true);
							//this.getView().byId("idRequestType").setSelectedIndex(1);

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
						var oLabourOp = oEvent.getParameters().value.toUpperCase();
						this.getModel("LocalDataModel").setProperty("/opNumberLabour", oLabourOp);
						if (oLabourOp[0] != "P") {
							this.getView().getModel("LabourDataModel").setProperty("/LabourOp", oLabourOp);
						} else {
							this.getView().getModel("LabourDataModel").setProperty("/LabourOp", "");
						}

					},
					onEnterVIN: function (oEvent) {
						this.getView().byId("idECPAGR").removeSelections();
						this.getView().getModel("HeadSetData").setProperty("/AgreementNumber", "");
						var oVin = oEvent.getParameters().value;
						this.getView().getModel("HeadSetData").setProperty("/ExternalObjectNumber", oVin.toUpperCase());
						this.getModel("LocalDataModel").setProperty("/selectedVehicle", oVin);
						var oProssingModel = this.getModel("ProssingModel");
						var oRepDate;
						//var oECPModel = this.getOwnerComponent().getModel("EcpSalesModel");

						if (oVin != "") {

							if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZECP" ||
								this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZECP") {
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
													var todayTime = new Date().getTime();
													var oMonth = (todayTime - regTime) / (1000 * 60 * 60 * 24 * 30.4167);

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

						var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
						var isProxy = "";
						var oHref = window.location.href.substr(0, 8);
						var oInput = window.location.href.substr(8, 4);

						if (window.document.domain == "localhost") {
							isProxy = "proxy";
						}

						var w = window.open(this.getModel("LocalDataModel").getProperty("/oECPURL") + "?Division=" + sDivision + "&Language=" +
							sSelectedLocale +
							"#/AgreementInquiry/" + oECPAgr + "/" + this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber") + "",
							'_blank');
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

					_fnSubletDropdown: function (clmType, sSelectedLocale) {
						var oClaimModel = this.getModel("ProssingModel");
						oClaimModel.read("/ZC_CLAIM_SUBLET_CODE", {
							urlParameters: {
								"$filter": "Clmty eq '" + clmType + "'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
							},
							success: $.proxy(function (subData) {
								this.getModel("LocalDataModel").setProperty("/ClaimSubletCodeModel", subData.results);

							}, this),
							error: function (err) {
								MessageToast.show(err);
							}
						});
					},

					_fnSaveClaim: function () {
						//Changes by Devika for Demand DMND0004200 on 09-01-2024
						// var ofpValue = this.getView().byId("idOFP").getValue();
						// if (ofpValue && ofpValue.toUpperCase() != "DIAGNOSTIC" && ofpValue.toUpperCase().startsWith("DIA") {
						// 		MessageBox.warning("Enter Correct OFP Value");//oBundle.getText("Error.EnterCorrectOFPValue"));
						// 		//return;
						// 	}
						//End for demand DMND0004200	

							var oValidator = new Validator();
							//var oValid = oValidator.validate(this.getView().byId("idClaimMainForm"));
							// var oValid01 = oValidator.validate(this.getView().byId("idVehicleInfo"));
							var oValid02 = oValidator.validate(this.getView().byId("idpart01Form")); oValidator.validate(!(this.getView().byId("id_Date")));
							var oClaimModel = this.getModel("ProssingModel");
							var oCurrentDt = new Date();
							var clmGrp = this.getModel("LocalDataModel").getProperty("/clmTypeGroup");
							var oClmType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
							var oClmSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
							var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
							var that = this;
							var oView = this.getView();
							var bValidationError; jQuery.each(WarrantyDataManager._modelValidate(that), function (i, oInput) {
								if (oInput.getVisible() == true) {
									bValidationError = that._validateInput(oInput) || bValidationError;
								}
							});

							if (bValidationError) {
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
								this.getView().byId("idMainClaimMessage").setType("Error");
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
							} else if (clmGrp == "ECP" && this.getView().getModel("HeadSetData").getProperty("/AgreementNumber") == "") {
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
							} else if (this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoiceDate") > this.getView().getModel("HeadSetData").getProperty(
									"/RepairDate")) {
								this.getView().byId("idPrInvDate").setValueState("Error");
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("ROInvoiceDateGreaterThanRPDate"));
								this.getView().byId("idMainClaimMessage").setType("Error");

							} else if (this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallDate") > this.getView().getModel("HeadSetData").getProperty(
									"/RepairDate")) {
								this.getView().byId("idAccDate").setValueState("Error");
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("InstallDateGreaterThanRPDate"));
								this.getView().byId("idMainClaimMessage").setType("Error");

							} else if (this.getView().getModel("HeadSetData").getProperty("/RepairDate") > new Date()) {
								this.getView().byId("id_Date").setValueState("Error");
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
								this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FutureDateNotallowed"));
								this.getView().byId("idMainClaimMessage").setType("Error");

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
									"NameOfPersonRespWhoChangedObj": this.getModel("LocalDataModel").getProperty("/LoginId"),
									"ShipmentReceivedDate": null,
									"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
									"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
									"OFP": this.getView().getModel("HeadSetData").getProperty("/OFP").toUpperCase().trim(),
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
									"CustomerPostalCode": this.getView().getModel("HeadSetData").getProperty("/CustomerPostalCode").toUpperCase(),
									"CustomerFullName": this.getView().getModel("HeadSetData").getProperty("/CustomerFullName"),
									"ProbillNum": this.getView().getModel("HeadSetData").getProperty("/ProbillNum"),
									"Delivery": this.getView().getModel("HeadSetData").getProperty("/Delivery"),
									"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
									"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
									"WarrantyClaimSubType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType"),
									"SerialNumber": this.getView().getModel("HeadSetData").getProperty("/SerialNumber"),
									"DamageDisclosure": this.getView().getModel("HeadSetData").getProperty("/DamageDisclosure"),
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
												// console.log(sdata);
												this.getView().getModel("HeadSetData").setData(sdata.results[0]);
												this.getModel("LocalDataModel").setProperty("/ClaimDetails", sdata.results[0]);

												this._fnGetClaimTypeDescENFR();
												PmpDataManager._fnStatusCheck(this);

												var oPartner = this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner");
												var oGroupDescription = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");

												if ((clmGrp == "WTY" || clmGrp == "FAC") && this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup") !=
													"Authorization") {
													this.getView().getModel("DateModel").setProperty("/chngClaimTypeVisible", true);
												}

												if (oGroupDescription != "ZRCR" && oGroupDescription != "ZSCR" && oGroupDescription != "ZSSE" && oGroupDescription !=
													"ZSSM" &&
													oGroupDescription != "ZWMS" && this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup") !=
													"Authorization") {
													this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
													this.getView().getModel("DateModel").setProperty("/authHide", true);
												} else {
													this.getView().getModel("DateModel").setProperty("/authHide", false);
												}

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

												if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZECP" ||
													this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZECP") {
													this.getModel("LocalDataModel").setProperty("/oCurrentDealerLabour", this.getModel("LocalDataModel").getProperty(
														"/oDealerLabour/ECPNewLabourRate"));
													this.getModel("LocalDataModel").setProperty("/DealerPriceText", oBundle.getText("MSRP"));
												} else {
													this.getModel("LocalDataModel").setProperty("/oCurrentDealerLabour", this.getModel("LocalDataModel").getProperty(
														"/oDealerLabour/WTYNewLabourRate"));
													this.getModel("LocalDataModel").setProperty("/DealerPriceText", oBundle.getText("DealerNetPrice"));
												}

												var oCLaim = this.getModel("LocalDataModel").getProperty("/ClaimDetails/NumberOfWarrantyClaim");
												this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", oCLaim);
												var clmAuthNum;
												if (oGroupType == "Authorization") {

													if (oGroupType == "Authorization") {
														clmAuthNum = "AuthorizationNumber";
														this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIAuthNumber") + " : " +
															oCLaim);

													}

													this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
													this.getModel("LocalDataModel").setProperty("/reCalculate", true);

													oClaimModel.read("/zc_authorization_detailsSet", {
														urlParameters: {
															"$filter": "AuthorizationNumber eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "'"
														},
														success: $.proxy(function (oAuthData) {
															if (oAuthData.results.length > 0) {
																this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
															}
														}, this)
													});
												} else if (oGroupType == "Claim") {
													this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber") + " : " +
														oCLaim);

												}

												this._fnSubletDropdown(sdata.results[0].WarrantyClaimType, sSelectedLocale);

												// oClaimModel.read("/ZC_CLAIM_SUBLET_CODE", {
												// 	urlParameters: {
												// 		"$filter": "Clmty eq '" + sdata.results[0].WarrantyClaimType + "'and LanguageKey eq '" + sSelectedLocale.toUpperCase() +
												// 			"'"
												// 	},
												// 	success: $.proxy(function (subData) {
												// 		this.getModel("LocalDataModel").setProperty("/ClaimSubletCodeModel", subData.results);

												// 	}, this),
												// 	error: function (err) {
												// 		MessageToast.show(err);
												// 	}
												// });

											}, this),
											error: function (err) {
												MessageToast.show(err);
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

										// if (oGroupType == "Authorization") {
										// 	oClaimModel.read("/zc_authorization_detailsSet", {
										// 		urlParameters: {
										// 			"$filter": "ClaimNumber eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "'"
										// 		},
										// 		success: $.proxy(function (oAuthData) {
										// 			if (oAuthData.results.length > 0) {
										// 				this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
										// 			}
										// 		}, this)
										// 	});
										// }
										this.getModel("LocalDataModel").setProperty("/CancelEnable", true);

									}, this),
									error: $.proxy(function (err) {
										MessageToast.show(oBundle.getText("SystemInternalError"));
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
									}, this)
								});

							}
						},
						onSaveClaim: function (oEvent) {
								this._fnSaveClaim();
							},
							// 		onValidateContact: function (oEvent) {
							// 			console.log(oEvent);
							// 		},
							onCancelClaim: function () {
								this.getModel("LocalDataModel").setProperty("/PrintEnable", true);

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

																this._fnGetClaimTypeDescENFR();
																this.getView().getModel("HeadSetData").setProperty("/DecisionCode", sdata.results[0].DecisionCode);
																PmpDataManager._fnStatusCheck(this);
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

								this.getModel("LocalDataModel").setProperty("/PrintEnable", true);

								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oClaimModel = this.getModel("ProssingModel");
								var obj = {
									NumberOfWarrantyClaim: oClaimNum,
									DBOperation: "ZADR"

								};
								this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
								oClaimModel.update("/zc_headSet('" + oClaimNum + "')", obj, {
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

								this.getModel("LocalDataModel").setProperty("/PrintEnable", true);

								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oClaimModel = this.getModel("ProssingModel");

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
												oClaimModel.update("/zc_headSet('" + oClaimNum + "')", obj, {
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
																PmpDataManager._fnStatusCheck(this);
																this._fnGetClaimTypeDescENFR();
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

								var bValidationError;
								this.getModel("LocalDataModel").setProperty("/PrintEnable", true);
								var oId;
								if (typeof (oEvent) == "object") {
									oId = oEvent.getSource() != null ? oEvent.getSource().getText() : "";
								} else if (typeof (oEvent) == "string") {
									oId = oEvent;
								}

								this.getModel("LocalDataModel").setProperty("/oIDBtn", oId);

								var oClaimModel = this.getModel("ProssingModel");
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");

								var oValidator = new Validator();
								var oValid = oValidator.validate(this.getView().byId("idClaimMainForm"));
								var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
								// var oValid01 = oValidator.validate(this.getView().byId("idVehicleInfo"));
								var oValid02 = oValidator.validate(this.getView().byId("idpart01Form"));

								// 	var oCurrentDt = new Date();
								var oClaimtype = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
								var oClmType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
								var oClmSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
								//var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
								var that = this;

								jQuery.each(WarrantyDataManager._modelValidate(that), function (i, oInput) {
									if (oInput.getVisible() == true && oInput.mProperties.enabled == true) {
										bValidationError = that._validateInput(oInput) || bValidationError;
									} else {
										oInput.setValueState("None");
									}
								});

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
														PartQty: item.QtyHrs,
														Posnr: item.posnr
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
													"NameOfPersonRespWhoChangedObj": this.getModel("LocalDataModel").getProperty("/LoginId"),
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
													"OFP": this.getView().byId("idOFP").getValue().toUpperCase(),
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
													"CustomerPostalCode": this.getView().getModel("HeadSetData").getProperty("/CustomerPostalCode").toUpperCase(),
													"CustomerFullName": this.getView().getModel("HeadSetData").getProperty("/CustomerFullName"),
													"ProbillNum": this.getView().getModel("HeadSetData").getProperty("/ProbillNum"),
													"Delivery": this.getView().getModel("HeadSetData").getProperty("/Delivery"),
													"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
													"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
													"WarrantyClaimSubType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType"),
													"SerialNumber": this.getView().getModel("HeadSetData").getProperty("/SerialNumber"),
													"DamageDisclosure": this.getView().getModel("HeadSetData").getProperty("/DamageDisclosure"),
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

												if (bValidationError && oId != "changeclaimtype") {
													this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
													this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
													this.getView().byId("idMainClaimMessage").setType("Error");
													this.getView().byId("idMainClaimMessage").setProperty("visible", true);
												} else if (oClaimtype == "ZECP" && this.getView().getModel("HeadSetData").getProperty("/AgreementNumber") == "" &&
													oId !=
													"changeclaimtype") {
													this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
													this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseSelectAgreement"));
													this.getView().byId("idMainClaimMessage").setType("Error");
													this.getView().byId("idMainClaimMessage").setProperty("visible", true);
												} else if (this.getModel("LocalDataModel").getProperty("/invalidVinMsg") == "Invalid VIN Number" && oId !=
													"changeclaimtype") {
													this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseEnterValidVIN"));
													this.getView().byId("idMainClaimMessage").setType("Error");
												} else if (this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoiceDate") > this.getView().getModel(
														"HeadSetData").getProperty(
														"/RepairDate") && oId != "changeclaimtype") {
													this.getView().byId("idPrInvDate").setValueState("Error");
													this.getView().byId("idMainClaimMessage").setProperty("visible", true);
													this.getView().byId("idMainClaimMessage").setText(oBundle.getText("ROInvoiceDateGreaterThanRPDate"));
													this.getView().byId("idMainClaimMessage").setType("Error");

												} else if (
													this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallDate") > this.getView().getModel("HeadSetData")
													.getProperty(
														"/RepairDate") && oId != "changeclaimtype"
												) {
													this.getView().byId("idAccDate").setValueState("Error");
													this.getView().byId("idMainClaimMessage").setProperty("visible", true);
													this.getView().byId("idMainClaimMessage").setText(oBundle.getText("InstallDateGreaterThanRPDate"));
													this.getView().byId("idMainClaimMessage").setType("Error");

												} else if (this.getView().getModel("HeadSetData").getProperty("/RepairDate") > new Date() && oId != "changeclaimtype") {
													this.getView().byId("id_Date").setValueState("Error");
													this.getView().byId("idMainClaimMessage").setProperty("visible", true);
													this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FutureDateNotallowed"));
													this.getView().byId("idMainClaimMessage").setType("Error");

												} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZACD" &&
													this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "" && oId != "changeclaimtype") {
													this.getView().byId("idSubmissionClaim").setProperty("enabled", true);
													this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
													this.getView().getModel("DateModel").setProperty("/claimTypeState2", "Error");
													MessageToast.show(
														oBundle.getText("submissionTypeMandatory"), {
															my: "center center",
															at: "center center"
														});
												} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZAUT" &&
													this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "" && oId != "changeclaimtype") {
													this.getView().byId("idSubmissionClaim").setProperty("enabled", true);
													this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
													this.getView().getModel("DateModel").setProperty("/claimTypeState2", "Error");
													MessageToast.show(
														oBundle.getText("submissionTypeMandatory"), {
															my: "center center",
															at: "center center"
														});
												} else {
													this.getView().byId("idRepairOrder").setValueState("None");
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
															// 		console.log(oEvent);

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
																	PmpDataManager._fnStatusCheck(this);
																	this._fnGetClaimTypeDescENFR();
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

																	oClaimModel.read("/zc_headSet", {
																		urlParameters: {
																			"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty(
																					"/WarrantyClaimNum") +
																				"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'",
																			"$expand": "zc_claim_read_descriptionSet"
																		},
																		success: $.proxy(function (errorData) {
																			this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
																			this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", errorData.results[0].zc_claim_read_descriptionSet
																				.results[0].OFPDescription);
																			this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", errorData.results[
																					0]
																				.zc_claim_read_descriptionSet
																				.results[0].MainOpsCodeDescription);
																			this.getView().getModel("HeadSetData").setProperty("/HeadText", errorData.results[0].zc_claim_read_descriptionSet
																				.results[0].HeadText);

																			if (
																				this.getModel("LocalDataModel").getProperty("/oIDBtn") != this.getModel("LocalDataModel").getProperty(
																					"/SaveAuthClaim") &&
																				this.getModel("LocalDataModel").getProperty("/oIDBtn") != "changeclaimtype" &&
																				this.getModel("LocalDataModel").getProperty("/oIDBtn") != ""

																			) {
																				this.getRouter().navTo("SearchClaim");
																			}

																		}, this)
																	});

																	if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZECP" ||
																		this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZECP") {
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
															this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
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
																PmpDataManager._fnStatusCheck(this);
																this._fnGetClaimTypeDescENFR();
																if (sdata.results[0].DecisionCode == "ZTIC" || sdata.results[0].DecisionCode == "ZTRC") {
																	this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
																	this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
																	this.getView().getModel("DateModel").setProperty("/updateEnable", true);
																	this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
																	this.getView().getModel("LocalDataModel").setProperty("/PercentState", true);
																	this.getView().getModel("DateModel").setProperty("/oztac", false);
																	this.getView().getModel("DateModel").setProperty("/authAcClm", false);
																	this.getView().getModel("DateModel").setProperty("/authRejClm", false);
																	this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
																	this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
																	this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);
																	this.getModel("LocalDataModel").setProperty("/FeedEnabled", true);
																	this._fnClaimSumPercent();
																	this._fnClaimSum();
																	this._fnPricingData(oClaimNum);
																	this.getView().getModel("HeadSetData").setProperty("/DecisionCode", sdata.results[0].DecisionCode);

																}
																var oGroupDescription = sdata.results[0].WarrantyClaimType;

																if (oGroupDescription != "ZRCR" && oGroupDescription != "ZSCR" && oGroupDescription != "ZSSE" &&
																	oGroupDescription != "ZSSM" && oGroupDescription != "ZWMS") {
																	this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
																	this.getView().getModel("DateModel").setProperty("/authHide", true);
																}

																if (sdata.results[0].DecisionCode == "ZTAA") {
																	this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
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
								oClaimModel.read("/ZC_CLAIM_SUM('" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "')/Set", {
									success: $.proxy(function (data) {

										this.getModel("LocalDataModel").setProperty("/ClaimSum", data.results);
										this.getModel("LocalDataModel").setProperty("/ClaimSum/3/GSTHSTRate", "");
										this.getModel("LocalDataModel").setProperty("/ClaimSum/3/PSTQSTRate", "");

									}, this)
								});
							},

							_fnClaimSumPercent: function (e) {
								var oClaimModel = this.getModel("ProssingModel");
								oClaimModel.read("/ZC_CLAIM_AUTH_SUM('" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "')/Set", {
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
								if (oEvent.getParameters().value != "") {
									this.getView().getModel("HeadSetData").setProperty("/OFP", oEvent.getParameters().value.trim());
								}
								if (partPricingModel != "") {
									var oItems = this.getView().byId("idTableParts").getItems();
									var oIndexMat = partPricingModel.findIndex($.proxy(function (item) {
										return item.ItemKey == oEvent.getParameters().value
									}), this);

									for (var i = 0; i < partPricingModel.length; i++) {
										if (oEvent.getParameters().value == "" || partPricingModel[i].ItemKey != oEvent.getParameters().value) {
											this.getView().byId("idTableParts").getItems()[i].getCells()[1].setProperty("selected", false);
											this.getView().getModel("HeadSetData").setProperty("/OFP", oEvent.getParameters().value.trim());
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
								var ifileLength = this.getModel("LocalDataModel").getProperty("/HeadAtchmentData").length;
								//this.obj.Message = "";
								this.obj.NumberOfWarrantyClaim = oClaimNum;
								var reader = new FileReader();
								//INC0196563 by Minakshi
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

								MessageToast.show(oBundle.getText("FileSizeExceed"), {
									my: "center center",
									at: "center center"
								});
							},
							onFileNameLengthExceed: function () {

								MessageToast.show(oBundle.getText("FileNameExceed"), {
									my: "center center",
									at: "center center"
								});
							},
							onUploadComplete: function (oEvent) {

								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oClaimModel = this.getModel("ProssingModel");

								var fileType = this.oUploadedFile.type;
								//var oUploadedFileArr = this.oUploadedFile.name.split(".").reverse();
								//var oFileExt = oUploadedFileArr[0].length;
								var oFileName = this.oUploadedFile.name;

								//if (oURI == null) {

								//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
								//}
								//INC0196563 by Minakshi

								var ifileLength = this.getModel("LocalDataModel").getProperty("/HeadAtchmentData").length;
								if (ifileLength <= 9) {
									if (oFileName.indexOf("#") == -1 && oFileName.indexOf("%") == -1) {
										var fileNamePrior = "HEAD@@@" + oFileName;
										var fileName = fileNamePrior;
										var isProxy = "";
										if (window.document.domain == "localhost") {
											isProxy = "proxy";
										}
										var oURI = isProxy + "/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + fileName +
											"')/$value";
										var itemObj = {
											"NumberOfWarrantyClaim": oClaimNum,
											"COMP_ID": fileName,
											"ContentLine": this.oBase,
											"Mimetype": fileType,
											"URI": oURI,
											"AttachLevel": "HEAD"
										};

										this.obj.zc_claim_attachmentsSet.results.push(itemObj);
										this.obj.DBOperation = "SAVE";

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
														this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", oAttachSet);
													}, this)
												});

											}, this),
											error: $.proxy(function (err) {
												MessageToast.show(err.message);
												this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
											}, this)
										});
									} else {
										this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
										MessageToast.show(oBundle.getText("SpecialCharactersNotAllowed"), {
											my: "center center",
											at: "center center"
										});
									}

								} else {
									this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
									MessageToast.show(oBundle.getText("attachmentLimit"), {
										my: "center center",
										at: "center center"
									});
								}

							},

							onSubletUploadComplete: function (oEvent) {

								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oSubletType = this.getView().getModel("SubletDataModel").getProperty("/SubletCode");

								var oSubLength = this.getModel("LocalDataModel").getProperty("/SubletAtchmentData").length;

								if (oSubletType != "") {
									var fileType = this.oUploadedFile.type;
									var oFileName = this.oUploadedFile.name;
									var fileNamePrior = oSubletType + "@@@" + oFileName;
									var fileName = fileNamePrior;

									if (oFileName.indexOf("#") == -1 && oFileName.indexOf("%") == -1) {

										var isProxy = "";
										if (window.document.domain == "localhost") {
											isProxy = "proxy";
										}
										var oURI = isProxy + "/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + fileName +
											"')/$value";

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
												MessageToast.show(err);
											}
										});

									} else {
										this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
										MessageToast.show(oBundle.getText("SpecialCharactersNotAllowed"), {
											my: "center center",
											at: "center center"
										});
									}

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

								if (oEvent.getSource().getHref() == "") {
									MessageToast.show(oBundle.getText("Noattachmentsexists"), {
										my: "center center",
										at: "center center"
									});
								}
							},
							onFileDeleted: function (oEvent) {
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oPMPModel = this.getModel("ProssingModel");
								var oFileName = oEvent.getSource().getFileName();
								var oFileToDelete = "HEAD@@@" + oFileName;
								var dialog = new Dialog({
									title: oBundle.getText("SubmitClaimTCI"),
									type: "Message",
									content: new Text({
										text: oBundle.getText("AreyouSureDeleteFile") + " " + oFileName + "?"
									}),

									buttons: [
										new Button({
											text: oBundle.getText("Yes"),
											press: $.proxy(function () {

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

												dialog.close();

											}, this)
										}),
										new Button({
											text: oBundle.getText("Cancel"),
											press: $.proxy(function () {
												this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
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
							onFileSubletDeleted: function (oEvent) {
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");

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
											}, this),
											error: function (err) {
												MessageToast.show(err);
											}
										});
									}, this)
								});
							},

							onPressTCIQty: function (oEvent) {
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");

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
								this.getView().getModel("PartDataModel").setProperty("/matnr", "");
								this.getView().getModel("PartDataModel").setProperty("/quant", "");
								this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
								this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "");

								var oTable = this.getView().byId("idTableParts");
								oTable.removeSelections("true");
								this.getView().getModel("DateModel").setProperty("/partLine", true);
								this.getView().getModel("DateModel").setProperty("/editablePartNumber", true);
								var oClaimModel = this.getModel("ProssingModel");
								var productModel = this.getModel("ProductMaster");

							},
							onPressAddLabour: function () {
								this.getView().getModel("LabourDataModel").setProperty("/LabourOp", "");
								this.getView().getModel("LabourDataModel").setProperty("/ClaimedHours", "");
								this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", "");
								this.getModel("LocalDataModel").setProperty("/opNumberLabour", "");
								var oTable = this.getView().byId("idLabourTable");
								oTable.removeSelections("true");
								this.getView().getModel("DateModel").setProperty("/labourLine", true);
								this.getView().getModel("DateModel").setProperty("/editableLabourNumber", true);
							},
							onPressAddPaint: function () {
								this.getView().getModel("PaintDataModel").setProperty("/PaintPositionCode", "");
								var oTable = this.getView().byId("idPaintTable");
								oTable.removeSelections("true");
								this.getView().getModel("DateModel").setProperty("/paintLine", true);
							},
							onPressAddSublet: function () {
								this.getView().getModel("SubletDataModel").setProperty("/SubletCode", "");
								this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", "");
								this.getView().getModel("SubletDataModel").setProperty("/Amount", "");
								this.getView().getModel("SubletDataModel").setProperty("/description", "");
								this.getView().getModel("SubletDataModel").setProperty("/brand", "");
								this.getView().getModel("SubletDataModel").setProperty("/days", "");
								var oTable = this.getView().byId("idSubletTable");
								oTable.removeSelections("true");
								this.getView().getModel("DateModel").setProperty("/subletLine", true);
								this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);
								this.getView().getModel("DateModel").setProperty("/editableSublNumber", true);
							},
							onPressRecalculate: function () {
								var oRadioInd = this.getView().byId("idPricingOpt").getSelectedIndex();
								var oRadioIndGW = this.getView().byId("idPricingOptGW").getSelectedIndex();
								var oRadioIndP1 = this.getView().byId("idPricingOptP1").getSelectedIndex();
								var oCustomerPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/CustomerPer") || "0");
								var oDealerPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/DealerPer") || "0");
								var oTciPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/TCIPer") || "0");
								var PartPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/PartPer") || "0");
								var LabourPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/LabourPer") || "0");
								var SublPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/SubletPer") || "0");
								var oAuthNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");

								var oClaimModel = this.getModel("ProssingModel");

								var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
								var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
								var oClmType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
								var auClaimtype;
								if (oGroupType == "Claim" && oClmType == "ZGGW") {
									auClaimtype = "Numberofwarrantyclaim";
								} else if (oGroupType == "Claim" && oClmType == "ZWP1") {
									auClaimtype = "Numberofwarrantyclaim";
								} else {
									auClaimtype = "AuthorizationNumber";
								}

								var sLocation = window.location.host;
								var sLocation_conf = sLocation.search("webide");
								if (sLocation_conf == 0) {
									this.sPrefix = "/Claim_Destination"; //ecpSales_node_secured

								} else {
									this.sPrefix = "";

								}

								if (oRadioInd == 0 && oClmType != "ZWP1") {
									if ((oCustomerPer + oDealerPer + oTciPer) == 100) {
										this.getModel("LocalDataModel").setProperty("/discountBusyIndicator", true);

										oClaimModel.read("/zc_authorizationSet", {
											urlParameters: {
												"$filter": "PricingOption eq'P'and DBOperation eq 'POST'and " + auClaimtype + " eq '" + oAuthNum + "'and DealerPer eq '" +
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
												if (oClmType == "ZWP1") {
													this.getView().byId("RB4-5").setProperty("editable", false);
													this.getView().byId("RB4-6").setProperty("enabled", true);
												} else if (oClmType == "ZGGW") {
													this.getView().byId("RB4-4").setProperty("enabled", true);
													this.getView().byId("RB4-3").setProperty("editable", false);
												}

											}, this)

										});
									} else {
										MessageToast.show(oBundle.getText("TheSumpercentwithin100"), {
											my: "center center",
											at: "center center"
										});

									}

								} else if (oRadioInd == 1 || oRadioIndP1 == 0 || oClmType == "ZWP1") {
									// if ((PartPer + LabourPer + SublPer) == 100) {
									this.getModel("LocalDataModel").setProperty("/discountBusyIndicator", true);
									oClaimModel.read("/zc_authorizationSet", {
										urlParameters: {
											"$filter": "PricingOption eq 'D'and DBOperation eq 'POST'and " + auClaimtype + " eq '" + oAuthNum + "'and PartPer eq '" +
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

											if (oClmType == "ZWP1") {
												this.getView().byId("RB4-5").setProperty("enabled", true);
												this.getView().byId("RB4-6").setProperty("editable", false);
											} else if (oClmType == "ZGGW") {
												this.getView().byId("RB4-4").setProperty("enabled", true);
												this.getView().byId("RB4-3").setProperty("editable", false);
											}

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

							onPressClearPartiDisc: function (oEvent) {
								var oRadioInd = this.getView().byId("idPricingOpt").getSelectedIndex();
								var oRadioIndGW = this.getView().byId("idPricingOptGW").getSelectedIndex();
								var oRadioIndP1 = this.getView().byId("idPricingOptP1").getSelectedIndex();
								var oCustomerPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/CustomerPer") || "0");
								var oDealerPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/DealerPer") || "0");
								var oTciPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/TCIPer") || "0");
								var PartPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/PartPer") || "0");
								var LabourPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/LabourPer") || "0");
								var SublPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/SubletPer") || "0");
								var oAuthNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");

								var oClaimModel = this.getModel("ProssingModel");

								var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
								var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
								var oClmType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
								var auClaimtype;
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								if (
									this.getModel("LocalDataModel").getProperty("/DataAuthDetails/AuthorizationNumber") &&
									this.getModel("LocalDataModel").getProperty("/DataAuthDetails/AuthorizationType") == "ZAUT" &&
									this.getModel("LocalDataModel").getProperty("/DataAuthDetails/TCIClaimNo")
								) {
									oClaimModel.read("/zc_authorization_detailsSet", {
										urlParameters: {
											"$filter": "DBOperation eq 'ACLR' and ClaimNumber eq '" + oClaimNum + "'"
										},
										success: $.proxy(function (oAuthData) {
											if (oAuthData.results.length > 0) {
												this.getModel("LocalDataModel").setProperty("/DataAuthDetails", []);
											}
										}, this)
									});
								}

								if (oGroupType == "Claim" && oClmType == "ZGGW") {
									auClaimtype = "Numberofwarrantyclaim";
								} else if (oGroupType == "Claim" && oClmType == "ZWP1") {
									auClaimtype = "Numberofwarrantyclaim";
								} else if (oGroupType == "Claim") {
									auClaimtype = "Numberofwarrantyclaim";
								} else {
									auClaimtype = "AuthorizationNumber";
								}

								if (oRadioInd == 0 && oClmType != "ZWP1") {
									oClaimModel.read("/zc_authorizationSet", {
										urlParameters: {
											"$filter": "PricingOption eq'P'and DBOperation eq 'POST'and " + auClaimtype + " eq '" + oAuthNum +
												"'and DealerPer eq '00'and CustomerPer eq '00'and TCIPer eq '00'"
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

											this.getView().byId("RB4-5").setProperty("enabled", true);
											this.getView().byId("RB4-5").setProperty("editable", true);
											this.getView().byId("RB4-6").setProperty("editable", true);
											this.getView().byId("RB4-4").setProperty("editable", true);
											this.getView().byId("RB4-4").setProperty("enabled", true);
											this.getView().byId("RB4-3").setProperty("editable", true);

										}, this)

									});

								} else if (oRadioInd == 1 || oRadioIndP1 == 0 || oClmType == "ZWP1") {
									oClaimModel.read("/zc_authorizationSet", {
										urlParameters: {
											"$filter": "PricingOption eq 'D'and DBOperation eq 'POST'and " + auClaimtype + " eq '" + oAuthNum +
												"'and PartPer eq '00'and LabourPer eq '00'and SubletPer eq '00'"
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

											this.getView().byId("RB4-5").setProperty("enabled", true);
											this.getView().byId("RB4-5").setProperty("editable", true);
											this.getView().byId("RB4-6").setProperty("editable", true);
											this.getView().byId("RB4-4").setProperty("editable", true);
											this.getView().byId("RB4-4").setProperty("enabled", true);
											this.getView().byId("RB4-3").setProperty("editable", true);

										}, this)

									});
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

								var oClaimType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
								var oClaimModel = this.getModel("ProssingModel");

								var oClaimGroup = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
								var oAuthNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
								if (oAuthNum != "" && oAuthNum != undefined) {
									if (oClaimType == "ZAUT" || oClaimType == "ZACD") {
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
										oClaimModel.read("/zc_auth_copy_to_claimSet(NumberOfAuth='" + oAuthNum + "',Language='" + sSelectedLocale.toUpperCase() + "')", {

											success: $.proxy(function (data) {

												var oClaimNum = data.NumberOfWarrantyClaim;
												MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"), {
													my: "center center",
													at: "center center"
												});

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
																this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
																this.getModel("LocalDataModel").setProperty("/oErrorSet", errorData.results[0].zc_claim_vsrSet.results);
																this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", errorData.results[0].zc_claim_read_descriptionSet
																	.results[0].OFPDescription);
																this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", errorData.results[0].zc_claim_read_descriptionSet
																	.results[0].MainOpsCodeDescription);
																this.getView().getModel("HeadSetData").setProperty("/HeadText", errorData.results[0].zc_claim_read_descriptionSet
																	.results[0].HeadText);
															}, this)
														});

														PmpDataManager._fnStatusCheck(this);
														this._fnGetClaimTypeDescENFR();
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
																"$filter": "ClaimNumber eq '" + oClaimNum + "'"
															},
															success: $.proxy(function (oAuthData) {
																if (oAuthData.results.length > 0) {
																	this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
																}
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
										oClaimModel.read("/zc_claim_copy_to_authSet(NumberOfWarrantyClaim='" + oAuthNum + "',Language='" + sSelectedLocale.toUpperCase() +
											"')", {
												success: $.proxy(function (data) {
													var oClaimNum = data.NumberOfAuth;
													MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"), {
														my: "center center",
														at: "center center"
													});

													this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", true);
													oClaimModel.read("/zc_authorization_detailsSet", {
														urlParameters: {
															"$filter": "ClaimNumber eq '" + oClaimNum + "'"
														},
														success: $.proxy(function (oAuthData) {
															if (oAuthData.results.length > 0) {
																this.getModel("LocalDataModel").setProperty("/DataAuthDetails", oAuthData.results[0]);
																this.getView().getModel("DateModel").setProperty("/chngClaimTypeVisible", false);
															}
														}, this)
													});
													oClaimModel.read("/zc_authorizationSet", {
														urlParameters: {
															"$filter": "DBOperation eq 'LINK'and Numberofwarrantyclaim eq '" + oClaimNum + "'and  AuthorizationNumber eq '" +
																oAuthNum +
																"'and Language eq '" + sSelectedLocale.toUpperCase() +
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
															var oGroupDescription = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
															//this._fncheckClaimWithZGGW(oPartPer, oLabourPer, oSubletPer);

															//added for authorization claim

															this.getView().byId("idAuthorizationLinkForm").setProperty("visible", true);
															this.getView().byId("idClaimPrOpt").setProperty("visible", true);
															this.getView().byId("idAuthorizationForm").setProperty("visible", true);

															this.getModel("LocalDataModel").setProperty("/AuthGWVisible", false);
															if (oPartPer != "0" || oLabourPer != "0" || oSubletPer != "0") {
																this.getView().byId("idPricingOpt").setSelectedIndex(1);
																this.getView().byId("idParticiaptionTable").setProperty("visible", false);
																this.getView().byId("idDiscountTable").setProperty("visible", true);
															} else {
																this.getView().byId("idPricingOpt").setSelectedIndex(0);
																this.getView().byId("idParticiaptionTable").setProperty("visible", true);
																this.getView().byId("idDiscountTable").setProperty("visible", false);
															}
															//added for authorization claim

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
															this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", []);
															this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", []);

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
																	this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
																	this.getModel("LocalDataModel").setProperty("/oErrorSet", errorData.results[0].zc_claim_vsrSet.results);
																	this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", errorData.results[0].zc_claim_read_descriptionSet
																		.results[0].OFPDescription);
																	this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", errorData.results[0].zc_claim_read_descriptionSet
																		.results[0].MainOpsCodeDescription);
																	this.getView().getModel("HeadSetData").setProperty("/HeadText", errorData.results[0].zc_claim_read_descriptionSet
																		.results[0].HeadText);
																}, this)
															});

															PmpDataManager._fnStatusCheck(this);
															this._fnGetClaimTypeDescENFR();
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
								var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");

								oProssingModel.read("/zc_authorizationSet", {
									urlParameters: {
										"$filter": "DBOperation eq 'LINK'and Numberofwarrantyclaim eq '" + oClaimNum + "'and  AuthorizationNumber eq '" + oClaim +
											"'and Language eq '" + sSelectedLocale.toUpperCase() +
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

											if (oClaimtype == "ZWP1") {
												this.getView().byId("RB4-5").setProperty("editable", false);
												this.getView().byId("RB4-6").setProperty("enabled", true);
											} else if (oClaimtype == "ZGGW") {
												this.getView().byId("RB4-4").setProperty("editable", false);
												this.getView().byId("RB4-3").setProperty("enabled", true);
											}

										} else if (data.results[0].Message != "") {
											//this.getView().getModel("DataPercetCalculate").setProperty("/AuthorizationNumber", "");
											MessageToast.show(data.results[0].Message, {
												my: "center center",
												at: "center center"
											});
										}

										oProssingModel.read("/zc_authorization_detailsSet", {
											urlParameters: {
												"$filter": "ClaimNumber eq '" + oClaimNum + "'"
											},
											success: $.proxy(function (sdata) {
												if (sdata.results.length > 0) {
													this.getView().getModel("DataPercetCalculate").setProperty("/AuthorizationNumber", sdata.results[0].AuthorizationNumber);
													this.getModel("LocalDataModel").setProperty("/DataAuthDetails", sdata.results[0]);
												}
											}, this),
											error: $.proxy(function (err) {
												this.getModel("LocalDataModel").setProperty("/DataAuthDetails", []);
											}, this)
										});

									}, this),
									error: $.proxy(function (err) {
										var errText = JSON.parse(err.responseText).error.message.value;
										this.getModel("LocalDataModel").setProperty("/DataAuthDetails", []);
										this.getView().getModel("DataPercetCalculate").setData([]);
										MessageToast.show(errText, {
											my: "center center",
											at: "center center"
										});
									}, this)
								});

							},
							onStep01Next: function (oEvent) {

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

								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
								var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
								var oProssingModel = this.getModel("ProssingModel");
								if (
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWP2" ||
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWP2" ||
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWA2" ||
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWA2"
								) {
									this.getView().byId("idFilter02").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ValidatePartsSection"));
								} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSCR" || this.getView().getModel(
										"HeadSetData").getProperty(
										"/WarrantyClaimType") == "ZSSM") {
									this.getView().byId("idFilter07").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ValidatePartsSection"));
								} else {
									this.getView().byId("idFilter04").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimLabourSection"));
									this.getView().byId("idOperationLabour").focus();
								}

							},
							onStep03Back: function () {

								this.getView().byId("idFilter01").setProperty("enabled", true);
								this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
								this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("MainSection"));
							},

							onStep04Next: function () {
								if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA1" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA2" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSSE" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWP1" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA1" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA2" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWP1" &&
									this.getModel("LocalDataModel").getProperty("/oFieldAction") != "FAC" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZECP" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZECP" &&
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
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPaintRustSection"));
								} else {
									this.getView().byId("idFilter06").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimSubletSection"));
								}
							},
							onStep04Back: function () {

								this.getView().byId("idFilter03").setProperty("enabled", true);
								this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
								this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));

							},

							onStep05Next: function () {

								if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" && this.getView().getModel("HeadSetData")
									.getProperty(
										"/WarrantyClaimType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA2" && this.getView()
									.getModel(
										"HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" && this.getView().getModel("HeadSetData")
									.getProperty(
										"/WarrantyClaimSubType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA2" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC" &&
									this.getModel("LocalDataModel").getProperty("/oFieldAction") != "FAC" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZECP" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZECP" &&
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
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimSubletSection"));
								}
							},
							onStep05Back: function () {

								this.getView().byId("idFilter04").setProperty("enabled", true);
								this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
								this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimLabourSection"));

							},

							onStep06Next: function () {

								if (
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSSE" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSSM" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZLDC" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZRCR"
								) {
									this.getView().byId("idFilter02").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimAuthorizationSection"));
								} else {
									this.getView().byId("idFilter07").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ValidatePartsSection"));
								}
							},
							onStep06Back: function () {

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
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimLabourSection"));
								} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWMS" || this.getView().getModel(
										"HeadSetData").getProperty("/WarrantyClaimType") == "ZRCR") {
									this.getView().byId("idFilter01").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("MainSection"));
								} else {
									this.getView().byId("idFilter05").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab5");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPaintRustSection"));
								}
								if (this.getModel("LocalDataModel").getProperty("/oFieldAction") == "FAC") {
									this.getView().byId("idFilter04").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimLabourSection"));
								}

								if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZECP" ||
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZECP") {
									this.getView().byId("idFilter04").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimLabourSection"));
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
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimLabourSection"));
								}

							},
							onStep02Next: function () {

								if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS") {
									this.getView().byId("idFilter07").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ValidatePartsSection"));
								}
							},
							onStep02Back: function () {

								this.getView().byId("idFilter06").setProperty("enabled", true);
								this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
								this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimSubletSection"));

								if (
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWP2" ||
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWP2" ||
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWA2" ||
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWA2"
								) {
									this.getView().byId("idFilter03").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
								}
							},

							onStep07Back: function () {

								if (
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSCR" ||
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSSM"
								) {
									this.getView().byId("idFilter03").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
								} else if (
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSCR" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZLDC" &&
									this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSSM") {
									this.getView().byId("idFilter02").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimAuthorizationSection"));
								} else {
									this.getView().byId("idFilter06").setProperty("enabled", true);
									this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimSubletSection"));
								}

							},

							onSelectTab: function (oSelectedKey) {
								// debugger;

								if (oSelectedKey.getParameters().selectedKey == "Tab1") {
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("MainSection"));
								} else if (oSelectedKey.getParameters().selectedKey == "Tab2") {
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimAuthorizationSection"));
								} else if (oSelectedKey.getParameters().selectedKey == "Tab3") {
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPartsSection"));
								} else if (oSelectedKey.getParameters().selectedKey == "Tab4") {
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimLabourSection"));
								} else if (oSelectedKey.getParameters().selectedKey == "Tab5") {
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimPaintRustSection"));
								} else if (oSelectedKey.getParameters().selectedKey == "Tab6") {
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ClaimSubletSection"));
								} else if (oSelectedKey.getParameters().selectedKey == "Tab7") {
									this.getView().byId("mainSectionTitle").setTitle(oBundle.getText("ValidatePartsSection"));
								}
							},
							onPressBack: function (oEvent) {
								var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
								this.ogetSelectedKey = this.getView().byId("idIconTabMainClaim").getSelectedKey();
								var ogetKey = this.ogetSelectedKey.split("Tab")[1];

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
										that.getView().getModel("HeadSetData").getProperty("/DecisionCode") == "ZTIC" && sap.ui.getCore().getModel("UserDataModel").getProperty(
											"/LoggedInUser") == "Dealer_Parts_Services_Admin"

									) {
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
								if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSCR") {
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
								} else {
									this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", oBaseUint);
								}

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
									"UnitOfMeasure": this.getView().getModel("LocalDataModel").getProperty("/BaseUnit"),
									"Posnr": ""
								};

								var oArrNew = this.obj.zc_itemSet.results.filter(function (val) {
									return val.MaterialNumber === itemObj.MaterialNumber;
								}).length;

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
											this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
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
													this.obj.NumberOfWarrantyClaim = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
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
								//this.getView().byId("idOFPart").setText(oSelectedPart);
								this.getView().getModel("HeadSetData").setProperty("/OFP", oSelectedPart);
								table.removeSelections("true");
							},
							onSelectOFPLabour: function (oEvent) {
								var table = this.getView().byId("idLabourTable");
								var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
								var oSelectedPart = oEvent.getSource().getParent().getCells()[2].getText();
								//var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								this.getView().getModel("HeadSetData").setProperty("/MainOpsCode", oSelectedPart);

							},
							onSelectOFPPrint: function (oEvent) {
								var table = this.getView().byId("idPaintTable");
								var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
								var oSelectedPart = oEvent.getSource().getParent().getCells()[2].getText();
								//var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								this.getView().getModel("HeadSetData").setProperty("/MainOpsCode", oSelectedPart);
							},
							onPressSuggestLabour: function (oEvent) {

								var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");

								//var oSelectedPart = oEvent.getSource().getParent().getCells()[2].getText();
								var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								//this.getView().byId("idOFPLabour").setText(oSelectedPart);
								var oProssingModel = this.getModel("ProssingModel");

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
										error: function (err) {
											MessageToast.show(err);
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
								var sValue = evt.getParameter("value") || "";
								if (sValue) {
									sValue = sValue.toUpperCase();
								}
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
								var oProssingModel = this.getModel("ProssingModel");

								//var inputVal = this.getModel("LocalDataModel").getProperty("/opNumberLabour") || "";
								oProssingModel.read("/zc_get_operation_numberSet", {
									urlParameters: {
										"$filter": "CLMNO eq '" + oClaimNum + "' and VHVIN eq '" + oVin + "' and Langu eq '" + sSelectedLocale.toUpperCase() +
											"' and J_3GKATNRC eq '" + sValue + "'"
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

										this.getModel("LocalDataModel").setProperty("/oPaintList", oPaintData);

									}, this),
									error: $.proxy(function (err) {
										MessageToast.show(oBundle.getText("SystemInternalError"));
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
									}, this)
								});

							},

							_handleLiveChangeLabour: function (evt) {
								var sValue = evt.getParameter("value") || "";
								if (sValue) {
									sValue = sValue.toUpperCase();
								}
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
								var oProssingModel = this.getModel("ProssingModel");
								this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", true);

								//var inputVal = this.getModel("LocalDataModel").getProperty("/opNumberLabour") || "";
								oProssingModel.read("/zc_get_operation_numberSet", {
									urlParameters: {
										"$filter": "CLMNO eq '" + oClaimNum + "' and VHVIN eq '" + oVin + "' and Langu eq '" + sSelectedLocale.toUpperCase() +
											"' and J_3GKATNRC eq '" + sValue + "'"
									},

									success: $.proxy(function (data) {
										this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", false);
										var oLabourArray = data.results.filter(function (item) {
											return item.J_3GKATNRC[0] != "P";
										});
										this.getModel("LocalDataModel").setProperty("/SuggetionOperationList", oLabourArray);

									}, this),
									error: $.proxy(function (err) {
										MessageToast.show(oBundle.getText("SystemInternalError"));
										this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", false);
									}, this)
								});
							},
							_handleValueHelpCloseLabour: function (evt) {
								var oSelectedItem = evt.getParameter("selectedItem");
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
								var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
								var oProssingModel = this.getModel("ProssingModel");

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

							_handleLiveChangePaint: function (evt) {
								var sValue = evt.getParameter("value") == "" ? "P" : evt.getParameter("value");
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
								var oProssingModel = this.getModel("ProssingModel");
								this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", true);
								if (sValue && sValue.toUpperCase().startsWith("P")) {
									sValue = sValue.toUpperCase();

									//var inputVal = this.getModel("LocalDataModel").getProperty("/opNumberLabour") || "";
									oProssingModel.read("/zc_get_operation_numberSet", {
										urlParameters: {
											"$filter": "CLMNO eq '" + oClaimNum + "' and VHVIN eq '" + oVin + "' and Langu eq '" + sSelectedLocale.toUpperCase() +
												"' and J_3GKATNRC eq '" + sValue + "'"
										},

										success: $.proxy(function (data) {
											this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", false);
											this.getModel("LocalDataModel").setProperty("/oPaintList", data.results);
										}, this),
										error: $.proxy(function (err) {
											MessageToast.show(oBundle.getText("SystemInternalError"));
											this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", false);
										}, this)
									});
								} else {
									this.getModel("LocalDataModel").setProperty("/oPaintList", []);
								}
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
							//======= changes done for labour op filter during add labour singhmi 18/02/2021 start
							onLiveChangeLabourOp: function (oEvent) {
								var oLabourOp = oEvent.getParameters().value.toUpperCase();
								this.getModel("LocalDataModel").setProperty("/opNumberLabour", oLabourOp);
							},
							//======= changes done for labour op filter during add labour singhmi 18/02/2021 end
							handleValueHelpLabour: function (oEvent) {
								this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", true);
								oBundle = this.getView().getModel("i18n").getResourceBundle();
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
								var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
								var oProssingModel = this.getModel("ProssingModel");
								//======= changes done for labour op filter during add labour singhmi 18/02/2021 
								var inputVal = this.getModel("LocalDataModel").getProperty("/opNumberLabour") || "";
								oProssingModel.read("/zc_get_operation_numberSet", {
									urlParameters: {
										"$filter": "CLMNO eq '" + oClaimNum + "' and VHVIN eq '" + oVin + "' and Langu eq '" + sSelectedLocale.toUpperCase() +
											"' and J_3GKATNRC eq '" + inputVal + "'"
									},

									success: $.proxy(function (data) {
										this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", false);
										var oLabourArray = data.results.filter(function (item) {
											return item.J_3GKATNRC[0] != "P";
										});
										this.getModel("LocalDataModel").setProperty("/SuggetionOperationList", oLabourArray);
										var oPaintData = data.results.filter(function (item) {
											return item.J_3GKATNRC[0] == "P";
										});

										this.getModel("LocalDataModel").setProperty("/oPaintList", oPaintData);

									}, this),
									error: $.proxy(function (err) {
										MessageToast.show(oBundle.getText("SystemInternalError"));
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
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
									this.getView().addDependent(this._valueHelpDialog01);
								}

								// // create a filter for the binding
								// this._valueHelpDialog01.getBinding("items").filter([new Filter(
								// 	"J_3GKATNRC",
								// 	sap.ui.model.FilterOperator.Contains, sInputValue
								// )]);

								// // open value help dialog filtered by the input value
								this._valueHelpDialog01.open();
							},

							handleValueHelpPaint: function (oEvent) {
								oBundle = this.getView().getModel("i18n").getResourceBundle();
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
								var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
								var oProssingModel = this.getModel("ProssingModel");

								var sValue = oEvent.getParameter("value") || "";
								if (sValue) {
									sValue = sValue.toUpperCase();
								}

								this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", true);
								oProssingModel.read("/zc_get_operation_numberSet", {
									urlParameters: {
										"$filter": "CLMNO eq '" + oClaimNum + "' and VHVIN eq '" + oVin + "' and Langu eq '" + sSelectedLocale.toUpperCase() +
											"' and J_3GKATNRC eq 'P'"
									},
									success: $.proxy(function (data) {
										this.getModel("LocalDataModel").setProperty("/labourBusyIndicator", false);
										// var oLabourArray = data.results.filter(function (item) {

										// 	return item.J_3GKATNRC[0] != "P";
										// 	//return item.ItemKey[14] == "P";
										// });
										// this.getModel("LocalDataModel").setProperty("/SuggetionOperationList", oLabourArray);
										// var oPaintData = data.results.filter(function (item) {

										// 	return item.J_3GKATNRC[0] == "P";

										// });

										this.getModel("LocalDataModel").setProperty("/oPaintList", data.results);

									}, this),
									error: $.proxy(function (err) {
										MessageToast.show(oBundle.getText("SystemInternalError"));
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
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

								// // create a filter for the binding
								// this._valueHelpDialog02.getBinding("items").filter([new Filter(
								// 	"J_3GKATNRC",
								// 	sap.ui.model.FilterOperator.Contains, sInputValue
								// )]);

								// open value help dialog filtered by the input value
								this._valueHelpDialog02.open();
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

								// this.obj.Message = "";
								this.obj.NumberOfWarrantyClaim = oClaimNum;
								this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
								this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
								this.obj.DBOperation = "SAVE";
								this.obj.WarrantyClaimSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");

								var oClaimModel = this.getModel("ProssingModel");

								oClaimModel.refreshSecurityToken();
								if (this.getView().getModel("LabourDataModel").getProperty("/LabourOp") != "") {
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

									var oGetIndex = this.obj.zc_claim_item_labourSet.results.findIndex(({
										LabourNumber
									}) => LabourNumber == this.getView().getModel("LabourDataModel").getProperty("/LabourOp"));

									if (oGetIndex > -1) {
										this.getView().getModel("LabourDataModel").setProperty("/LabourOp", "");
										this.getView().getModel("LabourDataModel").setProperty("/ClaimedHours", "");
										this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", "");

										MessageToast.show(oBundle.getText("LabourAlreadyExist"), {
											my: "center center",
											at: "center center"
										});
									} else {
										//INC0192568 changed in ClaimedHours
										var itemObj = {
											"Type": "LABOUR",
											"ItemType": "FR",
											"LabourNumber": this.getView().getModel("LabourDataModel").getProperty("/LabourOp"),
											"ClaimedHours": parseFloat(oClaimHr).toFixed(1),
											"LabourDescription": this.getView().getModel("LabourDataModel").getProperty("/LabourDescription")
										};

										var oIndexItem = this.obj.zc_claim_item_labourSet.results.findIndex(function (item) {
											return item.LabourNumber == itemObj.LabourNumber;
										});

										if (oIndexItem == -1) {
											this.obj.zc_claim_item_labourSet.results.push(itemObj);
										}
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);

										oClaimModel.create("/zc_headSet", this.obj, {
											success: $.proxy(function (data, response) {
												this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);

												var pricinghData = response.data.zc_claim_item_price_dataSet.results;
												//	var pricinghData=response.data.zc_claim_item_labourSet.results;
												var oFilteredData = pricinghData.filter(function (val) {
													return val.ItemType === "FR" && val.ItemKey[0] != "P";
												});

												this.getView().getModel("HeadSetData").setProperty("/OFP", response.data.OFP);

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
												this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
											}, this)
										});
									}

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
													this.obj.NumberOfWarrantyClaim = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
													oClaimModel.refreshSecurityToken();
													oClaimModel.create("/zc_headSet", this.obj, {
														success: $.proxy(function (data, response) {
															this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
															var pricinghData = response.data.zc_claim_item_price_dataSet.results;
															var oFilteredData = pricinghData.filter(function (val) {
																return val.ItemType === "FR" && val.ItemKey[0] != "P";
															});

															this.getView().getModel("HeadSetData").setProperty("/OFP", response.data.OFP);

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

										var pricinghData = response.data.zc_claim_item_price_dataSet.results;
										var oFilteredData = pricinghData.filter(function (val) {
											return val.ItemType === "FR" && val.ItemKey[0] == "P";
										});

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
										this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
									}, this)
								});

							},
							onPressCancelPaint: function () {
								this.getView().getModel("PaintDataModel").setProperty("/PaintPositionCode", "");
							},
							onPressDeletePaint: function () {
								var oTable = this.getView().byId("idPaintTable");
								var oTableIndex = oTable._aSelectedPaths;

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
													this.obj.NumberOfWarrantyClaim = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
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
									oSelectedSublet == "C5" ||
									oSelectedSublet == "C3" || oSelectedSublet == "C4" ||
									oSelectedSublet == "RT" || oSelectedSublet == "RL" || oSelectedSublet == "RO") {
									this.getView().getModel("DateModel").setProperty("/disableBrandDays", true);

								} else {
									this.getView().getModel("DateModel").setProperty("/disableBrandDays", false);
								}
							},
							onPressSaveClaimItemSublet: function () {

								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");

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

								var oSubletTypeModel = this.getModel("LocalDataModel").getProperty("/ClaimSubletCodeModel");
								var oAmt = this.getView().getModel("SubletDataModel").getProperty("/Amount");
								var oSubAmt = (oAmt != "") ? Number(oAmt) : "";

								var selectedSubletItem = oSubletTypeModel.filter($.proxy(function (item) {

									return item.Matnr == this.getView().getModel("SubletDataModel").getProperty("/SubletCode")

								}, this));

								if (this.getModel("LocalDataModel").getProperty("/SubletAtchmentData").length == 0 && selectedSubletItem[0].ZATTACHMENT_REQUIRED ==
									"Y" || this.getModel("LocalDataModel").getProperty("/SubletAtchmentData").length == 0 && selectedSubletItem[0].ZATTACHMENT_REQUIRED ==
									"") {
									MessageToast.show(oBundle.getText("attachmentRequired"), {
										my: "center center",
										at: "center center"
									});
								} else if (this.getView().getModel("SubletDataModel").getProperty("/SubletCode") == "") {
									MessageToast.show(oBundle.getText("SubletTypeRequired"), {
										my: "center center",
										at: "center center"
									});
								} else {
									var itemObj = {
										"ItemType": "SUBL",
										"SubletType": this.getView().getModel("SubletDataModel").getProperty("/SubletCode"),
										"InvoiceNo": this.getView().getModel("SubletDataModel").getProperty("/InvoiceNo"),
										"Amount": oSubAmt.toString() || "0.00",
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
											this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", []);

										}, this),
										error: $.proxy(function (err) {
											MessageToast.show(oBundle.getText("SystemInternalError"));
											this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
										}, this)
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

								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var oClaimModel = this.getModel("ProssingModel");

								var oTableIndex = oTable._aSelectedPaths;
								if (oTableIndex.length == 1) {

									//var oString = oTableIndex.toString();
									var oSelectedRow = oTableIndex.toString();
									var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
									this.getView().getModel("DateModel").setProperty("/editableSublNumber", false);

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
										var oFile = obj.URI.split("FileName=")[1].split("')/")[0];
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

								var oTableIndex = oTable._aSelectedPaths;
								var oFile, oFileReplaced;
								var oPath = oTableIndex.toString();
								//var oSelectedRow = oTableIndex.toString();
								var obj = this.getView().getModel("LocalDataModel").getProperty(oPath);
								var oSelectedItem = obj.ItemKey;
								if (this.getModel("LocalDataModel").getProperty(oPath).URI != "") {
									oFile = this.getModel("LocalDataModel").getProperty(oPath).URI.split("FileName=")[1].split("')/")[0];
									oFileReplaced = oFile.replace(/'/g, "");
								}

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
													this.obj.NumberOfWarrantyClaim = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
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
															this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
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
								// var oClaimModel = this.getModel("ProssingModel");
								// var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								// var oSubletCode = this.getView().getModel("SubletDataModel").getProperty("/SubletCode");
								var oTable = this.getView().byId("idSubletTable");

								//
								this.getView().getModel("SubletDataModel").setProperty("/SubletCode", "");
								this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", "");
								this.getView().getModel("SubletDataModel").setProperty("/Amount", "");
								this.getView().getModel("SubletDataModel").setProperty("/description", "");
								this.getView().getModel("SubletDataModel").setProperty("/brand", "");
								this.getView().getModel("SubletDataModel").setProperty("/days", "");
								this.getView().getModel("SubletDataModel").setProperty("/unitOfMeasure", "");
								this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", []);
								// 	this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);

								oTable.removeSelections("true");

							},

							onRevalidate: function () {
								var oClaimModel = this.getModel("ProssingModel");
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");

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

								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								this.obj.Message = "";
								this.obj.NumberOfWarrantyClaim = oClaimNum;
								this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
								this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
								this.obj.DBOperation = "SAVE";
								var oClaimModel = this.getModel("ProssingModel");

								var itemObj = {
									"DmgAreaCode": this.getView().getModel("HeadSetData").getProperty("/DmgAreaCode"),
									"DmgTypeCode": this.getView().getModel("HeadSetData").getProperty("/DmgTypeCode"),
									"DmgSevrCode": this.getView().getModel("HeadSetData").getProperty("/DmgSevrCode")
								};
								/* TODO: changes by Vikas -15-11-2022 for handling field level validation --Changes Start */
								var sValidationPass = this.HandleFieldValidation(Object.values(itemObj));
								if (sValidationPass === true) {
									return MessageToast.show("Please enter all required fields");
								}
								/* TODO: changes by Vikas -15-11-2022 for handling field level validation -- Changes End */
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
										MessageToast.show(err);
									}, this)
								});

								//}

							},
							/*
							 *changes by Vikas -
							 *15-11-2022 for handling field level validation
							 */
							HandleFieldValidation: function (sList) {
								return sList.findIndex(e => e === undefined || e === "") > -1;
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

									this.getView().getModel("DateModel").setProperty("/damageLine", true);

									var oIndex = parseInt(oTable._aSelectedPaths.toString().split("/")[2]);
									this.obj.zc_claim_item_damageSet.results.splice(oIndex, 1);

									var oClaimModel = this.getModel("ProssingModel");

									oClaimModel.refreshSecurityToken();
									this.obj.DBOperation = "SAVE";
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
											this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
										}, this)
									});
								}
							},
							onDeleteDamageLine: function () {
								var oTable = this.getView().byId("idDamageDetailTable");
								var oTableIndex = oTable._aSelectedPaths;

								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");

								if (oTableIndex.length == 1) {
									this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
									var oIndex = parseInt(oTableIndex.toString().split("/")[2]);
									this.obj.zc_claim_item_damageSet.results.splice(oIndex, 1);

									var oClaimModel = this.getModel("ProssingModel");

									oClaimModel.refreshSecurityToken();
									this.obj.DBOperation = "SAVE";
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
											this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
										}, this)
									});
								}
							},
							onSubmitTci: function (oEvent) {
								//this.getView().getModel("DateModel").setProperty("/submitVisible", false);
								var bValidationError;

								var that = this;

								jQuery.each(WarrantyDataManager._modelValidate(that), function (i, oInput) {
									if (oInput.getVisible() == true && oInput.mProperties.enabled == true) {
										bValidationError = that._validateInput(oInput) || bValidationError;
									} else {
										oInput.setValueState("None");
									}
								});

								this.fnDisableLine();
								var oClaimModel = this.getModel("ProssingModel");
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								this.obj.WarrantyClaimType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
								this.obj.WarrantyClaimSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
								this.obj.Partner = this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner");
								this.obj.ActionCode = "";
								this.obj.NameOfPersonRespWhoChangedObj = this.getModel("LocalDataModel").getProperty("/LoginId");

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
								this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP").toUpperCase().trim();
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
								this.obj.CustomerPostalCode = this.getView().getModel("HeadSetData").getProperty("/CustomerPostalCode").toUpperCase();
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

												//	this.getView().getModel("DateModel").setProperty("/submitVisible", true);

												if (bValidationError) {
													this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
													this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
													this.getView().byId("idMainClaimMessage").setType("Error");
													this.getView().byId("idMainClaimMessage").setProperty("visible", true);
												} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZACD" &&
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
												} else if (this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoiceDate") > this.getView().getModel(
														"HeadSetData").getProperty("/RepairDate")) {
													this.getView().byId("idPrInvDate").setValueState("Error");
													this.getView().byId("idMainClaimMessage").setProperty("visible", true);
													this.getView().byId("idMainClaimMessage").setText(oBundle.getText("ROInvoiceDateGreaterThanRPDate"));
													this.getView().byId("idMainClaimMessage").setType("Error");

												} else if (this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallDate") > this.getView().getModel(
														"HeadSetData").getProperty(
														"/RepairDate")) {
													this.getView().byId("idAccDate").setValueState("Error");
													this.getView().byId("idMainClaimMessage").setProperty("visible", true);
													this.getView().byId("idMainClaimMessage").setText(oBundle.getText("InstallDateGreaterThanRPDate"));
													this.getView().byId("idMainClaimMessage").setType("Error");

												} else if (this.getView().getModel("HeadSetData").getProperty("/RepairDate") > new Date()) {
													this.getView().byId("id_Date").setValueState("Error");
													this.getView().byId("idMainClaimMessage").setProperty("visible", true);
													this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FutureDateNotallowed"));
													this.getView().byId("idMainClaimMessage").setType("Error");

												} else {
													this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
													this.getView().getModel("DateModel").setProperty("/claimTypeState2", "None");
													this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
													oClaimModel.refreshSecurityToken();
													oClaimModel.create("/zc_headSet", this.obj, {
														success: $.proxy(function (data, response) {
															this.getView().byId("idMainClaimMessage").setProperty("visible", false);

															var pricinghData = response.data.zc_claim_item_price_dataSet.results;

															this.getView().getModel("HeadSetData").setProperty("/ReferenceDate", response.data.ReferenceDate);
															this.getView().getModel("HeadSetData").setProperty("/DateOfApplication", response.data.DateOfApplication);

															// var oFilteredData = pricinghData.filter(function (val) {
															// 	return val.ItemType === "MAT";
															// });

															// this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);

															var oFilteredData = pricinghData.filter(function (val) {
																return val.ItemType === "MAT";
															});

															this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
															var oFilteredDataLabour = pricinghData.filter(function (val) {
																return val.ItemType === "FR" && val.ItemKey[0] != "P";
															});
															this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredDataLabour);
															var oFilteredDataPaint = pricinghData.filter(function (val) {
																return val.ItemType === "FR" && val.ItemKey[0] == "P";
															});
															this.getModel("LocalDataModel").setProperty("/PaintPricingDataModel", oFilteredDataPaint);

															var oFilteredDataSubl = pricinghData.filter(function (val) {
																return val.ItemType === "SUBL";
															});

															this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredDataSubl);

															this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
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
																	this.getView().getModel("HeadSetData").setProperty("/HeadText", errorData.results[0].zc_claim_read_descriptionSet
																		.results[0].HeadText);
																	this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
																	this.obj.zc_claim_vsrSet.results.pop(oObj);
																}, this)
															});

															oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
																urlParameters: {
																	"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum +
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
																		} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWP1") {
																			this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
																			this.getModel("LocalDataModel").setProperty("/PercentState", true);
																		} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZGGW") {
																			this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
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
																	} else if (sdata.results[0].DecisionCode == "ZTAC" &&
																		this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSSM" &&
																		this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZLDC" &&
																		this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSCR"
																	) {
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

																	PmpDataManager._fnStatusCheck(this);
																	this._fnGetClaimTypeDescENFR();
																	this._fnClaimSum();
																	this._fnClaimSumPercent();
																	//this._fnPricingData(oClaimNum);
																}, this)
															});

														}, this),
														error: $.proxy(function (err) {
															MessageToast.show(oBundle.getText("SystemInternalError"));
															this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
														}, this)
													});

												}

											}, this)
										}),
										new Button({
											text: oBundle.getText("Cancel"),
											press: $.proxy(function () {
												this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
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

							},

							onPressPrint: function () {
								var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
								var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
								var isProxy = "";
								if (window.document.domain == "localhost") {
									isProxy = "proxy";
								}
								if (oClaimtype == "FAC" || oClaimtype == "ECP" || oClaimtype == "STR" || oClaimtype == "CRC" ||
									oClaimtype == "WTY" ||
									oClaimtype == "ZCSR" || oClaimtype == "ZCLS" || oClaimtype == "ZCWE" || oClaimtype == "ZCER" ||
									oClaimtype == "ZECP" || oClaimtype == "ZSSE" || oClaimtype == "ZRCR" || oClaimtype == "ZWVE" ||
									oClaimtype == "ZWP1" || oClaimtype == "ZWP2" || oClaimtype == "ZWMS" || oClaimtype == "ZWAC" ||
									oClaimtype == "ZGGW" || oClaimtype == "ZWA1" || oClaimtype == "ZWA2" || oClaimtype == "ZAUT" || oClaimtype == "ZACD") {

									// <a onclick="window.open(this.href,'_blank');return false;" href="http://some_other_site.com">Some Other Site</a>

									var w = window.open(isProxy +
										"/node/ZDLR_CLAIM_SRV/zc_claim_printSet(NumberOfWarrantyClaim='" + oClaimNum + "',PrintType='WTY')/$value",
										'_blank');

								} else if (oClaimtype == "SCR" || oClaimtype == "SSM" || oClaimtype == "VLC" ||
									oClaimtype == "ZSCR" || oClaimtype == "ZSSM" || oClaimtype == "ZLDC") {
									var w = window.open(isProxy +
										"/node/ZDLR_CLAIM_SRV/zc_claim_printSet(NumberOfWarrantyClaim='" + oClaimNum + "',PrintType='NON_WTY')/$value",
										'_blank');
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

							},
							onPressAbbr: function () {
								//var oCCR = new sap.ui.model.json.JSONModel();
								//oCCR.loadData(jQuery.sap.getModulePath("zclaimProcessing.utils", "/ccr.json"));

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

								window.open("" + oCVSHUrl + "?.lang=" + sSelectedLocale + "&franchise=" + oDivision + "", '_blank');
							},

							onSelectAuthGoodWill: function (oEvent) {
								var oSelectedRadio = oEvent.getSource().getSelectedIndex();
								if (oSelectedRadio == 1) {
									this.getView().byId("idAuthorizationLinkForm").setProperty("visible", true);
									this.getView().byId("idAuthorizationForm").setProperty("visible", true);
									this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
									this.getModel("LocalDataModel").setProperty("/reCalculate", false);
									this.getView().byId("idClaimPrOpt").setProperty("visible", true);
									this.getView().byId("idParticiaptionTable").setProperty("visible", true);
									this.getModel("LocalDataModel").setProperty("/PercentState", false);
									this.getView().byId("idPricingOpt").setSelectedIndex(0);
								} else {
									this.getView().byId("idParticiaptionTable").setProperty("visible", true);
									this.getView().byId("idDiscountTable").setProperty("visible", false);
									this.getView().byId("idClaimPrOpt").setProperty("visible", false);
									this.getView().byId("idAuthorizationLinkForm").setProperty("visible", false);
									this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
									this.getModel("LocalDataModel").setProperty("/reCalculate", true);
									this.getModel("LocalDataModel").setProperty("/true", false);
									this.getModel("LocalDataModel").setProperty("/PercentState", true);
								}
							},
							onSelectAuthP1: function (oEvent) {
								var oSelectedRadio = oEvent.getSource().getSelectedIndex();
								if (oSelectedRadio == 1) {
									this.getView().byId("idAuthorizationLinkForm").setProperty("visible", true);
									this.getView().byId("idAuthorizationForm").setProperty("visible", true);
									this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
									this.getModel("LocalDataModel").setProperty("/reCalculate", false);
									this.getView().byId("idClaimPrOpt").setProperty("visible", true);
									this.getView().byId("idParticiaptionTable").setProperty("visible", true);
									this.getView().byId("idDiscountTable").setProperty("visible", false);
									this.getModel("LocalDataModel").setProperty("/PercentState", false);
									this.getView().byId("idPricingOpt").setSelectedIndex(0);
								} else {
									this.getView().byId("idParticiaptionTable").setProperty("visible", false);
									this.getView().byId("idDiscountTable").setProperty("visible", true);
									this.getView().byId("idClaimPrOpt").setProperty("visible", false);
									this.getView().byId("idAuthorizationLinkForm").setProperty("visible", false);
									this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
									this.getModel("LocalDataModel").setProperty("/reCalculate", true);
									this.getModel("LocalDataModel").setProperty("/true", false);
									this.getModel("LocalDataModel").setProperty("/PercentState", true);
								}
							},
							onSelectAuthPricingOpt: function (oEvent) {
								var oSelectedRadio = oEvent.getSource().getSelectedIndex();
								if (oSelectedRadio == 1) {
									this.getView().byId("idAuthorizationForm").setProperty("visible", true);
									this.getView().byId("idParticiaptionTable").setProperty("visible", false);
									this.getView().byId("idDiscountTable").setProperty("visible", true);
								} else {
									this.getView().byId("idParticiaptionTable").setProperty("visible", true);
									this.getView().byId("idDiscountTable").setProperty("visible", false);
								}
							},

							onChangeClaimType: function (oEvent) {
								var oButton = oEvent.getSource();
								var oView = this.getView();
								var oDialog;
								this.getModel("ProssingModel").read("/zc_claim_groupSet", {
									urlParameters: {
										"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
									},
									success: $.proxy(function (data) {
										var oClaimData = data.results;

										var selectedClimTypes = oClaimData.filter(elm => (elm.ClaimGroup == "FAC" || elm.ClaimGroup == "WTY") && elm.TMCClaimType !=
											"ZACD" && elm.TMCClaimType != "ZAUT" && elm.TMCClaimType != "ZWAC");
										this.getModel("LocalDataModel").setProperty("/ChangableClmTypSet", selectedClimTypes);

										if (!oDialog) {
											oDialog = sap.ui.xmlfragment("zclaimProcessing.view.fragments.claimTypeListDialog",
												this);
											this.getView().addDependent(oDialog);
										}
										oDialog.open();
									}, this),
									error: function (err) {
										MessageToast.show(err);
									}

								});

							},

							_configDialog: function (oButton, oDialog) {
								// var sCustomConfirmButtonText = oButton.data("confirmButtonText");
								// oDialog.setConfirmButtonText(sCustomConfirmButtonText);

								// // Remember selections if required
								// var bRemember = !!oButton.data("remember");
								// oDialog.setRememberSelections(bRemember);

								// //add Clear button if needed
								// var bShowClearButton = !!oButton.data("showClearButton");
								// oDialog.setShowClearButton(bShowClearButton);

								// // Set growing property
								// var bGrowing = oButton.data("growing");
								// oDialog.setGrowing(bGrowing == "true");

								// // Set growing threshold
								// var sGrowingThreshold = oButton.data("threshold");
								// if (sGrowingThreshold) {
								// 	oDialog.setGrowingThreshold(parseInt(sGrowingThreshold));
								// }
								// // Set style classes
								// var sResponsiveStyleClasses =
								// 	"sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
								// var bResponsivePadding = !!oButton.data("responsivePadding");
								// oDialog.toggleStyleClass(sResponsiveStyleClasses, bResponsivePadding);

								// // clear the old search filter
								// oDialog.getBinding("items").filter([]);

								// // toggle compact style
								// syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
							},

							onSearch: function (oEvent) {
								var sValue = oEvent.getParameter("value");
								var oFilter = new Filter("TMCClaimType", sap.ui.model.FilterOperator.Contains, sValue);
								var oBinding = oEvent.getParameter("itemsBinding");
								oBinding.filter([oFilter]);
							},

							onDialogClose: function (oEvent) {
								var oBundle = this.getView().getModel("i18n").getResourceBundle();
								var aContexts = oEvent.getParameter("selectedContexts");
								var oflag = "changeclaimtype";
								if (aContexts && aContexts.length) {
									var bindObj = aContexts.map(function (oContext) {
										return oContext.getObject();
									})[0];

									if (
										(this.getModel("LocalDataModel").getProperty("/LabourPricingDataModel").length > 0 ||
											this.getModel("LocalDataModel").getProperty("/SubletPricingDataModel").length > 0) &&
										(bindObj.TMCClaimType == "ZWA2" || bindObj.TMCClaimType == "ZWP2")
									) {
										MessageToast.show(oBundle.getText("changeClmLabourSubletError"), {
											my: "center center",
											at: "center center"
										});
									} else if (
										(this.getModel("LocalDataModel").getProperty("/LabourPricingDataModel").length > 0 ||
											this.getModel("LocalDataModel").getProperty("/PricingDataModel").length > 0) && bindObj.TMCClaimType == "ZWMS"
									) {
										MessageToast.show(oBundle.getText("changeClmMSError"), {
											my: "center center",
											at: "center center"
										});
									} else if (
										this.getModel("LocalDataModel").getProperty("/PaintPricingDataModel").length > 0 && (bindObj.TMCClaimType != "ZWVE" && bindObj.TMCClaimType !=
											"ZGGW")
									) {
										MessageToast.show(oBundle.getText("changeVEError"), {
											my: "center center",
											at: "center center"
										});
									} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZACD" ||
										this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZAUT") {
										MessageToast.show(oBundle.getText("changeclaimnotallowed"), {
											my: "center center",
											at: "center center"
										});
									} else {

										//MessageToast.show(oBundle.getText("clmtypechangedto", [bindObj.TMCClaimType]) );

										MessageToast.show(
											oBundle.getText("clmtypechangedto", [bindObj.TMCClaimType]), {
												my: "center center",
												at: "center center"
											});

										var obj = {
											Clmno: this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum"),
											Clmty: this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
											updatedclmty: bindObj.TMCClaimType
										}

										// 	updatedclmty: bindObj.TMCClaimType,
										// clmgroup : 

										this.getModel("ProssingModel").create("/zc_claim_type_changeSet", obj, {
											success: $.proxy(function (res) {
												this.getModel("ProssingModel").read("/ZC_CLAIM_HEAD_NEW", {
													urlParameters: {
														"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "'"
													},
													success: $.proxy(function (sdata) {
														this.getView().getModel("HeadSetData").setProperty("/WarrantyClaimType", sdata.results[0].WarrantyClaimType);
														this.getView().getModel("HeadSetData").setData(sdata.results[0]);
														this._fnChangeClaimTYpe_sub(res.updatedclmty);
														PmpDataManager._fnStatusCheck(this);
														this._fnGetClaimTypeDescENFR();
														WarrantyDataManager._fnSrNumVisible(this, bindObj.ClaimGroup, this.getModel("LocalDataModel").getProperty(
															"/oClaimSelectedGroup"));

														this._fnSubletDropdown(sdata.results[0].WarrantyClaimType, sSelectedLocale);

													}, this)
												})

												this._fnUpdateClaim(oflag);
											}, this)
										})
									}
								} else {

									MessageToast.show(oBundle.getText("NoClmSelected"), {
										my: "center center",
										at: "center center"
									});
								}
								oEvent.getSource().getBinding("items").filter([]);

							},

							//for odometer lessthan 0

							changeOdo: function (oEvent) {
								var oval = oEvent.getSource().getValue();
								if (parseInt(oval) <= 0) {
									oEvent.getSource().setValue("");
								}

							},
							onClickFileName: function (oEvent) {
								var isProxy = "";
								if (window.document.domain == "localhost") {
									isProxy = "proxy";
								}

								window.open(isProxy +
									oEvent.getSource().getUrl(),
									'_blank');
							},
							onChangeSerialNumber: function (oEvent) {
								var oLength = oEvent.getSource().getValue().length;
								if (oLength < 5) {
									oEvent.getSource().setValue("");
								}
							},
							/* TODO: changes by Vikas -25-11-2022 for Handling special characters DMND0002868 --Changes Start */
							onOFPLiveChange: function (oEvent) {
								var sValue = oEvent.getParameter("value");
								var finalRes = sValue.replace(/[^\w\s]/gi, '').replace(/_/g, '');
								oEvent.getSource().setValue(finalRes);
							}
							/* TODO: changes by Vikas -15-11-2022 for Handling special characters --Changes end */

					});

			});