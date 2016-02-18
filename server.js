// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 80;
var passport = require('passport');
var flash    = require('connect-flash');
var path     = require('path');
var poll     = require('./backend/scripts/polling');
var timeCron = require('./backend/scripts/timeControl');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var mongoose = require('./config/database.js');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// configuration ===============================================================

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: '3102230' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(path.join(__dirname, 'dist')));

// MQTT ========================================================================
poll.cont(); //[Future] I need to discover how to create a second mongodb connection to run stand-alone this

// ALARMS ======================================================================
timeCron.retoreAlarms();

// routes ======================================================================
require('./backend/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


// launch ======================================================================
app.listen(port);
console.log('[LightDNA] Server listening on port:' + port);
