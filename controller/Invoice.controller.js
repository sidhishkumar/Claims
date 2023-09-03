sap.ui.define([
	"com/pfcindia/apphrmanageclaim/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/Item",
	"sap/ui/core/message/Message"
], function(BaseController, MessageBox, CoreItem, Message) {
	"use strict";

	return BaseController.extend("com.pfcindia.apphrmanageclaim.controller.Invoice", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.Invoice
		 */
		onInit: function() {
			this.aForms = [
				"com.pfcindia.apphrmanageclaim.view.Invoice.ObjectPage.SupplierForm",
				"com.pfcindia.apphrmanageclaim.view.Invoice.ObjectPage.AssetForm",
				"com.pfcindia.apphrmanageclaim.view.Invoice.ObjectPage.InvoiceForm"
			];
			this.oMessageManager = sap.ui.getCore().getMessageManager();
			this.oMessageManager.registerObject(this.getView(), true);
			this.getView().setModel(this.oMessageManager.getMessageModel(), "message");
			this.getRouter().getRoute("newitem").attachPatternMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("edititem").attachPatternMatched(this._onEditRouteMatched, this);
			this.oUploadSet = this.getView().byId("com.pfcindia.apphrmanageclaim.view.Invoice.uploader");
			this.getView().addEventDelegate({
				onAfterHide: function(oEvent) {
					this.oMessageManager.removeAllMessages();
					this._edit = false;
					this.getView().unbindElement();

					this.aForms.forEach(function(sFormId) {
						var oForm = this.getView().byId(sFormId);
						var aFields = oForm.getSmartFields(true, true);
						aFields.forEach(function(oField) {
							oField.setSimpleClientError(false);
						});
					}.bind(this));
				}
			}, this);
			this.oAttachmentMandatoryMessage = new Message({
				message: "Attachment is mandatory",
				type: "Error"
			});
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.pfcindia.apphrmanageclaim.view.Invoice
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.Invoice
		 */
		onAfterRendering: function() {
			this._oUploadSet = this.getView().byId("com.pfcindia.apphrmanageclaim.view.Invoice.uploader");
			this._oUploadSet.getDefaultFileUploader().setMultiple(false);
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.pfcindia.apphrmanageclaim.view.Invoice
		 */
		//	onExit: function() {
		//
		//	}
		onBeforeUploadStarts: function(oEvent) {
			this.oUploadSet = oEvent.getSource();
			this.getModel().refreshSecurityToken();

			this.oUploadSet.removeAllHeaderFields();

			this.oUploadSet.addHeaderField(new CoreItem({
				key: "x-csrf-token",
				text: this.getView().getModel().oHeaders["x-csrf-token"]
			}));

			this.oUploadSet.addHeaderField(new CoreItem({
				key: "Accept",
				text: "application/json"
			}));

			this.oUploadSet.addHeaderField(new CoreItem({
				key: "slug",
				text: oEvent.getParameter("item").getFileName()
			}));

			var sPath = this.getModel().sServiceUrl;
			sPath = sPath + "/" + this.getModel().createKey("ClaimItemsSet", {
				Claimid: this.sClaimid,
				Item: this.sItem
			}) + "/ToAttachment";
			this.oUploadSet.getIncompleteItems()[0].setUploadUrl(sPath);
		},
		onUploadCompleted: function() {
			this.showMessage("Attachment is uploaded");
		},
		onSave: function() {
			
			
			
			var bError = false;

			this.oMessageManager.removeMessages([this.oAttachmentMandatoryMessage]);

			if (!this.getModel().hasPendingChanges() && this.oUploadSet.getIncompleteItems().length === 0) {
				this.showMessage("No changes have been made");
				return;
			}

			this.aForms.forEach(function(sFormId) {
				var oForm = this.getView().byId(sFormId);
				if (oForm.check().length !== 0) {
					bError = true;
				}
			}.bind(this));

			if (this.oUploadSet.getItems().length === 0 && this.oUploadSet.getIncompleteItems().length === 0) {
				this.oMessageManager.addMessages([this.oAttachmentMandatoryMessage]);
				bError = true;
			}
			if (bError) {
				this._handleException();
				return;
			}
			if (this.oItemContext) {
				var sPath = this.oItemContext.getPath(),
					sInvoiceDatePath = sPath + "/Bldat",
					sInvoiceDate = this.oItemContext.getModel().getProperty(sInvoiceDatePath);
				this.oItemContext.getModel().setProperty(sInvoiceDatePath, new Date(sInvoiceDate));
			}

			if (!this._edit) {
				var sGroupId = "newclaim";
			} else {
				sGroupId = "changes";
			}

			this.oMessageManager.removeAllMessages();

			if (!this.getModel().hasPendingChanges() && this.oUploadSet.getIncompleteItems().length > 0) {

				this.oUploadSet.upload();

			} else {
				
				this.getView().setBusy(true);
				
				this.getModel().submitChanges({
					groupId: sGroupId,
					success: function(oData) {

						this.getView().setBusy(false);
						if (oData.__batchResponses.length === 0) {
							return;
						}
						if (oData.__batchResponses[0].response) {
							if (oData.__batchResponses[0].response.statusCode !== 200) {
								this._handleException();
								return;
							}
						}
						this.showMessage("Invoice saved sucessfully");

						this.getModel().refresh();

						if (this.sClaimid) {
							this.oUploadSet.upload();
						} else {
							oData.__batchResponses[0].__changeResponses.forEach(function(oResponse) {
								if (!this.sClaimid) {
									this.sClaimid = oResponse.data["Claimid"];
								}
								if (!this.sItem) {
									this.sItem = oResponse.data["Item"];
								}
							}.bind(this));
							if (this.oUploadSet.getIncompleteItems().length > 0) {
								this.oUploadSet.upload();
							}
							this.getRouter().navTo("edit", {
								claimid: this.sClaimid
							}, true);
						}
					}.bind(this),
					error: this._handleException.bind(this)
				});
			}
		},
		onLocationChange: function(oEvent) {
			var sPath = this.getView().getBindingContext().getPath(),
				oItem = this.getModel().getObject(sPath);
			if (oItem.Location !== "I" || oItem.Zgsti !== "R") {
				this.getModel().setProperty(sPath + "/Gstin", "");
				this.getModel().setProperty(sPath + "/Taxcode", "");
				this.getModel().setProperty(sPath + "/Cgst", "0.000");
				this.getModel().setProperty(sPath + "/Igst", "0.000");
				this.getModel().setProperty(sPath + "/Sgst", "0.000");
				this.getModel().setProperty(sPath + "/Totamt", oItem.Invoiceamt);
			}
		},
		onAmountDetermination: function(oEvent) {
			var sPath = this.getView().getBindingContext().getPath(),
				oItem = this.getModel().getObject(sPath);

			if (oItem.Invoiceamt) {
				this.getModel().setProperty(sPath + "/Totamt", oItem.Invoiceamt);
			}

			if (!oItem.Taxcode || !oItem.Invoiceamt) {
				return;
			}

			this.getView().setBusy(true);
			this.getModel().callFunction("/GetTax", {
				method: "GET",
				urlParameters: {
					Mwskz: oItem.Taxcode,
					Wmwst: oItem.Invoiceamt
				},
				success: function(oData) {
					this.getModel().setProperty(sPath + "/Cgst", oData.Cgst);
					this.getModel().setProperty(sPath + "/Igst", oData.Igst);
					this.getModel().setProperty(sPath + "/Sgst", oData.Cgst);
					this.getModel().setProperty(sPath + "/Totamt", (parseFloat(oItem.Invoiceamt, 2) + parseFloat(oData.Wmwst, 2)).toFixed(2));
					this.getView().setBusy(false);
				}.bind(this)
			});
		},
		onCancel: function() {
			if (this.getModel().hasPendingChanges()) {
				MessageBox.warning("You will lose the changes if you leave this page", {
					actions: ["Leave Page", MessageBox.Action.CLOSE],
					emphasizedAction: "Leave Page",
					onClose: function(sAction) {
						if (sAction === "Leave Page") {
							if (this.oItemContext) {
								this.getModel().resetChanges([this.oItemContext.getPath()], true, true);
							}
							this.getModel().resetChanges();
							this.navBack();
						}
					}.bind(this)
				});
			} else {
				this.navBack();
			}
		},
		onMessagePopover: function(oEvent) {
			var oButton = oEvent.getSource();
			if (!this._oMessagePopover) {
				this._oMessagePopover = this.loadFragment({
					name: "com.pfcindia.apphrmanageclaim.view.fragment.MessagePopover"
				});
			}
			this._oMessagePopover.then(function(oMessagePopover) {
				oMessagePopover.openBy(oButton);
			}.bind(this));
		},
		onBeforeAttachmentAdded: function(oEvent) {
			//since only one attachment is allowed
			this.oUploadSet.removeAllIncompleteItems();
			this.oUploadSet.removeAllItems();
		},
		onAfterAttachmentAdded: function(oEvent) {
			this._oAttachment = oEvent.getSource();
		},
		onAfterAttachmentRemoved: function(oEvent) {
			this._oAttachment = null;
		},
		_handleException: function() {
			this.getView().setBusy(false);
			var oButton = this.getView().byId("com.pfcindia.apphrmanageclaim.view.Invoice.messageButton");
			if (!oButton) {
				return;
			}
			if (!this._oMessagePopover) {
				this._oMessagePopover = this.loadFragment({
					name: "com.pfcindia.apphrmanageclaim.view.fragment.MessagePopover"
				});
			}
			this._oMessagePopover.then(function(oMessagePopover) {
				oMessagePopover.openBy(oButton);
			});
		},
		_onRouteMatched: function(oEvent) {
			this.sClaimid = null;
			this.sItem = null;
			this._edit = false;
			
			if (this.oItemContext) {
				this.getModel().resetChanges([this.oItemContext.getPath()], true, true);
			}
			
			if(this.oUploadSet){
				this.oUploadSet.removeAllIncompleteItems();
			}
			
			this.getModel().setDeferredGroups(["newclaim"]);
			
			this.oItemContext = this.getModel().createEntry("HeaderToItems", {
				groupId: "newclaim",
				context: this.getHeaderContext(),
				properties: {
					Hremc: this.getAppModel().getProperty("/selectedCategory"),
					Remc: this.getAppModel().getProperty("/selectedCode")
				}
			});
			this.getView().setBindingContext(this.oItemContext);
		},
		_onEditRouteMatched: function(oEvent) {
			
			var sClaimid = oEvent.getParameter("arguments").claimid,
				sItem = oEvent.getParameter("arguments").item,
				sPath = "/ClaimItemsSet(Claimid='" + sClaimid + "',Item='" + sItem + "')";
			this.sClaimid = sClaimid;
			this.sItem = sItem;
			
			this._edit = true;
			
			if (this.oItemContext) {
				this.getModel().resetChanges([this.oItemContext.getPath()], true, true);
			}
			
			if(this.oUploadSet){
				this.oUploadSet.removeAllIncompleteItems();
			}
			
			this.getModel().setDeferredGroups(["changes"]);
			//or check possibility to defer with refreshAfterChange
			this.getView().bindElement({
				path: sPath,
				events: {
					change: function() {
						this.getModel().setProperty(sPath + "/Hremc", this.getAppModel().getProperty("/selectedCategory"));
						this.getModel().setProperty(sPath + "/Remc", this.getAppModel().getProperty("/selectedCode"));
					}.bind(this)
				}
			});
		}
	});

});