sap.ui.define([
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/MessageToast',
	'sap/m/Text',
	"zclaimProcessing/controller/BaseController",
	"zclaimProcessing/libs/jQuery.base64",
	"sap/ui/core/ValueState",
	"zclaimProcessing/utils/Validator",
	'sap/ui/model/Filter',
], function (Button, Dialog, Label, MessageToast, Text, BaseController, base64, ValueState, Validator, Filter) {
	"use strict";
	var callData, arrPartLOI = [],
		BpDealerModel, BpDealerList = [];
	return BaseController.extend("zclaimProcessing.controller.PartsMainSection", {

		onInit: function () {
			var oDateModel = new sap.ui.model.json.JSONModel();
			oDateModel.setData({
				dateValueDRS2: new Date(2018, 1, 1),
				secondDateValueDRS2: new Date(2018, 2, 1),
				partLine: false,
				oFormEdit: true,
				claimTypeEn: true,
				SaveClaim07: true,
				oLetterOfIntent: false
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
				"partsHistory": [],
				"items": []
			});
			this.getView().setModel(oAttachments, "AttachmentModel");

			//oNodeModel.loadData(jQuery.sap.getModulePath("zclaimProcessing.utils", "/Nodes.json"));
			var oMultiHeaderConfig = {
				multiheader1: [3, 1],
				multiheader2: [2, 1],
				multiheader3: [6, 1],
				multiheader5: 7,
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
				DealerNetPrcEdt: false,
				PartRepaired: true,
				DiscrepancyCol: false,
				DamageConditionCol: true,
				MiscellaneousCol: false,
				TransportCol: false,
				PartRepCol: true,
				RepAmountCol: true,
				RetainPartCol: false,
				AttachmentCol: true,
				PartNumberEdit: true
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
			BpDealerModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(BpDealerModel, "BpDealerModel");

			this.setModel(this.getModel("ProssingModel"));
			var oProssingModel = this.getModel("ProssingModel");
			this.setModel(this.getModel("ProductMaster"), "ProductMasterModel");
			var oArr = [];
			var warrantyClaimNumber = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			oProssingModel.read("/ZC_CLAIM_SUM(p_clmno='" + warrantyClaimNumber + "')/Set", {
				success: $.proxy(function (data) {
					// oArr.push(data.results[0], data.results[3]);
					this.getModel("LocalDataModel").setProperty("/ClaimSum", oArr);
				}, this)
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
				"text": null,
				"number": 0,
				"RetainPart": "",
				"PartNumberRc": "",
				"PartNumberRcDesc": "",
				"PartRepaired": "",
				"RepairAmount": "",
				"RepairQty": "0.000",
				"DamageCondition": "",
				"MiscellaneousCode": "",
				"TranportShortageType": "",
				"DiscrepancyCodes": "",
				"ALMDiscrepancyCode": ""
			});
			HeadSetData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(HeadSetData, "HeadSetData");

			var partData = new sap.ui.model.json.JSONModel({
				"matnr": "",
				"quant": "",
				"PartDescription": "",
				"LineNo": ""
			});
			partData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(partData, "PartDataModel");

			sap.ui.getCore().attachValidationError(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.Error);
			});
			sap.ui.getCore().attachValidationSuccess(function (oEvent) {
				oEvent.getParameter("element").setValueState(ValueState.None);
			});

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				this.sPrefix = "/Claim_Destination"; //ecpSales_node_secured
				this.attributeUrl = "/userDetails/attributesforlocaltesting";
			} else {
				this.sPrefix = "";
				this.attributeUrl = "/userDetails/attributes";
			}

			this.getOwnerComponent().getRouter().attachRoutePatternMatched(this._onRoutMatched, this);
			this.getModel("LocalDataModel").setProperty("/step01Next", false);
		},

		_getBPList: function () {
			var that = this;
			// console.log("bp data from attributes", BpDealer);
			$.ajax({
				url: this.sPrefix +
					"/node/API_BUSINESS_PARTNER/A_BusinessPartnerRole?$filter=BusinessPartnerRole%20eq%20%27CRM010%27&format=json&$top=50",
				type: "GET",
				dataType: "json",

				success: function (oData) {
					console.log("Role BP list", oData.d.results);
					$.each(oData.d.results, function (i, item) {
						that._getBPModel(item.BusinessPartner);
					});
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		_getBPModel: function (BusinessPartner) {
			var that = this;
			$.ajax({
				url: this.sPrefix + "/node/API_BUSINESS_PARTNER/A_BusinessPartner?$filter=BusinessPartner eq '" + BusinessPartner +
					"' &$expand=to_BusinessPartnerAddress",
				type: "GET",
				dataType: "json",
				success: function (oData) {
					console.log("BPNameAddress", oData.d.results);
					$.each(oData.d.results, function (i, item) {
						var BpLength = item.BusinessPartner.length;
						BpDealerList.push({
							"BusinessPartnerKey": item.BusinessPartner,
							"BusinessPartner": item.BusinessPartner.substring(5, BpLength),
							"BusinessPartnerName": item.OrganizationBPName1, //item.OrganizationBPName1 //item.BusinessPartnerFullName
							"BusinessPartnerFullName": item.BusinessPartnerFullName, //item.OrganizationBPName1 //item.BusinessPartnerFullName
							"BusinessPartnerType": item.BusinessPartnerType,
							"searchTermReceivedDealerName": item.SearchTerm1,
							"HouseNumber": item.to_BusinessPartnerAddress.results[0].HouseNumber,
							"CityName": item.to_BusinessPartnerAddress.results[0].CityName,
							"Country": item.to_BusinessPartnerAddress.results[0].Country,
							"PostalCode": item.to_BusinessPartnerAddress.results[0].PostalCode,
							"StreetName": item.to_BusinessPartnerAddress.results[0].StreetName,
							"Region": item.to_BusinessPartnerAddress.results[0].Region
						});
					});
					console.log("Role BP list filtered", BpDealerList);
					that.getView().getModel("BpDealerModel").setProperty("/BpDealerList", BpDealerList);
					// that.getView().getModel("BpDealerModel").updateBindings(true);
					console.log("BPDealerModel", that.getView().getModel("BpDealerModel"));
				},
				error: function (response) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		_onRoutMatched: function (oEvent) {
			// this._getBPModel();
			this._getBPList();
			var oClaim = oEvent.getParameters().arguments.claimNum;
			this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", oClaim);
			// this.getModel("LOIDataModel").setProperty("/claimNumber", oClaim);
			// LOIDataModel claimNumber
			if (oClaim != "nun" && oClaim != undefined) {
				this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
				var oProssingModel = this.getModel("ProssingModel");
				oProssingModel.read("/ZC_CLAIM_HEAD", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "' "
					},
					success: $.proxy(function (data) {
						this.getModel("LocalDataModel").setProperty("/ClaimDetails", data.results[0]);
						this.getModel("LocalDataModel").setProperty("/PartDetailList", data.results[0].to_claimitem.results);
						console.log(data.results);
						var HeadSetData = new sap.ui.model.json.JSONModel(data.results[0]);
						HeadSetData.setDefaultBindingMode("TwoWay");
						this.getView().setModel(HeadSetData, "HeadSetData");
					}, this),
					error: function () {}
				});

				oProssingModel.read("/zc_claim_item_price_dataSet", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "' "
					},
					success: $.proxy(function (data) {

						var pricinghData = data.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.ItemType === "MAT";
						});

						this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
						var PartItem = oFilteredData.map(function (item) {
							return {
								Type: "PART",
								ItemType: "",
								ControllingItemType: "MAT",
								UnitOfMeasure: item.UnitOfMeasure,
								MaterialNumber: item.matnr,
								PartDescription: item.PartDescription,
								PartQty: item.PartQty,
								LineRefnr: item.LineRefnr
							};

						});
						this.obj = {
							"DBOperation": "SAVE",
							"Message": "",
							"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/ClaimType"),
							"Partner": this.getModel("LocalDataModel").getProperty("/BPDealerDetails/BusinessPartnerKey"),
							"ActionCode": "",
							"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
							"PartnerRole": "AS",
							"ReferenceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate")),
							"DateOfApplication": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication")),
							"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
							"Delivery": "",
							"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
							"TCIWaybillNumber": "",
							"ShipmentReceivedDate": null,
							"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
							"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
							"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
							"zc_itemSet": {
								"results": PartItem
							},
							// "zc_claim_partsSet":{
							// "results": []
							// },
							"zc_claim_attachmentsSet": {
								"results": []
							},
							"zc_claim_item_price_dataSet": {
								"results": pricinghData
							}
						};
					}, this),
					error: function () {}
				});
				oProssingModel.read("/zc_claim_attachmentsSet", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "'"
					},
					success: $.proxy(function (odata) {
						console.log("zc_claim_attachmentsSet processing data", odata);
						// var oFilteredItem = odata.results.filter(function (item) {
						// 	return !item.FileName.startsWith("sub");

						// });
						this.getView().getModel("ClaimModel").setProperty("/" + "/items", odata.results);
						this.getModel("LocalDataModel").setProperty("/oAttachmentSet", odata.results);
						// this.getView().getModel("ClaimModel").setProperty("/" + "/items", odata.results);
					}, this)
				});
				this._fnClaimSum();

			} else {
				this.getModel("ProssingModel").refresh();
				this.getModel("LocalDataModel").setProperty("/PricingDataModel", "");
				this.getView().getModel("ClaimModel").setProperty("/" + "/items", "");
				var HeadSetData = new sap.ui.model.json.JSONModel({
					"WarrantyClaimType": "",
					"Partner": "",
					"PartnerRole": "",
					"ReferenceDate": null,
					"DateOfApplication": null,
					"Delivery": "",
					"DeliveryDate": null,
					"TCIWaybillNumber": "",
					"ShipmentReceivedDate": null,
					"DealerContact": "",
					"DeliveringCarrier": "",
					"HeadText": "",
					"text": null,
					"number": 0
				});
				HeadSetData.setDefaultBindingMode("TwoWay");
				this.getView().setModel(HeadSetData, "HeadSetData");
				this.getModel("LocalDataModel").setProperty("/PartDetailList", "");
				this.getModel("LocalDataModel").setProperty("/ClaimDetails", "");
				this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
				this.obj = {
					"DBOperation": "SAVE",
					"Message": "",
					"WarrantyClaimType": "",
					"Partner": "",
					"PartnerRole": "",
					"ReferenceDate": null,
					"DateOfApplication": null,
					"RepairDate": null,
					"Delivery": "",
					"DeliveryDate": null,
					"TCIWaybillNumber": "",
					"ShipmentReceivedDate": null,
					"DealerContact": "",
					"DeliveringCarrier": "",
					"HeadText": ""
				};
				// this.obj.DBOperation = "SAVE";
				this.obj.zc_itemSet = {};
				this.obj.zc_itemSet.results = [];
				this.obj.zc_claim_attachmentsSet = {
					"results": []
				};
				this.obj.zc_claim_item_price_dataSet = {
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
				this.getView().getModel("DateModel").setProperty("/claimTypeEn", true);
				this.getModel("LocalDataModel").setProperty("/ClaimSum", "");
				this.getDealer();
				var LOIData = new sap.ui.model.json.JSONModel({
					"claimNumber": "",
					"CarrierName": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
					"CarrierAddress": "",
					"TextAttentionLOI": "Claims Department",
					"TextStripLOI": "",
					"TopTextLOI": "Without Prejudice",
					"LOIDate": new Date(),
					"DeliveryDateLOI": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate")),
					"AtLOI": "",
					"WaybillNoLOI": this.getView().getModel("HeadSetData").getProperty("/TCIWaybillNumber"),
					"RadioException": "YES",
					"estClaimValueLOI": "",
					"LOIDescp": "",
					"RadioCCPhoneEmail": "YES",
					"DateLOI": "",
					"AtLOI02": "",
					"RepresntativeName": "",
					"RadioTR": "YES",
					"RadioCR": "YES",
					"RadioParts": "YES",
					"ursTrulyText": "",
					"PhoneLOI": "",
					"LOIExt": "",
					"LOIEmail": "",
					"ReAddress": ""
				});
				LOIData.setDefaultBindingMode("TwoWay");
				this.getView().setModel(LOIData, "LOIDataModel");
			}
			this.getView().setModel(HeadSetData, "HeadSetData");

			this.getView().byId("idPartClaimIconBar").setSelectedKey("Tab1");
			this.getView().byId("idFilter02").setProperty("enabled", true); //make it false before deploying/committing
			this.getView().byId("idFilter03").setProperty("enabled", false);
			this.getView().byId("idFilter04").setProperty("enabled", false);
			// this._getBPList();
		},

		handlePNValueHelp: function (oController) {
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
		_handleValueHelpClose: function (evt) {
			this.oSelectedItem = evt.getParameter("selectedItem");
			this.oSelectedTitle = this.oSelectedItem.getTitle();
			//this.getView().getModel("PartDataModel").setProperty("/PartDescription", this.oSelectedItem.getDescription());
			this.getModel("LocalDataModel").setProperty("/BaseUnit", this.oSelectedItem.getInfo());
			//this.getView().byId("idPartDes").setValue(this.oSelectedItem.getDescription());
			this.getView().getModel("PartDataModel").setProperty("/PartDescription", this.oSelectedItem.getDescription());
			if (this.oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(this.oSelectedItem.getTitle());
			}
			if (this.getView().getModel("multiHeaderConfig").getProperty("/PartNumberEdit") == false) {
				this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", this.oSelectedItem.getTitle());
				this.getView().getModel("HeadSetData").setProperty("/PartNumberRcDesc", this.oSelectedItem.getDescription());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		_handleLiveSearch: function (evt) {
			var sValue = evt.getParameter("value");

			if (sValue) {
				var oFilter = new Filter(
					"Material",
					sap.ui.model.FilterOperator.Contains, sValue
				);
				//console.log(oFilter);
				evt.getSource().getBinding("items").filter([oFilter]);
			} else {
				evt.getSource().getBinding("items").filter([]);
			}
		},
		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");

			if (sValue) {
				var oFilter = new Filter(
					"Material",
					sap.ui.model.FilterOperator.Contains, sValue
				);
				//console.log(oFilter);
				evt.getSource().getBinding("items").filter([oFilter]);
			} else {
				evt.getSource().getBinding("items").filter([]);
			}
		},

		onPressSavePart: function () {
			this.getView().getModel("DateModel").setProperty("/oLetterOfIntent", true);
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oTable = this.getView().byId("partTable");
			// this.obj.Message = "";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			var Qty;
			if (this.getView().getModel("PartDataModel").getProperty("/quant") == "") {
				Qty = "0.000";
			} else {
				Qty = this.getView().getModel("PartDataModel").getProperty("/quant");
			}

			// this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			// this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
			var itemObj = {
				"Type": "PART",
				"ItemType": "",
				"ControllingItemType": "MAT",
				"MaterialNumber": this.getView().getModel("PartDataModel").getProperty("/matnr"),
				"PartQty": Qty,
				"PartDescription": this.getView().getModel("PartDataModel").getProperty("/PartDescription"),
				"UnitOfMeasure": this.getModel("LocalDataModel").getProperty("/BaseUnit"),
				"LineRefnr": this.getView().getModel("PartDataModel").getProperty("/LineNo")
			};

			this.getView().getModel("PartDataModel").setProperty("/arrPartLOI", arrPartLOI);
			arrPartLOI.push(itemObj.MaterialNumber, " ", itemObj.PartDescription);

			this.obj.zc_itemSet.results.push(itemObj);
			var oClaimModel = this.getModel("ProssingModel");

			this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					var pricinghData = response.data.zc_claim_item_price_dataSet.results;
					var oFilteredData = pricinghData.filter(function (val) {
						return val.ItemType === "MAT";
					});
					console.log(oFilteredData);
					this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
					MessageToast.show("Claim has been saved successfully");
					this.getView().getModel("DateModel").setProperty("/partLine", false);
					this.getView().getModel("PartDataModel").setProperty("/matnr", "");
					this.getView().getModel("PartDataModel").setProperty("/quant", "");
					this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
					//this.getView().byId("idPartDes").setValue("");

					oTable.removeSelections("true");

					this._fnClaimSum();

				}, this),
				error: function (err) {
					console.log(err);
				}
			});

		},

		_openDialog01: function () {
			var dialog = new Dialog({
				title: "Close Letter of Intent",
				type: "Message",
				content: new Text({
					text: "All data input will be lost, are you sure you want to close this Letter Of Intent?"
				}),

				buttons: [
					new Button({
						text: "Yes",
						press: $.proxy(function () {
							dialog.close();
						}, this)
					}),
					new Button({
						text: "No",
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

		onCloseLetterOfIntent: function (oEvent) {
			this._openDialog01();
			var LOIData = new sap.ui.model.json.JSONModel({
				"claimNumber": "",
				"CarrierName": "",
				"CarrierAddress": "",
				"TextAttentionLOI": "Claims Department",
				"TextStripLOI": "",
				"TopTextLOI": "Without Prejudice",
				"LOIDate": new Date(),
				"DeliveryDateLOI": "",
				"AtLOI": "",
				"WaybillNoLOI": "",
				"RadioException": "YES",
				"estClaimValueLOI": "",
				"LOIDescp": "",
				"RadioCCPhoneEmail": "YES",
				"DateLOI": "",
				"AtLOI02": "",
				"RepresntativeName": "",
				"RadioTR": "YES",
				"RadioCR": "YES",
				"RadioParts": "YES",
				"ursTrulyText": "",
				"PhoneLOI": "",
				"LOIExt": "",
				"LOIEmail": "",
				"ReAddress": ""
			});
			LOIData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(LOIData, "LOIDataModel");
			oEvent.getSource().getParent().getParent().close();
			oEvent.getSource().getParent().getParent().destroy();

		},

		_openDialog02: function () {
			var dialog = new Dialog({
				title: "Send Letter to Intent to Carrier",
				type: "Message",
				content: new Text({
					text: "Are you sure you will like to send this letter of intent to '" + this.getView().getModel("LOIDataModel").getProperty(
						"/CarrierName") + "'?\n You will not be able to make any further changes to this letter."
				}),

				buttons: [
					new Button({
						text: "Yes",
						press: $.proxy(function () {
								callData = true;
								dialog.close();
							},
							this)
					}),
					new Button({
						text: "Cancel",
						press: function () {
							callData = false;
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
		onSendLetterOfIntent: function (oEvent) {
			callData = false;
			// this._openDialog02(callData);
			// if (callData == true) {
			this._getLOIData();
			// this._openDialog02(callData);
			// }

			var LOIData = new sap.ui.model.json.JSONModel({
				"claimNumber": "",
				"CarrierName": "",
				"CarrierAddress": "",
				"TextAttentionLOI": "Claims Department",
				"TextStripLOI": "",
				"TopTextLOI": "Without Prejudice",
				"LOIDate": new Date(),
				"DeliveryDateLOI": "",
				"AtLOI": "",
				"WaybillNoLOI": "",
				"RadioException": "YES",
				"estClaimValueLOI": "",
				"LOIDescp": "",
				"RadioCCPhoneEmail": "YES",
				"DateLOI": "",
				"AtLOI02": "",
				"RepresntativeName": "",
				"RadioTR": "YES",
				"RadioCR": "YES",
				"RadioParts": "YES",
				"ursTrulyText": "",
				"PhoneLOI": "",
				"LOIExt": "",
				"LOIEmail": "",
				"ReAddress": ""
			});
			LOIData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(LOIData, "LOIDataModel");
			oEvent.getSource().getParent().getParent().close();
			oEvent.getSource().getParent().getParent().destroy();
		},

		onRadioChangeEN: function (oEN) {
			console.log("oEN", oEN);
			oEN.getSource().getSelectedButton().getText();
			this.getView().getModel("LOIDataModel").setProperty("/RadioException", "YES");
		},
		onRadioChangeCPhone: function (oCPhone) {
			console.log("oCPhone", oCPhone);
			oCPhone.getSource().getSelectedButton().getText();
			this.getView().getModel("LOIDataModel").setProperty("/RadioCCPhoneEmail", "YES");
		},
		onRadioChangeTR: function (oTR) {
			console.log("oTR", oTR);
			oTR.getSource().getSelectedButton().getText();
			this.getView().getModel("LOIDataModel").setProperty("/RadioTR", "YES");
		},
		onRadioChangeCR: function (oCR) {
			console.log("oCR", oCR);
			oCR.getSource().getSelectedButton().getText();
			this.getView().getModel("LOIDataModel").setProperty("/RadioCR", "YES");
		},
		onRadioChangeParts: function (oRadioParts) {
			console.log("oRadioParts", oRadioParts);
			oRadioParts.getSource().getSelectedButton().getText();
			this.getView().getModel("LOIDataModel").setProperty("/RadioParts", "YES");
		},

		_getLOIData: function (obj, model) {
			var oValidator = new Validator();

			var oValid = oValidator.validate(this.getView().byId("id_LOIForm01"));
			var oValid01 = oValidator.validate(this.getView().byId("id_LOIForm02"));
			var oValid02 = oValidator.validate(this.getView().byId("id_LOIForm03"));
			if (!oValid || !oValid01 || !oValid02) {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
			}
			// else if (this._fnDateFormat(this.getView().getModel("LOIDataModel").getProperty("/DeliveryDateLOI")) != null) {
			// 	var ShipmentRCDate = this._fnDateFormat(this.getView().getModel("LOIDataModel").getProperty("/DeliveryDateLOI"));

			// } 
			else {

				jQuery.sap.require("sap.ui.core.format.DateFormat");
				this.timeFormatter = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "PThh'H'mm'M'ss'S'"
				});

				this.getView().byId("idMainClaimMessage").setProperty("visible", false);

				var oClaimModel = this.getModel("ProssingModel");

				this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});
				this.obj = {
					"Claim": this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum"),
					"Partner": this.getView().getModel("PartDataModel").getProperty("/matnr"),
					"DealershipName": "",
					"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
					"CarrierName": this.getView().getModel("LOIDataModel").getProperty("/CarrierName"),
					"CarrierAddrnumber": this.getView().getModel("LOIDataModel").getProperty("/CarrierAddress"),
					"ReferenceDate": this._fnDateFormat(this.getView().getModel("LOIDataModel").getProperty("/LOIDate")),
					"ShipmentRecDate": this._fnDateFormat(this.getView().getModel("LOIDataModel").getProperty("/DeliveryDateLOI")),
					"WaybillNumber": this.getView().getModel("LOIDataModel").getProperty("/WaybillNoLOI"),
					"ExceptionNoted": this.getView().getModel("LOIDataModel").getProperty("/RadioException"),
					"AmountClaim": this.getView().getModel("LOIDataModel").getProperty("/estClaimValueLOI"),
					"Contactbyphone": this.getView().getModel("LOIDataModel").getProperty("/RadioCCPhoneEmail"),
					"ContactbyphoneDate": this._fnDateFormat(this.getView().getModel("LOIDataModel").getProperty("/DateLOI")),
					"ContactbyphoneTime": this.timeFormatter.format(new Date(Number(this.getView().getModel("LOIDataModel").getProperty(
						"/AtLOI02")))),
					"ContactbyphoneRepName": this.getView().getModel("LOIDataModel").getProperty("/RepresntativeName"),
					"Tracerequest": this.getView().getModel("LOIDataModel").getProperty("/RadioTR"),
					"InspectionWaived": this.getView().getModel("LOIDataModel").getProperty("/RadioCR"),
					"PartwillbeHeld": this.getView().getModel("LOIDataModel").getProperty("/RadioParts"),
					"DealerRepresentativeName": this.getView().getModel("LOIDataModel").getProperty("/ursTrulyText"),
					"DealerRepresentativePhone": this.getView().getModel("LOIDataModel").getProperty("/PhoneLOI"),
					"DealerRepresentativePhoneEx": this.getView().getModel("LOIDataModel").getProperty("/LOIExt"),
					"DealerRepresentativeEmail": this.getView().getModel("LOIDataModel").getProperty("/LOIEmail"),
					"Address": this.getView().getModel("LOIDataModel").getProperty("/ReAddress")
				};
				// this._getLOIData(obj, oClaimModel);
				oClaimModel.create("/zc_LOISet", this.obj, {
					success: $.proxy(function (data, response) {
						console.log("data", data);
						console.log("response", response);
						// this.getModel("LOIDataModel").setData(response.data);
						// console.log(this.getModel("LOIDataModel").getData());
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			}
		},
		onPressLetterOfIntent: function () {
			//this.getView().getModel("PartDataModel").getProperty("/arrPartLOI")
			var LOIData = new sap.ui.model.json.JSONModel({
				"claimNumber": "",
				"CarrierName": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
				"CarrierAddress": "",
				"TextAttentionLOI": "Claims Department",
				"TextStripLOI": "",
				"TopTextLOI": "Without Prejudice",
				"LOIDate": new Date(),
				"DeliveryDateLOI": this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate"),
				"AtLOI": "",
				"WaybillNoLOI": this.getView().getModel("HeadSetData").getProperty("/TCIWaybillNumber"),
				"RadioException": "YES",
				"estClaimValueLOI": "",
				"LOIDescp": this.getView().getModel("PartDataModel").getProperty("/arrPartLOI"),
				"RadioCCPhoneEmail": "YES",
				"DateLOI": "",
				"AtLOI02": "",
				"RepresntativeName": "",
				"RadioTR": "YES",
				"RadioCR": "YES",
				"RadioParts": "YES",
				"ursTrulyText": "",
				"PhoneLOI": "",
				"LOIExt": "",
				"LOIEmail": "",
				"ReAddress": ""
			});
			LOIData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(LOIData, "LOIDataModel");
			// this.getView().setModel(this.getView().getModel("HeadSetData"), "HeadSetData");
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.letterOfIntent", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},
		onPressAddPart: function () {
			this.getView().getModel("DateModel").setProperty("/partLine", true);
			//oLetterOfIntent
		},

		onDescripancyChange: function (oDSPVal) {
			console.log("oDSPVal", oDSPVal);
			if (oDSPVal.getParameters().selectedItem.getKey() == "ST") { //Shortage
				//RetainPartOV
				var matrnr = this.getView().getModel("PartDataModel").getProperty("/matnr");
				this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberEdit", false);
				this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", matrnr);
			} else if (oDSPVal.getParameters().selectedItem.getKey() == "OV") { //Overage
				// RetainPartOV
				this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberEdit", false);
				this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", matrnr);
			} else {
				//RetainPartOV
				this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberEdit", true);
			}
		},

		onPressUpdatePart: function (oEvent) {
			var oTable = this.getView().byId("partTable");
			var oTableIndex = oTable._aSelectedPaths;

			if (oTableIndex.length == 1) {
				var oSelectedRow = oTableIndex.toString();
				var obj = this.getModel("LocalDataModel").getProperty(oSelectedRow);
				var PartNum = obj.matnr;
				var PartQt = obj.quant;

				this.getView().getModel("PartDataModel").setProperty("/matnr", PartNum);
				this.getView().getModel("PartDataModel").setProperty("/quant", PartQt);
				this.getView().getModel("PartDataModel").setProperty("/PartDescription", obj.PartDescription);
				this.getView().getModel("DateModel").setProperty("/partLine", true);

				var oIndex = oTableIndex.toString().split("/")[2];
				this.obj.zc_itemSet.results.splice(oIndex, 1);
				var oClaimModel = this.getModel("ProssingModel");
				// this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				// $.ajaxSetup({
				// 	headers: {
				// 		'X-CSRF-Token': this._oToken
				// 	}
				// });

				oClaimModel.refreshSecurityToken();

				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_dataSet.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.ItemType === "MAT";
						});
						// this.getModel("LocalDataModel").setProperty("/OFPDescription", response.OFPDescription);
						// this.getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.MainOpsCodeDescription);
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
						this._fnClaimSum();
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show("Please select 1 row.");
				oTable.removeSelections("true");
			}
		},

		onPressDeletePart: function () {
			var oTable = this.getView().byId("partTable");
			var oTableIndex = oTable._aSelectedPaths;

			if (oTableIndex.length == 1) {
				var oIndex = oTable._aSelectedPaths.toString().split("/")[2];
				this.obj.zc_itemSet.results.splice(oIndex, 1);

				var oClaimModel = this.getModel("ProssingModel");
				// this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				// $.ajaxSetup({
				// 	headers: {
				// 		'X-CSRF-Token': this._oToken
				// 	}
				// });

				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						var pricinghData = response.data.zc_claim_item_price_dataSet.results;
						var oFilteredData = pricinghData.filter(function (val) {
							return val.ItemType === "MAT";

						});
						// this.getModel("LocalDataModel").setProperty("/OFPDescription", response.OFPDescription);
						// this.getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.MainOpsCodeDescription);
						console.log(oFilteredData);
						this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
						oTable.removeSelections("true");
						MessageToast.show("Claim has been deleted successfully");
						this._fnClaimSum();
					}, this),
					error: function (err) {
						console.log(err);
					}
				});
			} else {
				MessageToast.show("Please select 1 row.");
				oTable.removeSelections("true");
			}
		},

		//To fetch Claims Account Summary
		_fnClaimSum: function (e) {
			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.read("/ZC_CLAIM_SUM(p_clmno='" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "')/Set", {
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/ClaimSum", data.results);

				}, this)
			});
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
			if (oEvent.getSource().getProperty("selectedKey") === "PDC") {
				this.getView().byId("idPdcCode").setProperty("editable", false);
				this.getView().byId("idTCIWayBill").setProperty("editable", true);

				this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", false);

				this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", true);

				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberRcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartDescriptionOrdRcv", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/RepairAmtV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 6);
				console.log(oEvent.getSource().getProperty("value") + "PDC");
				this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", false);

			} else if (oEvent.getSource().getProperty("selectedKey") === "PMS") {
				this.getView().byId("idPdcCode").setProperty("editable", false);
				this.getView().byId("idTCIWayBill").setProperty("editable", true);

				this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", false);

				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberRcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartDescriptionOrdRcv", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/RepairAmtV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 6);
				this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", false);
				//console.log(oEvent.getParameters().selectedItem.getText() + "PMS");
			} else if (oEvent.getSource().getProperty("selectedKey") === "PTS") {
				this.getView().byId("idPdcCode").setProperty("editable", false);
				this.getView().byId("idTCIWayBill").setProperty("editable", true);

				this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", true);

				// console.log(oEvent.getParameters().selectedItem.getText() + "PTS");
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberRcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartDescriptionOrdRcv", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/RepairAmtV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 6);
				this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", true);

			} else if (oEvent.getSource().getProperty("selectedKey") === "PPD") {
				console.log(oEvent.getSource().getProperty("value") + "PPD");
				this.getView().byId("idPdcCode").setProperty("editable", false);
				this.getView().byId("idTCIWayBill").setProperty("editable", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/OrderedPartDesc", false);

				this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", false);

				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 6);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberRcV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartDescriptionOrdRcv", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/RepairAmtV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcEdt", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", false);
			}

		},

		onUploadChange02Parts: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			var reader = new FileReader();

			if (oClaimNum != "" && oClaimNum != undefined && oClaimNum != "nun") {
				this.oUploadedFile = oEvent.getParameter("files")[0];
				if (FileReader.prototype.readAsBinaryString === undefined) {
					FileReader.prototype.readAsBinaryString = function (fileData) {
						var binary = "";
						var pt = this;

						reader.onload = function (e) {
							var bytes = new Uint8Array(reader.result);
							var length = bytes.byteLength;
							for (var i = 0; i < length; i++) {
								binary += String.fromCharCode(bytes[i]);
							}
							//pt.result  - readonly so assign content to another property
							pt.content = binary;
							pt.onload(); // thanks to @Denis comment
						};
						reader.readAsArrayBuffer(fileData);
					};
				}
				reader.readAsBinaryString(this.oUploadedFile);

				reader.onload = $.proxy(function (e) {
					var strCSV = e.target.result;
					if (reader.result) reader.content = reader.result;
					this.oBase = btoa(reader.content);

				}, this);

			} else {
				MessageToast.show("Please Save Claim then try Attachments");
			}
		},

		onUploadChangeParts: function (oEvent) {
			// var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			// //this.obj.Message = "";
			// this.obj.NumberOfWarrantyClaim = oClaimNum;
			// if (oClaimNum != "" && oClaimNum != undefined && oClaimNum != "nun") {
			// 	this.oUploadedFile = oEvent.getParameter("files")[0];
			// 	var reader = new FileReader();
			// 	reader.readAsBinaryString(this.oUploadedFile);

			// 	reader.onload = $.proxy(function (e) {
			// 		var strCSV = e.target.result;
			// 		if (reader.result) reader.content = reader.result;
			// 		this.oBase = btoa(reader.content);

			// 	}, this);

			// } else {
			// 	MessageToast.show("Please Save Claim then try Attachments");
			// }
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			var reader = new FileReader();

			if (oClaimNum != "" && oClaimNum != undefined && oClaimNum != "nun") {
				this.oUploadedFile = oEvent.getParameter("files")[0];
				if (FileReader.prototype.readAsBinaryString === undefined) {
					FileReader.prototype.readAsBinaryString = function (fileData) {
						var binary = "";
						var pt = this;

						reader.onload = function (e) {
							var bytes = new Uint8Array(reader.result);
							var length = bytes.byteLength;
							for (var i = 0; i < length; i++) {
								binary += String.fromCharCode(bytes[i]);
							}
							//pt.result  - readonly so assign content to another property
							pt.content = binary;
							pt.onload(); // thanks to @Denis comment
						};
						reader.readAsArrayBuffer(fileData);
					};
				}
				reader.readAsBinaryString(this.oUploadedFile);

				reader.onload = $.proxy(function (e) {
					var strCSV = e.target.result;
					if (reader.result) reader.content = reader.result;
					this.oBase = btoa(reader.content);

				}, this);

			} else {
				MessageToast.show("Please Save Claim then try Attachments");
			}
		},
		
		onSelectUpload: function (oEvent) {
			console.log(OEvent);
		},
		onUploadCompleteParts: function (oEvent) {
			// var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var fileType = this.oUploadedFile.type;
			var fileName = this.oUploadedFile.name;

			var isProxy = "";
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			var oURI = isProxy + "/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + fileName +
				"')/$value";

			if (oURI == null) {
				console.log("Error");
				//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
			}
			console.log(oURI);

			var itemObj = {
				"NumberOfWarrantyClaim": oClaimNum,
				"ContentLine": this.oBase,
				"COMP_ID": fileName,
				"Mimetype": fileType,
				"URI": oURI,
				"AttachLevel": "HEAD"
			};

			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.refreshSecurityToken();
			oClaimModel.create("/zc_claim_attachmentsSet", itemObj, {
				success: $.proxy(function (data, response) {
					MessageToast.show("SuccesFully Uploaded");
					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName eq'" + fileName + "'"
						},
						success: $.proxy(function (odata) {
							this.getView().getModel("ClaimModel").setProperty("/" + "/items", odata.results);
							this.getModel("LocalDataModel").setProperty("/oAttachmentSet", odata.results);
						}, this)
					});
				}, this),
				error: function (err) {
					console.log(err);
				}
			});
			// var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			// if (oClaimNum != "" && oClaimNum != undefined && oClaimNum != "nun") {
			// 	var fileType = this.oUploadedFile.type;
			// 	var fileName = this.oUploadedFile.name;

			// 	var isProxy = "";
			// 	if (window.document.domain == "localhost") {
			// 		isProxy = "proxy";
			// 	}
			// 	var oURI = isProxy + "/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + fileName +
			// 		"')/$value";

			// 	if (oURI == null) {
			// 		console.log("Error");
			// 		//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
			// 	}
			// 	console.log(oURI);

			// 	var itemObj = {
			// 		"NumberOfWarrantyClaim": oClaimNum,
			// 		"COMP_ID": fileName,
			// 		"ContentLine": this.oBase,
			// 		"Mimetype": fileType,
			// 		"URI": oURI,
			// 		"AttachLevel": "HEAD"
			// 	};

			// 	this.obj.zc_claim_attachmentsSet.results.push(itemObj);

			// 	var oClaimModel = this.getModel("ProssingModel");
			// 	oClaimModel.refreshSecurityToken();
			// 	var sCurrentPath = this.getCurrentFolderPath();

			// 	oClaimModel.create("/zc_headSet", this.obj, {
			// 		success: $.proxy(function (data, response) {
			// 			// this.getModel("LocalDataModel").setProperty("/OFPDescription", response.OFPDescription);
			// 			// this.getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.MainOpsCodeDescription);
			// 			MessageToast.show("SuccesFully Uploaded");
			// 			this.obj.zc_claim_attachmentsSet.results.pop();
			// 			oClaimModel.read("/zc_claim_attachmentsSet", {
			// 				urlParameters: {
			// 					"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
			// 				},
			// 				//	startswith(CompanyName, 'Alfr') eq true
			// 				success: $.proxy(function (odata) {
			// 					// var oFilteredItem = odata.results.filter(function (item) {
			// 					// 	return !item.FileName.startsWith("sub");

			// 					// });
			// 					// this.getModel("LocalDataModel").setProperty("/oAttachmentSet", );
			// 					this.getView().getModel("ClaimModel").setProperty("/" + "/items", odata.results);
			// 					// // this.getModel("LocalDataModel").setProperty("/oAttachmentSet", );
			// 					this.getView().getModel("ClaimModel").setProperty(sCurrentPath + "/items", odata.results);
			// 				}, this)
			// 			});

			// 		}, this),
			// 		error: function (err) {
			// 			console.log(err);
			// 		}
			// 	});
			// } else {
			// 	MessageToast.show("Please Save Claim then try Attachments");
			// }
		},

		getCurrentFolderPath02: function () {
			var aHistory = this.getView().getModel("AttachmentModel").getProperty("/partsHistory");
			// get the current folder path
			var sPath = aHistory.length > 0 ? aHistory[aHistory.length - 1].path : "/";
			return sPath;
		},

		onUploadComplete02Parts: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var fileType = this.oUploadedFile.type;
			var fileName = this.oUploadedFile.name;

			var isProxy = "";
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			var oURI = isProxy + "/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + fileName +
				"')/$value";

			if (oURI == null) {
				console.log("Error");
				//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
			}
			console.log(oURI);

			var itemObj = {
				"NumberOfWarrantyClaim": oClaimNum,
				"ContentLine": this.oBase,
				"COMP_ID": fileName,
				"Mimetype": fileType,
				"URI": oURI,
				"AttachLevel": "HEAD"
			};

			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.refreshSecurityToken();
			oClaimModel.create("/zc_claim_attachmentsSet", itemObj, {
				success: $.proxy(function (data, response) {
					MessageToast.show("SuccesFully Uploaded");
					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName eq'" + fileName + "'"
						},
						success: $.proxy(function (odata) {
							this.getView().getModel("ClaimModel").setProperty("/" + "/items", odata.results);
							this.getModel("LocalDataModel").setProperty("/oAttachmentSet", odata.results);
						}, this)
					});
				}, this),
				error: function (err) {
					console.log(err);
				}
			});
		},

		onFileDeleted: function (oEvent) {
			// var that = this;
			// that.deleteItemById(oEvent.getParameter("documentId"), "ClaimModel");
			// MessageToast.show("FileDeleted event triggered.");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.deleteItemById(oEvent.getParameter("documentId"), "ClaimModel");
			MessageToast.show("FileDeleted event triggered.");
			var oFileName = oEvent.getParameters().item.getFileName();
			var oClaimModel = this.getModel("ProssingModel");

			oClaimModel.refreshSecurityToken();

			oClaimModel.remove("/zc_claim_attachmentsSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + oFileName + "')", {
				method: "DELETE",
				success: $.proxy(function () {
					oClaimModel.refresh();

					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
						},
						success: $.proxy(function (oData) {
							this.getModel("LocalDataModel").setProperty("/oAttachmentSet", oData.results);
						}, this)
					});
					MessageToast.show("File has been deleted successfully");
				}, this)
			});
		},
		onFileDeleted02: function (oEvent) {
			// var that = this;
			// that.deleteItemById02(oEvent.getParameter("documentId"), "AttachmentModel");
			// MessageToast.show("FileDeleted event triggered.");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.deleteItemById(oEvent.getParameter("documentId"), "ClaimModel");
			MessageToast.show("FileDeleted event triggered.");
			var oFileName = oEvent.getParameters().item.getFileName();
			var oClaimModel = this.getModel("ProssingModel");

			oClaimModel.refreshSecurityToken();

			oClaimModel.remove("/zc_claim_attachmentsSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + oFileName + "')", {
				method: "DELETE",
				success: $.proxy(function () {
					oClaimModel.refresh();

					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
						},
						success: $.proxy(function (oData) {
							this.getModel("LocalDataModel").setProperty("/oAttachmentSet", oData.results);
						}, this)
					});
					MessageToast.show("File has been deleted successfully");
				}, this)
			});
		},
		
		uploadCollectionItemFactory: function (id, context) {
			var oItem = new sap.m.UploadCollectionItem(id, {
				documentId: "{ClaimModel>DOC_ID}",
				fileName: "{ClaimModel>FileName}",
				mimeType: "{ClaimModel>MIMETYPE}",
				thumbnailUrl: "{ClaimModel>url}",
				url: "{ClaimModel>URI}"
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

		bindUploadCollectionItems01: function (path) {
			this.oUploadCollection01.bindItems({
				path: path,
				factory: this.uploadCollectionItemFactory01.bind(this)
			});
		},

		deleteItemById02: function (sItemToDeleteId, mModel) {
			var sCurrentPath = this.getCurrentFolderPath02();
			var oData = this.getView().getModel(mModel).getProperty(sCurrentPath);
			var aItems = oData && oData.items;
			jQuery.each(aItems, function (index) {
				if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
					aItems.splice(index, 1);
				}
			});
			this.getView().getModel(mModel).setProperty(sCurrentPath + "/items", aItems);
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

		// uploadCollectionItemFactory: function (id, context) {
		// 	var oItem = new sap.m.UploadCollectionItem(id, {
		// 		// documentId: "{ClaimModel>documentId}",
		// 		// fileName: "{ClaimModel>fileName}",
		// 		// Mimetype: "{ClaimModel>Mimetype}",
		// 		// thumbnailUrl: "{ClaimModel>thumbnailUrl}",
		// 		// url: "{ClaimModel>url}"

		// 		documentId: "{ClaimModel>DOC_ID}",
		// 		fileName: "{ClaimModel>FileName}",
		// 		mimeType: "{ClaimModel>MIMETYPE}",
		// 		thumbnailUrl: "{ClaimModel>url}",
		// 		url: "{ClaimModel>URI}"
		// 	});

		// 	if (context.getProperty("type") === "folder") {
		// 		oItem.attachPress(this.onFolderPress, this);
		// 		oItem.attachDeletePress(this.onFolderDeletePress, this);
		// 		oItem.setAriaLabelForPicture("Folder");
		// 	}
		// 	return oItem;
		// },

		uploadCollectionItemFactory01: function (id, context) {
			var oItem = new sap.m.UploadCollectionItem(id, {
				documentId: "{ClaimModel>DOC_ID}",
				fileName: "{ClaimModel>FileName}",
				mimeType: "{ClaimModel>MIMETYPE}",
				thumbnailUrl: "{ClaimModel>url}",
				url: "{ClaimModel>URI}"
			});

			if (context.getProperty("type") === "folder") {
				oItem.attachPress(this.onFolderPress, this);
				oItem.attachDeletePress(this.onFolderDeletePress, this);
				oItem.setAriaLabelForPicture("Folder");
			}
			return oItem;
		},

		_fnDateFormat: function (elm) {
			if (elm != "" && elm != null) {
				var oNumTime = elm.getTime();
				var oTime = "\/Date(" + oNumTime + ")\/";
				return oTime;
			} else {
				return null;
			}
		},

		onSaveClaim: function (oEvent) {
			//idClaimForm
			var oClaimModel = this.getModel("ProssingModel");
			var oValidator = new Validator();
			var oCurrentDt = new Date();
			// var WarrantyClaimType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oValid = oValidator.validate(this.getView().byId("idClaimForm"));
			if (!oValid) {
				this.getModel("LocalDataModel").setProperty("/step01Next", false);
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				return false;
			} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == undefined && this.getView().getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
			} else if (oValid && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != undefined && this.getView().getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "") {
				if (this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") == undefined) {
					this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", "");
				}
				var obj = {
					"DBOperation": "SAVE",
					"Message": "",
					"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
					"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
					"Partner": "2400034030", //this.getModel("LocalDataModel").getProperty("/BPDealerDetails/BusinessPartnerKey")
					"PartnerRole": "AS",
					"ReferenceDate": this._fnDateFormat(oCurrentDt),
					"DateOfApplication": this._fnDateFormat(oCurrentDt),
					// "FinalProcdDate": this._fnDateFormat(new Date()),
					"Delivery": this.getView().getModel("HeadSetData").getProperty("/Delivery"),
					"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
					"TCIWaybillNumber": this.getView().getModel("HeadSetData").getProperty("/TCIWaybillNumber"),
					"ShipmentReceivedDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate")),
					"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
					"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
					"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
					"zc_itemSet": {
						"results": []
					},
					"zc_claim_attachmentsSet": {
						"results": []
					}
				};

				console.log(obj);
				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", obj, {
					success: $.proxy(function (data, response) {
						MessageToast.show("Claim has been saved successfully");
						this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
						// this.getModel("LOIDataModel").setProperty("/claimNumber", response.data.NumberOfWarrantyClaim);
						this._fnClaimSum();
						oClaimModel.read("/ZC_CLAIM_HEAD", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
									"'"
							},
							success: $.proxy(function (sdata) {
								this.getModel("LocalDataModel").setProperty("/ClaimDetails", sdata.results[0]);
								this.getView().getModel("HeadSetData").setData(sdata.results[0]);
								var oCLaim = this.getModel("LocalDataModel").getProperty("/ClaimDetails/NumberOfWarrantyClaim");
								this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", oCLaim);
							}, this),
							error: function (err) {
								console.log(err);
							}
						});

					}, this),
					error: function (err) {
						console.log(err);
					}
				});

				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
				this.getModel("LocalDataModel").setProperty("/step01Next", true);

				// var requestBody = {
				// 	WarrantyClaimType: this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
				// 	Partner: "2400034030",
				// 	PartnerRole: "aaa",
				// 	ReferenceDate: this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
				// 	DateOfApplication: this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
				// 	FinalProcdDate: this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
				// 	Delivery: this.getView().getModel("HeadSetData").getProperty("/Delivery"),
				// 	DeliveryDate: this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
				// 	DeliveringCarrier: this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
				// 	TCIWaybillNumber: this.getView().getModel("HeadSetData").getProperty("/TCIWaybillNumber"),
				// 	ShipmentReceivedDate: this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate")),
				// 	DealerContact: this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
				// 	HeadText: this.getView().getModel("HeadSetData").getProperty("/HeadText")
				// };
				// requestBody.itemSet = [{
				// 	"ItemNumber": "000001",
				// 	"ControllingItemType": "MAT",
				// 	"MaterialNumber": "110710F02003",
				// 	"WrongPart": "AAAABBBB",
				// 	"RetainPart": "N",
				// 	"RepairOrRetrunPart": "R",
				// 	"RepairAmount": "250.00",
				// 	"QuantityClaimed": "9",
				// 	"UnitOfMeasure": "EA",
				// 	"QuantityOrdered": "5",
				// 	"QuantityReceived": "3",
				// 	"QuantityOutstanding": "2",
				// 	"DiscrepancyCodes": "7A",
				// 	"DamageAreaCode": "12",
				// 	"DamageTypeCode": "30",
				// 	"DamageSeverityCodes": "4",
				// 	"ShipingPartsToPDC": "Y"
				// }];

				// oClaimModel.update("/zc_headSet", requestBody, {
				// 	success: $.proxy(function () {
				// 		console.log("success");
				// 		this.getModel("ProssingModel").refresh();

				// 	}, this),
				// 	error: function (err) {
				// 		console.log(err);
				// 	}
				// });

				//console.log(oToken);
			}

		},

		onStep01Next: function (oEvent) {
			alert("Please fill up all mandatory fields");
			// var oOutboundDNum = this.byId("idOutboundDNum").getValue();
			// var oShipmentRDate = this.byId("idShipmentRDate").getValue();
			// var oDealerContact = this.byId("idDealerContact").getValue();
			// var oCarrierName = this.byId("idCarrierName").getValue();
			var oValidator = new Validator();
			oValidator.validate(this.byId("idClaimForm"));

			if (!oValidator.isValid()) {
				//do something additional to drawing red borders? message box?
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idFilter02").setProperty("enabled", false);
				this.getView().byId("idMainClaimMessage").setType("Error");
				return;
			}
			if (oValidator.isValid()) {
				// if ($.isEmptyObject(oOutboundDNum, oShipmentRDate, oDealerContact, oCarrierName)) {
				// 	this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				// 	this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				// 	this.getView().byId("idMainClaimMessage").setType("Error");

				// } else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().byId("idMainClaimMessage").setType("None");
				this.getView().byId("idFilter02").setProperty("enabled", true);
				this.getView().byId("idPartClaimIconBar").setSelectedKey("Tab2");
			}

		},

		onStep03Next: function () {
			var validator = new Validator();
			validator.validate(this.byId("partTable"));

			if (!validator.isValid()) {
				//do something additional to drawing red borders? message box?
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idFilter03").setProperty("enabled", false);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				return;
			}
			if (validator.isValid()) {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().byId("idMainClaimMessage").setType("None");
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idPartClaimIconBar").setSelectedKey("Tab3");
			}
		},
		onRevalidate: function () {
			var that = this;
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.obj.Message = "";
			this.obj.DBOperation = "SAVE";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			oClaimModel.refreshSecurityToken();

			var dialog = new Dialog({
				title: 'Revalidate Claim',
				type: 'Message',
				content: new Text({
					text: 'Do you want to revalidate this claim? '
				}),
				beginButton: new Button({
					text: 'Yes',
					press: $.proxy(function () {
							oClaimModel.create("/zc_headSet", this.obj, {
								success: function (data, response) {
									this.getModel("LocalDataModel").setProperty("/OFPDescription", response.OFPDescription);
									this.getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.MainOpsCodeDescription);
									MessageToast.show("Claim has been Saved successfully");
								},
								error: function () {
									MessageToast.show("Claim is not Saved");
								}
							});
						}, this)
						// 	MessageToast.show('Claim Number {cliam number" was successfully submitted to TCI.');
						// 	that.getRouter().navTo("ApplicationList");
						// 	dialog.close();
						// }
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
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.obj.WarrantyClaimType = this.getView().getModel("HeadSetData").getProperty("/ClaimType");
			this.obj.Partner = this.getModel("LocalDataModel").getProperty("/BPDealerDetails/BusinessPartnerKey");
			this.obj.ActionCode = "";
			this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			this.obj.PartnerRole = "AS";
			this.obj.ReferenceDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate"));
			this.obj.DateOfApplication = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication"));
			// this.obj.FinalProcdDate = null;
			this.obj.RepairDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate"));
			// this.obj.RepairOrderNumberExternal = this.getView().getModel("HeadSetData").getProperty("/RepairOrderNumberExternal");
			// this.obj.ExternalNumberOfClaim = this.getView().getModel("HeadSetData").getProperty("/ExternalNumberOfClaim");
			// this.obj.ExternalObjectNumber = this.getView().getModel("HeadSetData").getProperty("/ExternalObjectNumber");
			// this.obj.Odometer = this.getView().getModel("HeadSetData").getProperty("/Odometer");
			this.obj.Delivery = "";
			this.obj.DeliveryDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate"));
			this.obj.TCIWaybillNumber = "";
			this.obj.ShipmentReceivedDate = null;
			this.obj.DealerContact = this.getView().getModel("HeadSetData").getProperty("/DealerContact");
			this.obj.DeliveringCarrier = this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier");
			this.obj.HeadText = this.getView().getModel("HeadSetData").getProperty("/HeadText");
			// this.obj.OFP = this.getView().getModel("HeadSetData").getProperty("/OFP");
			// this.obj.WTYClaimRecoverySource = "";
			// this.obj.MainOpsCode = this.getView().getModel("HeadSetData").getProperty("/MainOpsCode");
			// this.obj.T1WarrantyCodes = this.getView().getModel("HeadSetData").getProperty("/T1WarrantyCodes");
			// this.obj.BatteryTestCode = this.getView().getModel("HeadSetData").getProperty("/BatteryTestCode");
			// this.obj.T2WarrantyCodes = this.getView().getModel("HeadSetData").getProperty("/T2WarrantyCodes");
			// this.obj.FieldActionReference = this.getView().getModel("HeadSetData").getProperty("/FieldActionReference").toUpperCase();
			// this.obj.ZCondition = this.getView().getModel("HeadSetData").getProperty("/ZCondition");
			// this.obj.Cause = this.getView().getModel("HeadSetData").getProperty("/Cause");
			// this.obj.Remedy = this.getView().getModel("HeadSetData").getProperty("/Remedy");
			// this.obj.PreviousROInvoiceDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoiceDate"));
			// this.obj.PreviousROOdometer = this.getView().getModel("HeadSetData").getProperty("/PreviousROOdometer");
			// this.obj.PreviousROInvoice = this.getView().getModel("HeadSetData").getProperty("/PreviousROInvoice");
			// this.obj.AccessoryInstallOdometer = this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallOdometer");
			// this.obj.AccessoryInstallDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/AccessoryInstallDate"));
			this.obj.Message = "";
			this.obj.DBOperation = "SUB";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			var oObj = {
				"NumberOfWarrantyClaim": oClaimNum,
				"POSNR": "",
				"NUMBER": "",
				"TYPE": "",
				"MESSAGE": ""
			};

			// this.obj.zc_claim_vsrSet.results.push(oObj);
			this.obj.zc_claim_partsSet.results.push(oObj);

			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			// if (ogetKey > 1 && ogetKey <= 8) {
			// 	var oSelectedNum = ogetKey - 1;
			// 	this.getView().byId("idIconTabMainClaim").setSelectedKey("Tab" + oSelectedNum + "");
			// } else {
			// 	this.getRouter().navTo("SearchClaim");
			// }

			//var that = this;
			var dialog = new Dialog({
				title: "Submit Claim to TCI",
				type: "Message",
				content: new Text({
					text: "Are you sure, you will like to submit this Claim to TCI?"
				}),

				buttons: [
					new Button({
						text: "Yes",
						press: $.proxy(function () {
							// this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
							// $.ajaxSetup({
							// 	headers: {
							// 		'X-CSRF-Token': this._oToken
							// 	}
							// });
							oClaimModel.refreshSecurityToken();
							oClaimModel.create("/zc_headSet", this.obj, {
								success: $.proxy(function (data, response) {
									// this.getModel("LocalDataModel").setProperty("/OFPDescription", response.OFPDescription);
									// this.getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.MainOpsCodeDescription);
									// var oErrorSet = response.data.zc_claim_partsSet.results;
									this.getModel("LocalDataModel").setProperty("/oErrorSet", response.data.zc_claim_partsSet.results);
									this.obj.zc_claim_partsSet.results.pop(oObj);
									if (response.data.zc_claim_partsSet.results.length <= 0) {
										this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
										MessageToast.show("Claim Number " + oClaimNum + " successfully submitted to TCI.");
									} else {
										MessageToast.show(
											"Claim Number " + oClaimNum + " was Rejected by TCI, please see Validation Results for more details.");
									}

									dialog.close();
								}, this),
								error: function (err) {

								}
							});

						}, this)
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
			// 	var that = this;
			// 	var dialog = new Dialog({
			// 		title: 'Submit Claim to TCI',
			// 		type: 'Message',
			// 		content: new Text({
			// 			text: 'Are you sure, you will like to submit this claim to TCI? '
			// 		}),
			// 		beginButton: new Button({
			// 			text: 'Yes',
			// 			press: function () {
			// 				MessageToast.show('Claim Number {cliam number" was successfully submitted to TCI.');
			// 				that.getRouter().navTo("SearchClaim");
			// 				dialog.close();
			// 			}
			// 		}),
			// 		endButton: new Button({
			// 			text: 'Cancel',
			// 			press: function () {
			// 				dialog.close();
			// 			}
			// 		}),
			// 		afterClose: function () {
			// 			dialog.destroy();
			// 		}
			// 	});

			// 	dialog.open();
		},

		onPressBack: function (oEvent) {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var that = this;
			var oValidator = new Validator();
			oValidator.validate(this.byId("idClaimForm"));
			var dialog = new Dialog({
				title: that.oBundle.getText("SaveChanges"),
				type: "Message",
				content: new Text({
					text: that.oBundle.getText("WillYouLikeSaveChanges")
				}),

				buttons: [
					new Button({
						text: that.oBundle.getText("Yes"),
						press: $.proxy(function () {
							// that.oECPData = that.getView().getModel("EcpFieldData").getData();
							// var objSave = that._fnObject("SAVE", "PENDING");
							// var oEcpModel = that.getModel("EcpSalesModel");

							if (!oValidator.isValid()) {

								//do something additional to drawing red borders? message box?
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
								this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
								this.getView().byId("idMainClaimMessage").setType("Error");
								return;
							} else {
								//var oCurrentDt = new Date();
								// var obj = {
								// 	WarrantyClaimType: this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
								// 	Partner: "",
								// 	PartnerRole: "",
								// 	ReferenceDate: oCurrentDt,
								// 	DateOfApplication: oCurrentDt,
								// 	FinalProcdDate: oCurrentDt,
								// 	DeliveringCarrier: this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
								// 	NameOfPersonRespWhoChangedObj: this.getView().getModel("HeadSetData").getProperty("/NameOfPersonRespWhoChangedObj"),
								// 	ClaimAge: this.getView().getModel("HeadSetData").getProperty("/ClaimAge"),
								// 	Delivery: this.getView().getModel("HeadSetData").getProperty("/Delivery"),
								// 	DeliveryDate: this.getView().getModel("HeadSetData").getProperty("/DeliveryDate"),
								// 	TCIWaybillNumber: this.getView().getModel("HeadSetData").getProperty("/TCIWaybillNumber"),
								// 	ShipmentReceivedDate: this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate"),
								// 	DealerContact: this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
								// 	HeadText: this.getView().getModel("HeadSetData").getProperty("/HeadText")
								// };

								// var oClaimModel = this.getModel("ProssingModel");
								// oClaimModel.create("/zc_headSet", obj, {

								// 	success: $.proxy(function () {
								// 		console.log("success");

								// 	}, this),
								// 	error: function (err) {
								// 		console.log(err);
								// 	}
								// });
							}

							dialog.close();
						}, this)
					}),

					new Button({
						text: that.oBundle.getText("No"),
						press: function () {

							that.getRouter().navTo("SearchClaim");
							dialog.close();
						}
					}),
					new Button({
						text: that.oBundle.getText("Cancel"),
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

			this.ogetSelectedKey = this.getView().byId("idPartClaimIconBar").getSelectedKey();
			var ogetKey = this.ogetSelectedKey.split("Tab")[1];

			if (ogetKey > 1 && ogetKey <= 8) {
				var oSelectedNum = ogetKey - 1;
				this.getView().byId("idPartClaimIconBar").setSelectedKey("Tab" + oSelectedNum + "");
			} else {
				this.getRouter().navTo("SearchClaim");
			}

		},
		onCancelClaim: function (oEvent) {
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var dialog = new Dialog({
					title: oBundle.getText("CancelClaim"),
					type: "Message",
					content: new Text({
						text: oBundle.getText("AreYouSureYouLikeToCancel")
					}),

					buttons: [
						new Button({
							text: oBundle.getText("Yes"),
							press: $.proxy(function () {
								this.getRouter().navTo("SearchClaim");

								dialog.close();
							}, this)
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