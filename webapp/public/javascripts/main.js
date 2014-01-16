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
  },
  renderTemplate: function() {
    var postsTemplate = this.render('posts');
    Ember.run.next(this, function() {
      $(".shell-editor").find(".CodeMirror").remove();
      var shell = Shell.fromTextArea($(document).find(".shell-editor textarea")[0], {
         mode: "r",
         autofocus: true,
         theme: 'blackboard'
      });

      shell.cm.setSize(null, 200);
    });
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
    return posts.postList.findBy('id', params.post_id); 
  },
  renderTemplate: function() {
    var post = this.render('post');
    Ember.run.next(this, function() {
      $("#editor-area").find(".CodeMirror").remove();  
      CodeMirror.fromTextArea($(document).find("#editor-area textarea")[0], {
        mode: "r",
        autofocus: true,
        lineNumbers: true,
        theme: 'blackboard'
      });

      $("#editor-area #editor-loading").addClass("hidden");
    });
  }
});

var posts = {
  currentShellContent: "1 + 1;", 
  postList: [
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
    text: "sum <- function(a,b){a+b}",
    excerpt: "My journeys to the east",
    code: "It was a dark\n ni\nght th\nat \nmy journey began.  \nTHe orient seemed so\
      far away, \nso unatta\nina\nble, but nevertheless, our path must take us there.\
      M\narc\no look\ned \nat \nme, \nbi\ng e\nye\ns, \nwon\nder\ni\nn\ng \nif \nwe\n'd ever make it.  We must."
  }
]
};
