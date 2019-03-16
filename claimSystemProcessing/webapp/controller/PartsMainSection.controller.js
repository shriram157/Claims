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
	'sap/m/MessageBox'
], function (Button, Dialog, Label, MessageToast, Text, BaseController, base64, ValueState, Validator, Filter, MessageBox) {
	"use strict";
	var callData, arrPartLOI = [],
		BpDealerModel, BpDealerList = [],
		oFilteredDealerData, dialogValidator;
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
				oLetterOfIntent: false,
				saveParts: false,
				partTypeState: "None"
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
				multiheader5: 6,
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
				AttachmentCol: false,
				PartNumberEdit: true,
				flagIncorrectPart: false
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
				"quant2": "",
				"PartDescription": "",
				"LineNo": "",
				"QuantityReceived": "",
				"RetainPart": "",
				"DiscreCode": "",
				"LineRefnr": "",
				"ItemKey": "",
				"WrongPart": "",
				"ALMDiscreDesc": ""
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

						var pricingData = data.results;
						var oFilteredData = pricingData.filter(function (val) {
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
								LineRefnr: item.LineRefnr,
								ItemKey: item.ItemKey,
								RetainPart: item.RetainPart,
								QuantityOrdered: item.QuantityOrdered,
								QuantityReceived: item.QuantityReceived,
								DiscreCode: item.DiscreCode,
								ALMDiscreDesc: item.ALMDiscreDesc,
								WrongPart: item.WrongPart
							};

						});
						this.this.this.obj = {
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
							"zc_claim_vsrSet": {
								"results": []
							},
							"zc_claim_attachmentsSet": {
								"results": []
							},
							"zc_claim_item_price_dataSet": {
								"results": pricingData
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
				var DropDownModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(DropDownModel, "DropDownModel");
				this.getView().getModel("DropDownModel").setProperty("/" + "/items", "");
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
				this.obj = {
					"DBOperation": "SAVE",
					"Message": "",
					"NumberOfWarrantyClaim": "",
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
					"HeadText": ""
				};

				// this.obj.DBOperation = "SAVE";
				this.obj.zc_itemSet = {};
				this.obj.zc_itemSet.results = [];
				this.obj.zc_claim_vsrSet = {
					"results": []
				};
				this.obj.zc_claim_attachmentsSet = {
					"results": []
				};
				this.obj.zc_claim_item_price_dataSet = {
					"results": [{
						"Meins": "",
						"Meinh": "",
						"UnitOfMeasure": "",
						"URI": "",
						"ItemDescriptions": "",
						"NumberOfWarrantyClaim": "",
						"PartDescription": "",
						"SubletDescription": "",
						"LabourDescription": "",
						"DealerClaimedHoursTotal": "0.00",
						"AmountClaimedTotal": "0.00",
						"PartTotal": "0.00",
						"PartQtyTotal": "0.000",
						"SubletTotal": "0.00",
						"SubletQtyTotal": "0.000",
						"PaintTotal": "0.00",
						"PaintQtyTotal": "0.000",
						"LabourTotal": "0.00",
						"LabourtQtyTotal": "0.000",
						"GrandSubletTotal": "0.00",
						"GrandPaintTotal": "0.00",
						"GrandLabourTotal": "0.00",
						"GrandPartTotal": "0.00",
						"ExtendedTotal": "0.00",
						"MarkupTotal": "0.00",
						"DiscountTotal": "0.00",
						"TCIApprovedAmtTotal": "0.00",
						"DifferenceTotal": "0.00",
						"GrandTotalAfterDiscount": "0.00",
						"TotalDealerNet": "0.00",
						"Type": "",
						"SubletType": "",
						"InvoiceNo": "",
						"Amount": "0.000",
						"LabourNumber": "",
						"OperationNo": "",
						"HoursApprovedByTCI": "0.000",
						"TCIApprovedAmount": "0.00",
						"LabourDifference": "0.00",
						"PaintPositionCode": "",
						"ItemKey": "",
						"PartQty": "0.000",
						"AmtClaimed": "0.000",
						"clmno": "",
						"DealerNet": "0.000",
						"DiffAmt": "0.000",
						"ExtendedValue": "0.000",
						"ItemType": "MAT",
						"kappl": "",
						"kateg": "",
						"kawrt": "0.000000000",
						"kbetr": "0.000000000",
						"knumv": "",
						"kposn": "",
						"kschl": "",
						"kvsl1": "",
						"kwert": "0.000",
						"MarkUp": "0.000",
						"matnr": "",
						"posnr": "000001",
						"QtyHrs": "0.000",
						"quant": "0.000",
						"TCIApprAmt": "0.000",
						"TCIApprQty": "0.000",
						"TotalAfterDisct": "0.000",
						"v_rejcd": "",
						"valic": "0.000",
						"valoc": "0.000",
						"verknumv": "",
						"versn": "",
						"ALMDiscreCode": "",
						"ALMDiscreDesc": "",
						"DiscreCode": "",
						"DiscreDesc": "",
						"QuantityOrdered": "0.000",
						"QuantityReceived": "0.000",
						"WrongPart": "",
						"PartRepaired": "",
						"RetainPart": "",
						"RepairAmt": "0.000"
					}]
				};
				this.getView().getModel("DateModel").setProperty("/claimTypeEn", true);
				this.getModel("LocalDataModel").setProperty("/ClaimSum", "");
				this.getDealer();

				var LOIData = new sap.ui.model.json.JSONModel({
					"claimNumber": "",
					"CarrierName": "",
					"CarrierAddress": "",
					"TextAttentionLOI": "Claims Department",
					"TextStripLOI": "",
					"TopTextLOI": "Without Prejudice",
					"LOIDate": new Date(),
					"DeliveryDateLOI": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate")),
					"AtLOI": "",
					"WaybillNoLOI": this.getView().getModel("HeadSetData").getProperty("/TCIWaybillNumber"),
					"RadioException": "Damage",
					"estClaimValueLOI": "",
					"LOIDescp": "",
					"RadioCCPhoneEmail": "Y",
					"DateLOI": "",
					"AtLOI02": "",
					"RepresntativeName": "",
					"RadioTR": "Y",
					"RadioCR": "Y",
					"RadioParts": "H",
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
			// this.getView().getModel("HeadSetData").setProperty("/PartNumberRcDesc", this.oSelectedItem.getDescription());
			if (this.oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(this.oSelectedItem.getTitle());
			}
			if (this.getView().getModel("multiHeaderConfig").getProperty("/PartNumberEdit") == false) {
				this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", this.oSelectedItem.getTitle());
				this.getView().getModel("HeadSetData").setProperty("/PartNumberRcDesc", this.oSelectedItem.getDescription());
			} else {
				// this.getView().getModel("HeadSetData").setProperty("/PartNumberRcDesc", this.oSelectedItem.getDescription());
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
			this.claimType = this.obj.WarrantyClaimType;
			this.lineRefNumber = this.getView().getModel("PartDataModel").getProperty("/LineNo");
			var Qty;
			if (this.getView().getModel("PartDataModel").getProperty("/quant") == "") {
				Qty = "0.000";
			} else {
				Qty = this.getView().getModel("PartDataModel").getProperty("/quant");
			}
			var retainval;
			if (this.getView().getModel("PartDataModel").getProperty("/RetainPart") == "Yes") {
				retainval = "Y";
			} else {
				retainval = "N";
			}
			if (this.claimType.length == 2) {
				this.claimType = "ZP" + this.claimType;
			}
			console.log("item level claimType", this.claimType);
			if (this.claimType != "ZPPD") {
				if (this.getModel("LocalDataModel").getProperty("/oAttachmentSet") != undefined && this.getModel("LocalDataModel").getProperty(
						"/oAttachmentSet") != "") {

					var itemObj = {
						"Type": "PART",
						"ItemType": "MAT",
						"ControllingItemType": "MAT",
						"MaterialNumber": this.getView().getModel("PartDataModel").getProperty("/matnr"),
						"PartQty": Qty,
						"PartDescription": this.getView().getModel("PartDataModel").getProperty("/PartDescription"),
						"UnitOfMeasure": this.getModel("LocalDataModel").getProperty("/BaseUnit"),
						"LineRefnr": this.getView().getModel("PartDataModel").getProperty("/LineNo"),
						"ItemKey": this.getView().getModel("PartDataModel").getProperty("/matnr"),
						"RetainPart": retainval,
						"QuantityOrdered": this.getView().getModel("PartDataModel").getProperty("/quant"),
						"QuantityReceived": this.getView().getModel("PartDataModel").getProperty("/QuantityReceived"),
						"DiscreCode": this.getView().getModel("PartDataModel").getProperty("/DiscreCode"),
						"WrongPart": this.getView().getModel("HeadSetData").getProperty("/PartNumberRc"),
						"ALMDiscreDesc": this.getView().getModel("PartDataModel").getProperty("/ALMDiscreDesc")
							// ,
							// "URI": this.getModel("LocalDataModel").getProperty("/oAttachmentSet/0/URI"),
					};
					console.log("Newly added part obj", itemObj);
					this.getView().getModel("PartDataModel").setProperty("/arrPartLOI", arrPartLOI);
					arrPartLOI.push(itemObj.MaterialNumber, " ", itemObj.PartDescription);
					// this.obj = {
					// 	"DBOperation": "SAVE",
					// 	"Message": "",
					// 	"WarrantyClaimType": this.claimType,
					// 	"Partner": this.getModel("LocalDataModel").getProperty("/BPDealerDetails/BusinessPartnerKey"),
					// 	"ActionCode": "",
					// 	"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
					// 	"PartnerRole": "AS",
					// 	"ReferenceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate")),
					// 	"DateOfApplication": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication")),
					// 	"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
					// 	"Delivery": "",
					// 	"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
					// 	"TCIWaybillNumber": "",
					// 	"ShipmentReceivedDate": null,
					// 	"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
					// 	"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
					// 	"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
					// 	"zc_itemSet": {
					// 		"results": []
					// 	},
					// 	"zc_claim_attachmentsSet": {
					// 		"results": []
					// 	},
					// 	"zc_claim_item_price_dataSet": {
					// 		"results": []
					// 	}
					// };

					this.obj.zc_itemSet.results.push(itemObj);
					// this.obj.zc_itemSet.results[0].ItemKey;
					var oClaimModel = this.getModel("ProssingModel");

					this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
					$.ajaxSetup({
						headers: {
							'X-CSRF-Token': this._oToken
						}
					});

					var that = this;
					oClaimModel.create("/zc_headSet", this.obj, {
						success: $.proxy(function (data, response) {
							oClaimModel.read("/zc_claim_item_price_dataSet", {
								urlParameters: {
									"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
										"'and LanguageKey eq 'E'"
								},
								success: $.proxy(function (pricedata) {
									console.log("pricedata", pricedata);
									var pricingData = pricedata.results;
									var oFilteredData = pricingData.filter(function (val) {
										return val.ItemType === "MAT"
									});

									var DiscreCode = oFilteredData[0].DiscreCode;
									console.log("claim type", that.claimType);
									console.log("DiscreCode", DiscreCode);
									this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
									MessageToast.show("Claim has been saved successfully");
									this.getView().getModel("DateModel").setProperty("/partLine", false);
									this.getView().getModel("PartDataModel").setProperty("/LineNo", "");
									this.getView().getModel("PartDataModel").setProperty("/matnr", "");
									this.getView().getModel("PartDataModel").setProperty("/quant", "");
									this.getView().getModel("PartDataModel").setProperty("/quant2", "");
									this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
									this.getView().getModel("PartDataModel").setProperty("/DiscreCode", "");
									this.getView().getModel("PartDataModel").setProperty("/RetainPart", "");
									this.getView().getModel("PartDataModel").setProperty("/QuantityReceived", "");
									this.getModel("LocalDataModel").setProperty("/oAttachmentSet", "");
									this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", "");
									this.getView().getModel("PartDataModel").setProperty("/PartNumberRcDesc", "");
									oTable.removeSelections("true");
									this._fnClaimSum();

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
				} else {
					MessageToast.show("Attachment is required.");
				}
			} else {
				itemObj = {
					"Type": "PART",
					"ItemType": "MAT",
					"ControllingItemType": "MAT",
					"MaterialNumber": this.getView().getModel("PartDataModel").getProperty("/matnr"),
					"PartQty": Qty,
					"PartDescription": this.getView().getModel("PartDataModel").getProperty("/PartDescription"),
					"UnitOfMeasure": this.getModel("LocalDataModel").getProperty("/BaseUnit"),
					"LineRefnr": this.getView().getModel("PartDataModel").getProperty("/LineNo"),
					"ItemKey": this.getView().getModel("PartDataModel").getProperty("/matnr"),
					"RetainPart": retainval,
					"QuantityOrdered": this.getView().getModel("PartDataModel").getProperty("/quant"),
					"QuantityReceived": this.getView().getModel("PartDataModel").getProperty("/QuantityReceived"),
					"DiscreCode": this.getView().getModel("PartDataModel").getProperty("/DiscreCode"),
					"WrongPart": this.getView().getModel("HeadSetData").getProperty("/PartNumberRc"),
					"ALMDiscreDesc": this.getView().getModel("PartDataModel").getProperty("/ALMDiscreDesc")
						// ,
						// "URI": this.getModel("LocalDataModel").getProperty("/oAttachmentSet/0/URI"),
				};
				console.log("Newly added part obj", itemObj);
				this.getView().getModel("PartDataModel").setProperty("/arrPartLOI", arrPartLOI);
				arrPartLOI.push(itemObj.MaterialNumber, " ", itemObj.PartDescription);
				// this.obj = {
				// 	"DBOperation": "SAVE",
				// 	"Message": "",
				// 	"WarrantyClaimType": this.claimType,
				// 	"Partner": this.getModel("LocalDataModel").getProperty("/BPDealerDetails/BusinessPartnerKey"),
				// 	"ActionCode": "",
				// 	"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
				// 	"PartnerRole": "AS",
				// 	"ReferenceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate")),
				// 	"DateOfApplication": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication")),
				// 	"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
				// 	"Delivery": "",
				// 	"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
				// 	"TCIWaybillNumber": "",
				// 	"ShipmentReceivedDate": null,
				// 	"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
				// 	"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
				// 	"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
				// 	"zc_itemSet": {
				// 		"results": []
				// 	},
				// 	"zc_claim_attachmentsSet": {
				// 		"results": []
				// 	},
				// 	"zc_claim_item_price_dataSet": {
				// 		"results": []
				// 	}
				// };

				this.obj.zc_itemSet.results.push(itemObj);
				var arr = this.obj.zc_itemSet.results;

				function checkDuplicateLineItem(LineRefnr, arr) {
					var isDuplicate = false;
					testObj = {};
					arr.map(function (item) {
						var itemLineRefnr = item[LineRefnr];
						if (itemLineRefnr in testObj) {
							testObj[itemLineRefnr].duplicate = true;
							item.duplicate = true;
							isDuplicate = true;
							console.log("found duplicate");
						} else {
							// isDuplicate =false;
							testObj[itemLineRefnr] = item;
							delete item.duplicate;
						}
					});
					return isDuplicate;
				}

				console.log("updated zc_itemSet", this.obj.zc_itemSet.results);

				var oClaimModel = this.getModel("ProssingModel");

				this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
				$.ajaxSetup({
					headers: {
						'X-CSRF-Token': this._oToken
					}
				});

				var that = this;
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
							that.headerResponseData = data;
							console.log("HeaderData", that.headerResponseData);
							oClaimModel.read("/zc_claim_item_price_dataSet", {
								urlParameters: {
									"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
										"'and LanguageKey eq 'E'"
								},
								success: $.proxy(function (pricedata) {
										var temp = [];
										console.log("pricedata", pricedata);
										var pricingData = pricedata.results;
										var filteredPriceData = pricingData.filter(function (val) {
											return val.ItemType === "MAT";
										});

										if (this.getView().getModel("multiHeaderConfig").getProperty("/flagIncorrectPart") == true) {

											var IncorrectPartData = pricingData.filter(function (val) {
												return val.LineRefnr === that.lineRefNumber;
											});
										}

										if (IncorrectPartData != undefined && IncorrectPartData.length>1) {
											// var IncorrectLineRef = IncorrectPartData.reduce(function (obj, hash) {
											// 	obj[hash.LineRefnr] = true;
											// 	return obj;
											// }, {});
											var IncorrectLineRef = IncorrectPartData.map(function (item) {
												return item.LineRefnr;
											});
											for (var i = 0; i < filteredPriceData.length; i++) {
												console.log(filteredPriceData[i].LineRefnr);
												console.log(IncorrectLineRef[0]);
												if (filteredPriceData[i].LineRefnr === IncorrectLineRef[0]) {
													filteredPriceData.splice(filteredPriceData[i], 2);
												}
											}

											/*$.each(oData.d.results, function (i, item) {
											});*/
											// filteredPriceData.forEach((e1) => IncorrectPartData.forEach((e2) => {
											// 	if (e1.LineRefnr === e2.LineRefnr) {
											// 		filteredPriceData.splice(e1, 1);
											// 	}
											// }));
										}
										var oFilteredData = filteredPriceData;
										console.log("filteredPriceData", oFilteredData);

										if (this.getView().getModel("multiHeaderConfig").getProperty("/flagIncorrectPart") == true && IncorrectPartData.length>1) {

											console.log("Updated filteredPriceData", oFilteredData);
											// for (var m = 0; m < IncorrectPartData.length; m++) {
											IncorrectPartData[0].matnr = [
												"Ordered: " + IncorrectPartData[0].matnr,
												"Received: " + IncorrectPartData[1].WrongPart
											].join("\n");
											IncorrectPartData[0].PartDescription = [
												"Ordered: " + IncorrectPartData[0].PartDescription,
												"Received: " + IncorrectPartData[1].PartDescription
											].join("\n");
											IncorrectPartData[0].DealerNet = [
												"Ordered: " + IncorrectPartData[0].DealerNet,
												"Received: " + IncorrectPartData[1].DealerNet
											].join("\n");
											IncorrectPartData[0].quant2 = [
												"Ordered: " + IncorrectPartData[0].QuantityOrdered,
												"Received: " + IncorrectPartData[1].QuantityReceived
											].join("\n");
											IncorrectPartData[0].AmtClaimed = [
												"Ordered: " + IncorrectPartData[0].AmtClaimed,
												"Received: " + IncorrectPartData[1].AmtClaimed
											].join("\n");
											IncorrectPartData[0].TCIApprovedAmount = [
												"Ordered: " + IncorrectPartData[0].TCIApprAmt,
												"Received: " + IncorrectPartData[1].TCIApprAmt
											].join("\n");
											IncorrectPartData[0].DiffAmt = [
												"Ordered: " + IncorrectPartData[0].DiffAmt,
												"Received: " + IncorrectPartData[1].DiffAmt
											].join("\n");
											// }

											// for (var m = 0; m < oFilteredData.length; m++) {
											// 	if(oFilteredData[m].DiscreCode == "4A"){
											// 		oFilteredData.slice(oFilteredData[m], 1);
											// 	}
											// }
											oFilteredData.push(IncorrectPartData[0]);
											console.log("incorrect data updated", oFilteredData);
										} else {
											console.log("oFilteredData ZPPD", oFilteredData);
											for (var m = 0; m < oFilteredData.length; m++) {
												oFilteredData[m].matnr = [
													"Ordered: " + oFilteredData[m].matnr,
													"Received: " + oFilteredData[m].matnr
												].join("\n");
												oFilteredData[m].PartDescription = [
													"Ordered: " + oFilteredData[m].PartDescription,
													"Received: " + oFilteredData[m].PartDescription
												].join("\n");
												oFilteredData[m].DealerNet = oFilteredData[m].DealerNet;

												oFilteredData[m].quant2 = [
													"Ordered: " + oFilteredData[m].QuantityOrdered,
													"Received: " + oFilteredData[m].QuantityReceived
												].join("\n");
												oFilteredData[m].AmtClaimed = oFilteredData[m].AmtClaimed;
												oFilteredData[m].TCIApprovedAmount = oFilteredData[m].TCIApprAmt;
												oFilteredData[m].DiffAmt = oFilteredData[m].DiffAmt;
											}
											// this.getView().getModel("multiHeaderConfig").setProperty("/flagIncorrectPart", false);
											console.log("correct data updated", oFilteredData);
										}

										for (var m = 0; m < oFilteredData.length; m++) {
											oFilteredData[m].ALMDiscreDesc = oFilteredData[m].ALMDiscreDesc.split("-")[1];
										}
										this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
										console.log("Part Items stored",
											this.getModel("LocalDataModel").getData());
										// this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
										MessageToast.show("Part Items has been saved successfully");

										this.getView().getModel("PartDataModel").setProperty("/LineNo", "");
										this.getView().getModel("DateModel").setProperty("/partLine", false);
										this.getView().getModel("PartDataModel").setProperty("/matnr", "");
										this.getView().getModel("PartDataModel").setProperty("/quant", "");
										this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
										this.getView().getModel("PartDataModel").setProperty("/DiscreCode", "");
										this.getView().getModel("PartDataModel").setProperty("/RetainPart", "");
										this.getView().getModel("PartDataModel").setProperty("/QuantityReceived", "");
										this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", "");
										this.getView().getModel("HeadSetData").setProperty("/PartNumberRcDesc", "");
										this.getView().getModel("multiHeaderConfig").setProperty("/flagIncorrectPart", false);
										oTable.removeSelections("true");
										this._fnClaimSum();
									},
									this),
								error: function (err) {
									console.log(err);
								}
							});
						},
						this),
					error: function (err) {
						console.log(err);
					}
				});
			}
		},

		onClickURIParts: function (oEvent) {
			console.log(oEvent);
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

		//

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
				"RadioException": "Damage",
				"estClaimValueLOI": "",
				"LOIDescp": "",
				"RadioCCPhoneEmail": "Y",
				"DateLOI": "",
				"AtLOI02": "",
				"RepresntativeName": "",
				"RadioTR": "Y",
				"RadioCR": "Y",
				"RadioParts": "H",
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
			var _that = this;
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
								console.log("Validations Completed");
								jQuery.sap.require("sap.ui.core.format.DateFormat");
								_that.timeFormatter = sap.ui.core.format.DateFormat.getDateInstance({
									pattern: "PThh'H'mm'M'ss'S'"
								});

								_that.getView().byId("idMainClaimMessage").setProperty("visible", false);

								var oClaimModel = this.getModel("ProssingModel");

								_that._oToken = oClaimModel.getHeaders()['x-csrf-token'];
								$.ajaxSetup({
									headers: {
										'X-CSRF-Token': this._oToken
									}
								});
								var obj = {
									"Claim": this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum"),
									"Partner": this.getView().getModel("PartDataModel").getProperty("/matnr"),
									"DealershipName": "",
									"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
									"CarrierName": this.getView().getModel("LOIDataModel").getProperty("/CarrierName"),
									"CarrierAddrnumber": "",
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
									// "Address": this.getView().getModel("LOIDataModel").getProperty("/ReAddress"),
									"Address1": this.getView().getModel("LOIDataModel").getProperty("/Address1"),
									"Address2": this.getView().getModel("LOIDataModel").getProperty("/Address2"),
									"Address3": this.getView().getModel("LOIDataModel").getProperty("/Address3"),
									"Address4": this.getView().getModel("LOIDataModel").getProperty("/Address4")
								};
								oClaimModel.create("/zc_LOISet", obj, {
									success: $.proxy(function (data, response) {
										console.log("LOI set data", data);
										console.log("response", response);
										MessageToast.show("Letter of Intent sent successfully");
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
											"RadioException": "Damage",
											"estClaimValueLOI": "",
											"LOIDescp": "",
											"RadioCCPhoneEmail": "Y",
											"DateLOI": "",
											"AtLOI02": "",
											"RepresntativeName": "",
											"RadioTR": "Y",
											"RadioCR": "Y",
											"RadioParts": "H",
											"ursTrulyText": "",
											"PhoneLOI": "",
											"LOIExt": "",
											"LOIEmail": "",
											"ReAddress": ""
										});
										LOIData.setDefaultBindingMode("TwoWay");
										_that.getView().setModel(LOIData, "LOIDataModel");
									}, _that),
									error: function (err) {
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
											"RadioException": "Damage",
											"estClaimValueLOI": "",
											"LOIDescp": "",
											"RadioCCPhoneEmail": "Y",
											"DateLOI": "",
											"AtLOI02": "",
											"RepresntativeName": "",
											"RadioTR": "Y",
											"RadioCR": "Y",
											"RadioParts": "H",
											"ursTrulyText": "",
											"PhoneLOI": "",
											"LOIExt": "",
											"LOIEmail": "",
											"ReAddress": ""
										});
										LOIData.setDefaultBindingMode("TwoWay");
										_that.getView().setModel(LOIData, "LOIDataModel");
										console.log(err);
										var errMsg = (JSON.parse(err.responseText)).error.message.value;
										// MessageBox.error(errMsg);
										MessageBox.show(errMsg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);

									}
								});
								dialog.close();
								// }
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
			// dialogValidator = new Validator();

			// var AddressLOI = this.getView().byId("AddressLOI").getValue();
			// var idDDLOI = this.getView().byId("idDDLOI").getValue();
			// var estClaimValueLOI = this.getView().byId("estClaimValueLOI").getValue();

			// var idDateLOI02 = this.getView().byId("idDateLOI02").getValue();

			// var RadioTR = this.getView().byId("RadioTR").getSelectedIndex();
			// var RadioCR = this.getView().byId("RadioCR").getSelectedIndex();
			// var RadioParts = this.getView().byId("RadioParts").getSelectedIndex();
			// var RadioException = this.getView().byId("IDRadioException").getSelectedIndex();
			// var RadioCCPhoneEmail = this.getView().byId("RadioCCPhoneEmail").getSelectedIndex();

			// var oValid01 = dialogValidator.validate(this.getView().byId("id_LOIForm02"));
			// var oValid02 = dialogValidator.validate(this.getView().byId("id_LOIForm03"));
			console.log("Start Validations");
			// if (!oValid && !oValid01 && !oValid02) {

			if (this.getView().getModel("LOIDataModel").getProperty("/Address1") == "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				var valid1 = true;
			}

			if (this.getView().getModel("LOIDataModel").getProperty("/DeliveryDateLOI") === null && this.getView().getModel("LOIDataModel").getProperty(
					"/DeliveryDateLOI") == "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				var valid2 = true;
			}

			if (this.getView().getModel("LOIDataModel").getProperty("/ursTrulyText") == "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				var valid3 = true;
			}

			if (this.getView().getModel("LOIDataModel").getProperty("/estClaimValueLOI") == "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				var valid4 = true;
				// this._openDialog02();
			}
			if (this.getView().getModel("LOIDataModel").getProperty("/LOIEmail") == "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				var valid5 = true;
				// this._openDialog02();
			}

			if (this.getView().getModel("LOIDataModel").getProperty("/DateLOI") == "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				var valid6 = true;
				// this._openDialog02();
			}

			// if (this.getView().getModel("LOIDataModel").getProperty("/RadioParts") == "") {
			// 	this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			// 	this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
			// 	this.getView().byId("idMainClaimMessage").setType("Error");
			// 	this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			// } else {
			// 	this.getView().byId("idMainClaimMessage").setProperty("visible", false);
			// 	this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
			// 	var valid6 = true;
			// 	// this._openDialog02();
			// }

			if (valid1 == true && valid2 == true && valid3 == true && valid4 == true && valid5 == true && valid6 == true) {
				this._openDialog02();
				oEvent.getSource().getParent().getParent().close();
				oEvent.getSource().getParent().getParent().destroy();
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			}
		},

		onRadioChangeEN: function (oEN) {
			console.log("oEN", oEN);
			var oVal;
			// var oVal = oEN.getSource().getSelectedButton().getText();
			if (oEN.getSource().getSelectedButton().getText() == "Damage") {
				oVal = "Damage";
			} else if (oEN.getSource().getSelectedButton().getText() == "Missing Pieces(s)") {
				oVal = "Missing";
			} else {
				oVal = "Both";
			}
			this.getView().getModel("LOIDataModel").setProperty("/RadioException", oVal);
		},
		onRadioChangeCPhone: function (oCPhone) {
			var oVal2;
			console.log("oCPhone", oCPhone);
			if (oCPhone.getSource().getSelectedButton().getText() == "YES") {
				oVal2 = "Y";
			} else if (oCPhone.getSource().getSelectedButton().getText() == "YES") {
				oVal2 = "N";
			}
			this.getView().getModel("LOIDataModel").setProperty("/RadioCCPhoneEmail", oVal2);
		},
		onRadioChangeTR: function (oTR) {
			console.log("oTR", oTR);
			oTR.getSource().getSelectedButton().getText();
			var oVal3;
			console.log("oTR", oTR);
			if (oTR.getSource().getSelectedButton().getText() == "YES") {
				oVal3 = "Y";
			} else if (oTR.getSource().getSelectedButton().getText() == "YES") {
				oVal3 = "N";
			} else {
				oVal3 = "";
			}
			this.getView().getModel("LOIDataModel").setProperty("/RadioTR", oVal3);
		},
		onRadioChangeCR: function (oCR) {
			console.log("oCR", oCR);
			oCR.getSource().getSelectedButton().getText();
			var oVal4;
			console.log("oCR", oCR);
			if (oCR.getSource().getSelectedButton().getText() == "YES") {
				oVal4 = "Y";
			} else if (oCR.getSource().getSelectedButton().getText() == "YES") {
				oVal4 = "N";
			}
			this.getView().getModel("LOIDataModel").setProperty("/RadioCR", oVal4);
		},
		onRadioChangeParts: function (oRadioParts) {
			console.log("oRadioParts", oRadioParts);
			var oVal5;
			oRadioParts.getSource().getSelectedButton().getText();
			if (oRadioParts.getSource().getSelectedButton().getText() == "Held for 30 Days for Carrier Inspection - then will be scrapped") {
				oVal5 = "H";
			} else if (oRadioParts.getSource().getSelectedButton().getText() == "Repaired - as per TCI policy and mutual agreement") {
				oVal5 = "R";
			} else {
				oVal5 = "S";
			}
			this.getView().getModel("LOIDataModel").setProperty("/RadioParts", oVal5);
		},

		_getLOIData: function (obj, model) {
			// var oValidator = new Validator();

			// var oValid = oValidator.validate(this.getView().byId("id_LOIForm01"));
			// var oValid01 = oValidator.validate(this.getView().byId("id_LOIForm02"));
			// var oValid02 = oValidator.validate(this.getView().byId("id_LOIForm03"));
			// console.log("Start Validations");
			// if (!oValid && !oValid01 && !oValid02) {
			// 	console.log("Validations Failed");
			// 	this.getView().byId("idMainClaimMessage").setProperty("visible", true);
			// 	this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
			// 	this.getView().byId("idMainClaimMessage").setType("Error");
			// } else {
			console.log("Validations Completed");
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
			obj = {
				"Claim": this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum"),
				"Partner": this.getView().getModel("PartDataModel").getProperty("/matnr"),
				"DealershipName": "",
				"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
				"CarrierName": this.getView().getModel("LOIDataModel").getProperty("/CarrierName"),
				"CarrierAddrnumber": "",
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
				// "Address": this.getView().getModel("LOIDataModel").getProperty("/ReAddress"),
				"Address1": this.getView().getModel("LOIDataModel").getProperty("/Address1"),
				"Address2": this.getView().getModel("LOIDataModel").getProperty("/Address2"),
				"Address3": this.getView().getModel("LOIDataModel").getProperty("/Address3"),
				"Address4": this.getView().getModel("LOIDataModel").getProperty("/Address4")
			};
			// this._getLOIData(obj, oClaimModel);
			oClaimModel.create("/zc_LOISet", obj, {
				success: $.proxy(function (data, response) {
					console.log("data", data);
					console.log("response", response);
					MessageToast.show("Letter of Intent sent successfully");
					// this.getModel("LOIDataModel").setData(response.data);
					// console.log(this.getModel("LOIDataModel").getData());
					dialog.close();
				}, this),
				error: function (err) {
					console.log(err);
				}
			});
			// }
		},
		onPressLetterOfIntent: function () {
			var LOIData = new sap.ui.model.json.JSONModel({
				"claimNumber": "",
				"CarrierName": oFilteredDealerData[0].BusinessPartnerName,
				"Address1": oFilteredDealerData[0].HouseNumber + " " + oFilteredDealerData[0].StreetName,
				"Address2": oFilteredDealerData[0].CityName,
				"Address3": oFilteredDealerData[0].PostalCode,
				"Address4": oFilteredDealerData[0].Country + " " + oFilteredDealerData[0].Region,
				"CarrierAddress": "",
				"TextAttentionLOI": "Claims Department",
				"TextStripLOI": "",
				"TopTextLOI": "Without Prejudice",
				"LOIDate": new Date(),
				"DeliveryDateLOI": this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate"),
				"AtLOI": "",
				"WaybillNoLOI": this.getView().getModel("HeadSetData").getProperty("/TCIWaybillNumber"),
				"RadioException": "Damage",
				"estClaimValueLOI": "",
				"LOIDescp": this.getView().getModel("PartDataModel").getProperty("/arrPartLOI"),
				"RadioCCPhoneEmail": "Y",
				"DateLOI": "",
				"AtLOI02": "",
				"RepresntativeName": "",
				"RadioTR": "Y",
				"RadioCR": "Y",
				"RadioParts": "H",
				"ursTrulyText": "",
				"PhoneLOI": "",
				"LOIExt": "",
				"LOIEmail": "",
				"ReAddress": ""
			});
			LOIData.setDefaultBindingMode("TwoWay");
			this.getView().setModel(LOIData, "LOIDataModel");

			this.getView().getModel("LOIDataModel").updateBindings(true);
			console.log("LOIdata", this.getView().getModel("LOIDataModel").getData());

			// this.getView().setModel(this.getView().getModel("HeadSetData"), "HeadSetData");
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.letterOfIntent", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},
		onPressAddPart: function () {
			this.getView().getModel("DateModel").setProperty("/partLine", true);
			//oLetterOfIntent
		},

		onDDChange: function (oEventVal) {
			console.log("2nd Screen oEventVal", oEventVal);
			var SelectedDD = oEventVal.getSource().getModel("DropDownModel").getProperty(oEventVal.getParameters().selectedItem.getBindingContext(
				"DropDownModel").getPath());
			var DDClaimType = oEventVal.getSource().getModel("DropDownModel").getProperty(oEventVal.getParameters().selectedItem.getBindingContext(
				"DropDownModel").getPath()).ClaimType;
			var matrnr = this.getView().getModel("PartDataModel").getProperty("/matnr");
			if (DDClaimType == "ZPPD") {
				if (SelectedDD.DiscreCode == "2A") {
					this.getView().getModel("multiHeaderConfig").setProperty("/flagIncorrectPart", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberEdit", false);
					this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", matrnr);
				} else if (SelectedDD.DiscreCode == "3A") { //Overage
					// RetainPartOV
					this.getView().getModel("multiHeaderConfig").setProperty("/flagIncorrectPart", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberEdit", false);
					this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", matrnr);
				} else {
					this.getView().getModel("multiHeaderConfig").setProperty("/flagIncorrectPart", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberEdit", true);
				}
			}
			//ZPMS ZPTS ZPPD ZPDC
			this.getView().getModel("PartDataModel").setProperty("/ALMDiscreCode", SelectedDD.ALMDiscreCode);
			this.getView().getModel("PartDataModel").setProperty("/ALMDiscreDesc", SelectedDD.ALMDiscreCode + " - " + SelectedDD.ALMDiscreDesc);
			this.getView().getModel("PartDataModel").setProperty("/ClaimType", SelectedDD.ClaimType);
			this.getView().getModel("PartDataModel").setProperty("/DiscreCode", SelectedDD.DiscreCode);
			this.getView().getModel("PartDataModel").setProperty("/DiscreDesc", SelectedDD.DiscreDesc);
			this.getView().getModel("PartDataModel").setProperty("/LanguageKey", SelectedDD.LanguageKey);
			console.log(this.getView().getModel("PartDataModel"));
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
			// this.getView().getModel("DateModel").setProperty("/saveParts", true);
			var oTable = this.getView().byId("partTable");
			var oTableIndex = oTable._aSelectedPaths;

			if (oTableIndex.length == 1) {
				var oSelectedRow = oTableIndex.toString();
				var obj = this.getModel("LocalDataModel").getProperty(oSelectedRow);
				var PartNum = obj.matnr;
				var PartQt = obj.quant;
				this.getView().getModel("PartDataModel").setProperty("/LineNo", obj.LineRefnr);
				this.getView().getModel("PartDataModel").setProperty("/matnr", PartNum);
				this.getView().getModel("PartDataModel").setProperty("/quant", PartQt);
				this.getView().getModel("PartDataModel").setProperty("/PartDescription", obj.PartDescription);
				this.getView().getModel("DateModel").setProperty("/partLine", true);
				this.getView().getModel("PartDataModel").setProperty("/DiscreCode", obj.DiscreCode);
				this.getView().getModel("PartDataModel").setProperty("/RetainPart", obj.RetainPart);
				this.getView().getModel("PartDataModel").setProperty("/QuantityReceived", obj.QuantityReceived);
				this.getView().getModel("PartDataModel").setProperty("/ALMDiscreDesc", obj.ALMDiscreDesc);

				var oIndex = oTableIndex.toString().split("/")[2];
				// this.obj = {
				// 	"DBOperation": "SAVE",
				// 	"Message": "",
				// 	"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/ClaimType"),
				// 	"Partner": this.getModel("LocalDataModel").getProperty("/BPDealerDetails/BusinessPartnerKey"),
				// 	"ActionCode": "",
				// 	"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
				// 	"PartnerRole": "AS",
				// 	"ReferenceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate")),
				// 	"DateOfApplication": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication")),
				// 	"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
				// 	"Delivery": "",
				// 	"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
				// 	"TCIWaybillNumber": "",
				// 	"ShipmentReceivedDate": null,
				// 	"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
				// 	"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
				// 	"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
				// 	"zc_itemSet": {
				// 		"results": []
				// 	},
				// 	"zc_claim_attachmentsSet": {
				// 		"results": []
				// 	},
				// 	"zc_claim_item_price_dataSet": {
				// 		"results": []
				// 	}
				// };

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
						oClaimModel.read("/zc_claim_item_price_dataSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
									"'and LanguageKey eq 'E'"
							},
							success: $.proxy(function (pricedata) {
								var pricingData = pricedata.results;
								var oFilteredData = pricingData.filter(function (val) {
									return val.ItemType === "MAT";
								});
								console.log(oFilteredData);
								this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
								this.getView().getModel("DateModel").setProperty("/saveParts", true);
								this._fnClaimSum();
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
						oClaimModel.read("/zc_claim_item_price_dataSet", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty(
										"/NumberOfWarrantyClaim") +
									"'and LanguageKey eq 'E'"
							},
							success: $.proxy(function (pricedata) {
								var pricingData = pricedata.results;
								var oFilteredData = pricingData.filter(function (val) {
									return val.ItemType === "MAT";

								});
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

		_getDropDownData: function (oClaimType) {
			console.log("claimType", oClaimType);
			//zc_discre_codesSet?$filter=ClaimType eq 'ZPDC' and LanguageKey eq 'E'&$format=json
			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.refreshSecurityToken();
			oClaimModel.read("/zc_discre_codesSet", {
				urlParameters: {
					"$filter": "ClaimType eq'" + oClaimType + "'and LanguageKey eq 'E'"
				},
				success: $.proxy(function (odata) {
					console.log("DD data for screen2", odata);
					this.getView().getModel("DropDownModel").setProperty("/" + "/items", odata.results);
					this.getView().getModel("DropDownModel").getData().items.unshift({
						"ALMDiscreCode": "",
						"ALMDiscreDesc": "",
						"ClaimType": "",
						"DiscreCode": "",
						"DiscreDesc": "",
						"LanguageKey": ""
					});
					this.getView().getModel("DropDownModel").updateBindings(true);
				}, this)
			});
		},
		onSelectClaim: function (oEvent) {
			this._getDropDownData(oEvent.getSource().getProperty("selectedKey"));
			if (oEvent.getSource().getProperty("selectedKey") === "ZPDC") {
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
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 6);
				console.log(oEvent.getSource().getProperty("value") + "ZPDC");
				this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", false);

			} else if (oEvent.getSource().getProperty("selectedKey") === "ZPMS") {
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
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 6);
				this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", false);
				//console.log(oEvent.getParameters().selectedItem.getText() + "PMS");
			} else if (oEvent.getSource().getProperty("selectedKey") === "ZPTS") {
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
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 6);
				this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", true);

			} else if (oEvent.getSource().getProperty("selectedKey") === "ZPPD") {
				console.log(oEvent.getSource().getProperty("value") + "ZPPD");
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
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepCol", false);
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
			// this.obj = {
			// 	"DBOperation": "SAVE",
			// 	"Message": "",
			// 	"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/ClaimType"),
			// 	"Partner": this.getModel("LocalDataModel").getProperty("/BPDealerDetails/BusinessPartnerKey"),
			// 	"ActionCode": "",
			// 	"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
			// 	"PartnerRole": "AS",
			// 	"ReferenceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate")),
			// 	"DateOfApplication": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication")),
			// 	"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
			// 	"Delivery": "",
			// 	"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
			// 	"TCIWaybillNumber": "",
			// 	"ShipmentReceivedDate": null,
			// 	"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
			// 	"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
			// 	"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
			// 	"zc_itemSet": {
			// 		"results": []
			// 	},
			// 	"zc_claim_attachmentsSet": {
			// 		"results": []
			// 	},
			// 	"zc_claim_item_price_dataSet": {
			// 		"results": []
			// 	}
			// };
			this.obj.zc_claim_attachmentsSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.refreshSecurityToken();
			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					MessageToast.show("SuccesFully Uploaded");
					this.obj.zc_claim_attachmentsSet.results.pop();
					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName eq'" + fileName +
								"'"
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
			// this.obj = {
			// 	"DBOperation": "SAVE",
			// 	"Message": "",
			// 	"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/ClaimType"),
			// 	"Partner": this.getModel("LocalDataModel").getProperty("/BPDealerDetails/BusinessPartnerKey"),
			// 	"ActionCode": "",
			// 	"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
			// 	"PartnerRole": "AS",
			// 	"ReferenceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate")),
			// 	"DateOfApplication": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication")),
			// 	"RepairDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate")),
			// 	"Delivery": "",
			// 	"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
			// 	"TCIWaybillNumber": "",
			// 	"ShipmentReceivedDate": null,
			// 	"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
			// 	"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
			// 	"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
			// 	"zc_itemSet": {
			// 		"results": []
			// 	},
			// 	"zc_claim_attachmentsSet": {
			// 		"results": []
			// 	},
			// 	"zc_claim_item_price_dataSet": {
			// 		"results": []
			// 	}
			// };
			this.obj.zc_claim_attachmentsSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.refreshSecurityToken();
			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					MessageToast.show("SuccesFully Uploaded");
					this.obj.zc_claim_attachmentsSet.results.pop();
					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName eq'" + fileName +
								"'"
						},
						success: $.proxy(function (odata) {
							this.getView().getModel("AttachmentModel").setProperty("/" + "/items", odata.results);
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
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.deleteItemById(oEvent.getParameter("documentId"), "ClaimModel");
			MessageToast.show("FileDeleted event triggered.");
			var oFileName = oEvent.getParameters().item.getFileName();
			var oClaimModel = this.getModel("ProssingModel");

			var itemObj = {
				"NumberOfWarrantyClaim": oClaimNum,
				"COMP_ID": oFileName,
				"DBOperation": "DELT"
			};

			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_claim_attachmentsSet", itemObj, {

				success: $.proxy(function () {
					oClaimModel.refresh();

					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
						},

						success: $.proxy(function (odata) {
							this.getView().getModel("ClaimModel").setProperty("/" + "/items", odata.results);
							this.getModel("LocalDataModel").setProperty("/oAttachmentSet", odata.results);
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
			// var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			// this.deleteItemById(oEvent.getParameter("documentId"), "ClaimModel");
			// MessageToast.show("FileDeleted event triggered.");
			// var oFileName = oEvent.getParameters().item.getFileName();
			// var oClaimModel = this.getModel("ProssingModel");

			// oClaimModel.refreshSecurityToken();

			// oClaimModel.remove("/zc_claim_attachmentsSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + oFileName + "')", {
			// 	method: "DELETE",
			// 	success: $.proxy(function () {
			// 		oClaimModel.refresh();

			// 		oClaimModel.read("/zc_claim_attachmentsSet", {
			// 			urlParameters: {
			// 				"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
			// 			},
			// 			success: $.proxy(function (oData) {
			// 				this.getModel("LocalDataModel").setProperty("/oAttachmentSet", oData.results);
			// 			}, this)
			// 		});
			// 		MessageToast.show("File has been deleted successfully");
			// 	}, this)
			// });
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.deleteItemById(oEvent.getParameter("documentId"), "ClaimModel");
			MessageToast.show("FileDeleted event triggered.");
			var oFileName = oEvent.getParameters().item.getFileName();
			var oClaimModel = this.getModel("ProssingModel");

			var itemObj = {
				"NumberOfWarrantyClaim": oClaimNum,
				"COMP_ID": oFileName,
				"DBOperation": "DELT"
			};

			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_claim_attachmentsSet", itemObj, {

				success: $.proxy(function () {
					oClaimModel.refresh();

					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
						},

						success: $.proxy(function (odata) {
							this.getView().getModel("ClaimModel").setProperty("/" + "/items", odata.results);
							this.getModel("LocalDataModel").setProperty("/oAttachmentSet", odata.results);
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
			} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == undefined && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
			} else if (oValid && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != undefined && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != "") {
				if (this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") == undefined) {
					this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", "");
				}
				this.obj = {
					"DBOperation": "SAVE",
					"Message": "",
					// "NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
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
					},
					"zc_claim_vsrSet": {
						"results": []
					},
					"zc_claim_item_price_dataSet": {
						"results": []
					}
				};

				console.log(this.obj);
				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
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
								// var oCLaim = this.getModel("LocalDataModel").getProperty("/ClaimDetails/NumberOfWarrantyClaim");
								this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", this.getModel("LocalDataModel").getProperty(
									"/WarrantyClaimNum"));
								this.getView().getModel("DateModel").setProperty("/saveParts", true);
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
								MessageToast.show(this.obj.NumberOfWarrantyClaim + "has been Saved successfully");
							},
							error: function () {
								MessageToast.show("Claim is not Saved");
							}
						});
						dialog.close();
					}, this),
					error: function (err) {
							dialog.close();
						}
						// 	MessageToast.show('Claim Number {cliam number" was successfully submitted to TCI.');
						// 	that.getRouter().navTo("ApplicationList");
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
			console.log("claimType", this.obj.WarrantyClaimType);
			this.obj.Partner = this.getModel("LocalDataModel").getProperty("/BPDealerDetails/BusinessPartnerKey");
			this.obj.ActionCode = "";
			this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
			this.obj.PartnerRole = "AS";
			this.obj.ReferenceDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate"));
			this.obj.DateOfApplication = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication"));
			this.obj.RepairDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/RepairDate"));
			this.obj.Delivery = "";
			this.obj.DeliveryDate = this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate"));
			this.obj.TCIWaybillNumber = "";
			this.obj.ShipmentReceivedDate = null;
			this.obj.DealerContact = this.getView().getModel("HeadSetData").getProperty("/DealerContact");
			this.obj.DeliveringCarrier = this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier");
			this.obj.HeadText = this.getView().getModel("HeadSetData").getProperty("/HeadText");
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
			this.obj.zc_claim_vsrSet.results.push(oObj);

			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			//var that = this;
			var dialog = new Dialog({
				title: "Submit Claim to TCI",
				type: "Message",
				content: new Text({
					text: "Are you sure, you want to submit this Claim to TCI?"
				}),

				buttons: [
					new Button({
						text: "Yes",
						press: $.proxy(function () {
							oClaimModel.refreshSecurityToken();
							oClaimModel.create("/zc_headSet", this.obj, {
								success: $.proxy(function (data, response) {
									this.getModel("LocalDataModel").setProperty("/oErrorSet", response.data.zc_claim_vsrSet.results);
									partsObj.zc_claim_vsrSet.results.pop(oObj);
									if (response.data.zc_claim_vsrSet.results.length <= 0) {
										this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
										MessageToast.show("Claim Number " + oClaimNum + " successfully submitted to TCI.");
										this.getView().byId("idFilter04").setProperty("enabled", true);
									} else {
										MessageToast.show(
											"Claim Number " + oClaimNum + " was Rejected by TCI, please see Validation Results for more details.");
									}
									dialog.close();
								}, this),
								error: function (err) {
									console.log("Error in submitting claim to TCI", err);
									this.getView().byId("idFilter04").setProperty("enabled", false);
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
		},

		onSelectPartsDealer: function (oDealerEvt) {
			// debugger;
			oFilteredDealerData = oDealerEvt.getSource().getModel("BpDealerModel").getData().BpDealerList.filter(function (val) {
				return val.BusinessPartner === oDealerEvt.getParameter("newValue");
			});
		}

		//	onExit: function() {
		//
		//	}

	});

});