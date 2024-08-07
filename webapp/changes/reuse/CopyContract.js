sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/utils/Constants",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/utils/Formatter",
    "ui/s2p/mm/pur/central/ctr/sts1/ext/util/Constant",
    "vwks/nlp/s2p/mm/reuse/lib/util/NavigationHelper",
    "vwks/nlp/s2p/mm/reuse/lib/util/Constants"
], function (JSONModel, Fragment, MessageBox, Constants, Formatter, StdConstants, NavigationHelper, ReuseConstants) {
    "use strict";

    return {
        /**
         * Constructor for Copy Contract Reuse Component 
         * @param {sap.ui.view} oView - Parent View
         * @param {object} globalThis object reference to global view
         */
        init: function (oView, globalThis) {
            this._oView = oView;
            this.oi18nModel = new JSONModel({});
            this.oConstant = StdConstants;
            this.oNavigationController = globalThis.base.getView().getController().extensionAPI.getNavigationController();
            this.oModel = this._oView.getModel();
            this.oFacetsModel = new JSONModel({
                IsSupplierVisible: false,
                IsReferenceVisible: false,
                IsHeaderNotesVisible: false,
                IsItemNotesVisible: false,
                IsManualRMSVisible: false,
                IsCondSupplierCostVisible: false
            });
            this.oSelectedFacetModel = new JSONModel({
                supplier: true,
                reference: true,
                headerNotes: true,
                itemNotes: true,
                manualRMS: true,
                condSupplierCost: true
            });
        },
        /**
         * load copy dialog to select facets
         * @param {sap.ui.model.json.JSONModel} oi18nModel i18n model object
         * @param {boolean} IsListPage indicator flag for list page 
         */
        loadDialog: function (oi18nModel, IsListPage) {
            this.oi18nModel = oi18nModel;
            this._oResourceBundle = oi18nModel.getResourceBundle();
            Fragment.load({
                id: "idCopyContractDialog",
                name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.reuse.fragments.CopyContractFacetSelectionDialog",
                controller: this
            }).then(function (oDialog) {
                this.oCopyContractDialog = oDialog;
                this.oCopyContractDialog.setModel(this.oi18nModel, "i18n");
                this.oCopyContractDialog.setModel(this.oFacetsModel, "facets");
                this.IsListPage = IsListPage;
                this._oView.addDependent(this.oCopyContractDialog);
                this.oCopyContractDialog.setBusy(true);
                this.oCopyContractDialog.open();
                var sCentralContract = "";
                if (this.IsListPage) {
                    var oSelectedItem =
                        this._oView.byId("ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--responsiveTable-_tab2");
                    sCentralContract = this.oModel.getProperty(oSelectedItem.getSelectedItem().getBindingContext()
                        .getPath() + "/CentralPurchaseContract");
                }
                else {
                    sCentralContract = this._oView.getBindingContext().getProperty().CentralPurchaseContract;
                }
                this.oModel.callFunction("/GetCustomCopyFacets", {
                    method: "GET",
                    urlParameters: {
                        CentralPurchaseContract: sCentralContract
                    },
                    success: function (oResponse) {
                        this.oCopyContractDialog.setBusy(false);
                        var oModel = this.oCopyContractDialog.getModel("facets");
                        var oData = oModel.getData();
                        oData = {
                            IsSupplierVisible: oResponse.Supplier === "X",
                            IsReferenceVisible: oResponse.Reference === "X",
                            IsHeaderNotesVisible: oResponse.HeaderNotes === "X",
                            IsItemNotesVisible: oResponse.ItemNotes === "X",
                            IsManualRMSVisible: oResponse.ManualRms === "X",
                            IsCondSupplierCostVisible: oResponse.CondSupplierDevCost === "X"
                        };
                        var oSelectedFacets = this.oSelectedFacetModel.getData();
                        oSelectedFacets = {
                            supplier: oData.IsSupplierVisible,
                            reference: oData.IsReferenceVisible,
                            headerNotes: oData.IsHeaderNotesVisible,
                            itemNotes: oData.IsItemNotesVisible,
                            manualRMS: oData.IsManualRMSVisible,
                            condSupplierCost: oData.IsCondSupplierCostVisible,
                            selectAll: true
                        };
                        this.oSelectedFacetModel.setData(oSelectedFacets);
                        this.oCopyContractDialog.setModel(this.oSelectedFacetModel, "selectedFacets");
                        oModel.setData(oData);
                    }.bind(this),
                    error: function (oError) {
                        this.oCopyContractDialog.setBusy(false);
                        MessageBox.error(oError.message);
                    }.bind(this)
                });
            }.bind(this));
        },
        /**
         * Event on Select/Deselect All Checkbox
         * @param {sap.ui.base.Event} oEvent Event object
         */
        onSelectAllCheck: function (oEvent) {
            var oModel = this.oCopyContractDialog.getModel("selectedFacets");
            var oData = oModel.getData();
            if (oEvent.getParameter("selected")) {
                Object.keys(oData).forEach(function (key) {
                    oData[key] = true;
                    return oData[key];
                });
            } else {
                Object.keys(oData).forEach(function (key) {
                    oData[key] = false;
                    return oData[key];
                });
            }
            oModel.setData(oData);
        },
        /**
         * event on selection of any facet checkbox
         */
        onSelectFacet: function () {
            var bAllSelected = true, bFacetVisibleNotSelected = false;
            var oModel = this.oCopyContractDialog.getModel("selectedFacets");
            var oData = oModel.getData();

            var oFacetsModel = this.oCopyContractDialog.getModel("facets");
            var oFacetsData = oFacetsModel.getData();
            Object.keys(oData).forEach(function (key) {
                if (key !== "selectAll") {
                    if (!oData[key]) {
                        switch (key) {
                            case Constants.CUSTOM_COPY_FACETS.SUPPLIER:
                                if (oFacetsData.IsSupplierVisible) {
                                    bFacetVisibleNotSelected = true;
                                }
                                break;
                            case Constants.CUSTOM_COPY_FACETS.REFERENCE:
                                if (oFacetsData.IsReferenceVisible) {
                                    bFacetVisibleNotSelected = true;
                                }
                                break;

                            case Constants.CUSTOM_COPY_FACETS.HEADER_NOTES:
                                if (oFacetsData.IsHeaderNotesVisible) {
                                    bFacetVisibleNotSelected = true;
                                }
                                break;

                            case Constants.CUSTOM_COPY_FACETS.ITEM_NOTES:
                                if (oFacetsData.IsItemNotesVisible) {
                                    bFacetVisibleNotSelected = true;
                                }
                                break;
                            case Constants.CUSTOM_COPY_FACETS.MANUAL_RMS:
                                if (oFacetsData.IsManualRMSVisible) {
                                    bFacetVisibleNotSelected = true;
                                }
                                break;
                            case Constants.CUSTOM_COPY_FACETS.COND_SUPP:
                                if (oFacetsData.IsCondSupplierCostVisible) {
                                    bFacetVisibleNotSelected = true;
                                }
                                break;

                        }
                        if (bFacetVisibleNotSelected) {
                            oData.selectAll = false;
                            bAllSelected = false;
                        }
                        else {
                            bAllSelected = true;
                        }
                    }
                }
            });
            if (bAllSelected) {
                oData.selectAll = true;
            }
            oModel.setData(oData);
        },
        /**
         * event on OK press from copy dialog
         */
        onCopyContractOK: function () {
            this.oCopyContractDialog.setBusy(true);
            var sCentralContract = "";
            var sDraftUUID = "";
            var bIsActiveEntity;
            if (this.IsListPage) {
                var oSelectedItem =
                    this._oView.byId("ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--responsiveTable-_tab2");
                var sSelectedPath = oSelectedItem.getSelectedItem().getBindingContext().getPath();
                sCentralContract = this.oModel.getProperty(sSelectedPath + "/CentralPurchaseContract");
                sDraftUUID = this.oModel.getProperty(sSelectedPath + "/DraftUUID");
                bIsActiveEntity = this.oModel.getProperty(sSelectedPath + "/IsActiveEntity");
            }
            else {
                sCentralContract = this._oView.getBindingContext().getProperty().CentralPurchaseContract;
                sDraftUUID = this._oView.getBindingContext().getProperty().DraftUUID;
                bIsActiveEntity = this._oView.getBindingContext().getProperty().IsActiveEntity;
            }
            var oFacetsPayload = {
                CondSupplierDevCost: this.oSelectedFacetModel.getProperty("/condSupplierCost") &&
                    this.oCopyContractDialog.getModel("facets").getProperty("/IsCondSupplierCostVisible") ? "X" : "",
                HeaderNotes: this.oSelectedFacetModel.getProperty("/headerNotes") &&
                    this.oCopyContractDialog.getModel("facets").getProperty("/IsHeaderNotesVisible") ? "X" : "",
                ItemNotes: this.oSelectedFacetModel.getProperty("/itemNotes") &&
                    this.oCopyContractDialog.getModel("facets").getProperty("/IsItemNotesVisible") ? "X" : "",
                ManualRms: this.oSelectedFacetModel.getProperty("/manualRMS") &&
                    this.oCopyContractDialog.getModel("facets").getProperty("/IsManualRMSVisible") ? "X" : "",
                Reference: this.oSelectedFacetModel.getProperty("/reference") &&
                    this.oCopyContractDialog.getModel("facets").getProperty("/IsReferenceVisible") ? "X" : "",
                Supplier: this.oSelectedFacetModel.getProperty("/supplier") &&
                    this.oCopyContractDialog.getModel("facets").getProperty("/IsSupplierVisible") ? "X" : "",
                CentralPurchaseContract: sCentralContract
            };
            var oPayload = {
                "CentralPurchaseContract": sCentralContract,
                "DraftUUID": sDraftUUID,
                "IsActiveEntity": bIsActiveEntity
            };
            this.oModel.callFunction("/CustomCopyFacets", {
                method: "POST",
                urlParameters: oFacetsPayload,
                success: function () {
                    this.callCopy(oPayload);
                }.bind(this),
                error: function (oError) {
                    this.oCopyContractDialog.setBusy(false);
                    MessageBox.error(oError.message);
                }.bind(this)
            });
        },
        /**
         * Method to call copy FI 
         * @param {Object} oPayload Payload object 
         */
        callCopy: function (oPayload) {
            this.oModel.callFunction("/Copy", {
                method: "POST",
                urlParameters: oPayload,
                success: function (oResponse) {
                    this.oCopyContractDialog.setBusy(false);
                    this.onCopyContractClose();
                    var encodedValueCentralPurchaseContract = encodeURIComponent(oResponse.CentralPurchaseContract);
                    var url = this.oConstant.sConsumptionViewAbsolute + "(" + this.oConstant.sCentralPurchaseContractQuery + "'" +
                        encodedValueCentralPurchaseContract + "'," + this.oConstant.sDraftUUIDQuery + "'" + oResponse.DraftUUID + "'," + this.oConstant
                            .sIsActiveEntityQuery + "false)";
                    var oContext = this.oModel.createBindingContext(url);
                    this.oNavigationController.navigateInternal(oContext);
                }.bind(this),
                error: function (oError) {
                    this.oCopyContractDialog.setBusy(false);
                    MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                }.bind(this)
            });
        },
        /**
         * event on close copy dialog
         */
        onCopyContractClose: function () {
            this.oCopyContractDialog.close();
            this.oCopyContractDialog.destroy();
            this.oCopyContractDialog = undefined;
        },

        /**
         * Constructor for Copy Contract Reuse Component 
         * @param {sap.ui.view} oView - Parent View
         * @param {boolean} bListPage indicator flag for list page 
         * @param {sap.ui.model.json.JSONModel} oI18nModel i18n model object
         */
        onBrandInfoCopy: function (oView, bListPage, oI18nModel) {
            this._oBrandView = oView;
            this._oBrandResourceBundle = oI18nModel.getResourceBundle();
            this.oConstant = StdConstants;
            this.oBrandModel = this._oBrandView.getModel();

            var sCentralContract = "";
            var sDraftUUID = "";
            var bIsActiveEntity;
            if (bListPage) {
                var oSelectedItem =
                    this._oBrandView.byId("ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--responsiveTable-_tab1");
                var sSelectedPath = oSelectedItem.getSelectedItem().getBindingContext().getPath();
                sCentralContract = this.oBrandModel.getProperty(sSelectedPath + "/CentralPurchaseContract");
                sDraftUUID = this.oBrandModel.getProperty(sSelectedPath + "/DraftUUID");
                bIsActiveEntity = this.oBrandModel.getProperty(sSelectedPath + "/IsActiveEntity");
            }
            else {
                sCentralContract = this._oBrandView.getBindingContext().getProperty().CentralPurchaseContract;
                sDraftUUID = this._oBrandView.getBindingContext().getProperty().DraftUUID;
                bIsActiveEntity = this._oBrandView.getBindingContext().getProperty().IsActiveEntity;
            }

            var oPayload = {
                "CentralPurchaseContract": sCentralContract,
                "DraftUUID": sDraftUUID,
                "IsActiveEntity": bIsActiveEntity
            };
            
            this._oBrandView.setBusy(true);
            this.oBrandModel.callFunction("/C_CentralPurchaseContractTPCopy_contract", {
                method: "POST",
                urlParameters: oPayload,
                success: function (oResponse) {
                    var oPreparationPayload = {
                        "CentralPurchaseContract": oResponse.CentralPurchaseContract,
                        "DraftUUID": oResponse.DraftUUID,
                        "IsActiveEntity": oResponse.IsActiveEntity
                    };
                    this.onBrandCtrSaveInPreparation(oPreparationPayload);
                }.bind(this),
                error: function (oError) {
                    this._oBrandView.setBusy(false);
                    if (oError.responseText) {
                        var oMessage = JSON.parse(oError.responseText);
                        MessageBox.error(oMessage.error.message.value);
                    }
                }.bind(this)
            });
        },

        /**
         * Method to call brand contract preparation Function import
         * @param {Object} oPayload Payload object 
         */
        onBrandCtrSaveInPreparation: function (oPayload){
            this.oBrandModel.callFunction("/C_CentralPurchaseContractTPPreparation", {
                method: "POST",
                urlParameters: oPayload,
                success: function (oResponse) {
                    this.onBrandCtrActivation(oPayload);
                }.bind(this),
                error: function (oError) {
                    this._oBrandView.setBusy(false);
                    if (oError.responseText) {
                        var oMessage = JSON.parse(oError.responseText);
                        MessageBox.error(oMessage.error.message.value);
                    }
                }.bind(this)
            });
        },

        /**
         * Method to call brand contract activation Function import
         * @param {Object} oPayload Payload object 
         */
        onBrandCtrActivation: function (oPayload){
            this.oBrandModel.callFunction("/C_CentralPurchaseContractTPActivation", {
                method: "POST",
                urlParameters: oPayload,
                success: function (oResponse) {
                    this._oBrandView.setBusy(false);
                    var oData = {
                        "CentralPurchaseContract": oResponse.CentralPurchaseContract,
                        "DraftUUID": oResponse.DraftUUID,
                        "IsActiveEntity": oResponse.IsActiveEntity
                    };
                    this.openCopyInfoContractSuccessDialog(oData);
                }.bind(this),
                error: function (oError) {
                    this._oBrandView.setBusy(false);
                    if (oError.responseText) {
                        var oMessage = JSON.parse(oError.responseText);
                        MessageBox.error(oMessage.error.message.value);
                    }
                }.bind(this)
            });
        },

        /**
         * Helper function for creating the Copy Info-Contract success dialog
         * @param {object} oData - Newly created Hierarchy Quota contract details
         */
        openCopyInfoContractSuccessDialog: function(oData){
            if (!this.oCopyInfoContractDialogModel) {
                this.oCopyInfoContractDialogModel = new JSONModel();
            }
            this.oCopyInfoContractDialogModel.setData(oData);
            
            Fragment.load({
                    id: "idBrandInfoCopySuccessFragment",
                    name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.BrandInfoCopySuccess",
                    controller: this
                }).then(function (oDialog) {
                    this.oCopyInfoContractDialog = oDialog;
                    this.oCopyInfoContractDialog.setModel(this.oCopyInfoContractDialogModel, "copyInfoContractDialogModel");
                    this._oBrandView.addDependent(this.oCopyInfoContractDialog);
                    this.oCopyInfoContractDialog.open();
                }.bind(this));
        },
        /**
         * Event hanlder for Close button press in Copy Info-Contract success dialog
         */
        handleCopyInfoContractSuccessClose: function () {
            this.oCopyInfoContractDialog.close();
        },

        /**
         * Method  attach to afterClose event to destroy Copy Info-Contract success dialog
         */
        onAfterCloseCopyInfoContractSuccessDialog: function () {
            this.oCopyInfoContractDialog.destroy();
            // This is to fix duplicate id issue in fragment
            this.oCopyInfoContractDialog = undefined;
        },

        /**
         * Event handler for navigating to Central Group contract link
         */
        hanldeNavToGrpCtr: function(){
            var oData = this.oCopyInfoContractDialog.getModel("copyInfoContractDialogModel").getData();
            var oView = this._oBrandView;
            var sContractHeader = oView.getModel().createKey("C_CntrlPurContrHierHdrTP", {
                CentralPurchaseContract: oData.CentralPurchaseContract,
                DraftUUID: ReuseConstants.INITIAL_GUID,
                IsActiveEntity: oData.IsActiveEntity
            });
            NavigationHelper.getNavigationPath(oView.getController(), Constants.NAVIGATE_APPLICATION.MCPC, sContractHeader).then(function (oNavigationDetails) {
                //Open in new window
                NavigationHelper.navigateWithURLHelper(oNavigationDetails.sPath, true);
            });
        }
    };
});