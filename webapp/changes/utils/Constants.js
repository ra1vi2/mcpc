sap.ui.define([], function () {
    "use strict";

    return Object.freeze({
        TRANSACTION_CONTROLLER_TYPE: {
            DRAFT: "sap.suite.ui.generic.template.ObjectPage.extensionAPI.DraftTransactionController",
            NON_DRAFT: "sap.suite.ui.generic.template.ObjectPage.extensionAPI.NonDraftTransactionController"
        },

        NO_ITEMS_AMOUNT: 0,
        ONE_ITEM_AMOUNT: 1,
        MAX_PERCENTAGE_VALUE: 100,

        DISTR_LINE_STATUS: {
            ERROR: "E",
            SUCCESS: "S",
            WARNING: "W"
        },

        DISTRIBUTION_ACTION: {
            ADD: "Add",
            COPY: "Copy"
        },

        CUSTOM_COPY_FACETS : {
            SUPPLIER : "supplier",
            REFERENCE : "reference",
            HEADER_NOTES : "headerNotes",
            ITEM_NOTES : "itemNotes",
            MANUAL_RMS: "manualRMS",
            COND_SUPP : "condSupplierCost"
        },

        CONTRACT_TYPE: {
            GROUP: "HC",
            BRAND: "CC"
        },
        NAVIGATE_APPLICATION: {
            MCPC: "MCPC"
        },

        GROUP_CONTRACT_SUBTYPE: "H",

        DEFAULT_PARAMS: {
            SOURCE_SYSTEM: "0"
        },

        BAILMENT_PAYMENT_MODEL_CODE: "02",

        CONTRACT_STATUS: {
            IN_PREPARATION: "01",
            IN_APPROVAL: "03",
            RELEASE_COMPLETED: "05"
        },

        FUNCTION_IMPORT: {
            VALIDATE_INPUT: "/ValidateIncotermShipInstPaymntTerm",
            RETRIGGER_WORKFLOW: "/RetriggerWorkflowSubOrdCtr",
            COPY_CONDITION: "/CopyCondition",
            QUOTA_INFO: "/QuotaInfo",
            HIER_COPY_DIST: "/HierCtrCopyDist",
            HIER_ITEM_COPY_DIST: "/HierCtrItemCopyDist",
            ZSB_ACTION: "/ZSBAction",
            ZSB_CALCULATE_PRICE: "/ZSBCalcPrice",
            CREATE_ZSB_COND: "/CreateZSBCond",
            ZSB_DL_CREATE_REQUEST: "/ZSBDLCreateRequest",
            ZSB_FIND_CONTRACTS: "/ZSBFindContracts",
            ALTERNATIVE_PART_CTR: "/CtrAltrPart",
            DELETE_ZSB_COMP: "/DelComponentZSB",
            DETERMINE_ZSB_ACTION: "/DetermineZSBAction",
            CREATE_PMAT_ROD: "/CreatePMATROD",
            ADD_USER_COMMENT: "/AddUserCommentCCTRHeader",
            STD_TEXT_FAV_PREVIEW: "/StdTxtFavupdPreview",
            STD_TEXT_MAINTAIN_NOTES: "/StdTxtMaintainNotes",
            ALTERNATIVE_PARTS_POPUP: "/CtrAltrPartPopUp",
            GET_QUOTA: "/GetQuotaData",
            CANCEL_QUOTA: "/CancelQuota",
            VALIDATE_QUOTA: "/ValidateAdjustQuota",
            CONDITION_CURRENCY: "/CrwPriceConditionPopUp",
            CREATE_CONDITIONS: "/CrwPriceCondition",
            CREATE_DELTA_CONTRACT: "/ZSBCreateDeltaLawCont",
            CREATE_NEW_PCF: "/CreateNewPCF",
            SKIP_LCM_REASON_NOTES: "/SkipLcmReasonNotes"
        },
        VIEW_ID: {
            HEADER: "header",
            ITEM: "item",
            DISTRIBUTION: "distribution",
            HEADER_DISTRIBUTION: "headerDistribution",
            HIERARCHY_HEADER: "hierarchyHeader",
            HIERARCHY_ITEM: "hierarchyItem",
            HIERARCHY_DISTRIBUTION: "hierarchyDistribution",
            HIERARCHY_HEADER_DISTRIBUTION: "hierarchyHeaderDistribution"
        },
        LEVEL: {
            HEADER: "H",
            ITEM: "I"
        },
        FAV_LIST: {
            REMOVE: "FR",
            ADD: "FA"
        },
        PURCHANSING_DOCUMENT_CATEGORY: {
            CONTRACT: "K"
        },
        CONTRACTS_STATUS: {
            REJECTED: "08"
        },
        ITEM_OVERALL_STATUS_CODE: {
            ERROR: "1",
            WARNING: "2",
            SUCCESS: "3",
            COLOR_ERROR: "Error",
            COLOR_WARNING: "Warning",
            COLOR_SUCCESS: "Success",
            COLOR_NONE: "None",
            SEVERITY_ERROR: "error",
            SEVERITY_WARNING: "warning",
            SEVERITY_SUCCESS: "success"
        },
        SELECTED_NODE: {
            PLANT: "P"
        },
        PROCESS_INDICATOR: {
            PMATERIAL: "P"
        },
        PREVIEW_OPTION: "P",
        PRICE: "Price",
        VALIDATE_INPUT_FUNCTION_IMPORT: "/ValidateIncotermShipInstPaymntTerm",
        MESSAGE_SEVERITY: {
            WARNING: "warning"
        },
        ZSB_PROPERTY: {
            PRICE_PRELOGISTIC: "PricePreLogistic",
            PRICE_ADDEDVALUE: "PriceAddedValue",
            PRICE_HANDLING: "PriceHandling",
            PRICE_PERCENTAGE_PRELOGISTIC: "PricepercentagePreLogistic",
            PRICE_PERCENTAGE_ADDEDVALUE: "PricepercentageAddedValue",
            PRICE_PERCENTAGE_HANDLING: "PricepercentageHandling"
        },
        ZSB_INDICATOR: {
            ZSB: "ZSB",
            LAW: "LAW",
            DIR: "DIR"
        },
        DOCUMENT_TYPE: {
            ZIMK: "ZIMK",
            ZIWK: "ZIWK"
        },
        ALTERNATIVEPART_CONTRACTTYPE: {
            HIERARCHY_CONTRACT: "H"
        },
        ENTITYSET: {
            ZSB_FIND_CONTRACTS: "xVWKSxNLP_CCTR_I_FIND_CTR_ZSB"
        },
        TAB_KEYS: {
            SINGLE: "01",
            MULTIPLE: "02",
            UOM: "03",
            ROD: "04"
        },
        ZSB_ERROR_CODES: {
            FIND_CONTRACTS: "/VWKS/NLP_CCTR/256"
        },
        QUALIFIER: {
            TAUFUNG: "06",
            ROD: "05"
        },
        OVERALL_QUOTA: {
            STATE: {
                ERROR: "Error",
                NONE: "None"
            },
            ACCEPTED_VALUE: {
                VALUE1: 80,
                VALUE2: 100
            }
        },
        LOGICAL_SYSTEM: "EBON",
        COND_TYPE: {
             P: "P",
             A: "A",
            Percnt: "%"
        },
        NAVIGATION_FLAG: {
            DISTR_LINE: "flagNavigationDistrLine"
        },
        SELECT_VALUE: {
            YES: "X",
            NO: ""
        },
        VALUE_HELP_ENTITY: {
            PLANT: "xVWKSxNLP_C_PLANTSYSTEM_VH",
            CONNECTED_SYSTEM: "C_ProcmtHubBackendSrceSystemVH",
            CONDITION_TYPE: "xVWKSxNLP_CCTR_C_Itm_CTypeVH",
            CHANGE_REASON: "xVWKSxNLP_I_CONDCHNGREASON",
            CURRENCY: "I_Currency"
        },
        INITIALLY_VISIBLE_FIELDS: {
            PLANT: "ProcmtHubPlant,ProcmtHubCompanyCode,ProcurementHubSourceSystem,ProcurementHubSourceSystemName",
            CONNECTED_SYSTEM: "ProcurementHubSourceSystem,ProcurementHubSourceSystemName",
            CONDITION_TYPE: "ConditionType,ConditionTypeName,EbonCondID",
            CHANGE_REASON: "ConditionChangeReason,Description",
            CURRENCY: "CurrencyISOCode,Currency"
        },
        VALUE_HELP_FILTERS: {
            PLANT: [],
            CONNECTED_SYSTEM: [],
            CONDITION_TYPE: [{ key: "DraftUUID", value: "DraftUUID" }],
            CHANGE_REASON: [],
            CURRENCY: []
        },
        BASIC_SEARCH_FIELDS: {
            PLANT: "ProcmtHubPlant",
            CONNECTED_SYSTEM: "ProcurementHubSourceSystem",
            CONDITION_TYPE: "ConditionType",
            CHANGE_REASON: "ConditionChangeReason",
            CURRENCY: "CurrencyISOCode"
        },
        LOCAL_MODEL_FIELDS: {
            PLANT: "plant",
            CONNECTED_SYSTEM: "connectedSystem",
            CONDITION_TYPE: "conditionType",
            CHANGE_REASON: "changeReason",
            CURRENCY: "currency"
        },
        ODATA_FIELDS: {
            PLANT: "ProcmtHubPlant",
            CONNECTED_SYSTEM: "ProcurementHubSourceSystem",
            CONDITION_TYPE: "ConditionType",
            CHANGE_REASON: "ConditionChangeReason",
            CURRENCY: "CurrencyISOCode"
        },
        ICONS: {
			SUCCESS: "sap-icon://message-success",
			WARNING: "sap-icon://message-warning",
			ERROR: "sap-icon://message-error"
		},

        VALID_TO: "31.12.9999",

        ZSB_ADD_MANUAL_SMARTFIELDS: {
            PLANT: "idZsbAddlineManuallyFragment--idPlantValue",
            MATERIAL : "idZsbAddlineManuallyFragment--idMaterial",
            AMOUNT_PER_ZSB_MAX_VALUE: 999,
            PRICE_MAX_VALUE: 9999999
        },
        PCF_PARAMS: {
            NEW_REQUEST: "NR",
            REFERENCE_DOCUMENT_TYPE: "C"
        },
        SKIP_LCM_REASON: {
            OBJECT_NODE_TYPE: "CentralPurchaseContract",
            NOTE_TYPES: "/VWKS/NLP_CTR_LCM"
        },
        DOCUMENT_HISTORY: {
            HEADER: "H",
            HEADER_ITEMS: "HI",
            ALLITEMS_DISTRIBUTION: "ID",
            ITEMS: "I",
            HEADER_ITEM_DISTRIBITION: "HID",
            DISTRIBUTIONS: "D"
        },
        FIND_CONTRACT_CONFIG: {
            ALL_MULTIPLE_CONTRACTS: "/allMultipleContracts",
            SELECTED_MULTIPLE_CONTRACTS: "/selectedMultipleContracts",
            ALL_NO_CONTRACTS: "/allNoContracts",
            SELECTED_NO_CONTRACTS: "/selectedNoContracts"
        },

        NAVIGATION_TYPE: {
            GROUP: "Group",
            BRAND: "Brand"
        }

    });
});
