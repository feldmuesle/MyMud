/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

module.exports = function(app, passport){
        
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
    app.post('/signup', function(req, res, next){
       console.log('the name of this dude is '+ req.body.nickname); 
       next();
    });
    
    // process the signup form
    app.post('/signup',passport.authenticate('local-signup',{
        successRedirect: '/game', // if everything worked redirect to user-profile
        failureRedirect: '/index', // if something went wrong, redirect to singup
        failureFlash: true // allow flash-messages
    }));
    
    // show start-screen for game
    app.get('/start', function (req, res){
        var GuildModel = require('../models/guilds.js');
        var PlayerModel = require('../models/plalyer.js');
        GuildModel.find(function(err, guilds){
            if(err){ return console.log(err);}
            res.render('start.ejs', {
               guilds : guilds
           }); 
        });
    });    
    
    
    // show the game 
    // want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/game', isLoggedIn, function(req, res){
        var currentUser = req.user;
        //showGuilds(currentUser, res);
        var GuildModel = require('../models/guilds.js');
        var PlayerModel = require('../models/player.js');
        var UserModel = require('../models/user.js');
        GuildModel.find(function(err, guilds){
            if(err){ return console.log(err);}
            UserModel.findOne({'_id' : currentUser._id}, function(err, user){
                if(err){ return console.log('currentUser somethings wrong: '+err);}
                if(user.nickname){
                    console.log('playerid on user exists: '+user.nickname);
                }else {
                    console.log('playerid on user does not exist.');
                }
                
               res.render('game.ejs', {
                    user        :   user, // get user out of session and into template
                    guilds      :   guilds
                }); 
            });
            
        });       
    });
    
    // logout
    app.get('/logout', function(req, res){
        req.logOut();
        res.redirect('/'); 
    });
};


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
// route midleware to make sure a user is logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        console.log('Yes your are authenticated');
        next();
    }else{
        console.log('you are not logged in');
        res.redirect('/');
    }
}

