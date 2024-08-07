sap.ui.define([
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "vwks/nlp/s2p/mm/pctrcentral/manage/changes/utils/Constants"
], function (MessageBox, JSONModel, Fragment, Constants) {
    "use strict";

    return {
        /**
         * Constructor for Location Reuse Quick View 
         * @param {sap.ui.view} oView - Parent View
         * @param {sap.ui.model.resource.ResourceModel} oI18nModel - i18n Model
         */
        init: function (oView, oI18nModel) {
            this._oView = oView;
            
            this.initModel(oI18nModel);
        },

        /**
         * Initialize local model for BP Location popover. 
         * @param {sap.ui.model.resource.ResourceModel} oI18nModel resource model
         */
        initModel: function (oI18nModel) {
            this.oi18nModel = oI18nModel;
            this.oLocationModel = new JSONModel({});
        },

        /**
         * Set or unset popover busy state.
         * @param {boolean} bBusy true - set busy state, false - remove busy state
         * @public
         */
        setBusy: function (bBusy) {
            this.oLocationQuickView.setBusy(bBusy);
        },

        /**
         * Load and open popover.
         * @param {sap.m.Link} oSource BP number link
         * @public
         */
        load: function (oSource) {
            if (!this.oLocationQuickView) {
                Fragment.load({
                    id: "idLocationQuickViewFragment",
                    name: "vwks.nlp.s2p.mm.pctrcentral.manage.changes.reuse.fragments.LocationQuickView",
                    controller: this
                }).then(function (oQuickView) {
                    this.oLocationQuickView = oQuickView;
                    this.setModels();
                    this.getLocationData(oSource);
    
                    this._oView.addDependent(this.oLocationQuickView);
                    this.oLocationQuickView.openBy(oSource);
                }.bind(this));
            } else {
                this.getLocationData(oSource);
                this.oLocationQuickView.openBy(oSource);
            }
        },

        /**
         * Set local models to popover.
         */
        setModels: function () {
            this.oLocationQuickView.setModel(this.oi18nModel, "i18n");
            this.oLocationQuickView.setModel(this.oLocationModel, "locationModel");
        },

        /**
         * Get Location Data for the popover.
         * @param {sap.m.Link} oSource BP number link
         */
        getLocationData: function (oSource) {
            var sBusinessPartner = oSource.getBindingContext().getObject(oSource.getBinding("text").aBindings[1].getPath());
            this.setBusy(true);
            this.getBPAddressPromise(sBusinessPartner)
                .then(this.onLoadBPAddressSuccess.bind(this))
                .catch(this.onLoadBPAddressError.bind(this))
                .finally(function () {
                    this.setBusy(false);
                }.bind(this));
        },

        /**
         * Get BP location success handler.
         * @param {object} oLocationData location data
         */
        onLoadBPAddressSuccess: function (oLocationData) {
            this.oLocationModel.setData(oLocationData);
        },

         /**
         * Get BP location error handler.
         * @param {object} oError Error Message
         */
        onLoadBPAddressError: function (oError) {
            try {
                MessageBox.error(JSON.parse(oError.responseText).error.message.value);
            } catch (e) {
                MessageBox.error(this.oi18nModel.getProperty("LoadBPLocationErrorMsg"));
            }
        },

        /**
         * Return get business partner location promise.
         * @param {string} sBusinessPartner BP number
         * @return {Promise} Promise object
         */
        getBPAddressPromise: function (sBusinessPartner) {
            return new Promise(function (resolve, reject) {
                this._oView.getModel().read("/xVWKSxNLP_C_BP_ADDR('" + sBusinessPartner + "')", {
                    success: function (oData) {
                        resolve(oData);
                    },
                    error: function (oError) {
                        reject(oError);
                    }
                });
            }.bind(this));
        }
    };
});