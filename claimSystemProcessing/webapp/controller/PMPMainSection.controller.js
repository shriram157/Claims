sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	"sap/m/MessageToast"
], function (BaseController, MessageToast) {
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
				this.getView().getModel("HeadSetData").setProperty("/PostalCode", "");
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