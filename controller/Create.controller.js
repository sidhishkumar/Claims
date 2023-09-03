sap.ui.define([
	"com/pfcindia/apphrmanageclaim/controller/BaseController",
	"com/pfcindia/apphrmanageclaim/util/Claim",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(BaseController, Claim, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("com.pfcindia.apphrmanageclaim.controller.Create", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.Create
		 */
		onInit: function() {
			this.oMessageManager = sap.ui.getCore().getMessageManager();
			this.oMessageManager.registerObject(this.getView(), true);
			this.getView().setModel(this.oMessageManager.getMessageModel(), "message");
			this.getRouter().getRoute("new").attachPatternMatched(this._onRouteNewMatched, this);
			this.getRouter().getRoute("edit").attachPatternMatched(this._onRouteEditMatched, this);
			this.getView().addEventDelegate({
				onAfterHide: function(oEvent) {
					this.oMessageManager.removeAllMessages();
				}
			}, this);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.pfcindia.apphrmanageclaim.view.Create
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.Create
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.Create
		 */
		//	onExit: function() {
		//
		//	}
		onApprovalTableUpdateFinished: function(oEvent){
			if(oEvent.getParameter("actual") > 0){
				this.getAppModel().setProperty("/showApprovalHistory", true);
			}else{
				this.getAppModel().setProperty("/showApprovalHistory", false);
			}
		},
		onNewInvoice: function() {
			this.getModel().resetChanges([], true, true);
			this.getActivePersonnel().then(function(oPersonnel) {
				if (!this.getHeaderContext()) {
					this.getModel().setDeferredGroups(["newclaim"]);
					this.oContext = this.getModel().createEntry("ClaimSet", {
						groupId: "newclaim",
						properties: {
							Claimid: this._oParams.claimid,
							Pernr: oPersonnel.PersonnelNumber,
							Hremc: this._oParams.category,
							Remc: this._oParams.code,
							Erdat: new Date(),
							Zyear: oPersonnel.FiscalYear
						}
					});
					this.setHeaderContext(this.oContext);
					this.getRouter().navTo("newitem");
				} else {
					this.getRouter().navTo("newitem", {}, true);
				}
			}.bind(this));
		},
		onEditInvoice: function(oEvent) {
			this.getRouter().navTo("edititem", {
				claimid: oEvent.getSource().getParent().getCustomData()[0].getValue("Claimid"),
				item: oEvent.getSource().getParent().getCustomData()[1].getValue("Item")
			});
		},
		onDeleteInvoice: function(oEvent) {
			var sClaimid = oEvent.getSource().getParent().getCustomData()[0].getValue("Claimid"),
				sItem = oEvent.getSource().getParent().getCustomData()[1].getValue("Item");
			MessageBox.warning("Invoice will be deleted. Are you sure?", {
				actions: ["Yes", MessageBox.Action.CLOSE],
				emphasizedAction: "Yes",
				onClose: function(sAction) {
					if (sAction === "Yes") {
						this.getView().setBusy(true);
						this.getModel().callFunction("/DeleteItem", {
							method: "POST",
							urlParameters: {
								Claimid: sClaimid,
								Item: sItem
							},
							success: function(oData) {
								this.getModel().refresh();
								this.getView().setBusy(false);
								this.showMessage("Invoice Deleted");
							}.bind(this),
							error: this._handleException.bind(this)
						});
					}
				}.bind(this)
			});
		},
		onCancel: function() {
			this.navBack();
		},
		onSubmit: function() {
			if (this.getAppModel().getProperty("/termAcceptanceFlag") === false) {
				this.showMessage("Please accept the undertaking");
				return;
			}
			if (this._itemCount === 0) {
				this.showMessage("Add invoices first");
				return;
			}
			this.getView().setBusy(true);
			this.getModel().callFunction("/SubmitClaim", {
				method: "POST",
				urlParameters: {
					Claimid: this._oParams.claimid
				},
				success: function(oData) {
						this.getView().setBusy(false);
						this.showMessage("Request has been submitted");
						this.getRouter().navTo("display", {
							claimid: this._oParams.claimid
						}, true);
					}.bind(this)
					// error: this._handleException.bind(this)
			});
		},
		onTableUpdateFinished: function(oEvent) {
			var iNetInvoiceAmount = 0.00;
			this._itemCount = oEvent.getParameter("actual");
			if (this._itemCount === 0) {
				this.getAppModel().setProperty("/showSubmit", false);
			} else {
				this.getAppModel().setProperty("/showSubmit", true);
			}
			var aItems = oEvent.getSource().getItems();
			aItems.forEach(function(oItem) {
				iNetInvoiceAmount = iNetInvoiceAmount + parseFloat(oItem.getBindingContext().getObject().Invoiceamt, 2);
			});
			this.getAppModel().setProperty("/netInvoiceAmount", iNetInvoiceAmount.toString());
		},
		_handleException: function() {
			this.getView().setBusy(false);
			var oButton = this.getView().byId("com.pfcindia.apphrmanageclaim.view.Create.messageButton");
			if (!this._oMessagePopover) {
				this._oMessagePopover = this.loadFragment({
					name: "com.pfcindia.apphrmanageclaim.view.fragment.MessagePopover"
				});
			}
			this._oMessagePopover.then(function(oMessagePopover) {
				oMessagePopover.openBy(oButton);
			});
		},
		_onRouteNewMatched: function(oEvent) {
			this.getView().unbindElement();
			var oParams = oEvent.getParameter("arguments");
			var oUndertaking = this.getView().getModel("undertaking").getObject("/" + oParams.category + "-" + oParams.code);
			this.getView().setModel(new JSONModel(oUndertaking), "note");
			this.getActivePersonnel().then(function(oPersonnel) {
				oPersonnel.Status = "Pending";
				this.getView().setModel(new JSONModel(oPersonnel), "personnel");
				this.getAppModel().setProperty("/showSubmit", false);
				this.getAppModel().setProperty("/termAcceptanceFlag", false);
				this.getModel().setDeferredGroups(["newclaim"]);
				this.oContext = this.getModel().createEntry("ClaimSet", {
					groupId: "newclaim",
					properties: {
						Pernr: oPersonnel.PersonnelNumber,
						Hremc: oParams.category,
						Remc: oParams.code,
						Erdat: new Date(),
						Zyear: oPersonnel.FiscalYear
					}
				});
				this.getAppModel().setProperty("/selectedCategory", oParams.category);
				this.getAppModel().setProperty("/selectedCode", oParams.code);
				this.getView().setBindingContext(this.oContext);
				this.setHeaderContext(this.oContext);
				this._oParams = oParams;
			}.bind(this));
		},
		_onRouteEditMatched: function(oEvent) {
			var oParams = oEvent.getParameter("arguments");
			//this.getView().unbindElement();
			this.getModel().refresh();
			this.getActivePersonnel().then(function(oPersonnel) {

				var sPath = "/ClaimSet('" + oParams.claimid + "')";
				
				this.getModel().invalidateEntry(sPath);
				
				oPersonnel.Status = "Pending";

				this.getAppModel().setProperty("/showSubmit", true);
				this.getAppModel().setProperty("/termAcceptanceFlag", false);
				this.setHeaderContext(null);

				this.getView().bindElement({
					path: sPath,
					parameters: {
						expand: "HeaderToItems,to_remarks"
					},
					events: {
						dataReceived: function(oEvt) {
							var oData = oEvt.getParameter("data");

							if (oData.Status !== "0") {
								this.getRouter().navTo("list", {}, true);
								return;
							}

							this._oParams = {
								claimid: oData.Claimid,
								category: oData.Hremc,
								code: oData.Remc
							};
							this.getAppModel().setProperty("/selectedCategory", oData.Hremc);
							this.getAppModel().setProperty("/selectedCode", oData.Remc);

							oPersonnel.eligibility = {
								MaxEntitlementAmount: oData.Amt,
								NextEligibilityDate: oData.Nexteldate
							};

							this.getView().setModel(new JSONModel(oPersonnel), "personnel");

							this.getApplicationTypeText(oData.Hremc, oData.Remc).then(function(sText) {
								this.getAppModel().setProperty("/remcText", sText);
							}.bind(this));
							var oUndertaking = this.getView().getModel("undertaking").getObject("/" + oData.Hremc + "-" + oData.Remc);
							this.getView().setModel(new JSONModel(oUndertaking), "note");
							
						}.bind(this)
					}
				});
				//this.setHeaderContext(this.oContext);
			}.bind(this));
		}

	});

});