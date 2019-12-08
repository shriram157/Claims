sap.ui.define(
	["sap/ui/core/Control", "sap/m/MessageBox"],
	function (Control, MessageBox) {
		"use strict";
		return Control.extend("zclaimProcessing.control.GoogleMap", {
			metadata: {
				properties: {
					//Externalize key in order to get it from parameters or OData or whatever 
					"key": "string",
					"address": "string",
					"defaultAdress": "string",
					"title": {
						"type": "string",
						"defaultValue": "Loading..."
					},
					"description": "string",
					/**
					 * Google Container
					 * width : Map width
					 * height : Map height
					 * **/
					"width": {
						"type": "sap.ui.core.CSSSize",
						"defaultValue": "100%"
					},
					"height": {
						"type": "sap.ui.core.CSSSize",
						"defaultValue": "400px"
					},
					"backgroundColor": {
						"type": "sap.ui.core.CSSColor",
						"defaultValue": "#C6BEBE"
					},
					/**
					 * Google Variables
					 * @link(https://developers.google.com/maps/documentation/javascript/examples/map-simple)
					 * **/
					"mapType": {
						"type": "string",
						"defaultValue": "roadmap"
					},

					"mapZoom": {
						"type": "string",
						"defaultValue": "17"
					}
				},
				aggregations: {}
			},
			init: function () {},
			renderer: function (oRm, oControl) {
				//Loading Style : we can externalise these Styles
				var sGlobalStyle = `width:${oControl.getWidth()};height:${oControl.getHeight()};background:${oControl.getBackgroundColor()}`; // Come on it's ES6 Mr SAP
				var sLoadingStyle = `color:#A09494;text-align:center;font-size:1rem;padding-top:2rem`;

				/**
				 * Target
				 * <div id='idoFThis' style='width:100%;height:400px;background:#C6BEBE'>
				 *	<h1>Loading ....</h1>
				 * </div>
				 * */
				oRm.write('<div');
				oRm.writeControlData(oControl);
				oRm.writeAttributeEscaped("style", sGlobalStyle);
				oRm.write('><h1');
				oRm.writeAttributeEscaped("style", sLoadingStyle);
				oRm.write(`>${oControl.getTitle()}</h1>`)
				oRm.write('</div>')
			},
			onAfterRendering: function () {
				//No API Key : No Google Map
				if (!this.getKey()) {
					this._showError('No API Key');
					return;
				}

				var sBaseUrl = `https://maps.googleapis.com/maps/api/js?key=${this.getKey()}`, // Come on it's ES6 Mr SAP
					fnInitialize = this.displayAdress.bind(this),
					fnOnError = this._showError.bind(this);

				this._loadScript(sBaseUrl)
					.then(fnInitialize)
					.catch(fnOnError);
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
			_showError: function (sError) {
				MessageBox.error(sError);
			},
			displayAdress: function () {
				var sAdress = this.getAddress();

				var fnResolver = this._showMap.bind(this),
					fnError = this._showError.bind(this);

				//Promise to Search Adress
				var oSearchAdress = new Promise((resolve, reject) => {
					var geocoder = new google.maps.Geocoder();
					geocoder.geocode({
							address: sAdress
						},
						(results, status) => {
							if (status == google.maps.GeocoderStatus.OK) {
								resolve(results);
								return;
							}
							reject(`"<u>${sAdress}</u>" : Not Found`);
						});
				});

				//Launch Searching
				oSearchAdress
					.then(fnResolver)
					.catch(fnError);
			},
			_showMap: function (aResults) {
				var oDocument = this.getDomRef(),
					sMapType = this.getMapType(),
					iZoom = parseInt(this.getMapZoom()),
					sAdress = this.getAddress(),
					oLocation = aResults[0].geometry.location; //Take the first Result for instance

				var mapOptions = {
					center: oLocation,
					zoom: iZoom,
					mapTypeId: 'roadmap',
					fullscreenControl: false
				}
				var map = new google.maps.Map(oDocument, mapOptions);
				var marker = new google.maps.Marker({
					map: map,
					position: oLocation,
					title: sAdress,
					animation: google.maps.Animation.DROP
				});
				map.setCenter(oLocation);
			}

		});
	}
);