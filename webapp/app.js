/*
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , passportLocalMongoose = require('passport-local-mongoose');

var app = express();
var RedisStore = require("connect-redis")(express);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  store: new RedisStore({
    host: "localhost",
    port: 6379,
    db: 2
  }),
  secret: '1234567890QWERT',
  cookie: {maxAge: 300000000000}
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var timestamps = function(schema, options) {
  schema.add({
    created_at : Date,
    updated_at : Date
  });

  schema.pre('save', function(next) {
    var currentTime = new Date;
    this.updated_at = currentTime;
    if (!this.created_at) {
      this.created_at = currentTime
    }
    next();
  });
};

var workspaceSchema = new Schema({
  name : String,
  user_id : String
});

workspaceSchema.plugin(timestamps, {});

var userSchema = new Schema({
  email: String,
  name: String
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
});

userSchema.plugin(timestamps, {});

userSchema.methods.toJSON = function() {
  return {
    email: this.email,
    name: this.name,
    id: this.id,
    created_at: this.created_at,
    updated_at: this.updated_at
  }
};

var User = mongoose.model('User', userSchema);
var Workspace = mongoose.model('Workspace', workspaceSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//mongoose
mongoose.connect('mongodb://localhost/passport_local_mongoose');

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.post("/login.json", passport.authenticate('local'), function(req, res) {
  res.json({success: true});
})

app.get('/logout.json', function(req, res) {
  req.logout();
  res.json({success: true});
});

app.post("/register.json", function(req, res) {
  User.register(new User({email: req.body.email}), req.body.password, function(err, user) {
    if (err) {
      return res.json({success: false, error:  err});
    }

    passport.authenticate('local')(req, res, function() {
      res.json({success: true});
    });
  });
});

app.get('/me.json', function(req, res) {
  var user = req.user;
  if (user) {
    var json_payload = user.toJSON();
    json_payload["logged_in"] = true;
    res.json(json_payload);
  } else {
    res.json({logged_in: false});
  }
});

app.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(error,user) {
    if (req.user.id == user.id) {
      res.json({user: user.toJSON()});
    } else {
      res.json({success: false});
    }
  });
});

app.put("/users/:id", function(req, res) {
  User.findById(req.params.id, function(error, user) {
    user.update(req.body["user"], function(error, resp){
      if (error ) {
        console.log(error);
      }

      res.json({user: user.toJSON});
    });
  });
});

app.get("/workspaces", function(req, res) {
  var id = req.user.id;

  Workspace.find({user_id: id}, function(err, workspaces) {
    res.json({workspaces: workspaces});
  });
});

app.post("/workspaces", function(req, res) {
  var user_id = req.user.id;

  var params = req.body.workspace;
  params.user_id = user_id;
  Workspace.create(req.body.workspace, function(error, workspace) {
    res.json({workspace: workspace});
  }); });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
