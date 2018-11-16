sap.ui.define([
	"zclaimProcessing/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.MainClaimSection", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.MainClaimSection
		 */
		onInit: function () {

			var oDateModel = new sap.ui.model.json.JSONModel();
			oDateModel.setData({
				dateValueDRS2: new Date(2018, 1, 1),
				secondDateValueDRS2: new Date(2018, 2, 1),
				dateCurrent: new Date()
			});
			this.getView().setModel(oDateModel, "DateModel");
			var oNodeModel = new sap.ui.model.json.JSONModel();
			oNodeModel.loadData(jQuery.sap.getModulePath("zclaimProcessing.utils", "/Nodes.json"));

			this.getView().setModel(oNodeModel, "ClaimModel");

			this.getView().setModel(this.getOwnerComponent().getModel("ProssingModel"));

		},

		onStep01Next: function (oEvent) {
			var oFormContent = this.getView().byId("idRepairForm").getContent();
			var oValid = true;
			for (var i in oFormContent) {
				var oControl = oFormContent[i];
				if (oValid && oControl.getValue && oControl.getValue() === "") {
					oValid = false;
					break;
				}
			}

			if (!oValid) {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idRepairFormPanel").setProperty("expanded", true);
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().byId("idMainClaimMessage").setType("None");
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
			}

		},

		onStep02Next: function () {
			this.getView().byId("idFilter03").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
		},

		onStep03Next: function () {
			this.getView().byId("idFilter04").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
		},

		onStep04Next: function () {
			this.getView().byId("idFilter05").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab5");
		},

		onStep05Next: function () {
			this.getView().byId("idFilter06").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
		},

		onStep06Next: function () {
			this.getView().byId("idFilter07").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
		},

		onPressBack: function (oEvent) {
			this.ogetSelectedKey = this.getView().byId("idIconTabMainClaim").getSelectedKey();
			var ogetKey = this.ogetSelectedKey.split("Tab")[1];

			if (ogetKey > 1 && ogetKey <= 8) {
				var oSelectedNum = ogetKey - 1;
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab" + oSelectedNum + "");
			} else {
				this.getRouter().navTo("SearchClaim");
			}

		}

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
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.MainClaimSection
		 */
		//	onExit: function() {
		//
		//	}

	});

});