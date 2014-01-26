/* Express */
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

/* Port */
var port = process.env.PORT || 1337;

/* Mongoose DB */
var db = require('./models/db');
var connect = db.connect;
var User = db.User;
var ObjectId = db.ObjectId;

/* Session Store (Mongo) */
var MongoStore = require('connect-mongo')(express);

/* Sessions */
// Next two lines replace bodyParser(), which is deprecated
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.session({store: new MongoStore({
                           db: 'localstore',
                           host: process.env.MONGOLAB_URI,
                           port: 27699
                         }),
                         secret: 'old nassau'}));

/* Flash messages */
var flash = require('connect-flash');
app.use(flash()); // Must come after session initialization?

/* Static files */
app.use(express.static(__dirname + '/public'));
app.use(express.compress());

/* Passport.js */
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({username: username}, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password != password) {
        return done(null, false, { message : 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

connect.on('error', console.error.bind(console, 'connection error:'));
connect.once('open', function callback() {

  /* Routes */
  app.get('/', function (req, res) {
    if (req.user) {
      res.sendfile('logout.html');
    }
    else {
      res.sendfile('index.html');
    }
  });

  app.get('/failure', function (req, res) {
    res.send(req.flash());
  });

  app.get('/canvas', function (req, res) {
    if (!req.user) {
      res.redirect('/login');
    }
    else {
      res.sendfile('drawing.html');
    }
  });

  app.post('/login',
    passport.authenticate('local', { successRedirect: '/canvas',
                                     failureRedirect: '/failure',
                                     failureFlash: true }));

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  io.sockets.on('connection', function (socket) {
    socket.on('down', function (data) {
      io.sockets.emit('down', data);
    });
    socket.on('move', function (data) {
      io.sockets.emit('move', data);
    });
  });
});

server.listen(port);
