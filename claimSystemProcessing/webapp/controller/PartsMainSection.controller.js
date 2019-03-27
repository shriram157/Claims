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
		oFilteredDealerData, dialogValidator, BPKey;
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
				// DealerNetPrcV: false,
				// DealerNetPrcEdt: false,
				PartRepaired: false,
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
					var oFilteredData = data.results.filter(function (val) {
						return val.ItemType === "MAT" || val.ItemType === "TOTL";
					});
					// oArr.push(data.results[0], data.results[3]);
					this.getModel("LocalDataModel").setProperty("/ClaimSum", oFilteredData);
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
				"RepairQty": "0.000",
				"DamageCondition": "",
				"MiscellaneousCode": "",
				"TranportShortageType": "",
				"DiscrepancyCodes": "",
				"ALMDiscrepancyCode": "",
				"RepairOrRetrunPart": "N",
				"RepairAmount": "0.000"
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
			this.getModel("LocalDataModel").setProperty("/oErrorSet", "");
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
					if (oData.d.results.length == 1) {
						oFilteredDealerData=[];
						var BpLength = oData.d.results[0].BusinessPartner.length;
						oFilteredDealerData.push({
							"BusinessPartnerKey": oData.d.results[0].BusinessPartner,
							"BusinessPartner": oData.d.results[0].BusinessPartner.substring(5, BpLength),
							"BusinessPartnerName": oData.d.results[0].OrganizationBPName1, //item.OrganizationBPName1 //item.BusinessPartnerFullName
							"BusinessPartnerFullName": oData.d.results[0].BusinessPartnerFullName, //item.OrganizationBPName1 //item.BusinessPartnerFullName
							"BusinessPartnerType": oData.d.results[0].BusinessPartnerType,
							"searchTermReceivedDealerName": oData.d.results[0].SearchTerm1,
							"HouseNumber": oData.d.results[0].to_BusinessPartnerAddress.results[0].HouseNumber,
							"CityName": oData.d.results[0].to_BusinessPartnerAddress.results[0].CityName,
							"Country": oData.d.results[0].to_BusinessPartnerAddress.results[0].Country,
							"PostalCode": oData.d.results[0].to_BusinessPartnerAddress.results[0].PostalCode,
							"StreetName": oData.d.results[0].to_BusinessPartnerAddress.results[0].StreetName,
							"Region": oData.d.results[0].to_BusinessPartnerAddress.results[0].Region
						});
					}
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
			this.getModel("LocalDataModel").setProperty("/oErrorSet", "");
			// this.getModel("LOIDataModel").setProperty("/claimNumber", oClaim);
			// LOIDataModel claimNumber
			if (oClaim != "nun" && oClaim != undefined) {
				this.getModel("LocalDataModel").setProperty("/step01Next", true);
				this.claimType = oEvent.getParameters().arguments.oKey;
				var DropDownModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(DropDownModel, "DropDownModel");
				this.getView().getModel("DropDownModel").setProperty("/" + "/items", "");
				this._getDropDownData(oEvent.getParameters().arguments.oKey);
				this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
				var oProssingModel = this.getModel("ProssingModel");
				oProssingModel.read("/ZC_CLAIM_HEAD", {
					urlParameters: {
						"$filter": "NumberOfWarrantyClaim eq '" + oClaim + "' "
					},
					success: $.proxy(function (data) {
						this.getModel("LocalDataModel").setProperty("/ClaimDetails", data.results[0]);
						this.getModel("LocalDataModel").setProperty("/BPPartner", data.results[0].Partner);
						BPKey = data.results[0].Partner;
						this._getBPModel(BPKey);
						this.getModel("LocalDataModel").setProperty("/NumberOfWarrantyClaim", data.results[0].NumberOfWarrantyClaim);
						this.getModel("LocalDataModel").setProperty("/PartDetailList", data.results[0].to_claimitem.results);
						console.log(data.results);
						console.log("oFilteredDealerData", oFilteredDealerData);
						var HeadSetData = new sap.ui.model.json.JSONModel(data.results[0]);
						HeadSetData.setDefaultBindingMode("TwoWay");
						this.getView().setModel(HeadSetData, "HeadSetData");

					}, this),
					error: function (err) {
						var err = JSON.parse(err.responseText);
						var msg = err.error.message.value;
						MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
					}
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
							if (item.RepairOrRetrunPart == "Yes") {
								var RepairPart = "Y";
							} else {
								RepairPart = "N";
							}
							if (item.RetainPart == "Yes") {
								var RetainPart = "Y";
							} else {
								RetainPart = "N";
							}
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
								RetainPart: RetainPart,
								QuantityOrdered: item.QuantityOrdered,
								QuantityReceived: item.QuantityReceived,
								DiscreCode: item.DiscreCode,
								ALMDiscreDesc: item.ALMDiscreDesc,
								WrongPart: item.WrongPart,
								RepairOrRetrunPart: RepairPart,
								RepairAmount: item.RepairAmt
							};
						});
						this.obj = {
							"DBOperation": "SAVE",
							"Message": "",
							"WarrantyClaimType": this.claimType,
							"Partner": this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner"),
							"ActionCode": "",
							"NumberOfWarrantyClaim": this.getModel("LocalDataModel").getProperty("/NumberOfWarrantyClaim"),
							"PartnerRole": "AS",
							"ReferenceDate": this._fnDateFormat(this.getModel("LocalDataModel").getProperty("/ClaimDetails/ReferenceDate")),
							"DateOfApplication": this._fnDateFormat(this.getModel("LocalDataModel").getProperty("/ClaimDetails/DateOfApplication")),
							"RepairDate": this._fnDateFormat(this.getModel("LocalDataModel").getProperty("/ClaimDetails/RepairDate")),
							"Delivery": "",
							"DeliveryDate": this._fnDateFormat(this.getModel("LocalDataModel").getProperty("/ClaimDetails/DeliveryDate")),
							"TCIWaybillNumber": "",
							"ShipmentReceivedDate": null,
							"DealerContact": this.getModel("LocalDataModel").getProperty("/ClaimDetails/DealerContact"),
							"DeliveringCarrier": this.getModel("LocalDataModel").getProperty("/ClaimDetails/DeliveringCarrier"),
							"HeadText": this.getModel("LocalDataModel").getProperty("/ClaimDetails/HeadText"),
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
					error: function (err) {
						var err = JSON.parse(err.responseText);
						var msg = err.error.message.value;
						MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
					}
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
				this.getModel("LocalDataModel").setProperty("/step01Next", false);
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
					"NumberOfWarrantyClaim": "",
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

				this.optionChanged = false;
				this.partsInput02 = false;
				this.youCanAddPartItem = false;
				this.youCanAddPartItem2 = false;
				this.inValid = false;
				this.inValid2 = false;

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
						"RepairOrRetrunPart": "N",
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
			this.getView().byId("idFilter02").setProperty("enabled", false); //make it false before deploying/committing
			this.getView().byId("idFilter03").setProperty("enabled", false);
			this.getView().byId("idFilter04").setProperty("enabled", false);
			// this._getBPList();
		},

		handlePNValueHelp02: function (oController) {
			this.partsInput02 = true;
			this.inputId02 = oController.getParameters().id;
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
			if (this.partsInput02 == true) {
				this.oSelectedItem02 = evt.getParameter("selectedItem");
				// this.oSelectedTitle = this.oSelectedItem02.getTitle();
			} else {
				this.oSelectedItem = evt.getParameter("selectedItem");
				// this.oSelectedTitle = this.oSelectedItem.getTitle();
			}
			//this.getView().getModel("PartDataModel").setProperty("/PartDescription", this.oSelectedItem.getDescription());
			this.getModel("LocalDataModel").setProperty("/BaseUnit", this.oSelectedItem.getInfo());
			//this.getView().byId("idPartDes").setValue(this.oSelectedItem.getDescription());
			this.getView().getModel("PartDataModel").setProperty("/PartDescription", this.oSelectedItem.getDescription());
			if (this.partsInput02 == true) {
				this.getView().getModel("HeadSetData").setProperty("/PartNumberRcDesc", this.oSelectedItem02.getDescription());
			}
			if (this.oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(this.oSelectedItem.getTitle());
			}
			if (this.oSelectedItem02) {
				var productInput02 = this.byId(this.inputId02);
				productInput02.setValue(this.oSelectedItem02.getTitle());
			}
			if (this.getView().getModel("multiHeaderConfig").getProperty("/PartNumberEdit") == false) {
				this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", this.oSelectedItem.getTitle());
				this.getView().getModel("HeadSetData").setProperty("/PartNumberRcDesc", this.oSelectedItem.getDescription());
			} else {
				// this.getView().getModel("HeadSetData").setProperty("/PartNumberRcDesc", this.oSelectedItem.getDescription());
			}
			evt.getSource().getBinding("items").filter([]);
			this.partsInput02 = false;
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

		ValidQty: function (liveQty) {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			if (this.getView().getModel("PartDataModel").getProperty("/DiscreCode") == "2A") {
				if (this.getView().getModel("PartDataModel").getProperty("/quant") <= liveQty.getParameters().newValue) {
					this.youCanAddPartItem = false;
					MessageBox.show(this.oBundle.getText("ShortageWarning"), MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK,
						null, null);
				}
			}

			if (this.getView().getModel("PartDataModel").getProperty("/DiscreCode") == "3A") {
				if (this.getView().getModel("PartDataModel").getProperty("/quant") >= liveQty.getParameters().newValue) {
					this.youCanAddPartItem = false;
					MessageBox.show(this.oBundle.getText("OverageWarning"), MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK,
						null, null);
				}
			}

		},

		onPressSavePartClaim: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("ProssingModel");
			this._oToken = oClaimModel.getHeaders()['x-csrf-token'];
			$.ajaxSetup({
				headers: {
					'X-CSRF-Token': this._oToken
				}
			});
			console.log("Part Item claim Data to be saved", this.obj);
			var that = this;
			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					oClaimModel.read("/zc_claim_item_price_dataSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
								"'and LanguageKey eq 'E'"
						},
						success: $.proxy(function (pricedata) {
							MessageToast.show(that.oBundle.getText("ClaimSuccessMSG"));
							console.log("pricedata on saveClaim success", pricedata);
						}, this),
						error: function (err) {
							console.log(err);
							var err = JSON.parse(err.responseText);
							var msg = err.error.message.value;
							MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
						}
					});
				}, this),
				error: function (err) {
					console.log(err);
					var err = JSON.parse(err.responseText);
					var msg = err.error.message.value;
					MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
				}
			});
		},

		onPressSavePart: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oValidator = new Validator();
			if (this.getView().getModel("DateModel").getProperty("/partLine") == true) {
				var Qty;
				if (this.getView().getModel("PartDataModel").getProperty("/quant") == "" || this.getView().getModel("PartDataModel").getProperty(
						"/quant") == "0") {
					// this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
					// this.inValid = false;
					Qty = "0.000";
				} else {
					// this.inValid = true;
					// this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
					Qty = this.getView().getModel("PartDataModel").getProperty("/quant");
				}
				if (this.getView().getModel("PartDataModel").getProperty("/QuantityReceived") == "" || this.getView().getModel("PartDataModel")
					.getProperty(
						"/QuantityReceived") == "0") {
					// this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
					// this.inValid2 = false;
				} else {
					// this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
					// this.inValid2 = true;
				}
				var oValid01 = oValidator.validate(this.getView().byId("idRow01Form"));
				var oValid02 = oValidator.validate(this.getView().byId("idRow02Form"));
			}
			if (!oValid01 && !oValid02) {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				return false;
			} else {
				this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				var oTable = this.getView().byId("partTable");
				var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
				oClaimNum = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");
				// this.obj.NumberOfWarrantyClaim = oClaimNum;
				// this.claimType = this.obj.WarrantyClaimType;

				if (this.claimType == "ZPDC" && this.getView().getModel("PartDataModel").getProperty("/DiscreCode") == "8A") {
					this.getView().getModel("DateModel").setProperty("/oLetterOfIntent", true);
				} else if (this.claimType == "ZPTS") {
					this.getView().getModel("DateModel").setProperty("/oLetterOfIntent", true);
				} else {
					this.getView().getModel("DateModel").setProperty("/oLetterOfIntent", false);
				}

				this.lineRefNumber = this.getView().getModel("PartDataModel").getProperty("/LineNo").toString();

				var retainval, RepairOrRetrunPart;
				if (this.getView().getModel("PartDataModel").getProperty("/RetainPart") == "Yes") {
					retainval = "Y";
				} else {
					retainval = "N";
				}

				if (this.getView().getModel("HeadSetData").getProperty("/PartRepaired") == "Yes") {
					RepairOrRetrunPart = "Y";
				} else {
					RepairOrRetrunPart = "N";
				}
				if (this.claimType.length == 2) {
					this.claimType = "ZP" + this.claimType;
				}
				if (this.updatePartFlag == true) {
					if (this.getView().byId("DmgCodes")._getSelectedItemText() != "") {
						this.getView().getModel("PartDataModel").setProperty("/ALMDiscreDesc", this.getView().getModel("PartDataModel").getProperty(
							"/DiscreCode") + "-" + this.getView().byId("DmgCodes")._getSelectedItemText());
					}
					if (this.getView().byId("DscpCodes")._getSelectedItemText() != "") {
						this.getView().getModel("PartDataModel").setProperty("/ALMDiscreDesc", this.getView().getModel("PartDataModel").getProperty(
							"/DiscreCode") + "-" + this.getView().byId("DscpCodes")._getSelectedItemText());
					}
					if (this.getView().byId("MscCodes")._getSelectedItemText() != "") {
						this.getView().getModel("PartDataModel").setProperty("/ALMDiscreDesc", this.getView().getModel("PartDataModel").getProperty(
							"/DiscreCode") + "-" + this.getView().byId("MscCodes")._getSelectedItemText());
					}
					if (this.getView().byId("TransportCodes")._getSelectedItemText() != "") {
						this.getView().getModel("PartDataModel").setProperty("/ALMDiscreDesc", this.getView().getModel("PartDataModel").getProperty(
							"/DiscreCode") + "-" + this.getView().byId("TransportCodes")._getSelectedItemText());
					}
					console.log("descretext", this.getView().getModel("PartDataModel").getProperty("/ALMDiscreDesc"));
				}
				// }
				console.log("item level claimType", this.claimType);
				if (this.claimType != "ZPPD") {
					// if (this.getModel("LocalDataModel").getProperty("/oAttachmentSet") != undefined && this.getModel("LocalDataModel").getProperty(
					// 		"/oAttachmentSet") != "") {
					// this.URI = this.getModel("LocalDataModel").getProperty("/oAttachmentSet")[0].URI;
					if (this.addPartFlag == true || this.updatePartFlag == true) {
						if (this.getView().getModel("HeadSetData").getProperty("/RepairAmount") == "" || this.getView().getModel("HeadSetData").getProperty(
								"/RepairAmount") == undefined) {
							var RepairAmt = "0.000";
						} else {
							RepairAmt = this.getView().getModel("HeadSetData").getProperty("/RepairAmount");
						}
						var itemObj = {
							"Type": "PART",
							"ItemType": "MAT",
							"ControllingItemType": "MAT",
							"MaterialNumber": this.getView().getModel("PartDataModel").getProperty("/matnr"),
							"PartQty": Qty.toString(),
							"PartDescription": this.getView().getModel("PartDataModel").getProperty("/PartDescription"),
							"UnitOfMeasure": this.getModel("LocalDataModel").getProperty("/BaseUnit"),
							"LineRefnr": this.getView().getModel("PartDataModel").getProperty("/LineNo").toString(),
							"ItemKey": this.getView().getModel("PartDataModel").getProperty("/matnr"),
							"RetainPart": retainval,
							"QuantityOrdered": this.getView().getModel("PartDataModel").getProperty("/quant").toString(),
							"QuantityReceived": this.getView().getModel("PartDataModel").getProperty("/QuantityReceived").toString(),
							"DiscreCode": this.getView().getModel("PartDataModel").getProperty("/DiscreCode"),
							"WrongPart": "",
							"ALMDiscreDesc": this.getView().getModel("PartDataModel").getProperty("/ALMDiscreDesc"),
							"RepairOrRetrunPart": RepairOrRetrunPart,
							"RepairAmount": RepairAmt
								// ,
								// "URI": this.getModel("LocalDataModel").getProperty("/oAttachmentSet")[0].URI
						};
						console.log("Newly added part obj", itemObj);
						this.getView().getModel("PartDataModel").setProperty("/arrPartLOI", arrPartLOI);
						arrPartLOI.push(itemObj.MaterialNumber, " ", itemObj.PartDescription);

						this.obj.zc_itemSet.results.push(itemObj);
					}
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
									"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty(
											"/NumberOfWarrantyClaim") +
										"'and LanguageKey eq 'E'"
								},
								success: $.proxy(function (pricedata) {
									MessageToast.show(that.oBundle.getText("PartItemSuccessMSG"));
									console.log("pricedata", pricedata);
									var pricingData = pricedata.results;
									var oFilteredData = pricingData.filter(function (val) {
										return val.ItemType === "MAT"
									});

									var DiscreCode = oFilteredData[0].DiscreCode;
									console.log("claim type", that.claimType);
									console.log("DiscreCode", DiscreCode);
									for (var m = 0; m < oFilteredData.length; m++) {
										oFilteredData[m].ALMDiscreDesc = oFilteredData[m].ALMDiscreDesc.split("-")[1];
										oFilteredData[m].quant2 = oFilteredData[m].quant;
									}
									this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);

									this.getView().getModel("DateModel").setProperty("/partLine", false);
									this.addPartFlag = false;
									this.updatePartFlag = false;
									this.getView().getModel("PartDataModel").setProperty("/LineNo", "");
									this.getView().getModel("PartDataModel").setProperty("/matnr", "");
									this.getView().getModel("PartDataModel").setProperty("/quant", "");
									this.getView().getModel("PartDataModel").setProperty("/quant2", "");
									this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
									this.getView().getModel("PartDataModel").setProperty("/DiscreCode", "");
									this.getView().getModel("PartDataModel").setProperty("/RetainPart", "");
									this.getView().getModel("HeadSetData").setProperty("/PartRepaired", "");
									this.getView().getModel("HeadSetData").setProperty("/RepairOrRetrunPart", "");
									this.getView().getModel("HeadSetData").setProperty("/RepairAmount", "");
									this.getView().getModel("PartDataModel").setProperty("/QuantityReceived", "");
									this.getModel("LocalDataModel").setProperty("/oAttachmentSet", "");
									this.getView().getModel("AttachmentModel").setProperty("/" + "/items", "");
									this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", "");
									this.getView().getModel("PartDataModel").setProperty("/PartNumberRcDesc", "");
									this.getView().getModel("HeadSetData").setProperty("/DamageCondition", "");
									this.getView().getModel("HeadSetData").setProperty("/MiscellaneousCode", "");
									this.getView().getModel("HeadSetData").setProperty("/TranportShortageType", "");
									// this.getView().getModel("AttachmentModel").setProperty("/" + "/items", "");
									oTable.removeSelections("true");
									this._fnClaimSum();
								}, this),
								error: function (err) {
									console.log(err);
									var err = JSON.parse(err.responseText);
									var msg = err.error.message.value;
									MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
								}
							});

						}, this),
						error: function (err) {
							that.obj.zc_itemSet.results.pop();
							console.log(err);
							var err = JSON.parse(err.responseText);
							var msg = err.error.message.value;
							MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
						}
					});
					// } else {
					// 	MessageToast.show("Attachment is required.");
					// }
				} else {
					if (this.addPartFlag == true || this.updatePartFlag == true) {
						console.log("descrecode for part item", this.getView().getModel("PartDataModel").getProperty("/DiscreCode"));
						if (this.getView().getModel("PartDataModel").getProperty("/DiscreCode") !== "4A") {
							var WrongPart = this.getView().getModel("HeadSetData").getProperty("/PartNumberRc");
						} else {
							WrongPart = "";
						}
						var itemObj = {
							"Type": "PART",
							"ItemType": "MAT",
							"ControllingItemType": "MAT",
							"MaterialNumber": this.getView().getModel("PartDataModel").getProperty("/matnr"),
							"PartQty": Qty.toString(),
							"PartDescription": this.getView().getModel("PartDataModel").getProperty("/PartDescription"),
							"UnitOfMeasure": this.getModel("LocalDataModel").getProperty("/BaseUnit"),
							"LineRefnr": this.getView().getModel("PartDataModel").getProperty("/LineNo").toString(),
							"ItemKey": this.getView().getModel("PartDataModel").getProperty("/matnr"),
							"RetainPart": retainval,
							"QuantityOrdered": this.getView().getModel("PartDataModel").getProperty("/quant").toString(),
							"QuantityReceived": this.getView().getModel("PartDataModel").getProperty("/QuantityReceived").toString(),
							"DiscreCode": this.getView().getModel("PartDataModel").getProperty("/DiscreCode"),
							"WrongPart": WrongPart,
							"ALMDiscreDesc": this.getView().getModel("PartDataModel").getProperty("/ALMDiscreDesc")
								// "URI": this.getModel("LocalDataModel").getProperty("/oAttachmentSet/0/URI"),
						};

						console.log("Newly added part obj", itemObj);
						this.getView().getModel("PartDataModel").setProperty("/arrPartLOI", arrPartLOI);
						arrPartLOI.push(itemObj.MaterialNumber, " ", itemObj.PartDescription);

						this.obj.zc_itemSet.results.push(itemObj);

						var arr = this.obj.zc_itemSet.results;

						function checkDuplicateLineItem(LineRefnr, arr) {
							var isDuplicate = false;
							var testObj = {};
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
					}

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
										"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty(
												"/NumberOfWarrantyClaim") +
											"'and LanguageKey eq 'E'"
									},
									success: $.proxy(function (pricedata) {
											var temp = [];
											console.log("pricedata", pricedata);
											var pricingData = pricedata.results;
											var filteredPriceData = pricingData.filter(function (val) {
												return val.ItemType === "MAT";
											});

											var IncorrectPartData = pricingData.filter(function (val) {
												return val.DiscreCode === "4A";
											});
											// }

											if (IncorrectPartData != undefined && IncorrectPartData.length > 1) {
												var IncorrectLineRef = IncorrectPartData.map(function (item) {
													return item.LineRefnr;
												});

												for (var i = 0; i < filteredPriceData.length; i++) {
													if (filteredPriceData[i].LineRefnr == IncorrectLineRef[0]) {
														filteredPriceData.splice(i, 1);
														i--;
													}
												}
											}

											if (IncorrectPartData.length > 1) {
												console.log("Updated filteredPriceData", filteredPriceData);
												for (var m = 0; m < IncorrectPartData.length - 1; m++) {
													if (IncorrectPartData[m].LineRefnr == IncorrectPartData[m + 1].LineRefnr) {
														IncorrectPartData[m].matnr = [
															"Ordered: " + IncorrectPartData[m].matnr,
															"Received: " + IncorrectPartData[m + 1].matnr
														].join("\n");
														IncorrectPartData[m].PartDescription = [
															"Ordered: " + IncorrectPartData[m].PartDescription,
															"Received: " + IncorrectPartData[m + 1].PartDescription
														].join("\n");
														IncorrectPartData[m].DealerNet = [
															"Ordered: " + IncorrectPartData[m].DealerNet,
															"Received: " + IncorrectPartData[m + 1].DealerNet
														].join("\n");
														IncorrectPartData[m].quant2 = [
															"Ordered: " + IncorrectPartData[m].QuantityOrdered,
															"Received: " + IncorrectPartData[m + 1].QuantityReceived
														].join("\n");
														IncorrectPartData[m].AmtClaimed = [
															"Ordered: " + IncorrectPartData[m].AmtClaimed,
															"Received: " + IncorrectPartData[m + 1].AmtClaimed
														].join("\n");
														IncorrectPartData[m].TCIApprovedAmount = [
															"Ordered: " + IncorrectPartData[m].TCIApprAmt,
															"Received: " + IncorrectPartData[m + 1].TCIApprAmt
														].join("\n");
														IncorrectPartData[m].DiffAmt = [
															"Ordered: " + IncorrectPartData[m].DiffAmt,
															"Received: " + IncorrectPartData[m + 1].DiffAmt
														].join("\n");
														filteredPriceData.push(IncorrectPartData[m]);
													}
												}

												console.log("incorrect data updated", filteredPriceData);
											} else {
												console.log("oFilteredData ZPPD", filteredPriceData);
												for (var m = 0; m < filteredPriceData.length; m++) {
													filteredPriceData[m].matnr = [
														"Ordered: " + filteredPriceData[m].matnr,
														"Received: " + filteredPriceData[m].matnr
													].join("\n");
													filteredPriceData[m].PartDescription = [
														"Ordered: " + filteredPriceData[m].PartDescription,
														"Received: " + filteredPriceData[m].PartDescription
													].join("\n");
													filteredPriceData[m].DealerNet = filteredPriceData[m].DealerNet;

													filteredPriceData[m].quant2 = [
														"Ordered: " + filteredPriceData[m].QuantityOrdered,
														"Received: " + filteredPriceData[m].QuantityReceived
													].join("\n");
													filteredPriceData[m].AmtClaimed = filteredPriceData[m].AmtClaimed;
													filteredPriceData[m].TCIApprovedAmount = filteredPriceData[m].TCIApprAmt;
													filteredPriceData[m].DiffAmt = filteredPriceData[m].DiffAmt;
												}
												// this.getView().getModel("multiHeaderConfig").setProperty("/flagIncorrectPart", false);
												console.log("correct data updated", filteredPriceData);
											}

											var oFilteredData = filteredPriceData;
											console.log("filteredPriceData", oFilteredData);

											for (var m = 0; m < oFilteredData.length; m++) {
												oFilteredData[m].ALMDiscreDesc = oFilteredData[m].ALMDiscreDesc.split("-")[1];
											}
											this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
											console.log("Part Items stored",
												this.getModel("LocalDataModel").getData());
											// this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
											MessageToast.show(that.oBundle.getText("PartItemSuccessMSG"));

											this.getView().getModel("PartDataModel").setProperty("/LineNo", "");
											this.getView().getModel("DateModel").setProperty("/partLine", false);
											this.addPartFlag = false;
											this.updatePartFlag = false;
											this.getView().getModel("PartDataModel").setProperty("/matnr", "");
											this.getView().getModel("PartDataModel").setProperty("/quant", "");
											this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
											this.getView().getModel("PartDataModel").setProperty("/DiscreCode", "");
											this.getView().getModel("PartDataModel").setProperty("/RetainPart", "");
											this.getView().getModel("PartDataModel").setProperty("/QuantityReceived", "");
											this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", "");
											this.getView().getModel("HeadSetData").setProperty("/PartNumberRcDesc", "");
											this.getView().getModel("multiHeaderConfig").setProperty("/flagIncorrectPart", false);
											this.getView().getModel("HeadSetData").setProperty("/DiscrepancyCodes", "");
											this.getModel("LocalDataModel").setProperty("/oAttachmentSet", "");
											this.getView().getModel("AttachmentModel").setProperty("/" + "/items", "");
											oTable.removeSelections("true");
											this._fnClaimSum();
										},
										this),
									error: function (err) {
										console.log(err);
										var err = JSON.parse(err.responseText);
										var msg = err.error.message.value;
										MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
									}
								});
							},
							this),
						error: function (err) {
							that.obj.zc_itemSet.results.pop();
							//this.itemObj
							console.log(err);
							var err = JSON.parse(err.responseText);
							var msg = err.error.message.value;
							MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
						}
					});
				}
			}
		},

		onClickURIParts: function (oEvent) {
			console.log(oEvent);
		},

		_openDialog01: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var that = this;
			var dialog = new Dialog({
				title: "Close Letter of Intent",
				type: "Message",
				content: new Text({
					text: that.oBundle.getText("OnCloseLOIMSG")
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
				"Way