sap.ui.define([
	"zclaimProcessing/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.NewClaimSelectGroup", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.NewClaimSelectGroup
		 */
		onInit: function () {
			var oProssingModel = this.getModel("ProssingModel");
			var oClaimGroup = [];
			var oClaimGroupJson = [];
			oProssingModel.read("/ZC_CLAIM_GROUP", {
				success: $.proxy(function (data) {
					var odata = data.results;
					for (var i = 0; i < odata.length; i++) {
						if (oClaimGroup.indexOf(odata[i].ClaimGroupDes) < 0 && !$.isEmptyObject(odata[i].ClaimGroupDes)) {
							oClaimGroup.push(
								odata[i].ClaimGroupDes
							);
						}
						
					}

					for (var j = 0; j < oClaimGroup.length; j++) {
						oClaimGroupJson.push({
							ClaimGroupDes: oClaimGroup[j]
						});
					}
					this.getOwnerComponent().getModel("LocalDataModel").setProperty("/ClaimGroupData", oClaimGroupJson);
				

				}, this),
				error : function(){}
			});
			
			//sap.ui.getCore().getEventBus().subscribe("App", "oType", this.onSelectRequestType01, this);

		},

		onClaimAuthorization: function (oEvent) {
			//var oSelectedIndex = this.getView().byId("idRequestType").getSelectedIndex();
			var oSelectedKey = this.getView().byId("idClaimType").getSelectedKey();
			var oClaimNum = "nun";
			
			var oUniqIndex = this.getView().byId("idRequestType").getSelectedIndex();
			if(oUniqIndex == 1){
				this.oSelectedClaimGroup = "Authorization";
			}else if(oUniqIndex == 0) {
				this.oSelectedClaimGroup = "Claim";
			}
			
			if (oSelectedKey === "WARRANTY") {
				
				this.getRouter().navTo("MainClaimSection", {
					claimNum : oClaimNum,
					oClaimGroup : this.oSelectedClaimGroup
					
				});
			} else if (oSelectedKey === "PART WAREHOUSE") {
				this.getRouter().navTo("PartsMainSection", {
					claimNum : oClaimNum,
					oClaimGroup : this.oSelectedClaimGroup
				});
			}
		},
		
		onSelectRequestType01 : function(oEvent){
			
			// sap.ui.getCore().getEventBus().publish("App", "oType", {text : oUniqIndex});
		},
		
		onPressCancel : function(){
			this.getRouter().navTo("SearchClaim");
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zclaimProcessing.view.NewClaimSelectGroup
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zclaimProcessing.view.NewClaimSelectGroup
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.NewClaimSelectGroup
		 */
		//	onExit: function() {
		//
		//	}

	});

});