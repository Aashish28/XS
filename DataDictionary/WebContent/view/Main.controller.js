var rs , inputId, MainController,oModel,oFilterColumn;
// sap.ui.require(sap.ui.model.BindingMode);
// sap.ui.require(sap.m.MessageBox);

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function(Controller,MessageToast) {
    "use strict";

return Controller.extend("hanadd.view.Main", {

                /**
                * Called when a controller is instantiated and its View controls (if available) are already created.
                * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
                * @memberOf view.Main
                */
                onInit: function() {
                                inputId = "";
                                MainController = this;
                                oModel = new sap.ui.model.odata.ODataModel("/acn/ret/trddept/d/DataDictionary/XSODATA/datadictionary.xsodata", true);
                },

                handleNavButtonPress: function(evt) {
                                this.nav.back("Dashboard");
                },

                /**
                * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
                * (NOT before the first rendering! onInit() is used for that one!).
                * @memberOf view.Main
                */
                //            onBeforeRendering: function() {

                //            },

                /**
                * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
                * This hook is the same one that SAPUI5 controls get after being rendered.
                * @memberOf view.Main
                */
                onAfterRendering: function() {
                                var results = null;
                                oFilterColumn = "$filter=SCHEMA_NAME eq '_SYS_BIC'&$format=json";
                                oModel.read("/Schema", null, [oFilterColumn], false, function(oData, oResponse) {
                                                //mResultReport = oData.results;
                                                results = oData.results;
                                }, function errorFn(error) {
                                                alert("Error");
                                });

                                var jsonModel = new sap.ui.model.json.JSONModel();
                                jsonModel.setData(results);
                                MainController.getView().byId("cbx").setModel(jsonModel);
                },

                /**
                * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
                * @memberOf view.Main
                */
                //            onExit: function() {

                //            }

                CbxSelect: function(oEvent) {
                                MainController.getView().byId("cbxType").setVisible(true);
                                MainController.getView().byId("lblComboType").setVisible(true);

                },

                CbxSelectType: function(oEvent) {
                                if (MainController.getView().byId("cbxType").getValue() == "Table") {
                                                MainController.getView().byId("lblSelect").setText("Table");
                                } else {
                                                MainController.getView().byId("lblSelect").setText("View");
                                }

                                MainController.getView().byId("displayPanel").setVisible(false);
                                MainController.getView().byId("tableName").setValue("");
                                MainController.getView().byId("lblSelect").setVisible(true);
                                MainController.getView().byId("tableName").setVisible(true);

                                if (MainController._oSelectDialog) {
                                                MainController._oSelectDialog.destroy();
                                                MainController._oSelectDialog = undefined;
                                }
                },

                onPersoButtonPressed: function(oEvent) {
                             var   oBinding = sap.ui.getCore().byId("Main--idInfoProvTable").getBinding("items"),
                                    oFilter = new sap.ui.model.Filter("IA", "EQ", '0BWTCT');
                                oBinding.filter([oFilter]);
                },

                handleOpenDialog: function(oEvent) {
                                if (!this._oDialog) {
                                                this._oDialog = sap.ui.xmlfragment("hanadd.view.Dialog", this);
                                }
                                this._oDialog.setModel(oGlobal);
                                // toggle compact style
                                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
                                this._oDialog.open();
                },

                handleOpenDialogFilter: function(oEvent) {
                                if (!this._oDialog) {
                                                this._oDialog = sap.ui.xmlfragment("hanadd.view.Dialog", this);
                                }
                                this._oDialog.setModel(this.getView().getModel());
                                // toggle compact style
                                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
                                this._oDialog.open("filter");
                },

                handleConfirm: function(oEvent) {
                                if (oEvent.getParameters().filterString) {
                                                MessageToast.show(oEvent.getParameters().filterString);
                                }
                },

                bindItemsFunction: function(sId, context) {
                                var cells = [];
                                var obj = context.getObject();

                                for (var i = 0; i < mResultReport.length; i++) {
                                                var val = context.getProperty(Object.keys(obj)[i]);
                                                cells.push(new sap.m.Text({
                                                                text: val
                                                }));
                                }

                                return new sap.m.ColumnListItem({
                                                cells: cells
                                });

                },

                handleValueHelp: function(oEvent) {
                                var sInputValue = oEvent.getSource().getValue();
                                var selectType = MainController.getView().byId("cbxType").getValue();
                                inputId = oEvent.getSource().getId();
                                var filter , entityName = "", dialogName;

                                if (selectType == "Table") {
                                                filter = "$filter=SCHEMA_NAME eq '" + MainController.getView().byId("cbx").getValue() + "'&$select=TABLE_NAME&$top=50&$format=json";
                                                entityName = "/Tables";
                                                dialogName = "hanadd.view.SelectDialog";
                                } else {
                                                filter = "$filter=SCHEMA_NAME eq '" + MainController.getView().byId("cbx").getValue() + "'&$select=VIEW_NAME&$top=50&$format=json";
                                                entityName = "/Views";
                                                dialogName = "hanadd.view.SelectDialogView";
                                }
                                // create value help dialog
                                if (!MainController._oSelectDialog) {
                                                MainController._oSelectDialog = sap.ui.xmlfragment(dialogName, MainController);
                                                oModel.read(entityName, null, [filter], false, function(oData, oResponse) {
                                                                var resultData = oData.results;
                                                                var jsonModel = new sap.ui.model.json.JSONModel();
                                                                jsonModel.setData(resultData);
                                                                MainController._oSelectDialog.setModel(jsonModel);
                                                }, function errorFn(error) {
                                                                alert("Error");
                                                });
                                }
                                // create a filter for the binding
                                MainController._oSelectDialog.getBinding("items").filter([new sap.ui.model.Filter(
                                                (MainController.getView().byId("cbxType").getValue() == "Table") ? "TABLE_NAME" : "VIEW_NAME",
                                                sap.ui.model.FilterOperator.Contains, sInputValue
                                )]);
                                // open value help dialog filtered by the input value
                                MainController._oSelectDialog.open(sInputValue);
                },

                handleValueHelpSearch: function(evt) {
                                var sValue = evt.getParameter("value");
                                var oFilter = new sap.ui.model.Filter(
                                                (MainController.getView().byId("cbxType").getValue() == "Table") ? "TABLE_NAME" : "VIEW_NAME",
                                                sap.ui.model.FilterOperator.Contains, sValue
                                );
                                evt.getSource().getBinding("items").filter([oFilter]);
                },

                handleValueHelpClose: function(evt) {
                                MainController.getView().byId("maxRow").setValue('').setVisible(true);
                                MainController.getView().byId("queryString").setValue('').setVisible(true);

                                var oSelectedItem = evt.getParameter("selectedItem");
                                if (oSelectedItem) {
                                                var productInput = MainController.getView().byId(inputId);
                                                productInput.setValue(oSelectedItem.getTitle());
                                }
                                evt.getSource().getBinding("items").filter([]);

                                var selectType = MainController.getView().byId("cbxType").getValue();
                                var filter = "$filter=SCHEMA_NAME eq '" + MainController.getView().byId("cbx").getValue() + "'";
                                var entityName = "";

                                if (selectType == "Table") {
                                                filter = filter + " and TABLE_NAME eq '" + oSelectedItem.getTitle() + "'";
                                                entityName = "/TColumns";
                                } else {
                                                filter = filter + " and VIEW_NAME eq '" + oSelectedItem.getTitle() + "'";
                                                entityName = "/VColumns";
                                }

                                filter = filter + "&$orderby=POSITION&$select=COLUMN_NAME,DATA_TYPE_NAME,LENGTH,SCALE&$format=json";

                                var resultData = [];

                                var sServiceUrl = "/acn/ret/trddept/d/DataDictionary/XSJS/dynamic.xsjs?";
                                sServiceUrl = sServiceUrl + "CMD=read";

                                oModel.read(entityName, null, [filter], false, function(oData, oResponse) {
                                                resultData = oData.results;
                                                rs = resultData;
                                                MainController.getView().byId("displayPanel").setVisible(true);
                                                var jsonModel = new sap.ui.model.json.JSONModel();
                                                var limit = MainController.getView().byId("maxRow").getValue();
                                                var query = MainController.getView().byId("queryString").getValue();

                                                var payload = {
                                                                //"sTableName"    :  '"PS_COMMON_DEV"."siemens.COMMON_DEV.model.companycode.tables::T_COMP_CODE_PA101"'
                                                                "sTableName": "\"" + MainController.getView().byId("cbx").getValue() + "\".\"" + MainController.getView().byId("tableName").getValue() +
                                                                                "\""
                                                };
                                                var oPayload = JSON.stringify(payload);

                                                $.ajax({
                                                                url: sServiceUrl,
                                                                data: oPayload,
                                                                type: "POST",
                                                                dataType: "json",
                                                                contentType: "application/json",
                                                                success: function(data, textStatus, XMLHttpRequest) {
                                                                                var dd = data.values; //JSON.parse(data);
                                                                                jsonModel.setData({
                                                                                                bindingData: resultData,
                                                                                                rows: dd,
                                                                                                defaultBindingMode: sap.ui.model.BindingMode.TwoWay
                                                                                });
                                                                                MainController.getView().byId("idInfoProvTable").setModel(jsonModel);
                                                                                MainController.getView().byId("tableFields").setModel(jsonModel);

                                                                                MainController.getView().byId("idInfoProvTable").bindAggregation("items", "/rows", function(id, context) {
                                                                                                var cells = [];
                                                                                                var obj = context.getObject();

                                                                                                for (var i = 0; i < resultData.length; i++) {
                                                                                                                var val = context.getProperty(Object.keys(obj)[i]);
                                                                                                                cells.push(new sap.m.Input({
                                                                                                                                type: "Text",
                                                                                                                                value: val,
                                                                                                                                editable: false
                                                                                                                }));
                                                                                                                //                                            cells.push(new sap.m.Text({ text: val  }));
                                                                                                }

                                                                                                return new sap.m.ColumnListItem({
                                                                                                                cells: cells
                                                                                                });

                                                                                });
                                                                },
                                                                error: function(data, textStatus, XMLHttpRequest) {
                                                                                alert(data.responseText);
                                                                }
                                                });
                                }, function errorFn(error) {
                                                alert("Error");
                                });
                },

                onReset: function(oEvent) {
                                MainController.getView().byId("displayPanel").setVisible(false);
                                MainController.getView().byId("cbxType").setVisible(false);
                                MainController.getView().byId("lblComboType").setVisible(false);
                                MainController.getView().byId("tableName").setValue("");
                                MainController.getView().byId("cbx").setSelectedKey(null);
                                MainController.getView().byId("cbxType").setSelectedKey(null);
                                MainController.getView().byId("lblSelect").setVisible(false);
                                MainController.getView().byId("tableName").setVisible(false);
                                MainController.getView().byId("maxRow").setVisible(false).setValue('');
                                MainController.getView().byId("queryString").setVisible(false).setValue('');

                },

                onFilter: function(evt) {
                                this.onRefresh();

                },
                
                onRefresh:function(){
                            var sServiceUrl = "/acn/ret/trddept/d/DataDictionary/XSJS/dynamic.xsjs?";
                                sServiceUrl = sServiceUrl + "cmd=read";
                                var offset = MainController.getView().byId("offSet").getValue();
                                var limit = MainController.getView().byId("maxRow").getValue();
                                var query = MainController.getView().byId("queryString").getValue();
                                
                    
                                var payload = {
                                        "sTableName": "\"" + MainController.getView().byId("cbx").getValue() + "\".\"" + MainController.getView().byId("tableName").getValue() + "\"",
                                        "condition" : query || undefined,
                                        "limit" : limit || undefined,
                                        "offset" : offset || undefined
                                                };
                                var oPayload = JSON.stringify(payload);
                    
                                        $.ajax({
                                            url: sServiceUrl,
                                            data: oPayload,
                                            type: "POST",
                                            dataType: "json",
                                            contentType: "application/json",
                                                success: function(data, textStatus, XMLHttpRequest) {
                                                                var dd = data.values;
                                                                var jsonModel = MainController.getView().byId("tableFields").getModel();
                                                                jsonModel.setData({
                                                                                bindingData: rs,
                                                                                rows: dd
                                                                });
                                                                jsonModel.updateBindings(false);
                                                                MainController.getView().byId("idInfoProvTable").removeSelections(true);
                                                }.bind(this),
                                                error: function(data, textStatus, XMLHttpRequest) {
                                                                alert(data);
                                                }
                                });
                    
                },

                onExit: function() {
                                if (this._oDialog) {
                                                this._oDialog.destroy();
                                }
                },
                onUpdate: function(oevent) {
                                // this.editDialog = sap.ui.xmlfragment("hanadd.view.EditDialog", MainController);
                                var obj = this.getCurrentRecords();

                                var sServiceUrl = "/acn/ret/trddept/d/DataDictionary/XSJS/dynamic.xsjs?";
                                sServiceUrl = sServiceUrl + "cmd=update";
                                var schema = MainController.getView().byId("cbx").getValue();
                                var table = MainController.getView().byId("tableName").getValue();
                                
                                var payload = {
                                                "originalRecords": JSON.stringify(this.oldrow),
                                                "currentRecords": JSON.stringify(obj),
                                                "sTableName": "\"" + MainController.getView().byId("cbx").getValue() + "\".\"" + MainController.getView().byId("tableName").getValue() +
                                                                "\""
                                };
                                var oPayload = JSON.stringify(payload);
                                //                            var msgBox = new sap.m.MessageBox();
                                $.ajax({
                                                url: sServiceUrl,
                                                data: oPayload,
                                                type: "POST",
                                                success: function(data, textStatus, XMLHttpRequest) {
                                                                // console.log("Update success" + data.toString());
                                                                MessageToast.show("Update success" + data.toString());
                                                                this.onRefresh();
                                                }.bind(this),
                                                error: function(data, textStatus, XMLHttpRequest) {
                                                                MessageToast.show("Update success" + data.responseText);                                                }
                                });
                },
                getCurrentRecords: function() {
                    var index = MainController.getView().byId("idInfoProvTable").getSelectedItem().getBindingContext().getPath().split("/");
                    index = index[index.length - 1];
                    var items = MainController.getView().byId("idInfoProvTable").getItems();
                    var columns = MainController.getView().byId("idInfoProvTable").getColumns();
                    var data = {};
                    for (var i in columns) {
                       
                       data[columns[i].getHeader().getText()] = items[index].getCells()[i].getValue();
                    }
                    return data;
                },

                onDelete: function(oEvent) {
                                var obj = MainController.getView().byId("idInfoProvTable").getSelectedItem().getBindingContext().getObject();
                                var sServiceUrl = "/acn/ret/trddept/d/DataDictionary/XSJS/dynamic.xsjs?";
                                sServiceUrl = sServiceUrl + "&cmd=delete";

                                var payload = {
                                                "originalRecords": obj,
                                                "sTableName": "\"" + MainController.getView().byId("cbx").getValue() + "\".\"" + MainController.getView().byId("tableName").getValue() +
                                                                "\""
                                };

                                var oPayload = JSON.stringify(payload);

                                $.ajax({
                                                url: sServiceUrl,
                                                data: oPayload,
                                                type: "POST",
                                                success: function(data, textStatus, XMLHttpRequest) {
                                                                MessageToast.show("delete success" + data.toString());
                                                                this.onRefresh();
                                                }.bind(this),
                                                error: function(data, textStatus, XMLHttpRequest) {
                                                                MessageToast.show("delete failed" + data.responseText);
                                                }
                                });

                },
                onAddEntry: function(oEvent) {
                                if (!this.oAddDialog) {

                                                this.oAddDialog = sap.ui.xmlfragment("hanadd.view.EditDialog", MainController);
                                                var addForm = this.oAddDialog.getContent()[0];
                                                var columns = MainController.getView().byId("idInfoProvTable").getColumns();

                                                for (var i in columns) {

                                                                addForm.addContent(new sap.m.Label({
                                                                                text: columns[i].getHeader().getText()
                                                                }));
                                                                addForm.addContent(new sap.m.Input());
                                                }
                                }
                                this.oAddDialog.open();

                },
                onCreateEntry: function(oEvent) {
                                var data;
                                if (this.oAddDialog) {
                                                data = {};
                                                var cols = MainController.getView().byId("idInfoProvTable").getColumns();
                                                var fields = this.oAddDialog.getContent()[0].getContent();

                                                for (var i in cols) {

                                                                data[cols[i].getHeader().getText()] = fields[parseInt(i) * 2 + 1].getValue();
                                                }
                                }

                                var sServiceUrl = "/acn/ret/trddept/d/DataDictionary/XSJS/dynamic.xsjs?";

                                sServiceUrl = sServiceUrl + "&cmd=insert";
                                var payload = {
                                                "currentRecords": data,
                                                "sTableName": "\"" + MainController.getView().byId("cbx").getValue() + "\".\"" + MainController.getView().byId("tableName").getValue() +
                                                                "\""
                                };
                                var oPayload = JSON.stringify(payload);

                                $.ajax({
                                                url: sServiceUrl,
                                                data: oPayload,
                                                type: "POST",
                                                dataType: "json",
                                                contentType: "application/json",
                                                success: function(data, textStatus, XMLHttpRequest) {
                                                                MessageToast.show("create success" + data.toString());
                                                                this.onRefresh();
                                                }.bind(this),
                                                error: function(data, textStatus, XMLHttpRequest) {
                                                                MessageToast.show("create failed" + data.responseText);
                                                }
                                });
                                oEvent.getSource().getParent().getParent().close();

                },
                onSelectionChange: function(oEvent) {
                                this.oldrow = jQuery.extend({}, oEvent.getSource().getSelectedItem().getBindingContext().getObject());
                                
                                if(this.oldRowCells){
                                    $.each(this.oldRowCells, function( index, value ) {
                                      value.setEditable(false);
                                    });
                                }
                                
                                this.oldRowCells = oEvent.getParameter("listItem").getCells();
                                
                                if(this.oldRowCells){
                                    $.each(this.oldRowCells, function( index, value ) {
                                      value.setEditable(true);
                                    });
                                }
                                
                                
                                
                },
                onclose: function (oEvent) {
                    oEvent.getSource().getParent().getParent().close();
                }

});

});
