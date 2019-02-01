function initModel() {
	var sUrl = "/ecpSales_node_secured/node/ZECP_SALES_ODATA_SERVICE_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}