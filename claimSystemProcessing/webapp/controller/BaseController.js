sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/Device",
	'sap/m/MessageToast'
], function (Controller, History, Device, MessageToast) {
	"use strict";

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
					//var userType = oData.loggedUserType[0];
					var userType = "Dealer_Services_Admin";
					//var userType = "Dealer_Parts_Admin";
					sap.ui.getCore().getModel("UserDataModel").setProperty("/LoggedInUser", userType);
					sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "");
					switch (userType) {
					case "Dealer_Parts_Admin":

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
					case "Dealer_Services_Admin":
						// console.log("Dealer_Services_Admin");
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
						// console.log("Dealer_User");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyCoverageClaimLabour");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						//that.getOwnerComponent().getRouter().navTo("QueryCoverageTools");
						/*Uncomment for security*/
						break;
					case "TCI_Admin":
						// console.log("TCI_Admin");
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
						// console.log("TCI_User");
						sap.ui.getCore().getModel("UserDataModel").setProperty("/UserScope", "ReadOnlyCoverageClaim");
						/*Uncomment for security*/
						that.getView().getModel("HeaderLinksModel").setProperty("/NewClaim", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/ViewUpdateClaims", false);
						that.getView().getModel("HeaderLinksModel").setProperty("/QuickCoverageTool", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/ClaimInquiry", true);
						that.getView().getModel("HeaderLinksModel").setProperty("/DealerLabourRateInquiry", false);

						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						sap.ui.getCore().getModel("HeaderLinksModel").updateBindings(true);
						//that.getOwnerComponent().getRouter().navTo("QueryCoverageTools");
						/*Uncomment for security*/
						break;
					case "Zone_User":
						// console.log("Zone_User");
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
					console.log(appData);
					this.getModel("LocalDataModel").setProperty("/oECPURL", appData.ecpSalesAppUrl);
					this.getModel("LocalDataModel").setProperty("/oCICURL", appData.cicUrl);
					this.getModel("LocalDataModel").setProperty("/oCVSHURL", appData.cvshUrl);
				}, this),
				error: function (err) {
					console.log(err);
				}
			});

			// get the attributes and BP Details - Minakshi to confirm if BP details needed		// TODO: 
			$.ajax({
				url: this.sPrefix + this.attributeUrl,
				type: "GET",
				dataType: "json",

				success: function (oData) {
					console.log(oData);
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
				//----------------------------------
				//Code of Dealer Labour--------------
				//------------------------------------
				//that.getDealerlabour(data.attributes[0]);
			});

		},
		onPressAddPart: function () {
			this.getView().getModel("PartDataModel").setProperty("/matnr", "");
			this.getView().getModel("PartDataModel").setProperty("/quant", "");
			this.getView().getModel("PartDataModel").setProperty("/PartDescription", "");
			this.getView().getModel("LocalDataModel").setProperty("/BaseUnit", "");

			var oTable = this.getView().byId("idTableParts");
			oTable.removeSelections("true");
			this.getView().getModel("DateModel").setProperty("/partLine", true);
			this.getView().getModel("DateModel").setProperty("/editablePartNumber", true);

			var sSelectedLocale;
			var sDivision;

			var isDivisionSent = window.location.search.match(/Division=([^&]*)/i);
			if (isDivisionSent) {
				sDivision = window.location.search.match(/Division=([^&]*)/i)[1];
			} else {
				sDivision = 10;
			}
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oClaimModel = this.getModel("ProssingModel");
			var productModel = this.getModel("ProductMaster");

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
		onUploadComplete: function (oEvent) {

			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var fileType = this.oUploadedFile.type;
			//var oUploadedFileArr = this.oUploadedFile.name.split(".").reverse();
			//var oFileExt = oUploadedFileArr[0].length;
			var oFileName = this.oUploadedFile.name;

			var fileNamePrior = "HEAD@@@" + oFileName;
			var fileName = fileNamePrior;
			var isProxy = "";
			if (window.document.domain == "localhost") {
				isProxy = "proxy";
			}
			var oURI = isProxy + "/node/ZDLR_CLAIM_SRV/zc_attachSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + fileName +
				"')/$value";

			if (oURI == null) {

				//MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
			}

			var itemObj = {
				"NumberOfWarrantyClaim": oClaimNum,
				"COMP_ID": fileName,
				"ContentLine": this.oBase,
				"Mimetype": fileType,
				"URI": oURI,
				"AttachLevel": "HEAD"
			};

			this.obj.zc_claim_attachmentsSet.results.push(itemObj);

			var oClaimModel = this.getModel("ProssingModel");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			oClaimModel.refreshSecurityToken();

			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					this.getModel("LocalDataModel").setProperty("/IndicatorState", false);
					this.getView().getModel("LocalDataModel").setProperty("/OFPDescription", response.OFPDescription);
					this.getView().getModel("LocalDataModel").setProperty("/MainOpsCodeDescription", response.MainOpsCodeDescription);
					MessageToast.show(oBundle.getText("SuccesFullyUploaded"), {
						my: "center center",
						at: "center center"
					});
					this.obj.zc_claim_attachmentsSet.results.pop();
					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
						},
						//	startswith(CompanyName, 'Alfr') eq true
						success: $.proxy(function (odata) {
							var oArr = odata.results;
							var oAttachSet = oArr.map(function (item) {
								item.FileName = item.FileName.replace("HEAD@@@", "");
								return item;

							});

							//this.getModel("LocalDataModel").setProperty("/oAttachmentSet", odata.results);
							//this.getView().getModel("ClaimModel").setProperty("/" + "/items", oArr);
							this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", oAttachSet);

							// // this.getModel("LocalDataModel").setProperty("/oAttachmentSet", );
							// this.getView().getModel("ClaimModel").setProperty(sCurrentPath + "/items", odata.results);
						}, this)
					});

				}, this),
				error: function (err) {
					console.log(err);
				}
			});

		},

		onFileDeleted: function (oEvent) {
			var oClaimNum = this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var oClaimModel = this.getModel("ProssingModel");

			var oLine = oEvent.getSource()._oItemForDelete._iLineNumber;
			var oFileName = this.getModel("LocalDataModel").getProperty("/HeadAtchmentData/" + oLine + "/FileName");
			var oFileToDelete = "HEAD@@@" + oFileName;

			oClaimModel.refreshSecurityToken();

			oClaimModel.remove("/zc_claim_attachmentsSet(NumberOfWarrantyClaim='" + oClaimNum + "',FileName='" + oFileToDelete + "')", {
				method: "DELETE",
				success: $.proxy(function () {
					MessageToast.show(oBundle.getText("Filedeletedsuccessfully"), {
						my: "center center",
						at: "center center"
					});
					oClaimModel.read("/zc_claim_attachmentsSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + oClaimNum + "'and AttachLevel eq 'HEAD' and FileName  eq ''"
						},

						success: $.proxy(function (odata) {
							var oArr = odata.results;
							var oAttachSet = oArr.map(function (item) {
								item.FileName = item.FileName.replace("HEAD@@@", "");
								return item;

							});
							// this.getView().getModel("ClaimModel").setProperty("/" + "/items", oArr);
							this.getModel("LocalDataModel").setProperty("/HeadAtchmentData", oAttachSet);

						}, this)
					});
				}, this)
			});

		},
		onPost: function (oEvent) {

			var oBusinessModel = this.getModel("ApiBusinessModel");
			this.getModel("LocalDataModel").setProperty("/commentIndicator", true);

			var oPartner = this.getModel("LocalDataModel").getProperty("/BpDealerModel/0/BusinessPartnerKey");

			var oClaimModel = this.getModel("ProssingModel");

			var sSelectedLocale;
			//  get the locale to determine the language.
			var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
			if (isLocaleSent) {
				sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
			} else {
				sSelectedLocale = "en"; // default is english
			}
			var oFormat = DateFormat.getDateTimeInstance({
				style: "medium"
			});

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd HH:mm:ss"
			});
			var oDate = oDateFormat.format(new Date());
			// 			var oObject = this.getView().getBindingContext().getObject();
			var sValue = oEvent.getParameter("value");

			var oCurrentDt = new Date();

			var oEntry = {

				"HeadText": this.getModel("LocalDataModel").getProperty("/BPOrgName") + "(" + oDate + ") " + " : " + sValue,
				"NumberOfWarrantyClaim": this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum"),
				"LanguageKey": sSelectedLocale.toUpperCase(),
				"User": "",
				"Date": null
			};
			this.obj.NumberOfWarrantyClaim = this.getView().getModel("HeadSetData").getProperty("/NumberOfWarrantyClaim");

			this.obj.zc_claim_commentSet.results.push(oEntry);

			oClaimModel.refreshSecurityToken();
			oClaimModel.create("/zc_headSet", this.obj, {
				success: $.proxy(function (data, response) {
					this.getModel("LocalDataModel").setProperty("/commentIndicator", false);
					oClaimModel.read("/zc_headSet", {
						urlParameters: {
							"$filter": "NumberOfWarrantyClaim eq '" + this.getModel("LocalDataModel").getProperty("/WarrantyClaimNum") +
								"'and LanguageKey eq '" + sSelectedLocale.toUpperCase() + "'",
							"$expand": "zc_claim_commentSet"
						},
						success: $.proxy(function (sdata) {
							this.getModel("LocalDataModel").setProperty("/claim_commentSet", sdata.results[0].zc_claim_commentSet.results);
						}, this)
					});
				}, this)
			});
		}

	});
});