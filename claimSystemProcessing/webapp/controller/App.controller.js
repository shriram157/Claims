sap.ui.define([
	"zclaimProcessing/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.App", {
		onInit: function () {

			var isDivisionSent = window.location.search.match(/Division=([^&]*)/i);
			var oLexusLogo = this.getView().byId("idLexusLogo");
			var oToyotaLogo = this.getView().byId("idToyotaLogo");
			if (isDivisionSent) {
				this.sDivision = window.location.search.match(/Division=([^&]*)/i)[1];

				if (this.sDivision == "10") // set the Toyoto logo
				{

					oToyotaLogo.setProperty("visible", true);
					oLexusLogo.setProperty("visible", false);

				} else if (this.sDivision == "20") // set the Lexus logo
				{

					oToyotaLogo.setProperty("visible", false);
					oLexusLogo.setProperty("visible", true);

				} else { // set the lexus logo

					oToyotaLogo.setProperty("visible", true);
					oLexusLogo.setProperty("visible", true);

				}

			} else {
				oToyotaLogo.setProperty("visible", true);
				oLexusLogo.setProperty("visible", true);
			}

		}
	});
});