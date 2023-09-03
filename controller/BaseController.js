sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/pfcindia/apphrmanageclaim/model/models",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History"
], function(Controller, models, MessageToast, History) {
	"use strict";

	return Controller.extend("com.pfcindia.apphrmanageclaim.controller.BaseController", {
		createAppModel: function() {
			this.getView().setModel(models.createAppModel(), "appModel");
		},
		getAppModel: function() {
			return this.getView().getModel("appModel");
		},
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},
		getModel: function() {
			return this.getView().getModel();
		},
		getMessageManager: function() {
			return sap.ui.getCore().getMessageManager();
		},
		getActivePersonnel: function(bForce) {
			
			return new Promise(function(resolve, reject) {

				if (this.getOwnerComponent()._oActivePersonnel && !bForce) {
					return resolve(this.getOwnerComponent()._oActivePersonnel);
				}

				this.getModel().read("/ZHR_I_CLM_EMP_PERSONNEL", {
					urlParameters: {
						"$expand": "to_ELIGIBILITY"
					},
					success: function(oResponse) {
						this.getOwnerComponent()._oActivePersonnel = oResponse.results[0];
						resolve(this.getOwnerComponent()._oActivePersonnel);
					}.bind(this),
					error: function(oError) {
						reject(oError);
					}.bind(this)
				});
			}.bind(this));
		},
		getApplicationTypeText: function(sHremc, sRemc) {
			return new Promise(function(resolve, reject) {
				var sPath = "/" + this.getModel().createKey("ZHR_I_CLM_REIMCODE_TEXT", {
					ReimbursementCategory: sHremc,
					ReimbursementCode: sRemc,
					language: "EN"
				});
				this.getModel().read(sPath, {
					success: function(oResponse) {
						resolve(oResponse.ReimCodeDescription);
					}.bind(this),
					error: function(oError) {
						reject(oError);
					}.bind(this)
				});
			}.bind(this));
		},
		getHeaderContext: function() {
			return this.getOwnerComponent()._oHeaderContext;
		},
		setContext: function(sPersonnelNumber) {
			this.getActivePersonnelDetails(sPersonnelNumber).then(this._setPersonnel.bind(this));
		},
		setHeaderContext: function(oContext) {
			this.getOwnerComponent()._oHeaderContext = oContext;
		},
		showMessage: function(sMsg) {
			MessageToast.show(sMsg);
		},
		navBack: function(sAltRoute) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if(!sAltRoute){
				sAltRoute = "list";	
			}
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo(sAltRoute, {}, true);
			}
		},
		_setPersonnel: function(oPersonnelModel) {
			this.getView().setModel(oPersonnelModel, "personnelModel");
		}
	});
});