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
	fnFormatPositionCode : function(val){
		var oVal="";
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
	}
};