sap.ui.define([
	"com/pfcindia/apphrmanageclaim/controller/BaseController",
	"com/pfcindia/apphrmanageclaim/model/formatter"
], function(BaseController,formatter) {
	"use strict";

	return BaseController.extend("com.pfcindia.apphrmanageclaim.controller.DisplayItem", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.DisplayItem
		 */
		formatter: formatter,
		
		onInit: function() {
			this.getRouter().getRoute("displayitem").attachPatternMatched(this._onRouteMatched, this);
			this.aForms = [
				"com.pfcindia.apphrmanageclaim.view.DisplayItem.ObjectPage.SupplierForm",
				"com.pfcindia.apphrmanageclaim.view.DisplayItem.ObjectPage.AssetForm",
				"com.pfcindia.apphrmanageclaim.view.DisplayItem.ObjectPage.InvoiceForm"
			];
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.pfcindia.apphrmanageclaim.view.DisplayItem
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.DisplayItem
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.DisplayItem
		 */
		//	onExit: function() {
		//
		//	}

		_setFieldVisibility: function(oResponse) {
			var oElementBinding = this.getView().getElementBinding(),
				oHeader = this.getModel().getObject(oElementBinding.getBoundContext().getPath() + "/to_Header"),
				aConfig = this.getView().getModel("config").getObject("/config"),
				oFormConfig = aConfig.find(function(oConfig) {
					return oHeader.ReimbursementCategory === oConfig.category && oHeader.ReimbursementCode === oConfig.code;
				});
			this.aForms.forEach(function(sForm) {
				var oForm = this.getView().byId(sForm),
					aFormFields = oForm.getSmartFields();
				aFormFields.forEach(function(oField) {
					var sFieldName = oField.getBindingInfo("value").parts[0].path,
						bFound = oFormConfig.visible.find(function(sField) {
							return sField === sFieldName;
						}) ? true : false;
					oField.setVisible(bFound);
				}.bind(this));
			}.bind(this));
		},
		_onRouteMatched: function(oEvent) {
			var sClaimid = oEvent.getParameter("arguments").claimid,
				sItem = oEvent.getParameter("arguments").item;
			this.getView().bindElement({
				path: "/ZHR_I_CLM_ITEMS(ClaimId='" + sClaimid + "',Item='" + sItem + "')",
				parameters: {
					expand: "to_Header"
				},
				events: {
					change: this._setFieldVisibility.bind(this)
				}
			});
		}

	});

});