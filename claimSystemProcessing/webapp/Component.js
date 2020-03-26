sap.ui.define([
	"sap/ui/model/resource/ResourceModel",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"zclaimProcessing/model/models",
	"sap/ui/model/odata/v2/ODataModel"
], function (ResourceModel, Button, Dialog, Text, UIComponent, Device, models, ODataModel) {
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

			this._initSessionDialogs();

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
				headers: {
					"X-Requested-With": "XMLHttpRequest"
				}
			});
			this.setModel(oDataModel, "ProssingModel");
			var mConfig01 = this.getMetadata().getManifestEntry("/sap.app/dataSources/API_BUSINESS_PARTNER");

			if (sLocation_conf == 0) {
				mConfig01.uri = "/Claim_Destination" + mConfig01.uri;
			} else {

			} // facilitate local testing.

			var oDataModel01 = new ODataModel(mConfig01.uri, {
				useBatch: false,
				json: true,
				headers: {
					"X-Requested-With": "XMLHttpRequest"
				}
			});
			this.setModel(oDataModel01, "ApiBusinessModel");

			var mConfig02 = this.getMetadata().getManifestEntry("/sap.app/dataSources/MD_PRODUCT_FS_SRV");
			if (sLocation_conf == 0) {
				mConfig02.uri = "/Claim_Destination" + mConfig02.uri;
			} else {

			} // facilitate local testing.

			var oDataModel02 = new ODataModel(mConfig02.uri, {
				useBatch: false,
				json: true,
				headers: {
					"X-Requested-With": "XMLHttpRequest"
				}
			});
			this.setModel(oDataModel02, "ProductMaster");

			var mConfig04 = this.getMetadata().getManifestEntry("/sap.app/dataSources/Z_VEHICLE_MASTER_SRV");
			if (sLocation_conf == 0) {
				mConfig04.uri = "/Claim_Destination" + mConfig04.uri;
			}
			var oDataModel04 = new ODataModel(mConfig04.uri, {
				useBatch: false,
				json: true,
				headers: {
					"X-Requested-With": "XMLHttpRequest"
				}
			});

			this.setModel(oDataModel04, "ZVehicleMasterModel");

			// CR Model

			var mConfig06 = this.getMetadata().getManifestEntry("/sap.app/dataSources/ZDLR_CLAIM_PMP_SRV");
			if (sLocation_conf == 0) {
				mConfig04.uri = "/Claim_Destination" + mConfig06.uri;
			}
			var oDataModel06 = new ODataModel(mConfig04.uri, {
				useBatch: false,
				json: true,
				headers: {
					"X-Requested-With": "XMLHttpRequest"
				}
			});

			this.setModel(oDataModel06, "zDLRCLAIMPMPSRV");

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
				json: true,
				headers: {
					"X-Requested-With": "XMLHttpRequest"
				}
			});

			this.setModel(oDataModel05, "EcpSalesModel");
		},

		_initSessionDialogs: function () {
			var locale = jQuery.sap.getUriParameters().get('Language');
			var bundle = !locale ? new ResourceModel({
				bundleUrl: './i18n/i18n.properties'
			}).getResourceBundle() : new ResourceModel({
				bundleUrl: './i18n/i18n.properties',
				bundleLocale: locale
			}).getResourceBundle();

			var sessionExpiringDialog = new Dialog({
				title: bundle.getText('SESSION_EXPIRING_DIALOG_TITLE'),
				type: 'Message',
				state: 'Warning',
				content: new Text({
					text: bundle.getText('SESSION_EXPIRING_DIALOG_TEXT')
				}),
				beginButton: new Button({
					text: bundle.getText('SESSION_EXPIRING_DIALOG_OK_BTN_TEXT'),
					press: function () {
						sessionExpiringDialog.close();
					}
				}),
			});

			var sessionExpiredDialog = new Dialog({
				title: bundle.getText('SESSION_EXPIRED_DIALOG_TITLE'),
				type: 'Message',
				state: 'Warning',
				content: new Text({
					text: bundle.getText('SESSION_EXPIRED_DIALOG_TEXT')
				})
			});

			var sessionExpired = false;
			var sessionExpiringTimeoutId = null;
			var sessionExpiredTimeoutId = null;

			var resetTimeouts = function () {
				if (sessionExpiringTimeoutId) {
					clearTimeout(sessionExpiringTimeoutId);
				}
				if (sessionExpiredTimeoutId) {
					clearTimeout(sessionExpiredTimeoutId);
				}

				// Don't create more timeouts if session is already expired
				if (!sessionExpired) {
					sessionExpiringTimeoutId = setTimeout(function () {
						if (sessionExpiringDialog) {
							sessionExpiringDialog.open();
						}
					}, 3300000); // 55 minutes
					sessionExpiredTimeoutId = setTimeout(function () {
						sessionExpired = true;
						if (sessionExpiringDialog) {
							sessionExpiringDialog.close();
						}
						if (sessionExpiredDialog) {
							sessionExpiredDialog.open();
						}
					}, 3600000); // 60 minutes
				}
			};

			// Attach XHR event handler to detect or reset timeouts on AJAX calls
			var origOpen = XMLHttpRequest.prototype.open;
			XMLHttpRequest.prototype.open = function () {
				this.addEventListener('load', function (event) {
					if (event.target.responseURL && event.target.responseURL.startsWith(window.location.protocol + '//' + window.location.hostname)) {
						// 401 unauthorized error response implies session timeout
						if (event.target.status === 401) {
							sessionExpired = true;
							sessionExpiredDialog.open();
						}

						// 2xx or 3xx response implies successful call to approuter
						else if (event.target.status >= 200 && event.target.status < 400) {
							resetTimeouts();
						}
					}
				});
				origOpen.apply(this, arguments);
			};

			// Attach route match handler to reset timeouts on view transition
			this.getRouter().attachRouteMatched(function (event) {
				if (sessionExpired) {
					sessionExpiredDialog.open();
				}
				resetTimeouts();
			});

			resetTimeouts();
		}

	});
});