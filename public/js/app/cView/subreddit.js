define(['App', 'marionette', 'hbs!template/post-row', 'hbs!template/post-row-small', 'hbs!template/post-row-large', 'hbs!template/post-row-grid'],
    function(App, Marionette, PostRowTmpl, PostRowSmallTmpl, PostRowLargeTmpl, PostRowGridTmpl) {
        return Backbone.Marionette.CollectionView.extend({
            //childView: PostRowTmpl,
            id: 'siteTable',
            className: 'sitetable linklisting',
            initialize: function(options) {
                this.gridOption = options.gridOption;
                this.setTemplate(this.gridOption)
                //this.childViewtemplate = PostRowTmpl;
                // this.gridOption = 'normal';
                //  this.start = new Date() //timer for testing

                if (options.removeSiteTableCSS === true) {
                    this.removeSiteTableCSS = true //sometimes the btmbar would have custom CSS in it making it look weird
                }

            },
            childViewOptions: function(model, index) {
                // do some calculations based on the model
                return {
                    gridOption: this.gridOption,
                    template: this.childViewtemplate
                }
            },
            onRender: function() {
                //$('#siteTable').css('text-align', 'left') //why did this exist
                setTimeout(function() {
                    App.trigger("bottombar:selected");
                }, 1000)

                if (this.removeSiteTableCSS === true) {
                    //sometimes the btmbar would have custom CSS in it making it look weird
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
                    this.childViewtemplate = PostRowTmpl;
                } else if (option == 'small') {
                    this.childViewtemplate = PostRowSmallTmpl
                } else if (option == 'large') {
                    this.childViewtemplate = PostRowLargeTmpl
                } //else if (option == 'grid') {
                //this.childViewtemplate = PostRowGridTmpl
                //}
            }
        });
    });