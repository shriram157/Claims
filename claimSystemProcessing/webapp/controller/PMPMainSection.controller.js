sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/ValueState",
	"zclaimProcessing/utils/Validator",
	'sap/ui/model/Filter',
	"zclaimProcessing/control/SearchAddressInput"
], function (BaseController, MessageToast, DateFormat, ValueState, Validator, Filter, SearchAddressInput) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.PMPMainSection", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.PMPMainSection
		 */

		onInit: function () {

			var oCtrl = new SearchAddressInput({
				GoogleAPI: "AIzaSyAz7irkOJQ4ydE2dHYrg868QV5jUQ-5FaY"
			});

			this.getView().byId("idAddressAuto").addItem(oCtrl);

			this.geOnlyDealer();
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
			jsonTemplate.attachRequestCompleted($.proxy(function (oEvent) {
				var ModelNEW = oEvent.getSource().getData();
				var unionArr = [];
				var unionSet = [];

				this.getModel("LocalDataModel").setProperty("/cities", ModelNEW);
				this.getModel("LocalDataModel").setProperty("/itemList", ModelNEW);
				for (var i in ModelNEW) {

					if (unionArr.indexOf(ModelNEW[i].admin) == -1) {
						unionArr.push(ModelNEW[i].admin);
						console.log(unionArr);
					}

				}

				for (var j in unionArr) {
					unionSet.push({
						"admin": unionArr[j]
					});
				}

				this.getModel("LocalDataModel").setProperty("/ProviceSet", unionSet);

			}, this));
			console.log(jsonTemplate);
			this.getView().setModel(jsonTemplate, "CityModel");
			this.getView().getModel("CityModel").setSizeLimit(6000);

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
				CopareDistanceText: ""
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
			var oPMPModel = this.getModel("zDLRCLAIMPMPSRV");

			this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaim);
			// 			var oClaimAuthType = oEvent.getParameters().arguments.oClaimGroup;
			// 			var oClaimTypeDetail = oEvent.getParameters().arguments.oKey;
			// 			var oNavList = oEvent.getParameters().arguments.oClaimNav;

			if (oClaim != "nun" && oClaim != undefined) {
				this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
				oPMPModel.read("/ZC_CLAIM_HEAD_PMP", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'"
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

						this.getView().getModel("HeadSetData").setData(sdata.results[0]);

						var oCLaim = this.getModel("LocalDataModel").getProperty("/ClaimDetails/NumberOfWarrantyClaim");
						this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", oCLaim);

					}, this),
					error: function (Error) {
						console.log(Error);
					}
				})
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

		onUpdateClaim: function (oEvent) {
			this._fnUpdateClaim();
		},

		_fnUpdateClaim: function () {
			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");
			oClaimModel.refreshSecurityToken();
			oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
				success: $.proxy(function (data, response) {
					this.getModel("LocalDataModel").setProperty("/commentIndicator", false);
					oClaimModel.read("/ZC_CLAIM_HEAD_PMP", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
								"'"

						},
						success: $.proxy(function (sdata) {
							this.getView().getModel("HeadSetData").setData(sdata.results[0]);
						}, this)
					});
				}, this)
			});
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
				"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
				"LanguageKey": sSelectedLocale.toUpperCase(),
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
								this.getView().getModel("DateModel").setProperty("/partLine", false);
								this.getView().getModel("PartDataModel").setProperty("/matnr", "");
								this.getView().getModel("PartDataModel").setProperty("/quant", "");
								this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
								this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "");
								//this.getView().byId("idPartDes").setValue("");

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

		_fnSaveClaim: function () {
			var oGetDistance = this.getView().byId("idPostalDistInput").getText();
			var oDistanceRemoveComma = oGetDistance.replace(/,/g, '');
			var oDistanceRemoveKM = oDistanceRemoveComma.replace(/km/g, '');
			var oFinalDistanceNum = parseInt(oDistanceRemoveKM);
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
			} else if (oFinalDistanceNum > 80 && this.getView().getModel("HeadSetData").getProperty("/CompetitorPost") != "") {
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("CompareDistanceError"));
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
					"NameOfPersonRespWhoChangedObj": this.getModel("LocalDataModel").getProperty("/LoginId"),
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
					"CustomerFullName": "",
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

						oClaimModel.read("/ZC_CLAIM_HEAD_PMP", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + data.NumberOfWarrantyClaim +
									"'"
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

								this.getView().getModel("HeadSetData").setData(sdata.results[0]);

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

					} else {
						this.getView().getModel("PartDataModel").setProperty("/PartManufacturer", "");
						this.getView().getModel("PartDataModel").setProperty("/PartType", "");
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

			// 			var getText = this.isValidPostalCode(oEvent.getSource().getValue(), "CA");
			// 			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			// 			if (!getText) {
			// 				this.getView().getModel("HeadSetData").setProperty("/CompetitorPost", "");
			// 				MessageToast.show(
			// 					oBundle.getText("InvalidPostalCode"), {
			// 						my: "center center",
			// 						at: "center center"
			// 					});
			// 			}
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