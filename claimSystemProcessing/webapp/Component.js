sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"zclaimProcessing/model/models",
	"sap/ui/model/odata/v2/ODataModel"
], function (UIComponent, Device, models, ODataModel) {
	"use strict";

	return UIComponent.extend("zclaimProcessing.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createLocalDataModel(), "LocalDataModel");

			var mConfig = this.getMetadata().getManifestEntry("/sap.app/dataSources/ZDLR_CLAIM_SRV");
			//  if running on a local version,  use the destination otherwise use /node.			

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");

			if (sLocation_conf == 0) {
				mConfig.uri = "/Claim_Destination" + mConfig.uri;
			} else {

			}

			var oDataModel = new ODataModel(mConfig.uri, {
				useBatch: false,
				json: true,
				defaultUpdateMethod: 'PUT',
			});
			this.setModel(oDataModel, "ProssingModel");
			var mConfig01 = this.getMetadata().getManifestEntry("/sap.app/dataSources/API_BUSINESS_PARTNER");

			if (sLocation_conf == 0) {
				mConfig01.uri = "/Claim_Destination" + mConfig01.uri;
			} else {

			} // facilitate local testing.

			var oDataModel01 = new ODataModel(mConfig01.uri, {
				useBatch: false,
				json: true
			});
			this.setModel(oDataModel01, "ApiBusinessModel");

			var mConfig02 = this.getMetadata().getManifestEntry("/sap.app/dataSources/MD_PRODUCT_FS_SRV");
			if (sLocation_conf == 0) {
				mConfig02.uri = "/Claim_Destination" + mConfig02.uri;
			} else {

			} // facilitate local testing.

			var oDataModel02 = new ODataModel(mConfig02.uri, {
				useBatch: false,
				json: true
			});
			this.setModel(oDataModel02, "ProductMaster");

			var mConfig04 = this.getMetadata().getManifestEntry("/sap.app/dataSources/Z_VEHICLE_MASTER_SRV");
			if (sLocation_conf == 0) {
				mConfig04.uri = "/Claim_Destination" + mConfig04.uri;
			}
			var oDataModel04 = new ODataModel(mConfig04.uri, {
				useBatch: false,
				json: true
			});

			this.setModel(oDataModel04, "ZVehicleMasterModel");

			/// ecp model

			var mConfig05 = this.getMetadata().getManifestEntry("/sap.app/dataSources/ZECP_SALES_ODATA_SERVICE_SRV");
			if (sLocation_conf == 0) {
				mConfig05.uri = "/ecpSales_node_secured" + mConfig05.uri; //ecpSales_node_secured
			} else {
				mConfig05.uri = mConfig05.uri;
			}
			var oDataModel05 = new ODataModel(mConfig05.uri, {
				useBatch: false,
				// disableHeadRequestForToken: false,
				defaultUpdateMethod: 'PATCH',
				json: true
			});

			this.setModel(oDataModel05, "EcpSalesModel");

		}
	});
});