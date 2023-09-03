sap.ui.define([
	"sap/ui/model/odata/type/String",
	"sap/ui/model/ValidateException"
], function (String, ValidateException) {
	"use strict";

	var SupplierName = String.extend("com.pfcindia.apphrmanageclaim.util.type.SupplierName");
	
	SupplierName.prototype.validateValue = function (sValue) {
		String.prototype.validateValue.call(this, sValue);
		if (sValue.match(/^[0-9]+$/) || sValue.match("^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$")) {
			// The custom error message should be handled by the application developer
			throw new ValidateException("Numbers are not allowed in Supplier Name");
		}
	};

	SupplierName.prototype.getName = function () {
		return "com.pfcindia.apphrmanageclaim.util.type.SupplierName";
	};

	return SupplierName;
});