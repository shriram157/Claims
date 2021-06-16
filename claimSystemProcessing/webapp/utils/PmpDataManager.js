sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	"zclaimProcessing/control/DistanceMatrix",
], function (BaseController, DistanceMatrix) {
	"use strict";
	var oCurrentDt = new Date();
	var oFinalDistanceNum;

	return {
		fnPartModel: function (elm) {
			var partData = new sap.ui.model.json.JSONModel({
				"matnr": "",
				"quant": "",
				"PartDescription": "",
				"PartManufacturer": "",
				"PartType": "",
				"CompetitorPrice": ""
			});

			partData.setDefaultBindingMode("TwoWay");
			return elm.getView().setModel(partData, "PartDataModel");
		},

		fnDateModel: function (elm) {
			var oDateModel = new sap.ui.model.json.JSONModel();
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
				oSlipVisible: false,
				streetEnable: false,
				localityEnable: false,
				provinceEnable: false,
				partQtyValState: "None",
				PartValState: "None",
				competitorValueState: "None",
				addEnbAutoCom : true
			});
			return elm.getView().setModel(oDateModel, "DateModel");
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
		compareValues: function (key, order = 'asc') {
			return function innerSort(a, b) {
				if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
					// property doesn't exist on either object
					return "";
				}

				const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
				const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

				let comparison = 0;
				if (varA > varB) {
					comparison = 1;
				} else if (varA < varB) {
					comparison = -1;
				}
				return (
					(order === 'desc') ? (comparison * -1) : comparison
				);
			};
		},
		_fnStatusCheck: function (elm) {
			var oStatus = elm.getView().getModel("HeadSetData").getProperty("/DecisionCode");
			var oClaimModel = elm.getModel("ProssingModel");

			oClaimModel.read("/ZC_CLAIM_STATUS_DESC", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + this.fnReturnLanguage() + "'and Status eq '" + oStatus + "'"
				},
				success: $.proxy(function (data) {
					if(data.results.length > 0){
					elm.getModel("LocalDataModel").setProperty("/StatusDes", data.results[0].Description);
					}
				}, elm),
				error: function () {

				}
			})

		},

		_fnClaimSum: function (elm) {
			var oClaimModel = elm.getModel("zDLRCLAIMPMPSRV");
			oClaimModel.read("/ZC_CLAIM_SUM('" + elm.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
				"')/Set", {
					success: $.proxy(function (data) {

						elm.getModel("LocalDataModel").setProperty("/ClaimSum", data.results);

					}, elm)
				});
		},
		_fnUpdateHeaderProp: function (elm) {
			//elm.obj.NumberOfWarrantyClaim = elm.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			elm.obj.WarrantyClaimType = elm.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			elm.obj.Partner = elm.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");

			elm.obj.ReferenceDate = this._fnDateFormat(elm.getView().getModel("HeadSetData").getProperty("/ReferenceDate"));
			elm.obj.DateOfApplication = this._fnDateFormat(oCurrentDt);

			elm.obj.RepairDate = this._fnDateFormat(elm.getView().getModel("HeadSetData").getProperty("/DealerInvoiceDate"));
			elm.obj.RepairOrderNumberExternal = elm.getView().getModel("HeadSetData").getProperty("/RepairOrderNumberExternal");
			elm.obj.ExternalNumberOfClaim = elm.getView().getModel("HeadSetData").getProperty("/ExternalNumberOfClaim");
			elm.obj.ExternalObjectNumber = elm.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber");
			elm.obj.Odometer = elm.getView().getModel("HeadSetData").getProperty("/Odometer");

			elm.obj.DealerContact = elm.getView().getModel("HeadSetData").getProperty("/DealerContact");

			elm.obj.CustomerFullName = elm.getView().getModel("HeadSetData").getProperty("/CustomerFullName");

			elm.obj.DealerInvoice = elm.getView().getModel("HeadSetData").getProperty("/DealerInvoice").toUpperCase();
			elm.obj.DealerInvoiceDate = this._fnDateFormat(elm.getView().getModel("HeadSetData").getProperty("/DealerInvoiceDate"));
			elm.obj.DealerRO = elm.getView().getModel("HeadSetData").getProperty("/DealerRO").toUpperCase();
			elm.obj.CompetitorName = elm.getView().getModel("HeadSetData").getProperty("/CustomerFullName");
			elm.obj.CompetitorAddr = elm.getView().byId("street_number").getValue() || "";
			elm.obj.CompetitorCity = elm.getView().byId("locality").getValue() || "";
			elm.obj.CompetitorProv = elm.getView().byId("administrative_area_level_1").getValue() || "";
			elm.obj.CompetitorPost = elm.getView().byId("postal_code").getValue() || "";
			elm.obj.QuoteDate = this._fnDateFormat(elm.getView().getModel("HeadSetData").getProperty("/QuoteDate"));
			elm.obj.RebateAmount = parseFloat(elm.getView().getModel("HeadSetData").getProperty("/RebateAmount")).toFixed(2) || "0.00";
			elm.obj.NameOfPersonRespWhoChangedObj =  elm.getModel("LocalDataModel").getProperty("/LoginId");
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

		_fnReturnBlankObj: function (elm) {
			elm.obj = {
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
			return elm.obj;
		},
		_fnClearPartData: function (elm) {
			elm.getView().getModel("PartDataModel").setProperty("/matnr", "");
			elm.getView().getModel("PartDataModel").setProperty("/quant", "");
			elm.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
			elm.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "");
			elm.getView().getModel("PartDataModel").setProperty("/PartType", "");
			elm.getView().getModel("PartDataModel").setProperty("/CompetitorPrice", "");
			elm.getView().getModel("PartDataModel").setProperty("/PartManufacturer", "");
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
		_fnDistanceValidation: function (elm) {

			if (elm.getView().byId("postal_code").getValue() != "") {

				var oGetDistance = elm.getView().byId("idDist").getContent()[0].getText();
				var oDistanceRemoveComma = oGetDistance.replace(/,/g, '');
				var oDistanceRemoveKM = oDistanceRemoveComma.replace(/km/g, '');
				oFinalDistanceNum = parseInt(oDistanceRemoveKM);
			} else {
				oFinalDistanceNum = "";
			}
		},
		_fnEnableDisablebtn: function (elm, boolean) {
			elm.getView().getModel("DateModel").setProperty("/oFormEdit", boolean);
			elm.getView().getModel("DateModel").setProperty("/SaveClaim07", boolean);
			elm.getModel("LocalDataModel").setProperty("/CancelEnable", boolean);
			elm.getView().getModel("DateModel").setProperty("/claimEditSt", boolean);
			elm.getView().getModel("DateModel").setProperty("/updateEnable", boolean);
			elm.getModel("LocalDataModel").setProperty("/UploadEnable", boolean);
			elm.getView().getModel("DateModel").setProperty("/submitTCIBtn", boolean);
			elm.getModel("LocalDataModel").setProperty("/FeedEnabled", boolean);
		},
		_fnTabEnbDisabled: function (elm, boolean) {
				elm.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");

				elm.getView().byId("idFilter02").setProperty("enabled", boolean);
				elm.getView().byId("idFilter03").setProperty("enabled", boolean);
				elm.getView().byId("idFilter07").setProperty("enabled", boolean);
				elm.getView().byId("idFilter08").setProperty("enabled", boolean);
				elm.getModel("LocalDataModel").setProperty("/CancelEnable", boolean);
				elm.getModel("LocalDataModel").setProperty("/step01Next", boolean);
			}
			// _ValidateOnLoad: function (elm) {
			// 	var oView = elm.getView();
			// 	var InputArr = [
			// 		oView.byId("idClaimType"),
			// 		oView.byId("idDealerClaim"),
			// 		oView.byId("id_Date"),
			// 		oView.byId("idOdometer"),
			// 		oView.byId("idRepairOrder"),
			// 		oView.byId("idVinNum"),
			// 		oView.byId("idT1Field"),
			// 		oView.byId("idT2Field"),
			// 		oView.byId("idRemedy"),
			// 		oView.byId("idCause"),
			// 		oView.byId("idCondition"),
			// 		oView.byId("idAccDate"),
			// 		oView.byId("idInsOdo"),
			// 		oView.byId("idPreInvNum"),
			// 		oView.byId("idPrInvDate"),
			// 		oView.byId("idPrvOdomtr"),
			// 		oView.byId("idFieldActionInput"),
			// 		oView.byId("idOFP"),
			// 		oView.byId("idClientLastName"),
			// 		oView.byId("idPostalCode"),
			// 		oView.byId("iDdelivCarrier"),
			// 		oView.byId("idProbill"),
			// 		oView.byId("idDelivery"),
			// 		oView.byId("idMainOps")
			// 	];
			// 	jQuery.each(InputArr, $.proxy(function (i, oInput) {
			// 		oInput.setValueState("None");
			// 	}), elm);
			// }

	};

});