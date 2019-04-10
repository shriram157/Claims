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
	'sap/m/Button'
], function (Dialog, Label, MessageToast, Text, BaseController, base64, ValueState, Validator, Filter, Button) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.MainClaimSection", {
		onInit: function () {
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
				specialVinInd: false

			});
			this.getView().setModel(oDateModel, "DateModel");
			var oNodeModel = new sap.ui.model.json.JSONModel();
			oNodeModel.loadData(jQuery.sap.getModulePath("zclaimProcessing.utils", "/Nodes.json"));
			this.oUploadCollection = this.byId("UploadSupportingDoc");

			//Model data set for Header Links visibility as per User login
			console.log("HeaderLinksModel", sap.ui.getCore().getModel("HeaderLinksModel"));
			this.getView().setModel(sap.ui.getCore().getModel("HeaderLinksModel"), "HeaderLinksModel");
			//  this.oBreadcrumbs = this.byId("breadcrumbsSupportingDoc");

			// this.oUploadCollection.addEventDelegate({
			// 	onAfterRendering: function () {
			// 		var iCount = this.oUploadCollection.getItems().length;
			// 		this.oBreadcrumbs.setCurrentLocationText(this.getCurrentLocationText() + " (" + iCount + ")");
			// 	}.bind(this)
			// });

			// this.getView().setModel(oNodeModel, "ClaimModel");
			// this.bindUploadCollectionItems("ClaimModel>/items");
			this.setModel(this.getModel("ProductMaster"), "ProductMasterModel");
			this.setModel(this.getModel("ZVehicleMasterModel"), "ZVehicleMasterModel");
			this.setModel(this.getModel("ProssingModel"));
			var oProssingModel = this.getModel("ProssingModel");
			oProssingModel.read("/zc_claim_item_labourSet", {
				success: $.proxy(function (data) {

					this.getModel("LocalDataModel").setProperty("/LabourSetData", data.results);
				}, this),
				error: function () {}
			});

			oProssingModel.read("/zc_dmg_type_codesSet", {
				urlParameters: {
					"$filter": "LanguageKey eq 'E' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/DataTypeCode", data.results);
				}, this),
				error: function () {

				}
			});

			oProssingModel.read("/zc_dmg_area_codesSet", {
				urlParameters: {
					"$filter": "LanguageKey eq 'E' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/DataAreaCode", data.results);
				}, this),
				error: function () {

				}
			});

			oProssingModel.read("/zc_dmg_sevr_codesSet", {
				urlParameters: {
					"$filter": "LanguageKey eq 'E' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/DataSeverety", data.results);
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
				"TCIPer": ""
			});
			this.PercentData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(this.PercentData, "DataPercetCalculate");

			var SubletData = new sap.ui.model.json.JSONModel({
				"SubletCode": "",
				"InvoiceNo": "",
				"description": "",
				"Amount": "",
				"days": "",
				"brand": ""
			});
			SubletData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(SubletData, "SubletDataModel");

			var PaintData = new sap.ui.model.json.JSONModel({
				PaintPositionCode: ""
			});
			PaintData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(PaintData, "PaintDataModel");

			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRoutMatched, this);
			this.getModel("LocalDataModel").setProperty("/step01Next", false);

			this.ArrIndex = [];
			this.ArrIndexLabour = [];

			this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
			this.getView().getModel("DateModel").setProperty("/OdometerReq", true);

			var HeadSetData = new sap.ui.model.json.JSONModel();
			HeadSetData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(HeadSetData, "HeadSetData");

			sap.ui.getCore().attachValidationError(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.Error);
			});
			sap.ui.getCore().attachValidationSuccess(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.None);
			});
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
				"num": "70%",
				"okey": "70"
			}, {
				"num": "80%",
				"okey": "80"
			}, {
				"num": "90%",
				"okey": "90"
			}, {
				"num": "100%",
				"okey": "100"
			}];
			this.getModel("LocalDataModel").setProperty("/DataPercent", PercentData);
			this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
			this.getModel("LocalDataModel").setProperty("/reCalculate", false);
			this.getModel("LocalDataModel").setProperty("/PercentState", false);
			this.getModel("LocalDataModel").setProperty("/UploadEnable", false);

			this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
			//this.getView().byId("__picker0-inner").setEnabled(false);

		},

		_onRoutMatched: function (oEvent) {
			var oValidator = new Validator();
			oValidator.validate("");
			this.getModel("LocalDataModel").setProperty("/DataVinDetails", "");
			this.getModel("LocalDataModel").setProperty("/VehicleMonths", "");
			this.getView().byId("id_Date").setValueState("None");
			this.getView().byId("idPrInvDate").setValueState("None");
			this.getView().byId("idPreInvNum").setValueState("None");
			this.getView().byId("idOFP").setValueState("None");
			this.getView().byId("idFieldActionInput").setValueState("None");
			this.getView().byId("idT1Field").setValueState("None");
			this.getView().byId("idT2Field").setValueState("None");
			this.getView().byId("idDealerContact").setValueState("None");
			this.getDealer();
			var oProssingModel = this.getModel("ProssingModel");
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);
			//oProssingModel.refresh();
			var oClaim = oEvent.getParameters().arguments.claimNum;
			var oGroupDescription = oEvent.getParameters().arguments.oKey;
			var oClaimAuthType = oEvent.getParameters().arguments.oClaimGroup;
			var oClaimTypeDetail = oEvent.getParameters().arguments.oKey;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancekm"));
			var oClaimNav = oEvent.getParameters().arguments.oClaimNav;
			this.getModel("LocalDataModel").setProperty("/GroupDescriptionName", oGroupDescription);
			this.getModel("LocalDataModel").setProperty("/oFieldAction", oEvent.getParameters().arguments.oKey);
			this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaim);
			this.getModel("LocalDataModel").setProperty("/WarrantyClaimTypeGroup", oClaimAuthType);
			var oClaimSelectedGroup = oEvent.getParameters().arguments.oClaimGroup;

			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
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
								"'and DealerPer eq '00'and CustomerPer eq '00'and TCIPer eq '00'"
						},
						success: $.proxy(function (data) {
							this.getView().getModel("DataPercetCalculate").setData(data.results[0]);
							var ocust = parseInt(data.results[0].CustomerPer).toString();
							var odeal = parseInt(data.results[0].DealerPer).toString();
							var otci = parseInt(data.results[0].TCIPer).toString();
							this.getView().getModel("DataPercetCalculate").setProperty("/CustomerPer", ocust);
							this.getView().getModel("DataPercetCalculate").setProperty("/DealerPer", odeal);
							this.getView().getModel("DataPercetCalculate").setProperty("/TCIPer", otci);
						}, this)
					});

				} else {
					this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
					this.getModel("LocalDataModel").setProperty("/reCalculate", false);
					this.getModel("LocalDataModel").setProperty("/PercentState", false);
					this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);
					this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoAuthorization"));
					this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber") + " : " + oClaim);
				}

				this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaim);
				this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
				//this.getView().getModel("DateModel").setProperty("/enableTab", true);
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idFilter05").setProperty("enabled", true);
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idFilter07").setProperty("enabled", true);

				this.getView().getModel("DateModel").setProperty("/saveClaimSt", false);
				this.getView().getModel("DateModel").setProperty("/updateClaimSt", true);

				this.getView().byId("idFilter01").setProperty("enabled", true);
				this.getModel("LocalDataModel").setProperty("/oErrorSet", "");
				//this.getView().getModel("DateModel").setProperty("/oECPfields", false);
				var oECPModel = this.getOwnerComponent().getModel("EcpSalesModel");
				var oBusinessModel = this.getModel("ApiBusinessModel");
				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "' "
					},
					success: $.proxy(function (data) {
						var submissionType = data.results[0].WarrantyClaimSubType;

						var oPartner = data.results[0].Partner;

						oBusinessModel.read("/A_BusinessPartner", {
							urlParameters: {
								"$filter": "BusinessPartner eq '" + oPartner + "'"
							},
							success: $.proxy(function (sdata) {
								this.getModel("LocalDataModel").setProperty("/BPOrgName", sdata.results[0].OrganizationBPName1);
							}, this)
						});

						oProssingModel.read("/ZC_CLAIM_SUBLET_CODE", {
							urlParameters: {
								"$filter": "Clmty eq '" + data.results[0].WarrantyClaimType + "'"
							},
							success: $.proxy(function (subData) {
								this.getModel("LocalDataModel").setProperty("/ClaimSubletCodeModel", subData.results);

							}, this),
							error: function (err) {
								console.log(err);
							}
						});

						oProssingModel.read("/zc_get_operation_numberSet", {
							urlParameters: {
								"$filter": "CLMNO eq '" + oClaim + "' and VHVIN eq '" + data.results[0].ExternalObjectNumber + "' and Langu eq '" +
									sSelectedLocale.toUpperCase() + "'"
							},
							success: $.proxy(function (oPdata) {
								var oLabourArray = oPdata.results.filter(function (item) {

									return item.J_3GKATNRC[0] != "P";
									//return item.ItemKey[14] == "P";
								});
								this.getModel("LocalDataModel").setProperty("/SuggetionOperationList", oLabourArray);
								var oPaintData = oPdata.results.filter(function (item) {

									return item.J_3GKATNRC[0] == "P";
									//return item.ItemKey[14] == "P";
								});
								console.log(oPaintData);
								this.getModel("LocalDataModel").setProperty("/oPaintList", oPaintData);

							}, this),
							error: function () {
								console.log("Error");
							}
						});
					if(data.results[0].ExternalObjectNumber != ""){
						this.getView().byId("idRequestType").setSelectedIndex(0);
						oProssingModel.read("/zc_vehicle_informationSet", {
							urlParameters: {
								"$filter": "Vin eq '" + data.results[0].ExternalObjectNumber + "'",
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
						
					}else{
						
						this.getView().byId("idRequestType").setSelectedIndex(1);
					}

						if (oClaimTypeDetail == "ZECP") {
							this.getView().getModel("DateModel").setProperty("/oECPfields", true);

							oProssingModel.read("/zc_cliam_agreement", {
								urlParameters: {
									"$filter": "VIN eq '" + data.results[0].ExternalObjectNumber + "'"
								},
								success: $.proxy(function (agrData) {
									this.getModel("LocalDataModel").setProperty("/AgreementDataECP", agrData.results);
								}, this),
								error: function () {}
							});

							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
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
						} else if (oClaimTypeDetail == "ZWP2" || submissionType == "ZWP2") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", false);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", false);
							this.getView().getModel("DateModel").setProperty("/Labour", false);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/Authorization", true);
							this.getView().getModel("DateModel").setProperty("/oECPfields", false);
							this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);

							this.getView().getModel("DateModel").setProperty("/oPrevInvNumReq", true);
							this.getView().getModel("DateModel").setProperty("/oPrevInvDateReq", true);
							this.getView().getModel("DateModel").setProperty("/PreroOdometerVisible", false);
							this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
							this.getView().getModel("DateModel").setProperty("/P1p2", true);
							this.getView().getModel("DateModel").setProperty("/AcA1", false);
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
						} else if (oClaimTypeDetail == "ZWMS" || submissionType == "ZWMS") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
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
							this._fnClaimSumPercent();
						} else if (oClaimTypeDetail == "ZCSR" || oClaimTypeDetail == "ZCER" || oClaimTypeDetail == "ZCLS") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
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
						} else if (oClaimTypeDetail == "ZCWE") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Authorization", false);
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
						} else if (oClaimTypeDetail == "ZSSM" || oClaimTypeDetail == "ZSCR") {
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
						} else if (oClaimTypeDetail == "ZLDC") {
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
							this.getView().getModel("DateModel").setProperty("/Paint", false);
							this.getView().getModel("DateModel").setProperty("/Sublet", true);
							this.getView().getModel("DateModel").setProperty("/Labour", true);
							this.getView().getModel("DateModel").setProperty("/Parts", true);
							this.getView().getModel("DateModel").setProperty("/damageLine", true);
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
						} else {
							this.getView().getModel("DateModel").setProperty("/LabourBtnVsbl", true);
							this.getView().getModel("DateModel").setProperty("/oMainOps", true);
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
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
						} else if (data.results[0].ProcessingStatusOfWarrantyClm == "ZTAC") {
							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", true);
							this.getView().getModel("DateModel").setProperty("/updateEnable", false);
							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);
							this.getView().getModel("DateModel").setProperty("/damageLine", false);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);

						} else if (data.results[0].ProcessingStatusOfWarrantyClm == "ZTAA") {
							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", false);
							this.getView().getModel("DateModel").setProperty("/damageLine", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);
							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);}
						// } else if (data.results[0].ProcessingStatusOfWarrantyClm == "ZTMR") {
						// 	//sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "Dealer_Services_Manager"
						// 	this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
						// 	this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
						// 	this.getView().getModel("DateModel").setProperty("/damageLine", false);
						// 	this.getView().getModel("DateModel").setProperty("/updateEnable", false);
						// 	this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
						// 	this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
						// 	this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
						// 	this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
						// 	this.getView().getModel("DateModel").setProperty("/authAcClm", false);
						// 	this.getView().getModel("DateModel").setProperty("/authRejClm", false);
						// 	this.getView().getModel("DateModel").setProperty("/claimEditSt", true);
						// } 
						else if (data.results[0].ProcessingStatusOfWarrantyClm == "ZTMR" ) {
							//sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "Dealer_Services_Manager"
							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
							this.getView().getModel("DateModel").setProperty("/damageLine", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", false);
							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
							this.getView().getModel("DateModel").setProperty("/authAcClm", true);
							this.getView().getModel("DateModel").setProperty("/authRejClm", true);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", true);

						} else {
							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
							//this.getView().getModel("DateModel").setProperty("/updateEnable", false);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);
							this.getView().getModel("DateModel").setProperty("/damageLine", false);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
						}

						if (data.results[0].ProcessingStatusOfWarrantyClm == "ZTIC" && oClaimNav != "Inq"
						) {
							
							 
							//sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") != "Zone_User" && sap.ui.getCore().getModel(
							//	"UserDataModel").getProperty("/LoggedInUser") != "TCI_Admin"

							this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", true);
							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);
							this.getView().getModel("DateModel").setProperty("/damageLine", true);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", true);
						} else if (data.results[0].ProcessingStatusOfWarrantyClm == "ZTRC" && oClaimNav != "Inq") {
						//	sap.ui.getCore().getModel(	"UserDataModel").getProperty("/LoggedInUser") != "Zone_User" && sap.ui.getCore().getModel("UserDataModel").getProperty(
							//	"/LoggedInUser") != "TCI_Admin"
							this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
							this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
							this.getView().getModel("DateModel").setProperty("/damageLine", true);
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", true);
							this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
							this.getView().getModel("DateModel").setProperty("/updateEnable", true);
							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
							this.getView().getModel("DateModel").setProperty("/authAcClm", false);
							this.getView().getModel("DateModel").setProperty("/authRejClm", false);

						}

						this._fnDealerContact();
						this.onP2Claim(oClaimTypeDetail);
						this._fnOFPenabled();

					}, this),
					error: function () {}
				});

				oProssingModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'"
					},
					success: $.proxy(function (sdata) {
						//console.log(sdata);
						this.getModel("LocalDataModel").setProperty("/ClaimDetails", sdata.results[0]);
						this.getView().getModel("HeadSetData").setData(sdata.results[0]);
						this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", sdata.results[0].OfpDescription);
						this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", sdata.results[0].Main_opsDescription);

					}, this)
				});

				oProssingModel.read("/zc_claim_item_price_dataSet", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "' "

					},
					success: $.proxy(function (data) {
						oProssingModel.read("/zc_claim_item_damageSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'and LanguageKey eq 'E' "
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
										UnitOfMeasure: "EA",
										Amount: item.Amount,
										SubletDescription: item.SubletDescription,
										URI: item.URI,
										SubletType: item.ItemKey
									};

								});

								this.obj = {
									"DBOperation": "SAVE",
									"Message": "",
									"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
									"Partner": this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey"),
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
				if (oClaimSelectedGroup == "Authorization") {
					this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", true);

				} else {
					this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);
				}

			
				this.getModel("LocalDataModel").setProperty("/step01Next", false);
				this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
				this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", "");
				this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", "");
				oProssingModel.read("/ZC_CLAIM_GROUP", {
					urlParameters: {
						"$filter": "ClaimGroupDes eq 'WARRANTY'"
					},
					success: $.proxy(function (data) {
						var oResult = data.results;
						var oSubmissionData = oResult.filter(function (v, t) {
							return v.ALMClaimType != "ZACD" && v.ALMClaimType != "ZAUT";
						});

						oProssingModel.read("/ZC_CLAIM_GROUP", {
							urlParameters: {
								"$filter": "ClaimGroupDes eq 'FIELD ACTION'"
							},
							success: $.proxy(function (sdata) {
								//var oFieldAct = sdata.results;
								sdata.results.forEach(function (item) {
									oSubmissionData.push(item);
								});

								this.getModel("LocalDataModel").setProperty("/DataSubmissionClaim", oSubmissionData);
							}, this)
						});

					}, this)
				});

				this.getModel("LocalDataModel").setProperty("/DataItemDamageSet", "");
				if (oClaimAuthType == "Authorization") {
					this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoClaim"));
					this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIAuthNumber"));

					this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
					this.getModel("LocalDataModel").setProperty("/reCalculate", true);
					this.getModel("LocalDataModel").setProperty("/PercentState", true);
				} else {
					this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber"));
					this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoAuthorization"));
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
					"Partner": "",
					"PartnerRole": "",
					"ReferenceDate": "",
					"DateOfApplication": "",
					"FinalProcdDate": "",
					"Delivery": "",
					"DeliveryDate": "",
					"TCIWaybillNumber": "",
					"ShipmentReceivedDate": "",
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
					"PreviousROInvoiceDate": "",
					"PreviousROOdometer": "",
					"PreviousROInvoice": "",
					"AccessoryInstallOdometer": "",
					"AccessoryInstallDate": "",
					"AgreementNumber": "",
					"CustomerPostalCode": "",
					"CustomerFullName": ""
				});
				this.HeadSetData.setDefaultBindingMode("TwoWay");

				this.getModel("LocalDataModel").setProperty("/ClaimDetails", "");
				this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
				this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
				this.getView().getModel("DateModel").setProperty("/OdometerReq", true);
				this.obj = {
					"DBOperation": "SAVE",
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
					"PreviousROInvoiceDate": "",
					"PreviousROOdometer": "",
					"PreviousROInvoice": "",
					"AccessoryInstallOdometer": "",
					"AccessoryInstallDate": "",
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
				if (oGroupDescription == "WARRANTY") {
					oProssingModel.read("/ZC_CLAIM_GROUP", {
						urlParameters: {
							"$filter": "ClaimGroupDes eq 'WARRANTY'"
						},
						success: $.proxy(function (data) {

							var oResult = data.results;

							if (oClaimSelectedGroup == "Authorization") {
								this.oFilteredData = oResult.filter(function (v, t) {
									return v.ALMClaimType == "ZACD" || v.ALMClaimType == "ZAUT";
								});
								this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", true);
								this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
								this.getModel("LocalDataModel").setProperty("/reCalculate", true);
								this.getModel("LocalDataModel").setProperty("/PercentState", true);
							} else if (oClaimSelectedGroup == "Claim") {
								this.oFilteredData = oResult.filter(function (v, t) {
									return v.ALMClaimType != "ZACD" && v.ALMClaimType != "ZAUT";
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
				if (oGroupDescription == "FIELD ACTION") {
					oProssingModel.read("/ZC_CLAIM_GROUP", {
						urlParameters: {
							"$filter": "ClaimGroupDes eq 'FIELD ACTION'"
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
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
					this.getView().getModel("DateModel").setProperty("/Authorization", false);
					this.getView().getModel("DateModel").setProperty("/oECPfields", false);
					this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
					this.getView().getModel("DateModel").setProperty("/AcA1", false);
					this.getView().getModel("DateModel").setProperty("/P1p2", false);
				} else if (oGroupDescription == "SETR") {
					oProssingModel.read("/ZC_CLAIM_GROUP", {
						urlParameters: {
							"$filter": "ClaimGroupDes eq 'SETR'"
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
					this.getView().getModel("DateModel").setProperty("/Labour", true);
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", true);
					this.getView().getModel("DateModel").setProperty("/Authorization", false);
					this.getView().getModel("DateModel").setProperty("/oECPfields", false);
					this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
					this.getView().getModel("DateModel").setProperty("/AcA1", false);
					this.getView().getModel("DateModel").setProperty("/P1p2", false);
				} else {
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);

				}

				if (oGroupDescription == "ECP") {
					oProssingModel.read("/ZC_CLAIM_GROUP", {
						urlParameters: {
							"$filter": "ClaimGroupDes eq 'ECP'"
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
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
					this.getView().getModel("DateModel").setProperty("/Authorization", false);
					this.getView().getModel("DateModel").setProperty("/oECPfields", true);
					this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
					this.getView().getModel("DateModel").setProperty("/AcA1", false);
					this.getView().getModel("DateModel").setProperty("/P1p2", false);

				} else {
					this.getView().getModel("DateModel").setProperty("/oECPfields", false);
				}

				if (oGroupDescription == "CORE RETURN") {
					oProssingModel.read("/ZC_CLAIM_GROUP", {
						urlParameters: {
							"$filter": "ClaimGroupDes eq 'CORE RETURN'"
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
					this.getView().getModel("DateModel").setProperty("/oFieldActionInput", false);
					this.getView().getModel("DateModel").setProperty("/Authorization", false);
					this.getView().getModel("DateModel").setProperty("/oECPfields", false);
					this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", false);
					this.getModel("LocalDataModel").setProperty("/step01Next", false);
					this.getView().getModel("DateModel").setProperty("/AcA1", false);
					this.getView().getModel("DateModel").setProperty("/P1p2", false);
				}
				if (oGroupDescription == "VEHICLE LOGISTICS") {
					oProssingModel.read("/ZC_CLAIM_GROUP", {
						urlParameters: {
							"$filter": "ClaimGroupDes eq 'VEHICLE LOGISTICS'"
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
				} else {
					this.getView().getModel("DateModel").setProperty("/ShipmentVisible", false);
					this.getView().getModel("DateModel").setProperty("/LabourBtnVsbl", true);
					this.getView().getModel("DateModel").setProperty("/RepairdDetailVisible", true);
				}
				if (oGroupDescription == "CUSTOMER RELATIONS") {
					oProssingModel.read("/ZC_CLAIM_GROUP", {
						urlParameters: {
							"$filter": "ClaimGroupDes eq 'CUSTOMER RELATIONS'"
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
				}

				this._fnDealerContact();
				this._fnOFPenabled();
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
				this.getModel("LocalDataModel").getProperty("/oFieldAction") == "FIELD ACTION" ||
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

			} else if (this.getModel("LocalDataModel").getProperty("/oFieldAction") == "SETR" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSSE") {
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", false);
				this.getView().getModel("DateModel").setProperty("/enabledT1", false);
				this.getView().getModel("DateModel").setProperty("/enabledT2", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", false);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
			} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZCWE" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZCWE") {
				this.getView().getModel("DateModel").setProperty("/enabledT2", false);
				this.getView().getModel("DateModel").setProperty("/enabledT1", false);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", false);
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", true);
			} else {
				this.getView().getModel("DateModel").setProperty("/ofpEnabled", true);
				this.getView().getModel("DateModel").setProperty("/enabledT2", true);
				this.getView().getModel("DateModel").setProperty("/enabledT1", true);
				this.getView().getModel("DateModel").setProperty("/oBatteryTestEnable", true);
				this.getView().getModel("DateModel").setProperty("/ofpRequired", false);
			}

		},

		_fnDealerContact: function () {
			if (this.getModel("LocalDataModel").getProperty("/oFieldAction") == "VEHICLE LOGISTICS" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZLDC") {
				this.getView().getModel("DateModel").setProperty("/oDealerContactReq", true);
				this.getView().getModel("DateModel").setProperty("/enabledT2", false);
				this.getView().getModel("DateModel").setProperty("/enabledT1", false);
			} else {
				this.getView().getModel("DateModel").setProperty("/oDealerContactReq", false);
			}
		},

		onChangeDate: function (oEvent) {
			// var oDate = oEvent.getParameters().value.split("-");
			// var oMonth = parseInt(oDate[1]);
			// var oDay = parseInt(oDate[2]);
			// if(oMonth > 12 && oMonth < 1){

			// }
			// if(oDay > 31 && oDay < 1){

			// }
		},
		// formatDate : function(oval){
		// 	var oDate = "";
		// 	var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
		// 			pattern: "yyyy-MM-dd"
		// 		});

		// 	if(oval){
		// 		oDate = oDateFormat.format(oval);	
		// 	}else {
		// 		oDate = null;
		// 	}

		// 	return oDate;

		// },
		onAddComment: function (oEvent) {
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.ClaimComments", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},
		onEnterComment: function () {
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
					var oFinalText = oPrevComment + "\n" + oPartnerName + "(" + oDate + ") " + " : " + oText;
					this.getView().getModel("HeadSetData").setProperty("/HeadText", oFinalText);
					this.getView().getModel("HeadSetData").setProperty("/NewText", "");
					// console.log(oFinalText);
				}, this)
			});

		},
		onCloseComment: function (oEvent) {
			oEvent.getSource().getParent().getParent().getParent().getParent().getParent().close();
		},
		onSelectClaimTpe: function (oEvent) {
			// this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") = oEvent.getSource().getSelectedKey();
			// this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oKey = oEvent.getSource().getSelectedKey();
			if (oKey == "ZACD") {

			} else if (oKey == "ZAUT") {

			} else if (oKey == "ZGGW") {
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
			} else if (oKey == "ZWMS") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", true);
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
			} else if (oKey == "ZCER" || oKey == "ZCLS" || oKey == "ZCSR") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", true);
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", false);
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
			} else if (oKey == "ZCWE") {
				this.getView().getModel("DateModel").setProperty("/oMainOps", true);
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", false);
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
			}
			this.onP2Claim(oKey);

		},

		onSelectRequestType: function (oEvent) {
			var oIndex = oEvent.getSource().getSelectedIndex();
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);
			if (oIndex == 1) {
				this.getModel("LocalDataModel").setProperty("/DataVinDetails", "");
				this.getModel("LocalDataModel").setProperty("/VehicleMonths", "");
				
				this.getView().byId("idVinNum").setProperty("enabled", false);
				this.getView().byId("idVinNum").setRequired(false);
				this.getView().getModel("DateModel").setProperty("/OdometerReq", false);
				this.getView().getModel("HeadSetData").setProperty("/Odometer", "");
				this.getView().byId("idVinNum").setValue("");
				this.getView().getModel("HeadSetData").setProperty("/ExternalObjectNumber", "");

			} else {
				this.getView().byId("idVinNum").setProperty("enabled", true);
				this.getView().byId("idVinNum").setRequired(true);
				this.getView().getModel("DateModel").setProperty("/OdometerReq", true);
			}
		},

		onP2Claim: function (elm) {
			if (elm == "ZWP2") {
				this.getView().getModel("DateModel").setProperty("/DisableRadio", false);
				this.getView().getModel("DateModel").setProperty("/OdometerReq", false);
				this.getView().byId("idRequestType").setSelectedIndex(1);
			} else {
				this.getView().getModel("DateModel").setProperty("/DisableRadio", true);
				this.getView().getModel("DateModel").setProperty("/OdometerReq", true);
				this.getView().byId("idRequestType").setSelectedIndex(0);
			}
		},

		onEnterVIN: function (oEvent) {

			var oVin = oEvent.getParameters().value;
			var oProssingModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var oECPModel = this.getOwnerComponent().getModel("EcpSalesModel");
			oProssingModel.read("/zc_cliam_agreement", {
				urlParameters: {
					"$filter": "VIN eq '" + oVin + "'"
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/AgreementDataECP", data.results);
				}, this),
				error: function () {}
			});

			oProssingModel.read("/zc_vehicle_informationSet", {
				urlParameters: {
					"$filter": "Vin eq '" + oVin + "'",
					"$expand": "ZC_SPECIAL_HANDLINGVEHICLESET,ZC_WRITTENOFFVEHICLESET"
				},
				//"$expand": "ZC_SPECIAL_HANDLINGVEHICLESET, ZC_WRITTENOFFVEHICLESET"
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/DataVinDetails", data.results[0]);
					var oRepDate = this.getView().getModel("HeadSetData").getProperty("/RepairDate");
					var regTime = new Date(data.results[0].RegDate).getTime();
					var repTime = new Date(oRepDate).getTime();
					var oMonth = (regTime - repTime) / (1000 * 60 * 60 * 24 * 30);
					//parseFloat(oMonth).toFixed(2);
					this.getModel("LocalDataModel").setProperty("/VehicleMonths", Math.abs(oMonth.toFixed(1)));
					if (data.results[0].ForeignVIN == "YES") {
						this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancemiles"));
						this.getView().getModel("DateModel").setProperty("/foreignVinInd", true);
					} else {
						this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancekm"));
						this.getView().getModel("DateModel").setProperty("/foreignVinInd", false);

					}

					if (data.results[0].WrittenOff == "YES") {

						this.getView().getModel("DateModel").setProperty("/writtenOffInd", true);
					} else {

						this.getView().getModel("DateModel").setProperty("/writtenOffInd", false);

					}

					if (data.results[0].SpecialVINReview == "YES") {

						this.getView().getModel("DateModel").setProperty("/specialVinInd", true);
					} else {

						this.getView().getModel("DateModel").setProperty("/specialVinInd", false);

					}

					this.getModel("LocalDataModel").setProperty("/DataSpecialHandlingSet", data.results[0].ZC_SPECIAL_HANDLINGVEHICLESET.results);
					this.getModel("LocalDataModel").setProperty("/DataWrittenOffSet", data.results[0].ZC_WRITTENOFFVEHICLESET.results);
				}, this),
				error: function () {}
			});

			oProssingModel.read("/ZC_GET_FORE_VIN(p_vhvin='" + oVin + "')/Set", {
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

			// oProssingModel.read("/ZC_CLAIM_SPHL_WROF(p_vhvin='" + oVin + "',p_langu='E')/Set", {
			// 	success: $.proxy(function (data) {
			// 		this.getView().getModel("LocalDataModel").setProperty("/SPWROF", data.results);
			// 		if (data.results.length < 1) {

			// 			this.getView().getModel("HeadSetData").setProperty("/WrittenOffCode", "No");
			// 			this.getView().getModel("HeadSetData").setProperty("/SpecialVINReview", "No");
			// 		} else {
			// 			this.getView().getModel("HeadSetData").setProperty("/WrittenOffCode", "Yes");
			// 			this.getView().getModel("HeadSetData").setProperty("/SpecialVINReview", "Yes");
			// 		}
			// 	}, this),
			// 	error: function () {}
			// });

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
			if (elm) {
				var oNumTime = new Date(elm.valueOf() + elm.getTimezoneOffset() * 60000);
				var oTime = "\/Date(" + oNumTime.getTime() + ")\/";
				return oTime;
			} else {
				return null;
			}
		},

		_fnSaveClaim: function () {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("ProssingModel");
			var oCurrentDt = new Date();
			var oValidator = new Validator();
			var oValid = oValidator.validate(this.getView().byId("idClaimMainForm"));
			var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			// var oValid01 = oValidator.validate(this.getView().byId("idVehicleInfo"));
			var oValid02 = oValidator.validate(this.getView().byId("idpart01Form"));

			// 	if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == undefined) {
			// 	this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			// 	this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
			// 	this.getView().byId("idMainClaimMessage").setType("Error");
			// 	this.getView().getModel("DateModel").setProperty("/claimTypeState", "Error");
			// } 

			if (!oValid02 &&
				this.getView().getModel("DateModel").getProperty("/oFieldActionInput") == true &&
				this.getView().getModel("HeadSetData").getProperty("/FieldActionReference") == "" &&
				this.getView().getModel("HeadSetData").getProperty("/RepairDate") == undefined || this.getView().getModel("HeadSetData")
				.getProperty("/RepairDate") == "") {
				this.getModel("LocalDataModel").setProperty("/step01Next", false);
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("id_Date").setValueState("Error");
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idFieldActionInput").setValueState("Error");
				//this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
				return false;

			} else if (!oValid02 &&
				this.getView().getModel("DateModel").getProperty("/oFieldActionInput") == true &&
				this.getView().getModel("HeadSetData").getProperty("/FieldActionReference") == "" &&
				this.getView().getModel("DateModel").getProperty("/ofpRequired") == true &&
				this.getView().getModel("HeadSetData").getProperty("/OFP") == "" &&
				this.getView().getModel("HeadSetData").getProperty("/RepairDate") == undefined || this.getView().getModel("HeadSetData")
				.getProperty("/RepairDate") == "") {
				this.getModel("LocalDataModel").setProperty("/step01Next", false);
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("id_Date").setValueState("Error");
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idFieldActionInput").setValueState("Error");
				this.getView().byId("idOFP").setValueState("Error");
				//this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
				return false;

			} else if (!oValid02 && this.getView().getModel("DateModel").getProperty("/enabledT1") == true &&
				this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes") == "" &&
				this.getView().getModel("DateModel").getProperty("/enabledT2") == true &&
				this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes") == "" &&
				this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoice") == "" && this.getView().getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") == "ZWP2" &&
				this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoiceDate") == ""
			) {
				this.getModel("LocalDataModel").setProperty("/step01Next", false);
				//do something additional to drawing red borders? message box?
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idT2Field").setValueState("Error");
				this.getView().byId("idT1Field").setValueState("Error");
				this.getView().byId("id_Date").setValueState("Error");
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idPrInvDate").setValueState("Error");
				this.getView().byId("idPreInvNum").setValueState("Error");
				//this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
				return false;
			} else if (!oValid02 && this.getView().getModel("DateModel").getProperty("/enabledT1") == true &&
				this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes") == "" &&
				this.getView().getModel("DateModel").getProperty("/enabledT2") == true &&
				this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes") == "" &&
				this.getView().getModel("DateModel").getProperty("/AcA1") == true &&
				this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallDate") == ""
			) {
				this.getModel("LocalDataModel").setProperty("/step01Next", false);

				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idT2Field").setValueState("Error");
				this.getView().byId("idT1Field").setValueState("Error");
				this.getView().byId("id_Date").setValueState("Error");
				this.getView().byId("idAccDate").setValueState("Error");
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");

				//this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
				return false;
			} else if (!oValid02 && this.getView().getModel("DateModel").getProperty("/enabledT1") == true &&
				this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes") == "" &&
				this.getView().getModel("DateModel").getProperty("/enabledT2") == true &&
				this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes") == ""
			) {
				this.getModel("LocalDataModel").setProperty("/step01Next", false);

				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idT2Field").setValueState("Error");
				this.getView().byId("idT1Field").setValueState("Error");
				this.getView().byId("id_Date").setValueState("Error");
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");

				//this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
				return false;
			} else if (!oValid02) {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				return false;
			} else if (this.getView().getModel("HeadSetData").getProperty("/RepairDate") == undefined || this.getView().getModel("HeadSetData")
				.getProperty("/RepairDate") == "") {
				this.getView().byId("id_Date").setValueState("Error");
			} else if (this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoice") == "" && this.getView().getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") == "ZWP2") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idPreInvNum").setValueState("Error");
			} else if (this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoiceDate") == "" && this.getView().getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") == "ZWP2") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idPrInvDate").setValueState("Error");
			} else if (this.getView().getModel("DateModel").getProperty("/enabledT1") == true &&
				this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes") == "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idT1Field").setValueState("Error");
			} else if (this.getView().getModel("DateModel").getProperty("/oDealerContactReq") == true &&
				this.getView().getModel("HeadSetData").getProperty("/DealerContact") == "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idDealerContact").setValueState("Error");
			} else if (this.getView().getModel("DateModel").getProperty("/enabledT2") == true &&
				this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes") == "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idT2Field").setValueState("Error");
			} else if (this.getView().getModel("DateModel").getProperty("/oFieldActionInput") == true &&
				this.getView().getModel("HeadSetData").getProperty("/FieldActionReference") == "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idFieldActionInput").setValueState("Error");
			} else if (this.getView().getModel("DateModel").getProperty("/ofpRequired") == true &&
				this.getView().getModel("HeadSetData").getProperty("/OFP") == "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idOFP").setValueState("Error");
			} else if (this.oText == "false") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseEnterValidVIN"));
				this.getView().byId("idMainClaimMessage").setType("Error");
			} else {
				this.getView().byId("id_Date").setValueState("None");
				this.getView().byId("idPrInvDate").setValueState("None");
				this.getView().byId("idPreInvNum").setValueState("None");
				this.getView().byId("idT2Field").setValueState("None");
				this.getView().byId("idT1Field").setValueState("None");
				this.getView().byId("idOFP").setValueState("None");
				this.getView().byId("idDealerContact").setValueState("None");
				this.getView().byId("idFieldActionInput").setValueState("None");
				var oActionCode = "";
				if (this.getView().getModel("DateModel").getProperty("/oztac") == true) {
					oActionCode = "ZTEA";
				} else {
					oActionCode = "";
				}
				this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
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

				var oPartner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");

				var oBusinessModel = this.getModel("ApiBusinessModel");
				oBusinessModel.read("/A_BusinessPartner", {
					urlParameters: {
						"$filter": "BusinessPartner eq '" + oPartner + "'"
					},
					success: $.proxy(function (data) {
						this.getModel("LocalDataModel").setProperty("/BPOrgName", data.results[0].OrganizationBPName1);
					}, this)
				});
				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
						this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);
						this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
						MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"));

						this.getView().getModel("DateModel").setProperty("/saveClaimSt", false);
						this.getView().getModel("DateModel").setProperty("/updateClaimSt", true);
						this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
						this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
						this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", true);
						this._fnClaimSum();
						this._fnClaimSumPercent();
						oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "'"
							},
							success: $.proxy(function (sdata) {
								//console.log(sdata);
								this.getModel("LocalDataModel").setProperty("/ClaimDetails", sdata.results[0]);
								this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", sdata.results[0].OfpDescription);
								this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", sdata.results[0].Main_opsDescription);
								this.getView().getModel("HeadSetData").setData(sdata.results[0]);
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
										"$filter": "Clmty eq '" + sdata.results[0].WarrantyClaimType + "'"
									},
									success: $.proxy(function (subData) {
										this.getModel("LocalDataModel").setProperty("/ClaimSubletCodeModel", subData.results);

									}, this),
									error: function (err) {
										console.log(err);
									}
								});

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

						// this.getView().getModel("HeadSetData").setProperty("/RepairOrderNumberExternal", "");
						// this.getView().getModel("HeadSetData").setProperty("/OFP", "");
						// this.getView().getModel("HeadSetData").setProperty("/WarrantyClaimType", "");
						// this.getView().getModel("HeadSetData").setProperty("/RepairDate", "");
						// this.getView().getModel("HeadSetData").setProperty("/HeadText", "");
						// this.getView().getModel("HeadSetData").setProperty("/DealerContact", "");
						// this.getView().getModel("HeadSetData").setProperty("/ExternalObjectNumber", "");
						// this.getView().getModel("HeadSetData").setProperty("/ExternalNumberOfClaim", "");
						// this.getView().getModel("HeadSetData").setProperty("/FieldActionReference", "");
						// this.getView().getModel("HeadSetData").setProperty("/ZCondition", "");
						// this.getView().getModel("HeadSetData").setProperty("/Cause", "");
						// this.getView().getModel("HeadSetData").setProperty("/Remedy", "");
						this.getModel("LocalDataModel").setProperty("/CancelEnable", true);

					}, this),
					error: function (err) {
						console.log(err);
					}
				});
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
				this.getModel("LocalDataModel").setProperty("/step01Next", true);
			}
		},
		onSaveClaim: function (oEvent) {
			this._fnSaveClaim();
		},
		onCancelClaim: function () {
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
									this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);

									oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
										urlParameters: {
											"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
												"'"
										},
										success: $.proxy(function (sdata) {
											this.getView().getModel("HeadSetData").setProperty("/ProcessingStatusOfWarrantyClm", sdata.results[0].ProcessingStatusOfWarrantyClm);
										}, this)
									});
									MessageToast.show(oBundle.getText("Claimcancelledsuccessfully"));
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
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oClaimModel = this.getModel("ProssingModel");
			var obj = {
				NumberOfWarrantyClaim: oClaimNum,
				DBOperation: "ZADR"

			};
			oClaimModel.update("/zc_headSet(NumberOfWarrantyClaim='" + oClaimNum + "')", obj, {
				method: "PUT",
				success: $.proxy(function (response) {
					this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
					this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
					this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
					this.getView().getModel("DateModel").setProperty("/updateEnable", false);
					this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
					this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
					this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
					oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
								"'"
						},
						success: $.proxy(function (sdata) {
							this.getView().getModel("HeadSetData").setProperty("/ProcessingStatusOfWarrantyClm", sdata.results[0].ProcessingStatusOfWarrantyClm);
							MessageToast.show(oBundle.getText("Authorizationapprovedsuccessfully"));
						}, this)
					});
				}, this)
			});
		},
		onRejectClaim: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oClaimModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var obj = {
				NumberOfWarrantyClaim: oClaimNum,
				DBOperation: "ZTCM"

			};
			oClaimModel.update("/zc_headSet(NumberOfWarrantyClaim='" + oClaimNum + "')", obj, {
				method: "PUT",
				success: $.proxy(function (response) {
					this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
					this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
					this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
					this.getView().getModel("DateModel").setProperty("/updateEnable", false);
					this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
					this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
					this.getView().getModel("DateModel").setProperty("/copyClaimEnable", false);
					oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
								"'"
						},
						success: $.proxy(function (sdata) {
							this.getView().getModel("HeadSetData").setProperty("/ProcessingStatusOfWarrantyClm", sdata.results[0].ProcessingStatusOfWarrantyClm);
							MessageToast.show(oBundle.getText("AuthorizationRejected"));
						}, this)
					});
				}, this)
			});
		},

		_fnUpdateClaim: function () {
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oValidator = new Validator();
			var oValid = oValidator.validate(this.getView().byId("idClaimMainForm"));
			var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			// var oValid01 = oValidator.validate(this.getView().byId("idVehicleInfo"));
			var oValid02 = oValidator.validate(this.getView().byId("idpart01Form"));
			// var oCurrentDt = new Date();

			var oPartner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");

			var oBusinessModel = this.getModel("ApiBusinessModel");
			oBusinessModel.read("/A_BusinessPartner", {
				urlParameters: {
					"$filter": "BusinessPartner eq '" + oPartner + "'"
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/BPOrgName", data.results[0].OrganizationBPName1);
				}, this)
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

			oClaimModel.read("/zc_claim_item_price_dataSet", {
				urlParameters: {
					"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "' "

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
							UnitOfMeasure: "EA",
							Amount: item.Amount,
							SubletDescription: item.SubletDescription,
							URI: item.URI,
							SubletType: item.ItemKey
						};

					});

					this.obj = {
						"DBOperation": "SAVE",
						"Message": "",
						"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
						"Partner": this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey"),
						"ActionCode": oActionCode,
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
						"TCIWaybillNumber": "",
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
						"zc_claim_vsrSet": {
							"results": []
						},
						"zc_claim_item_price_dataSet": {
							"results": pricinghData
						}
					};
					if (this.oText == "false") {
						this.getView().byId("idMainClaimMessage").setProperty("visible", true);
						this.getView().byId("idMainClaimMessage").setText("Please Enter a Valid VIN.");
						this.getView().byId("idMainClaimMessage").setType("Error");
					} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == undefined) {
						this.getView().byId("idMainClaimMessage").setProperty("visible", true);
						this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
						this.getView().byId("idMainClaimMessage").setType("Error");
						this.getView().getModel("DateModel").setProperty("/claimTypeState", "Error");
					} else if (this.getView().getModel("HeadSetData").getProperty("/RepairDate") == undefined || this.getView().getModel(
							"HeadSetData")
						.getProperty("/RepairDate") == "") {
						this.getView().byId("id_Date").setValueState("Error");
					} else if (this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoice") == "" && this.getView().getModel(
							"HeadSetData").getProperty("/WarrantyClaimType") == "ZWP2") {
						this.getView().byId("idMainClaimMessage").setProperty("visible", true);
						this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
						this.getView().byId("idMainClaimMessage").setType("Error");
						this.getView().byId("idPreInvNum").setValueState("Error");
					} else if (this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoiceDate") == "" && this.getView().getModel(
							"HeadSetData").getProperty("/WarrantyClaimType") == "ZWP2") {
						this.getView().byId("idMainClaimMessage").setProperty("visible", true);
						this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
						this.getView().byId("idMainClaimMessage").setType("Error");
						this.getView().byId("idPrInvDate").setValueState("Error");
					} else if (this.getView().getModel("DateModel").getProperty("/enabledT1") == true &&
						this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes") == "") {
						this.getView().byId("idMainClaimMessage").setProperty("visible", true);
						this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
						this.getView().byId("idMainClaimMessage").setType("Error");
						this.getView().byId("idT1Field").setValueState("Error");
					} else if (this.getView().getModel("DateModel").getProperty("/oDealerContactReq") == true &&
						this.getView().getModel("HeadSetData").getProperty("/DealerContact") == "") {
						this.getView().byId("idMainClaimMessage").setProperty("visible", true);
						this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
						this.getView().byId("idMainClaimMessage").setType("Error");
						this.getView().byId("idDealerContact").setValueState("Error");
					} else if (this.getView().getModel("DateModel").getProperty("/enabledT2") == true &&
						this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes") == "") {
						this.getView().byId("idMainClaimMessage").setProperty("visible", true);
						this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
						this.getView().byId("idMainClaimMessage").setType("Error");
						this.getView().byId("idT2Field").setValueState("Error");
					} else if (this.getView().getModel("DateModel").getProperty("/oFieldActionInput") == true &&
						this.getView().getModel("HeadSetData").getProperty("/FieldActionReference") == "") {
						this.getView().byId("idMainClaimMessage").setProperty("visible", true);
						this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
						this.getView().byId("idMainClaimMessage").setType("Error");
						this.getView().byId("idFieldActionInput").setValueState("Error");
					} else if (this.getView().getModel("DateModel").getProperty("/ofpRequired") == true &&
						this.getView().getModel("HeadSetData").getProperty("/OFP") == "") {
						this.getView().byId("idMainClaimMessage").setProperty("visible", true);
						this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
						this.getView().byId("idMainClaimMessage").setType("Error");
						this.getView().byId("idOFP").setValueState("Error");
					} else if (!oValid02) {
						this.getModel("LocalDataModel").setProperty("/step01Next", false);
						//do something additional to drawing red borders? message box?
						this.getView().byId("idMainClaimMessage").setProperty("visible", true);
						this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
						this.getView().byId("idMainClaimMessage").setType("Error");
						this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
						return false;
					} else {
						this.getView().byId("idMainClaimMessage").setProperty("visible", false);
						this.getView().byId("idMainClaimMessage").setText("");
						this.getView().byId("idMainClaimMessage").setType("None");
						this.getView().byId("idOFP").setValueState("None");
						this.getView().byId("idFieldActionInput").setValueState("None");
						this.getView().byId("idT2Field").setValueState("None");
						this.getView().byId("idT1Field").setValueState("None");
						this.getView().byId("idPreInvNum").setValueState("None");
						oClaimModel.refreshSecurityToken();
						oClaimModel.create("/zc_headSet", this.obj, {

							success: $.proxy(function (response) {
								this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.OFPDescription);
								this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.MainOpsCodeDescription);
								this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
								MessageToast.show(oBundle.getText("ClaimUpdatedsuccessfully"));
								this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
							}, this),
							error: function () {

							}
						});
					}

				}, this),
				error: function () {}
			});

		},
		onUpdateClaim: function () {
			this._fnUpdateClaim();
		},

		onEditClaim: function (e) {
			//var that = this;
			var dialog = new Dialog({
				title: "Edit Claim",
				type: "Message",
				content: new Text({
					text: "Claim is ACCEPTED, Do you still want to EDIT the ACCEPTED claim?"
				}),

				buttons: [
					new Button({
						text: "Yes",
						press: $.proxy(function () {
							this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
							this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
							this.getView().getModel("DateModel").setProperty("/updateEnable", true);
							this.getView().getModel("DateModel").setProperty("/copyClaimEnable", true);
							this.getView().getModel("DateModel").setProperty("/oztac", true);
							this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
							var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
							var oClaimModel = this.getModel("ProssingModel");
							var obj = {
								NumberOfWarrantyClaim: oClaimNum,
								DBOperation: "ZTEA"
							};
							oClaimModel.update("/zc_headSet(NumberOfWarrantyClaim='" + oClaimNum + "')", obj, {
								method: "PUT",
								success: $.proxy(function (response) {
									oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
										urlParameters: {
											"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
												"'"
										},
										success: $.proxy(function (sdata) {
											this.getView().getModel("HeadSetData").setProperty("/ProcessingStatusOfWarrantyClm", sdata.results[0].ProcessingStatusOfWarrantyClm);
										}, this)
									});
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
				MessageToast.show(oBundle.getText("PleaseSaveClaimtryAttachments"));
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
			MessageToast.show(oBundle.getText("FileSizeExceed"));
		},
		onUploadComplete: function (oEvent) {

			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var fileType = this.oUploadedFile.type;
			var oUploadedFileArr = this.oUploadedFile.name.split(".").reverse();
			var oFileExt = oUploadedFileArr[0].length;
			var oFileName = "";
			//oFileName = this.oUploadedFile.name.replace("." + oFileExt, "");

			if (oFileExt > 3) {
				oFileName = this.oUploadedFile.name.slice(0, -1);
			} else {
				oFileName = this.oUploadedFile.name;
			}

			var fileNamePrior = "HEAD@@@" + oFileName;
			var fileName = fileNamePrior.toUpperCase();
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
					this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", resp