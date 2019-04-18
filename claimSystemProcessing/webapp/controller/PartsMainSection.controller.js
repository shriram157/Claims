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
		oFilteredDealerData, dialogValidator, BPKey, userScope, sSelectedLocale;
	return BaseController.extend("zclaimProcessing.controller.PartsMainSection", {

		onInit: function () {
			userScope = sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope");
			console.log("HeaderLinksModel", sap.ui.getCore().getModel("HeaderLinksModel"));
			this.getView().setModel(sap.ui.getCore().getModel("HeaderLinksModel"), "HeaderLinksModel");
			console.log(sap.ui.getCore().getModel("UserDataModel").getProperty("/UserScope"));
			var oDateModel = new sap.ui.model.json.JSONModel();
			oDateModel.setData({
				dateValueDRS2: new Date(2018, 1, 1),
				secondDateValueDRS2: new Date(2018, 2, 1),
				partLine: false,
				oFormEdit: false,
				claimTypeEn: false,
				SaveClaim07: false,
				oLetterOfIntent: false,
				saveParts: false,
				partTypeState: "None",
				SaveClimBTN: false,
				submitTCIBtn: false
			});
			this.getView().setModel(oDateModel, "DateModel");
			var oNodeModel = new sap.ui.model.json.JSONModel();
			oNodeModel.setData({
				"currentLocationText": "Attachments",
				"partsHistory": [],
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
			this.oUploadCollection01 = this.byId("UploadCollection");
			BpDealerModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(BpDealerModel, "BpDealerModel");
			this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
			this.getModel("LocalDataModel").setProperty("/UploadEnableHeader", false);

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
					if (oData.d.results.length === 1) {
						oFilteredDealerData = [];
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
			//zc_claim_groupSet?$filter=LanguageKey%20eq%20%27EN%27
			var sSelectedLocale;
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = (window.location.search.match(/language=([^&]*)/i)[1]).toUpperCase();
			} else {
				sSelectedLocale = "EN"; // default is english
			}
			var oProssingModel = this.getModel("ProssingModel");

			oProssingModel.read("/zc_claim_groupSet", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + sSelectedLocale + "'"
				},
				success: $.proxy(function (groupData) {
					var oClaimGroupsData;
					console.log("groupData", groupData);
					if (sSelectedLocale == "EN") {
						oClaimGroupsData = groupData.results.filter(function (item) {
							item.ALMClaimTypeDes = item.ALMClaimTypeDesEn;
							item.ALMClaimType = item.WarrantyClaimType;
							return item.ClaimGroupDesEn == "PART WAREHOUSE";
						});
						console.log("oClaimGroupsData", oClaimGroupsData);
					} else if (sSelectedLocale == "FR") {
						oClaimGroupsData = groupData.results.filter(function (item) {
							item.ALMClaimTypeDes = item.ALMClaimTypeDesFr;
							item.ALMClaimType = item.WarrantyClaimType;
							return item.ClaimGroupDesFr == "PART WAREHOUSE"; // "ENTREPÔT PARTIE";
						});
						console.log("oClaimGroupsData", oClaimGroupsData);
					}
					this.getModel("LocalDataModel").setProperty("/oClaimPartsGroupsData", oClaimGroupsData);
				}, this)
			});

			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oDateModel = new sap.ui.model.json.JSONModel();
			this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
			/*Uncomment for security*/
			if (userScope == "ReadOnlyViewAll") {
				oDateModel.setData({
					dateValueDRS2: new Date(2018, 1, 1),
					secondDateValueDRS2: new Date(2018, 2, 1),
					partLine: false,
					oFormEdit: false,
					claimTypeEn: false,
					SaveClaim07: false,
					oLetterOfIntent: false,
					saveParts: false,
					partTypeState: "None",
					SaveClimBTN: false,
					submitTCIBtn: false
				});
			} else {
				/*Uncomment for security*/
				oDateModel.setData({
					dateValueDRS2: new Date(2018, 1, 1),
					secondDateValueDRS2: new Date(2018, 2, 1),
					partLine: false,
					oFormEdit: true,
					claimTypeEn: true,
					SaveClaim07: true,
					oLetterOfIntent: false,
					saveParts: false,
					partTypeState: "None",
					SaveClimBTN: true,
					submitTCIBtn: true
				});
				/*Uncomment for security*/
			}
			/*Uncomment for security*/
			this.getView().setModel(oDateModel, "DateModel");
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
				if (this.claimType === "ZPDC") {
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
					this.getView().getModel("multiHeaderConfig").setProperty("/RepAmountCol", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartRepCol", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 6);
					// console.log(oEvent.getSource().getProperty("value") + "ZPDC");
					this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", false);
					this.getView().byId("textHeaderLabel").setText(this.oBundle.getText("Claimed"));
					this.getModel("LocalDataModel").setProperty("/UploadEnable", false);

				} else if (this.claimType === "ZPMS") {
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
					this.getView().getModel("multiHeaderConfig").setProperty("/RepAmountCol", true);
					// this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", false);
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
					this.getView().byId("textHeaderLabel").setText(this.oBundle.getText("Claimed"));
					this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
					//console.log(oEvent.getParameters().selectedItem.getText() + "PMS");
				} else if (this.claimType === "ZPTS") {
					this.getView().byId("idPdcCode").setProperty("editable", false);
					this.getView().byId("idTCIWayBill").setProperty("editable", true);

					this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", true);
					this.getModel("LocalDataModel").setProperty("/UploadEnable", false);

					// console.log(oEvent.getParameters().selectedItem.getText() + "PTS");
					this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartV", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberRcV", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartDescriptionOrdRcv", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/RepairAmtV", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/RepAmountCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartRepCol", false);
					// this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 6);
					this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", true);
					this.getView().byId("textHeaderLabel").setText(this.oBundle.getText("Claimed"));

				} else if (this.claimType === "ZPPD") {
					// console.log(oEvent.getSource().getProperty("value") + "ZPPD");
					this.getView().byId("idPdcCode").setProperty("editable", false);
					this.getView().byId("idTCIWayBill").setProperty("editable", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/OrderedPartDesc", false);

					this.getView().getModel("multiHeaderConfig").setProperty("/partDamage", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/partMiscellanious", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/partDiscrepancies", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/partTransportation", false);
					this.getModel("LocalDataModel").setProperty("/UploadEnable", false);

					this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 6);
					this.getView().getModel("multiHeaderConfig").setProperty("/uploader", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartV", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartNumberRcV", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartDescriptionOrdRcv", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/RepairAmtV", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/RepAmountCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/PartRepCol", false);
					// this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcEdt", false);
					// this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", true);
					this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", false);
					this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", false);
					this.getView().byId("textHeaderLabel").setText(this.oBundle.getText("Received"));
				}

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
						// this.getModel("LocalDataModel").setProperty("/PartDetailList", data.results[0].to_claimitem.results);
						console.log(data.results);
						console.log("oFilteredDealerData", oFilteredDealerData);
						var HeadSetData = new sap.ui.model.json.JSONModel(data.results[0]);
						HeadSetData.setDefaultBindingMode("TwoWay");
						this.getView().setModel(HeadSetData, "HeadSetData");
						this.ClaimStatus = data.results[0].DecisionCode;
						console.log("this.ClaimStatus", this.ClaimStatus);
						/*Uncomment for security*/
						if (userScope == "ReadOnlyViewAll") {
							this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
						} else {
							/*Uncomment for security*/
							if (this.ClaimStatus == "ZTRC" || this.ClaimStatus == "ZTIC") {
								//code here
								this.getView().getModel("DateModel").setProperty("/oFormEdit", true);
								this.getModel("LocalDataModel").setProperty("/UploadEnableHeader", true);
							} else {
								this.getView().getModel("DateModel").setProperty("/oFormEdit", false);
								this.getModel("LocalDataModel").setProperty("/UploadEnableHeader", false);
							}
							/*Uncomment for security*/
						}
						/*Uncomment for security*/

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
						var oArr = odata.results;
						var oAttachSet = oArr.map(function (item) {
							item.FileName = item.FileName.replace("HEAD@@@", "");
							return item;

						});
						// this.getView().getModel("ClaimModel").setProperty("/" + "/items", odata.results);
						this.getModel("LocalDataModel").setProperty("/PartHeadAttachData", oAttachSet);
						// this.getModel("LocalDataModel").setProperty("/partItemAttachments", odata.results);
						// this.getView().getModel("ClaimModel").setProperty("/" + "/items", odata.results);
					}, this)
				});
				this._fnClaimSum();

				this.getView().byId("idFilter02").setProperty("enabled", true); //make it false before deploying/committing
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idFilter04").setProperty("enabled", false);

			} else {
				this.getModel("LocalDataModel").setProperty("/UploadEnableHeader", true);
				this.getModel("LocalDataModel").setProperty("/step01Next", false);
				this.getModel("ProssingModel").refresh();
				this.getModel("LocalDataModel").setProperty("/PricingDataModel", "");
				// this.getView().getModel("ClaimModel").setProperty("/" + "/items", "");
				this.getModel("LocalDataModel").setProperty("/PartHeadAttachData", "");
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

				this.getView().byId("idFilter02").setProperty("enabled", false); //make it false before deploying/committing
				this.getView().byId("idFilter03").setProperty("enabled", false);
				this.getView().byId("idFilter04").setProperty("enabled", false);
			}
			this.getView().setModel(HeadSetData, "HeadSetData");
			this.getView().byId("idPartClaimIconBar").setSelectedKey("Tab1");
			// this._getBPList();
		},

		onReceivedDateChange: function (oReceivedDate) {
			// debugger;
			var receivedDate = new Date(oReceivedDate.getParameters().newValue);
			if (this.getView().getModel("HeadSetData").getProperty("/DeliveryDate") > receivedDate) {
				this.getView().getModel("DateModel").setProperty("/SaveClimBTN", false);
				MessageToast.show(this.oBundle.getText("receivedDateErrMSG"));
			} else if (this.getView().getModel("HeadSetData").getProperty("/DeliveryDate") <= receivedDate) {
				this.getView().getModel("DateModel").setProperty("/SaveClimBTN", true);
			}
		},

		onAddPartsComment: function () {
			var oDialogBox = sap.ui.xmlfragment("zclaimProcessing.view.fragments.ClaimComments", this);
			this.getView().addDependent(oDialogBox);
			oDialogBox.open();
		},

		onEnterComment: function () {
			var oPrevComment = this.getView().getModel("HeadSetData").getProperty("/HeadText");
			var oPartner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd HH:mm:ss"
			});
			var oDate = oDateFormat.format(new Date());
			var oText = this.getView().getModel("HeadSetData").getProperty("/NewText");

			var oBusinessModel = this.getModel("ApiBusinessModel");
			oBusinessModel.read("/A_BusinessPartner", {
				urlParameters: {
					"$filter": "BusinessPartner eq '" + oPartner + "'"
				},
				success: $.proxy(function (data) {
					var oPartnerName = data.results[0].OrganizationBPName1;
					//var oFinalText = `${oPrevComment} \n  ${oPartnerName} ( ${oDate} ) ${oText}`;
					var oFinalText = oPrevComment + "\n" + oPartnerName + "(" + oDate + ") " + " : " + oText;
					this.getView().getModel("HeadSetData").setProperty("/HeadText", oFinalText);
					this.getView().getModel("HeadSetData").setProperty("/NewText", "");
					// console.log(oFinalText);
				}, this)
			});
		},

		onCloseComment: function (oEvent) {
			oEvent.getSource().getParent().getParent().getParent().getParent().getParent().close();
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
				if (this.obj != undefined) {
					this.obj.NumberOfWarrantyClaim = oClaimNum;
					this.claimType = this.obj.WarrantyClaimType;
				}

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
					if (this.getModel("LocalDataModel").getProperty("/partItemAttachments") != undefined && this.getModel("LocalDataModel").getProperty(
							"/partItemAttachments") != "") {
						// this.URI = this.getModel("LocalDataModel").getProperty("/partItemAttachments")[0].URI;
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
									// "URI": this.getModel("LocalDataModel").getProperty("/partItemAttachments")[0].URI
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

										// var DiscreCode = oFilteredData[0].DiscreCode;
										// console.log("claim type", that.claimType);
										// console.log("DiscreCode", DiscreCode);
										for (var m = 0; m < oFilteredData.length; m++) {
											if (oFilteredData[m].ALMDiscreDesc != undefined || oFilteredData[m].ALMDiscreDesc != "") {
												oFilteredData[m].ALMDiscreDesc = oFilteredData[m].ALMDiscreDesc.split("-")[1];
											}
											oFilteredData[m].quant2 = oFilteredData[m].quant;
										}
										this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);

										this.getView().getModel("DateModel").setProperty("/partLine", false);
										this.getModel("LocalDataModel").setProperty("/UploadEnable", false);
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
										this.getModel("LocalDataModel").setProperty("/partItemAttachments", "");
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
					} else {
						MessageToast.show("Attachment is required.");
					}
				} else {
					if (this.addPartFlag == true || this.updatePartFlag == true) {
						console.log("descrecode for part item", this.getView().getModel("PartDataModel").getProperty("/DiscreCode"));
						if (this.getView().getModel("PartDataModel").getProperty("/DiscreCode") == "4A") {
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
								// "URI": this.getModel("LocalDataModel").getProperty("/partItemAttachments/0/URI"),
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
											this.getModel("LocalDataModel").setProperty("/partItemAttachments", "");
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
					text: _that.oBundle.getText("SendLOIConfirm1") + this.getView().getModel("LOIDataModel").getProperty(
						"/CarrierName") + _that.oBundle.getText("SendLOIConfirm2")
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
									"Partner": this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey"),
									"DealershipName": "",
									"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
									"CarrierName": this.getView().getModel("LOIDataModel").getProperty("/CarrierName"),
									"CarrierAddrnumber": "",
									"ReferenceDate": this._fnDateFormat(new Date()),
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
										MessageToast.show(_that.oBundle.getText("LOISuccessMSG"));
										this.getView().getModel("DateModel").setProperty("/oLetterOfIntent", false);
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
										this.getView().getModel("DateModel").setProperty("/oLetterOfIntent", false);
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
			console.log("Start Validations");

			if (this.getView().getModel("LOIDataModel").getProperty("/Address1") == "") {
				// this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				// this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				// this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				var valid1 = true;
			}

			if (this.getView().getModel("LOIDataModel").getProperty("/DeliveryDateLOI") === null && this.getView().getModel("LOIDataModel").getProperty(
					"/DeliveryDateLOI") == "") {
				// this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				// this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				var valid2 = true;
			}

			if (this.getView().getModel("LOIDataModel").getProperty("/ursTrulyText") == "") {
				// this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				// this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				var valid3 = true;
			}

			if (this.getView().getModel("LOIDataModel").getProperty("/estClaimValueLOI") == "") {
				// this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				// this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				var valid4 = true;
				// this._openDialog02();
			}
			if (this.getView().getModel("LOIDataModel").getProperty("/LOIEmail") == "") {
				// this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				// this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
				var valid5 = true;
				// this._openDialog02();
			}
			if (this.getView().getModel("LOIDataModel").getProperty("/DateLOI") == "") {
				// this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			} else {
				var valid6 = true;
				// this._openDialog02();
			}
			if (valid1 == true && valid2 == true && valid3 == true && valid4 == true && valid5 == true && valid6 == true) {
				this._openDialog02();
				oEvent.getSource().getParent().getParent().close();
				oEvent.getSource().getParent().getParent().destroy();
				this.getView().getModel("DateModel").setProperty("/partTypeState", "None");
			} else {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().getModel("DateModel").setProperty("/partTypeState", "Error");
			}
		},

		onRadioChangeEN: function (oEN) {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			// this.oBundle.getText("Damage")
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
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var that = this;
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
					MessageToast.show(that.oBundle.getText("LOISuccessMSG"));
				}, this),
				error: function (err) {
					console.log(err);
					var err = JSON.parse(err.responseText);
					var msg = err.error.message.value;
					MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
				}
			});
			// }
		},
		onPressLetterOfIntent: function () {
			console.log("oFilteredDealerData", oFilteredDealerData);
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
			this.getModel("LocalDataModel").setProperty("/UploadEnable", true);
			this.getView().getModel("DateModel").setProperty("/saveParts", true);
			this.getView().getModel("DateModel").setProperty("/oLetterOfIntent", false);
			this.addPartFlag = true;
		},

		onDDChange: function (oEventVal) {
			this.optionChanged = true;
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
			this.updatePartFlag = true;
			// this.getView().getModel("DateModel").setProperty("/saveParts", true);
			var oTable = this.getView().byId("partTable");
			var oTableIndex = oTable._aSelectedPaths;
			var oPartNo = this.getView().getModel("PartDataModel").getProperty("/matnr");

			if (oTableIndex.length == 1) {
				var oSelectedRow = oTableIndex.toString();
				var obj = this.getModel("LocalDataModel").getProperty(oSelectedRow);
				console.log("update this obj", obj);
				var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
				var oClaimModel = this.getModel("ProssingModel");
				oClaimModel.refreshSecurityToken();

				var PartNum = obj.ItemKey;
				if (this.claimType == "ZPPD") {
					// var PartQt = obj.QuantityOrdered;
					var str1 = obj.PartDescription.split("Ordered: ");
					var str2 = str1[1].split("Received: ");
					var str3 = obj.quant2.split("Ordered: ");
					var str4 = str3[1].split("Received: ");

					if (obj.DiscreCode == "4A") {
						var PartNum2 = obj.WrongPart;
						this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", PartNum2);
						this.getView().getModel("HeadSetData").setProperty("/PartNumberRcDesc", str2[1]);
					} else {
						this.getView().getModel("HeadSetData").setProperty("/PartNumberRc", PartNum);
						this.getView().getModel("HeadSetData").setProperty("/PartNumberRcDesc", str2[0]);
					}
					this.getView().getModel("PartDataModel").setProperty("/quant", str4[0]);
					this.getView().getModel("PartDataModel").setProperty("/PartDescription", str2[0]);
					this.getView().getModel("PartDataModel").setProperty("/QuantityReceived", str4[1]);
					this.getView().getModel("PartDataModel").setProperty("/LineNo", obj.LineRefnr);
					this.getView().getModel("PartDataModel").setProperty("/matnr", PartNum);
					this.getView().getModel("DateModel").setProperty("/partLine", true);
					this.getView().getModel("PartDataModel").setProperty("/DiscreCode", obj.DiscreCode);
					this.getView().getModel("HeadSetData").setProperty("/DiscrepancyCodes", obj.DiscreCode);
					this.getView().getModel("PartDataModel").setProperty("/ALMDiscreDesc", obj.ALMDiscreDesc.split("-")[1]);
					if (obj.RetainPart == "Y") {
						this.getView().getModel("PartDataModel").setProperty("/RetainPart", "Yes");
					} else if (obj.RetainPart == "N") {
						this.getView().getModel("PartDataModel").setProperty("/RetainPart", "No");
					}
				} else {
					this.getView().getModel("PartDataModel").setProperty("/quant", obj.quant);
					this.getView().getModel("PartDataModel").setProperty("/PartDescription", obj.PartDescription);
					this.getView().getModel("PartDataModel").setProperty("/QuantityReceived", obj.QuantityReceived);

					this.getView().getModel("PartDataModel").setProperty("/LineNo", obj.LineRefnr);
					this.getView().getModel("PartDataModel").setProperty("/matnr", PartNum);
					this.getView().getModel("DateModel").setProperty("/partLine", true);
					this.getView().getModel("PartDataModel").setProperty("/DiscreCode", obj.DiscreCode);
					if (obj.RetainPart == "Y") {
						this.getView().getModel("PartDataModel").setProperty("/RetainPart", "Yes");
					} else if (obj.RetainPart == "N") {
						this.getView().getModel("PartDataModel").setProperty("/RetainPart", "No");
					}
					// this.getView().getModel("PartDataModel").setProperty("/RetainPart", obj.RetainPart);
					if (obj.ALMDiscreDesc != undefined) {
						this.getView().getModel("PartDataModel").setProperty("/ALMDiscreDesc", obj.ALMDiscreDesc.split("-")[1]);
					}
					if (obj.PartRepaired == "Y") {
						this.getView().getModel("HeadSetData").setProperty("/PartRepaired", "Yes");
					} else {
						this.getView().getModel("HeadSetData").setProperty("/PartRepaired", "No");
					}
					this.getView().getModel("HeadSetData").setProperty("/RepairAmount", obj.RepairAmt);
					this.getView().getModel("HeadSetData").setProperty("/DamageCondition", obj.DiscreCode);
					this.getView().getModel("HeadSetData").setProperty("/MiscellaneousCode", obj.DiscreCode);
					this.getView().getModel("HeadSetData").setProperty("/TranportShortageType", obj.DiscreCode);

					var oFile = obj.URI.split(",")[1].split("=")[1].split(")")[0];
					var oFileReplaced = oFile.replace(/'/g, "");

					oClaimModel.read("/zc_claim_partattachmentSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'PART' and FileName eq'" + oFileReplaced + "'"
						},
						success: $.proxy(function (odata) {
							var oAttachSet = odata.results.map(function (item) {
								item.FileName = item.FileName.replace(oPartNo + "@@@", "");
								return item;

							});
							this.getModel("LocalDataModel").setProperty("/partItemAttachments", oAttachSet);
							this.getView().getModel("AttachmentModel").setProperty("/" + "/items", oAttachSet);
							// this.getModel("LocalDataModel").setProperty("/partItemAttachments", oAttachSet);
						}, this)
					});
				}

				var oIndex = oTableIndex.toString().split("/")[2];

				this.obj.zc_itemSet.results.splice(oIndex, 1);

				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						// oClaimModel.read("/zc_claim_item_price_dataSet", {
						// 	urlParameters: {
						// 		"$filter": "NumberOfWarrantyClaim eq '" + this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
						// 			"'and LanguageKey eq 'E'"
						// 	},
						// 	success: $.proxy(function (pricedata) {
						var pricingData = response.data.zc_claim_item_price_dataSet.results;
						var oFilteredData = pricingData.filter(function (val) {
							return val.ItemType === "MAT";
						});
						console.log(oFilteredData);
						for (var m = 0; m < oFilteredData.length; m++) {
							oFilteredData[m].ALMDiscreDesc = oFilteredData[m].ALMDiscreDesc.split("-")[1];
						}
						this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
						this.getView().getModel("DateModel").setProperty("/saveParts", true);
						this._fnClaimSum();
						// 	}, this),
						// 	error: function (err) {
						// 		console.log(err);
						// 	}
						// });
					}, this),
					error: function (err) {
						console.log(err);
						var err = JSON.parse(err.responseText);
						var msg = err.error.message.value;
						MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
					}
				});
			} else {
				MessageToast.show("Please select 1 row.");
				oTable.removeSelections("true");
			}
		},

		onPressDeletePart: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var that = this;
			var oTable = this.getView().byId("partTable");
			var oTableIndex = oTable._aSelectedPaths;
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			if (this.URI != undefined) {
				if (this.claimType != "ZPPD") { //this.getModel("LocalDataModel").getProperty(oPath)
					var oFile = this.URI.split(",")[1].split("=")[1].split(")")[0];
					var oFileReplaced = oFile.replace(/'/g, "");
				}
			}

			if (oTableIndex.length == 1) {
				var oIndex = oTable._aSelectedPaths.toString().split("/")[2];
				this.obj.zc_itemSet.results.splice(oIndex, 1);

				var oClaimModel = this.getModel("ProssingModel");

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
								for (var m = 0; m < oFilteredData.length; m++) {
									oFilteredData[m].ALMDiscreDesc = oFilteredData[m].ALMDiscreDesc.split("-")[1];
								}
								this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
								oTable.removeSelections("true");
								MessageToast.show(that.oBundle.getText("ClaimDeleteMSG"));
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
						console.log(err);
						var err = JSON.parse(err.responseText);
						var msg = err.error.message.value;
						MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
					}
				});
				oClaimModel.refreshSecurityToken();
				var itemObj = {
					"NumberOfWarrantyClaim": oClaimNum,
					"COMP_ID": oFileReplaced,
					"DBOperation": "DELT"
				};
				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_claim_attachmentsSet", itemObj, {
					success: $.proxy(function () {
						oClaimModel.refresh();
						oClaimModel.read("/zc_claim_attachmentsSet", { //and AttachLevel eq 'HEAD'
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
							},
							success: $.proxy(function (odata) {
								this.getModel("LocalDataModel").setProperty("/partItemAttachments", odata.results);
								// this.getView().getModel("AttachmentModel").setProperty("/" + "/items", odata.results);
							}, this)
						});
						MessageToast.show(that.oBundle.getText("FileDeleteMSG"));
					}, this)
				});
			} else {
				MessageToast.show(that.oBundle.getText("MandatorySelectText"));
				oTable.removeSelections("true");
			}
		},

		//To fetch Claims Account Summary
		_fnClaimSum: function (e) {
			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.read("/ZC_CLAIM_SUM(p_clmno='" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") + "')/Set", {
				success: $.proxy(function (data) {
					var oFilteredData = data.results.filter(function (val) {
						return val.ItemType === "MAT" || val.ItemType === "TOTL";
					});
					this.getModel("LocalDataModel").setProperty("/ClaimSum", oFilteredData);

				}, this)
			});
		},

		// getCurrentLocationText: function () {
		// 	// Remove the previously added number of items from the currentLocationText in order to not show the number twice after rendering.
		// 	var sText = this.oBreadcrumbs.getCurrentLocationText().replace(/\s\([0-9]*\)/, "");
		// 	return sText;
		// },

		// getCurrentLocationText01: function () {
		// 	// Remove the previously added number of items from the currentLocationText in order to not show the number twice after rendering.
		// 	var sText = this.oBreadcrumbs01.getCurrentLocationText().replace(/\s\([0-9]*\)/, "");
		// 	return sText;
		// },

		// getCurrentFolderPath: function () {
		// 	var aHistory = this.getView().getModel("ClaimModel").getProperty("/partsHistory");
		// 	// get the current folder path
		// 	var sPath = aHistory.length > 0 ? aHistory[aHistory.length - 1].path : "/";
		// 	return sPath;
		// },

		_getDropDownData: function (oClaimType) {
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = (window.location.search.match(/language=([^&]*)/i)[1]).toUpperCase();
			} else {
				sSelectedLocale = "EN"; // default is english
			}

			console.log("claimType", oClaimType);
			//zc_discre_codesSet?$filter=ClaimType eq 'ZPDC' and LanguageKey eq 'E'&$format=json
			var oClaimModel = this.getModel("ProssingModel");
			oClaimModel.refreshSecurityToken();
			oClaimModel.read("/zc_discre_codesSet", {
				urlParameters: {
					"$filter": "ClaimType eq'" + oClaimType + "'and LanguageKey eq '" + sSelectedLocale + "'"
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
				this.getView().getModel("multiHeaderConfig").setProperty("/RepAmountCol", true);
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
				this.getView().byId("textHeaderLabel").setText(this.oBundle.getText("Claimed"));

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
				this.getView().getModel("multiHeaderConfig").setProperty("/RepAmountCol", true);
				// this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", false);
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
				this.getView().byId("textHeaderLabel").setText(this.oBundle.getText("Claimed"));
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
				this.getView().getModel("multiHeaderConfig").setProperty("/RepairAmtV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/RepAmountCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepCol", false);
				// this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/uploader", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/multiheader5", 6);
				this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", true);
				this.getView().byId("textHeaderLabel").setText(this.oBundle.getText("Claimed"));

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
				this.getView().getModel("multiHeaderConfig").setProperty("/RepAmountCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepaired", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/PartRepCol", false);
				// this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcEdt", false);
				// this.getView().getModel("multiHeaderConfig").setProperty("/DealerNetPrcV", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/AttachmentCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/RetainPartCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/DiscrepancyCol", true);
				this.getView().getModel("multiHeaderConfig").setProperty("/DamageConditionCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/MiscellaneousCol", false);
				this.getView().getModel("multiHeaderConfig").setProperty("/TransportCol", false);
				this.getView().byId("textHeaderLabel").setText(this.oBundle.getText("Received"));
			}
		},

		onBeforeUpload: function () {

		},

		onUploadChangeParts: function (oEvent) {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var that = this;
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
				MessageToast.show(that.oBundle.getText("AttachmentMSG"));
			}
		},

		onSelectUpload: function (oEvent) {
			console.log(OEvent);
		},
		onUploadCompleteParts: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var fileType = this.oUploadedFile.type;
			// var oUploadedFileArr = this.oUploadedFile.name.split(".").reverse();
			// var oFileExt = oUploadedFileArr[0].length;
			// var oFileName = "";
			//oFileName = this.oUploadedFile.name.replace("." + oFileExt, "");
			// if (oFileExt > 3) {
			// oFileName = this.oUploadedFile.name.slice(0, -1);
			// } else {
			var oFileName = this.oUploadedFile.name;
			// }
			var fileNamePrior = "HEAD@@@" + oFileName;
			var fileName = fileNamePrior; // .toUpperCase();
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
				"COMP_ID": fileName,
				"ContentLine": this.oBase,
				"Mimetype": fileType,
				"URI": oURI,
				"AttachLevel": "HEAD"
			};

			this.obj.zc_claim_attachmentsSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					MessageToast.show(oBundle.getText("SuccesFullyUploaded"));
					this.obj.zc_claim_attachmentsSet.results.pop();
					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
						},
						//	startswith(CompanyName, 'Alfr') eq true
						success: $.proxy(function (odata) {
							var oArr = odata.results;
							var oAttachSet = oArr.map(function (item) {
								item.FileName = item.FileName.replace("HEAD@@@", "");
								return item;

							});
							this.getModel("LocalDataModel").setProperty("/PartHeadAttachData", oAttachSet);
						}, this)
					});

				}, this),
				error: function (err) {
					console.log(err);
				}
			});
		},

		getCurrentFolderPath02: function () {
			var aHistory = this.getView().getModel("LocalDataModel").getProperty("/partsHistory");
			// get the current folder path
			var sPath = aHistory.length > 0 ? aHistory[aHistory.length - 1].path : "/";
			return sPath;
		},

		onUploadComplete02Parts: function (oEvent) {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oPartNo = this.getView().getModel("PartDataModel").getProperty("/matnr");
			var fileType = this.oUploadedFile.type;
			// var oUploadedFileArr = this.oUploadedFile.name.split(".").reverse();
			// var oFileExt = oUploadedFileArr[0].length;
			// var oFileName = "";
			//oFileName = this.oUploadedFile.name.replace("." + oFileExt, "");
			// if (oFileExt > 3) {
			// 	oFileName = this.oUploadedFile.name.slice(0, -1);
			// } else {
			var oFileName = this.oUploadedFile.name;
			// }
			var fileNamePrior = oPartNo + "@@@" + oFileName;
			var fileName = fileNamePrior; //.toUpperCase();
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var isProxy = "";
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			var oURI = isProxy + "/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + fileName +
				"')/$value";

			if (oURI === null) {
				console.log("Error");
				MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
			}
			console.log(oURI);

			var itemObj = {
				"NumberOfWarrantyClaim": oClaimNum,
				"ContentLine": this.oBase,
				"COMP_ID": fileName,
				"Mimetype": fileType,
				"URI": oURI,
				"AttachLevel": "PART",
				"DBOperation": "POST"
			};

			var oClaimModel = this.getModel("ProssingModel");

			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_claim_attachmentsSet", itemObj, {
				success: $.proxy(function (data, response) {

					MessageToast.show(oBundle.getText("SuccesFullyUploaded"));
					//    var oFileName = "sub" + fileName;
					oClaimModel.read("/zc_claim_partattachmentSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'PART' and FileName eq'" + fileName + "'"
						},
						success: $.proxy(function (odata) {
							var oAttachSet = odata.results.map(function (item) {
								item.FileName = item.FileName.replace(oPartNo + "@@@", "");
								return item;

							});
							this.getModel("LocalDataModel").setProperty("/partItemAttachments", oAttachSet);
							this.getView().getModel("AttachmentModel").setProperty("/" + "/items", oAttachSet);
							// this.getModel("LocalDataModel").setProperty("/partItemAttachments", oAttachSet);
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
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("ProssingModel");

			var oLine = oEvent.getSource()._oItemForDelete._iLineNumber;
			var oFileName = this.getModel("LocalDataModel").getProperty("/PartHeadAttachData/" + oLine + "/FileName");
			var oFileToDelete = "HEAD@@@" + oFileName;

			oClaimModel.refreshSecurityToken();

			oClaimModel.remove("/zc_claim_attachmentsSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + oFileToDelete + "')", {
				method: "DELETE",
				success: $.proxy(function () {
					MessageToast.show(oBundle.getText("Filedeletedsuccessfully"));
					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
						},

						success: $.proxy(function (odata) {
							var oArr = odata.results;
							var oAttachSet = oArr.map(function (item) {
								item.FileName = item.FileName.replace("HEAD@@@", "");
								return item;

							});
							// this.getView().getModel("ClaimModel").setProperty("/" + "/items", oArr);
							this.getModel("LocalDataModel").setProperty("/PartHeadAttachData", oAttachSet);

						}, this)
					});
				}, this)
			});
		},
		onFileDeleted02: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oPartNo = this.getView().getModel("PartDataModel").getProperty("/matnr");
			var oFileName = oEvent.getParameters().item.getFileName();
			var oFileDeleteName = oPartNo + "@@@" + oFileName;
			var oClaimModel = this.getModel("ProssingModel");

			oClaimModel.refreshSecurityToken();
			oClaimModel.remove("/zc_claim_attachmentsSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + oFileDeleteName + "')", {
				method: "DELETE",
				success: $.proxy(function () {
					MessageToast.show(oBundle.getText("Filedeletedsuccessfully"));
					oClaimModel.read("/zc_claim_partattachmentSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq'" + oClaimNum + "'and AttachLevel eq 'PART' and FileName eq'" + oFileDeleteName +
								"'"
						},
						success: $.proxy(function (odata) {
							var oAttachSet = odata.results.map(function (item) {
								item.FileName = item.FileName.replace(oPartNo + "@@@", "");
								return item;

							});
							this.getModel("LocalDataModel").setProperty("/partItemAttachments", oAttachSet);
						}, this)
					});
				}, this)
			});
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

		onSaveClaim: function () {
			var that = this;
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			if (oClaimNum != "nun" && oClaimNum != undefined) {
				that._fnUpdateClaimParts();
			} else {
				that._fnSaveClaimParts();
			}
		},

		_fnUpdateClaimParts: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var that = this;
			var oClaimModel = this.getModel("ProssingModel");
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");

			var oActionCode = "";
			oClaimModel.read("/zc_claim_item_price_dataSet", {
				urlParameters: {
					"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "' "
				},
				success: $.proxy(function (data) {
					var pricingData = data.results;
					var oFilteredData = pricingData.filter(function (val) {
						return val.ItemType === "MAT";
					});

					this.getModel("LocalDataModel").setProperty("/PricingDataModel", oFilteredData);
					var PartItem = oFilteredData.map(function (item) {
						// if (item.RepairOrRetrunPart == "Yes") {
						// 	var RepairPart = "Y";
						// } else {
						// 	RepairPart = "N";
						// }
						if (item.RetainPart == "Yes") {
							var RetainPart = "Y";
						} else if (item.RetainPart == "No") {
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
							RepairAmount: item.RepairAmt
						};
					});

					this.obj = {
						"DBOperation": "SAVE",
						"Message": "",
						"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
						"Partner": this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey"),
						"ActionCode": oActionCode,
						"NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
						"PartnerRole": "AS",
						"ReferenceDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ReferenceDate")),
						"DateOfApplication": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DateOfApplication")),
						"TCIWaybillNumber": this.getView().getModel("HeadSetData").getProperty("/TCIWaybillNumber"),
						"ShipmentReceivedDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate")),
						"DealerContact": this.getView().getModel("HeadSetData").getProperty("/DealerContact"),
						"HeadText": this.getView().getModel("HeadSetData").getProperty("/HeadText"),
						"Delivery": this.getView().getModel("HeadSetData").getProperty("/Delivery"),
						"DeliveryDate": this._fnDateFormat(this.getView().getModel("HeadSetData").getProperty("/DeliveryDate")),
						"DeliveringCarrier": this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier"),
						"zc_itemSet": {
							"results": PartItem
						},
						"zc_claim_attachmentsSet": {
							"results": []
						},
						"zc_claim_vsrSet": {
							"results": []
						},
						"zc_claim_item_price_dataSet": {
							"results": pricingData
						}
					};
					oClaimModel.refreshSecurityToken();
					oClaimModel.create("/zc_headSet", this.obj, {
						success: $.proxy(function (response) {
							MessageToast.show(that.oBundle.getText("ClaimUpdateMSG"));
							this.getModel("LocalDataModel").setProperty("/step01Next", true);
						}, this),
						error: function () {
							this.getModel("LocalDataModel").setProperty("/step01Next", false);
						}
					});

				}, this),
				error: function () {}
			});
		},

		_fnSaveClaimParts: function (oEvent) {
			//idClaimForm
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oClaimModel = this.getModel("ProssingModel");
			var oValidator = new Validator();
			var oCurrentDt = new Date();
			// var WarrantyClaimType = this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oValid = oValidator.validate(this.getView().byId("idClaimForm"));

			if (((this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier") == "") || (this.getView().getModel("HeadSetData").getProperty(
					"/DeliveringCarrier") == undefined)) && (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZPDC" ||
				this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZPTS")) {
				// if (!oValid) {
				// if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZPDC" || this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == "ZPTS") {
				// if (this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier") == undefined || this.getView().getModel("HeadSetData").getProperty("/DeliveringCarrier") == "") {
				this.getView().byId("idCarrierName").setValueState("Error");
				// }

				this.getModel("LocalDataModel").setProperty("/step01Next", false);
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);

				// if (this.getView().getModel("HeadSetData").getProperty("/DeliveryDate") == undefined || this.getView().getModel(
				// 		"HeadSetData").getProperty("/DeliveryDate") == "") {
				// 	this.getView().byId("idOutBoundDD").setValueState("Error");
				// }
				// if (this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate") == undefined || this.getView().getModel(
				// 		"HeadSetData").getProperty("/ShipmentReceivedDate") == "") {
				// 	this.getView().byId("idShipmentRDate").setValueState("Error");
				// }
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				return false;
			} else if (!oValid || (this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate") == undefined || this.getView().getModel(
					"HeadSetData").getProperty("/ShipmentReceivedDate") == "") && (this.getView().getModel("HeadSetData").getProperty("/DeliveryDate") ==
					undefined || this.getView().getModel("HeadSetData").getProperty("/DeliveryDate") == "")) {
				this.getModel("LocalDataModel").setProperty("/step01Next", false);
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);

				if (this.getView().getModel("HeadSetData").getProperty("/DeliveryDate") == undefined || this.getView().getModel(
						"HeadSetData").getProperty("/DeliveryDate") == "") {
					this.getView().byId("idOutBoundDD").setValueState("Error");
				}
				if (this.getView().getModel("HeadSetData").getProperty("/ShipmentReceivedDate") == undefined || this.getView().getModel(
						"HeadSetData").getProperty("/ShipmentReceivedDate") == "") {
					this.getView().byId("idShipmentRDate").setValueState("Error");
				}
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				this.getView().byId("idCarrierName").setValueState("None");
				return false;
			} else if (this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") == undefined && this.getView().getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "") {
				this.getView().byId("idMainClaimMessage").setProperty("visible", true);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
			} else if (oValid && this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType") != undefined && this.getView().getModel(
					"HeadSetData").getProperty("/WarrantyClaimType") != "") {
				this.getView().byId("idOutBoundDD").setValueState("None");
				this.getView().byId("idShipmentRDate").setValueState("None");
				this.getView().byId("idCarrierName").setValueState("None");
				if (this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") == undefined) {
					this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", "");
				}
				this.obj = {
					"DBOperation": "SAVE",
					"Message": "",
					// "NumberOfWarrantyClaim": this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim"),
					"WarrantyClaimType": this.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType"),
					"Partner": this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey"),
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
				var that = this;
				console.log("Data for saving claim", this.obj);
				oClaimModel.refreshSecurityToken();
				oClaimModel.create("/zc_headSet", this.obj, {
					success: $.proxy(function (data, response) {
						console.log("1st Response after claim is saved", data);
						MessageToast.show(that.oBundle.getText("ClaimSuccessMSG"));
						this.getModel("LocalDataModel").setProperty("/WarrantyClaimNum", response.data.NumberOfWarrantyClaim);
						// this.getModel("LOIDataModel").setProperty("/claimNumber", response.data.NumberOfWarrantyClaim);
						this._fnClaimSum();
						oClaimModel.read("/ZC_CLAIM_HEAD", {
							urlParameters: {
								"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
									"'"
							},
							success: $.proxy(function (sdata) {
								console.log("Response after claim is saved", sdata);
								this.getModel("LocalDataModel").setProperty("/ClaimDetails", sdata.results[0]);
								this.getView().getModel("HeadSetData").setData(sdata.results[0]);
								// var oCLaim = this.getModel("LocalDataModel").getProperty("/ClaimDetails/NumberOfWarrantyClaim");
								this.getView().getModel("HeadSetData").setProperty("/NumberOfWarrantyClaim", this.getModel("LocalDataModel").getProperty(
									"/WarrantyClaimNum"));
								this.getView().getModel("DateModel").setProperty("/saveParts", true);
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
				// this.getView().byId("idOutBoundDD").setValueState("None");
				// this.getView().byId("idShipmentRDate").setValueState("None");
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().getModel("DateModel").setProperty("/claimTypeEn", false);
				this.getModel("LocalDataModel").setProperty("/step01Next", true);
			}
		},

		onStep01Next: function (oEvent) {
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
				/*Uncomment for security*/
				if (userScope == "ReadOnlyViewAll") {
					this.getView().getModel("DateModel").setProperty("/submitTCIBtn", false);
					this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
				} else {
					/*Uncomment for security*/
					this.getView().getModel("DateModel").setProperty("/submitTCIBtn", true);
					this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
					/*Uncomment for security*/
				}
				/*Uncomment for security*/
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
				this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
				this.getView().getModel("DateModel").setProperty("/submitTCIBtn", false);
				this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
				this.getView().byId("idMainClaimMessage").setType("Error");
				return;
			}
			if (validator.isValid()) {
				/*Uncomment for security*/
				if (userScope == "ReadOnlyViewAll") {
					this.getView().getModel("DateModel").setProperty("/submitTCIBtn", false);
					this.getView().getModel("DateModel").setProperty("/SaveClaim07", false);
				} else {
					/*Uncomment for security*/
					this.getView().getModel("DateModel").setProperty("/submitTCIBtn", true);
					this.getView().getModel("DateModel").setProperty("/SaveClaim07", true);
					/*Uncomment for security*/
				}
				/*Uncomment for security*/
				this.getView().byId("idMainClaimMessage").setProperty("visible", false);
				this.getView().byId("idMainClaimMessage").setType("None");
				this.getView().byId("idFilter03").setProperty("enabled", true);
				this.getView().byId("idPartClaimIconBar").setSelectedKey("Tab3");
			}
		},
		onRevalidate: function () {
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
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
					text: that.oBundle.getText("RevalidateMSG")
				}),
				beginButton: new Button({
					text: 'Yes',
					press: $.proxy(function () {
						oClaimModel.create("/zc_headSet", this.obj, {
							success: function (data, response) {
								MessageToast.show(this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim") +
									"has been Saved successfully");
							},
							error: function () {
								MessageToast.show(that.oBundle.getText("ClaimNotSavedMSG"));
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
			this.oBundle = this.getView().getModel("i18n").getResourceBundle();
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
			// this.obj.NumberOfWarrantyClaim = oClaimNum;
			var oObj = {
				"NumberOfWarrantyClaim": this.obj.NumberOfWarrantyClaim,
				"POSNR": "",
				"NUMBER": "",
				"TYPE": "",
				"MESSAGE": ""
			};

			var that = this;

			// this.obj.zc_claim_vsrSet.results.push(oObj);
			this.obj.zc_claim_vsrSet.results.push(oObj);
			// 
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			//var that = this;
			var dialog = new Dialog({
				title: "Submit Claim to TCI",
				type: "Message",
				content: new Text({
					text: that.oBundle.getText("TCISubmitConfirmMSG")
				}),

				buttons: [
					new Button({
						text: "Yes",
						press: $.proxy(function () {
							oClaimModel.refreshSecurityToken();
							oClaimModel.create("/zc_headSet", this.obj, {
								success: $.proxy(function (data, response) {
									this.getModel("LocalDataModel").setProperty("/oErrorSet", response.data.zc_claim_vsrSet.results);
									this.obj.zc_claim_vsrSet.results.pop(oObj);
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
									dialog.close();
									console.log("Error in submitting claim to TCI", err);
									this.getView().byId("idFilter04").setProperty("enabled", false);

									var err = JSON.parse(err.responseText);
									var msg = err.error.message.value;
									MessageBox.show(msg, MessageBox.Icon.ERROR, "Error", MessageBox.Action.OK, null, null);
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
		},

		onStep07Back: function () {
			this.getView().byId("idFilter02").setProperty("enabled", true);
			this.getView().byId("idPartClaimIconBar").setSelectedKey("Tab2");
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

							if (!oValidator.isValid()) {

								//do something additional to drawing red borders? message box?
								this.getView().byId("idMainClaimMessage").setProperty("visible", true);
								this.getView().byId("idMainClaimMessage").setText("Please fill up all mandatory fields.");
								this.getView().byId("idMainClaimMessage").setType("Error");
								return;
							} else {}

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
			this.getView().byId("idCarrierName").setValueState("None");
		},

		onExit: function () {
			this.getModel("ProssingModel").refresh();
			this.getModel("LocalDataModel").setProperty("/PricingDataModel", "");
			this.getModel("LocalDataModel").setProperty("/PartHeadAttachData", "");
			// this.getView().getModel("ClaimModel").setProperty("/" + "/items", "");
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
			this.getModel("LocalDataModel").setProperty("/oErrorSet", "");
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
					"RepairOrRetrunPart": "",
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

	});
});