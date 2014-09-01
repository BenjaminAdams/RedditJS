define(['App', 'marionette', 'hbs!template/post-row', 'hbs!template/post-row-small', 'hbs!template/post-row-large', 'hbs!template/post-row-grid'],
    function(App, Marionette, PostRowTmpl, PostRowSmallTmpl, PostRowLargeTmpl, PostRowGridTmpl) {
        return Backbone.Marionette.CollectionView.extend({
            //itemView: PostRowTmpl,
            id: 'siteTable',
            className: 'sitetable linklisting',
            initialize: function(options) {
                this.gridOption = options.gridOption;
                this.setTemplate(this.gridOption)
                //this.itemViewtemplate = PostRowTmpl;
                // this.gridOption = 'normal';
                //  this.start = new Date() //timer for testing

                if (options.removeSiteTableCSS === true) {
                    this.removeSiteTableCSS = true
                }

            },
            itemViewOptions: function(model, index) {
                // do some calculations based on the model
                return {
                    gridOption: this.gridOption,
                    template: this.itemViewtemplate
                }
            },
            onRender: function() {
                //$('#siteTable').css('text-align', 'left') //why did this exist
                setTimeout(function() {
                    App.trigger("bottombar:selected");
                }, 1000)

                if (this.removeSiteTableCSS === true) {

                    this.$el.removeClass('siteTable')
                    this.$el.attr('id', 'siteTableBtmBar');

                }

            },
            changeGridView: function(option) {
                this.gridOption = option
                this.setTemplate(this.gridOption)
                this.render()
            },
            setTemplate: function(option) {
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