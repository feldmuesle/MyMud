/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var RoomModel = require('../models/room.js');
var NpcModel = require('../models/npc.js');
var ItemModel = require('../models/item.js');
var Helper = require('./helper_functions.js');

module.exports = function(app, passport, game){
        
    // homepage (with login-links)
    app.get('/', function(req, res){
        console.log('hello from index');
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
    
    app.get('/crud', isLoggedIn, function (req, res){
        
        console.log('hello from get/crud ');
        
        var npcListen = require('./npc_listeners.js').listeners;
        var itemListen = require('./item_listeners.js').listeners;
        RoomModel.find().populate('npcs inventory').exec(function(err, rooms){
            if(err){ return console.log(err);}
            
            NpcModel.find().populate('inventory').exec(function(err,npcs){
                if(err){ return console.log(err);}
                
                ItemModel.find(function(err, items){
                   if(err){ return console.log(err);}
                    
                    res.render('crud.ejs', {
                    locations   :   rooms,
                    npcListen   :   npcListen,
                    itemListen  :   itemListen,
                    npcs        :   npcs,
                    items       :   items,
                    user        :   req.user,
                    message     :   ''
                    });                    
                   
                });
            });          
        });
    });  
    
    app.post('/crud',isLoggedIn, function(req, res){
        
        console.log('the form sent is: '+req.body.form);
        
        /********** CREATE ***************/
        if(req.body.form == 'createItem'){
            
            req.assert('keyword','The room must have a name.').notEmpty();
            
            var errors = req.validationErrors();
            
            if(errors){
                
            }else {};
            
            console.log('a new item wants to be created');
            ItemModel.find(function(err, items){
                var id = Helper.autoIncrementId(items); 
                var item = new ItemModel();
                item.id = id;
                item.keyword = req.body.keyword;
                item.description = req.body.description;
                item.shortDesc = req.body.shortDesc;
                item.maxLoad = req.body.maxLoad;
                item.behaviours = req.body.behaviours;
                
                item.save(function(err){
                   if(err){console.error(err); return;} 
                   console.log('item has been saved');
                });        
            });            
        }
        
        if(req.body.form == 'createRoom'){
            console.log('a new room wants to be created');
            
            RoomModel.find(function(err, rooms){
                var id = Helper.autoIncrementId(rooms); 
                var room = new RoomModel();
                room.id = id;
                console.log('new id is : '+id);
                room.name = req.body.keyword;
                room.description = req.body.description;
                var npcs = req.body.npcs;
                var items = req.body.items;
                var exits = req.body.exits;


                RoomModel.createRoomWithNpc(room, exits, npcs, items, function(err, newRoom){
                    if(err){console.error(err); return;}; 
                    console.log('hello from callback' +newRoom);

                    newRoom.save(function(err){
                        if(err){
                            console.log('something went wrong when creating a room.');
                            console.log('error '+err); 
                            res.send({
                                'success'   : false,
                                'msg'       : 'could not save room, due to',
                                'errors'    : err.errors});
                        }else{
                            RoomModel.find().populate('npcs inventory').exec(function(err, rooms){
                                if(err){ return console.log(err);}

                                res.send({
                                    'success'   : true,
                                    'msg'       : 'yuppi! - room has been updated.',
                                    'locations'   :   rooms

                                });

                            });

                        }    
                    });  

                });
            });                
        };
        
        if(req.body.form == 'createNpc'){
            console.log('a new npc wants to be created');
            NpcModel.find(function(err, npcs){
                var id = Helper.autoIncrementId(npcs); 
                var npc = {
                    'id': id,
                    'keyword' : req.body.keyword,
                    'gender' : req.body.gender,
                    'description' : req.body.description,
                    'shortDesc' : req.body.shortDesc,
                    'maxLoad' : req.body.maxLoad,
                    'pacifist' : req.body.pacifist,
                    'actions':{
                        'playerDrops': req.body.playerDrops,
                        'playerEnters': req.body.playerEnters,
                        'playerChat': req.body.playerChat
                    },
                    'attributes':{
                        'hp':req.body.hp,
                        'sp': req.body.sp,
                        'health': req.body.health
                    },
                    behaviours : req.body.behaviours                    
                };                
                var items = req.body.items;
                
                // attach item-objectId-references properly
                NpcModel.createNpcinDB(npc, items, function(err, npc){
                    if(err){ return console.log(err);}
                     
                    npc.save(function(err){
                    
                        if(err){
                            console.log('something went wrong when creating a npc.');
                            console.log('error '+err); 
                            res.send({
                                'success'   : false,
                                'msg'       : 'could not save room, due to',
                                'errors'    : err.errors
                            });
                        }else{
                            // get all the npcs including the new one    
                            NpcModel.find().populate('inventory').exec(function(err,npcs){
                                if(err){ return console.log(err);}

                                res.send({
                                    'success'   : true,
                                    'msg'       : 'hurray! - npc has been created.',
                                    'npcs'        :   npcs
                                });

                            }); 
                        } 
                    });
                });
            });
        }
        
        /********* UPDATE **************/     
        if(req.body.form == 'updateRoom'){
            console.log('want to update room');
            var room = {
                    id      :   req.body.id,
                    name    :   req.body.keyword,
                    description : req.body.description
                };
            
            var npcs = req.body.npcs;
            var items = req.body.items;
            var exits = req.body.exits;
            
            RoomModel.updateRoom(room, exits, npcs, items, function(err, room){
                if(err){console.error(err); return;};
                console.log('hello from updateRoom-callback '+room);
                room.save(function(err){
                    if(err){
                        console.log('something went wrong when creating a room.');
                        console.log('error '+err); 
                        res.send({
                            'success'   : false,
                            'msg'       : 'could not update room, due to',
                            'errors'    : err.errors});
                    }else{
                        RoomModel.find().populate('npcs inventory').exec(function(err, rooms){
                            if(err){ return console.log(err);}
                            res.send({
                                    'success'   : true,
                                    'msg'       : 'yuppi! - room has been updated.',
                                    'locations'   :   rooms
                                });

                        });  
                    }    
                }); 
            });
        }
        
        if(req.body.form == 'updateNpc'){
            
            var npc = {
                    'id': req.body.id,
                    'keyword' : req.body.keyword,
                    'gender' : req.body.gender,
                    'description' : req.body.description,
                    'shortDesc' : req.body.shortDesc,
                    'maxLoad' : req.body.maxLoad,
                    'pacifist' : req.body.pacifist,
                    'actions':{
                        'playerDrops': req.body.playerDrops,
                        'playerEnters': req.body.playerEnters,
                        'playerChat': req.body.playerChat
                    },
                    'attributes':{
                        'hp':req.body.hp,
                        'sp': req.body.sp,
                        'health': req.body.health
                    },
                    behaviours : req.body.behaviours                    
                };
                console.log('npc to update: '+npc);
            var items = req.body.items;
            
            NpcModel.updateNpc(npc, items, function(err, npc){
                console.log('hello from updateNpc-callback');
                npc.save(function(err){
//                    if(err){ return console.log(err);}
                    if(err){
                        console.log('something went wrong when creating a npc.');
                        console.log('error '+err); 
                        res.send({
                            'success'   : false,
                            'msg'       : 'could not save npc, due to',
                            'errors'    : err.errors
                        });
                    }else{
                        // get all the npcs including the new one    
                        NpcModel.find().populate('inventory').exec(function(err,npcs){
                            if(err){ return console.log(err);}

                            res.send({
                                'success'   : true,
                                'msg'       : 'hurray! - npc has been created.',
                                'npcs'      :   npcs
                            });

                        }); 
                    } 
                });                
            });            
        }
        
        /********* DELETE **************/      
        if(req.body.delete == 'itemDel'){
            var itemId = req.body.itemId;
           ItemModel.findOne({'id':itemId}).remove().exec(function(err){
               if(err){console.error(err); return;}
               console.log('item has been removed');
           }); 
        }
        
        if(req.body.delete == 'npcDel'){
            var npcId = req.body.npcId;
           NpcModel.findOne({'id':npcId}).remove().exec(function(err){
               if(err){console.error(err); return;}
               console.log('npc has been removed');
           }); 
        }
        
        if(req.body.delete == 'roomDel'){
            var roomId = req.body.roomId;
           RoomModel.findOne({'id':roomId}).remove().exec(function(err){
               if(err){console.error(err); return;}
               console.log('room has been removed');
           }); 
        }
        
    });
    
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


//middleware to get all the stuff out of db (room, npcs, items)
function getEverything(res, req, next){
    
    var npcListen = require('./npc_listeners.js').listeners;
    var itemListen = require('./item_listeners.js').listeners;
    RoomModel.find().populate('npcs inventory').exec(function(err, rooms){
            if(err){ return console.log(err);}
            
            NpcModel.find().populate('inventory').exec(function(err,npcs){
                if(err){ return console.log(err);}
                
                ItemModel.find(function(err, items){
                   if(err){ return console.log(err);}
                    
                    var data = {
                    locations   :   rooms,
                    npcListen   :   npcListen,
                    itemListen  :   itemListen,
                    npcs        :   npcs,
                    items       :   items,
                    user        :   req.user,
                    message     :   ''
                    };
                    
                    req.everything = data;
                    return next();
                   
                });
            });          
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

