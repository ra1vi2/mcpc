/*
 * Copyright (C) 2009-2020 SAP SE or an SAP affiliate company. All rights reserved.
 * @controller Name:sap.suite.ui.generic.template.ObjectPage.view.Details,
 * @viewId:ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP
 */
sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterType",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Label",
    "sap/m/ColumnListItem",
    "sap/m/FormattedText",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/utils/Formatter",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/utils/Constants",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/coding/StandardTextSearchHelp",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/coding/AlternativeParts",
    "vwks/nlp/s2p/mm/reuse/lib/supplierStatus/SupplierStatuses",
    "vwks/nlp/s2p/mm/reuse/lib/util/Formatter",
    "vwks/nlp/s2p/mm/reuse/lib/util/NavigationHelper",
    "vwks/nlp/s2p/mm/reuse/lib/util/Constants",
    "sap/ui/core/Item",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/reuse/QuotaDetails",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/reuse/LocationQuickView",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/reuse/ReuseMessageBox",
    "sap/m/Token",
    "sap/ui/model/Sorter",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/reuse/CopyContract",
    "sap/ui/core/format/DateFormat",
    "sap/m/Tokenizer"
],
    /* eslint-disable max-params */
    function (
        ControllerExtension,
        Filter,
        FilterType,
        FilterOperator,
        JSONModel,
        NumberFormat,
        Fragment,
        ValueState,
        MessageToast,
        MessageBox,
        Label,
        ColumnListItem,
        FormattedText,
        Formatter,
        Constants,
        StandardTextSearchHelp,
        AlternativeParts,
        SupplierStatuses,
        ReuseFormatter,
        NavigationHelper,
        ReuseConstants,
        Item,
        ReuseQuotaDetails,
        ReuseLocationQuickView,
        ReuseMessageBox,
        Token,
        Sorter,
        CopyContract,
        DateFormat,
        Tokenizer
    ) {
        "use strict";
        return ControllerExtension.extend("vwks.nlp.s2p.mm.pctrcentral.manage.ObjectPageExt", {
            /* eslint-disable max-len */
            override: {
                /**
                 * Extending onInit life cycle method in adaptation app
                 */
                onInit: function () {
                    var oView = this.getView();
                    var oController = oView.getController();
                    //Set Current view references
                    this._setCurrentViewReferences(oView, oController);
                    //Set Resource Models
                    this._setResourceBundle(oController);
                    oController.extensionAPI.attachPageDataLoaded(this.handlePageDataLoaded.bind(this));
                    //Set distribution table personalization for ignore columns
                    this._distributionTablePersonalization();
                    if (this._sCurrentView === Constants.VIEW_ID.DISTRIBUTION || this._sCurrentView === Constants.VIEW_ID.HIERARCHY_DISTRIBUTION) {
                        oController.extensionAPI.attachPageDataLoaded(this.checkAndEnableDemandManagement.bind(this));
                        ReuseLocationQuickView.init(oView, this._oDistri18nModel);
                    }
                    this.oSupplierStatuses = new SupplierStatuses(oView, this._oResourceBundle);
                    this.oStandardTextSH = new StandardTextSearchHelp(oView, this._oResourceBundle);
                    this.oAlternativeParts = new AlternativeParts(oView, oController, this._oResourceBundle);

                    //Quota Details Reuse Component Initialiser
                    ReuseQuotaDetails.init(oView);
                    this.oi18nModel = oController.getOwnerComponent().getModel("i18n");
                    ReuseMessageBox.init(this.getView(), this.oi18nModel);
                    if (this._sCurrentView === Constants.VIEW_ID.ITEM || this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM) {
                        oController.extensionAPI.attachPageDataLoaded(this.checkAndEnableZsb.bind(this));
                        //Zsb Reference table
                        this.oZsbRefPlantComboBox = this.byId("idRefPlantComboBox");
                        this.oZsbRefTable = this.byId("idZsbReferencesSmartTable");
                    }

                    // Array to keep track of selected/ Deslected nodes to stop reusion
                    this._aRemovedTreeSelectionInterval = [];
                    this._aPreviousTreeSelectionInterval = [];
                    // create a model for distribution VH
                    this._initializeModel();

                    this._initalizePaymentShippingIncoTerms();

                    var oPropertyModel = this._createPropertyModel();
                    this.getView().setModel(oPropertyModel, "propertyModel");
                    //Attach Events to Output Management Component	
                    this._attachOutputManagementComponentEvents();

                    this.oSystemDistModel = new JSONModel({
                        items: [{
                            key: Constants.SELECT_VALUE.YES,
                            text: "Yes"
                        },
                        {
                            key: Constants.SELECT_VALUE.NO,
                            text: "No"
                        }
                        ]

                    });
                    this.getView().setModel(this.oSystemDistModel, "SystemDistModel");
                    this.customCheckStartupParams();
                },

                /**
                 * Extending life cycle method in adaptation app
                 */
                onAfterRendering: function () {
                    this._setSubordinateAndDistRequestedFields();
                    this._attachHeaderAndItemContractEvents();
                    this._setNetPriceLabel();
                    var oStdCopyButton = this.base.byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP--action::MM_PUR_CNTRL_CTR_MAINTAIN_SRV.MM_PUR_CNTRL_CTR_MAINTAIN_SRV_Entities::Copy"
                    );
                    if (oStdCopyButton) {
                        oStdCopyButton.bindProperty("visible", {
                            value: false
                        });
                    }
                }
            },
            
            /**
             * Gets startup parameters. Trigger navigation to DL if "notifContrType" param exist
             */
            customCheckStartupParams: function () {
                // this functionality was added as a part of 1117163 incident. Handle parameters coming from notification
                var oComponent = this.getView().getController().getOwnerComponent(),
                    oComponentData = oComponent.getAppComponent().getComponentData();
                
                if (oComponentData && oComponentData.startupParameters && oComponentData.startupParameters.notifContrType) {
                    if (oComponentData.startupParameters.notifContrType[0]) {
                        var oParams = oComponentData.startupParameters,
                            sUUID = oParams.DraftUUID[0].split("'")[1],
                            sContractType = oComponentData.startupParameters.notifContrType[0],                          
                            sContractHeaderEntity = sContractType === Constants.NAVIGATION_TYPE.GROUP ? "C_CntrlPurContrHierHdrTP" : "C_CentralPurchaseContractTP";

                        var sCntrlPurContrHierHdrKey = this.getView().getController().getOwnerComponent().getModel().createKey(sContractHeaderEntity, {
                            CentralPurchaseContract: oParams.CentralPurchaseContract[0],
                            DraftUUID: sUUID,
                            IsActiveEntity: oParams.IsActiveEntity[0]
                        });
                        var sCntrlPurchaseContractItemKey = this.getView().getController().getOwnerComponent().getModel().createKey("C_CntrlPurchaseContractItemTP", {
                            CentralPurchaseContractItem: oParams.CentralPurchaseContractItem[0],
                            CentralPurchaseContract: oParams.CentralPurchaseContract[0],
                            DraftUUID: sUUID,
                            IsActiveEntity: oParams.IsActiveEntity[0]
                        });
                        var sCntrlPurContrDistributionKey = this.getView().getController().getOwnerComponent().getModel().createKey("C_CntrlPurContrDistributionTP", {
                            CentralPurchaseContractItem: oParams.CentralPurchaseContractItem[0],
                            CentralPurchaseContract: oParams.CentralPurchaseContract[0],
                            DistributionKey: oParams.DistributionKey[0],
                            DraftUUID: sUUID,
                            IsActiveEntity: oParams.IsActiveEntity[0]
                        });
                        var sPath = sCntrlPurContrHierHdrKey + "/" + sCntrlPurchaseContractItemKey.replace("C", "to") + "/" + sCntrlPurContrDistributionKey.replace("C", "to");
                        NavigationHelper.getNavigationPath(this.getView().getController(), "MCPC", sPath)
                            .then(function (oNavigationDetails) {
                                //Open in same window
                                NavigationHelper.navigateWithURLHelper(oNavigationDetails.sPath);
                            });
                    }
                }
            },
            
            /**
             * The function is to identify current view
             * @param {object} oView is the view reference
             * @param {object} oController is the controller reference
             * @private
             */
            _setCurrentViewReferences: function (oView, oController) {
                this.oSubordCCTRTable = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP--SubordCntrlContr::responsiveTable"
                );

                var sHeaderViewId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP";
                var sItemViewId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP";
                var sDistributionViewId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrDistributionTP";
                var sHeaderDistributionViewId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHdrDistrTP";
                var sHierarchyHeaderViewId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP";
                var sHierarchyItemViewId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP";
                var sHierarchyDistributionViewId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemDistrTP";
                var sHierarchyHeaderDistributionViewId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrDistrTP";

                oController.getOwnerComponent().getModel().attachBatchRequestCompleted(this.onODataBatchRequestCompleted.bind(this));
                this.oUIModel = oController.getOwnerComponent().getModel("ui");
                switch (oView.getId()) {
                    case sHeaderViewId:
                        this._sCurrentView = Constants.VIEW_ID.HEADER;
                        break;
                    case sItemViewId:
                        this._sCurrentView = Constants.VIEW_ID.ITEM;
                        break;
                    case sDistributionViewId:
                        this._sCurrentView = Constants.VIEW_ID.DISTRIBUTION;
                        break;
                    case sHeaderDistributionViewId:
                        this._sCurrentView = Constants.VIEW_ID.HEADER_DISTRIBUTION;
                        break;
                    case sHierarchyHeaderViewId:
                        this._sCurrentView = Constants.VIEW_ID.HIERARCHY_HEADER;
                        break;
                    case sHierarchyItemViewId:
                        this._sCurrentView = Constants.VIEW_ID.HIERARCHY_ITEM;
                        break;
                    case sHierarchyDistributionViewId:
                        this._sCurrentView = Constants.VIEW_ID.HIERARCHY_DISTRIBUTION;
                        break;
                    case sHierarchyHeaderDistributionViewId:
                        this._sCurrentView = Constants.VIEW_ID.HIERARCHY_HEADER_DISTRIBUTION;
                        break;
                    default:
                        this._sCurrentView = "";
                }
            },

            /**
             * The function is to create property model used at different level
             * @returns {sap.ui.model.json.JSONModel} JSONModel object
             * @private
             */
            _createPropertyModel: function () {
                return new JSONModel({
                    bCopyButtonEnable: false,
                    bDemandManagementSectionVisible: false,
                    bStandardTextAddBtnEnable: false,
                    bUpdatedRetriggerBtnVisible: false,
                    bDeleteLineBtnEnable: true,
                    bManualRMSDeleteBtnEnable: true,
                    bZsbCompPriceColumn: false,
                    bZsbCompConvertedPriceColumn: false
                });
            },

            /**
             * Attach events for Payment, Shipping and Incoterms
             * @private
             */
            _initalizePaymentShippingIncoTerms: function () {
                this.oPaymentTermsInput = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP--com.sap.vocabularies.UI.v1.FieldGroup::PaymentTerms::PaymentTerms::Field"
                );
                this.oIncotermInput = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP--com.sap.vocabularies.UI.v1.FieldGroup::IncoTerms::IncotermsClassification::Field"
                );
                this.oShippingInstructionInput = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP--com.sap.vocabularies.UI.v1.FieldGroup::IncoTerms::ShippingInstruction::Field"
                );
                this.oPaymentTermsInputHier = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP--com.sap.vocabularies.UI.v1.FieldGroup::PaymentTerms::PaymentTerms::Field"
                );
                this.oIncotermInputHier = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP--com.sap.vocabularies.UI.v1.FieldGroup::IncoTerms::IncotermsClassification::Field"
                );
                this.oShippingInstructionInputHier = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP--com.sap.vocabularies.UI.v1.FieldGroup::IncoTerms::ShippingInstruction::Field"
                );
                if (this.oPaymentTermsInput || this.oIncotermInput || this.oShippingInstructionInput) {
                    this.oPaymentTermsInput.attachChange(this.onInputChanged.bind(this));
                    this.oIncotermInput.attachChange(this.onInputChanged.bind(this));
                    this.oShippingInstructionInput.attachChange(this.onInputChanged.bind(this));
                }
                if (this.oPaymentTermsInputHier || this.oIncotermInputHier || this.oShippingInstructionInputHier) {
                    this.oPaymentTermsInputHier.attachChange(this.onInputChanged.bind(this));
                    this.oIncotermInputHier.attachChange(this.onInputChanged.bind(this));
                    this.oShippingInstructionInputHier.attachChange(this.onInputChanged.bind(this));
                }
            },
            /**
             * Get the ResourceBundle from its name
             * @param {object} oController is the controller reference
             * @private
             */
            _setResourceBundle: function (oController) {
                var oi18nModel = oController.getOwnerComponent().getModel("i18n");
                if (oi18nModel) {
                    this._oResourceBundle = oi18nModel.getResourceBundle();
                }
                var oDistri18nModel = oController.getOwnerComponent().getModel(
                    "i18n|sap.suite.ui.generic.template.ObjectPage|C_CntrlPurContrItmCndnAmountTP");
                if (oDistri18nModel) {
                    this._oDistri18nModel = oDistri18nModel;
                    this._oDistri18nModelResourceBundle = oDistri18nModel.getResourceBundle();
                }
                var oHieHeaderi18nModel = oController.getOwnerComponent().getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_CntrlPurContrHierHdrTP");
                if (oHieHeaderi18nModel) {
                    this._oHieHeaderi18nModel = oHieHeaderi18nModel;
                    this._oHieHeaderi18nModelResourceBundle = oHieHeaderi18nModel.getResourceBundle();
                }

                //C_CntrlPurchaseContractItemTP i18n Resource model
                //Common i18n model for both item and distribution level Quota Overview Dialog
                this.oCntrlPCItemi18nModel = oController.getOwnerComponent().getModel(
                    "i18n|sap.suite.ui.generic.template.ObjectPage|C_CntrlPurchaseContractItemTP");
                if (this.oCntrlPCItemi18nModel) {
                    this._oCntrlPCItemResourceBundle = this.oCntrlPCItemi18nModel.getResourceBundle();
                }
            },

            /**
             * The function is to attach events to output management component
             * @private
             */
            _attachOutputManagementComponentEvents: function () {
                var oOutputManagementComponent = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP--OutputManagementComponentContainer"
                );
                if (oOutputManagementComponent) {
                    var oUiArea = oOutputManagementComponent.getComponentInstance().getRootControl();
                    this._oOutputControlSmartTable = oUiArea.getContent()[0].getItems()[0];
                    if (this._oOutputControlSmartTable) {
                        this._oOutputControlSmartTable.attachEvent("beforeRebindTable", this._onBeforeRebindOutputControlTable.bind(this));
                    }
                }
            },
            /**
             * on select no expiration date checkbox
             * @param {sap.ui.base.Event} oEvent select event object
             * @public           
             */
            onNoExpSelect: function (oEvent) {
                this.oCreateConditionsValidTo.setValueStateText("");
                this.oCreateConditionsModel.setProperty("/validToError", ValueState.None);
                var oSource = oEvent.getSource();
                if (!oSource.getState()) {
                    this.oCreateConditionsValidTo.setValue(Constants.VALID_TO);
                    this.oCreateConditionsValidTo.bindProperty("editable", {
                        value: false
                    });
                } else {
                    this.oCreateConditionsValidTo.setValue("");
                    this.oCreateConditionsValidTo.bindProperty("editable", {
                        value: true
                    });
                }
            },

            /**
             * The function sets the personalization for hierarchy and brand distribution table
             **/
            _distributionTablePersonalization: function () {
                if (this._sCurrentView === Constants.VIEW_ID.ITEM || this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM) {
                    //Distribution table
                    this.oDistributionTable = this.base.byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP--itemDistribution::Table"
                    );
                    this.oHierDistributionTable = this.base.byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP--HctrItemDistribution::Table"
                    );
                }

                this._oHierItemDistrTable = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP--HctrItemDistribution::responsiveTable"
                );
                this._oHierHdrDistrTable = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP--to_CntrlPurContrHdrDistrTP::com.sap.vocabularies.UI.v1.LineItem::responsiveTable"
                );

                var aIgnoreFromPersonalisationFields = [
                    "PurchaseRequisition,ProcmtHubPurchaseRequisition,PredecessorDocument,SourcingProjectItem,ProcmtHubPurRequisitionItem,PurchaseRequisitionItem,SourcingProjectItemUUID,SourcingProjectUUID"
                ];
                if (this.oDistributionTable) {
                    if (this.oDistributionTable.getIgnoreFromPersonalisation() !== "") {
                        this.oDistributionTable.setIgnoreFromPersonalisation(this.oDistributionTable.getIgnoreFromPersonalisation() + "," +
                            aIgnoreFromPersonalisationFields);
                    } else {
                        this.oDistributionTable.setIgnoreFromPersonalisation(aIgnoreFromPersonalisationFields);
                    }
                }
                if (this.oHierDistributionTable) {
                    if (this.oHierDistributionTable.getIgnoreFromPersonalisation() !== "") {
                        this.oHierDistributionTable.setIgnoreFromPersonalisation(this.oHierDistributionTable.getIgnoreFromPersonalisation() + "," +
                            aIgnoreFromPersonalisationFields);
                    } else {
                        this.oHierDistributionTable.setIgnoreFromPersonalisation(aIgnoreFromPersonalisationFields);
                    }
                }
            },

            /**
             * Setting label of Net Price field
             */
            _setNetPriceLabel: function () {
                var oNetPriceLabel = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP--OrderQuantity::ContractNetPriceAmount::Field-label"
                );
                var oHierNetPriceLabel = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP--HierOrderQuantity::ContractNetPriceAmount::Field-label"
                );
                if (oNetPriceLabel) {
                    oNetPriceLabel.setText(this._oResourceBundle.getText("BasePriceLabel"));
                }
                if (oHierNetPriceLabel) {
                    oHierNetPriceLabel.setText(this._oResourceBundle.getText("BasePriceLabel"));
                }
            },
            /**
             * Attaching event on header and item level field change
             */
            _attachHeaderAndItemContractEvents: function () {
                this.sHeaderPageId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP";
                this.sItemPageId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP";

                //Header level field changes
                //Document Type
                var oDocumentType = this.base.byId(
                    this.sHeaderPageId + "--com.sap.vocabularies.UI.v1.Identification::PurchaseContractType::Field"
                );
                if (oDocumentType) {
                    oDocumentType.attachEvent("change", this.reloadHeaderNotesComponent.bind(this));
                }
                //Purchasing Organization
                var oPurchOrg = this.base.byId(
                    this.sHeaderPageId + "--com.sap.vocabularies.UI.v1.FieldGroup::Purchasing::PurchasingOrganization::Field"
                );
                if (oPurchOrg) {
                    oPurchOrg.attachEvent("change", this.reloadHeaderNotesComponent.bind(this));
                }
                //Purchasing Group
                var oPurchGrp = this.base.byId(
                    this.sHeaderPageId + "--com.sap.vocabularies.UI.v1.FieldGroup::Purchasing::PurchasingGroup::Field"
                );
                if (oPurchGrp) {
                    oPurchGrp.attachEvent("change", this.reloadHeaderNotesComponent.bind(this));
                }
                //Supplier
                var oSupplier = this.base.byId(
                    this.sHeaderPageId + "--com.sap.vocabularies.UI.v1.FieldGroup::Supplier::Supplier::Field"
                );
                if (oSupplier) {
                    oSupplier.attachEvent("change", this.reloadHeaderNotesComponent.bind(this));
                }
                //Item level field changes
                //Material Group
                var oMaterialGrp = this.base.byId(
                    this.sItemPageId + "--Material:: MaterialGroup:: Field"
                );
                if (oMaterialGrp) {
                    oMaterialGrp.attachEvent("change", this.reloadItemNotesComponent.bind(this));
                }
                //Product Type
                var oProductType = this.base.byId(
                    this.sItemPageId + "--Items::ProductType::Field"
                );
                if (oProductType) {
                    oProductType.attachEvent("change", this.reloadItemNotesComponent.bind(this));
                }
                //Material
                var oMaterial = this.base.byId(
                    this.sItemPageId + "--Material::PurchasingCentralMaterial::Field"
                );
                if (oMaterial) {
                    oMaterial.attachEvent("change", this.reloadItemNotesComponent.bind(this));
                }
                // attach events for Distribution table to manage 'Copy' button enabled state
                if (this._oHierHdrDistrTable) {
                    this._oHierHdrDistrTable.attachSelectionChange(this.onDistributionItemSelect.bind(this));
                    this._oHierHdrDistrTable.attachUpdateFinished(this.onDistributionItemSelect.bind(this));
                }
                if (this._oHierItemDistrTable) {
                    this._oHierItemDistrTable.attachSelectionChange(this.onDistributionItemSelect.bind(this));
                    this._oHierItemDistrTable.attachUpdateFinished(this.onDistributionItemUpdateFinished.bind(this));
                }

                if (this._sCurrentView === Constants.VIEW_ID.ITEM || this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM) {
                    this._oRMSTableSmartTable = this.byId("idRMSTableSmartTable");
                    if (this._oRMSTableSmartTable) {
                        this._oRMSTableSmartTable.getTable().attachSelectionChange(this.onRMSSelectionChange.bind(this));
                        this._oRMSTableSmartTable.attachDataReceived(this.onRMSSelectionChange.bind(this));
                    }
                }
            },

            /**
             * Setting request at least fields in subordinate and distribution table
             */
            _setSubordinateAndDistRequestedFields: function () {
                // Attach the selection change event and the corresponding handler to the subordinate CCTR table
                if (this.oSubordCCTRTable) {
                    var aRequestedFields = ["Status"];
                    if (this.oSubordCCTRTable.getParent().getRequestAtLeastFields() !== "") {
                        this.oSubordCCTRTable.getParent().setRequestAtLeastFields(this.oSubordCCTRTable.getParent().getRequestAtLeastFields() +
                            "," +
                            aRequestedFields);
                    } else {
                        this.oSubordCCTRTable.getParent().setRequestAtLeastFields(aRequestedFields);
                    }

                    this.oSubordCCTRTable.attachSelectionChange(this.onSubordCCTRSelectionChangeWorkflow.bind(this));
                }
                var aRequestAtLeastFields = [
                    "PurchaseRequisition,ProcmtHubPurchaseRequisition,PredecessorDocument,SourcingProjectItem,ProcmtHubPurRequisitionItem,PurchaseRequisitionItem,SourcingProjectItemUUID,SourcingProjectUUID"
                ];
                if (this.oDistributionTable) {
                    if (this.oDistributionTable.getRequestAtLeastFields() !== "") {
                        this.oDistributionTable.setRequestAtLeastFields(this.oDistributionTable.getRequestAtLeastFields() + "," +
                            aRequestAtLeastFields);
                    } else {
                        this.oDistributionTable.setRequestAtLeastFields(aRequestAtLeastFields);
                    }
                }
                if (this.oHierDistributionTable) {
                    if (this.oHierDistributionTable.getRequestAtLeastFields() !== "") {
                        this.oHierDistributionTable.setRequestAtLeastFields(this.oHierDistributionTable.getRequestAtLeastFields() + "," +
                            aRequestAtLeastFields);
                    } else {
                        this.oHierDistributionTable.setRequestAtLeastFields(aRequestAtLeastFields);
                    }
                }
            },

            /**
             * Create JSON model for Distribution VH.
             */
            _initializeModel: function () {
                this._oDistributionModel = new JSONModel({
                    enableCopy: false,
                    enableAddBtn:false
                });

                this.getView().setModel(this._oDistributionModel, "distributionModel");
            },
            /**
             * Press handler for Local requets text Icon
             */
            handleLocalRequestTextIcon: function () {
                this.getView().setBusy(true);
                var oBindingContext = this.getView().getBindingContext();
                var oPayload = {
                    ActiveDocumentNumber: oBindingContext.getProperty("CentralPurchaseContract"),
                    ItemNumber: oBindingContext.getProperty("CentralPurchaseContractItem"),
                    DistributionKey: oBindingContext.getProperty("DistributionKey")
                };
                var oModel = this.getView().getModel();
                oModel.callFunction(Constants.FUNCTION_IMPORT.CREATE_NEW_PCF, {
                    method: "GET",
                    urlParameters: oPayload,
                    success: function (oResponse) {
                        this.getView().setBusy(false);
                        var sRequiredUrl = this.getView().getModel("PCF").createKey("xVWKSxNLP_PCF_C_HEADER", {
                            PcfKey: oResponse.Key_Pcf,
                            IsActiveEntity: false
                        });
                        NavigationHelper.getNavigationPath(this.getView().getController(), "PCF", sRequiredUrl, null, true, false)
                            .then(function (oNavigationDetails) {
                                //Open in new window
                                NavigationHelper.navigateWithURLHelper(oNavigationDetails.sPath, true);
                            });
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                        if (oError.responseText) {
                            var oMessage = JSON.parse(oError.responseText);
                            MessageBox.error(oMessage.error.message.value);
                        }
                    }.bind(this)
                });
            },

            /**
             * Manage Quota App Navigation Button event object
             */
            onManageQuotaButtonPress: function () {
                var oBindingContext = this.getView().getBindingContext(),
                    oParams = {
                        level: "",
                        DocumentType: "",
                        Material: "",
                        CompanyCode: ""
                    };
                if (oBindingContext) {
                    if (this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM || this._sCurrentView === Constants.VIEW_ID.ITEM) {
                        oParams.level = Constants.VIEW_ID.HIERARCHY_ITEM;
                        oParams.Material = oBindingContext.getProperty("PurchasingCentralMaterial");
                    } else if (this._sCurrentView === Constants.VIEW_ID.HIERARCHY_HEADER ||
                        this._sCurrentView === Constants.VIEW_ID.HEADER) {
                        oParams.level = Constants.VIEW_ID.HIERARCHY_HEADER;
                        oParams.Material = oBindingContext.getProperty("ItemMaterial");
                    } else {
                        oParams.level = Constants.VIEW_ID.HIERARCHY_DISTRIBUTION;
                        oParams.Material = oBindingContext.getProperty("Material");

                    }
                    if (oBindingContext.getDeepPath().split("/")[1].split("(")[0] === "C_CentralPurchaseContractTP") //Brand Contract
                    {
                        oParams.DocumentType = Constants.CONTRACT_TYPE.BRAND;
                        oParams.CompanyCode = oBindingContext.getProperty("CompanyCode");
                    } else {
                        oParams.DocumentType = Constants.CONTRACT_TYPE.GROUP;
                    }
                    if (oParams.DocumentType === Constants.CONTRACT_TYPE.BRAND && !oParams.CompanyCode) {
                        oBindingContext.getModel()
                            .read("/" + oBindingContext.getDeepPath().split("/")[1], {
                                success: function (res) {
                                    oParams.CompanyCode = res.CompanyCode;
                                    NavigationHelper.navigateToOutboundTarget(this.getView().getController(), "MQ", oParams, true);
                                }.bind(this),
                                error: function () {
                                    NavigationHelper.navigateToOutboundTarget(this.getView().getController(), "MQ", oParams, true);
                                }.bind(this)
                            });
                    } else {
                        NavigationHelper.navigateToOutboundTarget(this.getView().getController(), "MQ", oParams, true);
                    }
                }
            },

            /**
             * PFO link press event handler.
             */
            onPFOLinkPress: function () {
                var oContractHdr = this.getView().getBindingContext().getObject();
                var sActiveDocId = oContractHdr.ActivePurchasingDocument;
                var sDocType = oContractHdr.PurchasingDocumentSubtype === Constants.GROUP_CONTRACT_SUBTYPE ?
                    Constants.CONTRACT_TYPE.GROUP : Constants.CONTRACT_TYPE.BRAND;

                var oParams = {
                    Document: sActiveDocId,
                    DocumentType: sDocType,
                    SourceSystem: Constants.DEFAULT_PARAMS.SOURCE_SYSTEM,
                    DocumentGuid: ReuseConstants.INITIAL_GUID
                };
                NavigationHelper.navigateToOutboundTarget(this.getView().getController(), "PFO", oParams, true);
            },
            /**
             * This method will be called when ever batch request completed
             * @public
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onODataBatchRequestCompleted: function (oEvent) {
                var aRequests = oEvent.getParameters().requests;
                if (aRequests) {
                    // handle warning messages while contract save
                    var iSaveCallIndex = aRequests.findIndex(function (oResult) {
                        return oResult.method === "POST" && oResult.url.startsWith("C_CntrlPurContrHierHdrTPPreparation") && oResult.success;
                    });
                    var bConditionDeleted = aRequests.some(function (oResult) {
                        return (((oResult.method === "DELETE" || oResult.method === "MERGE") && oResult.url.startsWith("C_CPurConHierItmCmmdtyQtyTP"))) &&
                            oResult.success;
                    });
                    var bRMSValidation = aRequests.some(function (oResult) {
                        return (oResult.method === "GET" && oResult.url.includes("to_CntrlPurchaseContractItemTP/to_RMSData/MatBasePrice,to_CntrlPurchaseContractItemTP/to_RMSData/ActMatPrice"));
                    });

                    if (iSaveCallIndex !== -1) {
                        this.showWarningMessage(aRequests, iSaveCallIndex);
                    } else if (bConditionDeleted) {
                        this.refreshConditionFacet();
                    }
                    if (bRMSValidation) {
                        this.onRMSSelectionChange();
                    }
                }
            },

            /**
             * This method handles the display of warning messages on save/delete calls
             * @public
             * @param {array} aRequests array of requests
             * @param {int} iIndex index of the request
             */
            showWarningMessage: function (aRequests, iIndex) {
                if (aRequests[iIndex].response.headers["sap-message"] && JSON.parse(aRequests[iIndex].response.headers["sap-message"])) {
                    var oHdrMessage = JSON.parse(aRequests[iIndex].response.headers["sap-message"]);
                    if (oHdrMessage.severity === Constants.MESSAGE_SEVERITY.WARNING) {
                        var sCancelWarningMessage = oHdrMessage.message;
                        MessageBox.warning(sCancelWarningMessage, {
                            actions: MessageBox.Action.OK
                        });
                    }
                }
            },
            /**
             * Hierarchy Contract Item link in ZSB tables press event handler.
             * @param {sap.ui.base.Event} oEvent press event object
             */
            handleContractItemNav: function (oEvent) {
                var oItem = oEvent.getSource().getBindingContext().getObject();

                var sContractHeader = this.getView().getModel().createKey("C_CntrlPurContrHierHdrTP", {
                    CentralPurchaseContract: oItem.CentralContract,
                    DraftUUID: ReuseConstants.INITIAL_GUID,
                    IsActiveEntity: true
                });

                var sContractItem = this.getView().getModel().createKey("C_CntrlPurContrHierItemTP", {
                    CentralPurchaseContractItem: oItem.CentralContractItem,
                    CentralPurchaseContract: oItem.CentralContract,
                    DraftUUID: ReuseConstants.INITIAL_GUID,
                    IsActiveEntity: true
                });

                var sContractItemPath = sContractHeader + "/to_CntrlPurchaseContractItemTP(" + sContractItem.split("(")[1];

                //Get path for navigation
                NavigationHelper.getNavigationPath(this.getView().getController(), "MCPC", sContractItemPath)
                    .then(function (oNavigationDetails) {
                        //Open in new window
                        NavigationHelper.navigateWithURLHelper(oNavigationDetails.sPath, true);
                    });

            },

            /**
             * Distribution table (item) update finished change event handler.
             * @param {sap.ui.base.Event} oEvent event object
             */
            onDistributionItemUpdateFinished: function(oEvent) {
                this.onDistributionItemSelect(oEvent);
                if (this.oZsbPlantComboBoxEditTable) {
                    this.oZsbPlantComboBoxEditTable.getBinding("items").refresh();
                }
            },

            /**
             * Distribution table (hierarchy or item) selection change event handler.
             * @param {sap.ui.base.Event} oEvent event object
             */
            onDistributionItemSelect: function (oEvent) {
                var oTable = oEvent.getSource();
                var oSelectedItem = oTable.getSelectedItem();
                this._oDistributionModel.setProperty("/enableCopy", !!oSelectedItem);                
            },

            /**
             * Adding tooltip operation for RMS Table for central purchase contract
             */
            handleRMSTableHeaderToolTip: function () {
                var oRMS = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP--to_CntrlPurContrItmCmmdtyQtyTP::com.sap.vocabularies.UI.v1.LineItem::Table-Commodity"
                );
                oRMS.getHeader().setTooltip(this._oResourceBundle.getText("RMSCondition"));
                var oRMSName = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP--to_CntrlPurContrItmCmmdtyQtyTP::com.sap.vocabularies.UI.v1.LineItem::Table-CommodityName"
                );
                oRMSName.getHeader().setTooltip(this._oResourceBundle.getText("RMSName"));

            },

            /**
             * Adding tooltip operation for RMS Table for central purchase  hierarchy contract
             */
            handleRMSHierarchyTableToolTip: function () {
                var oRMSHierarchy = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP--to_CntrlPurContrItmCmmdtyQtyTP::com.sap.vocabularies.UI.v1.LineItem::Table-Commodity"
                );
                oRMSHierarchy.getHeader().setTooltip(this._oResourceBundle.getText("RMSCondition"));

                var oRMSNameHierarchy = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP--to_CntrlPurContrItmCmmdtyQtyTP::com.sap.vocabularies.UI.v1.LineItem::Table-CommodityName"
                );
                oRMSNameHierarchy.getHeader().setTooltip(this._oResourceBundle.getText("RMSName"));
            },


            /**
             * Bind Document History composite control.
             * @public
             */
            bindDocumentHistory: function () {
                var oDocHistoryData = {};
                if (this._sCurrentView === Constants.VIEW_ID.HEADER || this._sCurrentView === Constants.VIEW_ID.HIERARCHY_HEADER) {
                    oDocHistoryData.items = [{
                        key: Constants.DOCUMENT_HISTORY.HEADER,
                        text: this._oResourceBundle.getText("HeaderFilterText")
                    }, {
                        key: Constants.DOCUMENT_HISTORY.HEADER_ITEMS,
                        text: this._oResourceBundle.getText("HeaderAndItemsFilterText")
                    }, {
                        key: Constants.DOCUMENT_HISTORY.ALLITEMS_DISTRIBUTION,
                        text: this._oResourceBundle.getText("AllItemsAndDistributionLineFilterText")
                    }];
                } else if (this._sCurrentView === Constants.VIEW_ID.ITEM || this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM) {
                    oDocHistoryData.items = [{
                        key: Constants.DOCUMENT_HISTORY.ITEMS,
                        text: this._oResourceBundle.getText("ItemFilterText")
                    }, {
                        key: Constants.DOCUMENT_HISTORY.HEADER_ITEM_DISTRIBITION,
                        text: this._oResourceBundle.getText("HeaderAndItemAndDistributionsFilterText")
                    }];
                } else if (this._sCurrentView === Constants.VIEW_ID.DISTRIBUTION || this._sCurrentView === Constants.VIEW_ID.HIERARCHY_DISTRIBUTION) {
                    oDocHistoryData.items = [{
                        key: Constants.DOCUMENT_HISTORY.DISTRIBUTIONS,
                        text: this._oCntrlPCItemResourceBundle.getText("DistributionsFilterText")
                    }, {
                        key: Constants.DOCUMENT_HISTORY.HEADER_ITEM_DISTRIBITION,
                        text: this._oCntrlPCItemResourceBundle.getText("HeaderAndItemAndDistributionFilterText")
                    }];
                }

                var oDocHistoryModel = new JSONModel(oDocHistoryData);
                this.byId("idDocHistorySection").setModel(oDocHistoryModel, "docHistory");
                this.byId("idDocumentHistory").loadDocumentHistory();
            },

            /**
             * Check if document history to be enabled
             * @public
             */
            handlePageDataLoaded: function () {
                this.initInfoIcons();
                this._renamePGFields();
                this.bindDocumentHistory();
                this.loadZsbFacets();
                this.printPreviewVisibility();
                if (this._sCurrentView === Constants.VIEW_ID.ITEM) {
                    this.handleRMSTableHeaderToolTip();
                }
                if (this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM) {
                    this.handleRMSHierarchyTableToolTip();
                }

                //Navigate to appropriate section
                setTimeout(function() {
                    this.checkNavigationCondition();
                }.bind(this), 0);             

                var oSystemDistTable = this.byId("idHieSystemDistrTable");
                if (oSystemDistTable) {
                    oSystemDistTable._getSelectAllCheckbox().setVisible(false);
                }
            },

            /**
             * Rename "Purchase Group" label in columns.
             * @private
             */
            _renamePGFields: function () {
                var sPurchaseGrpId = "";
                var sCentralPurchaseGrpId = "";
                if (this._sCurrentView === Constants.VIEW_ID.HEADER) {
                    sPurchaseGrpId = "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP--to_DistrdContrForCntrlPurContr::com.sap.vocabularies.UI.v1.LineItem::Table-PurchasingGroup-header";
                    sCentralPurchaseGrpId = "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP--com.sap.vocabularies.UI.v1.FieldGroup::Purchasing::PurchasingGroup::Field-label";
                } else if (this._sCurrentView === Constants.VIEW_ID.HIERARCHY_HEADER) {
                    sPurchaseGrpId = "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP--DistrOvw::Table-PurchasingGroup-header";
                    sCentralPurchaseGrpId = "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP--com.sap.vocabularies.UI.v1.FieldGroup::Purchasing::PurchasingGroup::Field-label";
                }
                var oPurchaseGroup = this.base.byId(sPurchaseGrpId);
                if (oPurchaseGroup) {
                    oPurchaseGroup.setText(this._oResourceBundle.getText("LocalPurchasingGroup"));
                }
                var oCentralPurchasingGroup = this.base.byId(sCentralPurchaseGrpId);
                if (oCentralPurchasingGroup) {
                    oCentralPurchasingGroup.setText(this._oResourceBundle.getText("LeadPurchasingGroup"));
                }
            },

            /**
             * To disable Print Preview button for ZIMK and ZIWK contracts
             * @public
             */
            printPreviewVisibility: function () {
                if (this._sCurrentView === Constants.VIEW_ID.HEADER) {
                    var sPurchaseContractType = this.getView().getBindingContext().getProperty("PurchaseContractType");
                    var oPrintPreviewButton = sap.ui.getCore().byId(
                        "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP--action::actionPrintPreview"
                    );
                    if (sPurchaseContractType === Constants.DOCUMENT_TYPE.ZIMK || sPurchaseContractType === Constants.DOCUMENT_TYPE.ZIWK) {
                        oPrintPreviewButton.bindProperty("visible", {
                            value: false
                        });
                    }
                    else {
                        oPrintPreviewButton.bindProperty("visible", {
                            value: true
                        });
                    }
                }
            },
            /**
             * Load zsb tables on demand based on modes, load zsb reference plant filter
             * @param {sap.ui.base.Event} oEvent The event object
             */
            loadZsbFacets: function () {
                var oTemplate = new Item({
                    key: "{Plant}",
                    text: "{Plant}"
                });
                var bIsEditable = this.oUIModel.getProperty("/editable");
                if (this._sCurrentView === Constants.VIEW_ID.ITEM || this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM) {

                    this.sZsbAnalyticalFragmentId = (this._sCurrentView === Constants.VIEW_ID.ITEM) ? "idZSBAnalyticalFragment" :
                        "idHierZSBAnalyticalFragment";
                    this.sZsbGridFragmentId = (this._sCurrentView === Constants.VIEW_ID.ITEM) ? "idZSBGridFragment" : "idHierZSBGridFragment";

                    // if contract is in display mode, load zsb analytical table
                    if (!bIsEditable) {
                        if (!this.oZSBAnalyticalFragment) {
                            this.oZSBAnalyticalFragment = Fragment.load({
                                id: this.sZsbAnalyticalFragmentId,
                                name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.ZsbAnalyticalTable",
                                controller: this
                            }).then(function (oFragment) {
                                this.getView().addDependent(oFragment);
                                this.byId("idZsbComponentLayout").insertContent(oFragment, 1);
                                this.oZsbPlantComboBox = Fragment.byId(this.sZsbAnalyticalFragmentId, "idPlantComboBox");
                                this.oZsbComponentTable = Fragment.byId(this.sZsbAnalyticalFragmentId, "idZsbComponentSmartTable");
                                if (this.oZsbComponentTable) {
                                    this.oZsbAnalyticalTable = this.oZsbComponentTable.getTable();
                                }
                                //	bind plants dropdown with distribution lines
                                this.oZsbPlantComboBox.setValue("");
                                this.oZsbPlantComboBox.clearSelection();
                                this.oZsbPlantComboBox.bindItems({
                                    path: "to_CntrlPurContrDistributionTP",
                                    template: oTemplate,
                                    events: {
                                        dataReceived: this.getPlantsData.bind(this)
                                    }
                                });

                            }.bind(this));
                        }
                    } else {
                        //if contract is in edit mode, load zsb grid table
                        if (!this.oZSBGridFragment) {
                            this.oZSBGridFragment = Fragment.load({
                                id: this.sZsbGridFragmentId,
                                name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.ZsbGridTable",
                                controller: this
                            }).then(function (oFragment) {
                                this.getView().addDependent(oFragment);
                                this.byId("idZsbComponentLayout").insertContent(oFragment, 1);
                                this.oZsbPlantComboBoxEditTable = Fragment.byId(this.sZsbGridFragmentId, "idPlantComboBoxEditTable");
                                this.oZsbComponentGridSmartTable = Fragment.byId(this.sZsbGridFragmentId, "idZsbComponentSmartTableGrid");
                                if (this.oZsbComponentGridSmartTable) {
                                    this.oZsbComponentGridTable = this.oZsbComponentGridSmartTable.getTable();
                                }
                                //	bind plants dropdown with distribution lines

                                this.oZsbPlantComboBoxEditTable.setValue("");
                                this.oZsbPlantComboBoxEditTable.clearSelection();
                                this.oZsbPlantComboBoxEditTable.bindItems({
                                    path: "to_CntrlPurContrDistributionTP",
                                    template: oTemplate,
                                    events: {
                                        dataReceived: this.getPlantsDataEditTable.bind(this)
                                    }
                                });
                            }.bind(this));
                        }
                        this.handleZSBEdit();
                    }

                    //bind plants dropdown for zswb reference facet
                    this.oZsbRefPlantComboBox.setValue("");
                    this.oZsbRefPlantComboBox.clearSelection();

                    this.oZsbRefPlantComboBox.bindItems({
                        path: "to_CntrlPurContrDistributionTP",
                        template: oTemplate,
                        events: {
                            dataReceived: this.getRefPlantsData.bind(this)
                        }
                    });
                }
            },
            /**
             * Method to initialise Info Icons
             */
            initInfoIcons: function () {
                this.initIconIds();
                var oPaymentTermsInfo, oIncotermInfo, oShippingInstructionInfo;
                switch (this._sCurrentView) {
                    case Constants.VIEW_ID.HEADER:
                        oPaymentTermsInfo = this.base.byId(this.sPayTermsId);
                        oIncotermInfo = this.base.byId(this.sIncotermId);
                        oShippingInstructionInfo = this.base.byId(this.sShippInsId);
                        break;
                    case Constants.VIEW_ID.ITEM:
                        oIncotermInfo = this.base.byId(this.sItmIncotermId);
                        oShippingInstructionInfo = this.base.byId(this.sItmShippInsId);
                        break;
                    case Constants.VIEW_ID.DISTRIBUTION:
                        oPaymentTermsInfo = this.base.byId(this.sItmDistPayTermsId);
                        oIncotermInfo = this.base.byId(this.sItmDistIncotermId);
                        oShippingInstructionInfo = this.base.byId(this.sItmDistShippInsId);
                        break;
                    case Constants.VIEW_ID.HEADER_DISTRIBUTION:
                        oPaymentTermsInfo = this.base.byId(this.sHdrDistPayTermsId);
                        oIncotermInfo = this.base.byId(this.sHdrDistIncotermId);
                        oShippingInstructionInfo = this.base.byId(this.sHdrDistShippInsId);
                        break;
                    case Constants.VIEW_ID.HIERARCHY_HEADER:
                        oPaymentTermsInfo = this.base.byId(this.sHierPayTermsId);
                        oIncotermInfo = this.base.byId(this.sHierIncotermId);
                        oShippingInstructionInfo = this.base.byId(this.sHierShippInsId);
                        break;
                    case Constants.VIEW_ID.HIERARCHY_ITEM:
                        oIncotermInfo = this.base.byId(this.sHierItmIncotermId);
                        oShippingInstructionInfo = this.base.byId(this.sHierItmShippInsId);
                        break;
                    case Constants.VIEW_ID.HIERARCHY_DISTRIBUTION:
                        oPaymentTermsInfo = this.base.byId(this.sHierItmDistPayTermsId);
                        oIncotermInfo = this.base.byId(this.sHierItmDistIncotermId);
                        oShippingInstructionInfo = this.base.byId(this.sHierItmDistShippInsId);
                        break;
                    case Constants.VIEW_ID.HIERARCHY_HEADER_DISTRIBUTION:
                        oPaymentTermsInfo = this.base.byId(this.sHierHdrDistPayTermsId);
                        oIncotermInfo = this.base.byId(this.sHierHdrDistIncotermId);
                        oShippingInstructionInfo = this.base.byId(this.sHierHdrDistShippInsId);
                        break;
                    default:
                        break;
                }
                this.setIconClass(oPaymentTermsInfo, oIncotermInfo, oShippingInstructionInfo);
            },

            /**
             * Method to initialise Info Icons Ids
             */
            initIconIds: function () {
                this.sPayTermsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP--vwks.nlp.s2p.mm.pctrcentral.manage.idPaymentTermsInfo";
                this.sHierPayTermsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHierPaymentTermsInfo";
                this.sItmDistPayTermsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrDistributionTP--vwks.nlp.s2p.mm.pctrcentral.manage.idItmDistPaymentTermsInfo";
                this.sHdrDistPayTermsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHdrDistrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHdrDistPaymentTermsInfo";
                this.sHierItmDistPayTermsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemDistrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHierItmDistPaymentTermsInfo";
                this.sHierHdrDistPayTermsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrDistrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHierHdrDistPaymentTermsInfo";
                this.sIncotermId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP--vwks.nlp.s2p.mm.pctrcentral.manage.idIncotermInfo";
                this.sHierIncotermId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHierIncotermInfo";
                this.sItmDistIncotermId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrDistributionTP--vwks.nlp.s2p.mm.pctrcentral.manage.idItmDistIncotermInfo";
                this.sHdrDistIncotermId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHdrDistrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHdrDistIncotermInfo";
                this.sHierItmDistIncotermId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemDistrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHierItmDistIncotermInfo";
                this.sHierHdrDistIncotermId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrDistrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHierHdrDistIncotermInfo";
                this.sItmIncotermId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP--vwks.nlp.s2p.mm.pctrcentral.manage.idItmIncotermInfo";
                this.sHierItmIncotermId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHierItmIncotermInfo";
                this.sShippInsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CentralPurchaseContractTP--vwks.nlp.s2p.mm.pctrcentral.manage.idShippingInstructionInfo";
                this.sHierShippInsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHierShippingInstructionInfo";
                this.sItmDistShippInsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrDistributionTP--vwks.nlp.s2p.mm.pctrcentral.manage.idItmDistShippingInstructionInfo";
                this.sHdrDistShippInsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHdrDistrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHdrDistShippingInstructionInfo";
                this.sHierItmDistShippInsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemDistrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHierItmDistShippingInstructionInfo";
                this.sHierHdrDistShippInsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrDistrTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHierHdrDistShippingInstructionInfo";
                this.sItmShippInsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP--vwks.nlp.s2p.mm.pctrcentral.manage.idItmShippingInstructionInfo";
                this.sHierItmShippInsId =
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP--vwks.nlp.s2p.mm.pctrcentral.manage.idHierItmShippingInstructionInfo";
            },

            /**
             * Method to set Icon margin style class
             * @param {object} oPaymentTermsInfo Payment terms info field instance
             * @param {object} oIncotermInfo field instance
             * @param {sap.ui.core.Icon} oShippingInstructionInfo shipping instruction info field instance
             */
            setIconClass: function (oPaymentTermsInfo, oIncotermInfo, oShippingInstructionInfo) {
                var bEditable = this.oUIModel.getProperty("/editable");
                if (!bEditable) {
                    if (oPaymentTermsInfo) {
                        oPaymentTermsInfo.removeStyleClass("sapUiTinyMarginTop");
                    }
                    if (oIncotermInfo) {
                        oIncotermInfo.removeStyleClass("sapUiTinyMarginTop");
                    }
                    if (oShippingInstructionInfo) {
                        oShippingInstructionInfo.removeStyleClass("sapUiTinyMarginTop");
                    }
                } else {
                    if (oPaymentTermsInfo) {
                        oPaymentTermsInfo.addStyleClass("sapUiTinyMarginTop");
                    }
                    if (oIncotermInfo) {
                        oIncotermInfo.addStyleClass("sapUiTinyMarginTop");
                    }
                    if (oShippingInstructionInfo) {
                        oShippingInstructionInfo.addStyleClass("sapUiTinyMarginTop");
                    }
                }
            },

            /**
             * Handler before rebind table for ZSB component table
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onBeforeZsbRebindTable: function (oEvent) {
                var bIsEditable = this.oUIModel.getProperty("/editable");
                if (!bIsEditable) {
                    var mBindingParams = oEvent.getParameter("bindingParams");
                    if (mBindingParams && mBindingParams.parameters) {
                        mBindingParams.parameters.entitySet = "xVWKSxNLP_CCTR_I_READ_ZSB";
                    }
                    if (this.aSelectedPlants) {
                        var aAllPlantsFilter = this.getAllPlantsFilter(this.aSelectedPlants);
                        var aFilter = this.applyAllPlantsFilter(aAllPlantsFilter);
                        var oZsbComponentTableBindingParameters = oEvent.getParameter("bindingParams");
                        if (aFilter && aFilter.aFilters && aFilter.aFilters.length) {
                            if (oZsbComponentTableBindingParameters) {
                                oZsbComponentTableBindingParameters.filters.push(aFilter);
                            } else if (this.oZsbComponentTable.getTable().getBinding("rows")) {
                                this.oZsbComponentTable.getTable().getBinding("rows").filter([aFilter], FilterType.Application);
                            }
                        }
                    }
                }
                if (!this.oConvertedPriceColumn) {
                    this.oConvertedPriceColumn = Fragment.byId(this.sZsbAnalyticalFragmentId, "idZsbComponentSmartTable-ConvertedPrice");
                }
                this.oConvertedPriceColumn.bindProperty("visible", {
                    path: "propertyModel>/bZsbCompConvertedPriceColumn"
                });
                if (this.bZSBLaw) {
                    if (this.oConvertedPriceColumn) {
                        this.getView().getModel("propertyModel").setProperty("/bZsbCompConvertedPriceColumn", false);
                    }
                } else {
                    if (this.oConvertedPriceColumn) {
                        this.getView().getModel("propertyModel").setProperty("/bZsbCompConvertedPriceColumn", true);
                    }
                }
            },

            /**
             * Handler before rebind table for ZSB component grid table in edit mdoe
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onBeforeEditZsbRebindTable: function (oEvent) {
                var bIsEditable = this.oUIModel.getProperty("/editable");
                if (bIsEditable) {
                    this._highlightInvalidFields(oEvent);
                    var mBindingParams = oEvent.getParameter("bindingParams");
                    if (mBindingParams && mBindingParams.parameters) {
                        mBindingParams.parameters.entitySet = "xVWKSxNLP_CCTR_I_ZSB";
                    }

                    if (this.aSelectedPlants) {
                        var oItemGuidFilter = new Filter({
                            path: "DraftUUID",
                            operator: FilterOperator.EQ,
                            value1: this.getView().getBindingContext().getObject().DraftUUID
                        });

                        var aAllPlantsFilter = this.getAllPlantsFilter(this.aSelectedPlants);
                        var aFilter = this.applyAllPlantsFilter(aAllPlantsFilter);
                        var oZsbComponentEditTableBindingParameters = oEvent.getParameter("bindingParams");
                        if (aFilter && aFilter.aFilters && aFilter.aFilters.length) {
                            if (oZsbComponentEditTableBindingParameters) {
                                var oFinalFilter = new Filter({
                                    filters: [aFilter, oItemGuidFilter],
                                    and: true
                                });
                                oZsbComponentEditTableBindingParameters.filters.push(oFinalFilter);
                            } else if (this.oZsbComponentGridSmartTable.getTable().getBinding("rows")) {
                                this.oZsbComponentGridTable.attachRowSelectionChange(this.onZsbCompRowSelectionChanged.bind(this));
                                this.oZsbComponentGridSmartTable.getTable().getBinding("rows").filter([oItemGuidFilter], FilterType.Control);
                                this.oZsbComponentGridSmartTable.getTable().getBinding("rows").filter([aFilter], FilterType.Application);
                            }
                        }
                    }
                }
            },

            /**
             * Highlight Invalid fields based on respective invalid flags
             * In this function we are checking for Material, Amount Per ZSB and Price fields invalid flag
             * @param {sap.ui.base.Event} oEvent before rebind event object
             */
            _highlightInvalidFields: function (oEvent) {
                var oZSBSmartTable = oEvent.getSource();
                var aZSBRows = oZSBSmartTable.getTable().getRows();
                var aPropertiesToValidate = [
                    { propName: "Material", invalidFlag: "InvalidMaterialFlag", showValueStateText: this._oCntrlPCItemResourceBundle.getText("ErrorOnEBONMaterialField") },
                    { propName: "AmountPerZSB", invalidFlag: "InvalidAmountPerZSBFlag", showValueStateText: this._oCntrlPCItemResourceBundle.getText("ErrorOnEBONAmountPerZSBField") },
                    { propName: "Price", invalidFlag: "InvalidPriceFlag", showValueStateText: this._oCntrlPCItemResourceBundle.getText("ErrorOnEBONPriceField") }
                ];
                aPropertiesToValidate.forEach(function (propValidConfig) {
                    this.validateProperty(aZSBRows, propValidConfig.propName, propValidConfig.invalidFlag, propValidConfig.showValueStateText);
                }.bind(this));
            },

            /**
             * Common logic for getting rows based on Invalid Flag
             * @param {array} aZSBRows Invalid rows contexts
             * @param {string} sPropName backend property field name for which to update valuestate
             * @param {string} sInvalidFlag backend property for invalid flag
             * @param {string} sValueStateText alue state text
             */
            validateProperty: function (aZSBRows, sPropName, sInvalidFlag, sValueStateText) {
                var aInvalidPerZsbs = aZSBRows.filter(function (oZSBRow) {
                    return oZSBRow.getBindingContext() && oZSBRow.getBindingContext().getObject(sInvalidFlag);
                });
                if (aInvalidPerZsbs.length > 0) {
                    this._updateFieldValueState(aInvalidPerZsbs, sPropName, sInvalidFlag, sValueStateText);
                }
            },

            /**
             * Common logic for Updating field valuestate based on Invalid Flag
             * @param {array} aRows invalid rows contexts
             * @param {string} sFieldName backend property field name for which to update valuestate
             * @param {string} sInvalidFieldName backend property for invalid flag
             * @param {string} sValueStateText value state text
             * @param {boolean} bRawMaterial flag indicates is Raw Material table
             * @param {boolean} bRMS flag indicates is RMS table
             */
            _updateFieldValueState: function (aRows, sFieldName, sInvalidFieldName, sValueStateText, bRawMaterial, bRMS) {
                var sFieldValueStateText = sValueStateText;
                for (var i = 0; i < aRows.length; i++) {
                    var aZSBRowCells = aRows[i].getCells();
                    for (var j = 0; j < aZSBRowCells.length; j++) {
                        var oZSBRowCell = bRawMaterial ? aZSBRowCells[j].getAggregation("edit") : aZSBRowCells[j];
                        var oZSBRowValueBinding = oZSBRowCell.getBinding("value");
                        if (!oZSBRowCell.getBinding("value") && oZSBRowCell.getItems && oZSBRowCell.getItems().length && oZSBRowCell.getItems()[0].getBinding("value")) {
                            oZSBRowCell = oZSBRowCell.getItems()[0];
                            oZSBRowValueBinding = oZSBRowCell.getBinding("value");
                        }
                        if (oZSBRowValueBinding && oZSBRowValueBinding.getPath() === sFieldName) {
                            if (sFieldName === "MatBasePrice" || sFieldName === "ActMatPrice") {
                                var oUoMControl = oZSBRowCell.getAggregation("_content").getAggregation("items")[1];
                                var sUoMPath = oUoMControl.getBinding("value").getPath();
                                oUoMControl.bindProperty("valueState", {
                                    path: sUoMPath,
                                    formatter: function (sUoM) {
                                        return sUoM ? ValueState.None : ValueState.Error;
                                    }
                                });
                            } else {
                                oZSBRowCell.bindProperty("valueState", {
                                    path: sInvalidFieldName,
                                    formatter: function (vInvalidMaterial) {
                                        if (bRMS) {
                                            return vInvalidMaterial ? ValueState.None : ValueState.Error;
                                        }
                                        return vInvalidMaterial ? ValueState.Error : ValueState.None;
                                    }
                                });
                            }
                            oZSBRowCell.bindProperty("valueStateText", {
                                path: sInvalidFieldName,
                                // eslint-disable-next-line
                                formatter: function (bInvalidMaterial) {
                                    return bInvalidMaterial ? sFieldValueStateText : "";
                                }
                            });
                        }
                    }
                }
            },

            /**
             * Close Invalid Materials message dialog event handler.
             */
            onCloseInvalidMaterialsMsgDialog: function () {
                this.oInvalidMaterialsDialog.getModel("materialMsg").setData({});
                this.oInvalidMaterialsDialog.close();
            },

            /**
             * Handler before rebind table for ZSB References table
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onBeforeZsbRefRebindTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                if (mBindingParams && mBindingParams.parameters) {
                    mBindingParams.parameters.entitySet = "xVWKSxNLO_CCTR_I_REF_ZSB";
                }
                if (this.aSelectedPlants) {
                    var aAllPlantsFilter = this.getAllPlantsFilter(this.aSelectedPlants);
                    var aFilter = this.applyAllPlantsFilter(aAllPlantsFilter);
                    var oZsbRefTableBindingParameters = oEvent.getParameter("bindingParams");
                    if (aFilter && aFilter.aFilters && aFilter.aFilters.length) {
                        if (oZsbRefTableBindingParameters) {
                            oZsbRefTableBindingParameters.filters.push(aFilter);
                        } else {
                            if (this.oZsbRefTable.getTable().getBinding("items")) {
                                this.oZsbRefTable.getTable().getBinding("items").filter([aFilter], FilterType.Application);
                            }
                        }
                    }
                }
            },

            /**
             * Event attached to selection change of subordinate CCTR
             * @param {sap.ui.base.Event} oEventSource The event object
             */
            onSubordCCTRSelectionChangeWorkflow: function (oEventSource) {
                var oBindingContext = this.getView().getBindingContext();
                var oSelectedSubordCCTRRow = oEventSource.getSource().getSelectedContexts();
                var oSelectedSubordCCTR = oSelectedSubordCCTRRow[0].getProperty(oSelectedSubordCCTRRow[0].getPath());
                if (oBindingContext && oBindingContext.getProperty("PurchasingProcessingStatus") !== Constants.CONTRACT_STATUS.IN_APPROVAL) {
                    if (oSelectedSubordCCTR.Status === Constants.CONTRACTS_STATUS.REJECTED) {
                        this.getView().getModel("propertyModel").setProperty("/bUpdatedRetriggerBtnVisible", true);
                    } else {
                        this.getView().getModel("propertyModel").setProperty("/bUpdatedRetriggerBtnVisible", false);
                    }
                }
            },

            /**
             * Logic to be triggered when the Retrigger Workflow button is clicked
             */
            onClickRetriggerWorkflow: function () {
                var oSelectedSubordCCTRRow = this.oSubordCCTRTable.getSelectedContexts();
                var oSelectedSubordCCTR = oSelectedSubordCCTRRow[0].getProperty(oSelectedSubordCCTRRow[0].getPath());

                var sSubordCCTRId = oSelectedSubordCCTR.SubordCntrlPurContract;
                var oPayload = {
                    "SubordinateDocumentID": sSubordCCTRId
                };
                var oModel = this.getView().getModel();
                oModel.callFunction(Constants.FUNCTION_IMPORT.RETRIGGER_WORKFLOW, {
                    method: "POST",
                    urlParameters: oPayload,
                    success: this.RetriggerSubordCCTRUpdateSuccess.bind(this),
                    error: this.RetriggerSubordCCTRUpdateError.bind(this)
                });
                this.oSubordCCTRTable.setBusy(true);
                this.oSubordCCTRTable.setSelectedItem(this.oSubordCCTRTable.getSelectedItems()[0], false);

            },
            /**
             * Success callback after the retrigger Subordinate CCTR Update action
             * @public
             */
            RetriggerSubordCCTRUpdateSuccess: function () {
                this.oSubordCCTRTable.setBusy(false);
                this.oSubordCCTRTable.getBinding("items").refresh();
                this.getView().getModel("propertyModel").setProperty("/bUpdatedRetriggerBtnVisible", false);
                MessageToast.show(this._oResourceBundle.getText("RetiggerWorkflowSuccessMsg"));

            },

            /**
             * Error callback after the retrigger Subordinate CCTR Update action
             * @param {object} oError Error response form the backend call
             * @public
             */
            RetriggerSubordCCTRUpdateError: function (oError) {
                this.getView().getModel("propertyModel").setProperty("/bUpdatedRetriggerBtnVisible", false);
                this.oSubordCCTRTable.setBusy(false);
                this.oSubordCCTRTable.getBinding("items").refresh();

                if (oError.responseText) {
                    var oMessage = JSON.parse(oError.responseText);
                    MessageBox.error(oMessage.error.message.value);
                }
            },

            /*
             * Select Conditions section tab.
             */
            checkNavigationPricingConditions: function () {
                if (this._sCurrentView === Constants.VIEW_ID.ITEM || this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM) {
                    sap.ui.require(["sap/ui/util/Storage"], function (Storage) {
                        var oMyStorage = new Storage(Storage.Type.session, "navigation_parameter"),
                            storageParameter = oMyStorage.get("navigationFlag");
                        if (storageParameter) {
                            if (storageParameter.flagNavigationPricingConditions) {
                                //This is used to select Conditions tab if flagNavigationPricingConditions === true
                                switch (this._sCurrentView) {
                                    case Constants.VIEW_ID.ITEM:
                                        var oContractItemObjectPage = this.base.byId(
                                            "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP--objectPage"
                                        );
                                        //reset the previous selection
                                        oContractItemObjectPage.setSelectedSection(null);
                                        // eslint-disable-next-line
                                        setTimeout(function () {
                                            var oPriceConditionsSection = null;
                                            var aSections = oContractItemObjectPage.getSections();
                                            for (var i = 0; i < aSections.length; i++) {
                                                var sSectionId = aSections[i].getId();
                                                if (sSectionId === "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP" +
                                                    "--sap.cus.sd.lib.item.cndn.forSmartElements::item::C_CntrlPurContrItmCndnAmountTP:C_CntrlPurContrItmPrcSimln::ComponentSection") {
                                                    oPriceConditionsSection = aSections[i];
                                                }
                                            }
                                            oContractItemObjectPage.setSelectedSection(oPriceConditionsSection);
                                        }, 3000);
                                        break;
                                    case Constants.VIEW_ID.HIERARCHY_ITEM:
                                        var oContractItemObjectPageHierarchy = this.base.byId(
                                            "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP--objectPage"
                                        );
                                        //reset the previous selection                                    
                                        oContractItemObjectPageHierarchy.setSelectedSection(null);
                                        // eslint-disable-next-line
                                        setTimeout(function () {
                                            var oHierPriceConditionsSection = null;
                                            var aHierSections = oContractItemObjectPageHierarchy.getSections();
                                            for (var i = 0; i < aHierSections.length; i++) {
                                                var sSectionId = aHierSections[i].getId();
                                                if (sSectionId === "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP" +
                                                    "--sap.cus.sd.lib.item.cndn.forSmartElements::item::C_CPurConHierItmCndnAmountTP:C_CntrlPurContrItmPrcSimln::ComponentSection") {
                                                    oHierPriceConditionsSection = aHierSections[i];
                                                }
                                            }
                                            oContractItemObjectPageHierarchy.setSelectedSection(oHierPriceConditionsSection);
                                        }, 3000);
                                        break;
                                    default:
                                        break;
                                }
                                //The flag is set to false so that once the conditions tab is selected,it should not be selected again
                                oMyStorage.put("navigationFlag", {
                                    flagNavigationPricingConditions: false
                                });
                            }
                        }
                    }.bind(this));
                }
            },

            /*
             * Select appropriate section tab.
             */
            checkNavigationCondition: function () {
                if (this._sCurrentView !== Constants.VIEW_ID.ITEM && this._sCurrentView !== Constants.VIEW_ID.HIERARCHY_ITEM) {
                    return;
                }
                sap.ui.require(["sap/ui/util/Storage"], function (Storage) {
                    var oMyStorage = new Storage(Storage.Type.session, "navigation_parameter"),
                        oStorageParameter = oMyStorage.get("navigationFlag");
                    var bIsItemDetailPage, sItemObjectPageId, sSelectedSectionId, sItemObjectPagePath;
                    if (this._sCurrentView === Constants.VIEW_ID.ITEM) {
                        bIsItemDetailPage = true;
                        sItemObjectPageId = "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP--objectPage";
                        sItemObjectPagePath = "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP"; 
                    } else if (this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM) {
                        bIsItemDetailPage = false;
                        sItemObjectPageId = "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP--objectPage";
                        sItemObjectPagePath = "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP";
                    }

                    if (oStorageParameter) {
                        if (oStorageParameter.flagNavigationPricingConditions) {
                            //The flag is set to false so that once the conditions tab is selected,it should not be selected again
                            oMyStorage.put("navigationFlag", {
                                flagNavigationPricingConditions: false
                            });
                            sSelectedSectionId = bIsItemDetailPage ? sItemObjectPagePath + "--sap.cus.sd.lib.item.cndn.forSmartElements::item::C_CntrlPurContrItmCndnAmountTP:C_CntrlPurContrItmPrcSimln::ComponentSection" :
                                sItemObjectPagePath + "--sap.cus.sd.lib.item.cndn.forSmartElements::item::C_CPurConHierItmCndnAmountTP:C_CntrlPurContrItmPrcSimln::ComponentSection";
                        } else if (oStorageParameter.flagNavigationDistrLine) {
                            //The flag is set to false so that once the conditions tab is selected,it should not be selected again
                            oMyStorage.put("navigationFlag", {
                                flagNavigationDistrLine: false
                            });
                            sSelectedSectionId = bIsItemDetailPage ? "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP--itemDistribution::Section" :
                                "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP--HctrItemDistribution::Section";
                        }
                    }
                    var oItemObjectPage = this.base.byId(sItemObjectPageId);
                    oItemObjectPage.setSelectedSection(sSelectedSectionId);
                }.bind(this));
            },

            /**
             * Check to enable zsb functionalities
             * @param {object} oContext the context object
             * @public
             */
            checkAndEnableZsb: function (oContext) {
                var oZsbContextObject = oContext.context.getObject();
                this.bShowZSB = oZsbContextObject.showZSBFacet;
                this.bShowRefZsb = oZsbContextObject.showRefZSBFacet;
                this.bZSBLaw = oZsbContextObject.ZSBLaw_Flag;
            },

            /**
             * Check to display demand management section only if material is P-material
             * @param {sap.ui.base.Event} oEvent The event object
             */
            checkAndEnableDemandManagement: function (oEvent) {
                var showDemandManagement = oEvent.context.getObject().ShowDemandManagement;
                if (showDemandManagement) {
                    //demand handling section
                    this.getView().getModel("propertyModel").setProperty("/bDemandManagementSectionVisible", true);
                    this.getDemandData(oEvent);
                }
            },

            /**
             * Get all plants from dropdown in ZSB Component facet
             * @param {sap.ui.base.Event} oEvent The event object
             */
            getPlantsData: function (oEvent) {
                this.aPlants = [];
                this.aSelectedPlants = [];
                var oContextObject = oEvent.getSource().getContexts();
                for (var i = 0; i < oContextObject.length; i++) {
                    var sPlant = oContextObject[i].getProperty("Plant");
                    this.aPlants.push(sPlant);
                }

                if (this.oZsbPlantComboBox) {
                    var oSelectedPlant = this.oZsbPlantComboBox.getSelectedItem();
                    if (oSelectedPlant) {
                        this.aSelectedPlants.push(oSelectedPlant.getText());
                    } else {
                        this.aSelectedPlants = this.aPlants;
                    }
                }
                this.oZsbComponentTable.fireBeforeRebindTable();
            },
            /**
             * Get all plants from dropdown in ZSB Grid table of Component facet
             * @param {sap.ui.base.Event} oEvent The event object
             * @public
             */
            getPlantsDataEditTable: function (oEvent) {
                this.aPlants = [];
                this.aSelectedPlants = [];
                var oContextObject = oEvent.getSource().getContexts();
                for (var i = 0; i < oContextObject.length; i++) {
                    var sPlant = oContextObject[i].getProperty("Plant");
                    this.aPlants.push(sPlant);
                }

                if (this.oZsbPlantComboBoxEditTable) {
                    var oSelectedPlant = this.oZsbPlantComboBoxEditTable.getSelectedItem();
                    if (oSelectedPlant) {
                        this.aSelectedPlants.push(oSelectedPlant.getText());
                    } else {
                        this.aSelectedPlants = this.aPlants;
                    }
                }
                this.oZsbComponentGridSmartTable.fireBeforeRebindTable();
            },

            /**
             * Get all plants from dropdown in ZSB References facet
             * @param {sap.ui.base.Event} oEvent The event object
             */
            getRefPlantsData: function (oEvent) {
                this.aPlants = [];
                this.aSelectedPlants = [];
                var oContextObject = oEvent.getSource().getContexts();
                for (var i = 0; i < oContextObject.length; i++) {
                    var sPlant = oContextObject[i].getProperty("Plant");
                    this.aPlants.push(sPlant);
                }

                if (this.oZsbRefPlantComboBox) {
                    var oSelectedPlant = this.oZsbRefPlantComboBox.getSelectedItem();
                    if (oSelectedPlant) {
                        this.aSelectedPlants.push(oSelectedPlant.getText());
                    } else {
                        this.aSelectedPlants = this.aPlants;
                    }
                }
                this.oZsbRefTable.fireBeforeRebindTable();
            },

            /**
             * Get all plants filter in ZSB Component facet
             * @param {object} aSelectedPlants The plant array object
             * @returns {sap.ui.model.Filter} the all plants filter
             */
            getAllPlantsFilter: function (aSelectedPlants) {
                var aAllPlantsFilter = [];
                for (var i = 0; i < aSelectedPlants.length; i++) {
                    var oPlantFilter = new Filter({
                        path: "Plant",
                        operator: FilterOperator.EQ,
                        value1: aSelectedPlants[i]
                    });
                    aAllPlantsFilter.push(oPlantFilter);
                }
                return aAllPlantsFilter;
            },

            /**
             * Apply all plants filter on ZSB Component table 
             * @param {array} aAllPlantsFilter The all plant filters array
             * @return {sap.ui.model.Filter} aFilter The all plants filter
             */
            applyAllPlantsFilter: function (aAllPlantsFilter) {
                if (aAllPlantsFilter.length) {
                    var aFilter = new Filter({
                        filters: aAllPlantsFilter,
                        and: false
                    });
                    return aFilter;
                } else {
                    return {};
                }
            },

            /**
             * Handler for plants selection in ZSB Component facet
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onPlantChange: function (oEvent) {
                var oSelectedPlant = oEvent.getSource().getValue();
                var aFilter = [];
                if (oSelectedPlant === "") {
                    this.aSelectedPlants = this.aPlants;
                    var aAllPlantsFilter = this.getAllPlantsFilter(this.aSelectedPlants);
                    aFilter = this.applyAllPlantsFilter(aAllPlantsFilter);
                    this.oZsbComponentTable.getTable().getBinding("rows").filter([aFilter], FilterType.Application);
                } else {
                    this.aSelectedPlants = [];
                    this.aSelectedPlants.push(oSelectedPlant);
                    var oPlantFilter = new Filter({
                        filters: [
                            new Filter({
                                path: "Plant",
                                operator: FilterOperator.EQ,
                                value1: oSelectedPlant
                            })
                        ]
                    });
                    aFilter.push(oPlantFilter);
                    this.oZsbComponentTable.getTable().getBinding("rows").filter(aFilter, FilterType.Application);
                }
            },
            /**
             * Handler for plants selection in ZSB Grid table of Component facet
             * @param {sap.ui.base.Event} oEvent The event object
             * @public
             */
            onPlantChangeEditTable: function (oEvent) {
                var oSelectedPlant = oEvent.getSource().getValue();
                var aFilter = [];
                if (oSelectedPlant === "") {
                    this.aSelectedPlants = this.aPlants;
                    var aAllPlantsFilter = this.getAllPlantsFilter(this.aSelectedPlants);
                    aFilter = this.applyAllPlantsFilter(aAllPlantsFilter);
                    this.oZsbComponentGridSmartTable.getTable().getBinding("rows").filter([aFilter], FilterType.Application);
                } else {
                    this.aSelectedPlants = [];
                    this.aSelectedPlants.push(oSelectedPlant);
                    var oPlantFilter = new Filter({
                        filters: [
                            new Filter({
                                path: "Plant",
                                operator: FilterOperator.EQ,
                                value1: oSelectedPlant
                            })
                        ]
                    });
                    aFilter.push(oPlantFilter);
                    this.oZsbComponentGridSmartTable.getTable().getBinding("rows").filter(aFilter, FilterType.Application);
                }
            },

            /**
             * Handler for plants selection in ZSB References facet
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onRefPlantChange: function (oEvent) {
                var oSelectedPlant = oEvent.getSource().getValue();
                var aFilter = [];
                if (oSelectedPlant === "") {
                    this.aSelectedPlants = this.aPlants;
                    var aAllPlantsFilter = this.getAllPlantsFilter(this.aSelectedPlants);
                    aFilter = this.applyAllPlantsFilter(aAllPlantsFilter);
                    this.oZsbRefTable.getTable().getBinding("items").filter([aFilter], FilterType.Application);
                } else {
                    this.aSelectedPlants = [];
                    this.aSelectedPlants.push(oSelectedPlant);
                    var oPlantFilter = new Filter({
                        filters: [
                            new Filter({
                                path: "Plant",
                                operator: FilterOperator.EQ,
                                value1: oSelectedPlant
                            })
                        ]
                    });
                    aFilter.push(oPlantFilter);
                    this.oZsbRefTable.getTable().getBinding("items").filter(aFilter, FilterType.Application);
                }
            },

            /**
             * Get method for demand data in demand management section
             * @param {sap.ui.base.Event} oEvent The event object
             */
            getDemandData: function (oEvent) {
                var oContextObject = oEvent.context.getObject();
                this._oDemandManagementTable = this.byId("idDemandManagementTable");
                var oDemandDataFilters = this.getDemandDataFilters(oContextObject);

                var aFilters = [];
                aFilters.push(oDemandDataFilters);

                this._oDemandManagementTable.setBusy(true);
                this.getView().getController().getOwnerComponent().getModel().read(
                    "/xVWKSxNLP_CCTR_I_READ_DH", {
                    filters: aFilters,
                    success: this.getDemandDataSuccess.bind(this),
                    error: this.getDemandDataError.bind(this)
                });
            },

            /**
             * Success handler for demand data call
             * @param {object} oData response from demand data read call
             */
            getDemandDataSuccess: function (oData) {
                var oLocalModel = new JSONModel();
                oLocalModel.setData(oData.results);
                this.getView().setModel(oLocalModel, "DemandData");
                this._oDemandManagementTable.setBusy(false);
            },

            /**
             * Error handler for demand data call
             * @param {object} oError error response from demand data read call
             */
            getDemandDataError: function (oError) {
                this._oDemandManagementTable.setBusy(false);
                if (oError.responseText) {
                    var oMessage = JSON.parse(oError.responseText);
                    MessageBox.error(oMessage.error.message.value);
                }
            },

            /**
             * Create Demand data filters
             * @param {object} oContextObject object context
             * @returns {sap.ui.model.Filter} the view filter 
             */
            getDemandDataFilters: function (oContextObject) {
                var oFilter = new Filter({
                    filters: [
                        new Filter({
                            path: "DocumentNumber",
                            operator: FilterOperator.EQ,
                            value1: oContextObject.CentralPurchaseContract.toString()

                        }),
                        new Filter({
                            path: "DistributionItemNumber",
                            operator: FilterOperator.EQ,
                            value1: oContextObject.DistributionKey.toString()
                        }),
                        new Filter({
                            path: "DocumentItemNumber",
                            operator: FilterOperator.EQ,
                            value1: oContextObject.CentralPurchaseContractItem.toString()
                        })
                    ],
                    and: true
                });
                return oFilter;
            },

            /**
             * Reload notes component in header
             */
            reloadHeaderNotesComponent: function () {
                var oHeaderNotesComponent = this.getHeaderNotesComponent();
                oHeaderNotesComponent.getComponentInstance().load();
            },

            /**
             * Reload notes component in item
             */
            reloadItemNotesComponent: function () {
                var oItemNotesComponent = this.getItemNotesComponent();
                oItemNotesComponent.getComponentInstance().load();
            },

            /**
             * Returns header notes component reference
             * @returns {object} return Header notes component reference.
             */
            getHeaderNotesComponent: function () {
                if (!this.oHeaderNotesComponent) {
                    this.oHeaderNotesComponent = this.base.byId(
                        this.sHeaderPageId + "--sap.nw.core.gbt.notes.lib.reuse.notes4smarttemplate::header::Notes::ComponentContainer"
                    );
                }
                return this.oHeaderNotesComponent;
            },
            /**
             * Returns item notes component reference
             * @returns {object} return Item notes component reference.
             */
            getItemNotesComponent: function () {
                if (!this.oItemNotesComponent) {
                    this.oItemNotesComponent = this.base.byId(
                        this.sItemPageId + "--sap.nw.core.gbt.notes.lib.reuse.notes4smarttemplate::item::Notes::ComponentContainer"
                    );
                }
                return this.oItemNotesComponent;
            },

            /**
             * Opening Dialog for copy conditions
             */
            handleCopyConditionsButtonPress: function () {
                if (!this.oCopyConditionsDialog) {
                    Fragment.load({
                        id: "idCopyConditionsFragment",
                        name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.CopyConditionsDialog",
                        controller: this
                    }).then(function (oDialog) {
                        this.oCopyConditionsDialog = oDialog;
                        this.getView().addDependent(this.oCopyConditionsDialog);
                        this.oCopyConditionsDialog.open();
                    }.bind(this));
                } else {
                    this.oCopyConditionsDialog.open();
                }
            },

            /**
             * handling selection of radio button in responsive table
             */
            handleRadioButtonSelection: function () {
                this.getView().getModel("propertyModel").setProperty("/bCopyButtonEnable", true);
            },

            /**
             * Event handler for Copy button press
             */
            handleCopyButtonPress: function () {
                var sPlant = Fragment.byId("idCopyConditionsFragment", "idPlant").getValue(),
                    oTableBindingObject = Fragment.byId("idCopyConditionsFragment", "idCopyConditionsSmartTable").getTable().getSelectedItem().getBindingContext()
                        .getObject(),
                    oModel = this.getView().getModel();
                oModel.setDeferredGroups(["batchFunctionImport"]);
                oModel.callFunction(Constants.FUNCTION_IMPORT.COPY_CONDITION, {
                    method: "POST",
                    batchGroupId: "batchFunctionImport",
                    urlParameters: {
                        ProcmtHubPlant: sPlant,
                        Sourcesystem: this.sPlantSourceSystem,
                        DraftUUID: oTableBindingObject.DraftUUID,
                        ParentDraftUUID: oTableBindingObject.ParentDraftUUID
                    }
                });
                oModel.submitChanges({
                    batchGroupId: "batchFunctionImport",
                    success: this.handleCopyReqButtonSuccess.bind(this),
                    error: this.handleCopyReqButtonError.bind(this)
                });
            },

            /**
             * Event handler for copy functionality success
             * @param {object} oData - success result
             */
            handleCopyReqButtonSuccess: function (oData) {
                this.getView().setBusy(false);
                var oResponse = oData.__batchResponses,
                    sErrorMessage = "";
                //success case: this condition was given by backend team to identify the success case.
                if (oResponse[0].response === undefined) {
                    MessageToast.show(this._oResourceBundle.getText("CopyCndnSuccessMsg"));
                    this.getView().getModel("propertyModel").setProperty("/bCopyButtonEnable", false);
                    this.handleCopyConditionDialogClose();
                } else { //error case
                    sErrorMessage = JSON.parse(oResponse[0].response.body).error.message.value;
                    MessageBox.error(sErrorMessage, {
                        actions: [MessageBox.Action.OK]
                    });
                }
                //refreshing whole conditions reusable component
                this.refreshConditionFacet();
            },
            /**
             * Event handler for copy functionality error
             * @param {object} oError - error result
             */
            handleCopyReqButtonError: function (oError) {
                this.getView().setBusy(false);
                if (oError.responseText) {
                    var sErrorMsg = $(oError.responseText).find("message").first().text();
                    MessageBox.error(sErrorMsg);
                }
            },
            /**
             * Event on custom copy button
             */
            onCustomCopyContract: function () {
                CopyContract.init(this.getView(), this);
                CopyContract.loadDialog(this.getView().getController().getOwnerComponent().getModel(
                    "i18n|sap.suite.ui.generic.template.ListReport|C_CentralPurchaseContractTP"), false);
            },

            /*
             * Closing Copy conditions dialog on press of cancel button
             */
            handleCopyConditionDialogClose: function () {
                this.oCopyConditionsDialog.close();
                this.oCopyConditionsDialog.destroy();
                // This is to fix duplicate id issue in fragment
                this.oCopyConditionsDialog = undefined;
            },

            /**
             * Opening Dialog for create price conditions
             */
            handleCreateConditionsButtonPress: function () {
                this.oCreateConditionsModel = new JSONModel({
                    "plant": "",
                    "plantError": "None",
                    "connectedSystem": "",
                    "connectedSystemError": "None",
                    "conditionType": "",
                    "conditionTypeError": "None",
                    "changeReason": "",
                    "changeReasonError": "None",
                    "amount": "",
                    "amountError": "None",
                    "currency": this.getView().getBindingContext().getProperty("DocumentCurrency"),
                    "currencyError": "None",
                    "validFromError": "None",
                    "validToError": "None",
                    "showPlant": false,
                    "showConnectedSystem": false,
                    "createConditionMessages": [],
                    "percentageError": "None",
                    "percentage": "",
                    "conditionCalcType": "",
                    "validFrom": null,
                    "validTo": null
                });
                Fragment.load({
                    id: "idCreateConditionsFragment",
                    name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.CreateConditionsDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.oCreateConditionsDialog = oDialog;
                    this.oCreateConditionsDialog.setModel(this.oCreateConditionsModel, "createConditionsModel");
                    this.oConditionTypeInput = Fragment.byId("idCreateConditionsFragment", "idConditionTypeInput");
                    this._updateConditionTypeBinding();
                    this.oCreateConditionsValidFrom = Fragment.byId("idCreateConditionsFragment", "idValidFrom");
                    this.oCreateConditionsValidTo = Fragment.byId("idCreateConditionsFragment", "idValidTo");
                    this.getView().addDependent(this.oCreateConditionsDialog);
                    this.oCreateConditionsDialog.open();
                }.bind(this));
            },

            /**
             * Update binding for Condition Type field.
             * The 'DraftUUID' filter is required to return data.
             */
            _updateConditionTypeBinding: function () {
                var oDraftUUIDFillter = new Filter({
                    path: "DraftUUID",
                    operator: "EQ",
                    value1: this.getView().getBindingContext().getProperty("DraftUUID")
                });
                this.oConditionTypeInput.bindSuggestionRows({
                    path: "/xVWKSxNLP_CCTR_C_Itm_CTypeVH",
                    templateShareable: false,
                    length: 5000,
                    suspended: true,
                    filters: oDraftUUIDFillter,
                    template: new ColumnListItem({
                        cells: [new Label({
                            text: "{ConditionType}"
                        }), new Label({
                            text: "{ConditionTypeName}"
                        })]
                    })
                });
            },

            /**
             * Return messageStrip type for messages in create price conditions dialog.
             * @param {string} sSeverity severity of the message
             * @return {string} messageStrip type
             * @public
             */
            getMessageStripType: function (sSeverity) {
                return Formatter.getMessageStripType(sSeverity);
            },

            /**
             * Method to get Conditions Currency to be defaulted
             */
            _getConditionCurrency: function () {
                var oModel = this.getView().getModel();
                oModel.callFunction(Constants.FUNCTION_IMPORT.CONDITION_CURRENCY, {
                    method: "GET",
                    urlParameters: {
                        "ParentDraftUUID": this.getView().getBindingContext().getProperty("DraftUUID"),
                        "ProcmtHubPlant": this.oCreateConditionsModel.getProperty("/plant"),
                        "ProcurementHubSourceSystem": this.oCreateConditionsModel.getProperty("/connectedSystem")
                    },
                    success: function (oData) {
                        this.oCreateConditionsModel.setProperty("/currency", oData.ConditionCurrency);
                    }.bind(this)
                });
            },

            /**
             * Handler for plant dependent checkbox selection
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onPlanDependentSelect: function (oEvent) {
                var bSelected = oEvent.getParameter("selected");
                this.oCreateConditionsModel.setProperty("/plant", "");
                this.oCreateConditionsModel.setProperty("/connectedSystem", "");
                this.oCreateConditionsModel.setProperty("/showPlant", bSelected);
                this.oCreateConditionsModel.setProperty("/showConnectedSystem", bSelected);
                if (bSelected) {
                    this.oCreateConditionsModel.setProperty("/currency", "");
                } else {
                    var sHeaderDefaultCurrency = this.getView().getBindingContext().getProperty("DocumentCurrency");
                    this.oCreateConditionsModel.setProperty("/currency", sHeaderDefaultCurrency);
                }
            },

            /**
             * Plant Input Live Change handler in Create Conditions Dialog.
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onPlantLiveChange: function (oEvent) {
                //As part of 1080765 incident fix we have set the length of plant value help to 5000 same as satndard
                //In xml we have set suspended to true, for suspending the default call, if user writes any text in plant then only 
                //plant service call will be triggered.
                this._resumeVHCall(oEvent);
                if (oEvent.getParameter("newValue").length === 4) {
                    var sConnectedSystem = this.oCreateConditionsModel.getProperty("/connectedSystem");
                    if (sConnectedSystem) {
                        this._getConditionCurrency();
                    }
                }
            },

            /**
             * Condition type and Change Reason Input Live Change handler in Create Conditions Dialog.
             * This handler has been written for resuming the suspended service In xml
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onCreatConditionLiveChange: function (oEvent) {
                //As part of 1080765 incident fix we have set the length of plant value help to 5000 same as satndard
                //In xml we have set suspended to true, for suspending the default call, if user writes any text in respective input
                // then only backend service call will be triggered.
                this._resumeVHCall(oEvent);
            },

            /**
             * Resuming the suspended value help entity on user typing in the input field
             * @param {sap.ui.base.Event} oEvent The event object
             */
            _resumeVHCall: function(oEvent) {
                var oInputVHBinding = oEvent.getSource().getBinding("suggestionRows");
                if (oInputVHBinding.isSuspended()) {
                    oInputVHBinding.resume();
                }
            },

            /**
             * Connected System Input Live Change handler in Create Conditions Dialog.
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onConnectedSystemLiveChange: function (oEvent) {
                if (oEvent.getParameter("newValue").length === 4) {
                    var sPlant = this.oCreateConditionsModel.getProperty("/plant");
                    if (sPlant) {
                        this._getConditionCurrency();
                    }
                }
            },
            /**
             * After removing plant from plant multi input, tokenlist also needs to be updated accordingly
             * onTokenUpdate method is called on "tokenUpdate" event
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onTokenUpdate: function (oEvent) {
                if (oEvent.getParameter("type") === Tokenizer.TokenUpdateType.Removed) {
                    var aRemovedTokens = oEvent.getParameter("removedTokens");
                    var aTotalTokens = oEvent.getSource().getTokens();
                    aRemovedTokens.forEach(function (oRemovedToken) {
                        aTotalTokens = aTotalTokens.filter(function (oToken) {
                            return oRemovedToken.getText() !== oToken.getText();
                        });
                    });
                    var sSelectedPlant = "";
                    if (aTotalTokens.length > 0) {
                        sSelectedPlant = aTotalTokens[0].getText();
                        for (var i = 1; i < aTotalTokens.length; i++) {
                            sSelectedPlant = sSelectedPlant + "$" + aTotalTokens[i].getText();
                        }
                    }
                    this.oCreateConditionsModel.setProperty("/" + Constants.LOCAL_MODEL_FIELDS.PLANT, sSelectedPlant);
                }

            },

            /**
             * Plant Input Suggestion Select handler in Create Conditions Dialog.
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onPlantSuggestionSelect: function (oEvent) {
                var sSelectedPlantKey;
                var oSuggestionSelectedRow = oEvent.getParameter("selectedRow");
                if (oSuggestionSelectedRow) {
                    var sPlant = oSuggestionSelectedRow.getBindingContext().getProperty(Constants.ODATA_FIELDS.PLANT);
                    var sConnectedSystem = oSuggestionSelectedRow.getBindingContext().getProperty(Constants.ODATA_FIELDS.CONNECTED_SYSTEM);
                    var sSelectedConnectedSystem = this.oCreateConditionsModel.getProperty("/" + Constants.LOCAL_MODEL_FIELDS.CONNECTED_SYSTEM);
                    if (sSelectedConnectedSystem) {
                        if (sSelectedConnectedSystem !== sConnectedSystem) {
                            this.oCreateConditionsModel.setProperty("/" + Constants.LOCAL_MODEL_FIELDS.CONNECTED_SYSTEM, "");
                        }
                    } else {
                        this.oCreateConditionsModel.setProperty("/" + Constants.LOCAL_MODEL_FIELDS.CONNECTED_SYSTEM, sConnectedSystem);
                    }

                    var sSelectedPlant = this.oCreateConditionsModel.getProperty("/" + Constants.LOCAL_MODEL_FIELDS.PLANT);                    
                    if (sSelectedPlant) {
                        sSelectedPlantKey = sSelectedPlant + "$" + sPlant + "_" + sConnectedSystem;
                    } else {
                        sSelectedPlantKey = sPlant + "_" + sConnectedSystem;
                    }
                    oEvent.getSource().addToken(new Token({ text: sPlant + "_" + sConnectedSystem }));
                    if (sSelectedPlant.split("$").length > 1) {
                        this.oCreateConditionsModel.setProperty("/ConnectedSystemEnabled", false);
                    }
                    else {
                        this.oCreateConditionsModel.setProperty("/ConnectedSystemEnabled", true);
                    }
                    this.oCreateConditionsModel.setProperty("/" + Constants.LOCAL_MODEL_FIELDS.PLANT, sSelectedPlantKey);

                    this._getConditionCurrency();
                    this.oCreateConditionsModel.setProperty("/plantError", ValueState.None);
                    this.oCreateConditionsModel.setProperty("/connectedSystemError", ValueState.None);
                }
            },

            /**
             * Connected System Input Suggestion Select handler in Create Conditions Dialog.
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onConnectedSuggestionSelect: function (oEvent) {
                var oSuggestionSelectedRow = oEvent.getParameter("selectedRow");
                if (oSuggestionSelectedRow) {
                    var sConnectedSystem = oSuggestionSelectedRow.getBindingContext().getProperty(Constants.ODATA_FIELDS.CONNECTED_SYSTEM);
                    this.oCreateConditionsModel.setProperty("/" + Constants.LOCAL_MODEL_FIELDS.PLANT, "");
                    this.oCreateConditionsModel.setProperty("/" + Constants.LOCAL_MODEL_FIELDS.CONNECTED_SYSTEM, sConnectedSystem);
                    this.oCreateConditionsModel.setProperty("/connectedSystemError", ValueState.None);
                }
            },

            /**
             * Plant VH request handler in in Create Conditions Dialog.
             */
            onPlantValueHelpRequest: function () {
                var sDialogHeader = this._oResourceBundle.getText("PlantValueHelp");
                var sTableHeader = this._oResourceBundle.getText("Plant");
                var sEntitySet = Constants.VALUE_HELP_ENTITY.PLANT;
                var sInitiallyVisibleFields = Constants.INITIALLY_VISIBLE_FIELDS.PLANT;
                var sValueHelpRequestedField = "plant";
                var sBasicSearchFieldName = Constants.BASIC_SEARCH_FIELDS.PLANT;
                var aFilters = Constants.VALUE_HELP_FILTERS.PLANT;
                this.oCreateConditionsModel.setProperty("/plantError", ValueState.None);
                this.openReusableValueHelpDialog(sDialogHeader, sTableHeader, sEntitySet, sInitiallyVisibleFields, sValueHelpRequestedField, sBasicSearchFieldName, aFilters);
            },

            /**
             * Connected System VH request handler in in Create Conditions Dialog.
             */
            onConnectedSystemValueHelpRequest: function () {
                var sDialogHeader = this._oResourceBundle.getText("ConnectedSystemValueHelp");
                var sTableHeader = this._oResourceBundle.getText("ConnectedSystem");
                var sEntitySet = Constants.VALUE_HELP_ENTITY.CONNECTED_SYSTEM;
                var sInitiallyVisibleFields = Constants.INITIALLY_VISIBLE_FIELDS.CONNECTED_SYSTEM;
                var sValueHelpRequestedField = "connectedSystem";
                var sBasicSearchFieldName = Constants.BASIC_SEARCH_FIELDS.CONNECTED_SYSTEM;
                var aFilters = Constants.VALUE_HELP_FILTERS.CONNECTED_SYSTEM;
                this.oCreateConditionsModel.setProperty("/connectedSystemError", ValueState.None);
                this.openReusableValueHelpDialog(sDialogHeader, sTableHeader, sEntitySet, sInitiallyVisibleFields, sValueHelpRequestedField, sBasicSearchFieldName, aFilters);
            },

            /**
             * Condition Type VH request handler in in Create Conditions Dialog.
             */
            onConditionTypeValueHelpRequest: function () {
                var sDialogHeader = this._oResourceBundle.getText("ConditionTypeValueHelp");
                var sTableHeader = this._oResourceBundle.getText("ConditionType");
                var sEntitySet = Constants.VALUE_HELP_ENTITY.CONDITION_TYPE;
                var sInitiallyVisibleFields = Constants.INITIALLY_VISIBLE_FIELDS.CONDITION_TYPE;
                var sValueHelpRequestedField = "conditionType";
                var sBasicSearchFieldName = Constants.BASIC_SEARCH_FIELDS.CONDITION_TYPE;
                var aFilters = Constants.VALUE_HELP_FILTERS.CONDITION_TYPE;
                this.oCreateConditionsModel.setProperty("/conditionTypeError", ValueState.None);
                this.openReusableValueHelpDialog(sDialogHeader, sTableHeader, sEntitySet, sInitiallyVisibleFields, sValueHelpRequestedField, sBasicSearchFieldName, aFilters);
            },

            /**
             * Change Reason VH request handler in in Create Conditions Dialog.
             */
            onChangeReasonValueHelpRequest: function () {
                var sDialogHeader = this._oResourceBundle.getText("ChangeReasonValueHelp");
                var sTableHeader = this._oResourceBundle.getText("ChangeReason");
                var sEntitySet = Constants.VALUE_HELP_ENTITY.CHANGE_REASON;
                var sInitiallyVisibleFields = Constants.INITIALLY_VISIBLE_FIELDS.CHANGE_REASON;
                var sValueHelpRequestedField = "changeReason";
                var sBasicSearchFieldName = Constants.BASIC_SEARCH_FIELDS.CHANGE_REASON;
                var aFilters = Constants.VALUE_HELP_FILTERS.CHANGE_REASON;
                this.oCreateConditionsModel.setProperty("/changeReasonError", ValueState.None);
                this.openReusableValueHelpDialog(sDialogHeader, sTableHeader, sEntitySet, sInitiallyVisibleFields, sValueHelpRequestedField, sBasicSearchFieldName, aFilters);
            },

            /**
             * Currency VH request handler in in Create Conditions Dialog.
             */
            onCurrencyValueHelpRequest: function () {
                var sDialogHeader = this._oResourceBundle.getText("CurrencyValueHelp");
                var sTableHeader = this._oResourceBundle.getText("Currency");
                var sEntitySet = Constants.VALUE_HELP_ENTITY.CURRENCY;
                var sInitiallyVisibleFields = Constants.INITIALLY_VISIBLE_FIELDS.CURRENCY;
                var sValueHelpRequestedField = "currency";
                var sBasicSearchFieldName = Constants.BASIC_SEARCH_FIELDS.CURRENCY;
                var aFilters = Constants.VALUE_HELP_FILTERS.CURRENCY;
                this.oCreateConditionsModel.setProperty("/currencyError", ValueState.None);
                this.openReusableValueHelpDialog(sDialogHeader, sTableHeader, sEntitySet, sInitiallyVisibleFields, sValueHelpRequestedField, sBasicSearchFieldName, aFilters);
            },

            /**
             * Method to open Reusable ValueHelp
             * @param {string} sDialogHeader - Dialog Header
             * @param {string} sTableHeader - Table Header
             * @param {string} sEntitySet - Entity Set for SmartTable
             * @param {string} sInitiallyVisibleFields - InitiallyVisible Fields for SmartTable
             * @param {string} sValueHelpRequestedField - For what input field value help is requested
             * @param {string} sBasicSearchFieldName - field name for basic search in value help
             * @param {array} aFilters - array of required filters
             */
            openReusableValueHelpDialog: function (sDialogHeader, sTableHeader, sEntitySet, sInitiallyVisibleFields, sValueHelpRequestedField, sBasicSearchFieldName, aFilters) {
                this.oReusableValueHelpModel = new JSONModel({
                    "dialogHeader": sDialogHeader,
                    "tableHeader": sTableHeader,
                    "entitySet": sEntitySet,
                    "initiallyVisibleFields": sInitiallyVisibleFields,
                    "valueHelpRequestedField": sValueHelpRequestedField,
                    "basicSearchFieldName": sBasicSearchFieldName,
                    "filters": aFilters,
                    "IsOkVisible": sValueHelpRequestedField === Constants.LOCAL_MODEL_FIELDS.PLANT ? true : false
                });
                Fragment.load({
                    id: "idReusableValueHelpDialog",
                    name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.CreateConditionsReusableValueHelp",
                    controller: this
                }).then(function (oDialog) {
                    this._oReusableValueHelp = oDialog;
                    this._oReusableValueHelp.setModel(this.oReusableValueHelpModel, "reusableValueHelpModel");
                    this._oReusableValueHelpSmartTable = Fragment.byId("idReusableValueHelpDialog", "idReusableValueHelpSmartTable");
                    if (sValueHelpRequestedField === "plant") {
                        this._oReusableValueHelpSmartTable.getTable().setMode("MultiSelect");
                    } else {
                        this._oReusableValueHelpSmartTable.getTable().setMode("SingleSelectLeft");
                    }
                    this._oReusableValueHelpSmartFilterBar = Fragment.byId("idReusableValueHelpDialog", "idReusableValueHelplSmartFilterBar");
                    this._oReusableValueHelpSmartTable.setSmartFilterId(this._oReusableValueHelpSmartFilterBar.getId());
                    this._oReusableValueHelpSmartTable.getTable().attachSelectionChange(this.onReusableVHSelectionChange.bind(this));
                    this.oCreateConditionsDialog.addDependent(this._oReusableValueHelp);
                    this._oReusableValueHelp.open();
                }.bind(this));
            },

            /**
             * Reusable VH Selection change event handler.
             * @param {sap.ui.base.Event} oEvent - selection event triggered
             */
            onReusableVHSelectionChange: function (oEvent) {
                var sValueHelpRequestedField = this.oReusableValueHelpModel.getProperty("/valueHelpRequestedField");
                if (sValueHelpRequestedField !== Constants.LOCAL_MODEL_FIELDS.PLANT) {
                    if (oEvent.getSource().getSelectedItems().length > 0) {
                        //If condition Type VH is selected
                        if (sValueHelpRequestedField === Constants.LOCAL_MODEL_FIELDS.CONDITION_TYPE) {
                            //Taking condition type value from selected item
                            var sSelectedConditionType = oEvent.getSource().getSelectedItem().getBindingContext().getObject().ConditionType;
                            this.onConditionTypeSelected(sSelectedConditionType);
                            this.oCreateConditionsDialog.setBusy(true);
                        }
                        this.onReusableValueHelpOK();
                    }
                }
            },

            /**
             * Close Reusable VH event handler.
             */
            onReusableValueHelpClose: function () {
                this._oReusableValueHelpSmartTable.getTable().removeSelections();
                this._oReusableValueHelpSmartFilterBar.setFilterData({}, true);
                this._oReusableValueHelp.close();
                this._oReusableValueHelp.destroy();
                // This is to fix duplicate id issue in fragment
                this._oReusableValueHelp = undefined;
            },
            /**
             * Event for Ok button press if value help is multi-select
             * @param {sap.ui.base.Event} oEvent - selection event triggered
             */
            onReusableValueHelpOkButtonPress: function (oEvent) {
                var sSelectedPlant, sSelectedSystem;
                var sValueHelpRequestedField = this.oReusableValueHelpModel.getProperty("/valueHelpRequestedField");
                if (sValueHelpRequestedField === Constants.LOCAL_MODEL_FIELDS.PLANT) {
                    var aSelectedContext = oEvent.getSource().getParent().getContent()[0].getAggregation("items")[1].getTable().getSelectedContexts();
                    if (aSelectedContext.length > 0) {
                        Fragment.byId("idCreateConditionsFragment", "idPlantInput").removeAllTokens();
                    }
                    aSelectedContext.forEach(function (oContext) {
                        var sPath = oContext.getPath();
                        var oData = oContext.getModel().getObject(sPath);
                        if (sSelectedSystem) {
                            if (sSelectedSystem !== oData.ProcurementHubSourceSystem) {
                                sSelectedSystem = "";
                            }
                        } else {
                            sSelectedSystem = oData.ProcurementHubSourceSystem;
                        }

                        if (sSelectedPlant) {
                            sSelectedPlant = sSelectedPlant + "$" + oData.ProcmtHubPlant + "_" + oData.ProcurementHubSourceSystem;
                        } else {
                            sSelectedPlant = oData.ProcmtHubPlant + "_" + oData.ProcurementHubSourceSystem;
                        }
                        Fragment.byId("idCreateConditionsFragment", "idPlantInput").addToken(new Token({ text: oData.ProcmtHubPlant + ":" + oData.ProcurementHubSourceSystem }));
                    });
                    if (aSelectedContext.length > 1) {
                        this.oCreateConditionsModel.setProperty("/ConnectedSystemEnabled", false);
                    }
                    else {
                        this.oCreateConditionsModel.setProperty("/ConnectedSystemEnabled", true);
                    }
                    this.oCreateConditionsModel.setProperty("/" + Constants.LOCAL_MODEL_FIELDS.CONNECTED_SYSTEM, sSelectedSystem);
                    this.oCreateConditionsModel.setProperty("/" + Constants.LOCAL_MODEL_FIELDS.PLANT, sSelectedPlant);
                    this.onReusableValueHelpClose();
                    this._getConditionCurrency();
                }
            },
            /**
             * Reusable VH press Ok button event handler.
             */
            onReusableValueHelpOK: function () {
                var oSelectedItem = this._oReusableValueHelpSmartTable.getTable().getSelectedItem();
                if (oSelectedItem) {
                    var sSelectedItemValue = "",
                        sOdataFields = "";
                    var sValueHelpRequestedField = this.oReusableValueHelpModel.getProperty("/valueHelpRequestedField");
                    switch (sValueHelpRequestedField) {
                        case Constants.LOCAL_MODEL_FIELDS.CONNECTED_SYSTEM:
                            sOdataFields = Constants.ODATA_FIELDS.CONNECTED_SYSTEM;
                            this.oCreateConditionsModel.setProperty("/" + Constants.LOCAL_MODEL_FIELDS.PLANT, "");
                            break;
                        case Constants.LOCAL_MODEL_FIELDS.CONDITION_TYPE:
                            sOdataFields = Constants.ODATA_FIELDS.CONDITION_TYPE;

                            break;
                        case Constants.LOCAL_MODEL_FIELDS.CHANGE_REASON:
                            sOdataFields = Constants.ODATA_FIELDS.CHANGE_REASON;
                            break;
                        case Constants.LOCAL_MODEL_FIELDS.CURRENCY:
                            sOdataFields = Constants.ODATA_FIELDS.CURRENCY;
                            break;
                        default:
                            break;
                    }
                    sSelectedItemValue = oSelectedItem.getBindingContext().getProperty(sOdataFields);
                    this.oCreateConditionsModel.setProperty("/" + sValueHelpRequestedField, sSelectedItemValue);
                }
                this.onReusableValueHelpClose();
            },

            /**
             * Reusable VH initialise event handler.
             */
            onInitialiseReusableVHSmartTable: function () {
                this._oReusableValueHelpSmartFilterBar.fireSearch();
            },

            /**
             * Reusable VH SmartTable Rebind event
             * @param {sap.ui.base.Event} oEvent - beforeRebind event triggered
             */
            onReusableVHSmartTableBeforeRebind: function (oEvent) {
                var aDefaultFilters = this.oReusableValueHelpModel.getProperty("/filters");
                if (aDefaultFilters.length) {
                    var aReusableValueHelpSmartTableFilter = this._getBindingParamsFilters(aDefaultFilters);
                    var aFilter = new Filter({
                        filters: aReusableValueHelpSmartTableFilter,
                        and: true
                    });
                    var oReusableValueHelpSmartTableBindingParameters = oEvent.getParameter("bindingParams");
                    if (aFilter && aFilter.aFilters && aFilter.aFilters.length) {
                        if (oReusableValueHelpSmartTableBindingParameters) {
                            oReusableValueHelpSmartTableBindingParameters.filters.push(aFilter);
                        }
                    }
                }
            },

            /**
             * Method to create filters to apply on ListReport 
             * @param {sap.ui.model.Filter[]} aDefaultFilters - filters passed by default
             * @return {sap.ui.model.Filter[]}} aFilter - array of generated filters
             */
            _getBindingParamsFilters: function (aDefaultFilters) {
                var aFilter = [];
                aDefaultFilters.forEach(function (oFilter) {
                    var oReusableValueHelpSmartTableFilter = new Filter({
                        path: oFilter.key,
                        operator: FilterOperator.EQ,
                        value1: this.getView().getBindingContext().getProperty(oFilter.value)
                    });
                    aFilter.push(oReusableValueHelpSmartTableFilter);
                }.bind(this));
                return aFilter;
            },
            /**
             *  Clearing ValueState for Create Condition Popup
             */
            _clearConditionValueState: function () {
                this.oCreateConditionsModel.setProperty("/plantError", ValueState.None);
                this.oCreateConditionsModel.setProperty("/connectedSystemError", ValueState.None);
                this.oCreateConditionsModel.setProperty("/conditionTypeError", ValueState.None);
                this.oCreateConditionsModel.setProperty("/amountError", ValueState.None);
                this.oCreateConditionsModel.setProperty("/currencyError", ValueState.None);
                this.oCreateConditionsModel.setProperty("/validFromError", ValueState.None);
                this.oCreateConditionsModel.setProperty("/validToError", ValueState.None);
                this.oCreateConditionsModel.setProperty("/changeReasonError", ValueState.None);
                this.oCreateConditionsModel.setProperty("/conditionTypeError", ValueState.None);
                this.oCreateConditionsModel.setProperty("/percentageError", ValueState.None);
            },

            /**
             * Create Conditions Button
             */
            handleCreateButtonPress: function () {
               this._clearConditionValueState();
                var bPlantDependent = this.oCreateConditionsModel.getProperty("/showPlant");
                var sPlant = this.oCreateConditionsModel.getProperty("/plant");
                var sConnectedSystem = this.oCreateConditionsModel.getProperty("/connectedSystem");
                var sConditionType = this.oCreateConditionsModel.getProperty("/conditionType");
                var sChangeReason = this.oCreateConditionsModel.getProperty("/changeReason");
                var sAmount = this.oCreateConditionsModel.getProperty("/amount");
                var sCurrency = this.oCreateConditionsModel.getProperty("/currency");
                var sPercentage = this.oCreateConditionsModel.getProperty("/percentage");
                var sCalcType = this.oCreateConditionsModel.getProperty("/conditionCalcType");
                var sSwitch = sCalcType === Constants.COND_TYPE.A ? sAmount : sPercentage;
                var dValidFrom = this.oCreateConditionsModel.getProperty("/validFrom");
                var dValidTo = this.oCreateConditionsModel.getProperty("/validTo");
                var bPlantDependentCheck = (bPlantDependent && sPlant) || !bPlantDependent;
                var bFormValidity = bPlantDependentCheck && sConditionType && sSwitch && sCurrency && sChangeReason && dValidFrom && dValidTo;
                var bStartDateIsMoreThanToDate = false;
                var sValidToValueStateText = "";
                var iValidFrom = Date.parse(dValidFrom);
                var iValidTo = Date.parse(dValidTo);
                if (iValidFrom > iValidTo) {
                    bStartDateIsMoreThanToDate = true;
                    sValidToValueStateText = this._oCntrlPCItemResourceBundle.getText("invalidFromToDate");
                }
                this.oCreateConditionsValidTo.setValueStateText(sValidToValueStateText);
                if (bFormValidity && !bStartDateIsMoreThanToDate) {
                    this._createConditions(dValidFrom, dValidTo);
                } else {
                    if (bPlantDependent && !sPlant) {
                        this.oCreateConditionsModel.setProperty("/plantError", ValueState.Error);
                    }
                    if (bPlantDependent && !sConnectedSystem) {
                        this.oCreateConditionsModel.setProperty("/connectedSystemError", ValueState.Error);
                    }
                    if (!sConditionType) {
                        this.oCreateConditionsModel.setProperty("/conditionTypeError", ValueState.Error);
                    }
                    if (!sAmount && (sCalcType === Constants.COND_TYPE.A)) {
                        this.oCreateConditionsModel.setProperty("/amountError", ValueState.Error);
                    }
                    if (!sCurrency) {
                        this.oCreateConditionsModel.setProperty("/currencyError", ValueState.Error);
                    }
                    if (!dValidFrom) {
                        this.oCreateConditionsModel.setProperty("/validFromError", ValueState.Error);
                    }
                    if (!dValidTo || bStartDateIsMoreThanToDate) {
                        this.oCreateConditionsModel.setProperty("/validToError", ValueState.Error);
                    }
                    if (!sChangeReason) {
                        this.oCreateConditionsModel.setProperty("/changeReasonError", ValueState.Error);
                    }
                    if (!sCalcType) {
                        this.oCreateConditionsModel.setProperty("/conditionTypeError", ValueState.Error);
                    }
                    if (!sPercentage && (sCalcType === Constants.COND_TYPE.P)) {
                        this.oCreateConditionsModel.setProperty("/percentageError", ValueState.Error);
                    }
                }
            },

            /**
             * Method to trigger Create Price Condition Funtion Import
             * @param {sap.ui.model.type.Date} dValidFrom - Valid From Date from Create Condition Dialog
             * @param {sap.ui.model.type.Date} dValidTo - Valid To Date from Create Condition Dialog
             */
            _createConditions: function (dValidFrom, dValidTo) {
                this.oCreateConditionsModel.setProperty("/createConditionMessages", []);
                var oModel = this.getView().getModel();
                var oLocalModelData = this.oCreateConditionsModel.getData();
                var sConditionCalcType = oLocalModelData.conditionCalcType;
                var sRateValue = (sConditionCalcType === Constants.COND_TYPE.A ? oLocalModelData.amount : oLocalModelData.percentage);
                this.oCreateConditionsDialog.setBusy(true);
                var sCurr = (sConditionCalcType === Constants.COND_TYPE.A ? oLocalModelData.currency : Constants.COND_TYPE.Percnt);
                oModel.callFunction(Constants.FUNCTION_IMPORT.CREATE_CONDITIONS, {
                    method: "POST",
                    urlParameters: {
                        "ParentDraftUUID": this.getView().getBindingContext().getProperty("DraftUUID"),
                        "ConditionType": oLocalModelData.conditionType,
                        "ProcmtHubPlant": oLocalModelData.plant,
                        "ProcurementHubSourceSystem": oLocalModelData.connectedSystem,
                        "ConditionValidityStartDate": dValidFrom,
                        "ConditionValidityEndDate": dValidTo,
                        "ConditionChangeReason": oLocalModelData.changeReason,
                        "ConditionRateValue": Number(sRateValue),
                        "ConditionCurrency": sCurr
                    },
                    success: this.handleCreateConditionsSuccess.bind(this),
                    error: function (oError) {
                        this.oCreateConditionsDialog.setBusy(false);
                        var oErrorMessage = JSON.parse(oError.responseText);
                        if (oErrorMessage && oErrorMessage.error && oErrorMessage.error.innererror && oErrorMessage.error.innererror.errordetails) {
                            this.oCreateConditionsModel.setProperty("/createConditionMessages", oErrorMessage.error.innererror.errordetails);
                        }
                    }.bind(this)
                });
            },

            /**
             * Create Price Conditions Success handler
             */
            handleCreateConditionsSuccess: function () {
                this.oCreateConditionsDialog.setBusy(false);
                this.handleCreateConditionDialogClose();
                //refreshing whole conditions reusable component
                this.refreshConditionFacet();
            },

            /**
             * Closing Create conditions dialog on press of cancel button
             */
            handleCreateConditionDialogClose: function () {
                this.oCreateConditionsDialog.close();
                this.oCreateConditionsDialog.destroy();
                // This is to fix duplicate id issue in fragment
                this.oCreateConditionsDialog = undefined;
            },

            /**
             * OverAll Quota More Info Icon
             */
            handleOverallQuotaInfoIconPress: function () {
                var sMaterial = "";
                var sMaterialNumber = "";
                var sMaterialInfo = "";
                var bItemLevel = false;
                var oParams = {
                    "CentralContract": "",
                    "CentralContractItem": "",
                    "CentralContractItemDist": "",
                    "DraftGuid": "",
                    "Plant": ""
                };
                var oBindingContext = this.getView().getBindingContext();
                if (oBindingContext) {
                    oParams.CentralContract = oBindingContext.getProperty("CentralPurchaseContract");
                    sMaterial = oBindingContext.getProperty("PurchaseContractItemText");
                    if (this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM || this._sCurrentView === Constants.VIEW_ID.ITEM) {
                        bItemLevel = true;
                        oParams.CentralContractItem = oBindingContext.getProperty("CentralPurchaseContractItem");
                        oParams.DraftGuid = oBindingContext.getProperty("ParentDraftUUID");
                        sMaterialNumber = oBindingContext.getProperty("PurchasingCentralMaterial");
                    } else {
                        bItemLevel = false;
                        oParams.CentralContractItemDist = oBindingContext.getProperty("DistributionKey");
                        oParams.DraftGuid = oBindingContext.getProperty("RootDraftUUID");
                        oParams.Plant = oBindingContext.getProperty("PLANT");
                        sMaterialNumber = oBindingContext.getProperty("Material");
                    }
                    if (sMaterial && sMaterialNumber) {
                        sMaterialInfo = sMaterial + " (" + sMaterialNumber + ")";
                    }
                    ReuseQuotaDetails.loadDialog(this.oCntrlPCItemi18nModel, sMaterialInfo, bItemLevel, oParams);
                }
            },

            /**
             * Fetching data for plant value help
             */
            handlePlantValueHelp: function () {
                this.getView().getController().getOwnerComponent().getModel().read(
                    "/C_ProcmtHubPlantSystemVH", {
                    success: this.getPlantValueHelpSuccess.bind(this),
                    error: this.getPlantValueHelpError.bind(this)
                });

            },
            /**
             * Event handler for plant Value help success
             * @param {object} oData - success result
             */
            getPlantValueHelpSuccess: function (oData) {
                this.handlePlantVHDialogOpen(oData);
            },
            /**
             * Event handler for copy functionality error
             * @param {object} oError - error result
             */
            getPlantValueHelpError: function (oError) {
                if (oError.responseText) {
                    MessageBox.error(oError.message);
                }
            },
            /**
             * Event handler for Plant VH dialog
             * @param {object} oData - data for binding
             */
            handlePlantVHDialogOpen: function (oData) {
                var oColModel = new JSONModel();
                oColModel.setData({
                    cols: [{
                        label: this._oResourceBundle.getText("Plant"),
                        template: "ProcmtHubPlant"
                    }, {
                        label: this._oResourceBundle.getText("PlantName"),
                        template: "ProcmtHubPlantName"
                    }, {
                        label: this._oResourceBundle.getText("SourceSystem"),
                        template: "ProcurementHubSourceSystem"
                    }, {
                        label: this._oResourceBundle.getText("SourceSystemName"),
                        template: "ProcurementHubSourceSystemName"
                    }]
                });
                //empty row for plant independent selection
                var oEmptyRow = {
                    ProcmtHubCompanyCode: "",
                    ProcmtHubCompanyCodeName: "",
                    ProcmtHubPlant: "",
                    ProcmtHubPlantName: this._oResourceBundle.getText("PlantDefault"),
                    ProcmtHubPlantUniqueID: "",
                    ProcurementHubSourceSystem: "",
                    ProcurementHubSourceSystemName: ""
                };
                oData.results.unshift(oEmptyRow);
                var oRowModel = new JSONModel(oData);
                var aCols = oColModel.getData().cols;

                Fragment.load({
                    id: this.getView().getId(),
                    name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.PlantValueHelpDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oPlantVHDialog = oDialog;
                    this.getView().addDependent(this._oPlantVHDialog);
                    this._oPlantVHDialog.getTableAsync().then(function (oTable) {
                        oTable.setModel(oColModel, "columns");
                        oTable.setModel(oRowModel);
                        if (oTable.bindRows) {
                            oTable.bindAggregation("rows", "/results");
                        }
                        if (oTable.bindItems) {
                            oTable.bindAggregation("items", "/results", function () {
                                return new ColumnListItem({
                                    cells: aCols.map(function (column) {
                                        return new Label({
                                            text: "{" + column.template + "}"
                                        });
                                    })
                                });
                            });
                        }
                        this._oPlantVHDialog.update();
                    }.bind(this));
                    this._oPlantVHDialog.open();
                }.bind(this));
            },
            /**
             * on selection, set the value of Plant field
             * @param {sap.ui.base.Event} oEvent - Event triggered
             */
            handlePlantVHOk: function (oEvent) {
                var iSelectedIndex = oEvent.getSource().getTable().getSelectedIndex(),
                    oPLantVHObject = oEvent.getSource().getTable().getBinding("rows").getContexts()[iSelectedIndex].getObject();
                Fragment.byId("idCopyConditionsFragment", "idPlant").setValue(oPLantVHObject.ProcmtHubPlant);
                this.sPlantSourceSystem = oPLantVHObject.ProcurementHubSourceSystem;
                this._oPlantVHDialog.close();
            },
            /**
             * on cancel, close the dialog
             */
            handlePlantVHCancel: function () {
                this._oPlantVHDialog.close();
            },
            /**
             * after close, destroy the dialog
             */
            handlePlantVHAfterClose: function () {
                this._oPlantVHDialog.destroy();
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
             * Return Base Material text.
             * @param {string} sBaseMaterial Base material
             * @return {string} Base material
             */
            getBaseMaterialFormatter: function (sBaseMaterial) {
                if (sBaseMaterial !== null) {
                    return Formatter.getBaseMaterialFormatter(sBaseMaterial);
                }
                return "";
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
             * @return {sap.ui.core.IconColor} icon color
             * @public
             */
            getSupplierOverallStatusState: function (sSupplierOverallStatus) {
                return ReuseFormatter.getSupplierOverallStatusState(sSupplierOverallStatus);
            },

            /**
             * Fire formatter to return icon src based on the distribution line status.
             * @param {string} sDistLineStatus distribution line status code
             * @return {string} icon src
             * @public
             */
            getDistrStatusIcon: function (sDistLineStatus) {
                return Formatter.getDistrStatusIcon(sDistLineStatus);
            },

            /**
             * Fire formatter to return status state based on the distribution line status.
             * @param {string} sDistLineStatus distribution line status code
             * @return { sap.ui.core.IconColor} icon color
             * @public
             */
            getDistrStatusState: function (sDistLineStatus) {
                return Formatter.getDistrStatusState(sDistLineStatus);
            },

            /**
             * Format Boolean value. Return 'Yes' || 'No' string.
             * @param {boolean} bValue boolean value
             * @return {string} 'Yes' || 'No' string
             */
            formatBooleanValue: function (bValue) {
                return Formatter.formatBooleanValue(bValue, this._oResourceBundle);
            },


            /**
             * Format decimal value. 
             * @param {string} sValue decimal value
             * @return {string} decimal value or empty string
             * @public
             */
            formatDecimalEmptyValue: function (sValue) {
                return Formatter.formatDecimalEmptyValue(sValue);
            },

            /**
             * Change smartfield value event handler.
             * Clear smart field value if there is 0.
             * @param {sap.ui.base.Event} oEvent change event
             * @public
             */
            changeDecimalEmptyHandler: function (oEvent) {
                var sValue = oEvent.getParameter("newValue");
                this._setEmptyDecimalFields(oEvent.getSource(), sValue);
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
             * Import Standard Text button press event handler.
             */
            onImportStdTextPress: function () {
                this.oStandardTextSH.open();
            },

            /**
             * Load fragment for Distribution Search Dialog.
             * @param {sap.ui.base.Event} oEvent press event
             */
            onHandleDistributionSearchHelp: function (oEvent) {
                var bIsAddBtn = oEvent.getSource().data("btnName") === Constants.DISTRIBUTION_ACTION.ADD;
                this._oDistributionModel.setProperty("/enableAddBtn", false); 
                if (!this._oDistributionSearchHelpDialog) {
                    Fragment.load({
                        id: "DistributionSearchHelpDialog",
                        name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.DistributionSearchDialog",
                        controller: this
                    }).then(function (oDialog) {
                        this._oDistributionSearchHelpDialog = oDialog;
                        this._oDistAddTreeTable = Fragment.byId("DistributionSearchHelpDialog", "idDistributionSearchSmartTable");
                        this._oDistAddTreeTable.getTable().setExpandFirstLevel(true);
                        this.getView().addDependent(this._oDistributionSearchHelpDialog);
                        this._oDistributionModel.setProperty("/showAddBtn", bIsAddBtn);
                        this._oDistributionSearchHelpDialog.setBusyIndicatorDelay(0);
                        this._oDistributionSearchHelpDialog.open();
                    }.bind(this));
                } else {
                    this._oDistributionModel.setProperty("/showAddBtn", bIsAddBtn); 
                    this._oDistributionSearchHelpDialog.open();
                }
            },           

            /**
             * Before rebind table Saving smart table reference for expand collapse.
             * @param {sap.ui.base.Event} oEvent press event
             */
            onBeforeRebindTable: function (oEvent) {
                // Saving smart table reference for expand collapse 
                if (!this._oDistributionSearchHelpTree) {
                    this._oDistributionSearchHelpTree = oEvent.getSource().getTable();
                    this._oDistributionSearchHelpTree.setExpandFirstLevel(true);
                    this._oDistributionSearchHelpTree.attachRowSelectionChange(this.onDistributionTreeRowSelectionChanged.bind(this));
                }
            },
            /**
             * Format Boolean value. Return 'Yes' || 'No' string.
             * @param {boolean} bValue boolean value
             * @return {string} 'Yes' || 'No' string
             */
            formatSelectedValue: function (bValue) {
                return Formatter.formatBooleanValue(bValue, this._oCntrlPCItemResourceBundle);
            },
            /**
             * Event handler for Distribution Tree node Select
             * @param {sap.ui.base.Event} oEvent press event
             */
            onDistributionTreeRowSelectionChanged: function (oEvent) {

                var oTreeTable = oEvent.getSource();
                var aIndices = oTreeTable.getSelectedIndices();
                this._oDistributionModel.setProperty("/enableAddBtn", aIndices.length > 0);

                var iSelectedIndex = oEvent.getParameters().rowIndex;
                var bNodeSelectionRequired = true;

                // In case of recurcise call, either of two will be filled 
                if (this._aPreviousTreeSelectionInterval.length > 0) {
                    this._aPreviousTreeSelectionInterval = [];
                    return;
                }
                if (this._aRemovedTreeSelectionInterval.length > 0) {
                    this._aRemovedTreeSelectionInterval = [];
                    return;
                }

                // in case of select all / deselect all and collpase all 
                if (oEvent.getParameters().selectAll === true || oEvent.getParameters().rowIndex === "-1" || oEvent.getParameters().userInteraction ===
                    false) {
                    return;
                }
                var oTreetableContext = this._oDistributionSearchHelpTree.getContextByIndex(iSelectedIndex);
                var oSelectedTreeNode = this._oDistributionSearchHelpTree.getModel().getProperty(oTreetableContext.getPath());
                // Plant means a lowest level node , we can skip the multiple selection 
                if (oSelectedTreeNode.Ccode === Constants.SELECTED_NODE.PLANT) {
                    bNodeSelectionRequired = false;
                    return;
                }

                if (bNodeSelectionRequired) {
                    this.handleNodeSelection(iSelectedIndex, oSelectedTreeNode);
                }

            },
            /**
             * Helper function for node Selection
             * @param {integer} iSelectedIndex selected index value
             * @param {object} oSelectedTreeNode selected tree node
             */
            handleNodeSelection: function (iSelectedIndex, oSelectedTreeNode) {
                var oTreeNextContext, oNextTreeNode;
                // check if the event is of node selection or removal of selection 
                var aSelectedIndexs = this._oDistributionSearchHelpTree.getSelectedIndices();
                // checked the index is within the selected tree index , if not means its a case of removal
                var sSelectionEvent = Object.keys(aSelectedIndexs).filter(function (key) {
                    return aSelectedIndexs[key] === iSelectedIndex;
                })[0];

                // check a case for Deselection after a collapse , we need not remove interval, this is to avoid issue 
                // reselection after collapse, this is applicable to parent nodes
                if (sSelectionEvent === undefined) {
                    // remove selection Interval 
                    oTreeNextContext = this._oDistributionSearchHelpTree.getContextByIndex(iSelectedIndex + 1);
                    if (!oTreeNextContext) {
                        return;
                    } else {
                        if (!this._oDistributionSearchHelpTree.isIndexSelected(iSelectedIndex + 1)) {
                            // next node is already unselected,so need to look for interval
                            return;
                        }
                    }
                }

                var iStartInterval = iSelectedIndex; // start index 
                var iEndInterval = iSelectedIndex; // end Index
                var iNextIndex = iSelectedIndex; // iteration
                var bStopNodeSearch = true;
                var aPreviousSeletedIndex = [];
                aPreviousSeletedIndex.push(iStartInterval);

                while (bStopNodeSearch) {
                    // code block to be executed
                    iNextIndex++;
                    oTreeNextContext = this._oDistributionSearchHelpTree.getContextByIndex(iNextIndex);
                    if (oTreeNextContext === undefined) { // this is the case of being the last node in the tree, stop iteration
                        iNextIndex--;
                        iEndInterval = iNextIndex;
                        bStopNodeSearch = false;
                        break;
                    }
                    oNextTreeNode = this._oDistributionSearchHelpTree.getModel().getProperty(oTreeNextContext.getPath());
                    // Next node is at the same level as selected node you have comppleted your interval
                    if (oNextTreeNode.HierarchyNodeLevel === oSelectedTreeNode.HierarchyNodeLevel) {
                        iNextIndex--;
                        iEndInterval = iNextIndex;
                        bStopNodeSearch = false;
                        break;
                    }
                    // The selected node was a lower level parent and it has countered another 0 level node, which is higher up so stop
                    if (oNextTreeNode.HierarchyNodeLevel === "0") {
                        iNextIndex--;
                        iEndInterval = iNextIndex;
                        bStopNodeSearch = false;
                        break;
                    }
                    iEndInterval = iNextIndex; // just continue the loop
                    aPreviousSeletedIndex.push(iNextIndex);
                }
                this.handleEventSelection(sSelectionEvent, aPreviousSeletedIndex, iStartInterval, iEndInterval);
            },
            /**
             * Event handler for event Selection
             * @param {string} sSelectionEvent to check type of event
             * @param {object} aPreviousSeletedIndex previously selected index value
             * @param {integer} iStartInterval start index
             * @param {integer} iEndInterval end index
             */
            handleEventSelection: function (sSelectionEvent, aPreviousSeletedIndex, iStartInterval, iEndInterval) {
                if (sSelectionEvent === undefined) {
                    // remove selection Interval 
                    this._aRemovedTreeSelectionInterval = aPreviousSeletedIndex;
                    this._oDistributionSearchHelpTree.removeSelectionInterval(iStartInterval, iEndInterval);
                } else {
                    // Set Selection Sequentally in expanded tree nodes 
                    this._aPreviousTreeSelectionInterval = aPreviousSeletedIndex;
                    this._oDistributionSearchHelpTree.addSelectionInterval(iStartInterval, iEndInterval);
                }
            },

            /**
             * Return array of selected nodes in the tree table.
             * @return {array} aDistributionSearchTreeSelectionNodes array of selected items
             */
            getDistributionSearchSelectedTreeNodes: function () {
                var aDistributionSearchTreeSelectionNodes = [];
                var aIndices = this._oDistributionSearchHelpTree.getSelectedIndices();
                for (var i = 0; i < aIndices.length; i++) {
                    //fetch the data of selected rows by index
                    var oTableSelectedIndexContext = this._oDistributionSearchHelpTree.getContextByIndex(aIndices[i]);
                    var oSelectedTreeNode = oTableSelectedIndexContext.getObject();
                    aDistributionSearchTreeSelectionNodes.push(oSelectedTreeNode);
                }
                return aDistributionSearchTreeSelectionNodes;
            },

            /**
             * Copy distribution lines.
             */
            handleDistributionSearchHelpCopy: function () {
                var oHierTable, sPath, aCopyDistributionPromises = [];
                var oBindingContext = this.getView().getBindingContext();
                var aDistributionSearchTreeSelectionNodes = this.getDistributionSearchSelectedTreeNodes();
                var oParameters = {
                    "CentralPurchaseContract": oBindingContext.getProperty("CentralPurchaseContract")
                };
                if (this._sCurrentView === Constants.VIEW_ID.HIERARCHY_HEADER) {
                    oHierTable = this._oHierHdrDistrTable;
                    sPath = Constants.FUNCTION_IMPORT.HIER_COPY_DIST;
                } else {
                    oHierTable = this._oHierItemDistrTable;
                    sPath = Constants.FUNCTION_IMPORT.HIER_ITEM_COPY_DIST;
                    oParameters.CentralPurchaseContractItem = oBindingContext.getProperty("CentralPurchaseContractItem");
                }
                // based on the level (header or item) get selected distribution line
                var oSelectedDistribution = oHierTable.getSelectedItem().getBindingContext().getObject();

                oParameters.DraftUUID = oSelectedDistribution.DraftUUID;
                // if there are no selected nodes in dialog tree, use the data of selected distribution line
                if (!aDistributionSearchTreeSelectionNodes.length) {
                    this._addCompanyCodePlanParameters(oSelectedDistribution, oParameters);
                    aCopyDistributionPromises.push(this.copyDistributions(sPath, oParameters));
                } else {
                    aCopyDistributionPromises = aDistributionSearchTreeSelectionNodes.map(function (oDistributionLineNode) {
                        this._addCompanyCodePlanParameters(oDistributionLineNode, oParameters);
                        return this.copyDistributions(sPath, oParameters);
                    }, this);
                }

                this._oDistributionSearchHelpTree.setBusy(true);

                Promise.all(aCopyDistributionPromises).then(function (oHierarchyTable, oData) {
                    this.handlePromiseResolve(oHierarchyTable, oData);
                }.bind(this, oHierTable)).catch(function (oError) {
                    this.handleErrorForDistribution(oError);
                }.bind(this));
            },
            /**
             * Handle error scenario in case of failure of add or copy distribution 
             * @param {object} oError object
             */
            handleErrorForDistribution: function (oError) {               
                if (JSON.parse(oError.responseText)) {
                    var aErrors = JSON.parse(oError.responseText).error.innererror.errordetails;
                    this.displayErrorMessageForAddORCopyDistribution(aErrors);

                }
                this._oDistributionSearchHelpTree.setBusy(false);
                this._oDistributionSearchHelpDialog.setBusy(false);
            },
            /**
             * Handle error scenario in case of add or copy distribution success
             * @param {object} oData object
             */
            handleErrorForDistributionSuccess: function (oData) {
                var aErrors = JSON.parse(oData[0].responseText).error.innererror.errordetails;
                this.displayErrorMessageForAddORCopyDistribution(aErrors);
                this._oDistributionSearchHelpDialog.setBusy(false);
                this._oDistributionSearchHelpTree.setBusy(false);
            },

            /**
             * Display error message for add or copy distribution lines
             * @param {array} aErrors array of error objects
             */
            displayErrorMessageForAddORCopyDistribution: function (aErrors) {
                var sErrorText = "";
                for (var iErrorNumber = 0; iErrorNumber < aErrors.length; iErrorNumber++) {
                    sErrorText = sErrorText + "\n" + aErrors[iErrorNumber].message;
                }
                MessageBox.error(sErrorText);
            },

            /**
             * Handler for outcome of add or copy distribution promise
             * @param {object} oHierTable hierarchy distribution table at current level
             * @param {object} oData object
             */
            handlePromiseResolve: function (oHierTable, oData) {
                if (oData && oData.length > 0) {                    
                    // in case of error
                    if (oData[0].responseText !== undefined) {
                        this.handleErrorForDistributionSuccess(oData);
                    } else {
                        this._oDistributionSearchHelpTree.setBusy(false);
                        this._oDistributionSearchHelpDialog.setBusy(false);
                        oHierTable.getBinding("items").refresh();
                        this.handleDistributionSearchDialogClose();
                    }
                }
            },
            /**
             * Added 'Company code' and 'Plant' parameters to Copy FI request based on the selected node type.
             * @param {object} oDistribution distribution line to copy
             * @param {object} oParameters url parameters object
             */
            _addCompanyCodePlanParameters: function (oDistribution, oParameters) {
                if (oDistribution.Ccode === Constants.SELECTED_NODE.PLANT) {
                    oParameters.Plant = oDistribution.CompanyCode;
                    oParameters.CompanyCode = oDistribution.SuprCode;
                } else {
                    oParameters.CompanyCode = oDistribution.CompanyCode || "";
                    oParameters.Plant = oDistribution.Plant || "";
                }
            },

            /**
             * Return Promise with FI call.
             * @param {string} sPath 'HierCtrCopyDist' or 'HierCtrItemCopyDist' FI path
             * @param {object} oParameters url parameters
             * @return {Promise} Promise object
             */
            copyDistributions: function (sPath, oParameters) {
                return new Promise(function (fnResolve, fnReject) {
                    var oModel = this.getView().getModel();
                    oModel.callFunction(sPath, {
                        method: "POST",
                        urlParameters: oParameters,
                        success: function (oResponse) {
                            fnResolve(oResponse);
                        },
                        error: function (oError) {
                            fnReject(oError);
                        }
                    });
                }.bind(this));

            },

            /**
             * Event handler for distribution search help add button press
             * @param {sap.ui.base.Event} oEvent press event
             */
            handleDistributionSearchHelpAdd: function (oEvent) {
                var oDistrDialog = oEvent.getSource().getParent();  
                oDistrDialog.setBusy(true);              
                var vLevel;
                var oHierTable;
                var aDistributionSearchTreeSelectionNodes = [];
                if (this.getView().getId() ===
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierHdrTP") {
                    vLevel = Constants.LEVEL.HEADER;
                } else {
                    vLevel = Constants.LEVEL.ITEM;
                }
                var aPromises = [];
                aDistributionSearchTreeSelectionNodes = this.getDistributionSearchSelectedTreeNodes();    
                var oView = this.getView();
                var oBindingContext = oView.getBindingContext();
                var sDraftUuid = oBindingContext.getProperty("DraftUUID");
                var sCentralPurchaseContractItem = oBindingContext.getProperty("CentralPurchaseContractItem");
                var sServiceUrl;                
                if (vLevel === Constants.LEVEL.ITEM) {
                    oHierTable = this._oHierItemDistrTable;
                    var sItemEntityPath = this.getView().getModel().createKey("C_CntrlPurContrHierItemTP", {
                        CentralPurchaseContractItem: sCentralPurchaseContractItem,
                        CentralPurchaseContract: oBindingContext.getProperty("CentralPurchaseContract"),
                        DraftUUID: sDraftUuid,
                        IsActiveEntity: false
                    });
                    sServiceUrl = "/" + sItemEntityPath + "/to_CntrlPurContrDistributionTP";                  
                   
                    this._oDistributionSearchHelpTree.setBusy(true);
                } else {
                    oHierTable = this._oHierHdrDistrTable;
                    var sHeaderEntityPath = this.getView().getModel().createKey("C_CntrlPurContrHierHdrTP", {
                        CentralPurchaseContract: oBindingContext.getProperty("CentralPurchaseContract"),
                        DraftUUID: sDraftUuid,
                        IsActiveEntity: false
                    });
                    sServiceUrl = "/" + sHeaderEntityPath + "/to_CntrlPurContrHdrDistrTP";                
                    this._oDistributionSearchHelpTree.setBusy(true);
                }

                for (var i = 0; i < aDistributionSearchTreeSelectionNodes.length; i++) {
                    var oDataForEntry = {};
                    oDataForEntry.CompanyCode = aDistributionSearchTreeSelectionNodes[i].CompanyCode;
                    oDataForEntry.ProcurementHubSourceSystem = aDistributionSearchTreeSelectionNodes[i].ExtSourceSystem;
                    oDataForEntry.ProcmtHubCompanyCodeGroupingID = aDistributionSearchTreeSelectionNodes[i].CcodeGroup;
                    oDataForEntry.PurchasingDocumentCategory = Constants.PURCHANSING_DOCUMENT_CATEGORY.CONTRACT;
                    if (aDistributionSearchTreeSelectionNodes[i].Ccode === Constants.SELECTED_NODE.PLANT) {
                        oDataForEntry.Plant = aDistributionSearchTreeSelectionNodes[i].CompanyCode;
                        oDataForEntry.CompanyCode = aDistributionSearchTreeSelectionNodes[i].SuprCode;
                    }
                    //in case of plant it should from the parent 
                    var pPromise = this.addDistribution(oView, sServiceUrl, oDataForEntry);
                    aPromises.push(pPromise);

                }
                Promise.all(aPromises).then(function (oHierarchyTable, oData) {
                    this.handlePromiseResolve(oHierarchyTable, oData);
                }.bind(this, oHierTable)).catch(function (oError) {
                    this.handleErrorForDistribution(oError);
                }.bind(this));
            },

            /**
             * Helper function for creating object 
             * @param {object} oView view instance
             * @param {string} sServiceUrl backend call service path
             * @param {object} oDataForEntry data object for creation
             * @returns {promise} returns Promise object success or error
             */
            addDistribution: function (oView, sServiceUrl, oDataForEntry) {
                return new Promise(function (fnResolve, fnReject) {
                    var oModel = oView.getModel();
                    oModel.create(sServiceUrl, oDataForEntry, {
                        success: function (oResponse) {
                            fnResolve(oResponse);
                        },
                        error: function (oError) {
                            fnReject(oError);
                        }
                    });
                });
            },

            /**
             * Event handle for Distribution search dialog close
             */
            handleDistributionSearchDialogClose: function () {
                this._oDistributionSearchHelpDialog.close();
                this.getView().removeDependent(this._oDistributionSearchHelpDialog);
                this._oDistributionSearchHelpDialog.destroy();
                this._oDistributionSearchHelpDialog = null;
                this._oDistributionSearchHelpTree.destroy();
                this._oDistributionSearchHelpTree = null;
            },

            /**
             * Event handler for Distribution Search expand all button press
             */
            handleDistributionSearchExapndAll: function () {
                if (this._oDistributionSearchHelpTree && !this._oDistributionSearchHelpTree.isExpanded()) {
                    // the recommended hierarchy level is 4  for smart tee in the guidelines exapnding it to 4> Recursive expansion is 
                    // not supported 
                    this._oDistributionSearchHelpTree.expandToLevel(10);
                }
            },
            /**
             * Event handler for Delta Law Contract Press
             * @param {sap.ui.base.Event} oEvent press event
             */
            handleDeltaLawContractPress: function (oEvent) {
                var oItem = oEvent.getSource().getBindingContext().getObject();
                var oView = this.getView();
                var sContractHeader = oView.getModel().createKey("C_CntrlPurContrHierHdrTP", {
                    CentralPurchaseContract: oItem.DeltaLawContract,
                    DraftUUID: ReuseConstants.INITIAL_GUID,
                    IsActiveEntity: true
                });
                NavigationHelper.getNavigationPath(this.getView().getController(), Constants.NAVIGATE_APPLICATION.MCPC, sContractHeader).then(function (oNavigationDetails) {
                    //Open in new window
                    NavigationHelper.navigateWithURLHelper(oNavigationDetails.sPath, true);
                });
            },
            /**
             * Event handler for Super Law Contract Press
             * @param {sap.ui.base.Event} oEvent press event
             */
            handleSuperLawContractPress: function (oEvent) {
                var oItem = oEvent.getSource().getBindingContext().getObject();
                var oView = this.getView();
                var sContractHeader = oView.getModel().createKey("C_CntrlPurContrHierHdrTP", {
                    CentralPurchaseContract: oItem.SuperLawContract,
                    DraftUUID: ReuseConstants.INITIAL_GUID,
                    IsActiveEntity: true
                });
                NavigationHelper.getNavigationPath(this.getView().getController(), Constants.NAVIGATE_APPLICATION.MCPC, sContractHeader).then(function (oNavigationDetails) {
                    //Open in new window
                    NavigationHelper.navigateWithURLHelper(oNavigationDetails.sPath, true);
                });
            },
            /**
             * Pull from BOM press event handler.
             */
            handlePullFromBOM: function () {
                var dValuationDate = this.getView().getBindingContext().getProperty("ValDate");
                if (dValuationDate) {
                    var iRowCount = 0;
                    iRowCount = this.oZsbComponentGridTable.getBinding("rows").getLength();
                    if (iRowCount > 0) {
                        MessageBox.show(this._oResourceBundle.getText("BOMMessageContent"), {
                            title: this._oResourceBundle.getText("BOMMessageTitle"),
                            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                            emphasizedAction: MessageBox.Action.NO,
                            onClose: this.onClosePopup.bind(this, dValuationDate)
                        });
                    } else {
                        this._triggerZSBBOM("", dValuationDate);
                    }
                } else {
                    this._showValuationDateError();
                }
            },

            /**
             * Method for onClose action of popup.
             * @param {date} dValuationDate - valuation date
             * @param {sap.m.MessageBox.Action} oAction Messagebox action
             */
            onClosePopup: function (dValuationDate, oAction) {
                if (oAction === MessageBox.Action.YES) {
                    this._triggerZSBBOM("", dValuationDate);
                }
            },

            /**
             * Method to call ZSB BOM Promise and handle resolve/rejection of promise
             * @param {string} sConfirmValidityDate - flag for date confirmation
             * @param {date} dValuationDate - valuation date
             */
            _triggerZSBBOM: function (sConfirmValidityDate, dValuationDate) {
                this.getView().setBusy(true);
                var oZSBBOMPromise = this._getZSBBOMPromise(sConfirmValidityDate, dValuationDate);
                oZSBBOMPromise
                    .then(function () {
                        this.onBOMPromiseComplete();
                    }.bind(this))
                    .catch(function (oError) {
                        //below error message display has been replaced by NLO-5539
                        //this._showErrorMessageBox(JSON.parse(oError.responseText));
                        this.onValidationDateMismatch(oError);
                    }.bind(this))
                    .finally(function () {
                        this.getView().setBusy(false);
                    }.bind(this));
            },

            /**
             * Error handler for date mismatch for pull from BOM
             * @param {object} oErrorResponse Response
             */
            onValidationDateMismatch: function (oErrorResponse) {
                this.getView().setBusy(false);
                var iCount = oErrorResponse.responseText.search("VWKS/NLP_CCTR/330");
                if (iCount !== -1) {
                    var oErrorObject = JSON.parse(oErrorResponse.responseText).error.innererror.errordetails;
                    var sErrorMessage;
                    for (var iIndex in oErrorObject) {
                        if (oErrorObject[iIndex].code === "/VWKS/NLP_CCTR/330") {
                            sErrorMessage = oErrorObject[iIndex].message;
                            break;
                        }
                    }
                    var aErrorMessage = sErrorMessage.split(".");
                    var sDay = "",
                        sMonth = "",
                        sYear = "";
                    if (aErrorMessage.length && aErrorMessage.length === 3) {
                        sDay = aErrorMessage[0];
                        sMonth = aErrorMessage[1];
                        sYear = aErrorMessage[2];
                    }
                    var dValuationDate = new Date(sYear, sMonth - 1, sDay);
                    var sMessage = this._oResourceBundle.getText("DateMisMatchText", [sErrorMessage]);
                    var sSubMessage = this._oResourceBundle.getText("DateMisMatchSubText");
                    sErrorMessage = sMessage + "\n" + sSubMessage;
                    var sAcceptButtonText = this._oResourceBundle.getText("AcceptButtonText");
                    var sDeclineButtonText = this._oResourceBundle.getText("DeclineButtonText");
                    MessageBox.warning(sErrorMessage, {
                        actions: [sAcceptButtonText, sDeclineButtonText],
                        emphasizedAction: sAcceptButtonText,
                        onClose: function (sButton) {
                            if (sButton === sAcceptButtonText) {
                                this._triggerZSBBOM("X", dValuationDate);
                            }
                        }.bind(this)
                    });
                    return;
                }
                if (oErrorResponse.responseText) {
                    MessageBox.error(JSON.parse(oErrorResponse.responseText).error.message.value);
                }
            },

            /**
             * Method to refresh table contents, Last-BOM-Update
             */
            onBOMPromiseComplete: function () {
                this.oZsbComponentGridSmartTable.rebindTable();
                this.getView().getModel().refresh();
            },

            /**
             * Error Handling for messages sent from BADI
             * @param {object} oError - error object sent from BADI
             */
            _showErrorMessageBox: function (oError) {
                if (oError.error && oError.error.innererror && oError.error.innererror.errordetails) {
                    var aErrorMessage = oError.error.innererror.errordetails;
                    var sMessage = "";
                    for (var i = 0; i < aErrorMessage.length; i++) {
                        var sNewLine = "";
                        if (i !== aErrorMessage.length - 1) {
                            sNewLine = "\n";
                        }
                        sMessage = sMessage + (i + 1) + ". " + aErrorMessage[i].message + sNewLine;
                    }
                    if (sMessage) {
                        MessageBox.error(sMessage);
                    }
                }
            },

            /**
             * Method to call function import to get updated BOM data
             * @param {string} sConfirmValidityDate - flag for date confirmation
             * @param {date} dValuationDate - valuation date
             * @return {object} Promise Object of the function import
             **/
            _getZSBBOMPromise: function (sConfirmValidityDate, dValuationDate) {
                var oModel = this.getView().getModel();
                var oObject = this.getView().getBindingContext().getObject();
                var sPlant = this.aSelectedPlants.join();
                var oZSBBOMPromise = new Promise(function (resolve, reject) {
                    oModel.callFunction(Constants.FUNCTION_IMPORT.ZSB_ACTION, {
                        method: "GET",
                        urlParameters: {
                            MaterialZSB: oObject.PurchasingCentralMaterial,
                            SPlant: sPlant,
                            Contract: oObject.CentralPurchaseContract,
                            ContractItem: oObject.CentralPurchaseContractItem,
                            DRAFTUUID: oObject.DraftUUID,
                            HdrDraftUUID: oObject.ParentDraftUUID,
                            ValuationDate: dValuationDate,
                            ConfirmValidityDate: sConfirmValidityDate
                        },
                        success: function (oData) {
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
                return oZSBBOMPromise;
            },

            /**
             * Event handler for Distribution search collapse all button press
             */
            handleDistributionSearchCollapseAll: function () {
                if (this._oDistributionSearchHelpTree) {
                    this._oDistributionSearchHelpTree.collapseAll();
                }
            },

            /**
             * Method to show valuation date error
             */
            _showValuationDateError: function () {
                MessageBox.error(this._oResourceBundle.getText("ValuationDateErrorMessage"));
            },

            /**
             * Calculate price press event handler.
             */
            handleCalculatePrice: function () {
                var dValuationDate = this.getView().getBindingContext().getProperty("ValDate");
                if (dValuationDate) {
                    this.getView().setBusy(true);

                    var oZSBCalPricePromise = this._getZSBCalPricePromise();
                    oZSBCalPricePromise
                        .then(function () {
                            this.oZsbComponentGridSmartTable.rebindTable();
                            this.getView().getModel().refresh();
                        }.bind(this))
                        .catch(function (oError) {
                            this._showErrorMessageBox(JSON.parse(oError.responseText));
                        }.bind(this))
                        .finally(function () {
                            this.getView().setBusy(false);
                        }.bind(this));
                } else {
                    this._showValuationDateError();
                }
            },

            /**
             * Method to call function import to calculate prices
             * @return {object} Promise Object of the function import
             * @private
             */
            _getZSBCalPricePromise: function () {
                var oModel = this.getView().getModel();
                var oObject = this.getView().getBindingContext().getObject();
                var sPlant = this.aSelectedPlants.join();
                var oZSBCalPricePromise = new Promise(function (resolve, reject) {
                    oModel.callFunction(Constants.FUNCTION_IMPORT.ZSB_CALCULATE_PRICE, {
                        method: "GET",
                        urlParameters: {
                            ValuationDate: oObject.ValDate,
                            Plant: sPlant,
                            Contract: oObject.CentralPurchaseContract,
                            ContractItem: oObject.CentralPurchaseContractItem,
                            MaterialZSB: oObject.PurchasingCentralMaterial,
                            DRAFTUUID: oObject.DraftUUID,
                            HdrDraftUUID: oObject.ParentDraftUUID
                        },
                        success: function (oData) {
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
                return oZSBCalPricePromise;
            },

            /**
             * Take Over ZSBCondtions event handler.
             */
            handleTakeOverZSBConditions: function () {
                var dValuationDate = this.getView().getBindingContext().getProperty("ValDate");
                if (dValuationDate) {
                    this.getView().setBusy(true);

                    var oZSBTakeOverPromise = this._getZSBTakeOverPromise();
                    oZSBTakeOverPromise
                        .then(function () {
                            this.oZsbComponentGridSmartTable.rebindTable();
                            this.getView().getModel().refresh();
                            //As part of BCP 710226 on success of FI call we are refreshing the conditions facet and opening the success message box
                            this.refreshConditionFacet();                            
                            MessageBox.success(this._oCntrlPCItemResourceBundle.getText("ZSBLAWConditionsCreateSuccessMsg"));
                        }.bind(this))
                        .catch(function (oError) {
                            this._showErrorMessageBox(JSON.parse(oError.responseText));
                        }.bind(this))
                        .finally(function () {
                            this.getView().setBusy(false);
                        }.bind(this));
                } else {
                    this._showValuationDateError();
                }
            },

            /**
             * Method to call function import to Take over ZSB Conditions
             * @return {object} Promise Object of the function import
             * @private
             */
            _getZSBTakeOverPromise: function () {
                var oModel = this.getView().getModel();
                var oObject = this.getView().getBindingContext().getObject();
                var sPlant = this.aSelectedPlants.join();
                var oZSBTakeOverPromise = new Promise(function (resolve, reject) {
                    oModel.callFunction(Constants.FUNCTION_IMPORT.CREATE_ZSB_COND, {
                        method: "GET",
                        urlParameters: {
                            Contract: oObject.CentralPurchaseContract,
                            ContractItem: oObject.CentralPurchaseContractItem,
                            Plant: sPlant,
                            DRAFTUUID: oObject.DraftUUID,
                            HdrDraftUUID: oObject.ParentDraftUUID,
                            ValuationDate: oObject.ValDate
                        },
                        success: function (oData) {
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
                return oZSBTakeOverPromise;
            },

            /**
             * Method to get Popover data.
             * @param {string} sId id of info icon
             * @return {object} oPopoverData with title and content of the popover
             * @public
             */
            getPopoverData: function (sId) {
                var oBindingContextObject = this.getView().getBindingContext().getObject();
                var oPopoverData = {
                    sTitle: "",
                    sContent: ""
                };
                if (sId === this.sPayTermsId || sId === this.sHierPayTermsId || sId === this.sItmDistPayTermsId || sId === this.sHdrDistPayTermsId ||
                    sId === this.sHierItmDistPayTermsId ||
                    sId === this.sHierHdrDistPayTermsId) {
                    oPopoverData = {
                        sTitle: this._oCntrlPCItemResourceBundle.getText("PaymentTerms") + " " + oBindingContextObject.PaymentTerms,
                        sContent: oBindingContextObject.PayTermFullText
                    };
                } else if (sId === this.sIncotermId || sId === this.sHierIncotermId || sId === this.sItmDistIncotermId || sId === this.sHdrDistIncotermId ||
                    sId === this.sHierItmDistIncotermId ||
                    sId === this.sHierHdrDistIncotermId || sId === this.sItmIncotermId || sId === this.sHierItmIncotermId) {
                    oPopoverData = {
                        sTitle: this._oCntrlPCItemResourceBundle.getText("Incoterm") + " " + oBindingContextObject.IncotermsClassification,
                        sContent: oBindingContextObject.IncoTermFullText
                    };
                } else {
                    oPopoverData = {
                        sTitle: this._oCntrlPCItemResourceBundle.getText("ShippIns") + " " + oBindingContextObject.ShippingInstruction,
                        sContent: oBindingContextObject.ShipInsFullText
                    };
                }
                return oPopoverData;
            },

            /**
             * Method to display LongText Popover 
             * @param {sap.ui.base.Event} oEvent The event object
             * @public
             */
            handlePreviewButtonClick: function (oEvent) {
                var sId = oEvent.getSource().getId();
                var oPopoverData = this.getPopoverData(sId);
                var oPreviewBtn = oEvent.getSource();
                if (!this.oLongTextPopover) {
                    this.oLongTextPopover = Fragment.load({
                        name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.LongTextPopover",
                        controller: this
                    }).then(function (oLngTextPopover) {
                        this.getView().addDependent(oLngTextPopover);
                        return oLngTextPopover;
                    }.bind(this));
                }
                this.oLongTextPopover.then(function (oLngTextPopover) {
                    oLngTextPopover.setProperty("title", oPopoverData.sTitle);
                    oLngTextPopover.removeContent(0);
                    oLngTextPopover.insertContent(new FormattedText("", {
                        htmlText: oPopoverData.sContent
                    }));
                    oLngTextPopover.openBy(oPreviewBtn);
                });
            },

            /**
             * Find Contracts press event handler
             * @public
             */
            handleFindContracts: function () {
                var dValuationDate = this.getView().getBindingContext().getProperty("ValDate");
                if (dValuationDate) {
                    var oZSBFindContractsPromise = this._getZSBFindContractsPromise("");
                    oZSBFindContractsPromise.then(function (oResponse) {
                        if (oResponse.ShowPopup) {
                            Fragment.load({
                                id: "idFindContractsDialog",
                                name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.FindContractsDialog",
                                controller: this
                            }).then(function (oDialog) {
                                this._oFindContractsDialog = oDialog;

                                this._oFindContractsIconTabBar = Fragment.byId("idFindContractsDialog", "idFindContractsIconTabBar");
                                this._oFindContractsSmartTable = Fragment.byId("idFindContractsDialog", "idFindContractsSmartTable");
                                this._oFindContractsTaufungSmartTable = Fragment.byId("idFindContractsDialog", "idFindContractsTaufungSmartTable");
                                this._oFindContractsRoDSmartTable = Fragment.byId("idFindContractsDialog", "idFindContractsRoDSmartTable");

                                this.setFindContractsModels();

                                this.getView().addDependent(this._oFindContractsDialog);
                                this._oFindContractsDialog.open();
                            }.bind(this));
                        } else {
                            this.oZsbComponentGridSmartTable.rebindTable();
                            this.getView().getModel().refresh();
                        }
                    }.bind(this)).catch(function (oError) {
                        var oErrorResponseText = JSON.parse(oError.responseText);
                        if (oErrorResponseText.error.code === Constants.ZSB_ERROR_CODES.FIND_CONTRACTS) {
                            this._showCostDeletionWarning(false, oErrorResponseText.error.message.value);
                        }
                    }.bind(this));
                } else {
                    this._showValuationDateError();
                }
            },

            /**
             * Method to show warning message to user in case different supplier
             * @param {boolean} bFindContractDialog - determines if call is from FI or Find Contract Popup
             * @param {string} sMessage - Warning message title received from BE
             * @private
             */
            _showCostDeletionWarning: function (bFindContractDialog, sMessage) {
                MessageBox.warning(sMessage, {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: this._deleteCosts.bind(this, bFindContractDialog)
                });
            },

            /**
             * Method to delete costs
             * @param {boolean} bFindContractDialog - determines if call is from FI or Find Contract Popup
             * @param {string} sAction - user action value
             * @private
             */
            _deleteCosts: function (bFindContractDialog, sAction) {
                if (sAction === MessageBox.Action.OK) {
                    if (bFindContractDialog) {
                        var oZSBFindContractsPostCallPromise = this._getFindContractsPostCallPromise("X");
                        oZSBFindContractsPostCallPromise.then(function () {
                            this.onFindContractsDialogCancel();
                            this.oZsbComponentGridSmartTable.rebindTable();
                            this.getView().getModel().refresh();
                        }.bind(this)).catch(function (oError) {
                            this._showErrorMessageBox(JSON.parse(oError.responseText));
                        }.bind(this));
                    } else {
                        var oZSBFindContractsPromise = this._getZSBFindContractsPromise("X");
                        oZSBFindContractsPromise.then(function () {
                            this.oZsbComponentGridSmartTable.rebindTable();
                            this.getView().getModel().refresh();
                        }.bind(this)).catch(function (oError) {
                            this._showErrorMessageBox(JSON.parse(oError.responseText));
                        }.bind(this));
                    }
                }
            },

            /**
             * Method to intial Find Contracts Model
             * @public
             */
            setFindContractsModels: function () {
                var oi18nModel = this.getView().getModel(
                    "i18n|sap.suite.ui.generic.template.ObjectPage|C_CntrlPurchaseContractItemTP");
                this._oFindContractsDialog.setModel(oi18nModel, "i18n");
                var oFindContractsModel = new JSONModel({
                    isConfirmEnabled: false,
                    isFirstTimeOpen: true,
                    selectedMultipleContracts: [],
                    selectedNoContracts: [],
                    infoLabel: oi18nModel.getProperty("SingleContractInfoLabel"),
                    selectedTabKey: Constants.TAB_KEYS.MULTIPLE
                });
                this._oFindContractsDialog.setModel(oFindContractsModel, "findContracts");
            },

            /**
             * Return "findContracts" local JSON model assigned to the Find Contracts dialog.
             * @return {sap.ui.model.json.JSONModel} "findContracts" json model
             * @public
             */
            getFindContractsModel: function () {
                return this._oFindContractsDialog.getModel("findContracts");
            },

            /**
             * Event handle for selection change on table
             * @param {sap.ui.base.Event} oEvent - event object
             * @public
             */
            onTableSelectionChange: function (oEvent) {
                var oEventParams = oEvent.getParameters();
                var bIsSelectAll = oEventParams.selectAll;
                var oModel = this.getFindContractsModel();

                // true if the "Multiple Contracts" tab is selected
                var bIsMultipleSelected = oModel.getProperty("/selectedTabKey") === Constants.TAB_KEYS.MULTIPLE;
                // true if the "No Contract" tab is selected
                var bIsNoContractSelected = oModel.getProperty("/selectedTabKey") === Constants.TAB_KEYS.ROD;
                var sSelectedContractsProp = bIsMultipleSelected ? "/selectedMultipleContracts" : "/selectedNoContracts";
                var aSelectedContracts = oModel.getProperty(sSelectedContractsProp);

                if (bIsSelectAll) {
                    oEvent.preventDefault();
                }

                oModel.setProperty(sSelectedContractsProp, aSelectedContracts);
                if (bIsMultipleSelected) {
                    this._checkSelectionRules(oEventParams.listItems, bIsSelectAll);
                } else if (bIsNoContractSelected) {
                    this._updateSelectedFindContracts(aSelectedContracts, oEventParams.listItems);
                }
            },

            /**
             * Return all items from Find Contracts table.
             * @param {sap.m.Table} oTable - inner Find Contracts responsive table
             * @param {boolean} bIsMultipleSelected - true, if "Multiple" tab is selected
             * @return {array} items array: id, group, data
             * @private
             */
            _getAllSelectedContractsData: function (oTable, bIsMultipleSelected) {
                return oTable.getItems().reduce(function (aResult, oItem) {
                    var sSelectedItemGroup = oItem.getGroupAnnouncement();
                    // consider selected items in 'Multiple Contracts' (except group items) and all items in 'No Contracts'
                    if (bIsMultipleSelected && sSelectedItemGroup || !bIsMultipleSelected) {
                        this._pushSelectedItemData(oItem, aResult);
                    }
                    return aResult;
                }.bind(this), []);
            },

            /**
             * Add new selected contracts to json model in case it's selected 
             * or remove contract in case it's unselected.
             * @param {object[]} aModelSelContracts - selected contracts array from model
             * @param {object[]} aNewSelConracts - new selected contracts array
             * @param {boolean} bIsSelectAll - true, if selectAll property is true
             * @private
             */
            _updateSelectedFindContracts: function (aModelSelContracts, aNewSelConracts, bIsSelectAll) {
                aNewSelConracts.forEach(function (oSelectedItem) {
                    var iIndex = aModelSelContracts.findIndex(function (oSelectedContract) {
                        return oSelectedContract.id === oSelectedItem.getId();
                    });
                    if (!~iIndex && !bIsSelectAll) {
                        oSelectedItem.setSelected(true);
                        this._pushSelectedItemData(oSelectedItem, aModelSelContracts);
                    } else if (~iIndex && !bIsSelectAll) {
                        oSelectedItem.setSelected(false);
                        aModelSelContracts.splice(iIndex, 1); // remove one contract from iIndex position
                    } else if (!~iIndex && bIsSelectAll) {
                        oSelectedItem.setSelected(false);
                    }
                }, this);
            },

            /**
             * Push the config for selected item to the array.
             * @param {sap.ui.core.ListItem} oSelectedItem - selected contract item
             * @param {array} aSelectedContracts - selected contracts array
             * @private
             */
            _pushSelectedItemData: function (oSelectedItem, aSelectedContracts) {
                var sSelectedItemGroup = oSelectedItem.getGroupAnnouncement();
                var sSelectedContractId = oSelectedItem.getId();
                var oSelectedListItemData = oSelectedItem.getBindingContext().getObject();
                aSelectedContracts.push({
                    id: sSelectedContractId,
                    group: sSelectedItemGroup,
                    data: oSelectedListItemData
                });
            },

            /**
             * Method to check selection rules.
             * @param {array} aNewSelectedItems - new selected contracts array
             * @param {boolean} bIsSelectAll - true, if selectAll property is true
             * @private
             */
            _checkSelectionRules: function (aNewSelectedItems, bIsSelectAll) {
                var aUpdatedItems = aNewSelectedItems.slice();
                var oModel = this.getFindContractsModel();
                var oi18nModel = this._oFindContractsDialog.getModel("i18n");
                var aSelectedContracts = oModel.getProperty("/selectedMultipleContracts");
                var aAllMultipleContracts = oModel.getProperty("/allMultipleContracts");

                var oGroupCount = {};
                var bIsConfirmEnabled = true;
                var bIsSelectionCorrect = true;

                this._updateSelectedFindContracts(aSelectedContracts, aNewSelectedItems, bIsSelectAll);

                // fill oGroupCount object with info {groupName: numberOfSelectedContracts}
                aSelectedContracts.forEach(function (oSelectedItemConfig) {
                    var sGroupName = oSelectedItemConfig.group;
                    oGroupCount[sGroupName] = oGroupCount[sGroupName] === undefined ? 1 : ++oGroupCount[sGroupName];
                });

                // how many groups have selected contracts
                var iSelectedGroups = Object.getOwnPropertyNames(oGroupCount).length;

                if (!aAllMultipleContracts.length) {
                    // if there is no data in Multiple tab
                    bIsSelectionCorrect = true;
                    bIsConfirmEnabled = true;
                } else if (iSelectedGroups && this.getFindContractsMultipleGroups().length === iSelectedGroups) {
                    // if each group has at least one selected contract
                    for (var sGroup in oGroupCount) {
                        // if the group has more than one selected contract - show warning msg
                        if (oGroupCount[sGroup] > 1) {
                            bIsSelectionCorrect = false;
                            break;
                        }
                    }
                } else {
                    // if at least one group doesn't have selected contract
                    bIsSelectionCorrect = false;
                    bIsConfirmEnabled = false;
                    aUpdatedItems = [];
                }

                if (bIsSelectAll) {
                    // not to allow selectAll action, show warning msg
                    bIsSelectionCorrect = false;
                    aUpdatedItems = [];
                }

                oModel.setProperty("/isSelectionCorrect", bIsSelectionCorrect);
                oModel.setProperty("/isConfirmEnabled", bIsConfirmEnabled);

                if (!bIsSelectionCorrect) {
                    MessageBox.warning(oi18nModel.getProperty("SelectContractsWarningMsg"));
                    this._updateSelectedFindContracts(aSelectedContracts, aUpdatedItems, bIsSelectAll);
                }
            },

            /**
             * Tab Selection handler for IconTabBar in Find Contracts Dialog
             * @param {sap.ui.base.Event} oEvent - event object
             * @public
             */
            onFindContractsTabSelection: function (oEvent) {
                var oFindContractsModel = this.getFindContractsModel();
                var oi18nModel = this._oFindContractsDialog.getModel("i18n");
                switch (oEvent.getParameter("selectedKey")) {
                    case "02":
                        oFindContractsModel.setProperty("/infoLabel", oi18nModel.getProperty("MultipleContractsInfoLabel"));
                        break;
                    case "01":
                        oFindContractsModel.setProperty("/infoLabel", oi18nModel.getProperty("SingleContractInfoLabel"));
                        break;
                    case "03":
                        oFindContractsModel.setProperty("/infoLabel", oi18nModel.getProperty("UOMMismatchInfoLabel"));
                        break;
                    case "04":
                        oFindContractsModel.setProperty("/infoLabel", oi18nModel.getProperty("NoContractInfoLabel"));
                        break;
                    default:
                        break;
                }
                this._oFindContractsSmartTable.rebindTable();
                if (this._oFindContractsIconTabBar.getSelectedKey() === Constants.TAB_KEYS.ROD) {
                    this._oFindContractsTaufungSmartTable.rebindTable();
                    this._oFindContractsRoDSmartTable.rebindTable();
                }
            },

            /**
             * Initialisation method for smart table to bind path
             * @public
             */
            onInitialiseFindContractsSmartTable: function () {
                var sUrlPath = this._getFindContractsSmartTableBindingPath();
                this._oFindContractsSmartTable.setTableBindingPath(sUrlPath);
                this._oFindContractsSmartTable.rebindTable();

                this._oFindContractsTaufungSmartTable.setTableBindingPath(sUrlPath);
                this._oFindContractsRoDSmartTable.setTableBindingPath(sUrlPath);
                this._oFindContractsTaufungSmartTable.rebindTable();
                this._oFindContractsRoDSmartTable.rebindTable();

            },

            /**
             * Method to get smart table binding path
             * @return {String} binding path for the smart table
             * @private
             */
            _getFindContractsSmartTableBindingPath: function () {
                var oBindingContext = this.getView().getBindingContext();
                var sItemDraftUUID = oBindingContext.getProperty("DraftUUID");
                var dValuationDate = oBindingContext.getProperty("ValDate");
                var oFormat = DateFormat.getDateTimeInstance({
                    pattern: "yyyy-MM-ddTHH%3Amm%3Ass"
                });
                dValuationDate = oFormat.format(dValuationDate);
                return "/" + Constants.ENTITYSET.ZSB_FIND_CONTRACTS + "(p_draftuuid=guid'" + sItemDraftUUID +
                    "',p_valuationdate=datetime'" + dValuationDate + "')/Set";
            },

            /**
             * On beforeRebind table method for smart table in Find Contracts Dialog
             * @param {sap.ui.base.Event} oEvent - event object
             * @public
             */
            onFindContractsRebindTable: function (oEvent) {
                var aFindContractsFilter = this._createFindContractsFilters(this._oFindContractsIconTabBar.getSelectedKey());
                this.updateFindContractsBindingParameters(oEvent, aFindContractsFilter);
            },

            /**
             * Method to update find contracts binding parameters
             * @param {sap.ui.base.Event} oEvent - event object
             * @param {sap.ui.model.Filter[]} aFindContractsFilter - filter parameter
             * @public
             */
            updateFindContractsBindingParameters: function (oEvent, aFindContractsFilter) {
                var aFilter = new Filter({
                    filters: aFindContractsFilter
                });
                var oInternalMaterialTableBindingParameters = oEvent.getParameter("bindingParams");
                if (aFilter && aFilter.aFilters && aFilter.aFilters.length) {
                    if (oInternalMaterialTableBindingParameters) {
                        oInternalMaterialTableBindingParameters.filters.push(aFilter);
                    }
                }
                var sMultipleFindContractTableId = oEvent.getParameter("id");
                if (this._oFindContractsIconTabBar.getSelectedKey() === Constants.TAB_KEYS.MULTIPLE && sMultipleFindContractTableId.includes("idFindContractsSmartTable")) {
                    oInternalMaterialTableBindingParameters.sorter.push(this._getMultipleContractsSorter());
                }
            },

            /**
             * On beforeRebind table method for Taufung smart table in Find Contracts Dialog
             * @param {sap.ui.base.Event} oEvent - event object
             * @public
             */
            onFindContractsTaufungRebindTable: function (oEvent) {
                var aFindContractsFilter = this._createFindContractsFilters(Constants.QUALIFIER.TAUFUNG);
                this.updateFindContractsBindingParameters(oEvent, aFindContractsFilter);
            },

            /**
             * On beforeRebind table method for RoD smart table in Find Contracts Dialog
             * @param {sap.ui.base.Event} oEvent - event object
             */
            onFindContractsRodRebindTable: function (oEvent) {
                var aFindContractsFilter = this._createFindContractsFilters(Constants.QUALIFIER.ROD);
                this.updateFindContractsBindingParameters(oEvent, aFindContractsFilter);
            },

            /**
             * On update finished table event handler in Find Contracts Dialog.
             * @param {sap.ui.base.Event} oEvent - event object
             */
            onFindContractsUpdateFinished: function (oEvent) {
                var aSelectedItems = [];
                var oTable = oEvent.getSource();
                var aTableItems = oTable.getItems();

                var oFindContractsModel = this.getFindContractsModel();
                var sCurTab = oFindContractsModel.getProperty("/selectedTabKey");

                var oConfig = {
                    "02": {
                        allItemsProp: Constants.FIND_CONTRACT_CONFIG.ALL_MULTIPLE_CONTRACTS,
                        modelProp: Constants.FIND_CONTRACT_CONFIG.SELECTED_MULTIPLE_CONTRACTS
                    },
                    "04": {
                        allItemsProp: Constants.FIND_CONTRACT_CONFIG.ALL_NO_CONTRACTS,
                        modelProp: Constants.FIND_CONTRACT_CONFIG.SELECTED_NO_CONTRACTS
                    }
                };
                if (sCurTab === Constants.TAB_KEYS.MULTIPLE || sCurTab === Constants.TAB_KEYS.ROD) {
                    aSelectedItems = oFindContractsModel.getProperty(oConfig[sCurTab].modelProp);
                    oFindContractsModel.setProperty(oConfig[sCurTab].allItemsProp, aTableItems);
                    if (aSelectedItems.length) {
                        aSelectedItems.forEach(function (oSelectedItem) {
                            oTable.setSelectedItemById(oSelectedItem.id);
                        });
                    } else {
                        if (oFindContractsModel.getProperty("/isFirstTimeOpen")) {
                            oFindContractsModel.setProperty("/isFirstTimeOpen", false);

                            aTableItems.forEach(function (oSelectedItem) {
                                if (oSelectedItem.getBindingContext().getProperty("Selected")) {
                                    oTable.setSelectedItem(oSelectedItem);
                                    this._updateSelectedFindContracts(aSelectedItems, [oSelectedItem]);
                                }
                            }, this);
                        }
                    }

                }
            },

            /**
             * Method to create filters to apply on Find Contracts Dialog smart table
             * @param {string} sQualifierValue - qualifier value
             * @return {array} aFilter - array of generated filters
             */
            _createFindContractsFilters: function (sQualifierValue) {
                var aFilter = [];
                var oFindContractsFilter = new Filter({
                    path: "Qualifier",
                    operator: FilterOperator.EQ,
                    value1: sQualifierValue
                });
                aFilter.push(oFindContractsFilter);
                return aFilter;
            },

            /**
             * Sorter method for multiple contracts table
             * @return {object} sorted object
             */
            _getMultipleContractsSorter: function () {
                var oI18nContractItemModel = this.getView().getModel(
                    "i18n|sap.suite.ui.generic.template.ObjectPage|C_CntrlPurchaseContractItemTP");
                var fnGroup = function (oCtx) {
                    var oGroup = {
                        key: oCtx.getObject("Plant") + oCtx.getObject("Material"),
                        text: oI18nContractItemModel.getProperty("Material") + ": " + oCtx.getObject("Material") + " - " +
                            oI18nContractItemModel.getProperty("Plant") + ": " + oCtx.getObject("Plant")
                    };
                    this.setFindContractsMultipleGroups(oGroup);
                    return oGroup;
                };
                return new Sorter("Plant", true, fnGroup.bind(this));
            },

            /**
             * Method to set groups for Multiple contracts Tab
             * @param {object} oGroup - group
             */
            setFindContractsMultipleGroups: function (oGroup) {
                var oFindContractsModel = this.getFindContractsModel();
                var aGroups = oFindContractsModel.getProperty("/groups") || [];

                var iIndex = aGroups.indexOf(oGroup.key);
                if (!~iIndex) {
                    aGroups.push(oGroup.key);
                }
                oFindContractsModel.setProperty("/groups", aGroups);
            },

            /**
             * Method to get groups of Multiple contracts Tab
             * @return {object} OGroup - group
             */
            getFindContractsMultipleGroups: function () {
                var oFindContractsModel = this.getFindContractsModel();
                return oFindContractsModel.getProperty("/groups");
            },

            /**
             * Handler method for Confirm button click of Find Contracts Dialog
             */
            onFindContractsDialogConfirm: function () {
                var oi18nModel = this._oFindContractsDialog.getModel("i18n");
                var aSelectedMultipleContracts = this.getFindContractsModel().getProperty("/selectedMultipleContracts");
                var bIsMultipleContractsSelected = aSelectedMultipleContracts && !!aSelectedMultipleContracts.length;
                var aAllMultipleContracts = this.getFindContractsModel().getProperty("/allMultipleContracts") || [];

                // Contracts in Multiple tab has data no contracts were not selected
                if (aAllMultipleContracts.length > 0 && !bIsMultipleContractsSelected) {
                    MessageBox.warning(oi18nModel.getProperty("NoSelectedContractsWarningMsg"));
                    return;
                }

                if (aAllMultipleContracts.length > 0 && bIsMultipleContractsSelected) {
                    // If user opens dialog and doesn't make any selections, the current state should be checked
                    this._checkSelectionRules([]);
                } else {
                    this.getFindContractsModel().setProperty("/isConfirmEnabled", true);
                    this.getFindContractsModel().setProperty("/isSelectionCorrect", true);
                }

                var bIsConfirmEnabled = this.getFindContractsModel().getProperty("/isConfirmEnabled");
                var bIsSelectionCorrect = this.getFindContractsModel().getProperty("/isSelectionCorrect");

                if (!bIsConfirmEnabled && bIsSelectionCorrect) {
                    MessageBox.warning(oi18nModel.getProperty("SelectContractsWarningMsg"));
                } else if (bIsConfirmEnabled && bIsSelectionCorrect) {
                    this.getView().setBusy(true);

                    var oZSBFindContractsPostCallPromise = this._getFindContractsPostCallPromise("");
                    oZSBFindContractsPostCallPromise
                        .then(function () {
                            this.onFindContractsDialogCancel();
                            this.oZsbComponentGridSmartTable.rebindTable();
                            this.getView().getModel().refresh();
                        }.bind(this))
                        .catch(function (oError) {
                            var oErrorResponseText = JSON.parse(oError.responseText);
                            if (oErrorResponseText.error.code === Constants.ZSB_ERROR_CODES.FIND_CONTRACTS) {
                                this._showCostDeletionWarning(true, oErrorResponseText.error.message.value);
                            }
                        }.bind(this))
                        .finally(function () {
                            this.getView().setBusy(false);
                        }.bind(this));
                }
            },

            /**
             * Method to get payload for Find Contracts Post Call
             * @param {string} sConfirmSupplier - value for CONFIRMSUPPLIER
             * @return {object} oPayload - Payload
             */
            _getFindContractsPostCallPayload: function (sConfirmSupplier) {
                var oFindContractsModel = this.getFindContractsModel();
                var oSelectedMultipleContracts = oFindContractsModel.getProperty("/selectedMultipleContracts");
                var oSelectedNoContracts = oFindContractsModel.getProperty("/selectedNoContracts");
                var aResults = [];
                oSelectedMultipleContracts.forEach(function (oSelectedItem) {
                    var oData = oSelectedItem.data;
                    var oPayloadData = {
                        "Material": oData.Material,
                        "Plant": oData.Plant,
                        "CentralContract": oData.Ebeln,
                        "CentralContractItem": oData.Ebelp,
                        "Supplier": oData.Supplier,
                        "SupplierPickup": oData.supplier_pickup,
                        "Quota": oData.Quota,
                        "Qualifier": "02"
                    };
                    aResults.push(oPayloadData);
                });
                oSelectedNoContracts.forEach(function (oSelectedItem) {
                    var oData = oSelectedItem.data;
                    var oPayloadData = {
                        "Material": oData.Material,
                        "Plant": oData.Plant,
                        "Qualifier": "04"
                    };
                    aResults.push(oPayloadData);
                });
                var oViewContextObject = this.getView().getBindingContext().getObject();
                var oPayload = {
                    "p_draftuuid": oViewContextObject.DraftUUID,
                    "p_valuationdate": oViewContextObject.ValDate,
                    "HdrDraftUUID": oViewContextObject.ParentDraftUUID,
                    "ZSBContractNo": oViewContextObject.CentralPurchaseContract,
                    "ZSBContractItem": oViewContextObject.CentralPurchaseContractItem,
                    "ConfirmSupplier": sConfirmSupplier,
                    "to_Zsb": {
                        "results": aResults
                    }
                };
                return oPayload;
            },

            /**
             * Method to trigger POST call to Find contracts
             * @param {string} sConfirmSupplier - value for CONFIRMSUPPLIER
             * @return {object} Promise Object of the Post call
             **/
            _getFindContractsPostCallPromise: function (sConfirmSupplier) {
                var oViewModel = this.getView().getModel();
                var oZSBFindContractsPostCallPromise = new Promise(function (resolve, reject) {
                    oViewModel.create(this._getFindContractsSmartTableBindingPath(), this._getFindContractsPostCallPayload(sConfirmSupplier), {
                        success: function (oData) {
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                }.bind(this));
                return oZSBFindContractsPostCallPromise;
            },

            /**
             * Handler method for Cancel button click of Find Contracts Dialog
             */
            onFindContractsDialogCancel: function () {
                this._oFindContractsDialog.close();
                this._oFindContractsDialog.destroy();
                this._oFindContractsDialog = null;
            },

            /**
             * Method to call function import to Find contracts
             * @param {string} sConfirmSupplier - value for CONFIRMSUPPLIER
             * @return {object} Promise Object of the function import
             **/
            _getZSBFindContractsPromise: function (sConfirmSupplier) {
                var oViewModel = this.getView().getModel();
                var oViewContextObject = this.getView().getBindingContext().getObject();
                var sPlant = this.aSelectedPlants.join();
                var oZSBFindContractsPromise = new Promise(function (resolve, reject) {
                    oViewModel.callFunction(Constants.FUNCTION_IMPORT.ZSB_FIND_CONTRACTS, {
                        method: "GET",
                        urlParameters: {
                            ValuationDate: oViewContextObject.ValDate,
                            Plant: sPlant,
                            Contract: oViewContextObject.CentralPurchaseContract,
                            ContractItem: oViewContextObject.CentralPurchaseContractItem,
                            MaterialZSB: oViewContextObject.PurchasingCentralMaterial,
                            DRAFTUUID: oViewContextObject.DraftUUID,
                            HdrDraftUUID: oViewContextObject.ParentDraftUUID,
                            CONFIRMSUPPLIER: sConfirmSupplier
                        },
                        success: function (oData) {
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
                return oZSBFindContractsPromise;
            },

            /**
             * Visible formatter for Alternative parts button
             * @param {string} sProcessIndicator Process Indicator Formatter
             * @return {boolean} visibility value
             */
            handleAlternatePartsVisibleFormatter: function (sProcessIndicator) {
                return sProcessIndicator === Constants.PROCESS_INDICATOR.PMATERIAL;
            },
            /**
             * Event handler for Alternative Parts button
             */
            handleAlternativePartCall: function () {
                var oHierObjectContext = this.getView().getBindingContext().getObject();
                var sSupplier = "";
                var sDraftGuid;
                if (this._sCurrentView === Constants.VIEW_ID.HIERARCHY_HEADER) {
                    sSupplier = oHierObjectContext.Supplier;
                }
                // On Header entity DraftUUID is taken on Item level ParentDraftUUID is taken 
                if (this._sCurrentView === Constants.VIEW_ID.HEADER || this._sCurrentView === Constants.VIEW_ID.HIERARCHY_HEADER) {
                    sDraftGuid = oHierObjectContext.DraftUUID;
                } else if (this._sCurrentView === Constants.VIEW_ID.ITEM || this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM) {
                    sDraftGuid = oHierObjectContext.ParentDraftUUID;
                }

                this.getView().getModel().callFunction(Constants.FUNCTION_IMPORT.ALTERNATIVE_PART_CTR, {
                    method: "GET",
                    urlParameters: {
                        "Supplier": sSupplier,
                        "Contract": oHierObjectContext.CentralPurchaseContract,
                        "DraftUUID": sDraftGuid
                    },
                    success: this.onAlternativePartsSuccesshandler.bind(this),
                    error: this.onAlternativePartsErrorhandler.bind(this)
                });
            },

            /*
             * on Success , Alternative Parts Success handler trigger header Entity refresh 
             */
            onAlternativePartsSuccesshandler: function () {
                var sSuccessMessage;
                if (this._sCurrentView === Constants.VIEW_ID.HIERARCHY_HEADER) {
                    sSuccessMessage = this._oResourceBundle.getText("AlternativePartsSuccessMsg");
                } else if (this._sCurrentView === Constants.VIEW_ID.HIERARCHY_ITEM) {
                    sSuccessMessage = this._oResourceBundle.getText("AlternativePartsItemSuccessMsg");
                }
                MessageBox.success(sSuccessMessage, {
                    actions: [MessageBox.Action.OK],
                    onClose: function (sButton) {
                        if (sButton === MessageBox.Action.OK) {
                            var oModel = this.getView().getModel();
                            var sURL = this.getView().getBindingContext().getPath();
                            oModel.read(sURL);
                        }
                    }.bind(this)
                });
            },
            /**
             * on Error , Alternative Parts Error handler
             * @param {object} oError - error message details
             */
            onAlternativePartsErrorhandler: function (oError) {
                try {
                    MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                } catch (e) {
                    MessageBox.error(this._oResourceBundle.getText("AlternativePartsErrorMsg"));
                }
            },

            /**
             * Open Alternative Parts popup and load data.
             * @param {sap.ui.base.Event} oEvent The event object
             */
            onAlternativePartsLinkPress: function (oEvent) {
                var oSourceLink = oEvent.getSource();
                var oDistributionLineCtx = oSourceLink.getBindingContext();
                this.oAlternativeParts.loadDialog()
                    .then(function () {
                        this.oAlternativeParts.setBusy(true);
                        return this.oAlternativeParts.loadAlternativeParts(oDistributionLineCtx, this._sCurrentView);
                    }.bind(this))
                    .then(function (oAlternativeParts) {
                        this.oAlternativeParts.setDialogData(oAlternativeParts);
                    }.bind(this))
                    .finally(function () {
                        this.oAlternativeParts.setBusy(false);
                    }.bind(this));
            },

            /**
             * Handle Edit of ZSB
             */
            handleZSBEdit: function () {
                this._attachZSBColumnTemplateInitialiseById("idManualExchangeRateColumnEditTable");
            },

            /**
             * Attach initialise column template event by column id.
             * @param {string} sColumnId Id for column template
             */
            _attachZSBColumnTemplateInitialiseById: function (sColumnId) {
                var oZSBSmartTable = Fragment.byId(this.sZsbGridFragmentId, "idZsbComponentSmartTableGrid");
                if (!oZSBSmartTable) {
                    return;
                }
                var aZSBColumns = oZSBSmartTable.getTable().getColumns();
                var oResColumn = aZSBColumns.find(function (oColumn) {
                    return !!~oColumn.getId().indexOf(sColumnId);
                });
                if (!oResColumn) {
                    return;
                }
                oResColumn.getTemplate().attachInitialise(this.onColumnTemplateInitialise.bind(this));
            },

            /**
             * Manual Exchange Rate column template initialise event handler.
             * @param {sap.ui.base.Event} oEvent initialise event object
             */
            onColumnTemplateInitialise: function (oEvent) {
                var sValue = oEvent.getSource().getValue();
                this._setEmptyDecimalFields(oEvent.getSource(), sValue);
            },

            /**
             * Set empty value to field in case of 0.
             * @param {sap.ui.core.Control} oControl ui control
             * @param {string} sValue control string value 
             * @private
             */
            _setEmptyDecimalFields: function (oControl, sValue) {
                var sNewValue = Formatter.formatDecimalEmptyValue(sValue);
                if (!sNewValue) {
                    oControl.setValue(null);
                }
            },

            /**
             * Event handler for ZSB components analytical table row selection changed
             */
            onZsbCompRowSelectionChanged: function () {
                var iSelectedIndices = this.oZsbComponentGridTable.getSelectedIndices(),
                    bEnableDeleteButton = this.getView().getModel("ui").getData().editable;
                if (iSelectedIndices.length && bEnableDeleteButton) {
                    this.getView().getModel("propertyModel").setProperty("/bDeleteLineBtnEnable", true);
                } else {
                    this.getView().getModel("propertyModel").setProperty("/bDeleteLineBtnEnable", false);
                }
            },

            /**
             * Event handler for deletion of entry from ZSB components table 
             */
            handleDeleteLine: function () {
                var iSelectedIndices = this.oZsbComponentGridTable.getSelectedIndices().length,
                    sDeleteConfirmationMessage = "";
                if (iSelectedIndices === 1) {
                    sDeleteConfirmationMessage = this._oResourceBundle.getText("DeleteLineConfirmationMessage");
                } else {
                    sDeleteConfirmationMessage = this._oResourceBundle.getText("DeleteLinesConfirmationMessage");
                }
                MessageBox.warning(sDeleteConfirmationMessage, {
                    title: this._oResourceBundle.getText("DeleteLine"),
                    actions: [this._oResourceBundle.getText("DeleteLine"), MessageBox.Action.CANCEL],
                    onClose: this.onCloseZsbDelRowPopup.bind(this)
                });
            },
            /**
             * Event handler for Creating Delta LAW Contracts in ZSB table 
             */
            handleCreateDeltaLAWContracts: function () {
                var aSelectedIndices = this.oZsbComponentGridTable.getSelectedIndices();
                if (aSelectedIndices.length > 0) {
                    this.getView().setBusy(true);
                    var oBindings = this.oZsbComponentGridTable.getBinding("rows"),
                    iExistingItems = oBindings.aKeys.length;
                    if (iExistingItems < aSelectedIndices.length) {
                        this._readExtraData().then(function (oData) {
                            this._CreateDeltaLawContract(aSelectedIndices, oData, iExistingItems);
                        }.bind(this));
                    } else {
                        this._CreateDeltaLawContract(aSelectedIndices);
                    }

                } else {
                    MessageBox.error(this._oResourceBundle.getText("ErrorMessageDeltaContract"), {
                        actions: [MessageBox.Action.OK]
                    });
                }
            },
            /**
             * Method to return promise for Odata read call
             * @returns {object} Promise object of Odata read to extra data
              */
            _readExtraData: function () {
                var oModel = this.getView().getModel();
                var oBindings = this.oZsbComponentGridTable.getBinding("rows"),
                    iExistingRows = oBindings.aKeys.length,
                    iAllItems = oBindings.iLength,
                    sPath = oBindings.oContext.sPath + "/" + oBindings.getPath();
                var aFilters = oBindings.oCombinedFilter.aFilters,
                    aSorters = oBindings.aSorters,
                    // eslint-disable-next-line
                    oCustomParams = { "$top": iAllItems - iExistingRows + 1, "$skip": iExistingRows, "$select": oBindings.mParameters["select"] };
                return new Promise(function (fnResolve, fnReject) {
                    oModel.read(sPath, {
                        filters: aFilters,
                        sorter: aSorters,
                        urlParameters: oCustomParams,
                        success: function (oData) {
                            fnResolve(oData);
                        },
                        error: function (oError) {
                            fnReject(oError);
                        }
                    });
                });
            },
            /**
             * Method for Create delta law contract function import
             * @param {array} aSelectedIndices Array of selected rows
             * @param {object} oData Odata resultset
             * @param {integer} iExistingAvailableRowCount count of Existing rows available with context
             */
            _CreateDeltaLawContract: function (aSelectedIndices, oData, iExistingAvailableRowCount) {
                var aSelectedRowObject = [];
                var aSelectedRowMaterial = [];
                var aSelectedRowLawIndicator = [];
                var aPlant = [];
                var oModel = this.getView().getModel();
                var iLength = oData ? iExistingAvailableRowCount : aSelectedIndices.length;
                for (var i = 0; i < iLength; i++) {
                    if (this.oZsbComponentGridTable.getContextByIndex(aSelectedIndices[i])) {
                        aSelectedRowObject.push(this.oZsbComponentGridTable.getContextByIndex(aSelectedIndices[i]).getObject());
                    }
                }
                if (oData) {
                    aSelectedRowObject = aSelectedRowObject.concat(oData.results);
                }
                var oZsbDataObject = this.getView().getBindingContext().getObject();
                for (var j = 0; j < aSelectedRowObject.length; j++) {
                    aSelectedRowMaterial.push(aSelectedRowObject[j].Material);
                    aSelectedRowLawIndicator.push(aSelectedRowObject[j].LawIndicator);
                    aPlant.push(aSelectedRowObject[j].Plant);
                }
                var sSelectedRowMaterial = aSelectedRowMaterial.join();
                var sSelectedRowLawIndicator = aSelectedRowLawIndicator.join();
                var sPlant = aPlant.join();
                oModel.callFunction(Constants.FUNCTION_IMPORT.CREATE_DELTA_CONTRACT, {
                    method: "GET",
                    urlParameters: {
                        "DRAFTUUID": oZsbDataObject.DraftUUID,
                        "HdrDraftUUID": oZsbDataObject.ParentDraftUUID,
                        "Material": sSelectedRowMaterial,
                        "SPlant": sPlant,
                        "LawIndicator": sSelectedRowLawIndicator,
                        "ZsbContract": oZsbDataObject.CentralPurchaseContract
                    },
                    success: this.handleDeltacreationSuccess.bind(this),
                    error: this.handleDeltacreationError.bind(this)
                });
            },
            /**
             * Event handler for Success of Delta LAW Contracts FI call
             * @param {object} oData - success result
             */
            handleDeltacreationSuccess: function () {
                this.getView().setBusy(false);
                this.getView().getModel().refresh();
            },
            /**
             * Event handler for Error of Delta LAW Contracts FI call
             * @param {object} oError - Error result
             */
            handleDeltacreationError: function (oError) {
                this.getView().setBusy(false);
                this.getView().getModel().refresh();
                try {
                    ReuseMessageBox.loadDialog(oError);
                } catch (e) {
                    MessageBox.error(this._oResourceBundle.getText("CreatingDeltaContractfail"));
                }
            },

            /**
             * Method for onClose action of Zsb delete row popup.
             * @param {sap.m.MessageBox.Action} oAction - provides selected action parameter
             */
            onCloseZsbDelRowPopup: function (oAction) {
                if (oAction === this._oResourceBundle.getText("DeleteLine")) {
                    this.getView().setBusy(true);
                    var aSelectedIndices = this.oZsbComponentGridTable.getSelectedIndices();
                    var oBindings = this.oZsbComponentGridTable.getBinding("rows");
                    var iExistingItems = oBindings.aKeys.length;
                    if (iExistingItems < aSelectedIndices.length) {
                        this._readExtraData().then(function (oData) {
                            this._deleteZsbContract(aSelectedIndices, oData, iExistingItems);
                        }.bind(this));
                    } else {
                        this._deleteZsbContract(aSelectedIndices);
                    }
                }
                this.oZsbComponentGridTable.clearSelection();

            },
            /**
             * Method for Delete ZSB contract on Del popup closure
             * @param {array} aSelectedIndices Selected objects of zsb table
             * @param {object} oData Odata resultset
             * @param {integer} iExistingItems Available Rows count
             */
            _deleteZsbContract: function (aSelectedIndices, oData, iExistingItems) {
                var aSelectedRowObject = [];
                var oModel = this.getView().getModel();
                var iLength = oData ? iExistingItems : aSelectedIndices.length;
                for (var i = 0; i < iLength; i++) {
                    if (this.oZsbComponentGridTable.getContextByIndex(aSelectedIndices[i])) {
                        aSelectedRowObject.push(this.oZsbComponentGridTable.getContextByIndex(aSelectedIndices[i]).getObject());
                    }
                }
                if (oData) {
                    aSelectedRowObject = aSelectedRowObject.concat(oData.results);
                }
                oModel.setDeferredGroups(["batchFunctionImport"]);
                for (var j = 0; j < aSelectedRowObject.length; j++) {
                    oModel.callFunction(Constants.FUNCTION_IMPORT.DELETE_ZSB_COMP, {
                        method: "POST",
                        batchGroupId: "batchFunctionImport",
                        urlParameters: {
                            "DraftUUID": this.getView().getBindingContext().getObject().DraftUUID,
                            "HdrDraftUUID": this.getView().getBindingContext().getObject().ParentDraftUUID,
                            "UniversalId": aSelectedRowObject[j].UniversalId
                        }
                    });
                }
                oModel.submitChanges({
                    batchGroupId: "batchFunctionImport",
                    success: this.handleDelZsbCompRowSuccess.bind(this),
                    error: this.handleDelZsbCompRowError.bind(this)
                });

            },

            /**
             * Event handler for Deletion of entry from ZSB components table functionality success
             * @param {object} oData - success result
             * @param {object} oResponse - success response
             */
            handleDelZsbCompRowSuccess: function (oData) {
                this.getView().setBusy(false);
                var oBatchResponse = oData.__batchResponses[0].__changeResponses;
                var sSuccessMessage = "";
                for (var i = 0; i < oBatchResponse.length; i++) {
                    sSuccessMessage = sSuccessMessage + oBatchResponse[i].data.results[0].Message + "\n";
                }
                MessageBox.success(sSuccessMessage, {
                    actions: [MessageBox.Action.OK]
                });
                this.getView().getModel().refresh();
                this.getView().getModel("propertyModel").setProperty("/bDeleteLineBtnEnable", false);
            },

            /**
             * Event handler for Deletion of entry from ZSB components table functionality error
             * @param {event} oError - error result
             */
            handleDelZsbCompRowError: function (oError) {
                this.getView().setBusy(false);
                if (oError.responseText) {
                    var sErrorMsg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(sErrorMsg);
                }
            },
            /**
             * Event handler for Opening Zsb Add line Manually Dialog
             * 
             */
            handleAddLineManually: function () {
                this._oZsbSmartForm = null;
                if (!this._oZsbAddLineManualuDialog) {
                    Fragment.load({
                        name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.ZsbAddLineManuallyDialog",
                        id: "idZsbAddlineManuallyFragment",
                        controller: this
                    }).then(function (oPopup) {
                        this._oZsbAddLineManualuDialog = oPopup;
                        this.getView().addDependent(this._oZsbAddLineManualuDialog);

                        var oDummyContext = {
                            Material: "",
                            MaterialDescription: "",
                            ResponsibleBuyer: "",
                            Taufung: "",
                            Plant: "",
                            CentralContract: "",
                            CentralContractItem: "",
                            Supplier: "",
                            SupplierPickup: "",
                            PriceCurrency: "",
                            MaterialZSB: "",
                            ValuationDate: "",
                            AmountPerZSBUom: "",
                            CentralContractNumber: "",
                            PriceExternal: "",
                            PricePrelogisticCurrency: "",
                            priceAddedCurrency: "",
                            PriceHandlingCurrency: ""
                        };

                        var oModel = this.getView().getModel();

                        oModel.setDeferredGroups(oModel.getDeferredGroups().concat(["idAddZsbGroup"]));
                        var oContext = oModel.createEntry("/xVWKSxNLP_CCTR_I_ZSB", {
                            "groupId": "idAddZsbGroup",
                            properties: oDummyContext,
                            success: function () { }
                        });
                        this._oZsbSmartForm = Fragment.byId("idZsbAddlineManuallyFragment", "idZsbAddManualForm");
                        this._oZsbSmartForm.setBindingContext(oContext);
                        this._oZsbAddLineManualuDialog.open();
                    }.bind(this));
                } else {
                    this._oZsbAddLineManualuDialog.open();
                }
            },
            /**
             * Event call on value help request for Zsb Plant field
             */
            onZsbPlantVH: function () {
                var sItemDraftUUID = this.getView().getBindingContext().getProperty("DraftUUID");
                Fragment.load({
                    name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.ZsbPlantVH",
                    controller: this
                }).then(function (oDialog) {
                    this.ZsbPlantVhDialog = oDialog;
                    this.getView().addDependent(this.ZsbPlantVhDialog);
                    var oColumnModel = this._getPlantValueHelpColumn();
                    var aColumnData = oColumnModel.getData().cols;
                    this.ZsbPlantVhDialog.getTableAsync().then(function (oTable) {
                        oTable.setModel(oColumnModel, "columns");
                        if (oTable.bindRows) {
                            oTable.bindAggregation("rows", {
                                path: "/xVWKSxNLP_CCTR_I_PLANT_VHSet",
                                filters: [new Filter("p_draftuuid", FilterOperator.EQ, sItemDraftUUID)]
                            });
                        }
                        if (oTable.bindItems) {
                            oTable.bindAggregation("items", "/xVWKSxNLP_CCTR_I_PLANT_VHSet", function () {
                                return new ColumnListItem({
                                    cells: aColumnData.map(function (column) {
                                        return new Label({ text: "{" + column.template + "}" });
                                    })
                                });
                            });
                        }
                        this.ZsbPlantVhDialog.update();
                    }.bind(this));
                    this.ZsbPlantVhDialog.open();
                }.bind(this));
            },

            /**
             * Return columns for ZSB Plant value help dialog table.
             * @returns {object} for editable state
             */
            _getPlantValueHelpColumn: function () {
                return new JSONModel({
                    cols: [
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/Plant/@sap:label}",
                            template: "Plant"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/PlantName/@sap:label}",
                            template: "PlantName"
                        }, {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/ValuationArea/@sap:label}",
                            template: "ValuationArea"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/PlantCustomer/@sap:label}",
                            template: "PlantCustomer"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/PlantSupplier/@sap:label}",
                            template: "PlantSupplier"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/FactoryCalendar/@sap:label}",
                            template: "FactoryCalendar"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/DefaultPurchasingOrganization/@sap:label}",
                            template: "DefaultPurchasingOrganization"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/SalesOrganization/@sap:label}",
                            template: "SalesOrganization"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/AddressID/@sap:label}",
                            template: "AddressID"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/PlantCategory/@sap:label}",
                            template: "PlantCategory"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/DistributionChannel/@sap:label}",
                            template: "DistributionChannel"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/Division/@sap:label}",
                            template: "Division"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/Language/@sap:label}",
                            template: "Language"
                        },
                        {
                            label: "{/#xVWKSxNLP_CCTR_I_PLANT_VHType/IsMarkedForArchiving/@sap:label}",
                            template: "IsMarkedForArchiving"
                        }
                    ]
                });
            },

            /**
             * Event handler on Ok press of Plant VH dialog
             * @param {sap.ui.base.Event} oEvent event object
             */
            onZsbPlantValueHelpOkPress: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");
                var oPlant = Fragment.byId("idZsbAddlineManuallyFragment", "idPlantValue");
                oPlant.setValue(aTokens[0].getKey());
                oPlant.setValueState(ValueState.None);
                this.ZsbPlantVhDialog.close();
            },
            /**
             * event handler on Cancel press of Plant VH dialog
             */
            onZsbPlantValueHelpCancelPress: function () {
                this.ZsbPlantVhDialog.close();

            },
            /**
             * event handler on close of Plant VH dialog
             */
            onZsbPlantValueHelpAfterClose: function () {
                this.ZsbPlantVhDialog.destroy();
            },
            /*
             * Event handler for Zsb Add line Dailog Close
             */
            handleAddLineManuallyDialogClose: function () {
                this._oZsbAddLineManualuDialog.close();
                this._oZsbAddLineManualuDialog.destroy();
                this._oZsbSmartForm = undefined;
                this._oZsbAddLineManualuDialog = undefined;
            },

            /*
             * Event handler Create Zsb New entry from Smart form
             */
            handleAddLineManuallyConfirmPress: function () {
                var oModel = this.getView().getModel();
                var oSmartFormObject = this._oZsbSmartForm.getBindingContext().getObject();
                var oHeaderObject = this.getView().getBindingContext().getObject();

                if (!this._bValidateAddLineManuallyFields()) {
                    MessageBox.error(this._oCntrlPCItemResourceBundle.getText("EnterValidValueMsg"));
                    return;
                }

                var oDataForEntry = {
                    Material: oSmartFormObject.Material,
                    MaterialDescription: oSmartFormObject.MaterialDescription,
                    ResponsibleBuyer: oSmartFormObject.ResponsibleBuyer,
                    AmountPerZSB: oSmartFormObject.AmountPerZSB,
                    AmountPerZSBUom: oSmartFormObject.AmountPerZSBUom,
                    Plant: oSmartFormObject.Plant,
                    CentralContract: oSmartFormObject.CentralContract,
                    CentralContractItem: oSmartFormObject.CentralContractItem,
                    MaterialZSB: oHeaderObject.PurchasingCentralMaterial, // Material from General Information
                    ZSBContractNo: oHeaderObject.CentralPurchaseContract,
                    ZSBContractItem: oHeaderObject.CentralPurchaseContractItem,
                    Supplier: oSmartFormObject.Supplier,
                    SupplierPickup: oSmartFormObject.SupplierPickup,
                    Taufung: oSmartFormObject.Taufung,
                    Price: oSmartFormObject.Price,
                    PriceCurrency: oSmartFormObject.PriceCurrency,
                    PricepercentageAddedValue: oSmartFormObject.PricepercentageAddedValue,
                    PricepercentageHandling: oSmartFormObject.PricepercentageHandling,
                    PricePreLogistic: oSmartFormObject.PricePreLogistic,
                    PricepercentagePreLogistic: oSmartFormObject.PricepercentagePreLogistic,
                    PriceAddedValue: oSmartFormObject.PriceAddedValue,
                    PriceHandling: oSmartFormObject.PriceHandling,
                    PricePrelogisticCurrency: oSmartFormObject.PricePrelogisticCurrency,
                    priceAddedCurrency: oSmartFormObject.priceAddedCurrency,
                    PriceHandlingCurrency: oSmartFormObject.PriceHandlingCurrency,
                    ConfirmDuplicate: "",
                    DraftUUID: oHeaderObject.DraftUUID,
                    HdrDraftUUID: oHeaderObject.ParentDraftUUID
                };

                oModel.create("/xVWKSxNLP_CCTR_I_ZSB", oDataForEntry, {
                    success: this.handleZsbAddManualSuccess.bind(this),
                    error: this.handleZsbAddManualError.bind(this)
                });

            },

            /**
             * Helper method for validating the fileds in ZSB Add Line Manually dialog 
             * @returns {boolean} if form fileds are valid it will return true else it will return false
             */
            _bValidateAddLineManuallyFields: function () {
                var bAddManuallyFormValid = true,
                    oSmartFormObject = this._oZsbSmartForm.getBindingContext().getObject(),
                    oMaterialField = Fragment.byId("idZsbAddlineManuallyFragment", "idMaterial"),
                    oPlant = Fragment.byId("idZsbAddlineManuallyFragment", "idPlantValue"),
                    oAmountPerZSBField = Fragment.byId("idZsbAddlineManuallyFragment", "idAmountPerZsb"),
                    oPriceField = Fragment.byId("idZsbAddlineManuallyFragment", "idPrice");
                if (!oSmartFormObject.Material) {
                    oMaterialField.bindProperty("valueState", {
                        value: ValueState.Error
                    });

                    bAddManuallyFormValid = false;
                }

                if (!oPlant.getValue()) {
                    oPlant.bindProperty("valueState", {
                        value: ValueState.Error
                    });
                    bAddManuallyFormValid = false;
                }

                if (parseFloat(oSmartFormObject.AmountPerZSB) > Constants.ZSB_ADD_MANUAL_SMARTFIELDS.AMOUNT_PER_ZSB_MAX_VALUE) {
                    oAmountPerZSBField.bindProperty("valueState", {
                        value: ValueState.Error
                    });
                    oAmountPerZSBField.bindProperty("valueStateText", {
                        value: this._oCntrlPCItemResourceBundle.getText("ErrorOnEBONAmountPerZSBField")
                    });

                    bAddManuallyFormValid = false;
                }

                if (parseFloat(oSmartFormObject.Price) > Constants.ZSB_ADD_MANUAL_SMARTFIELDS.PRICE_MAX_VALUE) {
                    oPriceField.bindProperty("valueState", {
                        value: ValueState.Error
                    });
                    oPriceField.bindProperty("valueStateText", {
                        value: this._oCntrlPCItemResourceBundle.getText("ErrorOnEBONPriceField")
                    });
                    bAddManuallyFormValid = false;
                }

                //In case of standard validation then we will show "Please Enter Valid Value popup"
                if (oAmountPerZSBField.getValueState() === "Error" || oPriceField.getValueState() === "Error") {
                    bAddManuallyFormValid = false;
                }

                return bAddManuallyFormValid;
            },

            /*
             * Event handler for Add Zsb line method Success
             */
            handleZsbAddManualSuccess: function () {
                this.handleAddLineManuallyDialogClose();
                this.oZsbComponentGridSmartTable.rebindTable();
                this.getView().getModel().refresh();
                // Add message toast 
                MessageToast.show(this._oResourceBundle.getText("ZsbTableAddLineSuccessMsg"));

            },

            /**
             * Event handler for Add Zsb line method Error 
             * @param {object} oErrorResponse Error Response
             */
            handleZsbAddManualError: function (oErrorResponse) {
                var iCount = oErrorResponse.responseText.search("VWKS/NLP_CCTR/198");
                if (iCount !== -1) {
                    var oErrorObject = JSON.parse(oErrorResponse.responseText).error.innererror.errordetails;
                    var sErrorMessage;
                    for (var iIndex in oErrorObject) {
                        if (oErrorObject[iIndex].code === "/VWKS/NLP_CCTR/198") {
                            sErrorMessage = oErrorObject[iIndex].message;
                            break;
                        }
                    }
                    MessageBox.error(sErrorMessage);
                    return;
                }
                if (oErrorResponse.responseText) {
                    MessageBox.error(JSON.parse(oErrorResponse.responseText).error.message.value);
                }
            },

            /**
             * handler method to create another duplicate Zsb line item
             */
            onConfirmCreateDuplicateZsbline: function () {
                var oModel = this.getView().getModel();
                var oSmartFormObject = this._oZsbSmartForm.getBindingContext().getObject();
                var oHeaderObject = this.getView().getBindingContext().getObject();
                var oDataForEntry = {
                    Material: oSmartFormObject.Material,
                    MaterialDescription: oSmartFormObject.MaterialDescription,
                    ResponsibleBuyer: oSmartFormObject.ResponsibleBuyer,
                    AmountPerZSB: oSmartFormObject.AmountPerZSB,
                    AmountPerZSBUom: oSmartFormObject.AmountPerZSBUom,
                    Plant: oSmartFormObject.Plant,
                    CentralContract: oSmartFormObject.CentralContract,
                    CentralContractItem: oSmartFormObject.CentralContractItem,
                    MaterialZSB: oHeaderObject.PurchasingCentralMaterial,
                    ZSBContractNo: oHeaderObject.CentralPurchaseContract,
                    ZSBContractItem: oHeaderObject.CentralPurchaseContractItem,
                    Supplier: oSmartFormObject.Supplier,
                    SupplierPickup: oSmartFormObject.SupplierPickup,
                    Taufung: oSmartFormObject.Taufung,
                    Price: oSmartFormObject.Price,
                    PriceCurrency: oSmartFormObject.PriceCurrency,
                    PricepercentageAddedValue: oSmartFormObject.PricepercentageAddedValue,
                    PricepercentageHandling: oSmartFormObject.PricepercentageHandling,
                    PricePreLogistic: oSmartFormObject.PricePreLogistic,
                    PricepercentagePreLogistic: oSmartFormObject.PricepercentagePreLogistic,
                    PriceAddedValue: oSmartFormObject.PriceAddedValue,
                    PriceHandling: oSmartFormObject.PriceHandling,
                    PricePrelogisticCurrency: oSmartFormObject.PricePrelogisticCurrency,
                    priceAddedCurrency: oSmartFormObject.priceAddedCurrency,
                    PriceHandlingCurrency: oSmartFormObject.PriceHandlingCurrency,
                    ConfirmDuplicate: "X",
                    DraftUUID: oHeaderObject.DraftUUID,
                    HdrDraftUUID: oHeaderObject.ParentDraftUUID
                };
                oModel.create("/xVWKSxNLP_CCTR_I_ZSB", oDataForEntry, {
                    success: this.handleZsbAddManualSuccess.bind(this),
                    error: function (oErrorResponse) {
                        this.handleAddLineManuallyDialogClose();
                        if (oErrorResponse.responseText) {
                            var oMessage = JSON.parse(oErrorResponse.responseText);
                            MessageBox.error(oMessage.error.message.value);
                        }
                    }.bind(this)
                });
            },

            /** 
             * Handler Method to "Workitem ID" Column click in P-Mat action items Smart Table
             * Opens navigation to P-mat in new tab with provided KeyLink
             * @param {sap.ui.base.Event} oEvent is the event generated
             */
            handlePmatKeyLinkPress: function (oEvent) {
                var sKeyLink = oEvent.getSource().getBindingContext().getProperty("KeyLink");
                this.handlePMatNavigation(sKeyLink);
            },

            /**
             * Event handler for navigation to PMat app
             * @param {string} sKeyLink KeyLink value
             */
            handlePMatNavigation: function (sKeyLink) {
                var sRequiredUrl = this.getView().getModel("PMAT").createKey("xVWKSxNLP_C_PMAT_COMMON_HDR", {
                    KeyLink: sKeyLink,
                    DraftUUID: ReuseConstants.INITIAL_GUID,
                    IsActiveEntity: true
                });
                //Navigate to PMAT
                NavigationHelper.getNavigationPath(this.getView().getController(), "PMAT", sRequiredUrl, null, false, false)
                    .then(function (oNavigationDetails) {
                        //Open in new window
                        NavigationHelper.navigateWithURLHelper(oNavigationDetails.sPath, true);
                    });
            },

            /**
             * ROD Document Number press event handler
             * @param {sap.ui.base.Event} oEvent event object
             */
            handleRodDocNumPress: function (oEvent) {
                var sRodDocNum = oEvent.getSource().getBindingContext().getProperty("RodDocumentNum");
                this.handlePMatNavigation(sRodDocNum);
            },

            /**
             * This method will be called to make read call to refresh Fixed TTO field
             * @public
             */
            refreshConditionFacet: function () {
                var oConditionsComponent = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurchaseContractItemTP--sap.cus.sd.lib.item.cndn.forSmartElements::item::C_CntrlPurContrItmCndnAmountTP:C_CntrlPurContrItmPrcSimln::ComponentContainer"
                );
                var oHierConditionsComponent = this.base.byId(
                    "ui.s2p.mm.pur.central.ctr.sts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_CntrlPurContrHierItemTP--sap.cus.sd.lib.item.cndn.forSmartElements::item::C_CPurConHierItmCndnAmountTP:C_CntrlPurContrItmPrcSimln::ComponentContainer"
                );
                if (oConditionsComponent) {
                    oConditionsComponent.getComponentInstance().load(true);
                }
                if (oHierConditionsComponent) {
                    oHierConditionsComponent.getComponentInstance().load(true);
                }
            },

            /**
             * Format editable state for percentage cost fields based on PaymentModel.
             * In case of 'Bailment' Payment Model - set disable.
             * @param {string} sPaymentModel Payment Model code
             * @returns {boolean} for editable state
             */
            formatPercentageCostEnableState: function (sPaymentModel) {
                return Formatter.formatPercentageCostEnableState(sPaymentModel);
            },

            /**
             * Payment Terms, Incoterms and Shipping Instructions change event handler.
             * @param {sap.ui.base.Event} oEvent change event
             */
            onInputChanged: function (oEvent) {
                var oModel = this.getView().getModel(),
                    oBindingObject = this.getView().getBindingContext().getObject(),
                    sChangedValue = oEvent.getParameters().value,
                    oSource = oEvent.getSource();
                this._sOriginalVaule = oSource.getProperty("value");
                oModel.callFunction(Constants.FUNCTION_IMPORT.VALIDATE_INPUT, {
                    method: "POST",
                    urlParameters: {
                        "DraftUUID": oBindingObject.DraftUUID,
                        "IncoTerm": !oBindingObject.IncotermsClassification ? "" : oBindingObject.IncotermsClassification,
                        "PaymentTerm": !oBindingObject.PaymentTerms ? "" : oBindingObject.PaymentTerms,
                        "ShippingInstruction": !oBindingObject.ShippingInstruction ? "" : oBindingObject.ShippingInstruction
                    },
                    success: function (oData) {
                        var bFlag = oData.Success,
                            oChangedControl = oSource,
                            //oEvent is not accessible inside success and without creating new variable, the previous values are also not accessible 
                            sNewValue = sChangedValue;
                        if (bFlag === "X") {
                            MessageBox.confirm(this._oResourceBundle.getText("OverwriteConfirmationMsg"), {
                                title: this._oResourceBundle.getText("Overwrite"),
                                actions: [this._oResourceBundle.getText("Overwrite"), MessageBox.Action.CANCEL],
                                onClose: function (sAction) {
                                    if (sAction === this._oResourceBundle.getText("Overwrite")) {
                                        //set new value
                                        oChangedControl.setValue(sNewValue);
                                    } else {
                                        //Retain original value
                                        oChangedControl.setValue(this._sOriginalVaule);
                                    }
                                }.bind(this)
                            });
                        } else if (bFlag === "0") {
                            //set new value
                            oChangedControl.setValue(sNewValue);
                        } else {
                            oChangedControl.setValue(this._sOriginalVaule);
                        }
                    }.bind(this),
                    error: function (oError) {
                        MessageBox.error(oError.message);
                    }
                });
            },

            /**
             * Method to handle PR Number/Item link press
             * @param {sap.ui.base.Event} oEvent - event object
             */
            handlePRNumLinkPress: function (oEvent) {
                var oBindingContextObject = oEvent.getSource().getBindingContext().getObject(),
                    sPRNumber = oBindingContextObject.PurchaseRequisition,
                    sPRItem = oBindingContextObject.PurchaseRequisitionItem,
                    sConnectedSystem = oBindingContextObject.ProcurementHubSourceSystem;

                var oParams = {
                    ProcmtHubPurchaseRequisition: sPRNumber,
                    ProcmtHubPurRequisitionItem: sPRItem,
                    ProcurementHubSourceSystem: sConnectedSystem
                };
                NavigationHelper.navigateToOutboundTarget(this.getView().getController(), "MPRC", oParams, true);
            },

            /**
             * Method to handle SourcingProject Item link press
             * @param {sap.ui.base.Event} oEvent - event object
             */
            handleSPNumLinkPress: function (oEvent) {
                var oBindingContextObject = oEvent.getSource().getBindingContext().getObject(),
                    sSPHeaderUUID = oBindingContextObject.SourcingProjectUUID,
                    sSPItemUUID = oBindingContextObject.SourcingProjectItemUUID,
                    bIsActiveEntity = oBindingContextObject.IsActiveEntity;

                var oParams = {
                    SourcingProjectItemUUID: sSPItemUUID,
                    SourcingProjectUUID: sSPHeaderUUID,
                    IsActiveEntity: bIsActiveEntity
                };
                NavigationHelper.navigateToOutboundTarget(this.getView().getController(), "SourcingProject", oParams, true);
            },

            /**
             * Before Rebind table Method for RMS Table to load data
             */
            onBeforeRebindRMSTable: function () {
                if (this._oRMSTableSmartTable) {
                    this._oRMSTableSmartTable.setModel(this.getView().getController().getOwnerComponent().getModel());
                    this._oRMSTableSmartTable.setEntitySet("xVWKSxNLP_CCTR_C_CCTR_MAN_RMS");
                }
                this.getView().getModel("propertyModel").setProperty("/bDeleteLineBtnEnable", this.getView().getModel("ui").getData().editable);
            },

            /**
             * Row Selection Handler for RMS table
             */
            onRMSSelectionChange: function () {
                if (!this._oRMSTableSmartTable) {
                    return;
                }
                if (this._oRMSTableSmartTable.getTable().getSelectedItems().length) {
                    this.getView().getModel("propertyModel").setProperty("/bManualRMSDeleteBtnEnable", true);
                } else {
                    this.getView().getModel("propertyModel").setProperty("/bManualRMSDeleteBtnEnable", false);
                }
                var bIsEditable = this.oUIModel.getProperty("/editable");
                if (bIsEditable) {
                    var aRMSRows = this._oRMSTableSmartTable.getTable().getItems();
                    var aPropertiesToValidate = [
                        "MatBasePrice",
                        "MatPriceUnit",
                        "ActMatPrice",
                        "ActMatPriceUnit"
                    ];
                    aPropertiesToValidate.forEach(function (sProperty) {
                        this._updateFieldValueState(aRMSRows, sProperty, sProperty, null, false, true);
                    }.bind(this));

                }
            },          

            /**
             * Condition Type Change
             *  @param {sap.ui.base.Event} oEvent - event object
             */
            onConditionTypeSuggestionSelect: function (oEvent) {
                if (oEvent && oEvent.getParameter("selectedRow")) {
                    var sConditionType = oEvent.getParameter("selectedRow").getBindingContext().getObject().ConditionType;
                    this.onConditionTypeSelected(sConditionType);
                    this.oCreateConditionsDialog.setBusy(true);
                }
            },

            /**
             * Helper function for getting Conditional Calculation Type based on selected Condition Type
             * @param {string} sConditionType - selected condition type
             */
            onConditionTypeSelected: function (sConditionType) {
                var oModel = this.getView().getModel();
                oModel.callFunction("/GetConditionCalcType", {
                    "method": "GET",
                    "urlParameters": {
                        ConditionType: sConditionType
                    },
                    "success": this.onConditionTypeSuccess.bind(this),
                    "error": this.onConditionTypeError.bind(this)
                });
            },

            /**
             * Success handler for condition type field change
             * @param {object} oData - success response
             */
            onConditionTypeSuccess: function (oData) {
                this.oCreateConditionsModel.setProperty("/conditionCalcType", oData.ConditionCalcType);
                this.oCreateConditionsDialog.setBusy(false);
            },

            /**
             * Error handler for condition type field change
             * @param {object} oErr - Error result
             */
            onConditionTypeError: function (oErr) {
                this.oCreateConditionsDialog.setBusy(false);
                if (oErr.responseText) {
                    var oMessage = JSON.parse(oErr.responseText);
                    MessageBox.error(oMessage.error.message.value);
                }
            },

            /**
             * Initialisation method for smart table in order to apply filters
             */
            onInitialiseInternalMaterialSmartTable: function () {
                this._oInternalMaterialValueHelpSmartTable.rebindTable();
            },

            /**
             * On beforeRebind table method for Material identification number value help smart table
             * @param {sap.ui.base.Event} oEvent - event object
             */
            onInternalMaterialRebindTable: function (oEvent) {
                var aCommodityFilter = this._createCommodityFilters();
                var aFilter = new Filter({
                    filters: aCommodityFilter
                });
                var oInternalMaterialTableBindingParameters = oEvent.getParameter("bindingParams");
                if (aFilter && aFilter.aFilters && aFilter.aFilters.length) {
                    if (oInternalMaterialTableBindingParameters) {
                        oInternalMaterialTableBindingParameters.filters.push(aFilter);
                    } else {
                        if (this._oInternalMaterialValueHelpSmartTable.getTable().getBinding("rows")) {
                            this._oInternalMaterialValueHelpSmartTable.getTable().getBinding("rows").filter([aFilter], FilterType.Application);
                        }
                    }
                }
            },

            /**
             *Method to create filters to apply on  Material identification number value help smart table
             * @return {array} aFilter - array of generated filters
             */
            _createCommodityFilters: function () {
                var aFilter = [];
                var sItemDraftUUID = this.getView().getBindingContext().getProperty("DraftUUID");
                var oCommodityFilter = new Filter({
                    path: "ItemGUID",
                    operator: FilterOperator.EQ,
                    value1: sItemDraftUUID
                });
                aFilter.push(oCommodityFilter);
                return aFilter;
            },

            /**
             * Handler method for OK button click of Material identification number value help
             */
            onInternalMaterialOK: function () {
                var oSelectedItem = this._oInternalMaterialValueHelpSmartTable.getTable().getSelectedItem();
                if (oSelectedItem) {
                    var oSelectedItemObject = oSelectedItem.getBindingContext().getObject();
                    var sPath = this._oInternalMaterialValueHelpBindingContext.getPath();
                    this._oInternalMaterialValueHelpBindingContext.getModel().setProperty(sPath + "/MaterialIdentNumber", oSelectedItemObject.CommodityName);
                    this._oInternalMaterialValueHelpBindingContext.getModel().setProperty(sPath + "/xvwksxnlp_valid_from", oSelectedItemObject.purgdoccmmdtyqtyvalidfromdate);
                    this._oInternalMaterialValueHelpBindingContext.getModel().setProperty(sPath + "/xvwksxnlp_valid_to", oSelectedItemObject.purgdoccmmdtyqtyvalidtodate);
                    this._oInternalMaterialValueHelpBindingContext.getModel().setProperty(sPath + "/OperatingWeight", oSelectedItemObject.commodityquantity);
                    this._oInternalMaterialValueHelpBindingContext.getModel().setProperty(sPath + "/OperatingWeightUom", oSelectedItemObject.commodityunit);
                    this._oInternalMaterialValueHelpBindingContext.getModel().setProperty(sPath + "/SequenceNo", oSelectedItemObject.purgdoccmmdtyqtysqntlnumber);
                    this._oInternalMaterialValueHelpBindingContext.getModel().setProperty(sPath + "/SteelPooling_FC", oSelectedItemObject.SteelPooling_FC);
                }
                this.onInternalMaterialClose();
            },

            /**
             * Handler method for Cancel button click of Material identification number value help
             */
            onInternalMaterialClose: function () {
                this._oInternalMaterialValueHelpSmartTable.getTable().removeSelections();
                this._oInternalMaterialValueHelpSmartFilterBar.setFilterData({}, true);
                this._oInternalMaterialValueHelpDialog.close();
            },

            /**
             * Output control rebind table handler 
             * @param {sap.ui.base.Event} oEvent - event object
             */
            _onBeforeRebindOutputControlTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                mBindingParams.events = {
                    "dataReceived": this._onDataReceivedOutputControl.bind(this)
                };

            },
            /**
             * This method finds the pdf button in each table row and enables them for EDI channel
             */
            _onDataReceivedOutputControl: function () {
                var sSwitchIDRegex = "buttonDisplay";
                var aOutputControlItems = this._oOutputControlSmartTable.getTable().getItems();
                for (var i = 0; i < aOutputControlItems.length; i++) {
                    var sChannel = aOutputControlItems[i].getBindingContext().getProperty("Channel");
                    if (sChannel === "EDI") {
                        aOutputControlItems[i].getCells().forEach(function (oCell) {
                            var sCellId = oCell.getId();
                            if (sCellId.includes(sSwitchIDRegex)) {
                                oCell.setEnabled(true);
                                return;
                            }
                        });
                    }
                }
            },
            /**
             * formatter method for  overall Quota  on item level Icon Status
             * @param {string} sQuotaStatus maintianed for Overal Quota
             * @return {string} Icon Source
             */
            getOveralQuotaIconFormatter: function (sQuotaStatus) {
                return Formatter.getOveralQuotaIconFormatter(sQuotaStatus);
            },
            /**
             * formatter method for Visible property overall Quota pop up on Distribution level 
             * @param {string} sQuotaStatus maintianed for Overal Quota
             * @return {string} Value State of the field
             */
            getOveralQuotaStatusFormatter: function (sQuotaStatus) {
                return Formatter.getOveralQuotaStatusFormatter(sQuotaStatus);
            },
            /**
             * formatter method for Brand Approval Status
             * @param {string} sValue Brand Approval Status
             * @return {string} Brand Approval State
             */
            formatStatusApproval: function (sValue) {
                return Formatter.statusApproval(sValue);
            },
            /**
            * formatter method for Brand Approval Status
            * @param {string} sValue Brand Approval Tooltip
            * @return {string} Brand Approval Tooltip
            */
            formatBrandStatusTooltip: function (sValue) {
                return Formatter.tooltipApproval(sValue, this._oHieHeaderi18nModelResourceBundle);
            },

            /**
           * formatter method for Brand Approval Status
           * @param {string} sValue Brand Approval Text
           * @return {string} Brand Approval Text
           */
            formatBrandStatusText: function (sValue) {
                return Formatter.textApproval(sValue, this._oHieHeaderi18nModelResourceBundle);
            },

            /**
             * formatter method for tooltip of the Overall Quota Item field 
             * @param {string} sQuotaFlag maintianed for Overal Quota
             * @returns {string} "" || formatter tooltip based on the Quota status
             */
            formatterOverallQuotaTooltip: function (sQuotaFlag) {
                if (sQuotaFlag) {
                    var oResourceBundle = this.getView().getModel("i18n|sap.suite.ui.generic.template.ObjectPage|C_CntrlPurchaseContractItemTP").getResourceBundle();
                    return Formatter.formatterOverallQuotaTooltip(sQuotaFlag, oResourceBundle);
                }
                return "";
            },
            /**
             * Payment Model change event handler.
             * @param {sap.ui.base.Event} oEvent change event
             */
            handlePaymentModelChange: function (oEvent) {
                var sPriceCurrency = oEvent.getSource().getBindingContext().getProperty("PriceCurrency");
                if (sPriceCurrency === "") {
                    sPriceCurrency = " ";
                }
                // change event is getting called twice and we need to ensure that popup is only shown if payment model value changes from anything other than '02' to '02'.
                if (oEvent.getSource().getValue() === Constants.BAILMENT_PAYMENT_MODEL_CODE && oEvent.getParameters().newValue === Constants.BAILMENT_PAYMENT_MODEL_CODE) {
                    MessageBox.information(this._oResourceBundle.getText("BailmentInfoMsg", sPriceCurrency));
                }
            },

            /**
             * BP Number press event handler.
             * To load BP Location popover.
             * @param {sap.ui.base.Event} oEvent press event object
             */
            onLocationPress: function (oEvent) {
                oEvent.preventDefault();
                ReuseLocationQuickView.load(oEvent.getSource());
            },

            /**
             * System Distribution table selection change.
             * @param {sap.ui.base.Event} oEvent press event object
             */
            handleSystemDistTableSelectionChange: function (oEvent) {
                var bRowSelected = oEvent.getParameter("selected");
                var aModifiedRows = oEvent.getParameter("listItems");
                if (!bRowSelected) {
                    aModifiedRows.forEach(function (oModifiedRow) {
                        if (oModifiedRow.getBindingContext().getProperty("LogicalSystemID") === Constants.LOGICAL_SYSTEM) {
                            MessageBox.error(this._oDistri18nModelResourceBundle.getText("DeselctionError"));
                            oEvent.getSource().setSelectedItem(oModifiedRow);
                        }
                    }.bind(this));
                }
            },

            /**
             * Opening Dialog for Skip LCM if Skip LCM Switch state is On else it will update with previous notes
             * @param {sap.ui.base.Event} oEvent press event object
             * @public
             */
            handleLcmSkipChange: function (oEvent) {
                var oSource = oEvent.getSource();
                var oViewContextObject = this.getView().getBindingContext().getObject();
                var oParams = {
                    ActiveDocumentNumber: oViewContextObject.ActivePurchasingDocument,
                    CentralPurchaseDocument: oViewContextObject.CentralPurchaseContract,
                    DraftGuid: oViewContextObject.DraftUUID
                };
                this.getView().setBusy(true);
                var oSkipLCMReasonPromise = this._getSkipLCMReasonPromise(oParams);
                oSkipLCMReasonPromise.then(function (oResponse) {
                    this.getView().setBusy(false);
                    this.oSkipLCMModel = new JSONModel({
                        "previousNotes": oResponse.CONTENT,
                        "defaultText": this._oResourceBundle.getText("SkipLCMDefaultText"),
                        "notes": "",
                        "objectId": oResponse.OBJECTID, // For passing in Notes objectId header parameter
                        "noteId": oResponse.NOTEID
                    });
                    // If LCM Skip Switch state is true then we will open Skip LCM Reason notes dialog for updating notes
                    // else we will just update the property of Skip LCM property and will update the notes with previous notes
                    if (oSource.getState()) {
                        Fragment.load({
                            id: "idSkipLCMFragment",
                            name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.fragments.SkipLCMDialog",
                            controller: this
                        }).then(function (oDialog) {
                            this.oSkipLCMDialog = oDialog;
                            this.oSkipLCMDialog.setModel(this.oSkipLCMModel, "skipLCMModel");
                            this.getView().addDependent(this.oSkipLCMDialog);
                            this.oSkipLCMDialog.open();
                        }.bind(this));
                    } else {
                        var oPreviousNotes = { "Content": oResponse.CONTENT };
                        this._updateSkipLCMNotes(oPreviousNotes, false);
                    }
                }.bind(this)).catch(function (oError) {
                    //For resetting the Skip LCM Switch state
                    this._resetSkipLCMSwitchState();
                    this.getView().setBusy(false);
                    var oErrorResponseText = JSON.parse(oError.responseText);
                    MessageBox.error(oErrorResponseText.error.message.value);
                }.bind(this));
            },

            /**
             * Method to call function import to get previous notes and Object ID
             * @param {object} oParams - Parameters to pass in Function import call for fetching required details
             * @return {object} Promise Object of the function import
             * @private
             */
            _getSkipLCMReasonPromise: function (oParams) {
                var oViewModel = this.getView().getModel();
                var oSkipLCMPromise = new Promise(function (resolve, reject) {
                    oViewModel.callFunction(Constants.FUNCTION_IMPORT.SKIP_LCM_REASON_NOTES, {
                        method: "GET",
                        urlParameters: oParams,
                        success: function (oData) {
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                });
                return oSkipLCMPromise;
            },

            /**
             * Closing Skip LCM dialog on press of cancel button
             * @param {sap.ui.base.Event} oEvent press event object
             * @public
             */
            handleSkipLCMDialogClose: function (oEvent) {
                if (oEvent) {
                    this._resetSkipLCMSwitchState();
                }
                this.oSkipLCMDialog.close();
                this.oSkipLCMDialog.destroy();
                // This is to fix duplicate id issue in fragment
                this.oSkipLCMDialog = undefined;
            },

            /**
             * Escape handler for Skip LCM Dialog
             * @param {object} oPromise Object of dialog escape instance
             * @public
             */
            handleSkipLCMDialogEscape: function (oPromise) {
                // We are rejecting the escape handler for this dialog because 
                //we have to reset the state of Skip LCM switch in case of cancel button press
                oPromise.reject();
            },

            /**
             * Helper function to reset the Skip LCM Switch state on canceling the Skip LCM Reason dialog 
             * or in case of SkipLCMReasonNotes Function Import call error scenario
             * @private 
             */
            _resetSkipLCMSwitchState: function () {
                var bCurrentState = this._getSkipLCMSwitchState();
                this.byId("idHierarchyGroupSkipLCMSwitch").setState(!bCurrentState);
            },

            /**
             * Method to get the state of Skip LCM Reason Switch
             * @return {boolean} Retuns the state of Skip LCM Reason switch
             * @private
             */
            _getSkipLCMSwitchState: function () {
                return this.byId("idHierarchyGroupSkipLCMSwitch").getState();
            },

            /**
             * Submit button handler for Skip LCM Dialog
             * @public
             */
            handleSkipLCmSubmitButtonPress: function () {
                var oSkipLCMData = this.oSkipLCMModel.getData();
                if (oSkipLCMData.notes !== "") {
                    //In case previous notes is empty then we will add default text else we do not add default text to the notes
                    var sPreviousNotes = (oSkipLCMData.previousNotes === "") ? oSkipLCMData.defaultText + "\n" : oSkipLCMData.previousNotes + "\n";
                    var oNewNotes = { "Content": sPreviousNotes + oSkipLCMData.notes };
                    this._updateSkipLCMNotes(oNewNotes, true);
                } else {
                    MessageBox.error(this._oResourceBundle.getText("ValuationSkipLCMErrorMessage"));
                }
            },

            /**
             * Helper method for updating the notes
             * @param {object} oNotes Notes to make POSt call
             * @param {boolean} bCloseSkipLCMNotesDialog  Based on this property we will call Skip LCM Dialog Close method.
             * @private
             */
            _updateSkipLCMNotes: function (oNotes, bCloseSkipLCMNotesDialog) {
                var oSkipLCMData = this.oSkipLCMModel.getData();
                var oNotesModel = this.getView().getModel("NOTES");
                var oHeaders = oNotesModel.getHeaders();
                oHeaders["gbtnte-objectId"] = oSkipLCMData.objectId;
                oHeaders["gbtnte-objectNodeType"] = Constants.SKIP_LCM_REASON.OBJECT_NODE_TYPE;
                oHeaders["gbtnte-noteTypes"] = Constants.SKIP_LCM_REASON.NOTE_TYPES;
                oNotesModel.setHeaders(oHeaders);
                var sRequiredUrl = oNotesModel.createKey("C_Sgbt_Nte_Cds_Apitp", {
                    NoteID: oSkipLCMData.noteId,
                    IsActiveEntity: false
                });
                oNotesModel.update("/" + sRequiredUrl, oNotes, {
                    success: function () {
                        if (bCloseSkipLCMNotesDialog) {
                            this.handleSkipLCMDialogClose();
                        }
                        this._updateSkipLCMState(true);
                    }.bind(this),
                    error: function (oError) {
                        var oErrorResponse = JSON.parse(oError.responseText);
                        MessageBox.error(oErrorResponse.error.message.value);
                    }
                });
            },

            /**
             * Method to update the state of Skip LCM Reason Switch
             * @param {boolean} bRefreshObjectPage based on this flag objectpage will be refreshed for updated notes 
             * @private
             */
            _updateSkipLCMState: function (bRefreshObjectPage) {
                var oContext = this.getView().getBindingContext();
                var oViewModel = this.getView().getModel();
                var bSkipLCMState = this._getSkipLCMSwitchState();
                var sValue = bSkipLCMState ? "X" : "";
                oViewModel.setProperty("LcmSkip", sValue, oContext);
                this.getView().setBusy(true);
                //For updating Skip LCM property
                oViewModel.submitChanges({
                    success: function () {
                        if (bRefreshObjectPage) {
                            //For Refreshing the object page for updating Skip LCM Notes
                            this.getView().getController().extensionAPI.refresh();
                        }
                        this.getView().setBusy(false);
                    }.bind(this),
                    error: function () {
                        this.getView().setBusy(false);
                    }.bind(this)
                });
            },

            /**
             * Event handler for Brand Copy Info-Contract button press
             */
            onBrandInfoCopyBtnPress: function () {
                var bListPage = false;
                var oI18nModel = this.getView().getController().getOwnerComponent().getModel(
                    "i18n|sap.suite.ui.generic.template.ListReport|C_CentralPurchaseContractTP");
                CopyContract.onBrandInfoCopy(this.getView(), bListPage, oI18nModel);
            }
        });
    });