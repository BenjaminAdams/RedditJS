define(['App', 'backbone', 'jquery', 'hbs!template/post-row', 'hbs!template/post-row-small', 'hbs!template/post-row-large', 'hbs!template/post-row-grid'],
    function(App, Backbone, $, PostRowTmpl, PostRowSmallTmpl, PostRowLargeTmpl, PostRowGridTmpl) {
        return Backbone.Marionette.FasterCollectionView.extend({
            // return Marionette.CollectionView.extend({
            initialize: function(options) {
                _.bindAll(this);
                this.itemViewtemplate = 'normal';
                this.gridOption = options.gridOption;
                this.setGridView(this.gridOption)
                // this.gridOption = 'normal';
                //  this.start = new Date() //timer for testing

            },
            //IT MAY SAVE CPU to use this!!!!!!!!
            // itemViewOptions: {
            //     gridOption: this.gridOption,
            //     template: this.itemViewtemplate
            // },
            itemViewOptions: function(model, index) {
                // do some calculations based on the model
                return {
                    gridOption: this.gridOption,
                    template: this.itemViewtemplate
                }
            },

            onRender: function() {
                setTimeout(function() {
                    App.trigger("bottombar:selected");
                }, 1000)

            },

            changeGridView: function(option) {
                this.gridOption = option
                this.setGridView(this.gridOption)
                this.render()
            },
            setGridView: function(option) {
                if (option == 'normal') {
                    this.itemViewtemplate = PostRowTmpl;
                } else if (option == 'small') {
                    this.itemViewtemplate = PostRowSmallTmpl
                } else if (option == 'large') {
                    this.itemViewtemplate = PostRowLargeTmpl
                } //else if (option == 'grid') {
                //this.itemViewtemplate = PostRowGridTmpl
                //}
            }

        });
    });