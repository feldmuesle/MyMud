/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var RoomModel = require('../models/room.js');
var NpcModel = require('../models/npc.js');
var ItemModel = require('../models/item.js');
var GuildModel = require('../models/guilds.js');
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
    
    app.get('/crud',isLoggedIn, isMe, function (req, res){
        
        console.log('hello from get/crud ');
        
        var npcListen = require('./npc_listeners.js').listeners;
        var itemListen = require('./item_listeners.js').listeners;
        // get all the stuff out of DB
        RoomModel.find().populate('npcs inventory').exec(function(err, rooms){
            if(err){ console.log(err); return;}
            
            NpcModel.find().populate('inventory trade.has trade.wants').exec(function(err,npcs){
                if(err){ console.log(err); return;}
                
                ItemModel.find(function(err, items){
                   if(err){ console.log(err); return;}
                   
                    GuildModel.find(function(err, guilds){
                        if(err){ console.log(err); return;}
                        console.log(guilds);
                        res.render('crud.ejs', {
                                'locations'   :   rooms,
                                'npcListen'   :   npcListen,
                                'itemListen'  :   itemListen,
                                'npcs'        :   npcs,
                                'items'       :   items,
                                'guilds'      :   guilds,
                                'user'        :   req.user,
                                'message'     :   ''
                            });   
                        
                    });               
                });
            });          
        });
    });  
    
    app.post('/crud',isLoggedIn, isMe, function(req, res){
        
        console.log('the form sent is: '+req.body.form);
        
        /********** CREATE ***************/
        if(req.body.form == 'createItem'){
            
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
                
                console.log('item to create: '+item);
                
                item.save(function(err){
                   if(err){
                        console.log('something went wrong when creating an item.');
                        console.log('error '+err); 
                        res.send({
                            'success'   : false,
                            'msg'       : 'could not save item',
                            'errors'    : err.errors});
                    }else{
                        ItemModel.find(function(err, items){
                            if(err){ return console.log(err);}
                            res.send({
                                    'success'   : true,
                                    'msg'       : 'yuppi! - item has been created.',
                                    'items'   :   items
                                });

                        });  
                    }    
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
                
                // check if npc wants to trade anything
                if(req.body.has){
                    npc.has = req.body.has;
                    npc.wants = req.body.wants;
                    npc.swap = req.body.swap;
                    console.log(npc.has+', '+npc.wants+', '+npc.swap);
                }
                
                // attach item-objectId-references properly
                NpcModel.createNpcinDB(npc, items, function(err, npc){
                    if(err){ return console.log(err);}
                     
                    npc.save(function(err){
                    
                        if(err){
                            console.log('something went wrong when creating a npc.');
                            console.log('error '+err); 
                            res.send({
                                'success'   : false,
                                'msg'       : 'could not save npc:',
                                'errors'    : err.errors
                            });
                        }else{
                            // get all the npcs including the new one    
                            NpcModel.find().populate('inventory trade.has trade.wants').exec(function(err,npcs){
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
        
        if(req.body.form == 'createGuild'){
            
            console.log('a new item wants to be created');
            GuildModel.find(function(err, guilds){
                var id = Helper.autoIncrementId(guilds); 
                var guild = new GuildModel();
                guild.id = id;
                guild.name = req.body.name;
                guild.hp = req.body.hp;
                guild.sp = req.body.sp;
                
                console.log('guild to create: '+guild);
                
                guild.save(function(err){
                   if(err){
                        console.log('something went wrong when creating an guild.');
                        console.log('error '+err); 
                        res.send({
                            'success'   : false,
                            'msg'       : 'could not save guild',
                            'errors'    : err.errors});
                    }else{
                        GuildModel.find(function(err, guilds){
                            if(err){ return console.log(err);}
                            res.send({
                                    'success'   : true,
                                    'msg'       : 'yuppi! - guild has been created.',
                                    'guilds'   :   guilds
                                });

                        });  
                    }    
                });        
            });            
        }
        
        /********* UPDATE **************/   
        if(req.body.form == 'updateItem'){
            
            var itemId = Helper.sanitizeNumber(req.body.id);
            ItemModel.findOne({'id':itemId}, function(err, item){
               if(err){console.log(err); return;}
               
                item.keyword = req.body.keyword;
                item.description = req.body.description;
                item.shortDesc = req.body.shortDesc;
                item.maxLoad = req.body.maxLoad;
                item.behaviours = req.body.behaviours;
                
                item.save(function(err){
                    if(err){
                        console.log('something went wrong when updating a room.');
                        console.log('error '+err); 
                        res.send({
                            'success'   : false,
                            'msg'       : 'could not update item',
                            'errors'    : err.errors});
                    }else{
                        ItemModel.find(function(err, items){
                            if(err){ return console.log(err);}
                            res.send({
                                    'success'   : true,
                                    'msg'       : 'yuppi! - item has been updated.',
                                    'items'   :   items
                                });

                        });  
                    }    
                });
            });
        }
        
        if(req.body.form == 'updateRoom'){
            console.log('want to update room');
            var roomId = Helper.sanitizeNumber(req.body.id);
            var room = {
                    id      :   roomId,
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
                    'behaviours' : req.body.behaviours                    
                };
                
            var items = req.body.items;
            
            // check if npc wants to trade anything
            if(req.body.has){
                npc.has = req.body.has;
                npc.wants = req.body.wants;
                npc.swap = req.body.swap;
                console.log(npc.has+', '+npc.wants+', '+npc.swap);
            }
            
            NpcModel.updateNpc(npc, items, function(err, npc){
                if(err){ return console.log(err);}
                console.log('hello from updateNpc-callback');
                npc.save(function(err){
//                    if(err){ return console.log(err);}
                    if(err){
                        console.log('something went wrong when updating a npc.');
                        console.log('error '+err); 
                        res.send({
                            'success'   : false,
                            'msg'       : 'could not update npc:',
                            'errors'    : err.errors
                        });
                    }else{
                        // get all the npcs including the new one    
                        NpcModel.find().populate('inventory trade.has trade.wants').exec(function(err,npcs){
                            if(err){ return console.log(err);}

                            res.send({
                                'success'   : true,
                                'msg'       : 'hurray! - npc has been updated.',
                                'npcs'      :   npcs
                            });

                        }); 
                    } 
                });                
            });            
        }
        
        if(req.body.form == 'updateGuild'){
            
            var guildId = Helper.sanitizeNumber(req.body.id);
            GuildModel.findOne({'id':guildId}, function(err, guild){
               if(err){console.log(err); return;}
               
                guild.name = req.body.name;
                guild.hp = req.body.hp;
                guild.sp = req.body.sp;
                
                guild.save(function(err){
                    if(err){
                        console.log('something went wrong when updating a room.');
                        console.log('error '+err); 
                        res.send({
                            'success'   : false,
                            'msg'       : 'could not update guild',
                            'errors'    : err.errors});
                    }else{
                        GuildModel.find(function(err, guilds){
                            if(err){ return console.log(err);}
                            res.send({
                                    'success'   : true,
                                    'msg'       : 'yuppi! - item has been updated.',
                                    'guilds'   :   guilds
                                });

                        });  
                    }    
                });
            });
        }
        
        /********* DELETE **************/      
        if(req.body.delete == 'itemDel'){
            var itemId = req.body.itemId;
            ItemModel.findOne({'id':itemId},function(err, item){
                if(err){console.error(err); return;}
               
                item.remove(function(err){
                    if(err){console.log(err); return;}
                   
                    ItemModel.find(function(err, items){
                        if(err){console.log(err); return;}

                        res.send({
                            'success':   true,
                            'msg'    :   'item has been removed.',
                            'items'  :   items
                        }); 
                    });
                });
               console.log('item has been removed');
           }); 
        }
        
        if(req.body.delete == 'npcDel'){
            var npcId = req.body.npcId;
            console.log(npcId);
           NpcModel.findOne({'id':npcId},function(err, npc){
               if(err){console.error(err); return;}
               
               npc.remove(function(err){
                    if(err){console.log(err); return;}
                   
                    NpcModel.find(function(err, npcs){
                        if(err){console.log(err); return;}

                        res.send({
                            'success':   true,
                            'msg'    :   'npc has been removed.',
                            'npcs'  :    npcs
                        });
                   }); 
                   
               });
           }); 
        }
        
        if(req.body.delete == 'roomDel'){
            var roomId = req.body.roomId;
           RoomModel.findOne({'id':roomId}).remove().exec(function(err){
               if(err){console.error(err); return;}
               console.log('room has been removed');
               
               RoomModel.find(function(err, rooms ){
                        if(err){console.log(err); return;}

                        res.send({
                            'success'   :   true,
                            'msg'       :   'room has been removed.',
                            'locations' :    rooms
                        });
                   });
           }); 
           
        }
        
        if(req.body.delete == 'guildDel'){
            var guildId = Helper.sanitizeNumber(req.body.itemId);
            GuildModel.findOne({'id':guildId},function(err, guild){
                if(err){console.error(err); return;}
               
                guild.remove(function(err){
                    if(err){console.log(err); return;}
                   
                    GuildModel.find(function(err, guilds){
                        if(err){console.log(err); return;}

                        res.send({
                            'success':   true,
                            'msg'    :   'guild has been removed.',
                            'guilds'  :   guilds
                        }); 
                    });
                });
               console.log('guild has been removed');
           }); 
        }
        
    });
    
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

// route middleware to make sure the user is me
function isMe(req, res, next){
    console.log(req.user);
    if(req.user.email == 'lisa'){
        console.log('Yes you are me');
        next();
    }else{
        console.log('you are not me');
        res.redirect('/');
    }
}