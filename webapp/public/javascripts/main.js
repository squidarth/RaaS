App = Ember.Application.create();

App.Router.map(function() {
  this.resource('about');
  this.resource('posts', function() {
    this.resource('post', {path: ":post_id"});
  });
});

App.PostsRoute = Ember.Route.extend({
  model: function() {
    return posts;
  }
});

App.PostController = Ember.ObjectController.extend({
  isEditing: false,

  actions: {
    edit: function() {
      this.set("isEditing", true);
    },

    doneEditing: function() {
      this.set("isEditing", false);
    }
  }

});

App.PostRoute = Ember.Route.extend({
  model: function(params) {
    return posts.findBy('id', params.post_id); 
  },
  renderTemplate: function() {
    var post = this.render('post');
    Ember.run.next(this, function() {
      CodeMirror.fromTextArea($(document).find("#editor-area textarea")[0], {
        mode: "r",
        autofocus: true,
        lineNumbers: true,
        theme: 'blackboard'
      });
    });
  }
});

var posts = [
  {
    id: "1",
    title: "Hello",
    author: {name: "d2h"},
    date: "2014-01-02",
    excerpt: "A letter about how Rails sucks",
    code: "product <- function(a,b){\
      a+b\
    }",
    text: "lorem ipsum is a great filler text for any application worth\
      its salt.  Sid is the coolest kid you'll ever meat"
  },
  {
    id: "2",
    title: "The Parley Letter",
    author: {name: "someone else"},
    date: "2014-01-08",
    code: "sum <- function(a,b){a+b}",
    excerpt: "My journeys to the east",
    text: "It was a dark night that my journey began.  THe orient seemed so\
      far away, so unattainable, but nevertheless, our path must take us there.\
      Marco looked at me, big eyes, wondering if we'd ever make it.  We must."
  }
];
