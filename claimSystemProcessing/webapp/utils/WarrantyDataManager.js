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
			"frn": [{
				"key": "01",
				"value": "S.O."
			}, {
				"key": "02",
				"value": "Divulgué"
			}, {
				"key": "03",
				"value": "Divulguera"
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
				enableVLC: false
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
				"DamageDisclosure": "",
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
		},
		_modelValidate: function (elm) {
			var aInputs;
			var oClmType = elm.getView().getModel("HeadSetData").getProperty("/WarrantyClaimType");
			var oClmSubType = elm.getView().getModel("HeadSetData").getProperty("/WarrantyClaimSubType");
			var oView = elm.getView();
			var clmGrp = elm.getModel("LocalDataModel").getProperty("/clmTypeGroup");
			var aInputsArr = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsArrCoreRet = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("idVinNum")
			];

			var aInputsArrZWAC = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("idAccDate"),
				oView.byId("idInsOdo"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsArrZWP2 = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("idPreInvNum"),
				oView.byId("idPrInvDate"),
				oView.byId("id_Date"),
				oView.byId("idRepairOrder"),

				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsArrZWP1 = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("idPreInvNum"),
				oView.byId("idPrInvDate"),
				oView.byId("id_Date"),
				oView.byId("idRepairOrder"),
				oView.byId("idPrvOdomtr"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsArrZWMS = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idRepairOrder"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsFieldAct = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idFieldActionInput"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsFieldActZCWE = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOFP"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idFieldActionInput"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsOECP = [
				oView.byId("idClaimType"),
				oView.byId("id_Date"),
				oView.byId("idDealerClaim"),
				oView.byId("idClientLastName"),
				oView.byId("idPostalCode"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idMainOps"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputVehiclLog = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("idDealerContact"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("iDdelivCarrier"),
				oView.byId("idProbill"),
				oView.byId("idDelivery"),
				oView.byId("idDeliveryDate"),
				oView.byId("idDmgCls")
				

			];

			var aInputsSETR = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idVinNum"),
				oView.byId("idFieldActionInput"),
				oView.byId("idMainOps"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputsZWVE = [
				oView.byId("idClaimType"),
				oView.byId("idDealerClaim"),
				oView.byId("id_Date"),
				oView.byId("idOdometer"),
				oView.byId("idRepairOrder"),
				oView.byId("idMainOps"),
				oView.byId("idVinNum"),
				oView.byId("idT1Field"),
				oView.byId("idT2Field"),
				oView.byId("idRemedy"),
				oView.byId("idCause"),
				oView.byId("idCondition")
			];

			var aInputSmartPart = [
				oView.byId("idDealerClaim"),

			];

			if (oClmSubType == "ZCER" || oClmSubType == "ZCLS" || oClmSubType == "ZCSR" || oClmType == "ZCER" || oClmType == "ZCLS" || oClmType ==
				"ZCSR") {
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idMainOps").addStyleClass("clNotReq");
				aInputs = aInputsFieldAct;
			} else if (oClmType == "ZCWE" || oClmSubType == "ZCWE") {
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				aInputs = aInputsFieldActZCWE;
			} else if (oClmType == "ZECP" || oClmSubType == "ZECP") {
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsOECP;
			} else if (oClmType == "ZSSE") {
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsSETR;
			} else if (oClmType == "ZLDC") {
				aInputs = aInputVehiclLog;
			} else if (oClmType == "ZWAC" || oClmSubType == "ZWAC" || oClmType == "ZWA1" || oClmSubType == "ZWA1") {
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idMainOps").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsArrZWAC;
			} else if (oClmType == "ZWP2" || oClmSubType == "ZWP2" || oClmType == "ZWA2" || oClmSubType == "ZWA2") {
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsArrZWP2;
			} else if (oClmType == "ZWP1" || oClmSubType == "ZWP1") {
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsArrZWP1;
			} else if (oClmType == "ZWMS" || oClmSubType == "ZWMS") {
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsArrZWMS;
			} else if (oClmType == "ZWVE" || oClmSubType == "ZWVE") {
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsZWVE;

			} else if (oClmType == "ZGGW" || oClmSubType == "ZGGW") {
				oView.byId("idMainOps").addStyleClass("clNotReq");
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				oView.byId("idDealerContact").setValueState("None");
				aInputs = aInputsArr;

			} else if (oClmType == "ZRCR") {
				oView.byId("idMainOps").addStyleClass("clNotReq");
				oView.byId("idOFP").addStyleClass("clNotReq");
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idFieldActionInput").addStyleClass("clNotReq");
				aInputs = aInputsArr;

			} else if (oClmType == "ZSCR") {
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				aInputs = aInputsArrCoreRet;
			} else if (oClmType == "ZSSM") {
				oView.byId("idDealerContact").addStyleClass("clNotReq");
				oView.byId("idRepairOrder").addStyleClass("clNotReq");
				aInputs = aInputSmartPart;
			}

			// if (oClmSubType == "ZCER" || oClmSubType == "ZCLS" || oClmSubType == "ZCSR" || oClmType == "ZCER" || oClmType == "ZCLS" || oClmType ==
			// 	"ZCSR") {
			// 	oView.byId("idOFP").addStyleClass("clNotReq");
			// 	oView.byId("idDealerContact").addStyleClass("clNotReq");
			// 	oView.byId("idMainOps").addStyleClass("clNotReq");
			// 	aInputs = aInputsFieldAct;
			// } else if (oClmType == "ZCWE" || oClmSubType == "ZCWE") {
			// 	oView.byId("idDealerContact").addStyleClass("clNotReq");
			// 	aInputs = aInputsFieldActZCWE;
			// } else if (clmGrp == "FAC") {
			// 	aInputs = aInputsFieldAct;
			// } else if (clmGrp == "ECP") {

			// 	oView.byId("idOFP").addStyleClass("clNotReq");
			// 	oView.byId("idDealerContact").addStyleClass("clNotReq");
			// 	oView.byId("idFieldActionInput").addStyleClass("clNotReq");
			// 	aInputs = aInputsOECP;
			// } else if (clmGrp == "STR") {
			// 	aInputs = aInputsSETR;
			// } else if (clmGrp == "VLC") {
			// 	aInputs = aInputVehiclLog;
			// } else if (oClmType == "ZWAC" || oClmSubType == "ZWAC") {
			// 	aInputs = aInputsArrZWAC;
			// } else if (oClmType == "ZWA1" || oClmSubType == "ZWA1") {
			// 	aInputs = aInputsArrZWAC;
			// } else if (oClmType == "ZWP2" || oClmSubType == "ZWP2") {
			// 	aInputs = aInputsArrZWP2;
			// } else if (oClmType == "ZWA2" || oClmSubType == "ZWA2") {
			// 	aInputs = aInputsArrZWP2;
			// } else if (oClmType == "ZWP1" || oClmSubType == "ZWP1") {
			// 	aInputs = aInputsArrZWP1;
			// } else if (oClmType == "ZWMS" || oClmSubType == "ZWMS") {
			// 	aInputs = aInputsArrZWMS;
			// } else if (oClmType == "ZWVE") {
			// 	oView.byId("idOFP").addStyleClass("clNotReq");
			// 	oView.byId("idDealerContact").addStyleClass("clNotReq");
			// 	oView.byId("idFieldActionInput").addStyleClass("clNotReq");
			// 	 aInputs = aInputsZWVE;
			// 	oView.byId("idFieldActionInput").setProperty("valueState", "None");
			// 	aInputs = aInputsZWVE;
			// } else if (clmGrp == "WTY") {
			// 	aInputs = aInputsArr;
			// } else if (clmGrp == "CRC") {
			// 	aInputs = aInputsArr;
			// } else if (clmGrp == "SCR") {
			// 	aInputs = aInputsArrCoreRet;
			// } else if (oClmType == "ZSSM") {
			// 	oView.byId("idDealerContact").addStyleClass("clNotReq");
			// 	oView.byId("idRepairOrder").addStyleClass("clNotReq");
			// 	aInputs = aInputSmartPart;
			// }
			return aInputs;

		},
		_fnSrNumVisible: function (elm, group, oClaimSelectedGroup) {
			if ((group == "WTY" || group == "ECP") && oClaimSelectedGroup != "Authorization") {
				elm.getView().getModel("DateModel").setProperty("/serialNoV", true);
			} else {
				elm.getView().getModel("DateModel").setProperty("/serialNoV", false);
			}
			
			if (group == "WTY"){
				elm.getView().getModel("HeadSetData").setProperty("/FieldActionReference", "");
			}
			
			if (group == "FAC"){
				elm.getView().getModel("HeadSetData").setProperty("/OFP", "");
			}
		}
	

	};

});