sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat"
], function (BaseController, MessageToast, DateFormat) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.PMPMainSection", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.PMPMainSection
		 */

		onInit: function () {
			this.setModel(this.getModel("ProssingModel"));
			this.setModel(this.getModel("ProductMaster"), "ProductMasterModel");
			var partData = new sap.ui.model.json.JSONModel({
				"matnr": "",
				"quant": "",
				"PartDescription": ""
			});
			partData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(partData, "PartDataModel");
			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRoutMatched, this);
		},
		_onRoutMatched: function (oEvent) {
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

			oDateModel.setData({

				Parts: true,

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

			});
			this.getView().setModel(oDateModel, "DateModel");

			var sSelectedLocale;
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}

			var oClaim = oEvent.getParameters().arguments.claimNum;
			var oGroupDescription = oEvent.getParameters().arguments.oKey;
			var oProssingModel = this.getModel("ProssingModel");
			// 			var oClaimAuthType = oEvent.getParameters().arguments.oClaimGroup;
			// 			var oClaimTypeDetail = oEvent.getParameters().arguments.oKey;
			// 			var oNavList = oEvent.getParameters().arguments.oClaimNav;

			if (oClaim != "nun" && oClaim != undefined) {

			} else {
				if (oGroupDescription == "PMP") {
					oProssingModel.read("/zc_claim_groupSet", {
						urlParameters: {
							"$filter": "ClaimGroup eq 'PMP'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'"
						},
						success: $.proxy(function (data) {
							this.oFilteredData = data.results;
							this.getModel("LocalDataModel").setProperty("/ClaimGroupSet", this.oFilteredData);
						}, this),
						error: function () {
							console.log("Error");
						}
					});

				}
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

		_fnSaveClaim: function () {

			//	var oValidator = new Validator();
			//var oValid = oValidator.validate(this.getView().byId("idClaimMainForm"));
			// var oValid01 = oValidator.validate(this.getView().byId("idVehicleInfo"));
			// 			var oValid02 = oValidator.validate(this.getView().byId("idpart01Form"));
			// 			oValidator.validate(!(this.getView().byId("id_Date")));
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
			var oCurrentDt = new Date();
			var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
			var oClmType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oClmSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			var that = this;
			var oView = this.getView();
			var aInputs;
			var aInputsArr = [
				oView.byId("idClaimType")
			];

			// 			var bValidationError = false;

			// 			if (oClaimtype == "PMP") {
			// 				aInputs = aInputsArr;
			// 			}
			// 			var bValidationError;
			// 			jQuery.each(aInputs, function (i, oInput) {
			// 				if (oInput.getVisible() == true) {
			// 					bValidationError = that._validateInput(oInput) || bValidationError;
			// 				}
			// 			});

			// 			if (bValidationError) {
			// 				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
			// 				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
			// 				this.getView().byId("idMainClaimMessage").setType("Error");
			// 				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			// 			} else {
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);
			// 			this.getView().byId("id_Date").setValueState("None");
			// 			this.getView().byId("idPrInvDate").setValueState("None");
			// 			this.getView().byId("idPreInvNum").setValueState("None");
			// 			this.getView().byId("idT2Field").setValueState("None");
			// 			this.getView().byId("idT1Field").setValueState("None");
			// 			this.getView().byId("idOFP").setValueState("None");
			// 			this.getView().byId("idMainOps").setValueState("None");
			// 			this.getView().byId("idDealerContact").setValueState("None");
			// 			this.getView().byId("idFieldActionInput").setValueState("None");
			// 			var oActionCode = "";
			// 			if (this.getView().getModel("DateModel").getProperty("/oztac") == true) {
			// 				oActionCode = "ZTEA";
			// 			} else {
			// 				oActionCode = "";
			// 			}
			//"ActionCode": oActionCode,
			// 			this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
			// 			this.getView().getModel("DateModel").setProperty("/claimTypeState", "None");
			// 			this.getView().getModel("DateModel").setProperty("/claimTypeState2", "None");
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
				"NameOfPersonRespWhoChangedObj": this.getModel("LocalDataModel").getProperty("/LoginId"),
				"ShipmentReceivedDate": null,
				"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
				"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
				"OFP": this.getView().getModel("HeadSetData").getProperty("/OFP"),
				"WTYClaimRecoverySource": "",
				"MainOpsCode": this.getView().getModel("HeadSetData").getProperty("/MainOpsCode"),
				"T1WarrantyCodes": this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes"),
				"BatteryTestCode": this.getView().getModel("HeadSetData").getProperty("/BatteryTestCode"),
				"T2WarrantyCodes": this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes"),
				"FieldActionReference": this.getView().getModel("HeadSetData").getProperty("/FieldActionReference"),
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
				"DeliveryType": this.getView().getModel("HeadSetData").getProperty("/DeliveryType"),
				"DealerInvoice": this.getView().getModel("HeadSetData").getProperty("/DealerInvoice"),
				"DealerInvoiceDate": this.getView().getModel("HeadSetData").getProperty("/DealerInvoiceDate"),
				"DealerRO": this.getView().getModel("HeadSetData").getProperty("/DealerRO"),
				"CompetitorName": this.getView().getModel("HeadSetData").getProperty("/CompetitorName"),
				"CompetitorAddr": this.getView().getModel("HeadSetData").getProperty("/CompetitorAddr"),
				"CompetitorCity": this.getView().getModel("HeadSetData").getProperty("/CompetitorCity"),
				"CompetitorProv": this.getView().getModel("HeadSetData").getProperty("/CompetitorProv"),
				"CompetitorPost": this.getView().getModel("HeadSetData").getProperty("/CompetitorPost"),
				"QuoteDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/QuoteDate")),
				"PartManufacturer": this.getView().getModel("HeadSetData").getProperty("/PartManufacturer"),
				"PartType": this.getView().getModel("HeadSetData").getProperty("/PartType")

			};

			oClaimModel.refreshSecurityToken();
			oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
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

					oClaimModel.read("/ZC_HEAD_PMPSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "'"
						},
						success: $.proxy(function (sdata) {
							// console.log(sdata);
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

							var oCLaim = this.getModel("LocalDataModel").getProperty("/ClaimDetails/NumberOfWarrantyClaim");
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

			//}
		},
		onSaveClaim: function (oEvent) {
			this._fnSaveClaim();
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
					"$filter": "MATERIAL eq '" + this.oSelectedTitle + "' and CLASS eq 'TIRE_INFORMATION' and CHARAC eq 'Warranty Alternate Unit'"
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
		onPressAddPart: function () {
			this.getView().getModel("PartDataModel").setProperty("/matnr", "");
			this.getView().getModel("PartDataModel").setProperty("/quant", "");
			this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
			this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "");

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
		onEnterPostalCode: function (oEvent) {
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