sap.ui.define([
	"zclaimProcessing/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.PMPMainSection", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.PMPMainSection
		 */

		onInit: function () {
			// 			var oCtrl = new SearchAddressInput({
			// 				id: "autocomplete"
			// 			});

			// 			this.getView().byId("oSearchId").addItem(oCtrl);
			//this.initAutocomplete();
		},

		// 		initAutocomplete: function () {
		// 			// Create the autocomplete object, restricting the search predictions to
		// 			// geographical location types.
		// 			autocomplete = new google.maps.places.Autocomplete(
		// 				document.getElementById('autocomplete'), {
		// 					types: ['geocode']
		// 				});

		// 			// Avoid paying for data that you don't need by restricting the set of
		// 			// place fields that are returned to just the address components.
		// 			autocomplete.setFields(['address_component']);

		// 			// When the user selects an address from the drop-down, populate the
		// 			// address fields in the form.
		// 			autocomplete.addListener('place_changed', this.fillInAddress);
		// 		},

		// 		fillInAddress: function () {
		// 			// Get the place details from the autocomplete object.
		// 			var place = autocomplete.getPlace();

		// 			for (var component in componentForm) {
		// 				document.getElementById(component).value = '';
		// 				document.getElementById(component).disabled = false;
		// 			}

		// 			// Get each component of the address from the place details,
		// 			// and then fill-in the corresponding field on the form.
		// 			for (var i = 0; i < place.address_components.length; i++) {
		// 				var addressType = place.address_components[i].types[0];
		// 				if (componentForm[addressType]) {
		// 					var val = place.address_components[i][componentForm[addressType]];
		// 					document.getElementById(addressType).value = val;
		// 				}
		// 			}
		// 		},

		// 		geolocate: function () {
		// 			if (navigator.geolocation) {
		// 				navigator.geolocation.getCurrentPosition(function (position) {
		// 					var geolocation = {
		// 						lat: position.coords.latitude,
		// 						lng: position.coords.longitude
		// 					};
		// 					var circle = new google.maps.Circle({
		// 						center: geolocation,
		// 						radius: position.coords.accuracy
		// 					});
		// 					autocomplete.setBounds(circle.getBounds());
		// 				});
		// 			}
		// 		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zclaimProcessing.view.PMPMainSection
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zclaimProcessing.view.PMPMainSection
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zclaimProcessing.view.PMPMainSection
		 */
		//	onExit: function() {
		//
		//	}

	});

});