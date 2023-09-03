sap.ui.define([
	"sap/ui/model/odata/type/String",
	"sap/ui/model/ValidateException"
], function (String, ValidateException) {
	"use strict";

	var SupplierGSTIN = String.extend("com.pfcindia.apphrmanageclaim.util.type.SupplierGSTIN");
	
	SupplierGSTIN.prototype.validateValue = function (sValue) {
		String.prototype.validateValue.call(this, sValue);
		if(!sValue){
			return;
		}
		if (sValue.length !== 15) {
			// The custom error message should be handled by the application developer
			throw new ValidateException("Supplier GSTIN must be of 15 characters");
		}
	};

	SupplierGSTIN.prototype.getName = function () {
		return "com.pfcindia.apphrmanageclaim.util.type.SupplierGSTIN";
	};

	return SupplierGSTIN;
});