sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Input",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/MessageToast",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Panel",
	"sap/m/Select"
], function(Controller, JSONModel, Dialog, Input, Button, Text, MessageToast, VerticalLayout, Panel, Select) {
	"use strict";

	return Controller.extend("com.sap.smi.WeChatAppConfiguration.controller.Main", {
		_appName: 0,

		onInit: function() {
			var status = {
				activated: false
			};
			var errorInfo;
			var errorInfoModel;
			var statusModel = new JSONModel(status);
			statusModel.setDefaultBindingMode("TwoWay");
			this.getView().setModel(statusModel, "status");

			var code = this.getUrlParameter("auth_code");
			this._appName = this.getUrlParameter("appName");
			if (!code) {
				errorInfo = {
					errorMessage: "Failed to login",
					suggestionMessage: "Please enter this page from App Configuration link in WeChat server "
				};
				errorInfoModel = new JSONModel(errorInfo);
				this.getOwnerComponent().setModel(errorInfoModel, "errorInfo");
				this.getOwnerComponent().getRouter().getTargets().display("error");

				return;
			}
			var url = "/UI2JAVA/action/weChatConfig/getConfigInfo?auth_code=" + code + "&appName=" + this._appName;
			this.getView().setBusy(true);
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			var retryRequest = 0;
			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						var result = JSON.parse(request.responseText);
						this.getView().setBusy(false);
						this._displayResult(result);
						this._updateWeChatUserList();
					} else if (request.status === 204) {
						if (retryRequest < 3) {
							retryRequest = retryRequest+1;
							request.open('GET', url, true);
							setTimeout(function() {
								request.send(null);
							}, 3000);
							// request.send(null);
						} else {
							this.getView().setBusy(false);

							this.getOwnerComponent().getRouter().getTargets().display("notAvailable");
						}
					} else if (request.status === 400) {
						this.getView().setBusy(false);
						errorInfo = {
							errorMessage: "Authorization failed",
							suggestionMessage: "Please try cancel authorization, and authorize the suite again"
						};
						errorInfoModel = new JSONModel(errorInfo);
						this.getOwnerComponent().setModel(errorInfoModel, "errorInfo");
						this.getOwnerComponent().getRouter().getTargets().display("error");
					} else if (request.status === 403) {
						this.getView().setBusy(false);
						errorInfo = {
							errorMessage: "Failed to login",
							suggestionMessage: "Please check whether is administrator of WeChat enterprise account, or retry the page later"
						};
						errorInfoModel = new JSONModel(errorInfo);
						this.getOwnerComponent().setModel(errorInfoModel, "errorInfo");
						this.getOwnerComponent().getRouter().getTargets().display("error");
					} else if (request.status === 500) {
						this.getView().setBusy(false);
						errorInfo = {
							errorMessage: "Error occured in server",
							suggestionMessage: "Please retry this page later"
						};
						errorInfoModel = new JSONModel(errorInfo);
						this.getOwnerComponent().setModel(errorInfoModel, "errorInfo");
						this.getOwnerComponent().getRouter().getTargets().display("error");
					} 
					else {
						this.getView().setBusy(false);
						errorInfo = {
							errorMessage: "No response from server",
							suggestionMessage: "Please enter this page again from WeChat administrator page later"
						};
						errorInfoModel = new JSONModel(errorInfo);
						this.getOwnerComponent().setModel(errorInfoModel, "errorInfo");
						this.getOwnerComponent().getRouter().getTargets().display("error");
					}
				}
			}.bind(this);
			request.send(null);
		},

		onActivate: function() {
			var activateCode = this.byId("activateCode").getValue();
			this._activate(activateCode);
			// if (result !== null) {
			// 	// this._displayActivateState(result);
			// 	this._displayResult(result);
			// }
		},

		onDeactivate: function() {
			// var result = 
			this._deactivate();
			// if (result !== false) {
			// 	this.getView().getModel("status").setProperty("/activated", false);
			// 	// this._displayResult(result);
			// } else {
			// 	alert("Failed to deactivate");
			// }
		},

		onSaveUIURL: function() {
			this.getView().setBusy(true);
			var request = new XMLHttpRequest();
			var url = "/UI2JAVA/action/weChatConfig/setUIURL?appName=" + this._appName;
			url += "&hostName=" + window.location.host;

			// var menus = {
			// 	menus: this.getView().getModel("menus").getData()
			// };
			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						var result = JSON.parse(request.responseText);
						if (result.menus !== undefined) {
							var menusModel = new JSONModel(result.menus);
							menusModel.setDefaultBindingMode("TwoWay");
							this.getView().setModel(menusModel, "menus");
						}
						this.getView().byId("menuBtn").setEnabled(false);
						this.getView().setBusy(false);
						MessageToast.show("succeed to set Menu URL");
					} else {
						this.getView().setBusy(false);
						MessageToast.show("Failed to set Menu URL");
					}
				}
			}.bind(this);
			request.open("POST", url, true);
			request.send(null);

			// request.send(JSON.stringify(menus));
		},
		
		onSaveUIURL1: function() {
			this.getView().setBusy(true);
			var request = new XMLHttpRequest();
			var url = "/UI2JAVA/action/weChatConfig/setUIURL1?appName=" + this._appName;
			
			var menus = {
				menus: this.getView().getModel("menus").getData()
			};
			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						this.getView().byId("menuBtn").setEnabled(false);
						// var oModel = this.getView().getModel("menus").getData();
						// oModel[0].url = "https//saimyrfc-a86724fc7.dispatcher.hana.ondemand.com";
						// this.getView().setModel(oModel, "menus");
						this.getView().setBusy(false);
						MessageToast.show("succeed to set Menu URL");
					} else {
						this.getView().setBusy(false);
						MessageToast.show("Failed to set Menu URL");
					}
				}
			}.bind(this);
			request.open("POST", url, true);
			request.send(JSON.stringify(menus));
		},

		onItemClose: function(oEvent) {
			oEvent.preventDefault();
		},

		onAddUserMapping: function() {
			var newUser = {
				wechatUserId: "",
				solmanUserId: ""
			};
			var newUserModel = new JSONModel(newUser);
			// if (!this._oUserMapEntryDialog) {
			// 	this._oUserMapEntryDialog = sap.ui.xmlfragment("com.sap.smi.WeChatAppConfiguration.view.inputUserMappingDialog", this);
			// }
			// this._oUserMapEntryDialog.setModel(newUserModel, "newUser");
			// this._oUserMapEntryDialog.open();

			// var that = this;

			// var dialog = new Dialog({
			// 	title: 'new user mapping',
			// 	content: [
			// 		new Select({
			// 			value: "{newUser>/wechatUserId}",
			// 			items: "{status>/userList}"
			// 		}),
			// 		new Input({
			// 			value: "{newUser>/solmanUserId}",
			// 			placeholder:"Enter Solution Manager ID"
			// 		})
			// 	],
			// 	// beginButton: new Button({
			// 	// 	text: "OK",
			// 	// 	press: function() {
			// 	// 		var data = that._oUserMapEntryDialog.getModel("newUser").getData();
			// 	// 		that.onNewUserAddPressed(data);
			// 	// 		that._oUserMapEntryDialog.close();
			// 	// 	}
			// 	// })
			// 	beginButton: new Button({
			// 		text: "OK",
			// 		press: function() {
			// 			var data = dialog.getModel("newUser").getData();
			// 			that.onNewUserAddPressed(data);
			// 			dialog.close();
			// 		}
			// 	}),
			// 	afterClose: function() {
			// 		dialog.destroy();
			// 	}
			// });
			if (!this._newUserDialog) {
				this._newUserDialog = sap.ui.xmlfragment("com.sap.smi.WeChatAppConfiguration.fragment.newUserDialog", this);
				this._newUserDialog.setModel(newUserModel, "newUser");
				this._newUserDialog.setModel(this.getView().getModel("status"), "status");
			}
			this._newUserDialog.open();

			// if (!that._oUserMapEntryDialog) {
			// 	that._oUserMapEntryDialog = new Dialog({
			// 		title: 'new user mapping',
			// 		content: [
			// 				new Input({
			// 				value: "{newUser>/wechatUserId}"
			// 			}),
			// 			new Input({
			// 				value: "{newUser>/solmanUserId}"
			// 			})
			// 		],
			// 		beginButton: new Button({
			// 			text: "OK",
			// 			press: function() {
			// 				var data = that._oUserMapEntryDialog.getModel("newUser").getData();
			// 				that.onNewUserAddPressed(data);
			// 				that._oUserMapEntryDialog.close();
			// 			}
			// 		})
			// 	});

			// }
			// that._oUserMapEntryDialog.setModel(newUserModel, "newUser");
			// that._oUserMapEntryDialog.open();
		},

		onNewUserDialogOK: function() {
			var data = this._newUserDialog.getModel("newUser").getData();
			this._newUserAddPressed(data);
			this._newUserDialog.close();
		},
		onNewUserDialogCancel: function() {
			this._newUserDialog.close();
		},

		_newUserAddPressed: function(data) {
			this.getView().setBusy(true);
			var request = new XMLHttpRequest();
			var url = "/UI2JAVA/action/weChatConfig/UserMapping";

			/*data: {
				wechatUserId: xx,
				solmanUserId: yy
			*/
			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						this.getView().setBusy(false);
						this._refreshUserMapping();
						MessageToast.show("New user mapping created successfully");
					} else {
						this.getView().setBusy(false);
						MessageToast.show("Failed to create user mapping");
					}
				}
			}.bind(this);
			request.open("POST", url, true);

			request.send(JSON.stringify(data));
		},

		onDeleteUserMapping: function() {
			this.getView().setBusy(true);

			var selectedItems = this.getView().byId("userMappingList").getSelectedItems();
			var length = selectedItems.length;
			var completedRequest = 0;
			for (var i = 0; i < length; ++i) {
				var data = selectedItems[i].getBindingContext("userMapping").getObject();
				var wechatUserId = data.wechatUserId;
				var request = new XMLHttpRequest();
				var url = "/UI2JAVA/action/weChatConfig/UserMapping?wechatUserId=" + wechatUserId;

				request.open("DELETE", url, true); // `false` makes the request synchronous
				request.onreadystatechange = function() {
					if (request.readyState === 4) {
						if (request.status === 200) {
							MessageToast.show("User mapping deleted successfully");
						} else {
							MessageToast.show("Failed to delete user mapping");
						}
						completedRequest++;
						if (completedRequest >= length) {
							this.getView().setBusy(false);
							this._refreshUserMapping();
						}
					}
				}.bind(this);
				request.send(null);
			}
		},

		onChangeUserMapping: function(oControlEvent) {
			this.getView().setBusy(true);
			var item = oControlEvent.getSource().getBindingContext("userMapping").getObject();

			var request = new XMLHttpRequest();
			var url = "/UI2JAVA/action/weChatConfig/UserMapping('" + item.wechatUserId + "')";

			/*data: {
				wechatUserId: xx,
				solmanUserId: yy
			*/
			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						this.getView().setBusy(false);
						MessageToast.show("User mapping is updated successfully");
						this._refreshUserMapping();
					} else {
						MessageToast.show("Failed to update User Mapping");
						this.getView().setBusy(false);
					}
				}
			}.bind(this);
			request.open("POST", url, true);

			request.send(JSON.stringify(item));
		},

		onCheckConfiguration: function() {
			this.getView().setBusy(true);
			var request = new XMLHttpRequest();
			var result;
			var url = "/UI2JAVA/action/weChatConfig/checkConnection";
			request.open("GET", url, true);
			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						result = JSON.parse(request.responseText);
						this.getView().setBusy(false);
						this._displayConnectionResult(result);
					} else {
						result = {
							ok: false,
							errorMessage: "SCP Server application is unavailable, please check later.",
							errorPoint: "",
							suggestion: ""
						};
						this.getView().setBusy(false);
						this._displayConnectionResult(result);
					}
				}
			}.bind(this);
			request.send(null);
		},

		onSaveGateWayServer: function() {
			this.getView().setBusy(true);
			var request = new XMLHttpRequest();
			var url = "/UI2JAVA/action/weChatConfig/saveGatewayServer";

			var data = {
				gatewayServer: this.getView().getModel("status").getData().gatewayServer
			};
			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						this.getView().setBusy(false);
						MessageToast.show("Gateway Server is successfully saved");
					} else {
						this.getView().setBusy(false);
						MessageToast.show("Failed to save Gateway Server");
					}
				}
			}.bind(this);
			request.open("POST", url, true);

			request.send(JSON.stringify(data));
		},

		onSaveSAMLLocalProviderName: function() {
			this.getView().setBusy(true);
			var request = new XMLHttpRequest();
			var url = "/UI2JAVA/action/weChatConfig/saveLocalProviderName";

			var data = {
				localProviderName: this.getView().getModel("status").getData().localProviderName
			};
			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						this.getView().setBusy(false);
						MessageToast.show("Local Provider Name is successfully saved");
						this._refreshUserMapping();
					} else {
						this.getView().setBusy(false);
						MessageToast.show("Failed to save Local Provider Name");
					}
				}
			}.bind(this);
			request.open("POST", url, true);

			request.send(JSON.stringify(data));
		},

		_displayConnectionResult: function(result) {
			var dialogState;
			if (result.ok) {
				dialogState = "Success";
			} else {
				dialogState = "Error";
			}

			var dialog = new Dialog({
				title: dialogState,
				type: "Message",
				state: dialogState,
				content: [
					new Text({
						text: "Successfully connected to Backend system",
						visible: result.ok
					}),
					new Panel({
						content: [
							new VerticalLayout({
								content: [
									new Text({
										text: "Error Message: " + result.errorMessage + " \n",
										visible: !result.ok
									}),
									new Text({
										text: "Error Point: " + result.errorPoint + " \n",
										visible: !result.ok
									}),
									new Text({
										text: "Suggestion: " + result.suggestion + " \n",
										visible: !result.ok
									})
								]
							})
						],
						visible: !result.ok
					}),
					new Panel({
						content: [
							new Text({
								text: "Technical Detail: " + result.technicalDetail + " \n",
								visible: !result.ok
							})
						],
						visible: !result.ok
					})
				],
				beginButton: new Button({
					text: "OK",
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		},

		onCheckConnectionResultDialogOK: function() {
			this._checkConnectionResultDialog.close();
			// this._checkConnectionResultDialog.destroy();
		},

		_displayResult: function(result) {
			this.getView().getModel("status").setProperty("/activated", result.activated);
			this.getView().getModel("status").setProperty("/appName", result.appName);

			if (result.activated) {
				//Use "apps" json model to display the input url part in view
				//{"activated":true,"apps":[{"menus":[],"name":"Monitor"},{"menus":[],"name":"Notification"}]}
				// var appsModel = new JSONModel(result.apps);
				// appsModel.setDefaultBindingMode("TwoWay");
				// this.getView().setModel(appsModel, "apps");

				if (result.menus !== undefined) {
					var menusModel = new JSONModel(result.menus);
					menusModel.setDefaultBindingMode("TwoWay");
					this.getView().setModel(menusModel, "menus");
					if (result.menus[0].url !== "") {
						this.getView().getModel("status").setProperty("/enabled", false);
					} else {
						this.getView().getModel("status").setProperty("/enabled", true);
					}
				}

				if (result.userMapping !== undefined) {
					var userMappingModel = new JSONModel(result.userMapping);
					userMappingModel.setDefaultBindingMode("TwoWay");
					this.getView().setModel(userMappingModel, "userMapping");
					this._updateWeChatUserList();
				}

				if (result.localProviderName !== undefined) {
					this.getView().getModel("status").setProperty("/localProviderName", result.localProviderName);
				} else {
					this.getView().getModel("status").setProperty("/localProviderName", "");
				}

				if (result.gatewayServer !== undefined) {
					this.getView().getModel("status").setProperty("/gatewayServer", result.gatewayServer);
				} else {
					this.getView().getModel("status").setProperty("/gatewayServer", "");
				}
			}
		},

		_activate: function(activateCode) {
			this.getView().setBusy(true);
			var request = new XMLHttpRequest();
			var url = "/UI2JAVA/action/weChatConfig/activate?activateCode=" + activateCode + "&appName=" + this._appName;
			// url += "&hostName=" + window.location.host;
			request.open("POST", url, true);
			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						var result = JSON.parse(request.responseText);
						this.getView().setBusy(false);
						this._displayResult(result);
						MessageToast.show("Activatied successfully");
						this._updateWeChatUserList();
					} else {
						this.getView().setBusy(false);
						MessageToast.show("Failed to activate");
					}
				}
			}.bind(this);

			request.send(null);

			// if (request.status === 200) {
			// 	return JSON.parse(request.responseText);
			// } else {
			// 	return null;
			// }
		},

		_deactivate: function() {
			this.getView().setBusy(true);
			var request = new XMLHttpRequest();
			var url = "/UI2JAVA/action/weChatConfig/deactivate";
			request.open("POST", url, true);

			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						this.getView().setBusy(false);
						this.getView().getModel("status").setProperty("/activated", false);
						MessageToast.show("Deactivatied successfully");
					} else {
						this.getView().setBusy(false);
						MessageToast.show("Failed to deactivate");
						//TODO error failed to deactivate
					}
				}
			}.bind(this);
			request.send(null);
		},

		_refreshUserMapping: function() {
			this.getView().setBusy(true);
			var request = new XMLHttpRequest();
			var url = "/UI2JAVA/action/weChatConfig/UserMapping?appName=" + this._appName;

			request.open("GET", url, true); // `false` makes the request synchronous
			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						var result = JSON.parse(request.responseText);
						result.activated = true;
						this.getView().setBusy(false);
						// this._displayResult(result);
						if (result.userMapping !== undefined) {
							this.getView().getModel("userMapping").setProperty("/", result.userMapping);
							this._updateWeChatUserList();
						}
					} else {
						this.getView().setBusy(false);
					}
				}
			}.bind(this);
			request.send(null);
		},

		_updateWeChatUserList: function() {
			var request = new XMLHttpRequest();
			var url = "/UI2JAVA/action/weChatConfig/wechatUserList?appName=" + this._appName;

			request.open("GET", url, true); // `false` makes the request synchronous
			request.onreadystatechange = function() {
				if (request.readyState === 4) {
					if (request.status === 200) {
						var result = JSON.parse(request.responseText);
						if (result.wechatUserList) {
							var list = [];
							
							var userMappingList = this.getView().getModel("userMapping").getObject("/");
							for(var i in result.wechatUserList) {
								var found = false;
								for (var j in userMappingList) {
									if ( result.wechatUserList[i].id === userMappingList[j].wechatUserId) {
										found = true;	
										break;
									}
								}
								if (!found) {
									list.push(result.wechatUserList[i]);
								}
							}
							this.getView().getModel("status").setProperty("/wechatUserList", list);
						}
					} else {
						//TODO test
						// alert("No user list got");
					}
				}
			}.bind(this);
			request.send(null);
		},

		getUrlParameter: function(sParam) {
			var sPageURL = decodeURIComponent(window.location.search.substring(1)),
				sURLVariables = sPageURL.split("&"),
				sParameterName,
				i;
			for (i = 0; i < sURLVariables.length; i++) {
				sParameterName = sURLVariables[i].split("=");
				if (sParameterName[0] === sParam) {
					return sParameterName[1] === undefined ? true : sParameterName[1];
				}
			}
		},

		onComplete: function() {
			var dialog = new Dialog({
				title: "Confirm",
				type: 'Message',
				content: new Text({ text: 'Are you sure you want to close the page?'}),
				beginButton: new Button ({
					text: 'Yes',
					press: function() {
						dialog.close();
						window.close();
					}
				}),
				endButton: new Button({
					text: 'No',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		}
	});
});