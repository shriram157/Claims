sap.ui.define([
	"zclaimProcessing/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.ClaimInquiry", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.ClaimInquiry
		 */
		onInit: function () {
			this.getView().setModel(this.getModel("ProssingModel"));
			var PriorDate = new Date();
			var oDateModel = new sap.ui.model.json.JSONModel();
			oDateModel.setData({
				dateValueDRS2: new Date(new Date().setDate(PriorDate.getDate() - 30)),
				secondDateValueDRS2: PriorDate,
				dateCurrent: new Date()
			});
			this.getView().setModel(oDateModel, "DateModel");
		},
		onPressSearch: function () {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			var andFilter = [];
			var sQuery = this.getView().byId("idVin").getValue();
			var FromDate = this.getView().getModel("DateModel").getProperty("/dateValueDRS2");
			var ToDate = this.getView().getModel("DateModel").getProperty("/secondDateValueDRS2");
			var FromDateFormat = oDateFormat.format(FromDate);
			var ToDateFormat = oDateFormat.format(ToDate);
			if (sQuery != "") {
				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("ExternalObjectNumber", sap.ui.model.FilterOperator.EQ, sQuery),
						new sap.ui.model.Filter("ReferenceDate", sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat)
					],
					and: true
				});
			} else {
				andFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("ReferenceDate", sap.ui.model.FilterOperator.BT, FromDateFormat, ToDateFormat)
					],
					and: true
				});
			}
			var oTable = this.getView().byId("idClaimInquiryTable");
			var oBindItems = oTable.getBinding("rows");
			oBindItems.filter(andFilter);

		},
		onPressClaimInquiryDetails: function () {
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.ClaimInquiryDetails", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zclaimProcessing.view.ClaimInquiry
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zclaimProcessing.view.ClaimInquiry
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.ClaimInquiry
		 */
		//	onExit: function() {
		//
		//	}

	});

});