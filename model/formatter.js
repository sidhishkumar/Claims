sap.ui.define([

], function() {
	"use strict";

	return {
		formatTime: function(oTime) {
			if (oTime) {
				var oTimeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
					style: "medium"
				});
				return oTimeFormat.format(new Date(oTime.ms - (330 * 60 * 1000)));
			}
		}
	};
});