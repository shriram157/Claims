sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	"zclaimProcessing/utils/formatter",
	'sap/m/MessageBox',
	'sap/m/MessageToast',
], function (BaseController, formatter, MessageBox, MessageToast) {
	"use strict";
	var agreementno = '',
		dometerunit, that, tableActiveAgreement = [];
	return BaseController.extend("zclaimProcessing.controller.QueryCoverageTools", {
		formatter: formatter,
		/**
		
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.QueryCoverageTools
		 */
		onInit: function () {
			//Model data set for Header Links visibility as per User login

			var oDateModel = new sap.ui.model.json.JSONModel();
			that = this;
			oDateModel.setData({
				foreignVinInd: false,
				writtenOffInd: false,
				specialVinInd: false,
				oAgrTable: false,
				VIN: ""
			});

			oDateModel.setDefaultBindingMode("TwoWay");
			this.getView().setModel(oDateModel, "DateModel");

			var HeadSetData = new sap.ui.model.json.JSONModel();

			HeadSetData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(HeadSetData, "HeadSetData");

			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRoutMatched, this);

		},
		_onRoutMatched: function (oEvent) {

			this.getView().setModel(sap.ui.getCore().getModel("HeaderLinksModel"), "HeaderLinksModel");

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				this.sPrefix = "/Claim_Destination";
				this.attributeUrl = "/userDetails/attributesforlocaltesting";
			} else {
				this.sPrefix = "";
				this.attributeUrl = "/userDetails/attributes";
			}

			$.ajax({
				url: this.sPrefix + "/app-config",
				type: "GET",
				dataType: "json",
				success: $.proxy(function (appData) {

					this.getModel("LocalDataModel").setProperty("/oECPURL", appData.ecpSalesAppUrl);
					this.getModel("LocalDataModel").setProperty("/oCICURL", appData.cicUrl);
					this.getModel("LocalDataModel").setProperty("/oCVSHURL", appData.cvshUrl);
				}, this),
				error: function (err) {
					MessageToast.show(err);
				}
			});

			// 	try {
			// 		await this.getDealer();
			// 		console.log("HeaderLinksModel", sap.ui.getCore().getModel("HeaderLinksModel"));
			// 		this.getView().setModel(sap.ui.getCore().getModel("HeaderLinksModel"), "HeaderLinksModel");
			// 		if (sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "TCI_User" || sap.ui.getCore().getModel(
			// 				"UserDataModel").getProperty("/LoggedInUser") == "Dealer_User") {
			// 			that.getOwnerComponent().getRouter().navTo("QueryCoverageTools");

			// 		}
			// 	} catch (err) {
			// 		console.log(err);
			// 	}

			//MessageBox.Action.CLOSE();
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

		onEnterVIN: function (oEvent) {

			var oVin = oEvent.getParameters().value.toUpperCase();

			this.getView().getModel("DateModel").setProperty("/VIN", oVin);
			var oProssingModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			//this.getModel("LocalDataModel").setProperty("/selectedVehicle", oVin);

			oProssingModel.read("/ZC_GET_FORE_VIN(p_vhvin='" + oVin + "')/Set", {
				success: $.proxy(function (data) {
					this.getView().getModel("LocalDataModel").setProperty("/oVinDetisl", data.results);
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
							this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseEnterValidVIN"));
							this.getView().byId("idMainClaimMessage").setType("Error");
						} else {
							this.getView().getModel("HeadSetData").setProperty("/ForeignVINIndicator", "No");
							this.getView().getModel("DateModel").setProperty("/specialVinInd", false);
							this.getView().getModel("DateModel").setProperty("/writtenOffInd", false);
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

		},
		onLiveVINEnter: function (oEvent) {
			// 			var oVin = oEvent.getParameters().value.toUpperCase();
			// 			this.getView().getModel("DateModel").setProperty("/VIN", oVin);
			// 			if (oVin.length > 17) {
			// 				this.getView().byId("vin").setValue("");
			// 			}
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
				"#/AgreementInquiry/" + oECPAgr + "/" + this.getView().getModel("DateModel").getProperty("/VIN") + "",
				'_blank');
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zclaimProcessing.view.QueryCoverageTools
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zclaimProcessing.view.QueryCoverageTools
		 */
		onAfterRendering: function () {
			//this.byId('idActiveAgreement').getBinding('rows').filter([new sap.ui.model.Filter("VIN", sap.ui.model.FilterOperator.EQ, '0')]);
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.QueryCoverageTools
		 */
		//	onExit: function() {
		//
		//	}
		onPressSearch: function (oEvent) {
			var oECPModel = this.getModel("EcpSalesModel");
			var sSelectedLocale;
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				this.sPrefix = "/Claim_Destination"; //ecpSales_node_secured
				this.attributeUrl = "/userDetails/attributesforlocaltesting";
			} else {
				this.sPrefix = "";
				this.attributeUrl = "/userDetails/attributes";
			}
			var Bundle = this.getView().getModel("i18n").getResourceBundle();
			var Messageinvalid = Bundle.getText('Vin_I');
			var oVin = this.getView().byId('vin').getValue();
			this.getModel("LocalDataModel").setProperty("/selectedVehicle", oVin);
			var that = this;

			var oProssingModel = this.getModel("ProssingModel");
			if (oVin != "" && this.getView().getModel("LocalDataModel").getProperty("/oVinDetisl/0/Message") != "Invalid VIN Number" &&
				this.getView().byId('Odometer').getValue() != "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				oProssingModel.read("/zc_cliam_agreement", {
					urlParameters: {
						"$filter": "VIN eq '" + oVin + "'"
					},
					success: $.proxy(function (agrData) {
						this.getModel("LocalDataModel").setProperty("/AgreementDataECP", agrData.results);
						if (agrData.results.length > 0) {
							this.getView().getModel("DateModel").setProperty("/oAgrTable", true);
						} else {
							this.getView().getModel("DateModel").setProperty("/oAgrTable", false);
						}

					}, this),
					error: function () {}
				});

				var oBundle = this.getView().getModel("i18n").getResourceBundle();

				oProssingModel.read("/zc_vehicle_informationSet", {
					urlParameters: {
						"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'and Vin eq '" + oVin + "'",
						"$expand": "ZC_SPECIAL_HANDLINGVEHICLESET,ZC_WRITTENOFFVEHICLESET"

					},
					//	"$expand": "ZC_SPECIAL_HANDLINGVEHICLESET, ZC_WRITTENOFFVEHICLESET"
					success: $.proxy(function (vehData) {
						this.getModel("LocalDataModel").setProperty("/DataVinDetails", vehData.results[0]);
						//var oRepDate = this.getView().getModel("HeadSetData").getProperty("/RepairDate");
						var regTime = new Date(vehData.results[0].RegDate).getTime();
						var repTime = new Date().getTime();
						var oMonth = (regTime - repTime) / (1000 * 60 * 60 * 24 * 30);
						//parseFloat(oMonth).toFixed(2);
						this.getModel("LocalDataModel").setProperty("/VehicleMonths", Math.abs(oMonth.toFixed(1)));

						if (vehData.results[0].ForeignVIN == "YES") {
							dometerunit = 'MI';
							this.getView().getModel("DateModel").setProperty("/foreignVinInd", true);
							this.getModel("LocalDataModel").setProperty("/MsrUnit", oBundle.getText("distancemiles"));
						} else {
							dometerunit = 'KM';
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
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText(Bundle.getText("FillUpMandatoryField"));
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getModel("LocalDataModel").setProperty("/AgreementDataECP", "");
				this.getModel("LocalDataModel").setProperty("/DataVinDetails", "");
				this.getModel("LocalDataModel").setProperty("/DataSpecialHandlingSet", "");
				this.getModel("LocalDataModel").setProperty("/DataWrittenOffSet", "");
				this.getModel("LocalDataModel").setProperty("/VehicleMonths", "");
				this.getView().getModel("DateModel").setProperty("/foreignVinInd", false);
				this.getView().getModel("DateModel").setProperty("/writtenOffInd", false);
				this.getView().getModel("DateModel").setProperty("/specialVinInd", false);
			}

			//----------------------------------------------
			//-------Get Aggrements--------------------------
			//----------------------------------------------
			// 			this.getView().byId('idActiveAgreement').getBinding('rows').filter([new sap.ui.model.Filter("VIN", sap.ui.model.FilterOperator.EQ,
			// 				oVin)]);

		},
		onNavigate: function (oEvent) {
			var oPath = oEvent.getSource().getSelectedContextPaths()[0];
			var obj = this.getModel("LocalDataModel").getProperty(oPath);
			agreementno = obj.AgreementNumber;

			// 			if (agreementno !== '' && agreementno == newvalue) {
			// 				agreementno = '';
			// 			} else {
			// 				agreementno = newvalue;
			// 			}

		},
		onPressLookUp: function (oEvent) {
			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}

			var zdateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			var zddate = new Date();
			var currentdate = zdateFormat.format(zddate);
			var Bundle = this.getView().getModel("i18n").getResourceBundle();
			var Messagevalidf = Bundle.getText('Requf');
			var oVin = this.getView().byId('vin').getValue();
			var odmeter = this.getView().byId('Odometer').getValue();
			var partofp = this.getView().byId('partofp').getValue();
			var mainop = this.getView().byId('mainop').getValue();
			//var agreementselected = agreementno || '';
			var agreementselected;

			if (agreementno != "") {
				agreementselected = agreementno;
			} else {
				agreementselected = "";
			}

			var oXMLMsg;

			var oProssingModel = this.getModel("ProssingModel");

			// 			/sap/opu / odata / sap / ZDLR_CLAIM_SRV / zc_coverageSet ? $filter = VIN eq '2T1BU4EE3AC213900'
			// 			and OdometerReading eq '55000'
			// 			and OdometerUOM eq 'KM'
			// 			and OFP eq '423110C010'
			// 			and MainOpsCode eq '160011'
			// 			and RepairDate eq datetime '2018-12-18T00:00:00'
			// 			and LanguageKey eq 'EN'
			// 			and AgreementNumber eq 'A0000000000000520' & $format = json
			// reqFilterObj.VIN = oVin
			// reqFilterObj.OdometerReading = odmeter
			// reqFilterObj.OFP = partofp
			// reqFilterObj.MainOpsCode = mainop
			// reqFilterObj.RepairDate = currentdate
			// reqFilterObj.LanguageKey = sSelectedLocale.toUpperCase()
			// reqFilterObj.OdometerUOM = dometerunit
			// reqFilterObj.AgreementNumber = agreementselected
			var alreadyExists = tableActiveAgreement.filter(function (k) {

				if (k.VIN == oVin && k.OdometerReading == odmeter && K.OFP == partofp && k.MainOpsCode == mainop && k.RepairDate == currentdate &&
					k.LanguageKey == sSelectedLocale.toUpperCase() && k.OdometerUOM == dometerunit &&
					reqFilterObj.AgreementNumber == agreementselected) {
					console.log("Value of K" + k);
					return exit;
				} else {
					return notExit;
				}
				console.log("alreadyExists...." + alreadyExists);

			});

			if (alreadyExists == "notExit") {
				if (oVin != '' && odmeter != '' && partofp != '' && mainop != '') {
					oProssingModel.read("/zc_coverageSet", {
						urlParameters: {
							"$filter": "VIN eq '" + oVin + "'and OdometerReading eq '" + odmeter + "'and OFP eq '" + partofp + "'and MainOpsCode eq '" +
								mainop + "'and RepairDate eq datetime'" + currentdate + "'and LanguageKey eq '" +
								sSelectedLocale.toUpperCase() + "'and OdometerUOM eq '" + dometerunit + "'and AgreementNumber eq '" + agreementselected +
								"'"
						},
						success: $.proxy(function (data) {

							//INC0239353     CPS quick coverage tool   Shriram  11-OCT-2023    Code Start

							if (this.getModel("LocalDataModel").getProperty("/CoverageSet") == undefined || this.getModel("LocalDataModel").getProperty(
									"/CoverageSet") == "") {
								this.getModel("LocalDataModel").setProperty("/CoverageSet", data.results);
							} else {
								var tableData = this.getModel("LocalDataModel").getProperty("/CoverageSet");
								// var alreadyExists = data.results.filter(function (k) {
								// 	for (var i = 0; i < tableData.length; i++) {

								// 		// if (k.OFP != tableData[i].OFP && k.PartDes != tableData[i].PartDes && k.MainOp != tableData[i].MainOp && k.MainOpDes !=
								// 		// 	tableData[i].MainOpDes && k.Coverage != tableData[i].Coverage) {
								tableData.push(data.results);
								// 		// }
								// 	}

								// });

								this.getModel("LocalDataModel").setProperty("/CoverageSet", tableData);
								this.getModel("LocalDataModel").updateBindings(true);

								// for (var i = 0; i < tableAgreementNumber.length; i++) {
								// 	if (i == tableAgreementNumber.length) {
								// 		tableAgreementNumber[i] = agreementselected;
								// 	}
								// }

							}
							var reqFilterObj = {};
							reqFilterObj.VIN = oVin;
							reqFilterObj.OdometerReading = odmeter;
							reqFilterObj.OFP = partofp;
							reqFilterObj.MainOpsCode = mainop;
							reqFilterObj.RepairDate = currentdate;
							reqFilterObj.LanguageKey = sSelectedLocale.toUpperCase();
							reqFilterObj.OdometerUOM = dometerunit;
							reqFilterObj.AgreementNumber = agreementselected;

							tableActiveAgreement.push(reqFilterObj);

							//INC0239353     CPS quick coverage tool   Shriram  11-OCT-2023    Code End
							//	this.getModel("LocalDataModel").setProperty("/CoverageSet", data.results);
						}, this),
						error: function (error) {
							var oError = error.responseText.split("{")[3].split(":")[2].split("}")[0];
							MessageToast.show(oError, {
								my: "center center",
								at: "center center"
							});

						}
					});
					// var filters = [];
					// filters = [
					// 	new sap.ui.model.Filter("VIN", sap.ui.model.FilterOperator.EQ, oVin),
					// 	new sap.ui.model.Filter("OdometerReading", sap.ui.model.FilterOperator.EQ, odmeter),
					// 	new sap.ui.model.Filter("OFP", sap.ui.model.FilterOperator.EQ, partofp),
					// 	new sap.ui.model.Filter("LanguageKey", sap.ui.model.FilterOperator.EQ, 'EN'),
					// 	new sap.ui.model.Filter("MainOpsCode", sap.ui.model.FilterOperator.EQ, mainop),
					// 	new sap.ui.model.Filter("RepairDate", sap.ui.model.FilterOperator.EQ, currentdate),
					// 	new sap.ui.model.Filter("AgreementNumber", sap.ui.model.FilterOperator.EQ, agreementselected),
					// 	new sap.ui.model.Filter("OdometerUOM", sap.ui.model.FilterOperator.EQ, dometerunit) //till iget the odmeter km
					// ];

					// this.getView().byId('ofptable').getBinding('rows').filter(new sap.ui.model.Filter(filters, true));
					// this.getView().byId('ofptable').getModel('ProssingModel').attachRequestFailed(function (e) {
					// 	if (e.getParameters().response) {
					// 		if (e.getParameters().response.responseText && that.getView().byId('partofp').getValue() != '') {
					// 			var x = jQuery.parseXML(e.getParameters().response.responseText);
					// 			oXMLMsg = x.querySelector("message");
					// 			// 			MessageBox.show(oXMLMsg.textContent, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
					// 			MessageToast.show(oXMLMsg.textContent, {
					// 				my: "center center",
					// 				at: "center center"
					// 			});
					// 		} else {
					// 			// 			oXMLMsg = "";
					// 			// 			MessageBox.Action.CLOSE();
					// 		}
					// 	}
					// });

				} else {
					//	MessageBox.show(Messagevalidf, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
				}
			}

		},

		onPressClear: function (oEvent) {
			this.getView().byId('vin').setValue('');
			this.getView().byId("idECPAGR").removeSelections(true);
			this.getModel("LocalDataModel").setProperty("/CoverageSet", "");
			this.getView().byId('Odometer').setValue('');
			this.getView().byId('partofp').setValue('');
			this.getView().byId('mainop').setValue('');
			this.getView().getModel('LocalDataModel').setProperty('/DataVinDetails', '');
			this.getView().getModel('LocalDataModel').setProperty('/VehicleMonths', '');
			//this.byId('idActiveAgreement').getBinding('rows').filter([new sap.ui.model.Filter("VIN", sap.ui.model.FilterOperator.EQ, '0')]);
			this.getView().byId('ofptable').getBinding('rows').filter();
			this.getView().byId('idMainClaimMessage').setVisible(false);
			this.getModel("LocalDataModel").setProperty("/AgreementDataECP", "");
			this.getModel("LocalDataModel").setProperty("/DataVinDetails", "");
			this.getModel("LocalDataModel").setProperty("/DataSpecialHandlingSet", "");
			this.getModel("LocalDataModel").setProperty("/DataWrittenOffSet", "");
			this.getModel("LocalDataModel").setProperty("/VehicleMonths", "");
			this.getView().getModel("DateModel").setProperty("/foreignVinInd", false);
			this.getView().getModel("DateModel").setProperty("/writtenOffInd", false);
			this.getView().getModel("DateModel").setProperty("/specialVinInd", false);

			agreementno = '' //INC0239353  CPS quick coverage tool	  Shriram 18-SEPT-2023
		}
	});

});