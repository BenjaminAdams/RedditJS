define(['underscore', 'backbone', 'resthub', 'hbs!template/todo'],
function(_, Backbone, Resthub, todoTmpl){
  var TodoView = Resthub.View.extend({

    //... is a list tag.
    tagName:  'li',
    strategy: 'append',
    template: todoTmpl,

    // The DOM events specific to an item.
    events: {
      'click .check'              : 'toggleDone',
      'dblclick div.todo-content' : 'edit',
      'click span.todo-destroy'   : 'clear',
      'keypress .todo-input'      : 'updateOnEnter',
      'blur .todo-input'          : 'close'
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function(options) {
      _.bindAll(this, 'render', 'close', 'remove');
      // Add this context in order to allow automatic removal of the calback with dispose()
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
      this.render();
    },

    // Toggle the `'done'` state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `'editing'` mode, displaying the input field.
    edit: function() {
      this.$el.addClass('editing');
      // this.$() is a shortcut for this.$el.find()
      this.$('.todo-input').focus();
    },

    // Close the `'editing'` mode, saving changes to the todo.
    close: function() {
      this.model.save({content: this.$('.todo-input').val()});
      this.$el.removeClass('editing');
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }

  });
  return TodoView;
});
