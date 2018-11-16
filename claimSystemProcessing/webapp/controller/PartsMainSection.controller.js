sap.ui.define([
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/MessageToast',
	'sap/m/Text',
	"zclaimProcessing/controller/BaseController",
	"zclaimProcessing/libs/jQuery.base64"
], function (Button, Dialog, Label, MessageToast, Text, BaseController, base64) {
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
			oNodeModel.setData({
				"currentLocationText": "Attachments",
				"history": [],
				"items": []
			});
			this.getView().setModel(oNodeModel, "ClaimModel");

			var oAttachments = new sap.ui.model.json.JSONModel();
			oAttachments.setData({
				"currentLocationText": "Attachments",
				"history": [],
				"items": []
			});
			this.getView().setModel(oAttachments, "AttachmentModel");
			//oNodeModel.loadData(jQuery.sap.getModulePath("zclaimProcessing.utils", "/Nodes.json"));
			var oMultiHeaderConfig = {
				multiheader1: [3, 1],
				multiheader2: [2, 1],
				multiheader3: [6, 1],
				multiheader5: 4,
				partDamage: true,
				partMiscellanious: false,
				partDiscrepancies: false,
				partTransportation: false,
				uploader: true,
				OrderedPartDesc: false,
				RetainPartV: false,
				PartNumberRcV: false,
				PartDescriptionOrdRcv: false,
				RepairAmtV: true,
				DealerNetPrcV: false,
				DealerNetPrcEdt: true,
				PartRepaired: true
			};

			this.getView().setModel(new sap.ui.model.json.JSONModel(oMultiHeaderConfig), "multiHeaderConfig");
			this.oUploadCollection = this.byId("UploadSupportingDoc");
			this.oBreadcrumbs = this.byId("breadcrumbsSupportingDoc");
			this.bindUploadCollectionItems("ClaimModel>/items");
			this.oUploadCollection.addEventDelegate({
				onAfterRendering: function () {
					var iCount = this.oUploadCollection.getItems().length;
					this.oBreadcrumbs.setCurrentLocationText(this.getCurrentLocationText() + " (" + iCount + ")");
				}.bind(this)
			});

			this.oUploadCollection01 = this.byId("UploadCollection");
			this.oBreadcrumbs01 = this.byId("breadcrumbs");
			this.bindUploadCollectionItems01("AttachmentModel>/items");
			this.oUploadCollection01.addEventDelegate({
				onAfterRendering: function () {
					var iCount = this.oUploadCollection01.getItems().length;
					this.oBreadcrumbs01.setCurrentLocationText(this.getCurrentLocationText01() + " (" + iCount + ")");
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
					this.getModel("LocalDataModel").setProperty("/ClaimSum", oArr);
				}, this)
			});

			var HeadSetData = new sap.ui.model.json.JSONModel({
				"WarrantyClaimType": "",
				"Delivery": "",
				"DeliveryDate": "",
				"TCIWaybillNumber": "",
				"ShipmentReceivedDate": "",
				"DealerContact": "",
				"HeadText": ""
			});
			HeadSetData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(HeadSetData, "HeadSetData");

		},

		getCurrentLocationText: function () {
			// Remove the previously added number of items from the currentLocationText in order to not show the number twice after rendering.
			var sText = this.oBreadcrumbs.getCurrentLocationText().replace(/\s\([0-9]*\)/, "");
			return sText;
		},

		getCurrentLocationText01: function () {
			// Remove the previously added number of items from the currentLocationText in order to not show the number twice after rendering.
			var sText = this.oBreadcrumbs01.getCurrentLocationText().replace(/\s\([0-9]*\)/, "");
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

				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberRcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartDescriptionOrdRcv", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/RepairAmtV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 4);
				console.log(oEvent.getParameters().selectedItem.getText() + "PDC");

			} else if (oEvent.getParameters().selectedItem.getKey() === "PMS") {
				this.getView().byId("idPdcCode").setProperty("editable", false);
				this.getView().byId("idTCIWayBill").setProperty("editable", true);
				// this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", false);
				// this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", true);
				// this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", false);
				// this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", false);

				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberRcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartDescriptionOrdRcv", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/RepairAmtV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 4);
				//console.log(oEvent.getParameters().selectedItem.getText() + "PMS");
			} else if (oEvent.getParameters().selectedItem.getKey() === "PTS") {
				this.getView().byId("idPdcCode").setProperty("editable", false);
				this.getView().byId("idTCIWayBill").setProperty("editable", true);
				// this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", false);
				// this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", false);
				// this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", false);
				// this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", true);
				// console.log(oEvent.getParameters().selectedItem.getText() + "PTS");
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberRcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartDescriptionOrdRcv", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/RepairAmtV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 4);

			} else if (oEvent.getParameters().selectedItem.getKey() === "PPD") {
				console.log(oEvent.getParameters().selectedItem.getText() + "PPD");
				this.getView().byId("idPdcCode").setProperty("editable", false);
				this.getView().byId("idTCIWayBill").setProperty("editable", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/OrderedPartDesc", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 5);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberRcV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartDescriptionOrdRcv", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/RepairAmtV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcEdt", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", true);

			}

		},

		onUplaodChange: function (oEvent) {
			this.oUploadedFile = oEvent.getParameter("files")[0];
			var reader = new FileReader();
			reader.readAsBinaryString(this.oUploadedFile);
			//reader.content = reader.result;
			//var base64string = btoa(reader.content);
			reader.onload = $.proxy(function (e) {
				if (reader.result) reader.content = reader.result;
				this.oBase = btoa(reader.content);
				console.log(this.oBase);
			}, this);
		},

		onUploadComplete: function (oEvent) {

			var sCurrentPath = this.getCurrentFolderPath();
			var oData = this.getView().getModel("ClaimModel").getProperty(sCurrentPath);
			var aItems = oData && oData.items;
			var oItem;

			var sUploadedFile = oEvent.getParameter("files")[0].fileName;
			oItem = {
				"documentId": jQuery.now().toString(), // generate Id,
				"fileName": sUploadedFile,
				"Type": this.oUploadedFile.type,
				"size": this.oUploadedFile.size,
				"url": this.oBase
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
			console.log(this.getView().getModel("ClaimModel"));
			jQuery.sap.delayedCall(1000, this, function () {
				MessageToast.show("UploadComplete event triggered.");
			});
		},

		onUploadComplete02: function (oEvent) {

			var sCurrentPath = this.getCurrentFolderPath();
			var oData = this.getView().getModel("AttachmentModel").getProperty(sCurrentPath);
			var aItems = oData && oData.items;
			var oItem;

			var sUploadedFile = oEvent.getParameter("files")[0].fileName;
			oItem = {
				"documentId": jQuery.now().toString(), // generate Id,
				"fileName": sUploadedFile,
				"Type": this.oUploadedFile.type,
				"size": this.oUploadedFile.size,
				"url": this.oBase
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
			this.getView().getModel("AttachmentModel").setProperty(sCurrentPath + "/items", aItems);
			console.log(this.getView().getModel("AttachmentModel"));
			jQuery.sap.delayedCall(1000, this, function () {
				MessageToast.show("UploadComplete event triggered.");
			});
		},

		onFileDeleted: function (oEvent) {
			this.deleteItemById(oEvent.getParameter("documentId"), "ClaimModel");
			MessageToast.show("FileDeleted event triggered.");
		},
		onFileDeleted02: function (oEvent) {
			this.deleteItemById(oEvent.getParameter("documentId"), "AttachmentModel");
			MessageToast.show("FileDeleted event triggered.");
		},
		bindUploadCollectionItems: function (path) {
			this.oUploadCollection.bindItems({
				path: path,
				factory: this.uploadCollectionItemFactory.bind(this)
			});
		},

		bindUploadCollectionItems01: function (path) {
			this.oUploadCollection01.bindItems({
				path: path,
				factory: this.uploadCollectionItemFactory01.bind(this)
			});
		},

		deleteItemById: function (sItemToDeleteId, mModel) {
			var sCurrentPath = this.getCurrentFolderPath();
			var oData = this.getView().getModel(mModel).getProperty(sCurrentPath);
			var aItems = oData && oData.items;
			jQuery.each(aItems, function (index) {
				if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
					aItems.splice(index, 1);
				}
			});
			this.getView().getModel(mModel).setProperty(sCurrentPath + "/items", aItems);
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

		uploadCollectionItemFactory01: function (id, context) {
			var oItem = new sap.m.UploadCollectionItem(id, {
				documentId: "{AttachmentModel>documentId}",
				fileName: "{AttachmentModel>fileName}",
				mimeType: "{AttachmentModel>mimeType}",
				thumbnailUrl: "{AttachmentModel>thumbnailUrl}",
				url: "{AttachmentModel>url}"
			});

			if (context.getProperty("type") === "folder") {
				oItem.attachPress(this.onFolderPress, this);
				oItem.attachDeletePress(this.onFolderDeletePress, this);
				oItem.setAriaLabelForPicture("Folder");
			}
			return oItem;
		},

		onSaveClaim: function (oEvent) {
			var obj = {
				WarrantyClaimType: this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
				Delivery: this.getView().getModel("HeadSetData").getProperty("/Delivery"),
				DeliveryDate: this.getView().getModel("HeadSetData").getProperty("/DeliveryDate"),
				TCIWaybillNumber: this.getView().getModel("HeadSetData").getProperty("/TCIWaybillNumber"),
				ShipmentReceivedDate: this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate"),
				DealerContact: this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
				HeadText: this.getView().getModel("HeadSetData").getProperty("/HeadText")
			};
			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.create("/zc_headSet", obj, {

				success: $.proxy(function () {
					console.log("success");

				}, this),
				error: function (err) {
					console.log(err);
				}
			});
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