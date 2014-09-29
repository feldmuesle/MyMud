/* 
This file contains game-functions for mangaging the game overall (e.g. starting, loading a game, 
 */

var users = []; //array of users that are currently connected
var numUsers =0;
var clients = [];

var Guild = require('../models/guilds.js');
var User = require('../models/user.js');
var Room = require ('../models/room.js');
var PlayerModel = require('../models/player.js');
var Npc = require('../models/npc.js');
var Item = require('../models/item.js');

var RoomManager = require ('../models/helper_models/room_manager.js');
var Texter = require('./texter.js');
var Helper = require('./helper_functions.js');
var Command = require('./command_functions.js');


// get all users currently online
exports.getUsers = function(){ return users;  };

exports.getNumUsers = function(){ return numUsers;};

// load an existing game by userId
exports.loadGame = function(userId, socket, callback){
    
    clients.push(socket);
    console.log('clients when starting game: ');
    console.dir(clients);
    Texter.updateSockets(clients);
    
    
    User.findOne({'_id': userId}, function(err, user){
        if(err){console.error(err); return;}

        if(user.player){
            
            var player = user.player[0]; // there will always only be one player per user
            player.socketId = socket.id;
            users.push(player.nickname);
            numUsers++;
            Texter.addListeners(socket.id);
            
            user.save(function(err){
                if(err){console.error(err); return;}
                
                Texter.welcomeAgain(player);

                Room.findOne({'id' : player.location}, function(err, room){
                    if(err){console.error(err); return;}

                    if(room){
                        
                        RoomManager.addPlayerToRoom(room.id, player);                        
                    }
                }).populate('npcs inventory').exec(function(err){if(err){console.error(err); return;};})
                    .then(function(room){
                    Item.populate(room.npcs, {path : 'inventory ', model:'Item'}, function(err, npcs){
                        if(err){console.error(err); return;}
                        
                        // now that we got all stuff, let room and npc handle it
                        room.setListeners();
                        room.announce(player); // writes description to player
                        
                        if(npcs.length >0){                            
                            
                            npcs.forEach(function(npc){
                                npc.setListeners();
                                npc.playerEnters(player);
                            });
                        }

                    var roomies = RoomManager.getPlayersInRoom(room.id);

                    var game = {
                        online  :   users,
                        player  :   user.player[0],
                        room    :   room,
                        roomies :   roomies
                    };
                   return callback(game);

                }); 
            });
        });
        }
    });
};

// load a entire new game by det given userinput
exports.startNewGame = function(userId, nickname, guild, gender, socket, callback){
        
    clients.push(socket);
    console.log('clients when starting game: ');
    console.dir(clients);
    Texter.updateSockets(clients);
    Texter.addListeners();
    
    //console.log('hello from startNewGame-function');
    var newPlayer;

   //get the chosen guild and set attributes according to it
   Guild.findOne({name :guild},function(err, doc){    

        if(err){return console.error(err);}

        newPlayer = new PlayerModel();
        newPlayer.nickname = nickname;
        newPlayer.guild = guild;
        newPlayer.gender = gender;
        newPlayer.socketId = socket.id;            

        // parse mongoose-document to javascript-object
        var stringyGuild = JSON.stringify(doc);
        var newGuild = JSON.parse(stringyGuild);

        // set all the players properties
        newPlayer.attributes['hp'] = newGuild.hp;
        newPlayer.attributes['sp'] = newGuild.sp;

       // call init-function, set default-values and set-up eventlisteners;
       newPlayer.initialize(socket);

        // when all is good, push the player into users-array and increment
        users.push(newPlayer.nickname);
        numUsers++;
    }).exec()
    .then(function(){
        //save the player in user in the database
        User.findOne({_id : userId}, function(err, user){
            if(err){console.error(err); return;}  
            if(user){
                //console.log('yes we have found an user to save at player in');
                user.player.push(newPlayer);
                user.save(function(err){
                    if(err){ console.error(err); return;}
                    console.log(newPlayer);
                    Texter.welcome(newPlayer);
                });
             }
         }).exec()
        .then(function(){
            // finally get the room
            Room.findOne({'id':'0'},function(err, room){
                    if(err){console.error(err); return;}

                    if(room){
                        room.setListeners();
                        room.announce(newPlayer);
                        RoomManager.addPlayerToRoom(room.id, newPlayer);

                        
                    }
                }).populate('npcs inventory').exec(function(err){if(err){console.error(err); return;};})
                    .then(function(room){
                    Item.populate(room.npcs, {path : 'inventory ', model:'Item'}, function(err, npcs){
                        if(err){console.error(err); return;}

                        if(npcs.length >0){

                            npcs.forEach(function(npc){
                                console.log(npc.keyword +' has item '+npc.inventory[0]);
//                                npc.setListeners();
//                                npc.playerEnters(newPlayer);

                            });
                        }

                    var roomies = RoomManager.getPlayersInRoom(room.id);

                    var game = {
                        online  :   users,
                        player  :   newPlayer,
                        room    :   room,
                        roomies :   roomies
                    };
                   return callback(game);
                    });
            });
        });
    });
};
    
exports.removePlayer = function(socket, callback){
    
    if(users.length > 0){ // in case server shut down and avoid negative numbers
        --numUsers;
        var disconnected = users.indexOf(socket.pseudo);
        users.splice(disconnected, 1);
        //take socket out of clients, then update texter
        var clientI =  Helper.getIndexByKeyValue(clients, 'pseudo', socket.pseudo);
        clients.splice(clientI, 1);
        Texter.updateSockets(clients);
        
        var player = RoomManager.getPlayerByName(socket.pseudo, socket.roomId);
        console.log('disconnected player: '+player);
        // save the player
        User.savePlayer(player);
        
        // use instead socket.nickname to search for player in roomarray in roommanager
        var roomies = RoomManager.removePlayerFromRoom(socket.roomId, socket.pseudo, 
                                        RoomManager.getPlayersInRoom(socket.roomId));
        //console.dir(roomies);   
        console.log(socket.pseudo +' is now disconnected.');
        
        var data = {
          numUsers  : numUsers,
          roomies   : roomies,
          online    : users
        };
        
        callback(data);

    }
};

exports.checkCommand = function(commands, playerObj, room, callback){
    
    // get the player as mongoose-doc and set listeners
    var player = PlayerModel.getPlayer(playerObj);
    player.setListeners();
    // if there's only one word
    if(commands.length < 2){
        console.log('hello from only one argument. '+commands[0]);
        switch(commands[0]){
            case 'backpack':
                // get the player from DB
                User.getPlayerByName(player.nickname).exec(function(err, user){
                    if(err){console.error(err); return;}
                    
                    var player = user.player[0];
                    player.setListeners();
                    player.emit('inventory');                    
                });
                break;
            
            case 'help':
                //TODO: show help-info
                break;
            
            default:
                var msg = '*'+commands[0]+' alone won\'t work. You are missing arguments.';
                Texter.write(msg, player.socketId);
                break;
        }        
        return;
    }    
    
    // if there are at least two commands
    switch(commands[0]){

        case 'look': 
                var who = commands[1];
                                
                // check if who matches a npc, item or other player in the arrays
                var npcI = Helper.getIndexByKeyValue(room.npcs, 'keyword', who);
                var itemI = Helper.getIndexByKeyValue(room.inventory, 'keyword', who);
                var playerI = users.indexOf(who);
                        
                switch(true){
                    case (who == room.name || who == room.name.toLowerCase()):
                        
                        player.emit('look', who);
                        Room.getRoomWithNpcs(room.id).exec(function(err,room){
                            if(err){console.error(err); return;}
                            room.setListeners();
                            room.look(player);                            
                        });
                        break;
                    
                    case (npcI != null): // if it matched an npc
                        
                        Npc.getInventory(room.npcs[npcI]['_id']).exec(function(err,npc){
                            if(err){console.error(err); return;}
                            
                            // look also for items if command is eg '*look npc item'
                            if(commands.length > 2){
                               var what = commands[2]; 
                               var itemI = Helper.getIndexByKeyValue(room.npcs[npcI].inventory, 'keyword', what);
                               
                               if(itemI != null){ // if an npc-item got matched
                                   
                                   player.emit('look', what);
                                   Item.findOne({'_id':room.npcs[npcI].inventory[itemI]['_id']}, function(err,item){
                                        if(err){console.error(err); return;}
                                        item.setListeners();
                                        item.emit('look', player);                            
                                    });
                               }
                               
                            }else { 
                                player.emit('look', who);
                                npc.setListeners();
                                npc.emit('look', player); 
                            }                                                       
                        });
                        break;
                    
                    case (itemI != null):
                        player.emit('look', who);
                        //OBS! this should not come from db, since the room could have a droped item
                        Item.findOne({'_id':room.inventory[itemI]['_id']}, function(err,item){
                            if(err){console.error(err); return;}
                            item.setListeners();
                            item.emit('look', player);                            
                        });
                        break;
                    
                    case (playerI != null && who == users[playerI]):
                        var msg = 'It\'s not polite to stare at other people.';
                        Texter.write(msg, player.socketId);
                        break;
                
                    default:
                        var msg = 'There\'s nothing to look at darling.';
                        Texter.write(msg, player.socketId);
                        break;
                
                }
                break;
            

        case "attack":
            var who = commands[1];
            
            // check if there are any npcs and if there are any find the right one
            var npcI = Helper.getIndexByKeyValue(room.npcs, 'keyword', who);
            var playerI = users.indexOf(who);
            
            switch(true){
                    case (npcI != null):
                        console.log('attack '+who);
                        Command.battleNpc('attack',room.npcs[npcI], player, room);
                        //TODO: attack-function, where all the stuff happens
                        
                        break;
                        
                    case (who == player.nickname):
                        var msg = 'Apperently you got some masochistic issues and slap yourself. This doesn\'t really make sense.';  
                        Texter.write(msg, player.socketId);
                        break;
                    
                    case (playerI != null && who == users[playerI]):
                        
                        User.getPlayerByName(who).exec(function(err, user){
                            if(err){console.error(err); return;}
                            var attacker = PlayerModel.getPlayer(player);
                            var defender = PlayerModel.getPlayer(user.player[0]);
                            Command.battlePlayer(attacker, defender, room);
                        });
                        
                        break;
                
                    default:
                        var msg = 'No '+who+ ' around you could attack.';
                        Texter.write(msg, player.socketId);
                        break;
                
                }
                break;  
            
        case "take":
            console.log('hello from take');
            var what = commands[1];
            
            // check if what exist in rooms inventory-array, if it does, take it
            var itemI = Helper.getIndexByKeyValue(room.inventory, 'keyword', what);            
            if(itemI != null){
                
                var item = room.inventory[itemI];
                Command.takeItem(item, player);                         
            }
            break;  
            
        case "drop":
            console.log('hello from drop');
            var what = commands[1];
            
            Command.dropItem(what, player, room);              
            break;
            
        case "say":
            console.log('do you want to say something?');
            var msg='';
            for(var i=1; i<commands.length; i++ ){
                msg += commands[i] + ' ';
            }
            msg = Helper.sanitizeString(msg);
            Texter.broadcastRoomies(player.nickname+' says: \''+msg+'\'', player.socketId, room.name);
            console.log('say '+msg);
            break;

        // if command isn't found
        default:
                var msg ='\'';
                for(var i=0; i<commands.length; i++){
                    msg += commands[i]+ ' ';
                }

                msg +='\' is not a valid command. Maybe you mispelled something?';
                Texter.write(msg, player.socketId);
                break;  
            }
      
};

exports.test = function(roomId) {
  Room.findOne({id: roomId})
    .populate('npcs')
    .exec(function(err) {
        if(err){console.error(err); return;}
      
    }).then(function(third){
        console.log('inside test: '+third);
        console.log('item: '+third.npcs[0].inventory[0]);
        console.log('health: '+third.npcs[0].attributes['health']);
        Item.populate(third.npcs, {path : 'inventory ', model:'Item'}, function(err, npcs){
            if(err){console.error(err); return;}
            
            npcs.forEach(function(npc){
                console.log(npc.keyword +' has item '+npc.inventory[0]);

            });
        }).exec(function(err) {
            if(err){console.error(err); return;}
      
        }).then(function(){
            console.log('and the end:');
                    console.dir(third.npcs[0]);
            console.log('last item: '+third.npcs[0].inventory[0]);
        });      
  });
};

exports.changeRoom = function(oldRoom, newRoomId, player, callback){
    
    Room.findOne({id: newRoomId})
    .populate('npcs inventory')
    .exec(function(err) {
        if(err){console.error(err); return;}
      
    }).then(function(newRoom){
        
        newRoom.setListeners();
        newRoom.announce(player);
        Item.populate(newRoom.npcs, {path : 'inventory ', model:'Item'}, function(err, npcs){
            if(err){console.error(err); return;}
            
            npcs.forEach(function(npc){
                console.log(npc.keyword +' has item '+npc.inventory[0]);
                npc.setListeners();
                npc.emit('playerEnters', player);

            });
            // change players location
            player.location = newRoom.id;
            //remove player from old roomlist and add to new roomlist
            RoomManager.removePlayerFromRoom(oldRoom.id, player.nickname,
            RoomManager.addPlayerToRoom(newRoom.id, player)); 

            var newRoomies = RoomManager.getPlayersInRoom(newRoom.id);
            var oldRoomies = RoomManager.getPlayersInRoom(oldRoom.id);

            var data ={
                'newRoomies'    : newRoomies,
                'oldRoomies'    : oldRoomies,
                'newRoom'       : newRoom
            }; 
            
            callback(data);
        }); 
    });
};


exports.getNpc = function(){
    console.log('hello from getNpc');
    
    var pandaConfig = {
        id          :   2,
        name        :   'Poodie',
        location    :   2,
        hp          :   15,
        sp          :   0,
        shortDesc   :   'On top of a bookshelf is a panda. And it\'s alive.',
        description :   'The panda watches you with friendly eyes and jumps off the shelf. Hello my friend.',
        maxLoad     :   1
    };
    
    var panda = new Npc();
    panda.initialize(pandaConfig);
    panda.testEvent();
//    panda.save(function(err,npc){
//        if(err){console.error(err); return;}
//        console.log(npc);
//    });
    
};


