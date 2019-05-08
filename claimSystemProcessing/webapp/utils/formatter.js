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
					var num1 = parseFloat(sum[i].RepairAmt.split("Received:")[0].split("Ordered:")[1]);
					var num2 = parseFloat(sum[i].RepairAmt.split("Received:")[1]);
					oArr.push(num1 + num2);
					// oArr.push(parseFloat(sum[i].RepairAmt.split("Received:")[1]));
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
			return oNum.toFixed(2) + "$";
		}
	},
	fnAmountClaimedPW: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				if (sum[i].AmtClaimed.length > 10) { //sum[i].RepairAmt.split("Received:")[1]
					var num1 = parseFloat(sum[i].AmtClaimed.split("Received:")[0].split("Ordered:")[1]);
					var num2 = parseFloat(sum[i].AmtClaimed.split("Received:")[1]);
					oArr.push(num1 + num2);
					// oArr.push(parseFloat(sum[i].AmtClaimed.split("Received:")[1]));
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
			return oNum.toFixed(2) + "$";
		}
	},
	fnDifPW: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				if (sum[i].DiffAmt.length > 10) {
					var num1 = parseFloat(sum[i].DiffAmt.split("Received:")[0].split("Ordered:")[1]);
					var num2 = parseFloat(sum[i].DiffAmt.split("Received:")[1]);
					oArr.push(num1 + num2);
					// oArr.push(parseFloat(sum[i].DiffAmt.split("Received:")[1]));
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
			return oNum.toFixed(2) + "$";
		}
	},
	fnTCIAprrovedPW: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				if (sum[i].TCIApprovedAmount.length > 10) { //sum[i].RepairAmt.split("Received:")[1]
					var num1 = parseFloat(sum[i].TCIApprovedAmount.split("Received:")[0].split("Ordered:")[1]);
					var num2 = parseFloat(sum[i].TCIApprovedAmount.split("Received:")[1]);
					oArr.push(num1 + num2);
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
			return oNum.toFixed(2) + "$";
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
		console.log("oNumber", oNumber);
		if (oNumber !== null && oNumber != undefined && oNumber != "") {
			var oNumber1, oNumber2, oNum1, oNum2;
			if (oNumber.length > 10) {
				if (oNumber == 0) {
					oNumber1 = (oNumber.split("Received:")[1]);
					oNumber2 = oNumber.split("Received:")[0].split("Ordered:")[1];
				} else {
					oNumber1 = parseFloat(oNumber.split("Received:")[1]);
					oNumber2 = parseFloat(oNumber.split("Received:")[0].split("Ordered:")[1]);
				}
				
				oNum1 = Math.round(oNumber1 * 100) / 100;
				oNum2 = Math.round(oNumber2 * 100) / 100;
				var finalNum = "Ordered:" + oNum2.toFixed(2) + "$\nReceived:" + oNum1.toFixed(2) + " $";

				return finalNum;
			} else {
				var oNum3;
				if (oNumber == -0) {
					oNum3 = oNumber;
					return "0.00$";
				} else {
					oNumber = parseFloat(oNumber);
					oNum3 = Math.round(oNumber * 100) / 100;
					return oNum3.toFixed(2) + "$";
				}

			}
		}
		// oNumber = parseFloat(oNumber);

	},
	roundedDecimalsCAD: function (oNumber) {
		if (oNumber !== null && oNumber != undefined && oNumber != "") {
			var oNumber1, oNumber2, oNum1, oNum2;
			if (oNumber.length > 10) {
				oNumber1 = parseFloat(oNumber.split("Received:")[1]);
				oNumber2 = parseFloat(oNumber.split("Received:")[0].split("Ordered:")[1]);
				// var oNum;
				oNum1 = Math.round(oNumber1 * 100) / 100;
				oNum2 = Math.round(oNumber2 * 100) / 100;
				var finalNum = "Ordered:" + oNum2.toFixed(2) + "CAD$\nReceived:" + oNum1.toFixed(2) + " CAD$";
				return finalNum;
			} else {
				var oNum;
				if (oNumber == -0) {
					oNum = oNumber;
					return "0.00CAD$";
				} else {
					var oNum;
					oNumber = parseFloat(oNumber);
					oNum = Math.round(oNumber * 100) / 100;
					return oNum.toFixed(2) + "CAD$";
				}

			}
		}
		// oNumber = parseFloat(oNumber);

	},
	fnItemFormat: function (oVal) {
		console.log(oVal);
		var oText = "";
		if (oVal == "") {
			oText = "";
		} else {
			oText = " Page : " + oVal;
		}
		return oText;
	},
	fnPosnrFormat: function (oVal) {
		console.log(oVal);
		var oText = "";
		if (oVal == "") {
			oText = "";
		} else {
			oText = " Line : " + oVal;
		}
		return oText;
	},

};