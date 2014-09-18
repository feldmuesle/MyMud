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
       // now we can call the write-listner which emits a message to the player
        newPlayer.write('Here is a written message!');

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
                user.player = newPlayer;
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
        //TODO: take socket out of clients, then update texter
        Texter.updateSockets(clients);
        var disconnected = users.indexOf(socket.pseudo);
        users.splice(disconnected, 1);
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

exports.checkCommand = function(commands, player, room, callback){
    
    // get the player as mongoose-doc and set listeners
    var player = PlayerModel.getPlayer(player);
    player.setListeners();
    
    // if there's only one word
    if(commands.length < 2){
        var msg = '*'+commands[0]+' alone won\'t work. You are missing arguments.';
        Texter.write(msg, player.socketId);
        return;
    }    
    console.log('room');
    console.dir(room.npcs[0].inventory);
    switch(commands[0]){

        case 'look': 
                var who = commands[1];
                                
                // check if there are npcs and check them if there are any
                var npcI = Helper.getIndexByKeyValue(room.npcs, 'keyword', who);
                var itemI = Helper.getIndexByKeyValue(room.inventory, 'keyword', who);
                var playerI = users.indexOf(who);
                        
                switch(true){
                    case (who == room.name || who == room.name.toLowerCase()):
                        player.emit('look', who);
                        Texter.write('You take at good look at the '+who, player.socketId);
                        Room.getRoomWithNpcs(room.id).exec(function(err,room){
                            if(err){console.error(err); return;}
                            room.setListeners();
                            room.look(player);                            
                        });
                        break;
                    case (npcI != null):
                        
                        Npc.getInventory(room.npcs[npcI]['_id']).exec(function(err,npc){
                            if(err){console.error(err); return;}
                            
                            // look also for items if command is eg '*look npc item'
                            if(commands.length > 2){
                               var what = commands[2]; 
                               var itemI = Helper.getIndexByKeyValue(room.npcs[npcI].inventory, 'keyword', what);
                               
                               if(itemI != null){
                                   
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
                                npc.look(player); 
                            }
                                                       
                        });
                        break;
                    
                    case (itemI != null):
                        player.emit('look', who);
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
                        var msg = 'There\'s nothing to look at my dear.';
                        Texter.write(msg, player.socketId);
                        break;
                
                }
                break;
            

        case "attack":
            console.log('hello from attack');
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
                        var msg = 'Apperently you got some masocistic issues and slap yourself. This doesn\'t really make sense.';  
                        Texter.write(msg, player.socketId);
                        break;
                    
                    case (playerI != null && who == users[playerI]):
                        
                        User.getPlayerByName(who).exec(function(err, user){
                            if(err){console.error(err); return;}
                            var attacker = PlayerModel.getPlayer(player);
                            var defender = PlayerModel.getPlayer(user.player[0]);
//                            defender.setListeners();
//                            defender.emit('regen');
                            Command.battlePlayer(attacker, defender, room);
                        });
                        
                        break;
                
                    default:
                        var msg = 'There\'s nothing to look at my dear.';
                        Texter.write(msg, player.socketId);
                        break;
                
                }
                //TODO: check for what to look at and get it if we can
                //check for commands[1]
                //->check for player through room-manager and fight if true
                //->check room for npcs and fight if true
                //->check if npcs are pacifists, fight accordingly
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
    .populate('npcs')
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

exports.insertTestItem = function(){
  
    var spoon = { 
        id           :   1,
        keyword      :   'spoon',
        description  :   'The spoon looks ancient with a delicate floral carvings across the handle.'
                            +'Perfect for stirring!',
        shortDesc    :   'A very large wooden spoon',
        maxLoad      :   1,
        behaviours   :   ['getable','dropable']
    };

/*********************************************/

var torch = {  
    id           :   2,
    keyword      :    'torch',
    description  :   'a torch that can shed light into dark places',
    shortDesc    :   'a small torch',
    maxLoad      :   1,
    behaviours   :   ['getable', 'lightable', 'dropable']
};

/*********************************************/

var muffin = {
    id           :   3,
    keyword      :   'muffin',
    description  :   'an incredibly delicious looking chocolate-muffin with blueberries and vanilla-icing.',
    shortDesc    :   'a freshly baked muffin',
    maxLoad      :   1,
    behaviours   :   ['getable','dropable', 'eatable' ]
};

/*********************************************/
    
    var items = [spoon, torch, muffin];
    
    Item.createItemsInDb(items);
    
};

exports.insertTestNpc = function(){
 var panda = {
        id          :   2,
        keyword     :   'panda',
//        location    :   2,
        attributes    :{
                        hp  :   15,
                        sp  :   0
                    },        
        shortDesc   :   'On top of a shelf sits a panda. It\'s waving at you.',
        description :   'It is a rather fat panda with some marmelade-stains in his fur',
        gender      :   'male',
        maxLoad     :   1,
        actions     :   {
            playerEnters    : 'Hey you there. Got anything to eat? I\'d die for some crumpets.',
            playerDrops     : 'Can you eat this?',
            playerChat      : ['I\'m hungry. Unless you have something to eat go away.',
                                'Do you like chocolate?',
                                'I only want to talk about food']
            },
        behaviours  :   ['dance'],
        pacifist    :   true
    };
    
    var items = [1,3]; //spoon, muffin
    Npc.createNpcinDB(panda, items);

/************************************************************************/

var fakir = {
        id          :   1,
        keyword     :   'fakir',
//        location    :   2,
        attributes    :{
                        hp  :   15,
                        sp  :   0
                    },        
        shortDesc   :   'In the corner sits a fakir on his bed of nails',
        description :   'The fakir closes demonstratively his eyes and ears in order to hide from you.',
        gender      :   'male',
        maxLoad     :   1,
        actions     :   {
                    playerEnters    : 'Oh no, this looks like trouble',
                    playerDrops     : 'Hey, somebody might get hurt',
                    playerChat      : ['I am not to be disturbed',
                                        'What did you say. I can\'t hear you.']
                    },
        behaviours  :   ['heal'], 
        pacifist    : false
    };
    
    var items = [2]; //torch, muffin
    Npc.createNpcinDB(fakir, items);
};

exports.insertTestRoom = function(){
/**************************************************************************************************
***** Lobby -  RoomId = 0 - Start here *******************************************************************************/

//exits
    var ladder = {keyword   : 'ladder',
                description : 'There\'s a ladder going upstairs',
                exitId      : 1,
                action      : 'You climb up the ladder',
                goodbye     : 'climbs up a ladder'};
            
    var hatch = {keyword    : 'hatch',
                description : 'There\'s a hatch in the floor',
                exitId      : 2,
                action      : 'You open up the hatch and climb down the stairs',
                goodbye     : 'leaves through the hatch in the floor'};
            
    var door = {keyword     : 'door',
                description : 'Only visible if you really look, there\'s a tiny door in the wall',
                exitId      : 3,
                action      : 'Even though it takes some time you manage to squeeze through the door',
                goodbye     : 'leaves through a tiny door in the wall'};
   
    var exits = [ladder, hatch, door];
    var npcs = [1, 2];
    var items = [2];

// room
    var lobby = {
        name        : 'Lobby',
        id          : 0,
        description : 'You are standing in the middle of the lobby with a giant gnome'    
    };

    // example on inserting a new room
    Room.createRoomWithNpc(lobby, exits, npcs, items, function(err){
        if(err){console.error(err); return;}
    });

/**************************************************************************************************
***** Loft -  RoomId = 1 **************************************************************************/

//exits
    var ladder = {keyword   : 'ladder',
                description : 'Don\'t fall down the hole with the ladder leading downstairs.',
                exitId      : 0,
                action      : 'You climb down the ladder',
                goodbye     : 'climbs down the ladder'};

    var window = {keyword   : 'window',
                description : 'There\'s a small dirty window. It\'s just big enough to squeeze through',
                exitId      : 1,
                action      : 'You open the window and climb through',
                goodbye     : 'climbs through window'};
            
    var closet = {keyword    : 'closet',
                description : 'There\'s a huge closet standing in the middle of the room',
                exitId      : 2,
                action      : 'You enter the closet. It is dark.',
                goodbye     : 'enters the closet'};
   
    var exits = [ladder,window, closet];
    var npcs = [];
    var items = [3];

// room
    var loft = {
        name        : 'Loft',
        id          : 1,
        description : 'You are standing in a humble room with a wooden floor.'    
    };

    Room.createRoomWithNpc(loft, exits, npcs, items, function(err){
        if(err){console.error(err); return;}
    });

/**************************************************************************************************
***** Winecellar -  RoomId = 2 - Start here *******************************************************************************/

//exits
    var stairs = {keyword   : 'stairs',
                description : 'The stairs leaving upstairs are pretty slippery',
                exitId      : 0,
                action      : 'You climb up the narrow stairs',
                goodbye     : 'leaves upstairs'};
   
    var exits = [stairs];
    var npcs = [];
    var items = [];

// room
    var winecellar = {
        name        : 'Winecellar',
        id          : 2,
        description : 'Lots of oaken barrels and a distinctive smell indicates that you\'ve ended up in the winecellar.'    
    };
    
    Room.createRoomWithNpc(winecellar, exits, npcs, items, function(err){
        if(err){console.error(err); return;}
    });

   

/**************************************************************************************************
***** Kitchen -  RoomId = 3 - Start here *******************************************************************************/

//exits
    var hole = {keyword   : 'hole',
                description : 'There\'s a huge hole in the the wall behind the cupboard',
                exitId      : 0,
                action      : 'You push the cupboard aside and crawl through the hole',
                goodbye     : 'squeezes through hole behind the cupboard'
    };

    var hoist = {keyword   : 'hoist',
                description : 'You see a hoist. Probably used for food. Hmmm...',
                exitId      : 1,
                action      : 'You love adventures and jump into the hoist. it goes upwards',
                goodbye     : 'climbs into hoist'
    };
           
   
    var exits = [hole, hoist]; 
    var npcs = [2]; //panda
    var items = [];

// room
    var kitchen = {
        name        : 'Kitchen',
        id          : 3,
        description : 'Pots and pans where ever you look. This must be the kitchen.'    
    };
    
    Room.createRoomWithNpc(kitchen, exits, npcs, items, function(err){
        if(err){console.error(err); return;}
    });

   

/**************************************************************************************************/

};

exports.deleteRoomById = function(id){
  Room.find({'id':id}, function(err, docs){
      if(err){console.error(err);return;}
      for(var i=0; i<docs.length; i++){
          docs[i].remove();
      }
      
  });  
};

exports.deleteNpcById = function(id){
  Npc.find({'id':id}, function(err, docs){
      if(err){console.error(err);return;}
      for(var i=0; i<docs.length; i++){
          docs[i].remove();
      }
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


