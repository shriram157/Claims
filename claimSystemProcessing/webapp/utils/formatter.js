jQuery.sap.declare("zclaimProcessing.utils.formatter");
zclaimProcessing.utils.formatter = {

	fnFormatCustomer: function (val) {
		var sTrimval;

		if (val) {
			val.toString();
			sTrimval = val.substr(5);
			//console.log(sTrimval);

		}
		return sTrimval;
	},
	fnFormatPositionCode: function (val) {
		var oVal = "";
		if (val) {
			if (val.search("-") != -1) {
				val.toString();
				oVal = val.split("-")[4];
			} else {
				oVal = val;
			}
		}
		return oVal;
	},
	fnFormatter: function (text, key) {
		var sText = "";

		if (text && key) {
			sText += (text + " -" + key);
		} else if (text) {
			sText += text;
		} else if (key) {
			sText += key;
		}

		return sText;
	},
	fnSumExtendedVal: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].ExtendedValue)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnSumMarkUpVal: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].MarkUp)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnAmountClaimVal: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].AmtClaimed)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnAfterDiscVal: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].TotalAfterDisct)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnTCIAmtVal: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].TCIApprAmt)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnDiffVal: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].DiffAmt)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnClaimedHr: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].QtyHrs)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		return oNum;
	},
	fnAmountLabCLaim: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].AmtClaimed)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnTotalAfDisLab: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].TotalAfterDisct)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnHrApTCI: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].HoursApprovedByTCI)
				);

			}

			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		return oNum;
	},
	fnLabDif: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].DiffAmt)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnAmountSublet: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].AmtClaimed)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnTotalSubletAfDisc: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].TotalAfterDisct)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnTCISubletApr: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].TCIApprovedAmount)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnSubletDif: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].DiffAmt)
				);

			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;

					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			return "$" + oNum;
		}
	},
	fnFormatText: function (val) {
		var oText = "";
		if (val == "MAT") {
			oText = "Parts:";
		} else if (val == "FR") {
			oText = "Labour:";
		} else if (val == "SUBL") {
			oText = "Sublet:";
		} else if (val == "TOTL") {
			oText = "Total:";
		}
		return oText;
	},

	fnAmountRepairPW: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				if (sum[i].RepairAmt.length > 10) { //sum[i].RepairAmt.split("Received:")[1]
					oArr.push(parseFloat(sum[i].RepairAmt.split("Received:")[1]));
				} else {
					oArr.push(parseFloat(sum[i].RepairAmt));
				}
			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;
					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			oNum = Math.round(oNum * 100) / 100;
			return "$" + oNum.toFixed(2);
		}
	},
	fnAmountClaimedPW: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				if (sum[i].AmtClaimed.length > 10) { //sum[i].RepairAmt.split("Received:")[1]
					oArr.push(parseFloat(sum[i].AmtClaimed.split("Received:")[1]));
				} else {
					oArr.push(parseFloat(sum[i].AmtClaimed));
				}
			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;
					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			oNum = Math.round(oNum * 100) / 100;
			return "$" + oNum.toFixed(2);
		}
	},
	fnDifPW: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				if (sum[i].DiffAmt.length > 10) { //sum[i].RepairAmt.split("Received:")[1]
					oArr.push(parseFloat(sum[i].DiffAmt.split("Received:")[1]));
				} else {
					oArr.push(parseFloat(sum[i].DiffAmt));
				}
			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;
					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			oNum = Math.round(oNum * 100) / 100;
			return "$" + oNum.toFixed(2);
		}
	},
	fnTCIAprrovedPW: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				if (sum[i].TCIApprovedAmount.length > 10) { //sum[i].RepairAmt.split("Received:")[1]
					oArr.push(parseFloat(sum[i].TCIApprovedAmount.split("Received:")[1]));
				} else {
					oArr.push(parseFloat(sum[i].TCIApprovedAmount));
				}
				// oArr.push(
				// 	parseFloat(sum[i].TCIApprovedAmount)
				// );
			}
			if (oArr.length > 0) {
				oNum = oArr.reduce(
					function (a, b) {
						return a + b;
					}
				).toFixed(2);
			}
		}
		if (oNum == undefined) {

		} else {
			oNum = Math.round(oNum * 100) / 100;
			return "$" + oNum.toFixed(2);
		}
	},
	fnFormatDisplayDate: function (oDate) {
		jQuery.sap.require("sap.ui.core.format.DateFormat");
		var oDateFormatShort = sap.ui.core.format.DateFormat.getInstance({
			pattern: "YYYY-MM-dd"
		});
		return oDateFormatShort.format(new Date());
	},

	fnFormatPercent: function (val) {
		var oVal = "";
		//var ostring = "";
		if (val) {
			var orepMin = val.replace("-", "");
			var oValNum = parseInt(orepMin);
			oVal = oValNum + "%";
		} else {
			oVal = val;
		}

		return oVal;
	},

	fnFileName: function (val) {
		var oVal = "";
		if (val) {
			oVal = val.replace("HEAD+++", "");
		} else {
			oVal = val;
		}
		return oVal;
	},
	fnOdometer: function (oVal) {
		console.log(oVal);
		// var finalVal = "";
		// if (oVal) {

		// 	if (oVal.length > 6) {
		// 		finalVal = oVal.substr(0, 6);
		// 	} else {
		// 		finalVal = oVal;
		// 	}
		// } else {
		// 	finalVal = oVal;
		// }
		// return finalVal;
	},
	fnFormatDecimal: function (val) {
		var oNum;
		if (val) {
			oNum = parseFloat(val).toFixed(2);
		}
		return oNum;
	},

	roundedDecimals: function (oNumber) {
		if (oNumber !== null && oNumber != undefined && oNumber != "") {
			var oNumber1, oNumber2, oNum1, oNum2;
			if (oNumber.length > 10) {
				oNumber1 = parseFloat(oNumber.split("Received:")[1]);
				oNumber2 = parseFloat(oNumber.split("Received:")[1].split("Ordered:"));
				// var oNum;
				oNum1 = Math.round(oNumber1 * 100) / 100;
				oNum2 = Math.round(oNumber2 * 100) / 100;
				var finalNum = "Ordered: $" + oNum1.toFixed(2) + "\nReceived: $" + oNum2.toFixed(2);
				return finalNum;
			} else {
				oNumber = parseFloat(oNumber);
				var oNum;
				oNum = Math.round(oNumber * 100) / 100;
				return "$" + oNum.toFixed(2);
			}
		}
		// oNumber = parseFloat(oNumber);

	}

};