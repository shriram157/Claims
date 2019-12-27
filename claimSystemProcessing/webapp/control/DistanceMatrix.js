sap.ui.define(
	["sap/ui/core/Control", "sap/m/Label"],
	function (Control, Label) {
		"use strict";
		return Control.extend("zclaimProcessing.control.DistanceMatrix", {
			metadata: {
				properties: {
					"key": "string",
					"origin": "string",
					"destination": "string",
					"distance": {
						type: "string"
					}

				},
				events: {},
				aggregations: {
					_label: {
						type: "sap.m.Label",
						multiple: false
					}
				}

			},
			init: function () {},
			onAfterRendering: function () {
				var that = this;
				var sBaseUrl = `https://maps.googleapis.com/maps/api/js?key=${this.getKey()}&sensor=false`;
				// fetch(sBaseUrl, {
				// 		header: 'Access-Control-Allow-Origin'
				// 	})
				// 	.then(response => {
				// 		return response.json();
				// 	})
				// 	.then(data => {

				// 		console.log(data);
				// 	})
				// 	.catch(err => {
				// 		console.log(err);

				// 	});
				//var oCallBack = this.callback().bind(this);
				this._loadScript(sBaseUrl).then(function () {
					var from = new google.maps.LatLng(46.5610058, 26.9098054);
					var fromName = 'Bacau';
					var dest = new google.maps.LatLng(44.391403, 26.1157184);
					var destName = 'Bucuresti';

					var service = new google.maps.DistanceMatrixService();
					service.getDistanceMatrix({
						origins: [from, fromName],
						destinations: [destName, dest],
						travelMode: 'DRIVING'
					}, function (response, status) {
						if (status == 'OK') {
							var origins = response.originAddresses;
							var destinations = response.destinationAddresses;

							for (var i = 0; i < origins.length; i++) {
								var results = response.rows[i].elements;
								console.log(results);
								for (var j = 0; j < results.length; j++) {
									var element = results[j];
									var distance = element.distance.text;
									var duration = element.duration.text;
									var from = origins[i];
									var to = destinations[j];
									console.log(distance, duration);
									//that.setProperty("distance", distance);
									that.getAggregation("_label").setText(distance);
								}
							}
						}
					});
				});

			},

			renderer: function (oRM, oControl) {
				console.log(oControl);

				//oControl.getProperty("distance"), oRM.renderControl(oControl.getProperty("distance"))
				//Loading Style : we can externalise these Styles

				/**
				 * Target
				 * <div id='idoFThis' style='width:100%;height:400px;background:#C6BEBE'>
				 *	<h1>Loading ....</h1>
				 * </div>
				 * */
				oRM.write("<div");
				oRM.writeControlData(oControl);

				oRM.write(">");

				oRM.renderControl(oControl.getAggregation("_label"));

				oRM.write("</div>");
				// oRm.write(oControl.getProperty("distance"));

			},
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