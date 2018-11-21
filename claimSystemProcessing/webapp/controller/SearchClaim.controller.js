sap.ui.define([
	"zclaimProcessing/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.SearchClaim", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.SearchClaim
		 */
		onInit: function () {
	
			
		var oDateModel = new sap.ui.model.json.JSONModel();
			var PriorDate = new Date();
			oDateModel.setData({
				dateValueDRS2: new Date(new Date().setDate(PriorDate.getDate() - 30)),
				secondDateValueDRS2: PriorDate,
				dateCurrent: new Date()
			});
			this.getView().setModel(oDateModel, "DateModel");
			var oBusinessModel = this.getModel("ApiBusinessModel");
			this.getView().setModel(oBusinessModel, "OBusinessModel");
			//console.log(sap.ui.getCore().getConfiguration().getLanguage());
			this.getView().setModel(this.getModel("ProssingModel"));
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimGroupdata = [];
			var oClaimGroupObj = [];
			oClaimModel.read("/ZC_CLAIM_GROUP", {

				success: $.proxy(function (data) {
					var oClaimData = data.results;
					for (var i = 0; i < oClaimData.length; i++) {
						if (oClaimGroupdata.indexOf(oClaimData[i].ClaimGroupDes) < 0) {

							oClaimGroupdata.push(
								oClaimData[i].ClaimGroupDes
							);

						}
					}

					oClaimGroupdata.forEach(function (item) {
						oClaimGroupObj.push({
							CLaimGroupDes: item
						});
					});
					console.log(oClaimGroupObj);
					this.getModel("LocalDataModel").setProperty("/ClaimStatusDataGroup", oClaimGroupObj);
				}, this)
			});

			if (sap.ui.getCore().getConfiguration().getLanguage() === "fr") {
				//	this.getModel("LocalDataModel").setProperty("/lang", "FR");
				oClaimModel.read("/ZC_CLAIM_STATUS_DESC", {
					urlParameters: {
						"$filter": "LanguageKey eq 'FR'"
					},
					success: function (data) {
						console.log(data);
						//this.getModel("LocalDataModel").setProperty("/ClaimStatus", data.results);
					}
				});
			} else {
				oClaimModel.read("/ZC_CLAIM_STATUS_DESC", {
					urlParameters: {
						"$filter": "LanguageKey eq 'EN'"
					},
					success: $.proxy(function (data) {
						console.log(data);
						this.getModel("LocalDataModel").setProperty("/ClaimStatus", data.results);
					}, this)
				});
			}
			var oArrClaimGroup = [];
			var oClaimGroup = [];
			oClaimModel.read("/ZC_CLAIM_HEAD?", {
				urlParameters: {
					"$select": "WarrantyClaimGroup"

				},
				success: $.proxy(function (data) {
					for (var i = 0; i < data.results.length; i++) {
						if (data.results[i].WarrantyClaimGroup !== "" && oArrClaimGroup.indexOf(data.results[i].WarrantyClaimGroup) < 0) {
							oArrClaimGroup.push(data.results[i].WarrantyClaimGroup);
						}
					}
					for (var j = 0; j < oArrClaimGroup.length; j++) {
						oClaimGroup.push({
							"WarrantyClaimGroup": oArrClaimGroup[0]
						});
					}
					console.log(oClaimGroup);

					this.getModel("LocalDataModel").setProperty("/WarrantyClaimGroups", oClaimGroup);
				}, this)
			});
		},
		onAfterRendering: function () {
			this.getView().byId("idDealerCode").setSelectedKey("2400042350");
			this.getView().byId("idDealerCode").setValue("42350");

			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/DealerText", "42350");
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/AdditionalText", "Bolton Toyota 2033664 ONTARIO LTD.");
			//var ogetAdditionalText = this.getView().byId("idDealerCode").getValue();
		},
		fnOnSelectDealer: function (oEvent) {
			var ogetAdditionalText = oEvent.getParameters().selectedItem.getAdditionalText();
			var ogetDealer = this.getView().byId("idDealerCode").getValue();
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/DealerText", ogetDealer);
			this.getOwnerComponent().getModel("LocalDataModel").setProperty("/AdditionalText", ogetAdditionalText);
		},
		onSelectGroup: function (oEvent) {
			var oText = oEvent.getParameters().selectedItem.getText();
			var oProssingModel = this.getModel("ProssingModel");
			oProssingModel.read("/ZC_CLAIM_GROUP", {
				urlParameters: {
					"$filter": "ClaimGroupDes eq '" + oText + "'"
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/ClaimType", data.results);

				}, this)
			});
		},

		handleSelectClaimGroupFinish: function (oEvent) {
			this.oArr = oEvent.getParameters().selectedItems;
			this.oStatusKey = [];
			for (var i in this.oArr) {
				if (!$.isEmptyObject(this.oArr[i].getKey())) {
					this.oStatusKey.push(this.oArr[i].getKey());
				}
			}
			console.log(this.oStatusKey);
		},
		onSearchBy: function (oEvent) {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oKey = oEvent.getParameters().selectedItem.getKey();
			if (oKey === "RepairOrderNumberExternal") {
				this.getView().byId("idCLREDate").setText(this.oBundle.getText("RepairOrderDate"));
			} else {
				this.getView().byId("idCLREDate").setText(this.oBundle.getText("ClaimSubmissionDate"));
			}
		},
		onPressSearch: function (oEvent) {

			var sQueryDealer = this.getView().byId("idDealerCode").getSelectedKey();
			console.log(sQueryDealer, this.oStatusKey);
			var sQuerySearchBy = this.getView().byId("idSearchBy").getSelectedKey();
			var sQuerySearchText = this.getView().byId("idSearchText").getValue();
			var sQueryClaimGroup = this.getView().byId("idClaimGroup").getSelectedKey();
			var sQueryClaimType = this.getView().byId("idClaimType").getSelectedKey();

			var sQueryStat = this.byId("idClaimStatus").getSelectedKeys();
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			var andFilter = [];
			var sQueryDate = this.getView().byId("DRS2").getValue();
			var FromDate = this.getView().getModel("DateModel").getProperty("/dateValueDRS2");
			var ToDate = this.getView().getModel("DateModel").getProperty("/secondDateValueDRS2");
			var FromDateFormat = FromDate.toDateString();
			var ToDateFormat = ToDate.toDateString();
			console.log(FromDateFormat, ToDateFormat);
			var sDate = "";
			var oResult = [];
			if (sQuerySearchBy === "RepairOrderNumberExternal") {
				sDate = "RepairDate";

			} else {
				sDate = "ReferenceDate";

			}

			//var oFilterArr = [];
			//var orFilter = [];
			//var newFilter = [];
			//	console.log(sQueryDealer, sQuerySearchBy, sQuerySearchText, sQueryClaimGroup, sQueryClaimType, this.oStatusKey);

			if (!$.isEmptyObject(sQueryStat)) {

				for (var j = 0; j < sQueryStat.length; j++) {

					oResult.push(new sap.ui.model.Filter("ProcessingStatusOfWarrantyClm", sap.ui.model.FilterOperator.EQ, sQueryStat[j]));

				}
			}

			if (!$.isEmptyObject(sQueryDate, sQueryDealer) && $.isEmptyObject(sQuerySearchText, sQueryClaimType, sQueryStat)) {

				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat)
					],
					and: true
				});
			} else if (!$.isEmptyObject(sQueryDate, sQueryDealer, sQuerySearchText) && $.isEmptyObject(sQueryClaimType, sQueryStat)) {
				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sQuerySearchBy, sap.ui.model.FilterOperator.EQ, sQuerySearchText)

					],
					and: true
				});
			} else if (!$.isEmptyObject(sQuerySearchText, sQueryClaimType, sQueryDate, sQueryDealer) && $.isEmptyObject(sQueryStat)) {
				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sQuerySearchBy, sap.ui.model.FilterOperator.EQ, sQuerySearchText),
						new sap.ui.model.Filter("WarrantyClaimType", sap.ui.model.FilterOperator.EQ, sQueryClaimType)
					],
					and: true
				});
			} else if (!$.isEmptyObject(sQueryClaimType, sQueryDate, sQueryDealer) && $.isEmptyObject(sQueryStat, sQuerySearchText)) {
				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter("WarrantyClaimType", sap.ui.model.FilterOperator.EQ, sQueryClaimType)
					],
					and: true
				});
			} else if (!$.isEmptyObject(sQueryStat, sQueryClaimType, sQueryDate, sQueryDealer) && $.isEmptyObject(sQuerySearchText)) {

				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter("WarrantyClaimType", sap.ui.model.FilterOperator.EQ, sQueryClaimType),
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter(oResult)

					],
					and: true
				});

			} else if (!$.isEmptyObject(sQueryStat, sQuerySearchText, sQueryDate, sQueryDealer) && $.isEmptyObject(
					sQueryClaimType)) {
				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sQuerySearchBy, sap.ui.model.FilterOperator.EQ, sQuerySearchText),
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter(oResult)

					],
					and: true
				});

			} else if (!$.isEmptyObject(sQueryStat, sQueryDate, sQueryDealer) && $.isEmptyObject(sQueryClaimType, sQuerySearchText)) {

				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter(oResult)
					],
					and: true
				});

			} else if (!$.isEmptyObject(sQueryDate, sQueryDealer, sQuerySearchText, sQueryClaimType, sQueryStat)) {

				andFilter = new sap.ui.model.Filter({
					filters: [

						new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.EQ, sQueryDealer),
						new sap.ui.model.Filter(sQuerySearchBy, sap.ui.model.FilterOperator.EQ, sQuerySearchText),
						new sap.ui.model.Filter("WarrantyClaimType", sap.ui.model.FilterOperator.EQ, sQueryClaimType),
						new sap.ui.model.Filter(sDate, sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat),
						new sap.ui.model.Filter(oResult)
					],
					and: true
				});

			}
			var oTable = this.getView().byId("idClaimTable");
			var oBindItems = oTable.getBinding("items");
			oBindItems.filter(andFilter);

		},

		onPressClear: function () {

			var andFilter = [];
			var oTable = this.getView().byId("idClaimTable");
			var oBindItems = oTable.getBinding("items");
			oBindItems.filter(andFilter);
			this.getView().byId("idSearchText").setValue("");
			this.getView().byId("idClaimGroup").setSelectedKey("");
			this.getView().byId("idClaimType").setSelectedKey("");
			this.getView().byId("idClaimStatus").setSelectedItems("");
		},
		onPressClaim: function (oEvent) {
			var oClaimNum = oEvent.getSource().getText();
			this.getOwnerComponent().getRouter().navTo("PartsMainSection", {
				claimNum : oClaimNum
			});
		},
		onCreateNewClaim: function () {
			this.getRouter().navTo("NewClaimSelectGroup");

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zclaimProcessing.view.SearchClaim
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zclaimProcessing.view.SearchClaim
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.SearchClaim
		 */
		//	onExit: function() {
		//
		//	}

	});

});