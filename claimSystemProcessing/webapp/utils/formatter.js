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
			val.toString();
			oVal = val.split("-")[4];
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
		}
		return oNum;
	},
	fnLabDif: function (sum) {
		var oNum;
		var oArr = [];
		if (sum) {
			for (var i = 0; i < sum.length; i++) {
				oArr.push(
					parseFloat(sum[i].LabourDifference)
				);

			}
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
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
			oNum = oArr.reduce(
				function (a, b) {
					return a + b;

				}
			).toFixed(2);
		}
		return oNum;
	}

};