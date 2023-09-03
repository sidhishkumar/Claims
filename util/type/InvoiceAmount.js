sap.ui.define([
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/ValidateException"
], function (Decimal, ValidateException) {
	"use strict";

	var InvoiceAmount = Decimal.extend("com.pfcindia.apphrmanageclaim.util.type.InvoiceAmount");
	
	InvoiceAmount.prototype.validateValue = function (sValue) {
		Decimal.prototype.validateValue.call(this, sValue);
		
		if (sValue < 5000) {
			// The custom error message should be handled by the application developer
			throw new ValidateException("Invoice Amount should be more than 5000");
		}
	};

	InvoiceAmount.prototype.getName = function () {
		return "com.pfcindia.apphrmanageclaim.util.type.InvoiceAmount";
	};

	return InvoiceAmount;
});