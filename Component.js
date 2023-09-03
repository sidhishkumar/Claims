sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/pfcindia/apphrmanageclaim/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("com.pfcindia.apphrmanageclaim.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			//
			this.oRouter = this.getRouter();
			this.oRouter = this.getRouter().initialize();
		},
		getContentDensityClass: function() {
			if (!this._sContentDensityClass) {
				if (!Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});