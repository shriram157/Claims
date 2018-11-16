jQuery.sap.declare("zclaimProcessing.utils.formatter");
zclaimProcessing.utils.formatter = {
	// 	formatDate: function (value) {
	// 		jQuery.sap.require("sap.ui.core.format.DateFormat");
	// 		var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
	// 			pattern: "yyyy-MM-dd HH:mm:ss"
	// 		});
	// 		if (value) {
	// 			var formatDt = oDateFormat.format(value);
	// 			return formatDt;
	// 		} else {
	// 			return value;
	// 		}
	// 	}

	fnFormatCustomer: function (val) {
		var sTrimval;

		if (val) {
			val.toString();
			sTrimval = val.substr(5);
			//console.log(sTrimval);

		}
		return sTrimval;
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
	}
};