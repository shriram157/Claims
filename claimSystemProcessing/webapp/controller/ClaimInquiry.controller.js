sap.ui.define([
	"zclaimProcessing/controller/BaseController",
	'sap/m/MessageToast',
	"sap/ui/model/Sorter",
	"zclaimProcessing/control/SearchAddressInput"
], function (BaseController, MessageToast, Sorter, SearchAddressInput) {
	"use strict";

	return BaseController.extend("zclaimProcessing.controller.ClaimInquiry", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zclaimProcessing.view.ClaimInquiry
		 */

		onInit: function () {
			this.getDealer();
			this.getView().setModel(sap.ui.getCore().getModel("HeaderLinksModel"), "HeaderLinksModel");
			this.getView().setModel(this.getModel("ProssingModel"));
			var PriorDate = new Date();
			var oDateModel = new sap.ui.model.json.JSONModel();
			oDateModel.setData({
				dateValueDRS2: new Date(new Date().setDate(PriorDate.getDate() - (365 * 5))),
				secondDateValueDRS2: PriorDate,
				dateCurrent: new Date(),
				vinState: "None",
				tableBusyIndicator: false,
				searchEnabled: false,
				VIN: ""
			});
			oDateModel.setDefaultBindingMode("TwoWay");
			this.getView().setModel(oDateModel, "DateModel");
			this.getModel("LocalDataModel").setProperty("/LinkEnable", true);
			this._mViewSettingsDialogs = {};

			// 			var url = this.getView().getModel("DateModel").getProperty("/oUri") +
			// 				'?units=metric&origins=Washington,DC&destinations=New+York+City,NY&key=AIzaSyAz7irkOJQ4ydE2dHYrg868QV5jUQ-5FaY';

			// 			fetch(url)
			// 				.then(response => {
			// 					return response.json();
			// 				})
			// 				.then(data => {

			// 					console.log(data);
			// 				})
			// 				.catch(err => {
			// 					console.log(err);

			// 				})
			//this.initialize();

			var oCtrl = new SearchAddressInput({
				GoogleAPI: "AIzaSyAz7irkOJQ4ydE2dHYrg868QV5jUQ-5FaY"
			});
			this.getView().byId("oControlId").addItem(oCtrl);
		},
		onAfterRendering: function () {

		},

		initialize: function () {
			var directionDisplay;
			var directionsService = new google.maps.DirectionsService();
			var map;
			directionsDisplay = new google.maps.DirectionsRenderer();
			var chicago = new google.maps.LatLng(41.850033, -87.6500523);
			var myOptions = {
				zoom: 6,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				center: chicago
			}
			map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
			directionsDisplay.setMap(map);
			calcRoute();
		},

		calcRoute: function () {
			var directionDisplay;
			var directionsService = new google.maps.DirectionsService();
			var map;
			var request = {
				origin: "1521 NW 54th St, Seattle, WA 98107 ",
				destination: "San Diego, CA",
				waypoints: [{
					location: new google.maps.LatLng(42.496403, -124.413128),
					stopover: false
				}],
				optimizeWaypoints: true,
				travelMode: google.maps.DirectionsTravelMode.WALKING
			};
			directionsService.route(request, function (response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response);
					var route = response.routes[0];
					var summaryPanel = document.getElementById("directions_panel");
					summaryPanel.innerHTML = "";
					// For each route, display summary information.
					for (var i = 0; i < route.legs.length; i++) {
						var routeSegment = i + 1;
						summaryPanel.innerHTML += "<b>Route Segment: " + routeSegment + "</b><br />";
						summaryPanel.innerHTML += route.legs[i].start_address + " to ";
						summaryPanel.innerHTML += route.legs[i].end_address + "<br />";
						summaryPanel.innerHTML += route.legs[i].distance.text + "<br /><br />";
					}
				} else {
					alert("directions response " + status);
				}
			});
		},

		onEnterVIN: function (oEvent) {
			var oVin = oEvent.getSource().getValue().toUpperCase();

			this.getView().getModel("DateModel").setProperty("/VIN", oVin);
			//var oVin = oText.toUpperCase();

			var oProssingModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			//this.getModel("LocalDataModel").setProperty("/selectedVehicle", oVin);

			oProssingModel.read("/ZC_GET_FORE_VIN(p_vhvin='" + oVin + "')/Set", {
				success: $.proxy(function (data) {
					this.getView().getModel("LocalDataModel").setProperty("/oVinDetisl", data.results);
					if (data.results.length > 0) {
						var oVinModel = data.results[0].Model;
						if (oVinModel == "I_VEH_US") {
							this.getView().getModel("DateModel").setProperty("/vinState", "None");
							this.getView().byId("idNewClaimMsgStrp").setProperty("visible", false);
							this.getView().byId("idNewClaimMsgStrp").setText("");
							this.getView().byId("idNewClaimMsgStrp").setType("None");
							this.getView().getModel("DateModel").setProperty("/searchEnabled", true);
						} else if (data.results[0].Message == "Invalid VIN Number") {
							this.getView().getModel("DateModel").setProperty("/vinState", "Error");
							this.getView().byId("idNewClaimMsgStrp").setProperty("visible", true);
							this.getView().byId("idNewClaimMsgStrp").setText(oBundle.getText("PleaseEnterValidVIN"));
							this.getView().byId("idNewClaimMsgStrp").setType("Error");
							this.getView().getModel("DateModel").setProperty("/searchEnabled", false);
							this.getModel("LocalDataModel").setProperty("/DataResultEnquiry", "");
						} else {
							this.getView().getModel("DateModel").setProperty("/vinState", "None");
							this.getView().byId("idNewClaimMsgStrp").setProperty("visible", false);
							this.getView().byId("idNewClaimMsgStrp").setText("");
							this.getView().byId("idNewClaimMsgStrp").setType("None");
							this.getView().getModel("DateModel").setProperty("/searchEnabled", true);
						}

					}
				}, this),
				error: function () {

				}
			});

		},

		onPressSearch: function () {

			var oClaimModel = this.getModel("ProssingModel");
			var oDealer = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			var andFilter = [];
			var sQuery = this.getView().byId("idVin").getValue();
			var FromDate = this.getView().getModel("DateModel").getProperty("/dateValueDRS2");
			var ToDate = this.getView().getModel("DateModel").getProperty("/secondDateValueDRS2");
			var FromDateFormat = oDateFormat.format(FromDate);
			var ToDateFormat = oDateFormat.format(ToDate);
			if (sQuery != "") {
				this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", true);
				oClaimModel.read("/ZC_CLAIM_HEAD_NEW", {
					urlParameters: {
						"$filter": "ReferenceDate ge datetime'" + FromDateFormat +
							"'and ReferenceDate le datetime'" + ToDateFormat +
							"'and ExternalObjectNumber eq '" + sQuery + "'"

					},
					success: $.proxy(function (data) {

						this.getModel("LocalDataModel").setProperty("/DataResultEnquiry", data.results);
						this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);

					}, this),
					error: function (error) {
						console.log(error);
					}
				});

				this.getView().getModel("DateModel").setProperty("/vinState", "None");

			} else {
				this.getView().getModel("DateModel").setProperty("/tableBusyIndicator", false);
				this.getModel("LocalDataModel").setProperty("/DataResultEnquiry", "");
				this.getView().getModel("DateModel").setProperty("/vinState", "Error");
				this.getView().byId("idNewClaimMsgStrp").setProperty("visible", true);
				this.getView().byId("idNewClaimMsgStrp").setText(oBundle.getText("PleaseEnterValidVIN"));
				this.getView().byId("idNewClaimMsgStrp").setType("Error");
			}

		},
		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				this.getView().addDependent(oDialog);
			}

			return oDialog;
		},

		handleSortButtonPressed: function () {
			this.createViewSettingsDialog("zclaimProcessing.view.fragments.SortOrder").open();
		},
		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("idClaimInquiryTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},
		onPressClaimInquiryDetails: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oCustomer = oEvent.getSource().getParent().getCells()[0].getText();
			var oClaimNum = oEvent.getSource().getParent().getCells()[2].getText();
			var oClaimType = oEvent.getSource().getParent().getCells()[6].getText();
			if (oClaimType == "ZACD" || oClaimType == "ZAUT") {
				this.oSelectedClaimGroup = "Authorization";
			} else {
				this.oSelectedClaimGroup = "Claim";
			}
			// var oSelectedClaimGroup = oEvent.getSource().getParent().getCells()[15].getText();
			var oDealer = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
			if (oCustomer === oDealer || sap.ui.getCore().getModel("UserDataModel").getProperty("/LoggedInUser") == "TCI_Admin") {
				this.getOwnerComponent().getRouter().navTo("MainClaimSection", {
					claimNum: oClaimNum,
					oKey: oClaimType,
					oClaimGroup: this.oSelectedClaimGroup,
					oClaimNav: "Inq"

				});
			} else {
				MessageToast.show(oBundle.getText("NoAuthViewClaim"));
			}
		},
		handleDealerLabourInq: function (oEvent) {
			var sDivision;
			var oDialog;
			var oPartner;
			//this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner");
			//console.log(this.getModel("LocalDataModel").getProperty("/ClaimDetails"));
			if (this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner") != "" &&
				this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner") != undefined) {
				oPartner = this.getModel("LocalDataModel").getProperty("/ClaimDetails/Partner");
			} else {
				oPartner = this.getView().getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
			}

			//	var selectedKey = this.getView().byId("idDealerCode").getSelectedKey();
			//  get the locale to determine the language.
			var isDivision = window.location.search.match(/Division=([^&]*)/i);
			if (isDivision) {
				sDivision = window.location.search.match(/Division=([^&]*)/i)[1];
			} else {
				sDivision = "10"; // default is english
			}

			// 			this.getDealer();

			var oProssingModel = this.getModel("ProssingModel");
			oProssingModel.read("/zc_labour_rateSet(Partner='" + oPartner + "',Division='" + sDivision +
				"')", {
					success: $.proxy(function (data) {
						this.getModel("LocalDataModel").setProperty("/oDealerLabour", data);
						if (!oDialog) {
							oDialog = sap.ui.xmlfragment("zclaimProcessing.view.fragments.DealerLabour",
								this);
							this.getView().addDependent(oDialog);
						}
						oDialog.open();
					}, this),
					error: function () {

					}
				});

		},
		fnFormatDealer: function (val) {
			var oDealer = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");
			var oAccessedDealer;
			if (val === oDealer) {
				this.getModel("LocalDataModel").setProperty("/LinkEnable", true);
				oAccessedDealer = val;
			} else {
				this.getModel("LocalDataModel").setProperty("/LinkEnable", false);
				oAccessedDealer = val;
			}
			return val;
		}

	});

});