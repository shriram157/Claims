sap.ui.define(['sap/m/Input'],
function(Input){
	'use strict';
	var CustomVinInput = Input.extend("zclaimProcessing.control.CustomVinInput", {
		metadata : {
			events : {
				"change" : {
				
				}
			}
		},
		onkeyup: function(evt){
			this.setValue(this.getValue().match(/^[A-Z 0-9 a-z]{1,17}$/g));
		},
	
		renderer :"sap.m.InputRenderer"	
		
	});
	CustomVinInput.prototype.onAfterRendering = function(){
		this.setValue(this.getValue().match(/^[A-Z 0-9 a-z]{1,17}$/g));
	};
	return CustomVinInput;
});