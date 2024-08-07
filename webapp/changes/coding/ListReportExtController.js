/***
@controller Name:sap.suite.ui.generic.template.ListReport.view.ListReport,
*@viewId:ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP
*/
sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/m/BusyDialog",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "vwks/nlp/s2p/mm/reuse/lib/supplierStatus/SupplierStatuses",
    "vwks/nlp/s2p/mm/reuse/lib/util/NavigationHelper",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/utils/Constants",
    "vwks/nlp/s2p/mm/reuse/lib/util/Formatter",
    "vwks/nlp/s2p/mm/reuse/lib/documentHistory/type/ApplicationType",
    "vwks/nlp/s2p/mm/reuse/lib/documentHistory/DocumentHistoryHelper",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/reuse/QuotaDetails",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/reuse/CopyContract"
],
/* eslint-disable max-params */
    function (
        ControllerExtension,
        BusyDialog,
        MessageToast,
        MessageBox,
        SupplierStatuses,
        NavigationHelper,
        Constants,
        ReuseFormatter,
        ApplicationType,
        DocumentHistoryHelper,
        ReuseQuotaDetails,
        CopyContract
    ) {
        "use strict";
        return ControllerExtension.extend("vwks.nlp.s2p.mm.pctrcentral.manage.ListReportExtController", {
            /* eslint-disable max-len */
            // this section allows to extend lifecycle hooks or override public methods of the base controller
            override: {

				/*
				 * Extending life cycle method in adaptation app
				 */
                onInit: function () {
                    this._oView = this.getView();

                    //i18n Resource model for translation
                    var oi18nModel = this._oView.getController().getOwnerComponent().getModel("i18n");
                    if (oi18nModel) {
                        this._oResourceBundle = oi18nModel.getResourceBundle();
                    }
                    this.oSupplierStatuses = new SupplierStatuses(this._oView, this._oResourceBundle);
                    this.oRenewButtonHier = sap.ui.getCore().byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--renew_hctr-_tab2"
                    );
                    this.oRenewButtonBrand = sap.ui.getCore().byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--renew-_tab1"
                    );

                },

				/*
				 * overriding life cycle method to add additional fields for odata service call 
				 */
                onAfterRendering: function () {
                    // requesting additional fields in odata service call
                    var aRequestedFields = ["PurchasingGroup", "ItemMaterialDesc", "Quota", "ProcessIndicator","Distribution_Icon_FC"];
                    var aBrandRequestFields = ["PurchasingGroup", "ItemMaterialDesc", "Quota", "ProcessIndicator","Distribution_Icon_FC", "InfoContractFlag"];
                    this.oPurchaseContractsSmartTable = this.base.byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--listReport-_tab1"
                    );
                    var oPurchaseContractsResponsiveTable = this.base.byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--responsiveTable-_tab1"
                    );
                    if (oPurchaseContractsResponsiveTable) {
                        oPurchaseContractsResponsiveTable.attachSelectionChange(this.onSelectionChangeContractTable.bind(this));
                    }
                    if (this.oPurchaseContractsSmartTable) {
                        this.oPurchaseContractsSmartTable.attachBeforeRebindTable(this.onBeforeRebindBrandContractsTable.bind(this));
                    }
                    if (this.oPurchaseContractsSmartTable.getRequestAtLeastFields() !== "") {
                        this.oPurchaseContractsSmartTable.setRequestAtLeastFields(this.oPurchaseContractsSmartTable.getRequestAtLeastFields() + "," +
                            aBrandRequestFields);
                    } else {
                        this.oPurchaseContractsSmartTable.setRequestAtLeastFields(aBrandRequestFields);
                    }
                    this.oPurchaseHierContractsSmartTable = this.base.byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--listReport-_tab2"
                    );
                    var oPurchaseHierContractsResponsiveTable = this.base.byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--responsiveTable-_tab2"
                    );
                    if (oPurchaseHierContractsResponsiveTable) {
                        oPurchaseHierContractsResponsiveTable.attachSelectionChange(this.onSelectionChangeHierContractTable.bind(this));
                    }
                    if (this.oPurchaseHierContractsSmartTable.getRequestAtLeastFields() !== "") {
                        this.oPurchaseHierContractsSmartTable.setRequestAtLeastFields(this.oPurchaseHierContractsSmartTable.getRequestAtLeastFields() + "," +
                            aRequestedFields);
                    } else {
                        this.oPurchaseHierContractsSmartTable.setRequestAtLeastFields(aRequestedFields);
                    }
                    this._oListReportFiltersection = this._oView.byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--listReportFilter"
                    );
                    this._oSmartVariant = this._oView.byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--template::PageVariant"
                    );
                    this._oListReportFiltersection.attachEvent("initialise", this.onListReportSmartFilterBarInitialise.bind(this));
                    this._oSmartVariant.attachSelect(this.onSelectVariant.bind(this));
                    //C_CntrlPurchaseContractItemTP i18n Resource model
                    //Common i18n model for both item and distribution level Quota Overview Dialog
                    this.oCntrlPCItemi18nModel = this._oView.getController().getOwnerComponent().getModel(
                        "i18n|sap.suite.ui.generic.template.ObjectPage|C_CntrlPurchaseContractItemTP");
                    if (this.oCntrlPCItemi18nModel) {
                        this._oCntrlPCItemResourceBundle = this.oCntrlPCItemi18nModel.getResourceBundle();
                    }
                    //Quota Details Reuse Component Initialiser
                    ReuseQuotaDetails.init(this._oView);

                    //multi select checkbox
                    var oAdaptFilterButton = this.base.byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--listReportFilter-btnFilters"
                    );
                    if (oAdaptFilterButton) {
                        oAdaptFilterButton.attachPress(this.onPressAdaptFiltersButton.bind(this));
                    }
                }
  
            },

            /**
             * Central Brand Contracts table on before rebind table event handler
             * @param {sap.ui.base.Event} oEvent Event Object
             */
            onBeforeRebindBrandContractsTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                //Event handlers for the binding
                mBindingParams.events = {
                    "dataReceived": function () {
                        //After data received if ZIWK contract has selected in table we will enable or disable 
                        //the Copy Info-Contract Button based on InfoContractFlag
                        var aSelectedBrandContractsContexts = this.oPurchaseContractsSmartTable.getTable().getSelectedContexts();
                        if (aSelectedBrandContractsContexts.length === 1 && this.oCopyInfoContractButton) {
                            this.oCopyInfoContractButton.bindProperty("enabled", {
                                value: aSelectedBrandContractsContexts[0].getProperty("InfoContractFlag")
                            });
                        } else if (this.oCopyInfoContractButton) {
                            this.oCopyInfoContractButton.bindProperty("enabled", {
                                value: false
                            });
                        }
                    }.bind(this)
                };
            },

            /**
             * Row selection change event of brand contract
             * @param {sap.ui.base.Event} oEvent Event Object
             */
            onSelectionChangeContractTable: function (oEvent) {
                var oSelectedSubordCCTRRow = oEvent.getSource().getSelectedContexts();
                if (oSelectedSubordCCTRRow.length > 0) {
                    var sProcessIndicator = oSelectedSubordCCTRRow[0].getProperty(oSelectedSubordCCTRRow[0].getPath()).ProcessIndicator;
                    if (sProcessIndicator === Constants.PROCESS_INDICATOR.PMATERIAL) {
                        this.oRenewButtonBrand.bindProperty("enabled", {
                            value: false
                        });
                    } else {
                        this.oRenewButtonBrand.bindProperty("enabled", {
                            value: true
                        });
                    }
                } else {
                    this.oRenewButtonBrand.bindProperty("enabled", {
                        value: false
                    });
                }

                this.oStdBrandCopyButton = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--action::MM_PUR_CNTRL_CTR_MAINTAIN_SRV.MM_PUR_CNTRL_CTR_MAINTAIN_SRV_Entities::C_CentralPurchaseContractTPCopy_contract-_tab1"
                );
                this.oCopyInfoContractButton = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--vwks.nlp.s2p.mm.pctrcentral.manage.idBrandInfoCopyBtn"
                );
                //By default Copy Info-Contract button will be disabled
                //For enabling Copy Info-Contract button only one contract has to be selected
                if (oSelectedSubordCCTRRow.length === 1) {
                    //Based on "InfoContractFlag" property Copy Info-Contract button will be disabled/enabled
                    var bEnableCopyInfoContractBtn = oSelectedSubordCCTRRow[0].getProperty("InfoContractFlag");
                    this.oCopyInfoContractButton.bindProperty("enabled", {
                        value: bEnableCopyInfoContractBtn
                    });
                    //Enable / Disable standard copy button
                    this.oStdBrandCopyButton.bindProperty("enabled", {
                        value: !bEnableCopyInfoContractBtn
                    });
                } else {
                    this.oCopyInfoContractButton.bindProperty("enabled", {
                        value: false
                    });

                    this.oStdBrandCopyButton.bindProperty("enabled", {
                        value: false
                    });
                }
            },
            /**
             * event on copy button click from list report
             */
            handleCustomCopyContract: function () {
                CopyContract.init(this.getView(), this);
                CopyContract.loadDialog(this._oView.getController().getOwnerComponent().getModel(
                    "i18n|sap.suite.ui.generic.template.ListReport|C_CentralPurchaseContractTP"), true);
            },
            /**
             * Event handler for Brand Copy Info-Contract button press
             */
            onBrandInfoCopyButtonPress: function () {
                var bListPage = true;
                var oI18nModel = this.getView().getController().getOwnerComponent().getModel(
                    "i18n|sap.suite.ui.generic.template.ListReport|C_CentralPurchaseContractTP");
                CopyContract.onBrandInfoCopy(this.getView(), bListPage, oI18nModel);
            },
            /**
             * Row selection change event of Hierarchy contract 
             * @param {sap.ui.base.Event} oEvent Event Object
             */
            onSelectionChangeHierContractTable: function (oEvent) {
                var oSelectedSubordCCTRRow = oEvent.getSource().getSelectedContexts();
                if (oSelectedSubordCCTRRow.length > 0) {
                    var sProcessIndicator = oSelectedSubordCCTRRow[0].getProperty(oSelectedSubordCCTRRow[0].getPath()).ProcessIndicator;
                    if (sProcessIndicator === Constants.PROCESS_INDICATOR.PMATERIAL) {
                        this.oRenewButtonHier.bindProperty("enabled", {
                            value: false
                        });
                    } else {
                        this.oRenewButtonHier.bindProperty("enabled", {
                            value: true
                        });
                    }
                } else {
                    this.oRenewButtonHier.bindProperty("enabled", {
                        value: false
                    });
                }
                this.oCustomCopyButton = this.base.byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--vwks.nlp.s2p.mm.pctrcentral.manage.idCustomCopyContractBtn"
                    );
                if (oSelectedSubordCCTRRow.length === 1) {
                    this.oCustomCopyButton.setEnabled(true);
                } else {
                    this.oCustomCopyButton.setEnabled(false);
                }
            },

            /**
             * press event for Adapt Filters button on smartfilter bar
             */
            onPressAdaptFiltersButton: function () {
                var oInterval = setInterval(function () {
                    var sDialogId = "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--listReportFilter-adapt-filters-dialog";
                    if (this.base.byId(sDialogId)) {
                        var sPrefixId = this.base.byId(sDialogId).getContent()[0].getId();
                        var sTableId = sPrefixId + "-listView-innerListViewTable";
                        sap.ui.getCore().byId(sTableId).setProperty("multiSelectMode", "Default");
                        clearInterval(oInterval);
                        return;
                    }
                }.bind(this), 50);
            },

            /**
             * This method initialise Smartfiler bar for list report page.
             * In additional it's used for actions should be triggered when everything is loaded.
             * @param {sap.ui.base.Event} oEvent, The event object
             */

            onListReportSmartFilterBarInitialise: function (oEvent) {
                this._oSmartFilterBar = oEvent.getSource();
                var sDefaultVariantKey = this._oSmartVariant.getDefaultVariantKey();
                this._oSmartFilterBar.getControlByKey("PurchasingGroup").getLabels()[0].setText(this._oResourceBundle.getText("LeadPurchasingGroup"));
 
                var sSelectedTab = this.getVariantSelectedTab(sDefaultVariantKey);
                this.setSelectedDefaultTabOnListReport(sSelectedTab);             
            },

            /**
             * Get selected tab value from variant
             * @param {string} sVariantId variant id
             * @returns {string} selected tab
             */
            getVariantSelectedTab: function(sVariantId) {
                // "_tab2" is a technical id of 'Central Group Contract' tab
                var sSelectedTab = "_tab2";
                if (!!sVariantId && sVariantId !== "*standard*") {
                    var oCustomData = JSON.parse(this._oSmartVariant.getVariantContent(this._oSmartFilterBar, sVariantId).filterBarVariant);
                    sSelectedTab = oCustomData["_CUSTOM"]["sap.suite.ui.generic.template.genericData"].tableTabData.selectedTab;
                }
                return sSelectedTab;
                
            },

            /**
             * Event is fired after a variant has been loaded and applied to the FilterBar
             * Set the correct selected tab during to switch between diferent variants
             */
            onSelectVariant: function() {
                var sCurrentVariantId = this._oSmartVariant.getCurrentVariantId();
                var sSelectedTab = this.getVariantSelectedTab(sCurrentVariantId);
                var oIconTabBar = this._oView.byId("ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--template::IconTabBar");
                oIconTabBar.setSelectedKey(sSelectedTab);
                // simulate user's click to refresh FilterBar and Table
                oIconTabBar.fireSelect({selectedKey: sSelectedTab});
            },

            /**
             * Update the default tab in IconTabBar.
             * @param {string} sSelectedTab, key of tab which should be selected
             */
            setSelectedDefaultTabOnListReport: function (sSelectedTab) {
                var oIconTabBar = this._oView.byId("ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ListReport.view.ListReport::C_CentralPurchaseContractTP--template::IconTabBar");
                oIconTabBar.setSelectedKey(sSelectedTab);
                // simulate user's click to refresh FilterBar and Table
                oIconTabBar.fireSelect({selectedKey: sSelectedTab});
                this.oPurchaseHierContractsSmartTable.updateProperty("header");
            },

			/**
			 * This method handles the display of warning messages on save/delete calls
			 * @public
			 * @param {array} aRequests array of requests
			 * @param {int} iIndex index of request
			 **/
            showWarningMessage: function (aRequests, iIndex) {
                var oHdrMessage = JSON.parse(aRequests[iIndex].response.headers["sap-message"]);
                if (oHdrMessage.severity === Constants.MESSAGE_SEVERITY.WARNING) {
                    var sCancelWarningMessage = oHdrMessage.message;
                    MessageBox.warning(sCancelWarningMessage, {
                        actions: MessageBox.Action.OK
                    });
                }
            },

			/**
			 * Navigate to pricing conditions
			 * @param {object} oContext method's parameter context. It holds the passed value by invoker.
             * @param {string} sHeaderURL header path 
			 */
            navigateToPricingConditions: function (oContext, sHeaderURL) {
				/* This odata call is used to get contract item and pass into target URL for context preparation,so that
				it could navigate on item object page
				*/
                var oModel = this.getView().getModel(),
                    oContractContext = oContext.getObject(),
                    oContractItemContext = null,
                    sURL = oContext.sPath + "/to_CntrlPurchaseContractItemTP",
                    sNoDataText = this._oResourceBundle.getText("NoItemText"),
                    oBusyDialog = new BusyDialog();
                oBusyDialog.open();
                oModel.read(sURL, {
                    urlParameters: {
                        $top: 1
                    },
                    success: function (oData) {
                        oBusyDialog.close();
                        if (oData.results.length > 0) {
                            oContractItemContext = oData.results[0];

                            var sContractHeader = this.getView().getModel().createKey(sHeaderURL, {
                                CentralPurchaseContract: oContractContext.CentralPurchaseContract,
                                DraftUUID: oContractContext.DraftUUID,
                                IsActiveEntity: true
                            });
                            var sContractItem = this.getView().getModel().createKey("C_CntrlPurchaseContractItemTP", {
                                CentralPurchaseContractItem: oContractItemContext.CentralPurchaseContractItem,
                                CentralPurchaseContract: oContractContext.CentralPurchaseContract,
                                DraftUUID: oContractItemContext.DraftUUID,
                                IsActiveEntity: true
                            });

                            var sContractItemPath = sContractHeader + "/to_CntrlPurchaseContractItemTP(" + sContractItem.split("(")[1];

                            //Get path for navigation
                            NavigationHelper.getNavigationPath(this.getView().getController(), "MCPC", sContractItemPath)
                                .then(function (oNavigationDetails) {
                                    //Open in same window
                                    NavigationHelper.navigateWithURLHelper(oNavigationDetails.sPath);
                                });
                        } else {
                            MessageToast.show(sNoDataText);
                            this.flagSettingToFalsePricingConditions();
                        }
                    }.bind(this),
                    error: function (oError) {
                        oBusyDialog.close();
                        this.flagSettingToFalsePricingConditions();
                        if (JSON.parse(oError.responseText)) {
                            MessageToast.show(JSON.parse(oError.responseText).error.message.value);
                        }
                    }.bind(this)
                });
            },

            /**
			 * Navigate to Item's Distribution line.
			 * @param {sap.ui.base.Event} oEvent press event object
			 */
            handleDistrLineIconPress: function (oEvent) {
                var oJumpToDistrLineIcon = oEvent.getSource();
                var sHeaderURL = oJumpToDistrLineIcon.data("headerUrl");
                var oContext = oJumpToDistrLineIcon.getBindingContext();
                var bIsPossibleToNav = oContext.getObject("Distribution_Icon_FC");

                if (!bIsPossibleToNav) {
                    return;
                }

                sap.ui.require(["sap/ui/util/Storage"], function (Storage) {
                    var oMyStorage = new Storage(Storage.Type.session, "navigation_parameter");
                    oMyStorage.put("navigationFlag", {
                        flagNavigationDistrLine: true
                    });
                    this.navigateToDistributionLine(oContext, sHeaderURL);
                }.bind(this));
            },

            /**
             * Read contracts data for further navigation.
             * @param {sap.ui.model.ContextBinding} oContext page binding context
             */
            navigateToDistributionLine: function (oContext) {
                this.getView().setBusy(true);
                var oODataModel = this.getView().getModel();
                var sHeaderPath = oContext.getPath();

                oODataModel.read(sHeaderPath + "/to_CntrlPurchaseContractItemTP", {
                    urlParameters: {
                        $top: 1
                    },
                    success: this.successLoadContractItemDataHandler.bind(this, sHeaderPath),
                    error: this.errorLoadContractItemDataHandler.bind(this)
                });
            },

            /**
             * Success load contract items data handler.
             * @param {string} sContractHeader contract header path
             * @param {object[]} oData array of contracts
             */
            successLoadContractItemDataHandler: function (sContractHeader, oData) {
                this.getView().setBusy(false);
                var aContractItems = oData.results;
                if (!aContractItems.length) {
                    this.flagSettingToFalse();
                    MessageToast.show(this._oResourceBundle.getText("NoItemText"));
                    return;
                }
                var oContractItemData = aContractItems[0];
                var sContractItemKey = this.getView().getModel().createKey("C_CntrlPurchaseContractItemTP", {
                    CentralPurchaseContractItem: oContractItemData.CentralPurchaseContractItem,
                    CentralPurchaseContract: oContractItemData.CentralPurchaseContract,
                    DraftUUID: oContractItemData.DraftUUID,
                    IsActiveEntity: true
                });

                var sContractItemPath = sContractHeader + "/to_CntrlPurchaseContractItemTP(" + sContractItemKey.split("(")[1];

                NavigationHelper.getNavigationPath(this.getView().getController(), "MCPC", sContractItemPath)
                    .then(function (oNavigationDetails) {
                        NavigationHelper.navigateWithURLHelper(oNavigationDetails.sPath);
                    });
            },

            /**
            * Error load contract items data handler.
            * @param {object} oError error object
            */
            errorLoadContractItemDataHandler: function (oError) {
                this.getView().setBusy(false);

                this.flagSettingToFalse();
                if (JSON.parse(oError.responseText)) {
                    MessageToast.show(JSON.parse(oError.responseText).error.message.value);
                }
            },

            /**
             * Set navigation flag to false
             */
            flagSettingToFalse: function () {
                sap.ui.require(["sap/ui/util/Storage"], function (Storage) {
                    var oMyStorage = new Storage(Storage.Type.session, "navigation_parameter");
                    oMyStorage.put("navigationFlag", {
                        flagNavigationDistrLine: false
                    });
                });
            },

			/**
			 * Navigate to Pricing conditions
			 * @param {sap.ui.base.Event} oEvent, The event object
			 */
            handlePricingConditionsIconPress: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext(),
                    sHeaderURL = "C_CentralPurchaseContractTP";
                sap.ui.require(["sap/ui/util/Storage"], function (Storage) {
                    var oMyStorage = new Storage(Storage.Type.session, "navigation_parameter");
                    oMyStorage.put("navigationFlag", {
                        flagNavigationPricingConditions: true
                    });
                    // Invoker function
                    this.navigateToPricingConditions(oContext, sHeaderURL);
                }.bind(this));
            },

			/**
			 * Navigate to Pricing conditions
			 * @param {sap.ui.base.Event} oEvent, The event object
			 */
            handlePricingConditionsHierarchyIconPress: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext(),
                    sHeaderURL = "C_CntrlPurContrHierHdrTP";
                sap.ui.require(["sap/ui/util/Storage"], function (Storage) {
                    var oMyStorage = new Storage(Storage.Type.session, "navigation_parameter");
                    oMyStorage.put("navigationFlag", {
                        flagNavigationPricingConditions: true
                    });
                    // Invoker function
                    this.navigateToPricingConditions(oContext, sHeaderURL);
                }.bind(this));
            },

            // Set flagNavigationPricingConditions flag to false
            flagSettingToFalsePricingConditions: function () {
                sap.ui.require(["sap/ui/util/Storage"], function (Storage) {
                    var oMyStorage = new Storage(Storage.Type.session, "navigation_parameter");
                    oMyStorage.put("navigationFlag", {
                        flagNavigationPricingConditions: false
                    });
                });
            },

			/*
			 * Navigate to Create Distribution object page
			 */
            handleRequestForContract: function () {

                //Reference of the default Model
                var oModel = this.getView().getModel();
                //Promise Object to get the Draft Guid from the Function Import
                var oDraftPromise = this._getDraftPromise(oModel);
                oDraftPromise.then(function (oResponse) {
                    var oParams = {
                        "key_link": oResponse.CreatePMATROD.KeyLink,
                        "DraftUUID": oResponse.CreatePMATROD.DraftUUID,
                        "IsActiveEntity": oResponse.CreatePMATROD.IsActiveEntity
                    };

                    NavigationHelper.navigateToOutboundTarget(this.getView().getController(), "CreateContractDistribution", oParams);
                }.bind(this));

            },

			/**
			 * Return tooltip for supplier status. Formatter is used.
			 * @param {string} sSupplierOverallStatus supplier overall status code
			 * @return {string} tooltip text
			 * @public
			 */
            getSupplierOverallStatusTooltip: function (sSupplierOverallStatus) {
                return ReuseFormatter.getSupplierOverallStatusTooltip(sSupplierOverallStatus, this._oResourceBundle);
            },

			/**
			 * Return icon src. Formatter is used.
			 * @param {string} sSupplierOverallStatus supplier overall status code
			 * @return {string} icon src
			 * @public
			 */
            getSupplierOverallStatusIcon: function (sSupplierOverallStatus) {
                return ReuseFormatter.getSupplierOverallStatusIcon(sSupplierOverallStatus);
            },

			/**
			 * Return icon color. Formatter is used.
			 * @param {string} sSupplierOverallStatus supplier overall status code
			 * @return {string} icon color
			 * @public
			 */
            getSupplierOverallStatusState: function (sSupplierOverallStatus) {
                return ReuseFormatter.getSupplierOverallStatusState(sSupplierOverallStatus);
            },

			/**
			 * Supplier Overall Status press event handler.
			 * @param {sap.ui.base.Event} oEvent press event
			 */
            onSupplierOverallStatusPress: function (oEvent) {
                var oSupplierOverallStatusIcon = oEvent.getSource();
                var oContractContext = oSupplierOverallStatusIcon.getBindingContext();
                this.oSupplierStatuses.loadPopover(oSupplierOverallStatusIcon)
                    .then(function () {
                        this.oSupplierStatuses.setBusy(true);
                        return this.oSupplierStatuses.loadSupplierStatus(oContractContext);
                    }.bind(this))
                    .then(function (oData) {
                        this.oSupplierStatuses.setSupplierStatusData(oData);
                        this.oSupplierStatuses.setBusy(false);
                    }.bind(this))
                    .catch(function (oError) {
                        this.oSupplierStatuses.setBusy(false);
                        if (JSON.parse(oError.responseText)) {
                            MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                        }
                    }.bind(this));
            },
			/**
			 * The method to call function import to get the Draft Guid used to create new Distribution line
			 * @return {promise} Promise Object of the function import
			 * @param {sap.ui.model.odata.V2.ODataModel} oModel is the reference of default oData Model
			 **/
            _getDraftPromise: function (oModel) {
                var oRoDDraftIdPromise = new Promise(function (resolve, reject) {
                    oModel.callFunction(Constants.FUNCTION_IMPORT.CREATE_PMAT_ROD, {
                        method: "POST",
                        urlParameters: {

                        },
                        success: function (oData) {
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
                return oRoDDraftIdPromise;
            },
			/**
			 * Open document history dialog from document History Icon
			 * @param {sap.ui.base.Event} oEvent The event object
			 */
            openDocumentHistoryDialog: function (oEvent) {
                DocumentHistoryHelper.openDocumentHistoryDialog(oEvent, this.getView(), ApplicationType.MCPC_HEADER);
            },

            /**
			 * Method to load Quota Details Reuse Component
             * @param {sap.ui.base.Event} oEvent - press event object
			 */
            handleOverallQuotaInfoIconPress: function (oEvent) {
                var oQuotaDetailsIcon = oEvent.getSource();
                var oParams = {
                    level: "",
                    DocumentType: "",
                    Material: "",
                    CompanyCode: ""
                };
                var oContractBindingContext = oQuotaDetailsIcon.getBindingContext();
                if (oContractBindingContext) {
                    oParams.Material = oContractBindingContext.getProperty("ItemMaterial");
                    if (oContractBindingContext.getDeepPath().split("/")[1].split("(")[0] === "C_CentralPurchaseContractTP") //Brand Contract
                    {
                        oParams.DocumentType = Constants.CONTRACT_TYPE.BRAND;
                        var oPromise = this._getCompanyCodeForContract(oContractBindingContext);
                        oPromise.then(function (oResponse) {
                            oParams.CompanyCode = oResponse.CompanyCode;
                        })
                            .finally(function () {
                                NavigationHelper.navigateToOutboundTarget(this.getView().getController(), "MQ", oParams, true);
                            }.bind(this));
                    } else {
                        oParams.DocumentType = Constants.CONTRACT_TYPE.GROUP;
                        NavigationHelper.navigateToOutboundTarget(this.getView().getController(), "MQ", oParams, true);
                    }

                }
            },
            /**
             * private method to fetch header values for the contract
             * @param {object} oContractBindingContext Binding Context
             * @return {object} Promise Object of the funtion
             */
            _getCompanyCodeForContract: function (oContractBindingContext) {
                return new Promise(function (oResolve, oReject) {
                    oContractBindingContext.getModel()
                        .read("/" + oContractBindingContext.getDeepPath().split("/")[1],
                            {
                                success: function (oResponse) {
                                    oResolve(oResponse);
                                },
                                error: function (oError) {
                                    oReject(oError);
                                }
                            });
                });
            }
        });
    });