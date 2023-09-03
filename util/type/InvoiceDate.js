sap.ui.define([
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/ValidateException"
], function (UI5Date, ValidateException) {
	"use strict";

	var InvoiceDate = UI5Date.extend("com.pfcindia.apphrmanageclaim.util.type.InvoiceDate");
	
	InvoiceDate.prototype.validateValue = function (sValue) {
		UI5Date.prototype.validateValue.call(this, sValue);
		var backDate = new Date();
		backDate.setMonth(backDate.getMonth() - 3);
		if (new Date(sValue) < backDate) {
			// The custom error message should be handled by the application developer
			throw new ValidateException("Invoice Date cannot be older than 3 months");
		}
		
		if(new Date(sValue) > new Date() ){
			// The custom error message should be handled by the application developer
			throw new ValidateException("Invoice Date cannot be in future");
		}
	};

	InvoiceDate.prototype.getName = function () {
		return "com.pfcindia.apphrmanageclaim.util.type.InvoiceDate";
	};

	return InvoiceDate;
});