/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

module.exports = function(app, passport, game){
        
    // homepage (with login-links)
    app.get('/', function(req, res){
        res.render('index.ejs'); // load index.ejs as template
    });
    
    // show the login-form and pass in any flash data if it exists
    app.get('/login', function(req, res){
       res.render('login.ejs', {message: req.flash('loginMessage')}); 
    });
    
    // process the login form
    app.post('/login', passport.authenticate('local-login',{
        successRedirect: '/game',
        failureRedirect: '/login',
        failureFlash: true
    }));
    
    // show the signup-form and pass in any flash data if it exists
    app.get('/signup', function(req, res){
        
        console.log('Hello from route get signup');
       res.render('signup.ejs', {message: req.flash('signupMessage')}); 
       
    });
    
    // process the signup form
    app.post('/signup',passport.authenticate('local-signup',{
        successRedirect: '/game', // if everything worked redirect to user-profile
        failureRedirect: '/index', // if something went wrong, redirect to singup
        failureFlash: true // allow flash-messages
    }));
    
    // show start-screen for existing player
    app.get('/game', isLoggedIn, function (req, res){
      
        var GuildModel = require('../models/guilds.js');
        console.log('hello from start-routes');
        GuildModel.find(function(err, guilds){
            if(err){ return console.log(err);}
            res.render('game.ejs', {
               guilds   :   guilds,
               user     :   req.user,
               message  :   ''
           }); 
        });
    });  
    
//    app.post('/game', checkNickname, function(req, res){
//        // check middleware to see whats going on :)        
//    });
    
//    app.get('/start', isLoggedIn, function (req, res){
//        var GuildModel = require('../models/guilds.js');
//        console.log('hello from start-routes');
//        GuildModel.find(function(err, guilds){
//            if(err){ return console.log(err);}
//            res.render('start.ejs', {
//               guilds   :   guilds,
//               user     :   req.user,
//               message  :   ''
//           }); 
//        });
//    });  
//    
//    app.post('/start', checkNickname, function(req, res){
//        // check middleware to see whats going on :)        
//    });
    
    
    // if the user loads an existing game
//    app.post('/game', isLoggedIn, function(req, res){
//        
//            
//            console.log('routes: reloading existing game');
//            res.render('game.ejs', {
//                user : req.user
//            });
//    });
    
    
    // show the game 
    // want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
//    app.get('/game', isLoggedIn, function(req, res){
//        var currentUser = req.user;
//        console.log('hello from routes-get-game.js');
//        //showGuilds(currentUser, res);
//        var GuildModel = require('../models/guilds.js');
//        var UserModel = require('../models/user.js');
//        GuildModel.find(function(err, guilds){
//            if(err){ return console.log(err);}
//            UserModel.findOne({'_id' : currentUser._id}, function(err, user){
//                if(err){ return console.log('currentUser somethings wrong: '+err);}
//                if(user.nickname){
//                    console.log('playerid on user exists: '+user.nickname);
//                }else {
//                    console.log('playerid on user does not exist.');
//                }
//                
//               res.render('game.ejs', {
//                    user        :   user, // get user out of session and into template
//                    guilds      :   guilds
//                }); 
//            });
//            
//        });       
//    });
    
    // logout
    app.get('/logout', function(req, res){
        req.logOut();
        res.redirect('/'); 
    });
};

//middelware to check if nickname exists
function checkNickname(req, res){
    var User = require('../models/user.js');
    User.findOne({'nickname': req.body.nickname}, function(err, user){
        if(err){console.error(err); return;}
        
        // if there's already a user with this nickname, prompt user to choose another one
        if(user){
            
            var GuildModel = require('../models/guilds.js');
            GuildModel.find(function(err, guilds){
                if(err){ return console.log(err);}

                // show form again to user
                res.render('game.ejs', {
                   guilds   :   guilds,
                   user     :   req.user,
                   message  :   'this nickname is already taken, please choose a different nickname.'
               }); 
            });

        }else{
            console.log('there is no player called '+req.body.nickname+' yet');
            User.findOneAndUpdate({_id : req.user._id}, {nickname : req.body.nickname}, function(err, user){
               if(err){console.error(err); return;}
            }); 
            
        }              
    });
}


//middleware to get guild-model and render it
function showGuilds(user, res){
    var guild = require('../models/guilds.js');
    guild.find(function(err, guilds){
        if(err){ return console.log(err);}
        res.render('game.ejs', {
           user: user, // get user out of session and into template
           guilds : guilds
       }); 
    });

}
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        console.log('Yes your are authenticated');
        next();
    }else{
        console.log('you are not logged in');
        res.redirect('/');
    }
}

