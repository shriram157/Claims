sap.ui.define(
	["sap/m/Input"],
	function (Input) {
		"use strict";
		var placeSearch, autocomplete;

		var componentForm = {
			//street_number: 'short_name',
			//route: 'long_name',
			locality: 'long_name',
			//administrative_area_level_1: 'short_name',
			//country: 'long_name',
			postal_code: 'short_name'
		};
		return Input.extend("zclaimProcessing.control.AddressAutoComplete", {
			metadata: {
				properties: {
					"key": "string"

				},
				events: {},
				aggregations: {

				}

			},
			onAfterRendering: function () {
				var that = this;
				var oCallBack = this.initAutocomplete().bind(this);
				var sBaseUrl = "https://maps.googleapis.com/maps/api/js?key=${this.getKey()}&libraries=places";
				this._loadScript(sBaseUrl).then(oCallBack);
			},

			initAutocomplete: function () {
				var that = this;
				// Create the autocomplete object, restricting the search predictions to
				// geographical location types.
				var options = {
					componentRestrictions: {
						country: 'ca'
					}
				};
				autocomplete = new google.maps.places.Autocomplete(
					this.getId(), options);

				// Avoid paying for data that you don't need by restricting the set of
				// place fields that are returned to just the address components.
				autocomplete.setFields(['address_component']);

				// When the user selects an address from the drop-down, populate the
				// address fields in the form.
				autocomplete.addListener('place_changed', fillInAddress);
			},

			fillInAddress: function () {
				// Get the place details from the autocomplete object.
				var place = autocomplete.getPlace();
				var that = this;

				for (var component in componentForm) {
					that.getView().byId(component).value = '';
					that.getView().byId(component).disabled = false;
				}

				// Get each component of the address from the place details,
				// and then fill-in the corresponding field on the form.
				for (var i = 0; i < place.address_components.length; i++) {
					var addressType = place.address_components[i].types[0];
					if (componentForm[addressType]) {
						var val = place.address_components[i][componentForm[addressType]];
						that.getView().byId(addressType).value = val;
					}
				}
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
					});
				}
			},

			// 			onAfterRendering: function () {
			// 				var that = this;
			// 				var sBaseUrl = `https://maps.googleapis.com/maps/api/js?key=${this.getKey()}&sensor=false`;
			// 				// fetch(sBaseUrl, {
			// 				// 		header: 'Access-Control-Allow-Origin'
			// 				// 	})
			// 				// 	.then(response => {
			// 				// 		return response.json();
			// 				// 	})
			// 				// 	.then(data => {

			// 				// 		console.log(data);
			// 				// 	})
			// 				// 	.catch(err => {
			// 				// 		console.log(err);

			// 				// 	});
			// 				//var oCallBack = this.callback().bind(this);
			// 				this._loadScript(sBaseUrl).then(function () {
			// 					var from = new google.maps.LatLng(46.5610058, 26.9098054);
			// 					var fromName = 'Bacau';
			// 					var dest = new google.maps.LatLng(44.391403, 26.1157184);
			// 					var destName = 'Bucuresti';

			// 					var service = new google.maps.DistanceMatrixService();
			// 					service.getDistanceMatrix({
			// 						origins: [from, fromName],
			// 						destinations: [destName, dest],
			// 						travelMode: 'DRIVING'
			// 					}, function (response, status) {
			// 						if (status == 'OK') {
			// 							var origins = response.originAddresses;
			// 							var destinations = response.destinationAddresses;

			// 							for (var i = 0; i < origins.length; i++) {
			// 								var results = response.rows[i].elements;
			// 								console.log(results);
			// 								for (var j = 0; j < results.length; j++) {
			// 									var element = results[j];
			// 									var distance = element.distance.text;
			// 									var duration = element.duration.text;
			// 									var from = origins[i];
			// 									var to = destinations[j];
			// 									console.log(distance, duration);
			// 									that.setValue(distance);

			// 								}
			// 							}
			// 						}
			// 					});
			// 				});

			// 			},

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
				})
			},
		});
	});

///https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=Washington,DC&destinations=New+York+City,NY&key=AIzaSyAzgEq829IUC9PJEo5DqpYUyvY1Iu6fhew