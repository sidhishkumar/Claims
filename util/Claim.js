sap.ui.define([
	"sap/ui/base/Object",
	"com/pfcindia/apphrmanageclaim/model/models",
	"sap/base/util/merge"
], function(Object, models, merge) {

	"use strict";

	return Object.extend("com.pfcindia.apphrmanageclaim.util.Claim", {

		constructor: function(oHeader, aItems) {

			if (!oHeader) {
				throw new Error("Header Data is missing");
			}
			this._oModel = models.createClaimModel(oHeader, aItems);
			this._aAttachment = [];
		},
		createItem: function(oItem, oAttachment) {

			if (!oItem) {
				throw new Error("Line Item is mandatory");
			}
			if (!oItem.Item) {
				var aItems = this.getItems();
				oItem.Item = aItems.length + 1;
				aItems.push(oItem);
				this._oModel.setProperty("/d/HeaderToItems/results", aItems);

				this._aAttachment.push(merge({}, oAttachment));
			}else{
				this.updateItem(oItem, oAttachment);
			}
			return oItem.Item - 1;

		},
		updateItem: function(oItem, oAttachment) {
			if (!oItem.Item) {
				return false;
			}
			var aItems = this.getItems();
			aItems[oItem.Item - 1] = oItem;
			this._oModel.setProperty("/d/HeaderToItems/results", aItems);
			return true;
		},
		removeItem: function(iItemNumber) {

			if (!iItemNumber) {
				return false;
			}
			var aItems = this.getItems();
			aItems.splice(iItemNumber - 1, 1);
			this._aAttachment.splice(iItemNumber - 1, 1);
			aItems.forEach(function(oItem, iIndex) {
				oItem.Item = iIndex + 1;
			});
			this._oModel.setProperty("/d/HeaderToItems/results", aItems);
			return true;

		},
		getAttachment: function(iItem) {
			return this._aAttachment[iItem - 1];
		},
		getItems: function() {

			return this._oModel.getProperty("/d/HeaderToItems/results");

		},
		getPropModel: function() {

			return this._oPropModel;

		},
		getModel: function() {

			return this._oModel;

		},
		getItem: function(iItem) {

			return this._oModel.getProperty("/d/HeaderToItems/results")[iItem - 1];

		}
	});
});