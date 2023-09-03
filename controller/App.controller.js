sap.ui.define([
	"com/pfcindia/apphrmanageclaim/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("com.pfcindia.apphrmanageclaim.controller.App", {
		onInit: function(){
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.createAppModel();
		}
	});
});