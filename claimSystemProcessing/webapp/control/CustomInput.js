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
			this.setValue(this.getValue().match(/^(?=.{1,6}$)^[+-]?\d+(\.\d+)?([Ee][+-]?\d+)?$/g));
		},
	
		renderer :"sap.m.InputRenderer"	
		
	});
	CustomInput.prototype.onAfterRendering = function(){
		this.setValue(this.getValue().match(/^(?=.{1,6}$)^[+-]?\d+(\.\d+)?([Ee][+-]?\d+)?$/g));
	};
	return CustomInput;
});