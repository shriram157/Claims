sap.ui.define(
	['sap/m/Input',

	],
	function (Input) {
		"use strict";
		var placeSearch, autocomplete, oControl;

		return Input.extend("zclaimProcessing.control.AddressAutoComplete", {
			metadata: {
				properties: {
					"key": "string",
					"id": "string"

				},
				events: {},
				aggregations: {

				}

			},
			onAfterRendering: function () {
				oControl = this;
				Input.prototype.init.apply(oControl, arguments);

				//document.getElementById(oControl.getId() + "-inner").addEventListener("focus", this.geolocate());

				/** Event override **/
				//	oControl.attachSuggest("suggest", oControl._onSuggest);

				//var oCallBack = this.initAutocomplete().bind(this);
				var sBaseUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBkaP8mLBO6ZHBxFcXWjifOJyI5gBbiPfI&libraries=places&sensor=false";
				this._loadScript(sBaseUrl).then(function () {

					// Create the autocomplete object, restricting the search predictions to
					// geographical location types.
					var options = {
						componentRestrictions: {
							country: 'ca'
						}
					};
					autocomplete = new google.maps.places.Autocomplete(document.getElementById(oControl.getId() + "-inner"), options);

					// Avoid paying for data that you don't need by restricting the set of
					// place fields that are returned to just the address components.
					autocomplete.setFields(['address_component']);

					// When the user selects an address from the drop-down, populate the
					// address fields in the form.
					autocomplete.addListener('place_changed', oControl.fillInAddress);
				});
			},
			// 			onFocus: function () {
			// 				this.geolocate();
			// 			},

			fillInAddress: function () {
				var opage = oControl.getId();
				var prefix = opage.replace("--autocomplete", "");
				// Get the place details from the autocomplete object.
				var place = autocomplete.getPlace();
				var that = this;

				// for (var component in componentForm) {
				// 	document.getElementById(prefix + component + "-inner").value = '';
				// 	document.getElementById(prefix + component + "-inner").disabled = false;
				// }

				// Get each component of the address from the place details,
				// and then fill-in the corresponding field on the form.
				// for (var i = 0; i < place.address_components.length; i++) {
				// 	var addressType = place.address_components[i].types[0];
				// 	if (addressType == "street_number" && componentForm[addressType]) {
				// 		var sval = place.address_components[i][componentForm[addressType]];
				// 	}
				// 	if (addressType == "route" && componentForm[addressType]) {
				// 		var sroutval = place.address_components[i][componentForm[addressType]];
				// 	}
				// 	console.log(addressType);
				// 	if (componentForm[addressType]) {
				// 		var val = place.address_components[i][componentForm[addressType]];
				// 		// 		document.getElementById(prefix + addressType + "-inner").value = val;
				// 		if (addressType == "street_number") {
				// 			document.getElementById(prefix + "street_number" + "-inner").value = sval + sroutval;
				// 		}
				// 	}
				// }
				
				
				var findPostalCode = place.address_components.find(elm => elm.types == "postal_code");
				var findProvince = place.address_components.find(elm => elm.types[0] == "administrative_area_level_1");
				if (place.address_components[1] != undefined) {
					document.getElementById(prefix + "--street_number" + "-inner").value = place.address_components[0].short_name + " " +
						place.address_components[1].short_name;
				}

				if (place.address_components[2] != undefined) {
					document.getElementById(prefix + "--locality" + "-inner").value = place.address_components[2].short_name || "";
				} else {
					document.getElementById(prefix + "--locality" + "-inner").value = "";
				}

				if (findProvince) {
					var province = place.address_components.filter(item => item.types[0] == "administrative_area_level_1")[0].short_name;
					document.getElementById(prefix + "--administrative_area_level_1" + "-inner").value = province || "";
				} 
				// else {
				// 	document.getElementById(prefix + "--administrative_area_level_1" + "-inner").value = "";
				// }

				if (findPostalCode) {
					var postalcode = place.address_components.filter(item => item.types[0] == "postal_code")[0].short_name;
					document.getElementById(prefix + "--postal_code" + "-inner").value = postalcode || "";
				} 
				// else {
				// 	document.getElementById(prefix + "--postal_code" + "-inner").value = "";
				// }

			},

			renderer: "sap.m.InputRenderer",
			_loadScript: function (sUrl) {
				return new Promise(function (resolve, reject) {
					try {
						//Load only once
						if (google) {
							resolve();
						}
					} catch (e) {
						/**
						 * If Google library was not loaded we have something like 'ReferenceError'
						 * */
						if (e instanceof ReferenceError) {
							$.getScript(sUrl)
								.done(function (script, textStatus) {
									resolve();
								})
								.fail(function (jqxhr, settings, exception) {
									reject('Error while loading Google Maps');
								});
						}
					}
				});
			},
			geolocate: function () {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function (position) {
						var geolocation = {
							lat: position.coords.latitude,
							lng: position.coords.longitude
						};
						var circle = new google.maps.Circle({
							center: geolocation,
							radius: position.coords.accuracy
						});
						autocomplete.setBounds(circle.getBounds());
						console.log(autocomplete);
					});
				}
			}
		});
	});

///https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=Washington,DC&destinations=New+York+City,NY&key=AIzaSyAzgEq829IUC9PJEo5DqpYUyvY1Iu6fhew