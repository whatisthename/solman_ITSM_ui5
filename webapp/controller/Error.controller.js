sap.ui.define([
		"sap/ui/core/mvc/Controller"
	], function (Controller) {
		"use strict";

		return Controller.extend("com.sap.smi.WeChatAppConfiguration.controller.Error", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				// this.getOwnerComponent().getRouter().navTo("worklist");
			}

		});

	}
);