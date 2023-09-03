sap.ui.define([
	"com/pfcindia/apphrmanageclaim/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/ui/model/Sorter"
], function(BaseController, Fragment, syncStyleClass, Sorter) {
	"use strict";

	return BaseController.extend("com.pfcindia.apphrmanageclaim.controller.List", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.List
		 */
		onInit: function() {
			this.getRouter().getRoute("list").attachPatternMatched(this._onRouteMatched, this);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.pfcindia.apphrmanageclaim.view.List
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.List
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.List
		 */
		//	onExit: function() {
		//
		//	}
		onBeforeRebindClaimTable: function(oEvent) {
			oEvent.getParameter("bindingParams").sorter.push(new Sorter({
				path: "ClaimId",
				descending: true
			}));
		},
		onAddNew: function() {
			if (!this._oCategoryDialog) {
				this._oCategoryDialog = this.loadFragment({
					name: "com.pfcindia.apphrmanageclaim.view.fragment.CategorySelectDialog"
				});
			}
			this._oCategoryDialog.then(function(oDialog) {
				syncStyleClass(this.getOwnerComponent().getContentDensityClass(), this.getView(), oDialog);
				this.getView().addDependent(oDialog);
				oDialog.open();
			}.bind(this));
		},
		onRowSelection: function(oEvent) {
			var oSelectedItem = oEvent.getSource(),
				sPath = oSelectedItem.getBindingContext().getPath(),
				oItem = oSelectedItem.getModel().getObject(sPath);
			this.getModel().resetChanges([], true, true);
			if (oItem.Status === "0") {
				this.getRouter().navTo("edit", {
					claimid: oItem.ClaimId
				});
			} else {
				this.getRouter().navTo("display", {
					claimid: oItem.ClaimId
				});
			}
		},
		onTableUpdateFinished: function(oEvent) {
			this._oTable = oEvent.getSource();
		},
		onProceed: function(oEvent) {
			var oFB = this.getView().byId("com.pfcindia.apphrmanageclaim.view.fragment.CategorySelectDialog.filterBar"),
				oFilters = oFB.getFilterData();
			if (!oFilters.ReimbursementCategory || !oFilters.ReimbursementCode) {
				this.showMessage("Fill up all required fields!");
			}
			var oRemCodeFilter = oFB.getFiltersWithValues().find(function(oFilterItem) {
				return oFilterItem.getControl().getSelectedKey() === oFilters.ReimbursementCode;
			});
			this.getAppModel().setProperty("/remcText", oRemCodeFilter.getControl().getValue());
			this.getActivePersonnel(true).then(function(oPersonnel) {
				var aEligibility = oPersonnel.to_ELIGIBILITY.results;
				if (aEligibility.length === 0) {
					this.showMessage("Eligibility Matrix is not maintained for you.");
					return;
				}
				var oCurrent = aEligibility.find(function(oEligibility) {
					return oEligibility.ReimbursementCategory === oFilters.ReimbursementCategory && oEligibility.ReimbursementCode === oFilters.ReimbursementCode;
				});

				if (oCurrent.IsEligible === "N") {
					this.showMessage("You are not eligible for this claim category & code");
					return;
				}

				oPersonnel.eligibility = oCurrent;

				this.getModel().resetChanges([], true, true);

				if (this.getHeaderContext()) {
					this.getModel().resetChanges([this.getHeaderContext().getPath()], true, true);
				}
				
				this.getRouter().navTo("new", {
					category: oFilters.ReimbursementCategory,
					code: oFilters.ReimbursementCode
				});
			}.bind(this));
		},
		onCancel: function(oEvent) {
			oEvent.getSource().getParent().close();
		},
		_onRouteMatched: function() {
			this.getModel().refresh(true);
		}
	});

});