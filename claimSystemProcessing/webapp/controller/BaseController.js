sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/Device",
	'sap/m/MessageToast'
], function (Controller, History, Device, MessageToast) {
	"use strict";
	var sDivision;
	//  get the locale to determine the language.
	var isDivision = window.location.search.match(/Division=([^&]*)/i);
	if (isDivision) {
		sDivision = window.location.search.match(/Division=([^&]*)/i)[1];
	} else {
		sDivision = "10"; // default is english
	}

	var sSelectedLocale;
	//  get the locale to determine the language.
	var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
	if (isLocaleSent) {
		sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
	} else {
		sSelectedLocale = "en"; // default is english
	}

	return Controller.extend("zclaimProcessing.controller.BaseController", {

		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		getModel: function (sName) {
			return this.getOwnerComponent().getModel(sName);
		},
		handleNavHeaderPress: function (oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oGetText = oEvent.getSource().getText();
			if (oGetText === oBundle.getText("NewClaim")) {
				this.getOwnerComponent().getRouter().navTo("NewClaimSelectGroup");
				this.getModel("ProssingModel").refresh();
			} else if (oGetText === oBundle.getText("ViewUpdateClaims")) {
				this.getOwnerComponent().getRouter().navTo("SearchClaim");
				this.getModel("ProssingModel").refresh();
			} else if (oGetText === oBundle.getText("QuickCoverageTool")) {
				this.getOwnerComponent().getRouter().navTo("QueryCoverageTools");
				this.getModel("ProssingModel").refresh();
			} else if (oGetText === oBundle.getText("ClaimInquiry")) {
				this.getOwnerComponent().getRouter().navTo("ClaimInquiry");
				this.getModel("ProssingModel").refresh();
			}

		},

		handleDealerLabourInq: function (oEvent) {
			this.getDealer();
			var oDialog;
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment("zclaimProcessing.view.fragments.DealerLabour",
					this);
				this.getView().addDependent(oDialog);
			}
			oDialog.open();
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		getDealer: function () {
			var that = this;
			this.getUser();

			// get the attributes and BP Details - Minakshi to confirm if BP details needed	
			$.ajax({
				url: this.sPrefix + this.attributeUrl,
				type: "GET",
				dataType: "json",

				success: function (oData) {

					var BpDealer = [];
					var userAttributes = [];
					that.getModel("LocalDataModel").setProperty("/LoginId", oData.userProfile.id);
					$.each(oData.attributes, function (i, item) {
						var BpLength = item.BusinessPartner.length;

						BpDealer.push({
							"BusinessPartnerKey": item.BusinessPartnerKey,
							"BusinessPartner": item.BusinessPartner, //.substring(5, BpLength),
							"BusinessPartnerName": item.BusinessPartnerName, //item.OrganizationBPName1 //item.BusinessPartnerFullName
							"Division": item.Division,
							"BusinessPartnerType": item.BusinessPartnerType,
							"searchTermReceivedDealerName": item.SearchTerm2
						});

					});
					that.getModel("LocalDataModel").setProperty("/BpDealerModel", BpDealer);
					//that.getModel("LocalDataModel").setProperty("/BpDealerKey", BpDealer[0].BusinessPartnerKey);
					//that.getView().setModel(new sap.ui.model.json.JSONModel(BpDealer), "BpDealerModel");
					// read the saml attachments the same way 

				}.bind(this),
				error: function (response) {
					sap.ui.core.BusyIndicator.hide();
				}
			}).done(function (data, textStatus, jqXHR) {

				that.getModel("LocalDataModel").setProperty("/BPDealerDetails", data.attributes[0]);
				that.getModel("LocalDataModel").setProperty("/LoginId", data.userProfile.id);

			});

		},

		getUser: function () {

			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				this.sPrefix = "/Claim_Destination";
				this.attributeUrl = "/userDetails/attributesforlocaltesting";
			} else {
				this.sPrefix = "";
				this.attributeUrl = "/userDetails/attributes";
			}

			var HeaderLinksModel = new sap.ui.model.json.JSONModel();
			/*Uncomment for security*/
			HeaderLinksModel.setData({
				NewClaim: false,
				ViewUpdateClaims: false,
				QuickCoverageTool: false,
				ClaimInquiry: false,
				DealerLabourRateInquiry: false
			});

			this.getView().setModel(HeaderLinksModel, "HeaderLinksModel");
			sap.ui.getCore().setModel(HeaderLinksModel, "HeaderLinksModel");

			//======================================================================================================================//			
			//  on init method,  get the token attributes and authentication details to the UI from node layer.  - begin
			//======================================================================================================================//		
			//  get the Scopes to the UI 
			//this.sPrefix ="";
			var oModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(oModel, "UserDataModel");
			var that = this;
			$.ajax({
				url: this.sPrefix + "/userDetails/currentScopesForUser",
				type: "GET",
				dataType: "json",
				success: function (oData) {
					var userType = oData.loggedUserType[0];
					//var userType = "Dealer_Services_Admin";
					//var userType = "TCI_Admin";
					//var userType = "Dealer_Parts_Services_Admin";
					sap.ui.getCore().getModel("UserDataModel").setProperty("/LoggedInUser", userType);
					sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "");
					switch (userType) {
					case "Dealer_Parts_Admin":
						//"Dealer Parts"
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllParts");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
						break;
					case "Dealer_Parts_Services_Admin":
						//"Dealer service part"
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllWarrantyParts");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
						break;
					case "Dealer_Services_Admin":
						//"Dealer_Services_Admin"
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllServices");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
						break;
					case "Dealer_User":
						//"Dealer_User"
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyCoverageClaimLabour");

						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						that.getOwnerComponent().getRouter().navTo("QueryCoverageTools");
						/*Uncomment for security*/
						break;
					case "TCI_Admin":
						//"TCI_Admin"
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyViewAll");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						that.getOwnerComponent().getModel("LocalDataModel").setProperty("/visibleNewBtn", false);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
						break;
					case "TCI_User":
						//"TCI_User"
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyCoverageClaim");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", false);

						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						that.getOwnerComponent().getRouter().navTo("QueryCoverageTools");
						/*Uncomment for security*/
						break;
					case "Zone_User":
						//"Zone_User"
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyViewAll");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						that.getOwnerComponent().getModel("LocalDataModel").setProperty("/visibleNewBtn", false);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						// /*Uncomment for security*/
						break;
					case "Dealer_Services_Manager":
						//"Dealer_Services_Manager"
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllShowAuthorization");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
						break;
					default:
						// console.log("Dealer_Services_Manager");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ManageAllShowAuthorization");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						/*Uncomment for security*/
					}
					// console.log(sap.ui.getCore().getModel("UserDataModel"));
				}
			});

			$.ajax({
				url: this.sPrefix + "/app-config",
				type: "GET",
				dataType: "json",
				success: $.proxy(function (appData) {

					this.getModel("LocalDataModel").setProperty("/oECPURL", appData.ecpSalesAppUrl);
					this.getModel("LocalDataModel").setProperty("/oCICURL", appData.cicUrl);
					this.getModel("LocalDataModel").setProperty("/oCVSHURL", appData.cvshUrl);
				}, this),
				error: function (err) {
					MessageToast.show(err);
				}
			});
		},
		getOnlyDealer: function () {
			var that = this;
			var sLocation = window.location.host;
			var sLocation_conf = sLocation.search("webide");
			if (sLocation_conf == 0) {
				this.sPrefix = "/Claim_Destination";
				this.attributeUrl = "/userDetails/attributesforlocaltesting";
			} else {
				this.sPrefix = "";
				this.attributeUrl = "/userDetails/attributes";
			}
			$.ajax({
				url: this.sPrefix + this.attributeUrl,
				type: "GET",
				dataType: "json",

				success: function (oData) {

					var BpDealer = [];
					var userAttributes = [];
					that.getModel("LocalDataModel").setProperty("/LoginId", oData.userProfile.id);
					$.each(oData.attributes, function (i, item) {
						var BpLength = item.BusinessPartner.length;

						BpDealer.push({
							"BusinessPartnerKey": item.BusinessPartnerKey,
							"BusinessPartner": item.BusinessPartner, //.substring(5, BpLength),
							"BusinessPartnerName": item.BusinessPartnerName, //item.OrganizationBPName1 //item.BusinessPartnerFullName
							"Division": item.Division,
							"BusinessPartnerType": item.BusinessPartnerType,
							"searchTermReceivedDealerName": item.SearchTerm2
						});

					});
					that.getModel("LocalDataModel").setProperty("/BpDealerModel", BpDealer);
					that.getModel("LocalDataModel").setProperty("/dealerCode", BpDealer[0].BusinessPartnerKey);

					var oBusinessModel = that.getModel("ApiBusinessModel");
					oBusinessModel.read("/A_BusinessPartnerAddress", {
						urlParameters: {
							"$filter": "BusinessPartner eq '" + BpDealer[0].BusinessPartnerKey + "' "
						},
						success: $.proxy(function (bpData) {

							that.getModel("LocalDataModel").setProperty("/dealerPostalCode", bpData.results[0].PostalCode);
						}, this)

					});

					oBusinessModel.read("/A_BusinessPartner", {
						urlParameters: {
							"$filter": "BusinessPartner eq '" + BpDealer[0].BusinessPartnerKey + "'"
						},
						success: $.proxy(function (dBp) {
							this.getModel("LocalDataModel").setProperty("/BPOrgName", dBp.results[0].OrganizationBPName1);
						}, this)
					});

				}.bind(this),
				error: function (response) {
					sap.ui.core.BusyIndicator.hide();
				}
			}).done(function (data, textStatus, jqXHR) {

				that.getModel("LocalDataModel").setProperty("/BPDealerDetails", data.attributes[0]);
				that.getModel("LocalDataModel").setProperty("/LoginId", data.userProfile.id);
				//----------------------------------
				//Code of Dealer Labour--------------
				//------------------------------------
				//that.getDealerlabour(data.attributes[0]);
			});
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("SearchClaim", {}, true);
			}
		},
		onCloseDialogDealer: function (Oevent) {
			Oevent.getSource().getParent().close();
		},
		onUplaodChange: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			this.getModel("LocalDataModel").setProperty("/IndicatorState", true);
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			//this.obj.Message = "";
			this.obj.NumberOfWarrantyClaim = oClaimNum;
			var reader = new FileReader();

			if (oClaimNum != "" && oClaimNum != undefined) {
				this.oUploadedFile = oEvent.getParameter("files")[0];
				if (FileReader.prototype.readAsBinaryString === undefined) {
					FileReader.prototype.readAsBinaryString = function (fileData) {
						var binary = "";
						var pt = this;

						reader.onload = function (e) {
							var bytes = new Uint8Array(reader.result);
							var length = bytes.byteLength;
							for (var i = 0; i < length; i++) {
								binary += String.fromCharCode(bytes[i]);
							}
							//pt.result  - readonly so assign content to another property
							pt.content = binary;
							pt.onload(); // thanks to @Denis comment
						};
						reader.readAsArrayBuffer(fileData);
					};
				}
				reader.readAsBinaryString(this.oUploadedFile);

				reader.onload = $.proxy(function (e) {
					var strCSV = e.target.result;
					if (reader.result) reader.content = reader.result;
					this.oBase = btoa(reader.content);

				}, this);

			} else {
				MessageToast.show(oBundle.getText("PleaseSaveClaimtryAttachments"), {
					my: "center center",
					at: "center center"
				});
			}

		},

		onFileSizeExceed: function () {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			MessageToast.show(oBundle.getText("FileSizeExceed"), {
				my: "center center",
				at: "center center"
			});
		},
		onFileNameLengthExceed: function () {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			MessageToast.show(oBundle.getText("FileNameExceed"), {
				my: "center center",
				at: "center center"
			});
		},
		fn_damageCallforVLC : function(){
			var oProssingModel = this.getModel("ProssingModel");

			oProssingModel.read("/zc_dmg_type_codesSet", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/DataTypeCode", data.results);
				}, this),
				error: function () {

				}
			});

			oProssingModel.read("/zc_dmg_area_codesSet", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/DataAreaCode", data.results);
				}, this),
				error: function () {

				}
			});

			oProssingModel.read("/zc_dmg_sevr_codesSet", {
				urlParameters: {
					"$filter": "LanguageKey eq '" + sSelectedLocale.toUpperCase() + "' "
				},
				success: $.proxy(function (data) {
					this.getModel("LocalDataModel").setProperty("/DataSeverety", data.results);
				}, this),
				error: function () {

				}
			});

		},
		_createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				this.getView().addDependent(oDialog);
			}

			return oDialog;
		},
		_sortDialogPopUp : function(){
			this._createViewSettingsDialog("zclaimProcessing.view.fragments.SortOrder").open();
			var osId = this._createViewSettingsDialog("zclaimProcessing.view.fragments.SortOrder").sId;
			if (sSelectedLocale.toUpperCase() === "FR") {
				setTimeout(function () {
					var sInnerText = document.getElementById(osId+"-sortorderlist").innerHTML;
					var sSortBy = sInnerText.replace("Sort By", "Tri");
					var sAssecending = sSortBy.replace("Ascending", "Ascendant");
					var sDescending = sAssecending.replace("Descending", "Descendant");
					var sSortList = document.getElementById(osId+"-sortlist").innerHTML;
					var sSortObj = sSortList.replace("Sort Object", "Trier par");
					document.getElementById(osId+"-sortorderlist").innerHTML = sDescending;
					document.getElementById(osId+"-sortlist").innerHTML = sSortObj;
				}, 300);
			}
		}

	});
});