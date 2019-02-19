sap.ui.define(['sap/m/Input'],
function(Input){
	'use strict';
	var CustomInput = Input.extend("zclaimProcessing.control.CustomInputDecimal", {
		metadata : {
			events : {
				"press" : {
				
				}
			}
		},
		// onkeyup: function(evt){
		// 	this.setValue(this.getValue().replace(/^[+-=]*[A-Z_]*$/gi, ""));
		// },
		onkeyup : function(){
			this.setValue(this.getValue().replace(/^[+-]*[A-Z_]*$/gi, ""));
		},
	
		renderer :"sap.m.InputRenderer"	
		
	});
	CustomInput.prototype.onAfterRendering = function(){
		this.setValue(this.getValue().replace(/^[+-]*[A-Z_]*$/gi, ""));
	};
	return CustomInput;
});