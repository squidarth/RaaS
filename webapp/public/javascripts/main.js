App = Ember.Application.create();
App.deferReadiness();
Ember.$.get('/me.json').then(function(response) {
  if (response.logged_in) {
    Ember.set('App.CurrentUser', response);
  } 
  App.advanceReadiness();
});

var attr = DS.attr;
    //store = DS.Store.create();
Ember.LinkView.reopen({
    attributeBindings: ['data-toggle']
});

App.Shellline = DS.Model.extend({
  content: attr(),
  command: attr(),
  workspace: DS.belongsTo('workspace'),
  createdAt: DS.attr('string', {
    defaultValue: function() { return new Date() }
  })

});

App.Workspace = DS.Model.extend({
  name: attr(),
  github_project: attr(),
  user: DS.belongsTo('user'),
  createdAt: DS.attr('string', {
    defaultValue: function() { return new Date() }
  })
});

App.User = DS.Model.extend({
  name: attr(),
  email: attr(),
  created_at: DS.attr('string', {
    defaultValue: function() { return new Date() }
  }),
  updated_at: DS.attr('string', {
    defaultValue: function() { return new Date() }
  })
});

App.File = DS.Model.extend({
  name: attr(),
  content: attr(),
  workspace: DS.belongsTo('workspace'),
  createdAt: DS.attr('string', {
    defaultValue: function() { return new Date() }
  })
});

App.Router.map(function() {
  this.resource('home', {path: '/'}); 
  this.resource('about');
  this.resource("workspaces"); 
  this.resource("workspace", {path: "/workspace/:workspace_id"}); 
  this.resource("settings"); 
  this.resource('posts', function() {
    this.resource('post', {path: ":post_id"});
  });
});

App.AuthenticatedRoute = Ember.Route.extend({
  beforeModel: function() {
    if (!Ember.get('App.CurrentUser')) {
      Ember.set("App.homepage_notification", "Please log in to continue.");
      this.transitionTo("home");
    }
  }
});

App.ApplicationController = Ember.ObjectController.extend({
  actions: {
    logout: function() {
      var self  = this;
      Ember.$.get("/logout.json").then(function(response) {
        Ember.set("App.CurrentUser", null);
        Ember.set("App.homepage_notification", "You have been logged out.");
        self.transitionToRoute("home");
      }); 
    }
  }
});

App.ArrayApplicationController = Ember.ArrayController.extend({
  actions: {
    logout: function() {
      var self  = this;
      Ember.$.get("/logout.json").then(function(response) {
        Ember.set("App.CurrentUser", null);
        Ember.set("App.homepage_notification", "You have been logged out.");
        self.transitionToRoute("home");
      }); 
    }
  }
});

App.SettingsRoute = App.AuthenticatedRoute.extend({
  model: function() {
    self = this; 
    return this.store.find('user', Ember.get('App.CurrentUser').id).then(function(user){
      return user; 
    }, function(err) {
      Ember.set("App.homepage_notification", "Please log in to continue.");
      self.transitionTo("home");
    });
  }
});

App.SettingsController = App.ApplicationController.extend({
  updateButtonText: "Update",
  error: null,

  updateUserSubmit: function() {
    self = this;

    var user = this.get('model');
    self.set("updateButtonText", "Updating...");
    user.save().then(function() {
      self.set("updateButtonText", "Update"); 
    }, function(err) {
      self.set("error", err);  
    });
  } 
});

App.WorkspaceRoute = App.AuthenticatedRoute.extend({
  model: function(params) {
    return this.store.find("workspace", params.workspace_id); 
  },
});

App.WorkspacesRoute = App.AuthenticatedRoute.extend({
  model: function() {
    self = this; 
    return {
      workspaces: this.store.find('workspace'),
      user: this.store.find('user', Ember.get('App.CurrentUser').id)
    } 
  }
});

App.WorkspacesController = App.ApplicationController.extend({
  makingNewWorkspace: null,

  actions: {
    submitNewWorkspace: function() {
      var data = this.getProperties('name');
      data.user = this.get('model').user; 
      var newWorkspace = this.store.createRecord('workspace', data);
      newWorkspace.save();
    },
    cancelNewWorkspace: function() {
      this.set("makingNewWorkspace", false);
    },
    makeNewWorkspace: function() {
      this.set("makingNewWorkspace", true); 
    }
  }
});

App.HomeRoute = Ember.Route.extend({
  activate: function(router) {
    this.controllerFor('home').send('reset'); 
    if (Ember.get("App.CurrentUser")) {
      this.transitionTo("workspaces");
    } 
  },
  deactivate: function() {
    Ember.set("App.homepage_notification", null);
  }
});

App.HomeController = Ember.ObjectController.extend({
  login: false,
  email: null,
  password: null,
  password_confirmation: null,
  error: null,

  reset: function() {
    this.set('login', false);
    this.set('email', null);
    this.set('password', null);
    this.set('password_confirmation', null);
    this.set('error', null);
  },
  signupFormSubmit: function() {
    var self = this; 
    var data = this.getProperties('email', 'password', 'password_confirmation');
    Ember.$.post("/register.json", data).then(function(response) {
      return Ember.$.get("/me.json"); 
    }).then(function(response) {
      Ember.set("App.CurrentUser", response); 
      self.transitionToRoute("workspaces"); 
    });
  },
  loginFormSubmit: function() {
    var self = this; 
    var data = this.getProperties('email', 'password'); 
    Ember.$.post("/login.json", data).then(function(response){
      if (response.success) { 
        Ember.$.get("/me.json").then(function(user) {
          Ember.set("App.CurrentUser", user);
          self.transitionToRoute("workspaces"); 
        });
      } else {
        self.set("error", "Invalid email/password");
      }
    }, function(error){
       self.set("error", "Invalid email/password");
    });
  },

  actions: {
    setLogin: function() {
      this.set('login',true);
    },
    setSignup: function() {
      this.set('login',false);
    }
  }
});

App.PostsRoute = Ember.Route.extend({
  model: function() {
    return posts;
  },
  renderTemplate: function() {
    var postsTemplate = this.render('posts');
    var store = this.store; 
    Ember.run.next(this, function() {
      $(".shell-editor").find(".CodeMirror").remove();
      var shell = Shell.fromTextArea($(document).find(".shell-editor textarea")[0], {
         mode: "r",
         autofocus: true,
         theme: 'blackboard'
      });

      shell.cm.setSize(null, 200);

      shell.cm.on("keyHandled", function(cm, key, eventType) {
        if (key == "Enter") {

          console.log("Enter hit");
          shell.removeCarrot(shell.getDoc().lastLine() + 1);
          console.log(shell.cm.getLine(shell.getDoc().lastLine() - 1));
          
          var line = store.createRecord('shellline', {
             content: shell.cm.getLine(shell.getDoc().lastLine() - 1),
             command: true
          });
          
          line.save();
          // do persistence 
          
          //create new line
          //get rid of carrot on that line
          //start recording text
        }
      });
    });
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

App.NavbarView = Ember.View.extend({
  templateName: 'navbar',
  name: "NavbarView"  
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
