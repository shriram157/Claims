sap.ui.define([

], function () {
	"use strict";
	return {
		DamageDiscolsureData: {
			"eng": [{
				"key": "01",
				"value": "NA"
			}, {
				"key": "02",
				"value": "Have Disclosed"
			}, {
				"key": "03",
				"value": "Will Disclosed"
			}],
			"frn" : [{
				"key": "01",
				"value": "NA"
			}, {
				"key": "02",
				"value": "Avoir divulgué"
			}, {
				"key": "03",
				"value": "Sera divulgué"
			}]
			

		},
		PercentData: [{
			"num": "0%",
			"okey": "0"
		}, {
			"num": "5%",
			"okey": "5"
		}, {
			"num": "10%",
			"okey": "10"
		}, {
			"num": "15%",
			"okey": "15"
		}, {
			"num": "20%",
			"okey": "20"
		}, {
			"num": "25%",
			"okey": "25"
		}, {
			"num": "30%",
			"okey": "30"
		}, {
			"num": "35%",
			"okey": "35"
		}, {
			"num": "40%",
			"okey": "40"
		}, {
			"num": "45%",
			"okey": "45"
		}, {
			"num": "50%",
			"okey": "50"
		}, {
			"num": "55%",
			"okey": "55"
		}, {
			"num": "60%",
			"okey": "60"
		}, {
			"num": "65%",
			"okey": "65"
		}, {
			"num": "70%",
			"okey": "70"
		}, {
			"num": "75%",
			"okey": "75"
		}, {
			"num": "80%",
			"okey": "80"
		}, {
			"num": "85%",
			"okey": "85"
		}, {
			"num": "90%",
			"okey": "90"
		}, {
			"num": "95%",
			"okey": "95"
		}, {
			"num": "100%",
			"okey": "100"
		}],
		fnDateModel: function (elm) {
			var oDateModel = new sap.ui.model.json.JSONModel();
			oDateModel.setData({
				minDate: new Date(1999, 1, 1),
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
				editablePartNumber: true,
				editableLabourNumber: true,
				editableSublNumber: true,
				oDamageLineBtn: false,
				damageLine: false,
				SuggestBtn: false,
				saveClaimSt: true,
				updateClaimSt: false,
				SaveClaim07: true,
				claimTypeEn: true,
				AcA1: false,
				P1p2: false,
				oFormEdit: true,
				claimEditSt: false,
				oztac: false,
				oFieldActionInput: false,
				updateEnable: true,
				OdometerReq: true,
				enableTab: false,
				RepairdDetailVisible: true,
				claimTypeState: "None",
				claimTypeState2: "None",
				warrantySubmissionClaim: false,
				LabourBtnVsbl: true,
				copyClaimEnable: false,
				authAcClm: false,
				authRejClm: false,
				ofpEnabled: true,
				enabledT2: true,
				enabledT1: true,
				oPrevInvNumReq: false,
				oPrevInvDateReq: false,
				oPrvOdomtrReq: false,
				DisableRadio: true,
				oBatteryTestEnable: true,
				commentEditable: false,
				ofpRequired: false,
				oDealerContactReq: false,
				oMainOps: true,
				foreignVinInd: false,
				writtenOffInd: false,
				specialVinInd: false,
				oMainOpsReq: false,
				oSlipVisible: false,
				oTciQtyAppr: false,
				oAddPartLine: true,
				oUpdatePartLine: true,
				authHide: false,
				oVisibleURL: "",
				nonVinHide: true,
				errorBusyIndicator: false,
				VisiblePageLine: false,
				oRadioVinIndex: 0,
				oVisibleRepDate: true,
				oVisibleReOrder: true,
				oOdoEnabled: true,
				OdometerReqMan: true,
				RadioSelectedOFP: false,
				NameOfPersonRespWhoChangedObj: "",
				ShipmentVisible: false,
				oECPfields: false,
				oRepOrdDateReq: true,
				oRepOrdReq: true,
				chngClaimTypeVisible: false,
				serialNoV: false,
				enableVLC:false
			});
			return elm.getView().setModel(oDateModel, "DateModel");
		},
		fnReturnObj: function (elm) {
			elm.obj = {
				"DBOperation": "SAVE",
				"NameOfPersonRespWhoChangedObj": "",
				"Message": "",
				"WarrantyClaimType": "",
				"WarrantyClaimSubType": "",
				"SerialNumber": "",
				"Partner": "",
				"PartnerRole": "",
				"ReferenceDate": null,
				"DateOfApplication": null,
				"FinalProcdDate": null,
				"RepairDate": null,
				"RepairOrderNumberExternal": "",
				"ExternalNumberOfClaim": "",
				"ExternalObjectNumber": "",
				"Odometer": "",
				"Delivery": "",
				"DeliveryDate": null,
				"TCIWaybillNumber": "",
				"ShipmentReceivedDate": null,
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
				"Remedy": "",
				"PreviousROInvoiceDate": null,
				"PreviousROOdometer": "",
				"PreviousROInvoice": "",
				"AccessoryInstallOdometer": "",
				"AccessoryInstallDate": null,
				"AgreementNumber": "",
				"CustomerPostalCode": "",
				"CustomerFullName": "",
				"zc_itemSet": {
					"results": []
				},
				"zc_item_subletSet": {
					"results": []
				},
				"zc_claim_item_labourSet": {
					"results": []
				},
				"zc_claim_item_paintSet": {
					"results": []
				},
				"zc_claim_attachmentsSet": {
					"results": []
				},
				"zc_claim_vsrSet": {
					"results": []
				},
				"zc_claim_item_price_dataSet": {
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
				}
			};
			return elm.obj;
		}

	};

});