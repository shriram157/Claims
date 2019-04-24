sap.ui.define(['sap/m/ComboBox'],
	function (ComboBox) {
		'use strict';
		var CustomCombo = ComboBox.extend("zclaimProcessing.control.CustomCombo", {

			renderer: "sap.m.ComboBoxRenderer"

		});
		CustomCombo.prototype.onAfterRendering = function (oEvent) {
			ComboBox.prototype.onAfterRendering.apply(this, arguments);
			oEvent.srcControl._$input.attr("readonly", true);
		};

		return CustomCombo;
	});