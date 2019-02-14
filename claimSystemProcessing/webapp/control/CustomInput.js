sap.ui.define(['sap/m/Input'],
function(Input){
	'use strict';
	var CustomInput = Input.extend("zclaimProcessing.control.CustomInput", {
		metadata : {
			events : {
				"press" : {
				
				}
			}
		},
		onkeyup: function(evt){
			this.setValue(this.getValue().replace(/[^\d]/, ''));
		},
	
		renderer :"sap.m.InputRenderer"	
		
	});
	CustomInput.prototype.onAfterRendering = function(){
		this.setValue(this.getValue().replace(/[^\d]/, ''));
	};
	return CustomInput;
});