sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	"zclaimProcessing/utils/formatter",
	'sap/m/MessageBox'
], function (BaseController, formatter, MessageBox) {
	"use strict";
	var agreementno = '',
		dometerunit;
	return BaseController.extend("zclaimProcessing.controller.QueryCoverageTools", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.QueryCoverageTools
		 */
		onInit: function () {
			//Model data set for Header Links visibility as per User login
			console.log("HeaderLinksModel", sap.ui.getCore().getModel("HeaderLinksModel"));
			this.getView().setModel(sap.ui.getCore().getModel("HeaderLinksModel"), "HeaderLinksModel");
			var oDateModel = new sap.ui.model.json.JSONModel();
			oDateModel.setData({
				foreignVinInd: false,
				writtenOffInd: false,
				specialVinInd: false
			});
			this.getView().setModel(oDateModel, "DateModel");
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

			var oVin = oEvent.getParameters().value;
			var oProssingModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			

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
							this.getView().byId("idMainClaimMessage").setText(oBundle.getText("PleaseEnterValidVIN"));
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

		},
		onLiveVINEnter : function(oEvent){
			var oVin = oEvent.getParameters().value;
			if(oVin.length > 17){
				this.getView().byId("vin").setValue("");
			}
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
			this.byId('idActiveAgreement').getBinding('rows').filter([new sap.ui.model.Filter("VIN", sap.ui.model.FilterOperator.EQ, '0')]);
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.QueryCoverageTools
		 */
		//	onExit: function() {
		//
		//	}
		onPressSearch: function (oEvent) {
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
			var that = this;
			//-------------------------------------------------------------
			//-----Get Vehicle Details---------------------------------------
			//---------------------------------------------------------
			//var oUrl = this.sPrefix + "/node/ZDLR_CLAIM_SRV/zc_vehicle_informationSet?$filter=Vin eq" + "'" + oVin + "'";
			// $.ajax({
			// 	url: oUrl,
			// 	method: 'GET',
			// 	async: false,
			// 	dataType: 'json',
			// 	success: function (zdata, textStatus, jqXHR) {
			// 		if (zdata.d.results[0]) {
			// 			var oModel = new sap.ui.model.json.JSONModel();
			// 			if (zdata.d.results[0].RegDate) {
			// 				var zd1 = parseInt(zdata.d.results[0].RegDate.replace(/[^0-9]+/g, ''));
			// 				zdata.d.results[0].RegDate = new Date(zd1);
			// 			}
			// 			if (zdata.d.results[0].WrittenOff == 'YES') {
			// 				that.getView().byId('partofp').setEditable(false);
			// 				that.getView().byId('mainop').setEditable(false);
			// 			} else if (zdata.d.results[0].WrittenOff == 'NO') {
			// 				that.getView().byId('partofp').setEditable(true);
			// 				that.getView().byId('mainop').setEditable(true);
			// 			}
			// 			if (zdata.d.results[0].ForeignVIN == 'YES') {
			// 				dometerunit = 'MI';
			// 			} else if (zdata.d.results[0].ForeignVIN == 'NO') {
			// 				dometerunit = 'KM';
			// 			}
			// 			oModel.setData(zdata.d.results[0]);
			// 			that.getView().setModel(oModel, 'Vehicleinfo');
			// 		} else {
			// 			MessageBox.show(Messageinvalid, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
			// 		}

			// 	},
			// 	error: function (jqXHR, textStatus, errorThrown) {}
			// });
			
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oProssingModel = this.getModel("ProssingModel");
			oProssingModel.read("/zc_vehicle_informationSet", {
								urlParameters: {
									"$filter": "Vin eq '" + oVin + "'",
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
							
			//----------------------------------------------
			//-------Get Aggrements--------------------------
			//----------------------------------------------
			this.getView().byId('idActiveAgreement').getBinding('rows').filter([new sap.ui.model.Filter("VIN", sap.ui.model.FilterOperator.EQ,
				oVin)]);

		},
		onPressLookUp: function (oEvent) {
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
			var agreementselected = agreementno || '';

			if (oVin != '' && odmeter != '' && partofp != '' && mainop != '') {
				var filters = [];
				filters = [
					new sap.ui.model.Filter("VIN", sap.ui.model.FilterOperator.EQ, oVin),
					new sap.ui.model.Filter("OdometerReading", sap.ui.model.FilterOperator.EQ, odmeter),
					new sap.ui.model.Filter("OFP", sap.ui.model.FilterOperator.EQ, partofp),
					new sap.ui.model.Filter("LanguageKey", sap.ui.model.FilterOperator.EQ, 'EN'),
					new sap.ui.model.Filter("MainOpsCode", sap.ui.model.FilterOperator.EQ, mainop),
					new sap.ui.model.Filter("RepairDate", sap.ui.model.FilterOperator.EQ, currentdate),
					new sap.ui.model.Filter("AgreementNumber", sap.ui.model.FilterOperator.EQ, agreementselected),
					new sap.ui.model.Filter("OdometerUOM", sap.ui.model.FilterOperator.EQ, dometerunit) //till iget the odmeter km
				];
				this.getView().byId('ofptable').getBinding('rows').filter(new sap.ui.model.Filter(filters, true));

			} else {
				MessageBox.show(Messagevalidf, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
			}

		},
		onNavigate: function (oEvent) {
			var newvalue = oEvent.getParameter("rowContext").getObject().AgreementNumber;
			if (agreementno !== '' && agreementno == newvalue) {
				agreementno = '';
			} else {
				agreementno = newvalue;
			}

		},
		onPressClear: function (oEvent) {
			this.getView().byId('vin').setValue('');
			this.getView().byId('Odometer').setValue('');
			this.getView().byId('partofp').setValue('');
			this.getView().byId('mainop').setValue('');
			this.getView().getModel('Vehicleinfo').setData();
			this.byId('idActiveAgreement').getBinding('rows').filter([new sap.ui.model.Filter("VIN", sap.ui.model.FilterOperator.EQ, '0')]);
			this.getView().byId('ofptable').getBinding('rows').filter();
		}
	});

});