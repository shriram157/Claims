sap.ui.define([
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/MessageToast',
	'sap/m/Text',
	"zclaimProcessing/controller/BaseController"
], function (Button, Dialog, Label, MessageToast, Text, BaseController) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.PartsMainSection", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.PartsMainSection
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
			var oMultiHeaderConfig = {
				multiheader1: [3, 1],
				multiheader2: [2, 1],
				multiheader3: [6, 1],
				partDamage: true,
				partMiscellanious: false,
				partDiscrepancies: false,
				partTransportation: false
			};

			this.getView().setModel(new sap.ui.model.json.JSONModel(oMultiHeaderConfig), "multiHeaderConfig");

			//this.getView().setModel(this.oUploadModel, "UploadedItems");
			this.getView().setModel(oNodeModel, "ClaimModel");
			this.oUploadCollection = this.byId("UploadCollection");
			this.oBreadcrumbs = this.byId("breadcrumbs");
			this.bindUploadCollectionItems("ClaimModel>/items");
			this.oUploadCollection.addEventDelegate({
				onAfterRendering: function () {
					var iCount = this.oUploadCollection.getItems().length;
					this.oBreadcrumbs.setCurrentLocationText(this.getCurrentLocationText() + " (" + iCount + ")");
				}.bind(this)
			});

			this.setModel(this.getModel("ProssingModel"));
			var oProssingModel = this.getModel("ProssingModel");
			var oArr = [];
			oProssingModel.read("/ZC_CLAIM_SUM", {
				urlParameters: {
					"$filter": "clmno eq '18'"
				},
				success: $.proxy(function (data) {
					oArr.push(data.results[0], data.results[3]);
					console.log(oArr);
					this.getModel("LocalDataModel").setProperty("/ClaimSum", oArr);
				}, this)
			});

		},

		getCurrentLocationText: function () {
			// Remove the previously added number of items from the currentLocationText in order to not show the number twice after rendering.
			var sText = this.oBreadcrumbs.getCurrentLocationText().replace(/\s\([0-9]*\)/, "");
			return sText;
		},

		getCurrentFolderPath: function () {
			var aHistory = this.getView().getModel("ClaimModel").getProperty("/history");
			// get the current folder path
			var sPath = aHistory.length > 0 ? aHistory[aHistory.length - 1].path : "/";
			return sPath;
		},

		onSelectClaim: function (oEvent) {
			if (oEvent.getParameters().selectedItem.getKey() === "PDC") {
				this.getView().byId("idPdcCode").setProperty("editable", false);
				this.getView().byId("idTCIWayBill").setProperty("editable", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", false);
				console.log(oEvent.getParameters().selectedItem.getText() + "PDC");

			} else if (oEvent.getParameters().selectedItem.getKey() === "PMS") {
				this.getView().byId("idPdcCode").setProperty("editable", false);
				this.getView().byId("idTCIWayBill").setProperty("editable", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", false);
				console.log(oEvent.getParameters().selectedItem.getText() + "PMS");
			} else if (oEvent.getParameters().selectedItem.getKey() === "PTS") {
				this.getView().byId("idPdcCode").setProperty("editable", false);
				this.getView().byId("idTCIWayBill").setProperty("editable", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", true);
				console.log(oEvent.getParameters().selectedItem.getText() + "PTS");

			} else if (oEvent.getParameters().selectedItem.getKey() === "PPD") {
				console.log(oEvent.getParameters().selectedItem.getText() + "PPD");
				this.getView().byId("idPdcCode").setProperty("editable", false);
				this.getView().byId("idTCIWayBill").setProperty("editable", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", false);
			}

		},

		onUploadComplete: function (oEvent) {
			debugger;
			var sCurrentPath = this.getCurrentFolderPath();
			var oData = this.getView().getModel("ClaimModel").getProperty(sCurrentPath);
			var aItems = oData && oData.items;
			var oItem;
			var sUploadedFile = oEvent.getParameter("files")[0].fileName;

			oItem = {
				"documentId": jQuery.now().toString(), // generate Id,
				"fileName": sUploadedFile,
				"mimeType": "",
				"thumbnailUrl": "",
				"url": ""
			};
			if (aItems.length === 0) {
				aItems.push(oItem);
			} else {
				// insert file after all folders
				for (var i = 0; i < aItems.length; i++) {
					if (aItems[i].type !== "folder") {
						aItems.splice(i, 0, oItem);
						break;
					}
				}
			}
			this.getView().getModel("ClaimModel").setProperty(sCurrentPath + "/items", aItems);
			jQuery.sap.delayedCall(2000, this, function () {
				MessageToast.show("UploadComplete event triggered.");
			});
		},
		onFileDeleted: function (oEvent) {
			this.deleteItemById(oEvent.getParameter("documentId"));
			MessageToast.show("FileDeleted event triggered.");
		},
		bindUploadCollectionItems: function (path) {
			this.oUploadCollection.bindItems({
				path: path,
				factory: this.uploadCollectionItemFactory.bind(this)
			});
		},

		deleteItemByPath: function (sItemPath) {
			var sCurrentPath = this.getCurrentFolderPath();
			var oData = this.getView().getModel("ClaimModel").getProperty(sCurrentPath);
			var aItems = oData && oData.items;
			var oItemData = this.getView().getModel("ClaimModel").getProperty(sItemPath);
			if (oItemData && aItems) {
				aItems.splice(aItems.indexOf(oItemData), 1);
				this.getView().getModel("ClaimModel").setProperty(sCurrentPath + "/items", aItems);
			}
		},

		deleteItemById: function (sItemToDeleteId) {
			var sCurrentPath = this.getCurrentFolderPath();
			var oData = this.getView().getModel("ClaimModel").getProperty(sCurrentPath);
			var aItems = oData && oData.items;
			jQuery.each(aItems, function (index) {
				if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
					aItems.splice(index, 1);
				}
			});
			this.getView().getModel("ClaimModel").setProperty(sCurrentPath + "/items", aItems);
		},

		uploadCollectionItemFactory: function (id, context) {
			var oItem = new sap.m.UploadCollectionItem(id, {
				documentId: "{ClaimModel>documentId}",
				fileName: "{ClaimModel>fileName}",
				mimeType: "{ClaimModel>mimeType}",
				thumbnailUrl: "{ClaimModel>thumbnailUrl}",
				url: "{ClaimModel>url}"
			});

			if (context.getProperty("type") === "folder") {
				oItem.attachPress(this.onFolderPress, this);
				oItem.attachDeletePress(this.onFolderDeletePress, this);
				oItem.setAriaLabelForPicture("Folder");
			}
			return oItem;
		},

		// 		handleUploadComplete: function (oEvent) {
		// 			var sResponse = oEvent.getParameter("response");
		// 			if (sResponse) {
		// 				var sMsg = "";
		// 				var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
		// 				if (m[1] == "200") {
		// 					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
		// 					oEvent.getSource().setValue("");
		// 				} else {
		// 					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
		// 				}

		// 				MessageToast.show(sMsg);
		// 			}
		// 		},

		// 		handleUploadPress: function (oEvent) {
		// 			var oFileUploader = this.byId("fileUploader");
		// 			oFileUploader.upload();
		// 		},

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
				this.getView().byId("idPartClaimIconBar").setSelectedKey("Tab2");
			}

		},

		onStep03Next: function () {
			this.getView().byId("idFilter03").setProperty("enabled", true);
			this.getView().byId("idPartClaimIconBar").setSelectedKey("Tab3");
		},
		onRevalidate: function () {
			var that = this;
			var dialog = new Dialog({
				title: 'Revalidate Claim',
				type: 'Message',
				content: new Text({
					text: 'Do you want to revalidate this claim? '
				}),
				beginButton: new Button({
					text: 'Yes',
					press: function () {
						MessageToast.show('Claim Number {cliam number" was successfully submitted to TCI.');
						that.getRouter().navTo("ApplicationList");
						dialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		onSubmitTci: function (oEvent) {
			var that = this;
			var dialog = new Dialog({
				title: 'Submit Claim to TCI',
				type: 'Message',
				content: new Text({
					text: 'Are you sure, you will like to submit this claim to TCI? '
				}),
				beginButton: new Button({
					text: 'Yes',
					press: function () {
						MessageToast.show('Claim Number {cliam number" was successfully submitted to TCI.');
						that.getRouter().navTo("SearchClaim");
						dialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		onPressBack: function (oEvent) {
				this.ogetSelectedKey = this.getView().byId("idPartClaimIconBar").getSelectedKey();
				var ogetKey = this.ogetSelectedKey.split("Tab")[1];

				if (ogetKey > 1 && ogetKey <= 8) {
					var oSelectedNum = ogetKey - 1;
					this.getView().byId("idPartClaimIconBar").setSelectedKey("Tab" + oSelectedNum + "");
				} else {
					this.getRouter().navTo("SearchClaim");
				}

			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf zclaimProcessing.view.PartsMainSection
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zclaimProcessing.view.PartsMainSection
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.PartsMainSection
		 */
		//	onExit: function() {
		//
		//	}

	});

});