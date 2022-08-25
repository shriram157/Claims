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

				} else { // set the lexus logo Toyota logo

					oToyotaLogo.setProperty("visible", true);
					oLexusLogo.setProperty("visible", true);

				}

			} else {// set the lexus logo Toyota logo
				oToyotaLogo.setProperty("visible", true);
				oLexusLogo.setProperty("visible", true);
			}
			
			this._setTheLanguage();
			this.getUser();

		},
		_setTheLanguage: function (oEvent) {

                var oI18nModel = new sap.ui.model.resource.ResourceModel({
                    bundleUrl: "i18n/i18n.properties"
                });
                var i18nModel;
                this.getView().setModel(oI18nModel, "i18n");
				var sSelectedLocale;
                //  get the locale to determine the language.
                var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
                if (isLocaleSent) {
                    sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
                } else {
                    sSelectedLocale = "en"; // default is english
                }

                //selected language.    
                // if (window.location.search == "?language=fr") {
                if (sSelectedLocale == "fr") {
                    i18nModel = new sap.ui.model.resource.ResourceModel({
                        bundleUrl: "i18n/i18n.properties",
                        bundleLocale: ("fr")

                    });
                    this.getView().setModel(i18nModel, "i18n");
                    this.sCurrentLocale = 'fr';
                    
                } else {
                    i18nModel = new sap.ui.model.resource.ResourceModel({
                        bundleUrl: "i18n/i18n.properties",
                        bundleLocale: ("en")

                    });
                    this.getView().setModel(i18nModel, "i18n");
                    this.sCurrentLocale = 'en';
                    // set the right image for logo            
                    /*                var currentImageSource = this.getView().byId("idLexusLogo");
                                    currentImageSource.setProperty("src", "images/Lexus_EN.png");*/

                }

                var oModeli18n = this.getView().getModel("i18n");
                this._oResourceBundle = oModeli18n.getResourceBundle();
            }
		
	});
});