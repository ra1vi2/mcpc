sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/utils/Constants",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/utils/Formatter",
    "sap/ui/core/MessageType"
], function (JSONModel, Fragment, MessageBox, Constants, Formatter, MessageType) {
    "use strict";

    return {
        /**
         * Constructor for QuotaDetails Reuse Component 
         * @param {sap.ui.view} oView - Parent View
         */
        init: function (oView) {
            this._oView = oView;
            this.oi18nModel = new JSONModel({});
            this.oQuotaModel = new JSONModel({
                "materialInfo": "",
                "itemLevel": false,
                "data": {},
                "editPopup": false,
                "quotaCol": "",
                "cancelButtonText": "",
                "messageStripVisibility": false,
                "messageStripValue": "",
                "editAddPopOver": true,
                "enablePlantValueHelpOK": false,
                "plant": "",              
                "messageStripType":"Error"
            });
            this._oParams = {
                "CentralContract": "",
                "CentralContractItem": "",
                "CentralContractItemDist": "",
                "DraftGuid": "",
                "Plant": ""
            };
            this.bItemLevel = false;
            this._bInit = true;
        },

        /**
         * Set or unset Dialog busy state.
         * @param {boolean} bBusy true - set busy state, false - remove busy state
         * @private
         */
        _setBusy: function (bBusy) {
            this.oQuotaDetails.setBusy(bBusy);
        },

        /**
         * To initialize Quota Model
         * @param {string} sMaterialInfo - Material Information
         */
        _initializeQuotaModel: function (sMaterialInfo) {
            this.oQuotaModel.setData({});
            this.oQuotaModel.setProperty("/materialInfo", sMaterialInfo);
            this.oQuotaModel.setProperty("/itemLevel", this.bItemLevel);
            this.oQuotaModel.setProperty("/cancelButtonText", this._oResourceBundle.getText("QuotaDialogCancelButton"));
            this.oQuotaModel.setProperty("/quotaCol", this._oResourceBundle.getText("Quota"));
            this.oQuotaModel.setProperty("/editPopup", false);
            this.oQuotaModel.setProperty("/messageStripVisibility", false);
            this.oQuotaModel.setProperty("/messageStripValue", "");
            this.oQuotaModel.setProperty("/editAddPopOver", true);
            this.oQuotaModel.setProperty("/enablePlantValueHelpOK", false);
            this.oQuotaModel.setProperty("/plant", "");
            this.oQuotaModel.setProperty("/data", {});
        },

        /**
         * Load and open popover.
         * @param {sap.ui.model.resource.ResourceModel} oi18nModel - i18n model
         * @param {string} sMaterialInfo - Material Information
         * @param {boolean} bItemLevel - Loading Dialog at Item level or not
         * @param {object} oParams - object of parameters passed by caller
         * @public
         */
        loadDialog: function (oi18nModel, sMaterialInfo, bItemLevel, oParams) {
            this.oi18nModel = oi18nModel;
            this._oResourceBundle = oi18nModel.getResourceBundle();
            this.bItemLevel = bItemLevel;
            this._oParams = oParams;
            this._bInit = true;
            this._initializeQuotaModel(sMaterialInfo);
            Fragment.load({
                id: "idQuotaDetailsFragment",
                name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.reuse.fragments.QuotaDetailsDialog",
                controller: this
            }).then(function (oDialog) {
                this.oQuotaDetails = oDialog;
                this.oQuotaDetails.setModel(this.oi18nModel, "i18n");
                this.oQuotaDetails.setModel(this.oQuotaModel, "quotaModel");
                this._initialiseQuotaDialogTreeTable();
                this.oQuotaTreeTable = Fragment.byId("idQuotaDetailsFragment", "idQuotaDialogTreeTable");
                this._oView.addDependent(this.oQuotaDetails);
                this.oQuotaDetails.open();
            }.bind(this));
        },

        /**
         * initialise event for Quota TreeTable
         * @private
         */
        _initialiseQuotaDialogTreeTable: function () {
            this._setBusy(true);
            var oPayload = this._getFIPayload(true);
            // eslint-disable-next-line
            oPayload["IsEdit"] = "";
            this._oView.getModel().callFunction(Constants.FUNCTION_IMPORT.GET_QUOTA, {
                method: "GET",
                urlParameters: oPayload,
                success: this._onQuotaDialogTreeTableDataSuccess.bind(this),
                error: this._onLoadQuotaDataError.bind(this, "ErrorOnQuotaDataLoad")
            });
        },

        /**
         * Reusable method to get payload for function imports
         * @param {boolean} bInitialiseFI - payload for initialise function import?
         * @return {Object} oPayload - payload for function import
         * @private
         */
        _getFIPayload: function (bInitialiseFI) {
            var oPayload = {
                "CentralContract": this._oParams.CentralContract,
                "CentralContractItem": this._oParams.CentralContractItem,
                "CentralContractItemDist": this._oParams.CentralContractItemDist,
                "DraftGuid": this._oParams.DraftGuid
            };
            if (!bInitialiseFI) {
                var sTreeTableData = JSON.stringify(this.oQuotaModel.getProperty("/data"));
                // eslint-disable-next-line
                oPayload["Payload"] = sTreeTableData;
            }
            return oPayload;
        },

        /**
         * Success Response Handler for Quota TreeTable Data FI Call
         * @param {Object} oData - success response from the FI call
         * @private
         */
        _onQuotaDialogTreeTableDataSuccess: function (oData) {
            try {
                this.oQuotaModel.setProperty("/data", JSON.parse(oData.GetQuotaData.QUOTA_DATA));
            } catch (error) {
                MessageBox.error(this._oResourceBundle.getText("ErrorOnQuotaDataLoad"));
            }
            this._setBusy(false);
        },

        /**
         * Error Response Handler for Quota TreeTable Data Call
         * @param {string} sMsgKey the key
         * @param {object} oError - error response from the FI call
         * @private
         */
        _onLoadQuotaDataError: function (sMsgKey, oError) {
            this._setBusy(false);
            try {
                var oErrorResponse = JSON.parse(oError.responseText);
                MessageBox.error(oErrorResponse.error.message.value);
            } catch (error) {
                MessageBox.error(this._oResourceBundle.getText(sMsgKey));
            }
        },

        /**
         * Click handler for Edit button
         */
        onEditQuota: function () {
            this._setBusy(true);
            var oPayload = this._getFIPayload(true);
            // eslint-disable-next-line
            oPayload["IsEdit"] = "X";
            this._oView.getModel().callFunction(Constants.FUNCTION_IMPORT.GET_QUOTA, {
                method: "GET",
                urlParameters: oPayload,
                success: this._onQuotaDialogEditSuccess.bind(this),
                error: this._onQuotaDialogEditError.bind(this)
            });
        },

        /**
         * function to set value 0 to OVERALL_QUOTA on edit popup
         * @param {Object} aQuotaData - success response from the FI call
         * @private 
         */
        updateOverallQuotaRecursion: function (aQuotaData) {
            for (var i = 0; i < aQuotaData.length; i++) {
                if (aQuotaData[i].LEVEL === "QV") {
                    aQuotaData[i].OVERALL_QUOTA = 0;
                    return;
                } else {
                    this.updateOverallQuotaRecursion(aQuotaData[i].CHILDNODE);
                }
            }
        },

        /**
         * Method to handle success response of Edit functionality
         * @param {Object} oData - success response from the FI call
         * @private 
         */
        _onQuotaDialogEditSuccess: function (oData) {
            this.oQuotaModel.setProperty("/editPopup", true);
            this.oQuotaModel.setProperty("/quotaCol", this._oResourceBundle.getText("ExistingQuota"));
            this.oQuotaModel.setProperty("/cancelButtonText", this._oResourceBundle.getText("QuotaDialogDiscardButton"));
            this._onQuotaDialogTreeTableDataSuccess(oData);
        },

        /**
         * Method to handle error response of Edit functionality
         * @param {Object} oError - error response from the FI call
         * @private
         */
        _onQuotaDialogEditError: function (oError) {
            this._setBusy(false);
            try {
                var oErrorResponse = JSON.parse(oError.responseText);
                MessageBox.error(oErrorResponse.error.message.value);
            } catch (error) {
                //catch to avoid error in case of non json string oErrorResponse
            }
        },

        /**
         * Click handler for Collapse All button
         */
        onCollapseAll: function () {
            this.oQuotaTreeTable.collapseAll();
        },

        /**
         * Click handler for Collapse Selection button
         */
        onCollapseSelection: function () {
            this.oQuotaTreeTable.collapse(this.oQuotaTreeTable.getSelectedIndices());
        },

        /**
         * Click handler for Expand First Level button
         */
        onExpandFirstLevel: function () {
            this.oQuotaTreeTable.expandToLevel(1);
        },

        /**
         * Click handler for Expand Selection button
         */
        onExpandSelection: function () {
            this.oQuotaTreeTable.expand(this.oQuotaTreeTable.getSelectedIndices());
        },

        /**
         * Method to trigger Check and Refresh footer action
         */
        onQuotaDialogCheckRefresh: function () {
            this._setBusy(true);
            this._oView.getModel().callFunction(Constants.FUNCTION_IMPORT.VALIDATE_QUOTA, {
                method: "POST",
                urlParameters: this._getFIPayload(false),
                success: this._onQuotaDialogCheckRefreshSuccess.bind(this),
                error: this._onLoadQuotaDataError.bind(this, "ErrorOnQuotaDataLoad")
            });
        },

        /**
         * Method to handle success response of Check and Refresh functionality
         * @param {Object} oData - success response from the FI call
         * @private 
         */
        _onQuotaDialogCheckRefreshSuccess: function (oData) {
            try {
                this.oQuotaModel.setProperty("/data", JSON.parse(oData.ValidateAdjustQuota.QUOTA_DATA));
            } catch (error) {
                MessageBox.error(this._oResourceBundle.getText("ErrorOnQuotaDataLoad"));
            }
            this._setBusy(false);
        },

        /**
         * Method to handle enter Event of New quota field
         * @param {sap.ui.base.Event} oEvent submit event object
         */
        OnEnterNewQuota: function (oEvent) {
            this._bInit = false;
            var oSource = oEvent.getSource();
            var sValue = oSource.getValue();
            if (sValue === "0") {
                this.oQuotaModel.setProperty("/messageStripType", MessageType.Warning);
                this.oQuotaModel.setProperty("/messageStripVisibility", true);
                this.oQuotaModel.setProperty("/messageStripValue", this._oResourceBundle.getText("QuotaWarning"));                
            } else {
                this.oQuotaModel.setProperty("/messageStripType", MessageType.Error);
                this.oQuotaModel.setProperty("/messageStripVisibility", false);
                this.oQuotaModel.setProperty("/messageStripValue", "");
            }                      
            var sRowPath = oSource.getBindingContext("quotaModel").getPath();
            oSource.getBindingContext("quotaModel").getProperty(sRowPath).NEW_QUOTA = oSource._lastValue;
            var sRowNewQuota = sRowPath.substring(0, sRowPath.lastIndexOf("/"));
            var iTotalQuota = 0;
            var aQuotaData = oSource.getBindingContext("quotaModel").getProperty(sRowNewQuota);
            for (var i = 0; i < aQuotaData.length; i++) {
                aQuotaData[i].NEW_QUOTA = aQuotaData[i].NEW_QUOTA ? aQuotaData[i].NEW_QUOTA : aQuotaData[i].QUOTA;
                iTotalQuota += parseInt(aQuotaData[i].NEW_QUOTA, 10);
            }
            var sRowOverallQuota = sRowNewQuota.substring(0, sRowNewQuota.lastIndexOf("/CHILDNODE"));
            this.oQuotaModel.setProperty(sRowOverallQuota + "/OVERALL_QUOTA", iTotalQuota);
        },


        /**
         * 
         */
        onQuotaDialogSaveRelease: function () {
            // will be updated once the design is confirmed
        },

        /**
         * Click handler for dialog close button
         */
        onQuotaDialogClose: function () {
            if (this.oQuotaModel.getProperty("/editPopup")) {
                this._setBusy(true);
                this._oView.getModel().callFunction(Constants.FUNCTION_IMPORT.CANCEL_QUOTA, {
                    method: "POST",
                    urlParameters: this._getFIPayload(false),
                    success: function () {
                        this._setBusy(false);
                        this._closeQuotaDialog();
                    }.bind(this),
                    error: this._onLoadQuotaDataError.bind(this, "ErrorOnQuotaDataDiscard")
                });
            } else {
                this._closeQuotaDialog();
            }
        },

        /**
         * Method to close the Quota Dialog Popup
         * @private
         */
        _closeQuotaDialog: function () {
            this.oQuotaDetails.close();
            this.oQuotaDetails.destroy();
            this.oQuotaDetails = null;
            this._oAddPopover = null;
            this._oPlantValueHelpDialog = null;
        },

        /**
         * Load Add popover on the click of Add icon
         * @param {sap.ui.base.Event} oEvent press event object
         */
        handleAddPopOver: function (oEvent) {
            var oButton = oEvent.getSource();
            if (!this._oAddPopover) {
                Fragment.load({
                    id: "idAddPopOverFragment",
                    name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.reuse.fragments.AddPopover",
                    controller: this
                }).then(function (oPopover) {
                    this._oAddPopover = oPopover;
                    this._oAddPopover.setModel(this.oi18nModel, "i18n");
                    this._oAddPopover.setModel(this.oQuotaModel, "quotaModel");
                    this.oValidFrom = Fragment.byId("idAddPopOverFragment", "idValidFrom");
                    this.oValidTo = Fragment.byId("idAddPopOverFragment", "idValidTo");
                    this.oQuotaDetails.addDependent(this._oAddPopover);
                    this._oAddPopover.openBy(oButton);
                }.bind(this));
            } else {
                this.oQuotaModel.setProperty("/plant", "");
                this.oValidFrom.setValue(null);
                this.oValidTo.setValue(null);
                this._oAddPopover.openBy(oButton);
            }
        },

        /**
         * Build and Return object for new validity period.
         * @param {string} sAddPlant - plant value
         * @param {object} dValidFrom - valid from date value
         * @param {object} dValidTo - valid to date value
         * @return {object} containing JSON strucutre
         * @private
         */
        getNewValidityPeriodPayload: function (sAddPlant, dValidFrom, dValidTo) {
            return {
                "COMPANYCODE": "",
                "CHILDNODE": [{
                    "COMPANYCODE": "",
                    "PLANT": sAddPlant,
                    "CHILDNODE": [{
                        "COMPANYCODE": "",
                        "PLANT": "",
                        "VALIDITY_FROM": dValidFrom,
                        "VALIDITY_TO": dValidTo,
                        "CHILDNODE": []
                    }]
                }]

            };
        },


        /**
         * To fetch the Payload for Add line for Quota popup
         * @param {string} sPlant - plant value from Plant Value help
         * @param {date} dValidFrom - Valid from Date
         * @param {date} dValidTo - Valid to Date
         * @returns {object} oPayload - Payload for add line function import
         */
        _getAddLinePayload: function (sPlant, dValidFrom, dValidTo) {
            var sExPlant = this._oParams.Plant;
            var sAddPlant = this.bItemLevel ? sPlant : sExPlant;
            var oNewValidityPeriodPayLoad = this.getNewValidityPeriodPayload(sAddPlant, dValidFrom, dValidTo);
            var aQuotaTableData = this.oQuotaModel.getProperty("/data");
            var aQuotaTableNewData = aQuotaTableData.slice();
            aQuotaTableNewData.push(oNewValidityPeriodPayLoad);
            var oAddLinePayLoadString = JSON.stringify(aQuotaTableNewData);
            return {
                "CentralContract": this._oParams.CentralContract,
                "CentralContractItem": this._oParams.CentralContractItem,
                "CentralContractItemDist": this._oParams.CentralContractItemDist,
                "DraftGuid": this._oParams.DraftGuid,
                "Payload": oAddLinePayLoadString
            };
        },
        /**
         * New Line Added to the Quota Tree Table
         */
        onAddLinePress: function () {
            var dValidFrom = this.oValidFrom.getValue();
            var dValidTo = this.oValidTo.getValue();
            var sPlant = "";
            if (this.bItemLevel) {
                sPlant = this.oQuotaModel.getProperty("/plant");
            }
            var oPayload = {};
            if ((dValidFrom && dValidTo && sPlant) ||  (dValidFrom && dValidTo && !this.bItemLevel)) {
                oPayload = this._getAddLinePayload(sPlant, dValidFrom, dValidTo);
            } else {
                MessageBox.error(this._oResourceBundle.getText("ErrorOnRequiredFields"));
                return;
            }
            this._oView.getModel().callFunction(Constants.FUNCTION_IMPORT.VALIDATE_QUOTA, {
                method: "POST",
                urlParameters: oPayload,
                success: this.onAddLineSuccess.bind(this),
                error: this.onAddLineError.bind(this)
            });
        },

        /**
         * Formatter to get state of overall quota
         * @param {string} sOverallQuota - overall quota value
         * @returns {string} overall quota state
         * @public
         */
        formatterOverallQuotaValue: function (sOverallQuota) {
            if (this.oQuotaModel.getProperty("/editPopup")) {
                return Formatter.formatterOverallQuotaValue(sOverallQuota);
            } else {
                return Constants.OVERALL_QUOTA.STATE.NONE;
            }
        },

        /**
         * Method to handle success response of Add functionality
         * @param {Object} oData - success response from the FI call
         * @private 
         */
        onAddLineSuccess: function (oData) {
            this.onAddPopoverClosePress();
            try {
                this.oQuotaModel.setProperty("/data", JSON.parse(oData.ValidateAdjustQuota.QUOTA_DATA));
                this.oQuotaModel.setProperty("/messageStripVisibility", false);
                this.oQuotaModel.setProperty("/messageStripValue", "");
            } catch (error) {
                MessageBox.error(this._oResourceBundle.getText("ErrorOnQuotaDataLoad"));
            }
        },

        /**
         *Method to handle Error response of Add functionality
         * @param {Object} oError - error response from the FI call
         * @private
         */
        onAddLineError: function (oError) {
            this.onAddPopoverClosePress();
            try {
                var oErrorResponse = JSON.parse(oError.responseText);
                this.oQuotaModel.setProperty("/messageStripVisibility", true);
                this.oQuotaModel.setProperty("/messageStripValue", oErrorResponse.error.message.value);
            } catch (error) {
                MessageBox.error(this._oResourceBundle.getText("ErrorOnQuotaDataAdd"));
            }
        },

        /**
         * Add Popover Close button press event handler.
         */
        onAddPopoverClosePress: function () {
            this._oAddPopover.close();
        },

        /**
         * Plant VH request handler in Add Quota Validity period popover.
         */
        onPlantValueHelpRequest: function () {
            if (!this._oPlantValueHelpDialog) {
                Fragment.load({
                    id: "idPlantValueHelpDialog",
                    name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.reuse.fragments.AddPlantVH",
                    controller: this
                }).then(function (oDialog) {
                    this._oPlantValueHelpDialog = oDialog;
                    this._oPlantValueHelpDialog.setModel(this.oi18nModel, "i18n");
                    this._oPlantValueHelpDialog.setModel(this.oQuotaModel, "quotaModel");
                    this._oPlantValueHelpSmartTable = Fragment.byId("idPlantValueHelpDialog", "idPlantSmartTable");
                    this._oPlantValueHelpSmartTable.getTable().setMode("SingleSelectLeft");
                    this._oPlantValueHelpSmartFilterBar = Fragment.byId("idPlantValueHelpDialog", "idPlantlSmartFilterBar");
                    this._oPlantValueHelpSmartTable.setSmartFilterId(this._oPlantValueHelpSmartFilterBar.getId());
                    this._oPlantValueHelpSmartTable.getTable().attachSelectionChange(this.onPlantVHSelectionChange.bind(this));
                    this._oAddPopover.addDependent(this._oPlantValueHelpDialog);
                    this._oPlantValueHelpDialog.open();
                }.bind(this));
            } else {
                this._oPlantValueHelpSmartFilterBar.fireSearch();
                this._oPlantValueHelpDialog.open();
            }
        },

        /* 
        * Plant VH Selection change event handler.
        */
        onPlantVHSelectionChange: function (oEvent) {
            if (oEvent.getSource().getSelectedItems().length > 0) {
                this.oQuotaModel.setProperty("/enablePlantValueHelpOK", true);
            }
        },

        /* 
        * Close Plant VH event handler.
        */
        onPlantClose: function () {
            this.oQuotaModel.setProperty("/enablePlantValueHelpOK", false);
            this._oPlantValueHelpSmartTable.getTable().removeSelections();
            this._oPlantValueHelpSmartFilterBar.setFilterData({}, true);
            this._oPlantValueHelpDialog.close();
        },

        /* 
        * Plant VH press Ok button event handler.
        */
        onPlantOK: function () {
            var oSelectedItem = this._oPlantValueHelpSmartTable.getTable().getSelectedItem();
            var sPlant = oSelectedItem.getBindingContext().getProperty("ProcmtHubPlant");
            this.oQuotaModel.setProperty("/plant", sPlant);
            this.onPlantClose();
        },

        /* 
        * Plant VH initialise event handler.
        */
        onInitialisePlantSmartTable: function () {
            this._oPlantValueHelpSmartFilterBar.fireSearch();
        }
       
    };
});