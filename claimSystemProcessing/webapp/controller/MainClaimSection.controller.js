sap.ui.define([
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/MessageToast',
	'sap/m/Text',
	"zclaimProcessing/controller/BaseController",
	"zclaimProcessing/libs/jQuery.base64",
	"sap/ui/core/ValueState",
	"zclaimProcessing/utils/Validator",
	'sap/ui/model/Filter',
	'sap/m/Button'
], function (Dialog, Label, MessageToast, Text, BaseController, base64, ValueState, Validator, Filter, Button) {
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
				dateCurrent: new Date(),
				Authorization: true,
				Parts: true,
				Labour: true,
				Paint: true,
				Sublet: true,
				partLine: false,
				labourLine: false,
				paintLine: false,
				subletLine: false,
				SuggestBtn: false
			});
			this.getView().setModel(oDateModel, "DateModel");
			var oNodeModel = new sap.ui.model.json.JSONModel();
			oNodeModel.loadData(jQuery.sap.getModulePath("zclaimProcessing.utils", "/Nodes.json"));
			this.oUploadCollection = this.byId("UploadSupportingDoc");
			this.oBreadcrumbs = this.byId("breadcrumbsSupportingDoc");
			this.bindUploadCollectionItems("ClaimModel>/items");
			this.oUploadCollection.addEventDelegate({
				onAfterRendering: function () {
					var iCount = this.oUploadCollection.getItems().length;
					this.oBreadcrumbs.setCurrentLocationText(this.getCurrentLocationText() + " (" + iCount + ")");
				}.bind(this)
			});

			this.getView().setModel(oNodeModel, "ClaimModel");
			this.setModel(this.getModel("ProductMaster"), "ProductMasterModel");
			this.setModel(this.getModel("ProssingModel"));
			var oProssingModel = this.getModel("ProssingModel");
			oProssingModel.read("/zc_claim_item_labourSet", {
				success: $.proxy(function (data) {
					console.log(data);
					this.getModel("LocalDataModel").setProperty("/LabourSetData", data.results);
				}, this),
				error: function () {}
			});
			oProssingModel.read("/zc_claim_item_paintSet", {
				success: $.proxy(function (data) {
					console.log(data);
					this.getModel("LocalDataModel").setProperty("/paintSetData", data.results);
				}, this),
				error: function () {}
			});

			var HeadSetData = new sap.ui.model.json.JSONModel({
				"WarrantyClaimType": "",
				"Partner": "",
				"PartnerRole": "",
				"ReferenceDate": "",
				"DateOfApplication": "",
				"FinalProcdDate": "",
				"Delivery": "",
				"DeliveryDate": "",
				"TCIWaybillNumber": "",
				"ShipmentReceivedDate": "",
				"DealerContact": "",
				"DeliveringCarrier": "",
				"HeadText": "",
				"OFP": "",
				"WTYClaimRecoverySource": "",
				"MainOpsCode": "",
				"T1WarrantyCodes": "",
				"BatteryTestCode": "",
				"T2WarrantyCodes": "",
				"FieldActionReference": "",
				"ZCondition": "",
				"Cause": "",
				"Remedy": ""
			});
			HeadSetData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(HeadSetData, "HeadSetData");

			var partData = new sap.ui.model.json.JSONModel({
				"matnr": "",
				"quant": ""
			});
			partData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(partData, "PartDataModel");

			var LabourData = new sap.ui.model.json.JSONModel({
				"LabourOp": "",
				"Description": "",
				"ClaimedHours": ""
			});
			LabourData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(LabourData, "LabourDataModel");

			var SubletData = new sap.ui.model.json.JSONModel({
				"SubletCode": "",
				"InvoiceNo": "",
				"description": "",
				"Amount": "",
				"days": "",
				"brand": ""
			});
			SubletData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(SubletData, "SubletDataModel");

			var PaintData = new sap.ui.model.json.JSONModel({
				PaintPositionCode: ""
			});
			PaintData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(PaintData, "PaintDataModel");

			sap.ui.getCore().attachValidationError(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.Error);
			});
			sap.ui.getCore().attachValidationSuccess(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.None);
			});

			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRoutMatched, this);
			this.getModel("LocalDataModel").setProperty("/step01Next", false);

			// :::::::::::::::::: Claim Items post object start ::::::::::::::::::::
			this.ArrIndex = [];
			this.ArrIndexLabour = [];
			this.obj = {};
			this.obj.DBOperation = "SAVE";
			this.obj.zc_itemSet = {};
			this.obj.zc_itemSet.results = [];
			this.obj.zc_item_subletSet = {
				"results": []
			};

			this.obj.zc_claim_item_labourSet = {
				"results": []
			};

			this.obj.zc_claim_item_paintSet = {
				"results": []
			};

			this.obj.zc_claim_item_price_data = {
				"results": [{
					"PartQty": "0.000",
					"AmtClaimed": "0.000",
					"clmno": "",
					"DealerNet": "0.000",
					"DiffAmt": "0.000",
					"ExtendedValue": "0.000",
					"ItemType": "",
					"kappl": "",
					"kateg": "",
					"kawrt": "0.000",
					"kbetr": "0.000",
					"knumv": "",
					"kposn": "",
					"kschl": "",
					"kvsl1": "",
					"kwert": "0.000",
					"MarkUp": "0.000",
					"matnr": "",
					"posnr": "",
					"QtyHrs": "0.000",
					"quant": "0.000",
					"TCIApprAmt": "0.000",
					"TCIApprQty": "0.000",
					"TotalAfterDisct": "0.000",
					"v_rejcd": "",
					"valic": "0.000",
					"valoc": "0.000",
					"verknumv": "",
					"versn": ""
				}]
			};
			// :::::::::::::::::: Claim Items post object end ::::::::::::::::::::

		},

		_onRoutMatched: function (oEvent) {
			var oClaim = oEvent.getParameters().arguments.claimNum;
			if (oClaim != "nun" && oClaim != undefined) {
				var oProssingModel = this.getModel("ProssingModel");
				oProssingModel.read("/ZC_CLAIM_HEAD", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "' "
					},
					success: $.proxy(function (data) {
						console.log(data.results);
						var HeadSetData = new sap.ui.model.json.JSONModel(data.results[0]);
						HeadSetData.setDefaultBindingMode("TwoWay");
						this.getView().setModel(HeadSetData, "HeadSetData");
					}, this),
					error: function () {}
				});

				oProssingModel.read("/ZC_CLAIM_HEAD", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "' ",
						"$expand": "to_claimitem"
					},
					success: $.proxy(function (data) {
						this.getView().getModel("LocalDataModel").setProperty("/PartDetailList", data.results[0].to_claimitem.results);
						// console.log(data.results);
						// var HeadSetData = new sap.ui.model.json.JSONModel(data.results[0]);
						// HeadSetData.setDefaultBindingMode("TwoWay");
						// this.getView().setModel(HeadSetData, "HeadSetData");
					}, this),
					error: function () {}
				});

				var oArr = [];
				oProssingModel.read("/ZC_CLAIM_SUM(p_clmno='" + oClaim + "')/Set", {
					success: $.proxy(function (data) {
						oArr.push(data.results[0], data.results[3]);
						this.getModel("LocalDataModel").setProperty("/ClaimSum", oArr);
					}, this)
				});

			}
		},

		onSelectClaimTpe: function (oEvent) {
			this.oKey = oEvent.getSource().getSelectedKey();
			if (this.oKey == "CD") {

			} else if (this.oKey == "WO") {

			} else if (this.oKey == "GW") {
				this.getView().getModel("DateModel").setProperty("/Paint", true);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", true);

			} else if (this.oKey == "A1") {
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Authorization", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
			} else if (this.oKey == "A2") {
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Authorization", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);

			} else if (this.oKey == "AC") {
				this.getView().getModel("DateModel").setProperty("/Authorization", false);
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
			} else if (this.oKey == "MS") {
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Parts", false);
				this.getView().getModel("DateModel").setProperty("/Labour", false);
				this.getView().getModel("DateModel").setProperty("/Authorization", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
			} else if (this.oKey == "P1") {
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", true);

			} else if (this.oKey == "P2") {
				this.getView().getModel("DateModel").setProperty("/Paint", false);
				this.getView().getModel("DateModel").setProperty("/Sublet", false);
				this.getView().getModel("DateModel").setProperty("/Labour", false);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", true);
			} else if (this.oKey == "VE") {
				this.getView().getModel("DateModel").setProperty("/Paint", true);
				this.getView().getModel("DateModel").setProperty("/Sublet", true);
				this.getView().getModel("DateModel").setProperty("/Parts", true);
				this.getView().getModel("DateModel").setProperty("/Labour", true);
				this.getView().getModel("DateModel").setProperty("/Authorization", true);
			}

		},

		_fnDateFormat: function (elm) {
			var oNumTime = elm.getTime();
			var oTime = "\/Date(" + oNumTime + ")\/";
			return oTime;
		},
		_fnSaveClaim: function () {

			var oCurrentDt = new Date();
			var oValidator = new Validator();

			var oValid = oValidator.validate(this.getView().byId("idpart01Form"));

			if (!oValid) {

				this.getModel("LocalDataModel").setProperty("/step01Next", false);
				//do something additional to drawing red borders? message box?
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				return false;
			} else if (oValid) {
				var obj = {
					"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
					"Partner": "2400034030",
					"PartnerRole": "AS",
					"ReferenceDate": this._fnDateFormat(oCurrentDt),
					"DateOfApplication": this._fnDateFormat(oCurrentDt),
					"FinalProcdDate": null,
					"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
					"RepairOrderNumberExternal": this.getView().getModel("HeadSetData").getProperty("/RepairOrderNumberExternal"),
					"ExternalNumberOfClaim": this.getView().getModel("HeadSetData").getProperty("/ExternalNumberOfClaim"),
					"ExternalObjectNumber": this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber"),
					"Delivery": "",
					"DeliveryDate": this._fnDateFormat(oCurrentDt),
					"TCIWaybillNumber": "",
					"ShipmentReceivedDate": null,
					"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
					"DeliveringCarrier": "",
					"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
					"OFP": this.getView().getModel("HeadSetData").getProperty("/OFP"),
					"WTYClaimRecoverySource": "",
					"MainOpsCode": this.getView().getModel("HeadSetData").getProperty("/MainOpsCode"),
					"T1WarrantyCodes": this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes"),
					"BatteryTestCode": this.getView().getModel("HeadSetData").getProperty("/BatteryTestCode"),
					"T2WarrantyCodes": this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes"),
					"FieldActionReference": this.getView().getModel("HeadSetData").getProperty("/FieldActionReference"),
					"ZCondition": this.getView().getModel("HeadSetData").getProperty("/ZCondition"),
					"Cause": this.getView().getModel("HeadSetData").getProperty("/Cause"),
					"Remedy": this.getView().getModel("HeadSetData").getProperty("/Remedy")
				};

				var oClaimModel = this.getModel("ProssingModel");
				this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});
				oClaimModel.create("/zc_headSet", obj, {
					success: $.proxy(function (data, response) {
						this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
						MessageToast.show("Claim has been saved successfully");
						var oArr = [];
						oClaimModel.read("/ZC_CLAIM_SUM(p_clmno='" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "')/Set", {
							success: $.proxy(function (odata) {
								oArr.push(odata.results[0], odata.results[3]);
								this.getModel("LocalDataModel").setProperty("/ClaimSum", oArr);
							}, this)
						});
						oClaimModel.read("/ZC_CLAIM_HEAD", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "'"
							},
							success: $.proxy(function (sdata) {
								console.log(sdata);
								this.getModel("LocalDataModel").setProperty("/ClaimDetails", sdata.results[0]);
							}, this)
						});

						// this.getView().getModel("HeadSetData").setProperty("/RepairOrderNumberExternal", "");
						// this.getView().getModel("HeadSetData").setProperty("/OFP", "");
						// this.getView().getModel("HeadSetData").setProperty("/WarrantyClaimType", "");
						// this.getView().getModel("HeadSetData").setProperty("/RepairDate", "");
						// this.getView().getModel("HeadSetData").setProperty("/HeadText", "");
						// this.getView().getModel("HeadSetData").setProperty("/DealerContact", "");
						// this.getView().getModel("HeadSetData").setProperty("/ExternalObjectNumber", "");
						// this.getView().getModel("HeadSetData").setProperty("/ExternalNumberOfClaim", "");
						// this.getView().getModel("HeadSetData").setProperty("/FieldActionReference", "");
						// this.getView().getModel("HeadSetData").setProperty("/ZCondition", "");
						// this.getView().getModel("HeadSetData").setProperty("/Cause", "");
						// this.getView().getModel("HeadSetData").setProperty("/Remedy", "");

					}, this),
					error: function (err) {
						console.log(err);
					}
				});
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getModel("LocalDataModel").setProperty("/step01Next", true);

			}
		},
		onSaveClaim: function (oEvent) {
			this._fnSaveClaim();
		},
		onBeforeUpload: function () {

		},
		onUplaodChange: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			if (oClaimNum != "" && oClaimNum != undefined) {
				this.oUploadedFile = oEvent.getParameter("files")[0];
				var reader = new FileReader();
				reader.readAsBinaryString(this.oUploadedFile);

				reader.onload = $.proxy(function (e) {
					if (reader.result) reader.content = reader.result;
					this.oBase = btoa(reader.content);

				}, this);

				
			} else {
				MessageToast.show("Please Save Claim then try Attachments");
			}

			/****************To Fetch CSRF Token*******************/

		},
		getCurrentFolderPath: function () {
			var aHistory = this.getView().getModel("ClaimModel").getProperty("/history");
			// get the current folder path
			var sPath = aHistory.length > 0 ? aHistory[aHistory.length - 1].path : "/";
			return sPath;
		},
		onUploadComplete: function (oEvent) {
			// var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			// var fileType = this.oUploadedFile.type;
			// var oFile = oClaimModel.read("zc_attachSet(NumberOfWarrantyClaim='"+oClaimNum+"',FileName='"+fileType+"')/$value");
			// this.getModel("LocalDataModel").setProperty("/oAttachmentSet", oFile);
			
			//================================================
			
			var oClaimModel = this.getModel("ProssingModel");
				this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});
				var fileType = this.oUploadedFile.type;
				var fileName = this.oUploadedFile.name;

				var headers = {
					"NumberOfWarrantyClaim": oClaimNum,
					"FileName": fileName,
					"LV_REQUEST_BODY": this.oBase,
					"MIMEType": fileType,
					"DBOperation": "SAVE"
				};

				oClaimModel.create("/zc_attachSet", headers, {
					method: "POST",

					success: $.proxy(function () {
						MessageToast.show("SuccesFully Uploaded");

					}, this),
					error: function (err) {
						console.log(err);
					}
				});

			// var sUploadedFile = oEvent.getParameter("files")[0].fileName;
			// var sCurrentPath = this.getCurrentFolderPath();
			// var oData = this.getView().getModel("ClaimModel").getProperty(sCurrentPath);
			// var aItems = oData && oData.items;
			// var oItem;
			// var fileName = this.oUploadedFile.name;
			// var isProxy = "";
			// var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");

			// if (window.document.domain == "localhost") {
			// 	isProxy = "proxy";
			// }
			// var oUrl = window.open(isProxy +
			// 	"/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + sUploadedFile + "')/$value",
			// 	'_blank');
			// oItem = {
			// 	"documentId": jQuery.now().toString(), // generate Id,
			// 	"fileName": sUploadedFile,
			// 	"Type": this.oUploadedFile.type,
			// 	"size": this.oUploadedFile.size,
			// 	"url": oUrl
			// };
			// if (aItems.length === 0) {
			// 	aItems.push(oItem);
			// } else {
			// 	// insert file after all folders
			// 	for (var i = 0; i < aItems.length; i++) {
			// 		if (aItems[i].type !== "folder") {
			// 			aItems.splice(i, 0, oItem);
			// 			break;
			// 		}
			// 	}
			// }
			// this.getView().getModel("ClaimModel").setProperty(sCurrentPath + "/items", aItems);
			// console.log(this.getView().getModel("ClaimModel"));
			// jQuery.sap.delayedCall(1000, this, function () {
			// 	MessageToast.show("UploadComplete event triggered.");
			// });

		},

		onBreadcrumbPress: function () {
			var isProxy = "";
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var filename = this.oUploadedFile.name;
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			var w = window.open(isProxy +
				"/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + filename + "')/$value",
				'_blank');
			if (w == null) {

				//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
			}

		},
		onFileDeleted: function (oEvent) {
			this.deleteItemById(oEvent.getParameter("documentId"), "ClaimModel");
			MessageToast.show("FileDeleted event triggered.");
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
		bindUploadCollectionItems: function (path) {
			this.oUploadCollection.bindItems({
				path: path,
				factory: this.uploadCollectionItemFactory.bind(this)
			});
		},
		getCurrentLocationText: function () {
			// Remove the previously added number of items from the currentLocationText in order to not show the number twice after rendering.
			var sText = this.oBreadcrumbs.getCurrentLocationText().replace(/\s\([0-9]*\)/, "");
			return sText;
		},

		onPressAddPart: function () {
			this.getView().getModel("DateModel").setProperty("/partLine", true);
		},
		onPressAddLabour: function () {
			this.getView().getModel("DateModel").setProperty("/labourLine", true);
		},
		onPressAddPaint: function () {
			this.getView().getModel("DateModel").setProperty("/paintLine", true);
		},
		onPressAddSublet: function () {
			this.getView().getModel("DateModel").setProperty("/subletLine", true);
		},
		// onPressSavePart: function () {
		// 	var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
		// 	var obj = {
		// 		matnr: this.getView().getModel("PartDataModel").getProperty("/matnr"),
		// 		quant: this.getView().getModel("PartDataModel").getProperty("/quant")
		// 	};
		// 	console.log(obj);
		// 	var oClaimModel = this.getModel("ProssingModel");
		// 	var oProductMaster = this.getModel("ProductMaster");

		// 	oClaimModel.read("/zc_claim_item_price_dataSet", {
		// 		urlParameters: {
		// 			"$filter": "clmno eq '" + oClaimNum + "'and matnr eq '" + obj.matnr + "'and PartQty eq '" + obj.quant + "' "
		// 		},
		// 		success: $.proxy(function (data) {
		// 			this.getModel("LocalDataModel").setProperty("/PartPricingData", data.results);

		// 		}, this),
		// 		error: function (err) {
		// 			console.log(err);
		// 		}
		// 	});
		// },
		onPressForeignVin: function () {

		},
		onPressWrittenOff: function () {

		},
		onPressSpecialVin: function () {

		},
		onStep01Next: function (oEvent) {
			// var oFormContent = this.getView().byId("idClaimForm").getContent();
			// var oValid = true;
			// for (var i in oFormContent) {
			// 	var oControl = oFormContent[i];
			// 	if (oValid && oControl.getValue && oControl.getValue() === "") {
			// 		oValid = false;
			// 		break;
			// 	}
			// }

			// if (!oValid) {
			// 	this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			// 	this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
			// 	this.getView().byId("idMainClaimMessage").setType("Error");

			// } else {
			// 	this.getView().byId("idMainClaimMessage").setProperty("visible", false);
			// 	this.getView().byId("idMainClaimMessage").setType("None");
			// 	this.getView().byId("idFilter02").setProperty("enabled", true);
			// 	this.getView().byId("idIconTabMainClaim").setSelectedKey("idFilter02");
			// }

			// var oClaim = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			// var oClaimModel = this.getModel("ProssingModel");
			// oClaimModel.read("/ZC_CLAIM_HEAD", {
			// 	urlParameters: {
			// 		"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'"
			// 	},
			// 	success: $.proxy(function (data) {
			// 		console.log(data);
			// 		this.getModel("LocalDataModel").setProperty("/ClaimDetails", data.results[0]);
			// 	}, this)
			// });

			// oClaimModel.read("/ZC_CLAIM_ITEM_PRICE(p_clmno='" + oClaim + "')/Set", {
			// 	success: $.proxy(function (data) {
			// 		console.log(data);
			// 	}, this)
			// });

			if (this.oKey != "A1" && this.oKey != "A2" && this.oKey != "AC" && this.oKey != "MS") {
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
			} else if (this.oKey == "MS") {
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
			} else {
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
			}

		},

		onStep02Next: function () {
			if (this.oKey != "MS" && this.oKey != "A1" && this.oKey != "A2" && this.oKey != "AC") {
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
			}
		},
		onStep02Back: function () {

			this.getView().byId("idFilter01").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");

		},

		onStep03Next: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oOFP = this.getModel("LocalDataModel").getProperty("/ClaimDetails/OFP");
			if (this.oKey == "P2") {
				this.getView().byId("idFilter07").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
			} else {
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
			}
			var oProssingModel = this.getModel("ProssingModel");
			oProssingModel.read("/zc_get_operation_numberSet", {
				urlParameters: {
					"$filter": "CLMNO eq '" + oClaimNum + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/SuggetionOperationList", data.results);
				}, this),
				error: function () {
					console.log("Error");
				}
			});

			oProssingModel.read("/zc_get_suggested_operationsSet", {
				urlParameters: {
					"$filter": "CLMNO eq '" + oClaimNum + "'and OFP_GROUP eq '" + oOFP + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/SuggetionOperationListFiltered", data.results);
				}, this),
				error: function () {
					console.log("Error");
				}
			});

		},
		onStep03Back: function () {
			if (this.oKey != "MS" && this.oKey != "A1" && this.oKey != "A2" && this.oKey != "AC") {
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab2");
			} else {
				this.getView().byId("idFilter01").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
			}
		},

		onStep04Next: function () {
			if (this.oKey != "MS" && this.oKey != "A1" && this.oKey != "A2" && this.oKey != "AC" && this.oKey != "P1") {
				this.getView().byId("idFilter05").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab5");
			} else {
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
			}
		},
		onStep04Back: function () {

			this.getView().byId("idFilter03").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");

		},

		onStep05Next: function () {
			if (this.oKey != "MS" && this.oKey != "A1" && this.oKey != "A2" && this.oKey != "AC") {
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
			}
		},
		onStep05Back: function () {

			this.getView().byId("idFilter04").setProperty("enabled", true);
			this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");

		},

		onStep06Next: function () {
			if (this.oKey != "P2") {
				this.getView().byId("idFilter07").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab7");
			}
		},
		onStep06Back: function () {
			if (this.oKey == "A1" && this.oKey == "A2" && this.oKey == "AC") {
				this.getView().byId("idFilter04").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab4");
			} else if (this.oKey == "MS") {
				this.getView().byId("idFilter01").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab1");
			} else {
				this.getView().byId("idFilter05").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab5");
			}

		},

		onStep07Back: function () {
			if (this.oKey == "P2") {
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab3");
			} else {
				this.getView().byId("idFilter06").setProperty("enabled", true);
				this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab6");
			}

		},

		onPressBack: function (oEvent) {
			this.ogetSelectedKey = this.getView().byId("idIconTabMainClaim").getSelectedKey();
			var ogetKey = this.ogetSelectedKey.split("Tab")[1];
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			// if (ogetKey > 1 && ogetKey <= 8) {
			// 	var oSelectedNum = ogetKey - 1;
			// 	this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab" + oSelectedNum + "");
			// } else {
			// 	this.getRouter().navTo("SearchClaim");
			// }

			var that = this;
			var dialog = new Dialog({
				title: oBundle.getText("SaveChanges"),
				type: "Message",
				content: new Text({
					text: oBundle.getText("WillYouLikeSaveChanges")
				}),

				buttons: [
					new Button({
						text: oBundle.getText("Yes"),
						press: function () {
							that._fnSaveClaim();
							dialog.close();
						}
					}),

					new Button({
						text: oBundle.getText("No"),
						press: function () {

							that.getRouter().navTo("SearchClaim");
							dialog.close();
						}
					}),
					new Button({
						text: oBundle.getText("Cancel"),
						press: function () {
							dialog.close();
						}
					})

				],

				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();

		},
		handleValueHelp: function (oController) {
			//debugger;
			this.inputId = oController.getParameters().id;
			//console.log(this.inputId);
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"zclaimProcessing.view.fragments.partList",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// open value help dialog
			this._valueHelpDialog.open();
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");

			if (sValue) {
				var oFilter = new Filter(
					"Material",
					sap.ui.model.FilterOperator.EQ, sValue
				);
				//console.log(oFilter);
				evt.getSource().getBinding("items").filter([oFilter]);
			} else {
				evt.getSource().getBinding("items").filter([]);
			}
		},

		_handleValueHelpClose: function (evt) {
			this.oSelectedItem = evt.getParameter("selectedItem");
			this.oSelectedTitle = this.oSelectedItem.getTitle();
			this.getView().getModel("LocalDataModel").setProperty("/MaterialDescription", this.oSelectedItem.getInfo());
			this.getView().byId("idPartDes").setValue(this.oSelectedItem.getInfo());
			if (this.oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(this.oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},

		// handleValueHelpLabour: function (oController) {
		// 	this.inputId = oController.getParameters().id;
		// 	//console.log(this.inputId);
		// 	// create value help dialog
		// 	if (!this._valueHelpDialogLabour) {
		// 		this._valueHelpDialogLabour = sap.ui.xmlfragment(
		// 			"zclaimProcessing.view.fragments.LabourNumber",
		// 			this
		// 		);
		// 		this.getView().addDependent(this._valueHelpDialogLabour);
		// 	}

		// 	// open value help dialog
		// 	this._valueHelpDialogLabour.open();
		// },
		// _handleValueHelpSearchLabour: function (evt) {
		// 	var sValue = evt.getParameter("value");

		// 	if (sValue) {
		// 		var oFilter = new Filter(
		// 			"LabourNumber",
		// 			sap.ui.model.FilterOperator.EQ, sValue
		// 		);
		// 		//console.log(oFilter);
		// 		evt.getSource().getBinding("items").filter([oFilter]);
		// 	} else {
		// 		evt.getSource().getBinding("items").filter([]);
		// 	}
		// },
		// _handleValueHelpCloseLabour: function (evt) {
		// 	this.oSelectedItem = evt.getParameter("selectedItem");
		// 	this.oSelectedTitle = this.oSelectedItem.getTitle();
		// 	// this.getView().getModel("LocalDataModel").setProperty("/MaterialDescription", this.oSelectedItem.getInfo());
		// 	// this.getView().byId("idPartDes").setValue(this.oSelectedItem.getInfo());
		// 	if (this.oSelectedItem) {
		// 		var productInput = this.byId(this.inputId);
		// 		productInput.setValue(this.oSelectedItem.getTitle());
		// 	}
		// 	evt.getSource().getBinding("items").filter([]);
		// },

		// handleValueHelpPaint: function (oController) {
		// 	this.inputId = oController.getParameters().id;
		// 	//console.log(this.inputId);
		// 	// create value help dialog
		// 	if (!this._valueHelpDialogPaint) {
		// 		this._valueHelpDialogPaint = sap.ui.xmlfragment(
		// 			"zclaimProcessing.view.fragments.operationList",
		// 			this
		// 		);
		// 		this.getView().addDependent(this._valueHelpDialogPaint);
		// 	}

		// 	// open value help dialog
		// 	this._valueHelpDialogLabour.open();
		// },
		// _handleValueHelpSearchPaint: function (evt) {
		// 	var sValue = evt.getParameter("value");

		// 	if (sValue) {
		// 		var oFilter = new Filter(
		// 			"PaintPositionCode",
		// 			sap.ui.model.FilterOperator.EQ, sValue
		// 		);
		// 		//console.log(oFilter);
		// 		evt.getSource().getBinding("items").filter([oFilter]);
		// 	} else {
		// 		evt.getSource().getBinding("items").filter([]);
		// 	}
		// },
		// _handleValueHelpClosePaint: function (evt) {
		// 	this.oSelectedItem = evt.getParameter("selectedItem");
		// 	this.oSelectedTitle = this.oSelectedItem.getTitle();
		// 	// this.getView().getModel("LocalDataModel").setProperty("/MaterialDescription", this.oSelectedItem.getInfo());
		// 	// this.getView().byId("idPartDes").setValue(this.oSelectedItem.getInfo());
		// 	if (this.oSelectedItem) {
		// 		var productInput = this.byId(this.inputId);
		// 		productInput.setValue(this.oSelectedItem.getTitle());
		// 	}
		// 	evt.getSource().getBinding("items").filter([]);
		// },

		onPressSavePart: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oTable = this.getView().byId("idTableParts");
			this.obj.Message = "";
			this.obj.RefWarrantyClaim = oClaimNum;
			var itemObj = {
				"ItemType": "PART",
				"ControllingItemType": "MAT",
				"MaterialNumber": this.getView().getModel("PartDataModel").getProperty("/matnr"),
				"PartQty": this.getView().getModel("PartDataModel").getProperty("/quant")
			};

			this.obj.zc_itemSet.results.push(itemObj);

			//obj.zc_itemSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");

			this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					var pricinghData = response.data.zc_claim_item_price_data.results;
					var oFilteredData = pricinghData.filter(function (val) {
						return val.Type === "PART";

					});
					console.log(oFilteredData);
					this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
					MessageToast.show("Claim has been saved successfully");
					this.getView().getModel("DateModel").setProperty("/partLine", false);
					this.getView().getModel("PartDataModel").setProperty("/matnr", "");
					this.getView().getModel("PartDataModel").setProperty("/quant", "");
					this.getView().byId("idPartDes").setValue("");
					oTable.setSelectedIndex(-1);

				}, this),
				error: function (err) {
					console.log(err);
				}
			});

		},
		// onNavigatePart: function (oEvent) {

		// 	var oSelectedRow = oEvent.getParameters().rowContext.sPath;
		// 	var obj = oEvent.getSource().getModel("LocalDataModel").getProperty(oSelectedRow);
		// 	this.PartNum = obj.matnr;
		// 	this.PartQt = obj.quant;
		// },

		onPressUpdatePart: function (oEvent) {
			var oTable = this.getView().byId("idTableParts");
			var oTableIndex = oTable.getSelectedIndices();

			if (oTableIndex.length == 1) {

				var oString = oTableIndex.toString();
				var oTableStringSplit = oTableIndex.toString().split(",");
				var oSelectedRow = "/PricingDataModel/" + oString;
				var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
				var PartNum = obj.matnr;
				var PartQt = obj.quant;
				this.getView().getModel("PartDataModel").setProperty("/matnr", PartNum);
				this.getView().getModel("PartDataModel").setProperty("/quant", PartQt);
				this.getView().getModel("DateModel").setProperty("/partLine", true);
				// for (var j = 0; j < this.obj.zc_itemSet.results.length; j++) {
				// 	if (this.obj.zc_itemSet.results[j].MaterialNumber == PartNum) {
				// 		this.obj.zc_itemSet.results.splice(j);
				// 	}
				// }

				//	Array.prototype.splice.apply(this.obj.zc_itemSet.results, oTableStringSplit);
				var oIndex = oTable.getSelectedIndex();
				this.obj.zc_itemSet.results.splice(oIndex, 1);
				var oClaimModel = this.getModel("ProssingModel");
				this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});

				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_data.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.Type === "PART";
						});
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);

						//MessageToast.show("Claim has been deleted successfully");
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show("Please select 1 row.");
				oTable.setSelectedIndex(-1);
			}
		},
		onPressDeletePart: function () {
			var oTable = this.getView().byId("idTableParts");
			var oTableIndex = oTable.getSelectedIndices();

			if (oTableIndex.length == 1) {
				// var oTableStringSplit = oTableIndex.toString().split(",");
				// Array.prototype.splice.apply(this.obj.zc_itemSet.results, oTableStringSplit);

				var oIndex = oTable.getSelectedIndex();
				this.obj.zc_itemSet.results.splice(oIndex, 1);

				var oClaimModel = this.getModel("ProssingModel");
				this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_data.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.Type === "PART";

						});
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
						oTable.setSelectedIndex(-1);
						MessageToast.show("Claim has been deleted successfully");
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show("Please select 1 row.");
				oTable.setSelectedIndex(-1);
			}
		},
		onSelectOFP: function (oEvent) {
			var table = this.getView().byId("idTableParts");

			var oSelectedPart = oEvent.getSource().getParent().getCells()[2].getText();
			this.getView().byId("idOFPart").setText(oSelectedPart);

			table.setSelectedIndex(-1);

		},
		onSelectOFPLabour: function (oEvent) {
			var table = this.getView().byId("idLabourTable");
			var oSelectedPart = oEvent.getSource().getParent().getCells()[2].getText();
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.getView().byId("idOFPLabour").setText(oSelectedPart);
			var oProssingModel = this.getModel("ProssingModel");
			oProssingModel.read("/zc_get_suggested_operationsSet", {
				urlParameters: {
					"$filter": "CLMNO eq '" + oClaimNum + "'and OFP_GROUP eq '" + oSelectedPart + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/SuggetionOperationListFiltered", data.results);
				}, this),
				error: function () {
					console.log("Error");
				}
			});
			table.setSelectedIndex(-1);
		},
		onPressSuggestLabour: function (oEvent) {

			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.operationList", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},
		onCloseLabour: function (oEvent) {
			oEvent.getSource().getParent().getParent().close();
		},
		onSelectOperation: function (oEvent) {
			var oPath = oEvent.getSource().getSelectedContexts()[0].sPath;
			var obj = this.getModel("LocalDataModel").getProperty(oPath);
			this.SelectedOpNum = {
				"J_3GKATNRC": obj.J_3GKATNRC,
				"CLMNO": obj.CLMNO,
				"RELOB_EXT": obj.RELOB_EXT
			};
			this.getView().getModel("DateModel").setProperty("/SuggestBtn", true);
		},
		handleConfirmLabour: function (oEvent) {
			var oOperationListSuggestion = this.getModel("LocalDataModel").getProperty("/SuggetionOperationListFiltered");
			var oOperationList = this.getModel("LocalDataModel").getProperty("/SuggetionOperationList");
			// for(var i=0; i<oOperationListSuggestion.length; i++){
			// 	if(oOperationList.indexOf(oOperationListSuggestion[i].J_3GKATNRC) < 0){
			// 		oOperationList.push(this.SelectedOpNum);

			// 	}else {
			// 		MessageToast.show("Operation Number Already Exist");
			// 	}
			// }
			oOperationList.push(this.SelectedOpNum);
			oOperationListSuggestion.pop(this.SelectedOpNum);

			this.getModel("LocalDataModel").setProperty("/SuggetionOperationList", oOperationList);
			this.getModel("LocalDataModel").setProperty("/SuggetionOperationListFiltered", oOperationListSuggestion);
			oEvent.getSource().getParent().getParent().close();
		},
		onPressSaveClaimItemLabour: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oTable = this.getView().byId("idLabourTable");
			this.obj.Message = "";
			this.obj.RefWarrantyClaim = oClaimNum;

			var itemObj = {

				"ItemType": "LAB",
				"LabourNumber": this.getView().getModel("LabourDataModel").getProperty("/LabourOp"),
				"ClaimedHours": this.getView().getModel("LabourDataModel").getProperty("/ClaimedHours")
			};
			this.obj.zc_claim_item_labourSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");
			this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					console.log(response);
					var pricinghData = response.data.zc_claim_item_price_data.results;
					var oFilteredData = pricinghData.filter(function (val) {
						return val.Type === "LABOUR";
					});
					console.log(oFilteredData);
					this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredData);
					//this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
					MessageToast.show("Claim Item has been saved successfully");
					this.getView().getModel("DateModel").setProperty("/labourLine", false);
					this.getView().getModel("LabourDataModel").setProperty("/LabourOp", "");
					this.getView().getModel("LabourDataModel").setProperty("/ClaimedHours", "");
					oTable.setSelectedIndex(-1);
				}, this),
				error: function (err) {
					console.log(err);
				}
			});

		},
		// onNavigateLabour: function (oEvent) {
		// 	console.log(oEvent);
		// 	var oSelectedRow = oEvent.getParameters().rowContext.sPath;
		// 	var oIndex = oSelectedRow.split("/")[2];
		// 	this.ArrIndexLabour.push(oIndex);
		// 	// var obj = oEvent.getSource().getModel("LocalDataModel").getProperty(this.oAgrTable);
		// 	// this.PartNum = obj.matnr;
		// },
		onPressDeleteLabour: function () {

			var oTable = this.getView().byId("idLabourTable");
			var oTableIndex = oTable.getSelectedIndices();

			if (oTableIndex.length == 1) {
				var oTableStringSplit = oTableIndex.toString().split(",");
				//Array.prototype.splice.apply(this.obj.zc_claim_item_labourSet.results, oTableStringSplit);
				var oIndex = oTable.getSelectedIndex();
				this.obj.zc_claim_item_labourSet.results.splice(oIndex, 1);
				var oClaimModel = this.getModel("ProssingModel");
				this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});

				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_data.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.Type === "LABOUR";
						});
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredData);
						MessageToast.show("Claim has been deleted successfully");
						oTable.setSelectedIndex(-1);
						// this.getView().getModel("DateModel").setProperty("/partLine", false);
						// this.getView().getModel("PartDataModel").setProperty("/matnr", "");
						// this.getView().getModel("PartDataModel").setProperty("/quant", "");
						// this.getView().byId("idPartDes").setValue("");

					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show("Please select 1 row.");
				oTable.setSelectedIndex(-1);
			}
		},

		onPressUpdateLabour: function (oEvent) {
			var oTable = this.getView().byId("idLabourTable");
			var oTableIndex = oTable.getSelectedIndices();

			if (oTableIndex.length == 1) {
				var oString = oTableIndex.toString();
				var oSelectedRow = "/LabourPricingDataModel/" + oString;
				var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
				var LabourNum = obj.matnr;
				var LabourHr = obj.QtyHrs;
				this.getView().getModel("LabourDataModel").setProperty("/LabourOp", LabourNum);
				this.getView().getModel("LabourDataModel").setProperty("/ClaimedHours", LabourHr);
				this.getView().getModel("DateModel").setProperty("/LabourLine", true);
				// for (var j = 0; j < this.obj.zc_claim_item_labourSet.results.length; j++) {
				// 	if (this.obj.zc_claim_item_labourSet.results[j].LabourNumber == LabourNum) {
				// 		this.obj.zc_claim_item_labourSet.results.splice(j);
				// 	}
				// }
					var oIndex = oTable.getSelectedIndex();
				this.obj.zc_claim_item_labourSet.results.splice(oIndex, 1);
				var oClaimModel = this.getModel("ProssingModel");
				this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});

				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_data.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.Type === "LABOUR";
						});
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/LabourPricingDataModel", oFilteredData);
						oTable.setSelectedIndex(-1);
						//MessageToast.show("Claim has been deleted successfully");
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show("Please select 1 row.");
				oTable.setSelectedIndex(-1);
			}
		},

		onPressSavePaint: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.obj.Message = "";
			this.obj.RefWarrantyClaim = oClaimNum;
			var oTable = this.getView().byId("idPaintTable");
			var itemObj = {
				"ItemType": "PAINT",
				"PaintPositionCode": this.getView().getModel("PaintDataModel").getProperty("/PaintPositionCode"),
				"ClaimedHours": "0.00"
			};
			this.obj.zc_claim_item_paintSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");
			this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					console.log(response);
					var pricinghData = response.data.zc_claim_item_price_data.results;
					var oFilteredData = pricinghData.filter(function (val) {
						return val.Type === "PAINT";
					});
					console.log(oFilteredData);
					this.getModel("LocalDataModel").setProperty("/PaintPricingDataModel", oFilteredData);
					//this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
					MessageToast.show("Claim Item has been saved successfully");
					this.getView().getModel("DateModel").setProperty("/paintLine", false);
					this.getView().getModel("PaintDataModel").setProperty("/PaintPositionCode", "");
					oTable.setSelectedIndex(-1);
				}, this),
				error: function (err) {
					console.log(err);
				}
			});

		},
		// onNavigatePaint: function (oEvent) {
		// 	console.log(oEvent);
		// 	this.ArrIndexPaint = [];
		// 	var oSelectedRow = oEvent.getParameters().rowContext.sPath;
		// 	var oIndex = oSelectedRow.split("/")[2];
		// 	this.ArrIndexPaint.push(oIndex);
		// 	// var obj = oEvent.getSource().getModel("LocalDataModel").getProperty(this.oAgrTable);
		// 	// this.PartNum = obj.matnr;
		// },
		onPressDeletePaint: function () {
			var oTable = this.getView().byId("idPaintTable");
			var oTableIndex = oTable.getSelectedIndices();

			if (oTableIndex.length == 1) {
				var oTableStringSplit = oTableIndex.toString().split(",");
				// Array.prototype.splice.apply(this.obj.zc_claim_item_paintSet.results, oTableStringSplit);
				var oIndex = oTable.getSelectedIndex();
				this.obj.zc_claim_item_paintSet.results.splice(oIndex, 1);
				var oClaimModel = this.getModel("ProssingModel");
				this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_data.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.Type === "PAINT";
						});
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/PaintPricingDataModel", oFilteredData);
						MessageToast.show("Claim has been deleted successfully");
						oTable.setSelectedIndex(-1);
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show("Please select 1 row.");
				oTable.setSelectedIndex(-1);
			}
		},
		onPressSaveClaimItemSublet: function () {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oTable = this.getView().byId("idSubletTable");
			this.obj.Message = "";
			this.obj.RefWarrantyClaim = oClaimNum;

			var itemObj = {
				"ItemType": "SUB",
				"SubletType": this.getView().getModel("SubletDataModel").getProperty("/SubletCode"),
				"Brand": this.getView().getModel("SubletDataModel").getProperty("/brand"),
				"RetalDays": this.getView().getModel("SubletDataModel").getProperty("/days"),
				"InvoiceNo": this.getView().getModel("SubletDataModel").getProperty("/InvoiceNo"),
				"Amount": this.getView().getModel("SubletDataModel").getProperty("/Amount")

			};

			this.obj.zc_item_subletSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");
			this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});
			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					console.log(response);
					var pricinghData = response.data.zc_claim_item_price_data.results;
					var oFilteredData = pricinghData.filter(function (val) {
						return val.Type === "SUBLET";
					});
					console.log(oFilteredData);
					this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredData);
					//this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
					MessageToast.show("Claim Item has been saved successfully");
					this.getView().getModel("DateModel").setProperty("/subletLine", false);
					this.getView().getModel("SubletDataModel").setProperty("/SubletCode", "");
					this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", "");
					this.getView().getModel("SubletDataModel").setProperty("/Amount", "");
					oTable.setSelectedIndex(-1);

				}, this),
				error: function (err) {
					console.log(err);
				}
			});
		},
		// onNavigateSublet: function (oEvent) {
		// 	console.log(oEvent);
		// 	this.ArrIndexSublet = [];
		// 	var oSelectedRow = oEvent.getParameters().rowContext.sPath;
		// 	var oIndex = oSelectedRow.split("/")[2];
		// 	this.ArrIndexSublet.push(oIndex);
		// 	// var obj = oEvent.getSource().getModel("LocalDataModel").getProperty(this.oAgrTable);
		// 	// this.PartNum = obj.matnr;
		// },

		onPressUpdateSublet: function (oEvent) {
			var oTable = this.getView().byId("idSubletTable");
			var oTableIndex = oTable.getSelectedIndices();

			if (oTableIndex.length == 1) {
				var oString = oTableIndex.toString();
				var oSelectedRow = "/SubletPricingDataModel/" + oString;
				var obj = this.getView().getModel("LocalDataModel").getProperty(oSelectedRow);
				var SubletNum = obj.matnr;
				var SubletInv = obj.InvoiceNo;
				var SubletAmount = obj.Amount;
				this.getView().getModel("SubletDataModel").setProperty("/SubletCode", SubletNum);
				this.getView().getModel("SubletDataModel").setProperty("/InvoiceNo", SubletInv);
				this.getView().getModel("SubletDataModel").setProperty("/Amount", SubletAmount);
				this.getView().getModel("DateModel").setProperty("/subletLine", true);
				// for (var j = 0; j < this.obj.zc_item_subletSet.results.length; j++) {
				// 	if (this.obj.zc_item_subletSet.results[j].SubletType == SubletNum) {
				// 		this.obj.zc_item_subletSet.results.splice(j);
				// 	}
				// }
				
				var oIndex = oTable.getSelectedIndex();
				this.obj.zc_item_subletSet.results.splice(oIndex, 1);
				
				var oClaimModel = this.getModel("ProssingModel");
				this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_data.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.Type === "SUBLET";
						});
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredData);
						oTable.setSelectedIndex(-1);
						//MessageToast.show("Claim has been deleted successfully");
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show("Please select 1 row.");
				oTable.setSelectedIndex(-1);
			}
		},
		onPressDeleteSublet: function () {
			var oTable = this.getView().byId("idSubletTable");
			var oTableIndex = oTable.getSelectedIndices();

			if (oTableIndex.length == 1) {
				var oTableStringSplit = oTableIndex.toString().split(",");
				//Array.prototype.splice.apply(this.obj.zc_item_subletSet.results, oTableStringSplit);
var oIndex = oTable.getSelectedIndex();
				this.obj.zc_item_subletSet.results.splice(oIndex, 1);
				var oClaimModel = this.getModel("ProssingModel");
				this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_data.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.Type === "SUBLET";

						});
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/SubletPricingDataModel", oFilteredData);
						MessageToast.show("Claim has been deleted successfully");
						oTable.setSelectedIndex(-1);

					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show("Please select 1 row.");
				oTable.setSelectedIndex(-1);
			}
		},

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