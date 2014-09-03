// get all the stuff we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user-model
var User = require('../app/models/user.js');

// expose this function to the app using module.export
module.exports = function(passport){
    
    /********* passport session setup **************/
    // required for persistent login sessions
    // passport needs abitlity to serialize/deserialize userdata out of session
    // serialize user for session
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err,user );
        });
    });
    
    /*********** local signup ***************/
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({

        // by default local-strategy uses username and password, we will override it with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // pass back entire request to callback
    }, function(req, email, password, done){
          // asynchronous
          // User.findOne wont fire unless data is sent back
          process.nextTick(function(){
              // find a user whose email is the same as the forms email
              // we are checking to see if the user trying to login already exists 
              User.findOne({'email' : email}, function(err, user){
                  if(err){ // if there are any errors return them
                      return done(err);
                  }
                  // check if there's already a user with this email
                  if(user){
                      return done(null, false, req.flash('signupMessage', 'The user with this email has already signed up.'));
                  }else{
                      // if there is no user with that email
                      // create the user
                      var newUser = new User();
                      // set the users local credentials
                      newUser.nickname = req.body.nickname;
                      newUser.email = email;
                      newUser.password = newUser.generateHash(password);
                      // save the user
                      newUser.save(function(err){
                         if(err){
                             console.log('there is an error when saving');
                             console.log(err); return;
                             //throw err;
                          }else {
                              return done(null, newUser);
                          }                       
                      });                    
                  }                
              });
          });
        }
  
    )); 
    
    // passport-local-login
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
        
    }, function(req, email, password, done){
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
//        email = 'Alfred';
//        password = 'something';

        User.findOne({'email': email}, function(err, user){
           // if there are any errors show before anything else
           if(err){
               return done(err);
           }
           // if no user is found, write message
           if(!user){
               return done(null, false, req.flash('loginMessage', 'No user with email '+email+ ' found.'));
           }
           
           // if the user is found but the password doesn't match
           if(!user.validPassword(password)){
               return done(null, false, req.flash('loginMessage', 'Ooops! There\'s a mismatch!'));
           }
           
           // if everything's fine, wuhu!
           return done(null, user);
           
        });
    }));
    
};  

