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
	"zclaimProcessing/control/DistanceMatrix",
	"sap/m/MessageBox",
	"zclaimProcessing/utils/PmpDataManager"

], function (BaseController, MessageToast, DateFormat, ValueState, Validator, Filter, Dialog, Button, Label, Text, DistanceMatrix,
	MessageBox, PmpDataManager) {
	"use strict";

	var oCurrentDt = new Date();
	var oFinalDistanceNum;

	return BaseController.extend("zclaimProcessing.controller.PMPMainSection", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.PMPMainSection
		 */

		onInit: function () {

			this.getUser();
			this.getOnlyDealer();
			this.getView().byId("idDist").removeAllContent();

			this.setModel(this.getModel("ProssingModel"));
			this.setModel(this.getModel("ProductMaster"), "ProductMasterModel");

			PmpDataManager.fnPartModel(this);
			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRoutMatched, this);
			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");
			oClaimModel.read("/zc_company_detailSet", {
				success: $.proxy(function (data) {
					var vData = data.results;
					var sFilterBlankPriority = vData.filter(function (item) {
						return item.Priority == "" || item.Priority == "0"
					});
					var sFilterPriority = vData.filter(function (item) {
						return item.Priority != "" && item.Priority != "0"
					});

					var sortedData = sFilterPriority.sort(PmpDataManager.compareValues('Priority'));

					var concatArray = sortedData.concat(sFilterBlankPriority);

					this.getModel("LocalDataModel").setProperty("/company_detailSet", concatArray);

				}, this),
				error: function (err) {
					console.log(err);
				}
			});

			sap.ui.getCore().attachValidationError(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.Error);
			});
			sap.ui.getCore().attachValidationSuccess(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.None);
			});

		},

		_onRoutMatched: function (oEvent) {

			var that = this;
			setTimeout(function () {
				if (PmpDataManager.fnReturnLanguage() == "FR") {
					$(".clDatePicker .sapUiIconPointer").attr('title', "Ouvrir le sélecteur");
				} else {
					$(".clDatePicker .sapUiIconPointer").attr('title', "Open Picker");
				}

			}, 3000);
			var oValidator = new Validator();
			oValidator.validate("");
			var HeadSetData = new sap.ui.model.json.JSONModel();
			HeadSetData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(HeadSetData, "HeadSetData");
			var oDateModel = new sap.ui.model.json.JSONModel();

			this.getView().byId("autocomplete").setValue("");
			this.getModel("LocalDataModel").setProperty("/oErrorSet", []);

			PmpDataManager.fnDateModel(this);
			this.getView().byId("idMainClaimMessage").setProperty("visible", false);

			var oClaim = oEvent.getParameters().arguments.claimNum;
			var oGroupDescription = oEvent.getParameters().arguments.oKey;
			var oProssingModel = this.getModel("ProssingModel");
			var oPMPModel = this.getModel("zDLRCLAIMPMPSRV");

			this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaim);
			this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
			this.getModel("LocalDataModel").setProperty("/FeedEnabled", false);

			PmpDataManager._fnTabEnbDisabled(this, false);

			this.getModel("LocalDataModel").setProperty("/commentIndicator", false);

			this.getView().byId("idDist").removeAllContent();
			this.getModel("LocalDataModel").setProperty("/claim_commentSet", []);
			this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", []);
			this.getModel("LocalDataModel").setProperty("/ClaimSum", []);
			this.getModel("LocalDataModel").setProperty("/PricingDataModel", []);
			PmpDataManager._fnReturnBlankObj(this);

			if (oClaim != "nun" && oClaim != undefined) {
				PmpDataManager._fnTabEnbDisabled(this, true);
				this.getView().getModel("DateModel").setProperty("/saveClaimSt", false);
				this.getView().getModel("DateModel").setProperty("/updateClaimSt", true);
				oPMPModel.read("/ZC_CLAIM_HEAD_PMP", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'"
					},
					success: $.proxy(function (sdata) {

						this.getView().getModel("HeadSetData").setData(sdata.results[0]);
						PmpDataManager._fnStatusCheck(this);

						var oPostalCode = this.getView().byId("postal_code");
						var oPostalVal = this.getView().getModel("HeadSetData").getProperty("/CompetitorPost");
						if (oPostalVal != "") {
							oPostalCode.setProperty("enabled", false);
						} else {
							oPostalCode.setProperty("enabled", true);
						}

						if (this.getView().getModel("HeadSetData").getProperty("/CompetitorAddr") != "") {
							this.getView().getModel("DateModel").setProperty("/addEnbAutoCom", false);
						} else {
							this.getView().getModel("DateModel").setProperty("/addEnbAutoCom", true);
						}

						if (
							sdata.results[0].DecisionCode == "ZTRC" &&
							sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "Dealer_Parts_Admin" ||
							sdata.results[0].DecisionCode == "ZTIC" && sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") ==
							"Dealer_Parts_Admin" ||
							sdata.results[0].DecisionCode == "ZTRC" &&
							sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "Dealer_Parts_Services_Admin" ||
							sdata.results[0].DecisionCode == "ZTIC" && sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") ==
							"Dealer_Parts_Services_Admin"

						) {
							PmpDataManager._fnEnableDisablebtn(this, true);
						} else {
							PmpDataManager._fnEnableDisablebtn(this, false);
						}

						var oBusinessModel = this.getModel("ApiBusinessModel");
						oBusinessModel.read("/A_BusinessPartner", {
							urlParameters: {
								"$filter": "BusinessPartner eq '" + sdata.results[0].Partner + "'"
							},
							success: $.proxy(function (dBp) {
								this.getModel("LocalDataModel").setProperty("/BPOrgName", dBp.results[0].OrganizationBPName1);
							}, this)
						});

						oPMPModel.read("/ZC_HEAD_PMPSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + oClaim +
									"'and LanguageKey eq '" + PmpDataManager.fnReturnLanguage() + "'",
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
								"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
							},
							success: $.proxy(function (odata) {

								var oArr = odata.results;
								var oAttachSet = oArr.map(function (item) {
									item.FileName = item.FileName.replace("HEAD@@@", "");
									return item;

								});

								this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", oAttachSet);
							}, this)
						});
						this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", oClaim);

						oPMPModel.read("/zc_claim_item_price_dataSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + oClaim +
									"'and LanguageKey eq '" + PmpDataManager.fnReturnLanguage() + "' "

							},
							success: $.proxy(function (data) {

								this._fnDistanceCalculate();
								PmpDataManager._fnClaimSum(this);

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
										CompetitorPrice: Number(item.CompetitorPrice / item.QtyHrs).toString()
									};

								});

								PmpDataManager._fnUpdateHeaderProp(this);
								this.obj.DBOperation = "SAVE";
								this.obj.Message = "";
								this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
								this.obj.zc_itemSet.results = PartItem;
								this.obj.zc_claim_item_price_dataSet.results = pricinghData;
								this.obj.zc_claim_attachmentsSet.results = this.getModel("LocalDataModel").getProperty("/HeadAtchmentData") || [];
								this.obj.zc_claim_commentSet.results = this.getModel("LocalDataModel").getProperty("/claim_commentSet") || [];
								this.obj.zc_claim_vsrSet.results = this.getModel("LocalDataModel").getProperty("/oErrorSet") || [];

							}, this),
							error: function () {}
						});

					}, this),
					error: function (Error) {
						console.log(Error);
					}
				})
			} else {

				PmpDataManager._fnReturnBlankObj(this);

				if (oGroupDescription == "PMP") {
					oProssingModel.read("/zc_claim_groupSet", {
						urlParameters: {
							"$filter": "ClaimGroup eq 'PMP'and LanguageKey eq '" + PmpDataManager.fnReturnLanguage() + "'"
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
			this.getView().byId("idDist").getContent()[0].setText("");
			this.getView().getModel("DateModel").setProperty("/addEnbAutoCom", true);

		},

		_fnMatrixControl: function () {
			var oControl = new DistanceMatrix({
				origin: this.getModel("LocalDataModel").getProperty("/dealerPostalCode"),
				destination: this.getView().byId("postal_code").getValue().toUpperCase(),
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

		_fnUpdateClaim: function () {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");

			var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
			var oClmType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oClmSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			var that = this;
			var oView = this.getView();
			var oCurrentDate = new Date();
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
					bValidationError = PmpDataManager._validateInput(oInput) || bValidationError;
				}
			});

			PmpDataManager._fnDistanceValidation(this);

			if (bValidationError) {

				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			} else if (this.getView().getModel("HeadSetData").getProperty("/DealerInvoiceDate") > oCurrentDate) {
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("InvDateCanNotGreaterThanCurDate"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);

				oClaimModel.read("/zc_claim_item_price_dataSet", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
							"'and LanguageKey eq '" + PmpDataManager.fnReturnLanguage() + "' "

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
								CompetitorPrice: Number(item.CompetitorPrice / item.QtyHrs).toString()
							};

						});

						PmpDataManager._fnUpdateHeaderProp(this);
						this.obj.DBOperation = "SAVE";
						this.obj.Message = "";
						this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
						this.obj.zc_itemSet.results = PartItem;
						this.obj.zc_claim_item_price_dataSet.results = oFilteredData;
						this.obj.zc_claim_attachmentsSet.results = this.getModel("LocalDataModel").getProperty("/HeadAtchmentData") || [];

						oClaimModel.refreshSecurityToken();
						oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
							success: $.proxy(function (data, response) {
								MessageToast.show(oBundle.getText("ClaimUpdatedsuccessfully"), {
									my: "center center",
									at: "center center"
								});

								this.getModel("LocalDataModel").setProperty("/commentIndicator", false);
								PmpDataManager._fnClaimSum(this);
								if (oFinalDistanceNum > 80 && this.getView().byId("postal_code").getValue() != "") {
									this.getView().byId("idMainClaimMessage").setText(oBundle.getText("CompareDistanceError"));
									this.getView().byId("idMainClaimMessage").setType("Warning");
									this.getView().byId("idMainClaimMessage").setProperty("visible", true);
								} else {
									this.getView().byId("idMainClaimMessage").setProperty("visible", false);
								}
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
			var oClaimPMPModel = this.getModel("zDLRCLAIMPMPSRV");
			var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");

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

							oClaimModel.create("/zc_headSet", obj, {

								success: $.proxy(function (response) {
									this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
									this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
									this.getView().getModel("DateModel").setProperty("/claimEditSt", false);
									this.getView().getModel("DateModel").setProperty("/updateEnable", false);
									this.getModel("LocalDataModel").setProperty("/CancelEnable", false);
									this.getModel("LocalDataModel").setProperty("/UploadEnable", false);

									oClaimPMPModel.read("/ZC_CLAIM_HEAD_PMP", {
										urlParameters: {
											"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum +
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

									PmpDataManager._fnClaimSum(this);
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

		onRecalculate: function (oEvent) {
			this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			if (this.getView().getModel("HeadSetData").getProperty("/RebateAmount") == "") {
				this.obj.RebateAmount = "0.00";
				this.getView().getModel("HeadSetData").setProperty("/RebateAmount", "0.00");
			} else {
				this.obj.RebateAmount = this.getView().getModel("HeadSetData").getProperty("/RebateAmount");
			}

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
				"HeadText": this.getModel("LocalDataModel").getProperty("/BPOrgName") + "(" + oDate + ")" + ":" + sValue,
				"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
				"LanguageKey": PmpDataManager.fnReturnLanguage(),
				"User": "",
				"Date": null
			};
			this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");

			this.obj.zc_claim_commentSet.results.push(oEntry);
			this.obj.DBOperation = "SAVE";

			oClaimModel.refreshSecurityToken();
			oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
				success: $.proxy(function (data, response) {
					this.getModel("LocalDataModel").setProperty("/commentIndicator", false);
					oClaimModel.read("/ZC_HEAD_PMPSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
								"'and LanguageKey eq '" + PmpDataManager.fnReturnLanguage() + "'",
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
			var that = this;
			var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");

			var oTable = this.getView().byId("idTableParts");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			// this.obj.Message = "";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			this.obj.DBOperation = "SAVE";
			PmpDataManager._fnUpdateHeaderProp(this);

			var oTableIndex = oTable._aSelectedPaths;

			var oPMPModel = this.getModel("zDLRCLAIMPMPSRV");

			if (oTableIndex.length == 1) {

				var oIndex = this.obj.zc_itemSet.results.findIndex(({
					MaterialNumber
				}) => MaterialNumber == this.getView().getModel("PartDataModel").getProperty("/matnr"));
				this.obj.zc_itemSet.results.splice(oIndex, 1);
			}

			var oGetIndex = this.obj.zc_itemSet.results.findIndex(({
				MaterialNumber
			}) => MaterialNumber == this.getView().getModel("PartDataModel").getProperty("/matnr"));

			var aInputsArr = [
				this.byId("idPartNumber"),
				this.byId("idComPr"),
				this.byId("idPartQty")
			];

			var bValidationError;
			jQuery.each(aInputsArr, function (i, oInput) {
				if (oInput.getVisible() == true) {
					bValidationError = PmpDataManager._validateInput(oInput) || bValidationError;
				}
			});

			if (bValidationError) {
				// this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			} else if (oGetIndex > -1) {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				PmpDataManager._fnClearPartData(this);
				MessageToast.show(oBundle.getText("PartNumExists"), {
					my: "center center",
					at: "center center"
				});
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
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
					"CompetitorPrice": this.getView().getModel("PartDataModel").getProperty("/CompetitorPrice").toString()
				};
				this.getView().getModel("DateModel").setProperty("/partQtyValState", "None");
				this.getView().getModel("DateModel").setProperty("/PartValState", "None");
				this.getView().getModel("DateModel").setProperty("/competitorValueState", "None");
				this.obj.zc_itemSet.results.push(itemObj);
				this.getView().byId("idPartQty").setValueState("None");
				this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", true);
				oPMPModel.create("/ZC_HEAD_PMPSet", this.obj, {

					success: $.proxy(function (data, response) {
						this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);

						PmpDataManager._fnClaimSum(this);

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
								PmpDataManager._fnClearPartData(this);

								oTable.removeSelections("true");

							}, this),
							error: $.proxy(function (err) {
								MessageToast.show(oBundle.getText("SystemInternalError"));
								this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
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

		onSelectCompetitorCity: function (oEvent) {
			var SelectedCity = oEvent.getSource().getSelectedKey();
			var oCities = this.getModel("LocalDataModel").getProperty("/itemList");
			var oSelectedProvince = oCities.filter(function (item) {
				return item.city === SelectedCity;
			});
			this.getModel("LocalDataModel").setProperty("/ProviceSet", oSelectedProvince);

		},

		_fnSaveClaim: function () {

			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}

			PmpDataManager._fnDistanceValidation(this);

			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");

			var oClaimtype = this.getModel("LocalDataModel").getProperty("/GroupDescriptionName");
			var oClmType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oClmSubType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			var oGroupType = this.getModel("LocalDataModel").getProperty("/WarrantyClaimTypeGroup");
			var oCurrentDate = new Date();
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
					bValidationError = PmpDataManager._validateInput(oInput) || bValidationError;
				}
			});

			if (bValidationError) {
				// this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			} else if (this.getView().getModel("HeadSetData").getProperty("/DealerInvoiceDate") > oCurrentDate) {
				this.getView().byId("idMainClaimMessage").setText(oBundle.getText("InvDateCanNotGreaterThanCurDate"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				PmpDataManager._fnUpdateHeaderProp(this);
				this.obj.DBOperation = "SAVE";
				this.obj.Message = "";
				this.obj.Partner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
				this.obj.PartnerRole = "AS";
				this.obj.ReferenceDate = PmpDataManager._fnDateFormat(oCurrentDt);
				

				this.obj.zc_itemSet.results = [];
				this.obj.zc_claim_item_price_dataSet.results = [];
				this.obj.zc_claim_attachmentsSet.results = [];

				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
					success: $.proxy(function (data, response) {

						this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", data.NumberOfWarrantyClaim);
						this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", data.NumberOfWarrantyClaim);
						MessageToast.show(oBundle.getText("Claimhasbeensavedsuccessfully"), {
							my: "center center",
							at: "center center"
						});

						this.getModel("LocalDataModel").setProperty("/oSavePartIndicator", false);
						this.getView().byId("idMainClaimMessage").setProperty("visible", false);
						this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
						this.getModel("LocalDataModel").setProperty("/step01Next", true);
						this.getModel("LocalDataModel").setProperty("/FeedEnabled", true);
						this.getView().getModel("DateModel").setProperty("/saveClaimSt", false);
						this.getView().getModel("DateModel").setProperty("/updateClaimSt", true);
						this.getModel("LocalDataModel").setProperty("/CancelEnable", true);
						this.getModel("LocalDataModel").setProperty("/PrintEnable", true);
						this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
						this.getModel("LocalDataModel").setProperty("/UploadEnableSublet", true);
						this.getView().getModel("DateModel").setProperty("/oDamageLineBtn", true);

						if (oFinalDistanceNum > 80 && this.getView().byId("postal_code").getValue() != "") {
							this.getView().byId("idMainClaimMessage").setText(oBundle.getText("CompareDistanceError"));
							this.getView().byId("idMainClaimMessage").setType("Warning");
							this.getView().byId("idMainClaimMessage").setProperty("visible", true);
						} else {
							this.getView().byId("idMainClaimMessage").setProperty("visible", false);
						}

						PmpDataManager._fnClaimSum(this);

						oClaimModel.read("/ZC_CLAIM_HEAD_PMP", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + data.NumberOfWarrantyClaim +
									"'"
							},
							success: $.proxy(function (sdata) {

								this.getView().getModel("HeadSetData").setData(sdata.results[0]);

								PmpDataManager._fnStatusCheck(this);

								var oCLaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
								this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", oCLaim);
								this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oCLaim);

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

			var oFileName = this.oUploadedFile.name;

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

			this.obj.NumberOfWarrantyClaim = oClaimNum;
			this.obj.zc_claim_attachmentsSet.results.push(itemObj);
			this.obj.DBOperation = "SAVE";

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

							this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", oAttachSet);
							this.getView().byId("idMainClaimMessage").setProperty("visible", false);

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

			this.inputId = oController.getParameters().id;

			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"zclaimProcessing.view.fragments.partListPMP",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);

			}

			// open value help dialog
			this._valueHelpDialog.open();
		},
		_handleValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			this.oSelectedTitle = evt.mParameters.selectedItems[0].getCells()[0].getText();
			//var oBaseUint = evt.mParameters.selectedItems[0].getCells()[2].getText();
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
						if (oManuFactureValue != "" && oManuFactureValue != "?") {
							this.getView().getModel("PartDataModel").setProperty("/PartManufacturer", oManuFactureValue);
						}

						if (oPartTypeValue != "" && oPartTypeValue != "?") {
							this.getView().getModel("PartDataModel").setProperty("/PartType", oPartTypeValue);
						}

						this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "EA");
					} else {
						this.getView().getModel("PartDataModel").setProperty("/PartManufacturer", "");
						this.getView().getModel("PartDataModel").setProperty("/PartType", "");
						this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "EA");
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
			PmpDataManager._fnClearPartData(this);
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
				this.getView().getModel("PartDataModel").setProperty("/CompetitorPrice", Number(obj.CompetitorPrice / obj.QtyHrs));
				this.getView().getModel("PartDataModel").setProperty("/PartManufacturer", obj.PartManufacturer);
				this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", obj.Meins);
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
			PmpDataManager._fnClearPartData(this);
		},

		onPressDeletePart: function () {
			var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			var oTable = this.getView().byId("idTableParts");
			var oTableIndex = oTable._aSelectedPaths;
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
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

												PmpDataManager._fnClaimSum(this);

											}, this),
											error: $.proxy(function (err) {
												MessageToast.show(oBundle.getText("SystemInternalError"));
												this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", false);
											}, this)
										});

										oTable.removeSelections("true");
										MessageToast.show(oBundle.getText("ItemDeletedSuccessfully"), {
											my: "center center",
											at: "center center"
										});

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

			var oPostalCodeVal = oEvent.getSource().getValue().toUpperCase();
			this.getView().getModel("HeadSetData").setProperty("/CompetitorPost", oPostalCodeVal);

			var getText = PmpDataManager.isValidPostalCode(oPostalCodeVal, "CA");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (!getText) {
				this.getView().getModel("HeadSetData").setProperty("/CompetitorPost", "");
				MessageToast.show(
					oBundle.getText("InvalidPostalCode"), {
						my: "center center",
						at: "center center"
					});
			} else {
				this._fnDistanceCalculate();
				setTimeout($.proxy(function () {
					var oPostalCode = this.getView().byId("postal_code");
					oPostalCode.setProperty("enabled", false);
				}, this), 2000)
			}
		},

		onSubmitTci: function (oEvent) {

			PmpDataManager._fnDistanceValidation(this);

			var sSelectedLocale, bValidationError;

			var that = this;

			var oClaimModel = this.getModel("zDLRCLAIMPMPSRV");
			var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			PmpDataManager._fnUpdateHeaderProp(this);

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

							this.getView().getModel("DateModel").setProperty("/partLine", false);

							if (oFinalDistanceNum > 80 && this.getView().byId("postal_code").getValue() != "") {

								MessageBox.error(oBundle.getText("CompareDistanceError"), {
									my: "center center",
									at: "center center"
								});

							} else if (this.getModel("LocalDataModel").getProperty("/HeadAtchmentData").length == 0) {

								MessageBox.error(oBundle.getText("PMPSupportingDocumentErr"), {
									my: "center center",
									at: "center center"
								});

							} else if (
								this.getView().getModel("HeadSetData").getProperty("/CompetitorAddr") == "" ||
								this.getView().getModel("HeadSetData").getProperty("/CompetitorCity") == "" ||
								this.getView().getModel("HeadSetData").getProperty("/CompetitorProv") == "" ||
								this.getView().getModel("HeadSetData").getProperty("/CompetitorPost") == "" ||
								this.getView().getModel("HeadSetData").getProperty("/QuoteDate") == "" ||
								this.getView().getModel("HeadSetData").getProperty("/CustomerFullName") == ""

							) {

								MessageBox.error(oBundle.getText("Competitorinformationcannotblank"), {
									my: "center center",
									at: "center center"
								});

							} else {
								this.getView().getModel("DateModel").setProperty("/errorBusyIndicator", true);
								oClaimModel.refreshSecurityToken();
								oClaimModel.create("/ZC_HEAD_PMPSet", this.obj, {
									success: $.proxy(function (data, response) {
										this.getView().byId("idMainClaimMessage").setProperty("visible", false);

										PmpDataManager._fnClaimSum(this);

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
													"'and LanguageKey eq '" + PmpDataManager.fnReturnLanguage() + "'",
												"$expand": "zc_claim_vsrSet"
											},
											success: $.proxy(function (errorData) {

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

												PmpDataManager._fnStatusCheck(this);

												if (sdata.results[0].DecisionCode == "ZTIC" || sdata.results[0].DecisionCode == "ZTRC") {

													PmpDataManager._fnEnableDisablebtn(this, true);
													MessageToast.show(
														oBundle.getText("ClaimNumber") + " " + oClaimNum + " " + oBundle.getText(
															"RejectedTCIValidationResultsdetails"), {
															my: "center center",
															at: "center center"
														});

												} else {
													PmpDataManager._fnEnableDisablebtn(this, false);
													MessageToast.show(oBundle.getText("ClaimNumber") + " " + oClaimNum + " " + oBundle.getText(
														"successfullysubmittedTCI"), {
														my: "center center",
														at: "center center"
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
		},

		onPressPrint: function () {

			var oClaimtype = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			var isProxy = "";
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			if (oClaimtype == "ZSPM") {
				var w = window.open(isProxy +
					"/node/ZDLR_CLAIM_PMP_SRV/zc_claim_printSet(NumberOfWarrantyClaim='" + oClaimNum + "',PrintType='')/$value",
					'_blank');

				if (w == null) {
					console.log("Error");
				}
			}
		},
		onAfterAutoComplete: function () {

			setTimeout($.proxy(function () {
				this.getView().getModel("DateModel").setProperty("/addEnbAutoCom", false);
				var oPostalCode = this.getView().byId("postal_code");
				var oProvince = this.byId("administrative_area_level_1");
				var oPostalVal = oPostalCode.getValue();
				if (oPostalVal != "") {
					oPostalCode.setProperty("enabled", false);
				} else {
					oPostalCode.setProperty("enabled", true);
				}
				if (oProvince.getValue().length > 3 || oProvince.getValue() == "") {
					this.getView().getModel("HeadSetData").setProperty("/CompetitorProv", "");
					this.getView().byId("administrative_area_level_1").setValue("");
					this.getView().getModel("DateModel").setProperty("/provinceEnable", true);
				} else {
					this.getView().getModel("HeadSetData").setProperty("/CompetitorProv", this.getView().byId("administrative_area_level_1").getValue() ||
						"");
					this.getView().getModel("DateModel").setProperty("/provinceEnable", false);
				}

				//this.getView().getModel("HeadSetData").setProperty("", this.getView().byId("administrative_area_level_1").getValue());
				this.getView().getModel("HeadSetData").setProperty("/CompetitorAddr", this.getView().byId("street_number").getValue() || "");
				this.getView().getModel("HeadSetData").setProperty("/CompetitorCity", this.getView().byId("locality").getValue() || "");

				this.getView().getModel("HeadSetData").setProperty("/CompetitorPost", this.getView().byId("postal_code").getValue() || "");

				this._fnDistanceCalculate();
			}, this), 2000)
		}

	});

});