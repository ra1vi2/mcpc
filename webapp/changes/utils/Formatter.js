sap.ui.define([
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/utils/Constants",
    "sap/ui/core/IconPool",
    "sap/ui/core/ValueState",
    "sap/ui/core/MessageType",
    "sap/ui/core/IconColor"
], function (Constants, IconPool, ValueState, MessageType, IconColor) {
    "use strict";

    return {

        /**
		 * Function to get Notes JSON
		 * @param {string} sNotesType Note Type
		 * @returns {Array} returns array of note types
		 */
        returnNotesJSON: function (sNotesType) {
            var aNoteTypes = [];
            if (sNotesType && typeof sNotesType === "string") {
                var aSplitString = sNotesType.split(" ");
                for (var i = 0; i < aSplitString.length; i++) {
                    var oNoteTypes = {};
                    oNoteTypes.name = aSplitString[i];
                    oNoteTypes.settings = {
                        "languageList": {
                            "showSecondaryValues": true
                        }
                    };
                    aNoteTypes.push(oNoteTypes);
                }
            }
            return aNoteTypes;
        },

        /**
		 * Funtion to get notes CCTR Item Distribution key
		 * @param {string} sCentralPurchaseContract Central purchase contract key
		 * @param {string} sCentralPurchaseContractItem Central purchase contract Item key
		 * @param {string} sCentralPurchaseContractItemDistribution  Central purchase contract Item Distribution key
		 * @returns {string} returns object key
		 */
        returnNotesCCTRItemDistrKey: function (sCentralPurchaseContract, sCentralPurchaseContractItem, sCentralPurchaseContractItemDistribution) {
            var sObjectKey = "";
            if (sCentralPurchaseContract !== undefined && sCentralPurchaseContract !== "" && typeof sCentralPurchaseContract ===
                "string") {
                sObjectKey = sCentralPurchaseContract;
                if (sCentralPurchaseContractItem !== undefined && sCentralPurchaseContractItem !== "" && typeof sCentralPurchaseContractItem ===
                    "string") {
                    sObjectKey += sCentralPurchaseContractItem;
                    if (sCentralPurchaseContractItemDistribution !== undefined && sCentralPurchaseContractItemDistribution !== "" && typeof sCentralPurchaseContractItemDistribution ===
                        "string") {
                        sObjectKey += sCentralPurchaseContractItemDistribution;
                    }
                }
            }
            return sObjectKey;
        },

        /**
         * Return icon src based on the distribution line status.
         * @param {string} sStatus distribution line status code
         * @return {string} icon src
         * @public
         */
        getDistrStatusIcon: function (sStatus) {
            var sIconSrc;
            switch (sStatus) {
                case Constants.CONTRACT_STATUS.IN_PREPARATION:
                case Constants.CONTRACT_STATUS.IN_APPROVAL:
                    sIconSrc = IconPool.getIconURI("status-critical");
                    break;
                case Constants.CONTRACT_STATUS.RELEASE_COMPLETED:
                    sIconSrc = IconPool.getIconURI("status-positive");
                    break;
                default:
                    sIconSrc = undefined;
            }
            return sIconSrc;
        },

        /**
         * Return status state based on the distribution line status.
         * @param {string} sStatus distribution line status code
         * @return {sap.ui.core.ValueState} icon color
         * @public
         */
        getDistrStatusState: function (sStatus) {
            var sState = ValueState.None;
            switch (sStatus) {
                case Constants.CONTRACT_STATUS.IN_PREPARATION:
                case Constants.CONTRACT_STATUS.IN_APPROVAL:
                    sState = ValueState.Warning;
                    break;
                case Constants.CONTRACT_STATUS.RELEASE_COMPLETED:
                    sState = ValueState.Success;
                    break;
                default:
                    sState = ValueState.None;
            }
            return sState;
        },
        /**
         * Format default value 0 to blank
         * @param {string} sExchangeValue Exchange Value
         * @return {string} sRes Response
         */
        formatDefaultvalue: function (sExchangeValue) {
            var sRes = !Number(sExchangeValue) ? "" : sExchangeValue;
            return sRes;
        },
        /**
         * Format Boolean value. Return 'Yes' || 'No' string.
         * @param {boolean} bValue boolean value
         * @param {sap.base.i18n.ResourceBundle} oResBundle resource bundle
         * @return {string} 'Yes' || 'No' string
         */
        formatBooleanValue: function (bValue, oResBundle) {
            return bValue ? oResBundle.getText("YesText") : oResBundle.getText("NoText");
        },
        
        /**
         * Format decimal value.
         * @param {string} sValue decimal value
         * @return {string} decimal value or empty string
         * @public
         */
        formatDecimalEmptyValue: function (sValue) {
            var sResValue = sValue;
            if (sResValue) {
                sResValue = sResValue.replaceAll(",", "");
                sResValue = +sResValue === 0 ? "" : sResValue;
            }
            return sResValue;
        },

        /**
         * Format editable state for percentage cost fields based on PaymentModel.
         * In case of 'Bailment' Payment Model - set disable.
         * @param {string} sPaymentModel Payment Model code
         * @return {boolean} true | false value
         */
        formatPercentageCostEnableState: function (sPaymentModel) {
            return sPaymentModel === Constants.BAILMENT_PAYMENT_MODEL_CODE ? false : true;
        },

        /**
         * formatter method for overall Quota on item level Icon Status
         * @param {string} sQuotaStatus maintianed for Overal Quota
         * @return {string} icon src
         * @public
         */
        getOveralQuotaIconFormatter: function (sQuotaStatus) {
            var sIconSource = "";
            switch (sQuotaStatus) {
                case Constants.ITEM_OVERALL_STATUS_CODE.ERROR:
                    sIconSource = IconPool.getIconURI("status-negative");
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.WARNING:
                    sIconSource = IconPool.getIconURI("status-critical");
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.SUCCESS:
                    sIconSource = IconPool.getIconURI("status-positive");
                    break;
                default:
                    sIconSource = "";
            }
            return sIconSource;
        },
        /*
         * formatter method for status at item level 
         * @param {string} Status maintianed for Overal Quota
         * @return {string} Item overall status code
         */
        getOveralQuotaStatusFormatter: function (sQuotaStatus) {
            var sQuotaState = Constants.ITEM_OVERALL_STATUS_CODE.COLOR_NONE;
            switch (sQuotaStatus) {
                case Constants.ITEM_OVERALL_STATUS_CODE.ERROR:
                    sQuotaState = Constants.ITEM_OVERALL_STATUS_CODE.COLOR_ERROR;
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.WARNING:
                    sQuotaState = Constants.ITEM_OVERALL_STATUS_CODE.COLOR_WARNING;
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.SUCCESS:
                    sQuotaState = Constants.ITEM_OVERALL_STATUS_CODE.COLOR_SUCCESS;
                    break;
                default:
                    sQuotaState = Constants.ITEM_OVERALL_STATUS_CODE.COLOR_NONE;
            }
            return sQuotaState;
        },

        /**
        * Return messageStrip type for messages in create price conditions dialog.
        * @param {string} sSeverity severity of the message
        * @return {string} messageStrip type
        * @public
        */
        getMessageStripType: function (sSeverity) {
            var sMessageType = MessageType.None;
            switch (sSeverity) {
                case Constants.ITEM_OVERALL_STATUS_CODE.SEVERITY_ERROR:
                    sMessageType = MessageType.Error;
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.SEVERITY_WARNING:
                    sMessageType = MessageType.Warning;
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.SEVERITY_SUCCESS:
                    sMessageType = MessageType.Success;
                    break;
                default:
                    sMessageType = MessageType.None;
            }
            return sMessageType;
        },

        /**
         * Formats Overall Quota title in Smart Table in Edit mode.
         * @param {string} sQuotaFlag the quota status
         * @param {object} oResourceBundle the resource bundle for getting the text
         * @return {string} the valid tooltip string
         **/
        formatterOverallQuotaTooltip: function (sQuotaFlag, oResourceBundle) {
            var sOverallQuotaText = "";
            switch (sQuotaFlag) {
                case Constants.ITEM_OVERALL_STATUS_CODE.ERROR:
                    sOverallQuotaText = oResourceBundle.getText("OverallQuotaError");
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.WARNING:
                    sOverallQuotaText = oResourceBundle.getText("OverallQuotaWarning");
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.SUCCESS:
                    sOverallQuotaText = oResourceBundle.getText("OverallQuotaSuccess");
                    break;
                default:
                    sOverallQuotaText = oResourceBundle.getText("OverallQuotaNone");
            }
            return sOverallQuotaText;
        },
        /**
         * Formatter to get state of overall quota
         * @param {integer} iOverallQuota - overall quota value
         * @return {string} overall quota state
         * @public
         */
        formatterOverallQuotaValue: function (iOverallQuota) {
            var sOverallQuotaState = "";
            if (iOverallQuota === Constants.OVERALL_QUOTA.ACCEPTED_VALUE.VALUE1 ||
                iOverallQuota === Constants.OVERALL_QUOTA.ACCEPTED_VALUE.VALUE2) {
                sOverallQuotaState = Constants.OVERALL_QUOTA.STATE.NONE;
            } else {
                sOverallQuotaState = Constants.OVERALL_QUOTA.STATE.ERROR;
            }
            return sOverallQuotaState;
        },
        /**
         * Formatter to set the status for Brand Approval filed
         * @param {string} sStatusVal status value of Brand Approval
         * @return {string} state of Brand Approval
         */
        statusApproval: function (sStatusVal) {
            var sStatusApprovalState = ValueState.None;
            if (sStatusVal === "01") {
                sStatusApprovalState = ValueState.Success;
            } else if (sStatusVal === "02") {
                sStatusApprovalState = ValueState.Error;
            }
            return sStatusApprovalState;
        },
        /**
         * Formatter to set tooltip text
         * @param {string} sStatusVal status value of Brand Approval
         * @param {string} oResourceBundle resource bundle for hierarchy header
         * @return {string} tooltip text of Brand Approval
         */
        tooltipApproval: function (sStatusVal, oResourceBundle) {
            var sTooltipText = "";
            if (sStatusVal === "01") {
                sTooltipText = oResourceBundle.getText("AllApprovedTooltipText");
            } else if (sStatusVal === "02") {
                sTooltipText = oResourceBundle.getText("MissingApprovalTooltipText");
            }
            return sTooltipText;
        },

        /**
         * Formatter to set Brand Approval field text
         * @param {string} sStatusVal status value of Brand Approval
         * @param {string} oResourceBundle resource bundle for hierarchy header
         * @return {string} text of Brand Approval
         */
        textApproval: function (sStatusVal, oResourceBundle) {
            var sBrandApprovalText = "";
            if (sStatusVal === "01") {
                sBrandApprovalText = oResourceBundle.getText("AllApprovedText");
            } else if (sStatusVal === "02") {
                sBrandApprovalText = oResourceBundle.getText("MissingApprovalText");
            }
            return sBrandApprovalText;
        },
        /**
         * formatter method for message icon
         * @param {string} sStatus status of the message
         * @return {string} message icon
         */
        messageIconFormatter: function (sStatus) {
            var sMessageIcon = "";
            switch (sStatus) {
                case Constants.ITEM_OVERALL_STATUS_CODE.SEVERITY_SUCCESS:
                    sMessageIcon = Constants.ICONS.SUCCESS;
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.SEVERITY_WARNING:
                    sMessageIcon = Constants.ICONS.WARNING;
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.SEVERITY_ERROR:
                    sMessageIcon = Constants.ICONS.ERROR;
                    break;
            }
            return sMessageIcon;
        },

        /**
         * formatter method for message icon color
         * @param {string} sStatus status of the message
         * @return {string} color of the icon
         */
        messageIconColorFormatter: function (sStatus) {
            var sMessageIconColor = "";
            switch (sStatus) {
                case Constants.ITEM_OVERALL_STATUS_CODE.SEVERITY_SUCCESS:
                    sMessageIconColor = IconColor.Positive;
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.SEVERITY_WARNING:
                    sMessageIconColor = IconColor.Critical;
                    break;
                case Constants.ITEM_OVERALL_STATUS_CODE.SEVERITY_ERROR:
                    sMessageIconColor = IconColor.Negative;
                    break;
                default:
                    sMessageIconColor = IconColor.Neutral;
            }
            return sMessageIconColor;
        },
        /**
         * formatter method for Base Material formatting
         * @param {string} sBaseMaterial  Base Material
         * @return {string} sMaterial Base Material
         */
        getBaseMaterialFormatter: function (sBaseMaterial) {
            var sMaterial = "";
            var aMaterialArray = [];
            if (sBaseMaterial && sBaseMaterial.length > 0) {
                //Requirement is to slice text in ### ### ### format i.e. index(1-3.  3-6, 6-9)
                //Base Material is expected to be of 9 characters only
                for (var i = 0; i <= 6; i += 3) {
                    aMaterialArray.push(sBaseMaterial.slice(i, i + 3));
                }
                sMaterial = aMaterialArray.join(" ");
            }
            else {
                sMaterial = "";
            }
            return sMaterial;
        }
    };
});