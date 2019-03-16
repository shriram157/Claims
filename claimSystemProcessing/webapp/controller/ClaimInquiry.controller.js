sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	'sap/m/MessageToast'
], function (BaseController, MessageToast) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.ClaimInquiry", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.ClaimInquiry
		 */
		onInit: function () {
			this.getDealer();
			this.getView().setModel(this.getModel("ProssingModel"));
			var PriorDate = new Date();
			var oDateModel = new sap.ui.model.json.JSONModel();
			oDateModel.setData({
				dateValueDRS2: new Date(new Date().setDate(PriorDate.getDate() - 30)),
				secondDateValueDRS2: PriorDate,
				dateCurrent: new Date(),
				vinState: "None"
			});
			this.getView().setModel(oDateModel, "DateModel");
			this.getModel("LocalDataModel").setProperty("/LinkEnable", true);
		},
		
		onPressSearch: function () {
			var oClaimModel = this.getModel("ProssingModel");
			var oDealer = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
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
				oClaimModel.read("/ZC_CLAIM_HEAD", {
						urlParameters: {
							"$filter": "ReferenceDate ge datetime'" + FromDateFormat +
								"'and ReferenceDate le datetime'" + ToDateFormat +
								"'and ExternalObjectNumber eq '" + sQuery + "'"

						},
						success : $.proxy(function(data){
							//var oArr = data.results;
							this.getModel("LocalDataModel").setProperty("/DataResultEnquiry", data.results);
							// var oArr = this.getModel("LocalDataModel").getProperty("/DataResultEnquiry");
							// oArr.forEach($.proxy(function(item){
							// 	if(item.Partner == oDealer){
							// 		this.getModel("LocalDataModel").setProperty("/LinkEnable", true);	
							// 	}else {
							// 		this.getModel("LocalDataModel").setProperty("/LinkEnable", false);
							// 	}
							// }),this);
							
						}, this)
				});
				
				this.getView().getModel("DateModel").setProperty("/vinState", "None");
				
			} else {
				this.getView().getModel("DateModel").setProperty("/vinState", "Error");
				this.getView().byId("idNewClaimMsgStrp").setProperty("visible", true);
			}

		},
		onPressClaimInquiryDetails: function (oEvent) {
			var oCustomer = oEvent.getSource().getParent().getCells()[0].getText();
			var oClaimNum = oEvent.getSource().getParent().getCells()[2].getText();
			var oClaimType = oEvent.getSource().getParent().getCells()[6].getText();
			if (oClaimType == "ZACD" || oClaimType == "ZAUT") {
						this.oSelectedClaimGroup = "Authorization";
					} else {
						this.oSelectedClaimGroup = "Claim";
					}
			// var oSelectedClaimGroup = oEvent.getSource().getParent().getCells()[15].getText();
			var oDealer = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
			if(oCustomer === oDealer){
				this.getOwnerComponent().getRouter().navTo("MainClaimSection", {
						claimNum: oClaimNum,
						oKey: oClaimType,
						oClaimGroup: this.oSelectedClaimGroup,
						oClaimNav : "Inq"

					});
			}else{
				MessageToast.show("You are not Authorized Dealer.");
			}
		},
		fnFormatDealer : function(val){
			var oDealer = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
			var oAccessedDealer ;
			if(val === oDealer){
				this.getModel("LocalDataModel").setProperty("/LinkEnable", true);
				oAccessedDealer = val;
			}else{
				this.getModel("LocalDataModel").setProperty("/LinkEnable", false);
				oAccessedDealer = val;
			}
			return val;
		}

		

	});

});