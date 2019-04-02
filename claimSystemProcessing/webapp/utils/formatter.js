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
		return oNum;
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
		return oNum;
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
		return oNum;
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
		return oNum;
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
		return oNum;
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
		return oNum;
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
		return oNum;
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
		return oNum;
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
		return oNum;
	},
	fnAmountSublet: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].Amount)
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
		return oNum;
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
		return oNum;
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
		return oNum;
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
				oArr.push(
					parseFloat(sum[i].RepairAmt)
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
	fnAmountClaimedPW: function (sum) {
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
		return oNum;
	},
	fnDifPW: function (sum) {
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
		return oNum;
	},
	fnTCIAprrovedPW: function (sum) {
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
		return oNum;
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
	}

};