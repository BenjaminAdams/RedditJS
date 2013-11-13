define(['App', 'backbone', 'marionette', 'jquery', 'hbs!template/post-row', 'hbs!template/post-row-small', 'hbs!template/post-row-large', 'hbs!template/post-row-grid'],
    function(App, Backbone, Marionette, $, PostRowTmpl, PostRowSmallTmpl, PostRowLargeTmpl, PostRowGridTmpl) {
        return Marionette.FasterCollectionView.extend({
            //return Marionette.CollectionView.extend({
            initialize: function(options) {
                _.bindAll(this);
                this.itemViewtemplate = 'normal';
                this.gridOption = options.gridOption;
                this.setGridView(this.gridOption)
                // this.gridOption = 'normal';
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
                } else if (option == 'grid') {
                    this.itemViewtemplate = PostRowGridTmpl
                }

                this.gridViewSetup()
            },
            gridViewSetup: function() {
                var self = this

                if (this.gridOption == 'grid') {

                    $('.side').hide()
                    this.ui.siteTable.css('margin-right', '0') //some custom CSS were making this bad in grid mode
                    //calculate how many columns we will have
                    var colCount = Math.floor($(document).width() / 305)

                    for (var i = 0; i < colCount; i++) {
                        self.ui.siteTable.append('<div class="column"> </div>')
                    }

                    this.ui.siteTable.append('<div id="fullImgCache"></div>')

                } else {

                    if (window.settings.get('showSidebar') === false) {
                        $('.side').hide()
                    } else {
                        $('.side').show()
                    }
                    //this.ui.siteTable.html('')
                    this.resize()
                }
            },
            resize: function() {
                var mobileWidth = 1000; //when to change to mobile CSS
                if (this.gridOption == "large") {
                    $('.side').hide()
                    //change css of 
                    var docWidth = $(document).width()
                    var newWidth = 0;
                    if (docWidth > mobileWidth) {
                        newWidth = docWidth - 355;
                    } else {
                        newWidth = docWidth;
                    }
                    $('#dynamicWidth').html(' < style > .large - thumb {width: ' + newWidth + 'px} < /style>');
                } else if (window.settings.get('showSidebar') === true && this.gridOption != "grid") {

                    if (mobileWidth > $(document).width()) {
                        $('.side').hide()
                    } else {
                        $('.side').show()
                    }
                }

            },

        });
    });