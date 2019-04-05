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
				oDealerContactReq: false
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
								"$filter": "CLMNO eq '" + oClaim + "' and VHVIN eq '" + data.results[0].ExternalObjectNumber + "' and Langu eq '" + sSelectedLocale.toUpperCase() + "'"
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

						oProssingModel.read("/zc_vehicle_informationSet", {
							urlParameters: {
								"$filter": "Vin eq '" + data.results[0].ExternalObjectNumber + "'",
								"$expand": "ZC_SPECIAL_HANDLINGVEHICLESET,ZC_WRITTENOFFVEHICLESET"
							},
							success: $.proxy(function (vehData) {
								this.getModel("LocalDataModel").setProperty("/DataVinDetails", vehData.results[0]);
								if (data.results[0].ForeignVIN == "YES") {
									this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancemiles"));
								} else {
									this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancekm"));
								}
								this.getModel("LocalDataModel").setProperty("/DataSpecialHandlingSet", vehData.results[0].ZC_SPECIAL_HANDLINGVEHICLESET
									.results);
								this.getModel("LocalDataModel").setProperty("/DataWrittenOffSet", vehData.results[0].ZC_WRITTENOFFVEHICLESET.results);
							}, this),
							error: function () {}
						});

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
						} else if (oClaimTypeDetail == "ZWP2" || submissionType == "ZWP2") {
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
							this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", false);
						} else if (data.results[0].ProcessingStatusOfWarrantyClm == "ZTMR") {
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

						if (data.results[0].ProcessingStatusOfWarrantyClm == "ZTIC" && oClaimNav != "Inq") {
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

				this.getModel("LocalDataModel").setProperty("/DataVinDetails", "");
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
			if (oIndex == 1) {
				this.getView().byId("idVinNum").setProperty("enabled", false);
				this.getView().byId("idVinNum").setRequired(false);
				this.getView().getModel("DateModel").setProperty("/OdometerReq", false);
				this.getView().getModel("HeadSetData").setProperty("/Odometer", "");
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
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/DataVinDetails", data.results[0]);
					if (data.results[0].ForeignVIN == "YES") {
						this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancemiles"));
					} else {
						this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancekm"));
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
					this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.OFPDescription);
					this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.MainOpsCodeDescription);
					MessageToast.show(oBundle.getText("SuccesFullyUploaded"));
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
			// var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oSubletType = this.getView().getModel("SubletDataModel").getProperty("/SubletCode");
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
			var fileNamePrior = oSubletType + "@@@" + oFileName;
			var fileName = fileNamePrior.toUpperCase();
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
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

					MessageToast.show(oBundle.getText("SuccesFullyUploaded"));
					//	var oFileName = "sub" + fileName;
					oClaimModel.read("/zc_claim_subletattachmentSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'SUBL' and FileName eq'" + fileName + "'"
						},
						success: $.proxy(function (subletData) {
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

		},

		// onSelectUpload: function (oEvent) {
		// 	console.log(OEvent);
		// },
		// onClickURISublet: function (oEvent) {
		// 	console.log(oEvent)
		// },
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
					MessageToast.show(oBundle.getText("Filedeletedsuccessfully"));
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
					MessageToast.show(oBundle.getText("Filedeletedsuccessfully"));
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
						}, this)
					});
				}, this)
			});
		},
		// deleteItemById: function (sItemToDeleteId, mModel) {
		// 	var sCurrentPath = this.getCurrentFolderPath();
		// 	var oData = this.getView().getModel(mModel).getProperty(sCurrentPath);
		// 	var aItems = oData && oData.items;
		// 	jQuery.each(aItems, function (index) {
		// 		if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
		// 			aItems.splice(index, 1);
		// 		}
		// 	});
		// 	this.getView().getModel(mModel).setProperty(sCurrentPath + "/items", aItems);
		// },

		// uploadCollectionItemFactory: function (id, context) {
		// 	var oItem = new sap.m.UploadCollectionItem(id, {
		// 		documentId: "{ClaimModel>DOC_ID}",
		// 		fileName: "{ClaimModel>FileName}",
		// 		mimeType: "{ClaimModel>MIMETYPE}",
		// 		thumbnailUrl: "{ClaimModel>url}",
		// 		url: "{ClaimModel>URI}"
		// 	});

		// 	if (context.getProperty("type") === "folder") {
		// 		oItem.attachPress(this.onFolderPress, this);
		// 		oItem.attachDeletePress(this.onFolderDeletePress, this);
		// 		oItem.setAriaLabelForPicture("Folder");
		// 	}
		// 	return oItem;
		// },
		// bindUploadCollectionItems: function (path) {
		// 	this.oUploadCollection.bindItems({
		// 		path: path,
		// 		factory: this.uploadCollectionItemFactory.bind(this)
		// 	});
		// },
		// getCurrentLocationText: function () {
		// 	// Remove the previously added number of items from the currentLocationText in order to not show the number twice after rendering.
		// 	var sText = this.oBreadcrumbs.getCurrentLocationText().replace(/\s\([0-9]*\)/, "");
		// 	return sText;
		// },

		onFieldActionInput: function (oEvent) {
			var FieldAction = oEvent.getParameters().value.toUpperCase();

			this.getView().getModel("HeadSetData").setProperty("/FieldActionReference", FieldAction);
		},

		onPressAddPart: function () {
			this.getView().getModel("DateModel").setProperty("/partLine", true);
		},
		onPressAddLabour: function () {
			this.getView().getModel("DateModel").setProperty("/labourLine", true);
		},
		onPressAddPaint: function () {
			this.getView().getModel("DateModel").setProperty("/paintLine", true);
		},
		onPressAddSublet: function () {
			this.getView().getModel("DateModel").setProperty("/subletLine", true);
		},
		onPressRecalculate: function () {
			var oCustomerPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/CustomerPer"));
			var oDealerPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/DealerPer"));
			var oTciPer = parseInt(this.getView().getModel("DataPercetCalculate").getProperty("/TCIPer"));
			var oAuthNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			if ((oCustomerPer + oDealerPer + oTciPer) > 100) {
				//console.log("The Sum of percent should be within 100%");
				MessageToast.show(oBundle.getText("TheSumpercentwithin100"));
			} else {
				var oClaimModel = this.getModel("ProssingModel");
				oClaimModel.read("/zc_authorizationSet", {
					urlParameters: {
						"$filter": "DBOperation eq 'POST'and AuthorizationNumber eq '" + oAuthNum + "'and DealerPer eq '" + oDealerPer +
							"'and CustomerPer eq '" + oCustomerPer +
							"'and TCIPer eq '" + oTciPer + "'"
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
			}

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

			//HeadSetData>/NumberOfWarrantyClaim
			var oClaimType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oClaimModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimGroup = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			var oAuthNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			if (oAuthNum != "" && oAuthNum != undefined) {
				if (oClaimType == "ZAUT" || oClaimType == "ZACD") {

					oClaimModel.read("/zc_auth_copy_to_claimSet(NumberOfAuth='" + oAuthNum + "')", {

						success: $.proxy(function (data) {
							var oClaimNum = data.NumberOfWarrantyClaim;
							this.getView().getModel("DateModel").setProperty("/warrantySubmissionClaim", false);
							oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
								urlParameters: {
									"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'"
								},
								success: $.proxy(function (cdata) {
									this.getView().getModel("HeadSetData").setData(cdata.results[0]);
									this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaimNum);
									this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIClaimNumber") + " : " +
										oClaimNum);

									this.getModel("LocalDataModel").setProperty("/linkToAuth", true);
									this.getModel("LocalDataModel").setProperty("/reCalculate", false);
									this.getModel("LocalDataModel").setProperty("/PercentState", false);
									this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoAuthorization"));
								}, this)
							});
						}, this),
						error: function (error) {
							MessageToast.show(JSON.parse(error.responseText).error.message.value);
						}

					});

				} else if (oClaimType != "ZAUT" || oClaimType != "ZACD") {

					oClaimModel.read("/zc_claim_copy_to_authSet(NumberOfWarrantyClaim='" + oAuthNum + "')", {

						success: $.proxy(function (data) {
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
							oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
								urlParameters: {
									"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'"
								},
								success: $.proxy(function (cdata) {
									this.getView().getModel("HeadSetData").setData(cdata.results[0]);
									this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaimNum);
									this.getModel("LocalDataModel").setProperty("/WarrantyClaimNumber", oBundle.getText("TCIAuthNumber") + " : " +
										oClaimNum);
									this.getModel("LocalDataModel").setProperty("/linkToAuth", false);
									this.getModel("LocalDataModel").setProperty("/reCalculate", true);
									this.getModel("LocalDataModel").setProperty("/PercentState", true);
									this.getModel("LocalDataModel").setProperty("/copyClaimAuthText", oBundle.getText("CopytoClaim"));
								}, this)
							});
						}, this),
						error: function (error) {
							MessageToast.show(JSON.parse(error.responseText).error.message.value);
						}
					});
				}
			} else {
				MessageToast.show(oBundle.getText("PleasecreateclaimNumber"));
			}

		},
		onPressLinkAuthorization: function () {
			var oProssingModel = this.getModel("ProssingModel");
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
					"$filter": "DBOperation eq 'LINK'and AuthorizationNumber eq '" + oClaim +
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

					if (data.results[0].Message != "") {
						MessageToast.show(data.results[0].Message);
					}
				}, this)
			});
		},
		onStep01Next: function (oEvent) {

			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimType") != "ZWA2" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" && this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimSubType") != "ZWA2" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC" &&
				this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" &&

				this.getView().getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "ZSSE" &&
				this.getModel("LocalDataModel").getProperty("/oFieldAction") != "FIELD ACTION" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZECP" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCSR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCER" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCWE" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCLS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSCR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSSM" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZLDC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZRCR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCER" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCLS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCSR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCWE"
			) {
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
			} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWMS" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWMS" || this.getModel("LocalDataModel").getProperty(
					"/GroupDescriptionName") === "CUSTOMER RELATIONS" || this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") ===
				"ZRCR") {
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
			} else {
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
			}

		},

		onStep02Next: function () {

			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA2" && this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimSubType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA2" &&
				this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC") {
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
			}
		},
		onStep02Back: function () {
			this.getView().byId("idFilter01").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
		},

		onStep03Next: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oOFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWP2" || this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimSubType") == "ZWP2") {
				this.getView().byId("idFilter07").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
			} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSCR" || this.getView().getModel(
					"HeadSetData").getProperty(
					"/WarrantyClaimType") == "ZSSM") {
				this.getView().byId("idFilter07").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
			} else {
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
			}
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
				error: function () {
					console.log("Error");
				}
			});

			// oProssingModel.read("/zc_get_operation_numberSet", {
			// 	urlParameters: {
			// 		"$filter": "CLMNO eq '" + oClaimNum + "' "
			// 	},
			// 	success: $.proxy(function (data) {
			// 		this.getModel("LocalDataModel").setProperty("/SuggetionOperationList", data.results);
			// 	}, this),
			// 	error: function () {
			// 		console.log("Error");
			// 	}
			// });

			oProssingModel.read("/zc_get_suggested_operationsSet", {
				urlParameters: {
					"$filter": "CLMNO eq '" + oClaimNum + "'and OFP_GROUP eq '" + oOFP + "' and VHVIN eq '" + oVin + "' and Langu eq '" + sSelectedLocale.toUpperCase() + "'"
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/SuggetionOperationListFiltered", data.results);
				}, this),
				error: function () {
					console.log("Error");
				}
			});

		},
		onStep03Back: function () {
			if (
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA1" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA2" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA1" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA2" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC" &&
				this.getModel("LocalDataModel").getProperty("/oFieldAction") != "FIELD ACTION" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZECP" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCSR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCER" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCWE" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZCLS" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCSR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCER" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCWE" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZCLS" &&

				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSCR" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZLDC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZSSM") {
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
			} else {
				this.getView().byId("idFilter01").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
			}
		},

		onStep04Next: function () {
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA2" && this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimType") != "ZWP1" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimSubType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA2" &&
				this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimSubType") != "ZWP1" &&
				this.getModel("LocalDataModel").getProperty("/oFieldAction") != "FIELD ACTION" && this.getView().getModel("HeadSetData").getProperty(
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
			} else {
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
			}
		},
		onStep04Back: function () {

			this.getView().byId("idFilter03").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");

		},

		onStep05Next: function () {
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWMS" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWA2" && this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "ZWAC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWMS" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimSubType") != "ZWA1" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWA2" &&
				this.getView()
				.getModel(
					"HeadSetData").getProperty("/WarrantyClaimSubType") != "ZWAC" &&
				this.getModel("LocalDataModel").getProperty(
					"/oFieldAction") != "FIELD ACTION" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZECP" &&
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
			}
		},
		onStep05Back: function () {

			this.getView().byId("idFilter04").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");

		},

		onStep06Next: function () {
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "ZWP2") {
				this.getView().byId("idFilter07").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
			}
		},
		onStep06Back: function () {
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWA1" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimType") == "ZWA2" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWAC" &&
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWA1" && this.getView().getModel("HeadSetData").getProperty(
					"/WarrantyClaimSubType") == "ZWA2" && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWAC"
			) {
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
			} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWMS" || this.getView().getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") == "ZRCR") {
				this.getView().byId("idFilter01").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
			} else {
				this.getView().byId("idFilter05").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab5");
			}
			if (this.getModel("LocalDataModel").getProperty("/oFieldAction") == "FIELD ACTION") {
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
			}

			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZECP") {
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
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
			}

		},

		onStep07Back: function () {
			if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZWP2" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType") == "ZWP2" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSCR" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZSSM"
			) {
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
			} else {
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
			}

		},

		onPressBack: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.ogetSelectedKey = this.getView().byId("idIconTabMainClaim").getSelectedKey();
			var ogetKey = this.ogetSelectedKey.split("Tab")[1];
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var that = this;
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
							if (oClaimNum == "nun") {
								that._fnSaveClaim();
							} else {
								that._fnUpdateClaim();
							}
							that.getRouter().navTo("SearchClaim");
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

		},
		handleValueHelp: function (oController) {
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
			this.oSelectedItem = evt.getParameter("selectedItem");
			this.oSelectedTitle = this.oSelectedItem.getTitle();
			var oProductModel = this.getModel("ProductMaster");
			oProductModel.read("/ZC_Characteristic_InfoSet", {
				urlParameters: {
					"$filter": "MATERIAL eq '" + this.oSelectedTitle + "' and CLASS eq 'WARRANTY_INFO' and CHARAC eq 'Warranty Alternate Unit'"
				},
				success: $.proxy(function (data) {
					if (data.results.length > 0) {
						this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", data.results[0].VALUE);
					} else {
						this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", this.oSelectedItem.getInfo());
					}

				}, this)
			});
			//this.getView().getModel("PartDataModel").setProperty("/PartDescription", this.oSelectedItem.getDescription());
			//this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", this.oSelectedItem.getInfo());
			//this.getView().byId("idPartDes").setValue(this.oSelectedItem.getDescription());
			this.getView().getModel("PartDataModel").setProperty("/PartDescription", this.oSelectedItem.getDescription());
			if (this.oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(this.oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},

		// handleValueHelpLabour: function (oController) {
		// 	this.inputId = oController.getParameters().id;
		// 	//console.log(this.inputId);
		// 	// create value help dialog
		// 	if (!this._valueHelpDialogLabour) {
		// 		this._valueHelpDialogLabour = sap.ui.xmlfragment(
		// 			"zclaimProcessing.view.fragments.LabourNumber",
		// 			this
		// 		);
		// 		this.getView().addDependent(this._valueHelpDialogLabour);
		// 	}

		// 	// open value help dialog
		// 	this._valueHelpDialogLabour.open();
		// },
		// _handleValueHelpSearchLabour: function (evt) {
		// 	var sValue = evt.getParameter("value");

		// 	if (sValue) {
		// 		var oFilter = new Filter(
		// 			"LabourNumber",
		// 			sap.ui.model.FilterOperator.EQ, sValue
		// 		);
		// 		//console.log(oFilter);
		// 		evt.getSource().getBinding("items").filter([oFilter]);
		// 	} else {
		// 		evt.getSource().getBinding("items").filter([]);
		// 	}
		// },
		// _handleValueHelpCloseLabour: function (evt) {
		// 	this.oSelectedItem = evt.getParameter("selectedItem");
		// 	this.oSelectedTitle = this.oSelectedItem.getTitle();
		// 	// this.getView().getModel("LocalDataModel").setProperty("/MaterialDescription", this.oSelectedItem.getInfo());
		// 	// this.getView().byId("idPartDes").setValue(this.oSelectedItem.getInfo());
		// 	if (this.oSelectedItem) {
		// 		var productInput = this.byId(this.inputId);
		// 		productInput.setValue(this.oSelectedItem.getTitle());
		// 	}
		// 	evt.getSource().getBinding("items").filter([]);
		// },

		// handleValueHelpPaint: function (oController) {
		// 	this.inputId = oController.getParameters().id;
		// 	//console.log(this.inputId);
		// 	// create value help dialog
		// 	if (!this._valueHelpDialogPaint) {
		// 		this._valueHelpDialogPaint = sap.ui.xmlfragment(
		// 			"zclaimProcessing.view.fragments.operationList",
		// 			this
		// 		);
		// 		this.getView().addDependent(this._valueHelpDialogPaint);
		// 	}

		// 	// open value help dialog
		// 	this._valueHelpDialogLabour.open();
		// },
		// _handleValueHelpSearchPaint: function (evt) {
		// 	var sValue = evt.getParameter("value");

		// 	if (sValue) {
		// 		var oFilter = new Filter(
		// 			"PaintPositionCode",
		// 			sap.ui.model.FilterOperator.EQ, sValue
		// 		);
		// 		//console.log(oFilter);
		// 		evt.getSource().getBinding("items").filter([oFilter]);
		// 	} else {
		// 		evt.getSource().getBinding("items").filter([]);
		// 	}
		// },
		// _handleValueHelpClosePaint: function (evt) {
		// 	this.oSelectedItem = evt.getParameter("selectedItem");
		// 	this.oSelectedTitle = this.oSelectedItem.getTitle();
		// 	// this.getView().getModel("LocalDataModel").setProperty("/MaterialDescription", this.oSelectedItem.getInfo());
		// 	// this.getView().byId("idPartDes").setValue(this.oSelectedItem.getInfo());
		// 	if (this.oSelectedItem) {
		// 		var productInput = this.byId(this.inputId);
		// 		productInput.setValue(this.oSelectedItem.getTitle());
		// 	}
		// 	evt.getSource().getBinding("items").filter([]);
		// },
		onSelectECP: function (oEvent) {
			var oPath = oEvent.getSource().getSelectedContextPaths()[0];
			var oObj = this.getModel("LocalDataModel").getProperty(oPath);
			this.getView().getModel("HeadSetData").setProperty("/AgreementNumber", oObj.AgreementNumber);
		},
		onPressSavePart: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oTable = this.getView().byId("idTableParts");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			// this.obj.Message = "";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
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

			this.obj.zc_itemSet.results.push(itemObj);

			//obj.zc_itemSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");

			this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});
			// oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					var pricinghData = response.data.zc_claim_item_price_dataSet.results;
					this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
					this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);
					var oFilteredData = pricinghData.filter(function (val) {
						return val.ItemType === "MAT";
					});
					console.log(oFilteredData);
					this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
					MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"));
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
				error: function (err) {
					console.log(err);
				}
			});

		},
		// onNavigatePart: function (oEvent) {

		// 	var oSelectedRow = oEvent.getParameters().rowContext.sPath;
		// 	var obj = oEvent.getSource().getModel("LocalDataModel").getProperty(oSelectedRow);
		// 	this.PartNum = obj.matnr;
		// 	this.PartQt = obj.quant;
		// },

		onPressUpdatePart: function (oEvent) {
			var oTable = this.getView().byId("idTableParts");
			var oTableIndex = oTable._aSelectedPaths;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (oTableIndex.length == 1) {

				// var oString = oTableIndex.toString();
				// var oTableStringSplit = oTableIndex.toString().split(",");
				var oSelectedRow = oTableIndex.toString();
				var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
				var PartNum = obj.matnr;
				var PartQt = obj.quant;

				this.getView().getModel("PartDataModel").setProperty("/matnr", PartNum);
				this.getView().getModel("PartDataModel").setProperty("/quant", PartQt);
				this.getView().getModel("PartDataModel").setProperty("/PartDescription", obj.PartDescription);
				this.getView().getModel("DateModel").setProperty("/partLine", true);
				// for (var j = 0; j < this.obj.zc_itemSet.results.length; j++) {
				// 	if (this.obj.zc_itemSet.results[j].MaterialNumber == PartNum) {
				// 		this.obj.zc_itemSet.results.splice(j);
				// 	}
				// }

				//	Array.prototype.splice.apply(this.obj.zc_itemSet.results, oTableStringSplit);
				var oIndex = parseInt(oTableIndex.toString().split("/")[2]);
				this.obj.zc_itemSet.results.splice(oIndex, 1);
				var oClaimModel = this.getModel("ProssingModel");
				// this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				// $.ajaxSetup({
				// 	headers: {
				// 		'X-CSRF-Token': this._oToken
				// 	}
				// });

				oClaimModel.refreshSecurityToken();

				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_dataSet.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.ItemType === "MAT";
						});
						this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
						this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
						this._fnClaimSum();
						this._fnClaimSumPercent();
						//MessageToast.show("Claim has been deleted successfully");
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show(oBundle.getText("Pleaseselect1row"));
				oTable.removeSelections("true");
			}
		},
		onPressDeletePart: function () {
			var oTable = this.getView().byId("idTableParts");
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
								this.obj.zc_itemSet.results.splice(oIndex, 1);

								var oClaimModel = this.getModel("ProssingModel");

								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/zc_headSet", this.obj, {
									success: $.proxy(function (data, response) {
										var pricinghData = response.data.zc_claim_item_price_dataSet.results;
										var oFilteredData = pricinghData.filter(function (val) {
											return val.ItemType === "MAT";

										});
										this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
										this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);
										console.log(oFilteredData);
										this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
										oTable.removeSelections("true");
										MessageToast.show(oBundle.getText("ItemDeletedSuccessfully"));
										this._fnClaimSum();
										this._fnClaimSumPercent();
									}, this),
									error: function (err) {
										console.log(err);
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
				MessageToast.show(oBundle.getText("Pleaseselect1row"));
				oTable.removeSelections("true");
			}
		},
		onSelectOFP: function (oEvent) {
			var table = this.getView().byId("idTableParts");

			var oSelectedPart = oEvent.getSource().getParent().getCells()[2].getText();
			this.getView().byId("idOFPart").setText(oSelectedPart);

			table.removeSelections("true");

		},
		onSelectOFPLabour: function (oEvent) {
			var table = this.getView().byId("idLabourTable");
			var oVin = this.getModel("LocalDataModel").getProperty("/ClaimDetails/ExternalObjectNumber");
			var oSelectedPart = this.getView().getModel("HeadSetData").getProperty("/OFP");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.getView().byId("idOFPLabour").setText(oSelectedPart);
			var oProssingModel = this.getModel("ProssingModel");
			var sSelectedLocale;
                //  get the locale to determine the language.
                var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
                if (isLocaleSent) {
                    sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
                } else {
                    sSelectedLocale = "en"; // default is english
                }
			oProssingModel.read("/zc_get_suggested_operationsSet", {
				urlParameters: {
					"$filter": "CLMNO eq '" + oClaimNum + "'and OFP_GROUP eq '" + oSelectedPart + "' and VHVIN eq '" + oVin + "' and Langu eq '" + sSelectedLocale.toUpperCase() + "'"
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/SuggetionOperationListFiltered", data.results);
				}, this),
				error: function () {
					console.log("Error");
				}
			});
			table.removeSelections("true");
			// table.setSelectedIndex(-1);
		},
		onPressSuggestLabour: function (oEvent) {
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.operationList", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},
		onCloseLabour: function (oEvent) {
			oEvent.getSource().getParent().getParent().getParent().close();
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
			if (oSelectedItem) {
				var oTitle = oSelectedItem.getTitle();
				var oDescription = oSelectedItem.getDescription();

				this.getView().getModel("LabourDataModel").setProperty("/LabourOp", oTitle);
				this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", oDescription);
				// var productInput = this.byId(this.inputId),
				// 	oText = this.byId('selectedKey'),
				// 	sDescription = oSelectedItem.getDescription();

				// productInput.setSelectedKey(sDescription);
				// oText.setText(sDescription);
			}
			evt.getSource().getBinding("items").filter([]);
		},

		_handleValueHelpClosePaint: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var oTitle = oSelectedItem.getTitle();
				//var oDescription = oSelectedItem.getDescription();

				this.getView().getModel("PaintDataModel").setProperty("/PaintPositionCode", oTitle);
				// this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", oDescription);
				// var productInput = this.byId(this.inputId),
				// 	oText = this.byId('selectedKey'),
				// 	sDescription = oSelectedItem.getDescription();

				// productInput.setSelectedKey(sDescription);
				// oText.setText(sDescription);
			}
			evt.getSource().getBinding("items").filter([]);
		},

		handleValueHelpLabour: function (oEvent) {
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

			// create a filter for the binding
			this._valueHelpDialog01.getBinding("items").filter([new Filter(
				"J_3GKATNRC",
				sap.ui.model.FilterOperator.Contains, sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog01.open(sInputValue);
		},

		handleValueHelpPaint: function (oEvent) {
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

		// onSuggest : function(event){
		// 	var value = event.getParameter("suggestValue");
		// 	var filters = [];
		// 	if (value) {
		// 		filters = [
		// 			new sap.ui.model.Filter([
		// 				new sap.ui.model.Filter("J_3GKATNRC", function(sText) {
		// 					return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
		// 				}),
		// 				new sap.ui.model.Filter("Name", function(sDes) {
		// 					return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
		// 				})
		// 			], false)
		// 		];
		// 	}

		// 	this.getView().byId("idOperationLabour").getBinding("suggestionItems").filter(filters);
		// 	this.getView().byId("idOperationLabour").suggest();
		// },

		onSelectPositionPaintCode: function (oEvent) {
			if (oEvent) {
				var oItem = oEvent.getParameter("selectedItem");
				var SelectedVal = oItem ? oItem.getText() : "";
				this.getView().getModel("PaintDataModel").setProperty("/PaintPositionCode", SelectedVal);

			}

		},

		// fnLiveChangeOperationCode : function(evt){
		// 	var sValue = evt.getParameter("value");

		// 	if (sValue) {
		// 		var oFilter = new Filter(
		// 			"J_3GKATNRC",
		// 			sap.ui.model.FilterOperator.Contains, sValue
		// 		);
		// 		//console.log(oFilter);
		// 		evt.getSource().getBinding("items").filter([oFilter]);
		// 	} else {
		// 		evt.getSource().getBinding("items").filter([]);
		// 	}
		// },
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
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			// this.obj.Message = "";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
			var oClaimHr = this.getView().getModel("LabourDataModel").getProperty("/ClaimedHours");
			if (oClaimHr == "") {
				oClaimHr = "0.0";
			}
			var itemObj = {
				"Type": "LABOUR",
				"ItemType": "FR",
				"LabourNumber": this.getView().getModel("LabourDataModel").getProperty("/LabourOp"),
				"ClaimedHours": oClaimHr,
				"LabourDescription": this.getView().getModel("LabourDataModel").getProperty("/LabourDescription")
			};

			this.obj.zc_claim_item_labourSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");
			// this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
			// $.ajaxSetup({
			// 	headers: {
			// 		'X-CSRF-Token': this._oToken
			// 	}
			// });

			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					console.log(response);
					var pricinghData = response.data.zc_claim_item_price_dataSet.results;
					var oFilteredData = pricinghData.filter(function (val) {
						return val.ItemType === "FR" && val.ItemKey[0] != "P";
					});
					this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
					this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);
					console.log(oFilteredData);
					this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredData);
					//this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
					MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"));
					this.getView().getModel("DateModel").setProperty("/labourLine", false);
					this.getView().getModel("LabourDataModel").setProperty("/LabourOp", "");
					this.getView().getModel("LabourDataModel").setProperty("/ClaimedHours", "");
					this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", "");
					this._fnClaimSum();
					this._fnClaimSumPercent();
					oTable.removeSelections("true");
				}, this),
				error: function (err) {
					console.log(err);
				}
			});

		},
		// onNavigateLabour: function (oEvent) {
		// 	console.log(oEvent);
		// 	var oSelectedRow = oEvent.getParameters().rowContext.sPath;
		// 	var oIndex = oSelectedRow.split("/")[2];
		// 	this.ArrIndexLabour.push(oIndex);
		// 	// var obj = oEvent.getSource().getModel("LocalDataModel").getProperty(this.oAgrTable);
		// 	// this.PartNum = obj.matnr;
		// },
		onPressDeleteLabour: function () {
			var oTable = this.getView().byId("idLabourTable");
			var oTableIndex = oTable._aSelectedPaths;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (oTableIndex.length == 1) {
				// var oTableStringSplit = oTableIndex.toString().split(",");
				// Array.prototype.splice.apply(this.obj.zc_itemSet.results, oTableStringSplit);
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
								this.obj.zc_claim_item_labourSet.results.splice(oIndex, 1);
								var oClaimModel = this.getModel("ProssingModel");

								oClaimModel.refreshSecurityToken();

								oClaimModel.create("/zc_headSet", this.obj, {
									success: $.proxy(function (data, response) {
										var pricinghData = response.data.zc_claim_item_price_dataSet.results;
										var oFilteredData = pricinghData.filter(function (val) {
											return val.ItemType === "FR" && val.ItemKey[0] != "P";
										});
										this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
										this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);
										console.log(oFilteredData);
										this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredData);
										MessageToast.show(oBundle.getText("ItemDeletedSuccessfully"));
										oTable.removeSelections("true");
										this._fnClaimSum();
										this._fnClaimSumPercent();
										// this.getView().getModel("DateModel").setProperty("/partLine", false);
										// this.getView().getModel("PartDataModel").setProperty("/matnr", "");
										// this.getView().getModel("PartDataModel").setProperty("/quant", "");
										// this.getView().byId("idPartDes").setValue("");

									}, this),
									error: function (err) {
										console.log(err);
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
				MessageToast.show(oBundle.getText("Pleaseselect1row"));
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
				//this.getView().byId("idLabourDes").setText(obj.LabourDescription);
				this.getView().getModel("LabourDataModel").setProperty("/LabourDescription", obj.LabourDescription);
				// for (var j = 0; j < this.obj.zc_claim_item_labourSet.results.length; j++) {
				// 	if (this.obj.zc_claim_item_labourSet.results[j].LabourNumber == LabourNum) {
				// 		this.obj.zc_claim_item_labourSet.results.splice(j);
				// 	}
				// }
				var oIndex = parseInt(oTable._aSelectedPaths.toString().split("/")[2]);
				this.obj.zc_claim_item_labourSet.results.splice(oIndex, 1);
				var oClaimModel = this.getModel("ProssingModel");
				// this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				// $.ajaxSetup({
				// 	headers: {
				// 		'X-CSRF-Token': this._oToken
				// 	}
				// });

				oClaimModel.refreshSecurityToken();

				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_dataSet.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.ItemType === "FR" && val.ItemKey[0] != "P";
						});
						this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
						this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredData);
						oTable.removeSelections("true");
						this._fnClaimSum();
						this._fnClaimSumPercent();
						//MessageToast.show("Claim has been deleted successfully");
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show(oBundle.getText("Pleaseselect1row"));
				oTable.removeSelections("true");
			}
		},

		onPressSavePaint: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			this.obj.Message = "";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
			var oTable = this.getView().byId("idPaintTable");
			var itemObj = {
				"ItemType": "PAINT",
				"PaintPositionCode": this.getView().getModel("PaintDataModel").getProperty("/PaintPositionCode"),
				"ClaimedHours": "0.00"
			};

			this.obj.zc_claim_item_paintSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");
			// this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
			// $.ajaxSetup({
			// 	headers: {
			// 		'X-CSRF-Token': this._oToken
			// 	}
			// });

			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					console.log(response);
					var pricinghData = response.data.zc_claim_item_price_dataSet.results;
					var oFilteredData = pricinghData.filter(function (val) {
						return val.ItemType === "FR" && val.ItemKey[0] == "P";
					});
					this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
					this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);
					console.log(oFilteredData);
					this.getModel("LocalDataModel").setProperty("/PaintPricingDataModel", oFilteredData);
					//this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
					MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"));
					this.getView().getModel("DateModel").setProperty("/paintLine", false);
					this.getView().getModel("PaintDataModel").setProperty("/PaintPositionCode", "");
					oTable.removeSelections("true");
				}, this),
				error: function (err) {
					console.log(err);
				}
			});

		},
		// onNavigatePaint: function (oEvent) {
		// 	console.log(oEvent);
		// 	this.ArrIndexPaint = [];
		// 	var oSelectedRow = oEvent.getParameters().rowContext.sPath;
		// 	var oIndex = oSelectedRow.split("/")[2];
		// 	this.ArrIndexPaint.push(oIndex);
		// 	// var obj = oEvent.getSource().getModel("LocalDataModel").getProperty(this.oAgrTable);
		// 	// this.PartNum = obj.matnr;
		// },
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
								var oClaimModel = this.getModel("ProssingModel");
								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/zc_headSet", this.obj, {
									success: $.proxy(function (data, response) {
										var pricinghData = response.data.zc_claim_item_price_dataSet.results;
										var oFilteredData = pricinghData.filter(function (val) {
											return val.ItemType === "FR" && val.ItemKey[0] == "P";
										});
										this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
										this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);

										this.getModel("LocalDataModel").setProperty("/PaintPricingDataModel", oFilteredData);
										MessageToast.show(oBundle.getText("ItemDeletedSuccessfully"));
										oTable.removeSelections("true");
									}, this),
									error: function (err) {

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
				MessageToast.show(oBundle.getText("Pleaseselect1row"));
				oTable.removeSelections("true");
			}
		},
		onPressSaveClaimItemSublet: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oTable = this.getView().byId("idSubletTable");
			this.obj.Message = "";
			this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
			this.obj.NumberOfWarrantyClaim = oClaimNum;

			if (this.getModel("LocalDataModel").getProperty("/SubletAtchmentData") != undefined && this.getModel("LocalDataModel").getProperty(
					"/SubletAtchmentData") != "") {
				var itemObj = {
					"ItemType": "SUBL",
					"SubletType": this.getView().getModel("SubletDataModel").getProperty("/SubletCode"),
					"InvoiceNo": this.getView().getModel("SubletDataModel").getProperty("/InvoiceNo"),
					"Amount": this.getView().getModel("SubletDataModel").getProperty("/Amount"),
					"SubletDescription": this.getView().getModel("SubletDataModel").getProperty("/description"),
					"URI": this.getModel("LocalDataModel").getProperty("/SubletAtchmentData/0/URI"),
					"UnitOfMeasure": "EA"
				};

				this.obj.zc_item_subletSet.results.push(itemObj);

				var oClaimModel = this.getModel("ProssingModel");

				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {

						var pricinghData = response.data.zc_claim_item_price_dataSet.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.ItemType === "SUBL";
						});
						this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
						this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);

						this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredData);

						var oFilteredDataLabour = pricinghData.filter(function (val) {
							return val.ItemType === "FR" && val.ItemKey[0] != "P";
						});

						this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredDataLabour);

						MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"));
						this.getView().getModel("DateModel").setProperty("/subletLine", false);
						this.getView().getModel("SubletDataModel").setProperty("/SubletCode", "");
						this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", "");
						this.getView().getModel("SubletDataModel").setProperty("/Amount", "");
						this.getView().getModel("SubletDataModel").setProperty("/description", "");
						oTable.removeSelections("true");
						this._fnClaimSum();
						this._fnClaimSumPercent();
						this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", "");

					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show("Attachment is required.");
			}
		},

		onPressUpdateSublet: function (oEvent) {
			var oTable = this.getView().byId("idSubletTable");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oTableIndex = oTable._aSelectedPaths;
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oClaimModel = this.getModel("ProssingModel");
			if (oTableIndex.length == 1) {
				//var oString = oTableIndex.toString();
				var oSelectedRow = oTableIndex.toString();
				var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
				var SubletNum = obj.matnr;
				var SubletInv = obj.InvoiceNo;
				var SubletAmount = obj.Amount;
				this.getView().getModel("SubletDataModel").setProperty("/SubletCode", SubletNum);
				this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", SubletInv);
				this.getView().getModel("SubletDataModel").setProperty("/Amount", SubletAmount);
				this.getView().getModel("SubletDataModel").setProperty("/description", obj.SubletDescription);
				this.getView().getModel("DateModel").setProperty("/subletLine", true);
				var oFile = obj.URI.split(",")[1].split("=")[1].split(")")[0];
				var oFileReplaced = oFile.replace(/'/g, "");

				oClaimModel.read("/zc_claim_subletattachmentSet", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'SUBL' and FileName eq'" + oFileReplaced + "'"
					},
					success: $.proxy(function (subletData) {
						var oAttachSet = subletData.results.map(function (item) {
							item.FileName = item.FileName.replace(SubletNum + "@@@", "");
							return item;

						});
						this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", oAttachSet);
					}, this)
				});

				// oClaimModel.read("/zc_claim_subletattachmentSet", {
				// 		urlParameters: {
				// 			"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'SUBL' and FileName eq'" + oFileDeleteName +
				// 				"'"
				// 		},
				// 		success: $.proxy(function (subletData) {
				// 			var oAttachSet = subletData.results.map(function (item) {
				// 				item.FileName = item.FileName.replace(oSubletType + "@@@", "");
				// 				return item;

				// 			});
				// 			this.getModel("LocalDataModel").setProperty("/SubletAtchmentData", oAttachSet);
				// 		}, this)
				// 	});

				var oIndex = parseInt(oTable._aSelectedPaths.toString().split("/")[2]);
				this.obj.zc_item_subletSet.results.splice(oIndex, 1);

				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_dataSet.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.ItemType === "SUBL";
						});
						this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
						this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredData);
						oTable.removeSelections("true");
						this._fnClaimSum();
						this._fnClaimSumPercent();
						//MessageToast.show("Claim has been deleted successfully");
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show(oBundle.getText("Pleaseselect1row"));
				oTable.removeSelections("true");
			}
		},
		onPressDeleteSublet: function () {
			var oTable = this.getView().byId("idSubletTable");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oTableIndex = oTable._aSelectedPaths;
			var oPath = oTableIndex.toString();
			var oFile = this.getModel("LocalDataModel").getProperty(oPath).URI.split(",")[1].split("=")[1].split(")")[0];
			var oFileReplaced = oFile.replace(/'/g, "");

			// var oSubletType = this.getView().getModel("SubletDataModel").getProperty("/SubletCode");
			// var fileType = this.oUploadedFile.type;
			// var fileNamePrior = oSubletType + "@@@" + this.oUploadedFile.name;

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
								this.obj.zc_item_subletSet.results.splice(oIndex, 1);
								var oClaimModel = this.getModel("ProssingModel");

								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/zc_headSet", this.obj, {
									success: $.proxy(function (data, response) {
										var pricinghData = response.data.zc_claim_item_price_dataSet.results;
										var oFilteredData = pricinghData.filter(function (val) {
											return val.ItemType === "SUBL";
										});
										this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
										this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);

										this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredData);
										MessageToast.show(oBundle.getText("ItemDeletedSuccessfully"));
										oTable.removeSelections("true");
										this._fnClaimSum();
										this._fnClaimSumPercent();
									}, this),
									error: function (err) {

									}
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
				MessageToast.show(oBundle.getText("Pleaseselect1row"));
				oTable.removeSelections("true");
			}
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
			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_headSet", this.obj, {
				success: function (data, response) {
					this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
					this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);
					MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"));
				},
				error: function () {
					MessageToast.show(oBundle.getText("ClaimnotSaved"));
				}

			});
		},

		onSaveDamage: function (oEvent) {
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

			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					// console.log(response);
					oClaimModel.read("/zc_claim_item_damageSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and LanguageKey eq 'E' "
						},
						success: $.proxy(function (sdata) {
							this.getModel("LocalDataModel").setProperty("/DataItemDamageSet", sdata.results);
							this.getView().getModel("HeadSetData").setProperty("/DmgAreaCode", "");
							this.getView().getModel("HeadSetData").setProperty("/DmgTypeCode", "");
							this.getView().getModel("HeadSetData").setProperty("/DmgSevrCode", "");
						}, this)
					});
				}, this),
				error: function (err) {
					console.log(err);
				}
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

				var oClaimModel = this.getModel("ProssingModel");

				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						oClaimModel.read("/zc_claim_item_damageSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and LanguageKey eq 'E' "
							},
							success: $.proxy(function (sdata) {
								this.getModel("LocalDataModel").setProperty("/DataItemDamageSet", sdata.results);

								//MessageToast.show("Damage Line Updated successfully");
							}, this)
						});
						//MessageToast.show("Claim has been deleted successfully");
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			}
		},
		onDeleteDamageLine: function () {
			var oTable = this.getView().byId("idDamageDetailTable");
			var oTableIndex = oTable._aSelectedPaths;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			if (oTableIndex.length == 1) {

				var oIndex = parseInt(oTableIndex.toString().split("/")[2]);
				this.obj.zc_claim_item_damageSet.results.splice(oIndex, 1);

				var oClaimModel = this.getModel("ProssingModel");

				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						oClaimModel.read("/zc_claim_item_damageSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and LanguageKey eq 'E' "
							},
							success: $.proxy(function (sdata) {
								this.getModel("LocalDataModel").setProperty("/DataItemDamageSet", sdata.results);

								MessageToast.show(oBundle.getText("DamageLineDeletedsuccessfully"));
							}, this)
						});
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			}
		},
		onSubmitTci: function () {
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.obj.WarrantyClaimType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			this.obj.Partner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
			this.obj.ActionCode = "";
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

			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			// if (ogetKey > 1 && ogetKey <= 8) {
			// 	var oSelectedNum = ogetKey - 1;
			// 	this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab" + oSelectedNum + "");
			// } else {
			// 	this.getRouter().navTo("SearchClaim");
			// }

			//var that = this;
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
							// this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
							// $.ajaxSetup({
							// 	headers: {
							// 		'X-CSRF-Token': this._oToken
							// 	}
							// });
							oClaimModel.refreshSecurityToken();
							oClaimModel.create("/zc_headSet", this.obj, {
								success: $.proxy(function (data, response) {
									this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.data.OFPDescription);
									this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.data.MainOpsCodeDescription);

									oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
										urlParameters: {
											"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
												"'"
										},
										success: $.proxy(function (sdata) {
											this.getView().getModel("HeadSetData").setProperty("/ProcessingStatusOfWarrantyClm", sdata.results[0].ProcessingStatusOfWarrantyClm);
										}, this)
									});

									// var oErrorSet = response.data.zc_claim_vsrSet.results;
									this.getModel("LocalDataModel").setProperty("/oErrorSet", response.data.zc_claim_vsrSet.results);
									this.obj.zc_claim_vsrSet.results.pop(oObj);
									if (response.data.zc_claim_vsrSet.results.length <= 0) {
										this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
										MessageToast.show(oBundle.getText("ClaimNumber") + " " + oClaimNum + " " + oBundle.getText(
											"successfullysubmittedTCI"));
									} else {
										MessageToast.show(
											oBundle.getText("ClaimNumber") + " " + oClaimNum + " " + oBundle.getText("RejectedTCIValidationResultsdetails"));
									}

									dialog.close();
								}, this),
								error: function (err) {

								}
							});

						}, this)
					}),
					new Button({
						text: oBundle.getText("Cancel"),
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

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.MainClaimSection
		 */
		onExit: function () {
			alert("Hello");
		}

	});

});