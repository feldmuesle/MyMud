/* 
This is the start-up file
 */

// get all tools/modules needed

var express = require('express');
//var expressValidator = require('express-validator');

var app = express();
var http = require ('http');
var server = http.createServer(app);
var port = (process.env.PORT | 0) || 3000;
var db = require('mongoose');
var passport = require ('passport');
var flash = require ('connect-flash');
var io = require('socket.io').listen(server);
var game = require('./app/controllers/socket_server.js');
var path = require('path');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');


/********** configuration ************/

// connect to database
db.connect(configDB.url);
console.log(configDB.url);

require('./config/passport')(passport); //pass passport for configuration

// setup of express
app.use(morgan('dev')); //log every http-request to console
app.use(cookieParser()); //read cooies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true})); // get input-values from forms
//app.use(expressValidator);

// Do not advertise that we use ExpressJS.
app.disable('x-powered-by');

app.set('view engine','ejs'); // set up view-engine to use ejs for templating
app.set('views', __dirname +'/app/views' );

// get static files
app.use(express.static(path.join(__dirname,'public')));

// required setup for passport
app.use(session({ 
    secret: 'ilovethesecretkeyboardcatmiau', // session-secret
    resave: true,
    saveUninitialized: true
})); 
app.use(passport.initialize());
app.use(passport.session()); //persistent login-sessions
app.use(flash()); // use connect-flash for flash messages stored in session

/*********** configure game ***********/
var Guild = require('./app/models/guilds.js');
var Room = require('./app/models/room.js');


/**************************************************************************************************/

/********** game ********/
io.sockets.on('connection', function(socket){
    console.log('connection works');
    game.response(socket);
});

/*********** routes *************/
require('./app/controllers/routes.js')(app, passport, game); // load the routes and pass in our app and fully configured passport

//var currentUser = require('./app/model/sessionhelper.js')(req);
//console.log('test in server.js: var currentUser= '+currentUser.req.user);
/********** launch ************/
server.listen(port);
console.log('The magic is happening at port 3000');