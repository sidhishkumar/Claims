sap.ui.define([
	"com/pfcindia/apphrmanageclaim/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.pfcindia.apphrmanageclaim.controller.DisplayClaim", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.DisplayClaim
		 */
		onInit: function() {
			this.getRouter().getRoute("display").attachPatternMatched(this._onRouteMatched, this);
			//"com.pfcindia.apphrmanageclaim.view.DisplayClaim.DynamicPage.smartTable"
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.pfcindia.apphrmanageclaim.view.DisplayClaim
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.DisplayClaim
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.DisplayClaim
		 */
		//	onExit: function() {
		//
		//	}
		onRowSelection: function(oEvent) {
			var oSelectedItem = oEvent.getSource(),
				sPath = oSelectedItem.getBindingContext().getPath(),
				oItem = oSelectedItem.getModel().getObject(sPath);
			this.getRouter().navTo("displayitem", {
				claimid: oItem.ClaimId,
				item: oItem.Item
			});
		},
		_onRouteMatched: function(oEvent) {
			var sClaimid = oEvent.getParameter("arguments").claimid;
			
			this.getView().bindElement({
				path: "/ZHR_C_CLAIM('" + sClaimid + "')",
				parameters: {
					expand: "to_Requester,to_CurrentAgent,to_ReimCode,to_Status"
				},
				events: {
					dataReceived: function(oEvent) {
						var oData = oEvent.getParameter("data");
						var oUndertaking = this.getView().getModel("undertaking").getObject("/" + oData.ReimbursementCategory + "-" + oData.ReimbursementCode);                            
						this.getView().setModel(new JSONModel(oUndertaking), "note");
					}.bind(this)
				}
			});
		}
	});

});