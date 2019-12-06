define(['App', 'backbone', 'model/single'], function(App, Backbone, SingleModel) {
  var MySubreddits = Backbone.Collection.extend({
    initialize: function() {
      this.subreddits = this.loadSubredditsFromLS()
            
      if (typeof this.subreddits !== 'undefined' && this.subreddits !== null && this.subreddits.length >0) {
        this.parseFromLS()
      } else {
        this.fetch()
      }
    },
    //model: SingleModel,
    url: function() {
      var username = App.user.name || false
      if (username !== false) {
        return "/api/?url=reddits/mine.json&limit=100"
      } else {
        //return "/api/?url=subreddits.json"
        return 'https://www.reddit.com/' + 'subreddits.json?jsonp=?'
      }
    },
    comparator: 'display_name',
    //so we have the attributes in the root of the model
    parse: function(response) {
      var subreddits = []

      if (typeof response === 'undefined' || response.data === 'undefined') {
        this.loadDefaultSubreddits()
      } else {

        _.each(response.data.children, function(item) {
          subreddits.push({
            header_img: item.data.header_img,
            display_name: item.data.display_name
          });
        })

        this.setSubredditsLS(subreddits)

        return subreddits;
      }
    },      
    loadSubredditsFromLS: function(){
      try {
       return JSON.parse(window.localStorage.getItem('subreddits'))
      }catch(e){
        console.log('failed to get localstorage', e)
        return null
      } 
    },
    setSubredditsLS: function(data){
      try {
        window.localStorage.setItem('subreddits', JSON.stringify(data));
      }catch(e){
        console.log('failed to set localstorage', e)
      }       
    },
    parseFromLS: function() {
      var self = this

      for (var i = 0; i < this.subreddits.length; i++) {
        self.add({
          display_name: this.subreddits[i].display_name,
          header_img: this.subreddits[i].header_img
        });

      }
    },
    
    loadDefaultSubreddits: function() {

      this.add({
        display_name: "funny"
      });
      this.add({
        display_name: "pics"
      });

      this.add({
        display_name: "aww"
      });
      this.add({
        display_name: "WTF"
      });
      this.add({
        display_name: "gifs"
      });
      this.add({
        display_name: "AdviceAnimals"
      });

      this.add({
        display_name: "EarthPorn"
      });
      this.add({
        display_name: "AskReddit"
      });
      this.add({
        display_name: "explainlikeimfive"
      });
      this.add({
        display_name: "gaming"
      });
      this.add({
        display_name: "bestof"
      });
      this.add({
        display_name: "IAmA"
      });
      this.add({
        display_name: "movies"
      });
      this.add({
        display_name: "Music"
      });
      this.add({
        display_name: "news"
      });
      this.add({
        display_name: "science"
      });
      this.add({
        display_name: "books"
      });
      this.add({
        display_name: "videos"
      });
      this.add({
        display_name: "technology"
      });
      this.add({
        display_name: "television"
      });
      this.add({
        display_name: "todayilearned"
      });
      this.add({
        display_name: "askscience"
      });

      this.add({
        display_name: "worldnews"
      });
      this.add({
        display_name: "blog"
      });

      App.subreddits.mine = this

    }

  });
  return MySubreddits;
});
