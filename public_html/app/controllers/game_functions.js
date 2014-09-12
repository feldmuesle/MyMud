/* 
This file contains game-functions for mangaging the game overall (e.g. starting, loading a game, 
 */

var users = []; //array of users that are currently connected
var numUsers =0;

var Guild = require('../models/guilds.js');
var PlayerModel = require('../models/player.js');
var User = require('../models/user.js');
var Room = require ('../models/room.js');
var RoomManager = require ('../models/helper_models/room_manager.js');
var Npc = require('../models/npc.js');
var Item = require('../models/item.js');

// get all users currently online
exports.getUsers = function(){ return users;  };

exports.getNumUsers = function(){ return numUsers;};

// load an existing game by userId
exports.loadGame = function(userId, callback){
        User.findOne({'_id': userId}, function(err, user){
            if(err){console.error(err); return;}
                //console.log('hello from find user');
            if(user.player){
                //console.log('user with nickname '+ user.player[0].nickname +' found');
                users.push(user.player[0].nickname);
                numUsers++;
            }else{
                //console.log('no player has been found.');
            }
        }).exec()
        .then(function(user){
            //console.log('hello from promise. Player is '+user.player[0].nickname);
            Room.findOne({'id' : user.player[0].location}, function(err, room){
                if(err){console.error(err); return;}

                if(room){
                    RoomManager.addPlayerToRoom(room.id, user.player[0]);
                    //console.log('hello from promise. Room is' +room.name);
                }
            }).exec()
            .then(function(room){
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
};

// load a entire new game by det given userinput
exports.startNewGame = function(userId, nickname, guild, socket, callback){
        
    //console.log('hello from startNewGame-function');
    var newPlayer;

   //get the chosen guild and set attributes according to it
   Guild.findOne({name :guild},function(err, doc){    

        if(err){return console.error(err);}

        newPlayer = new PlayerModel();
        newPlayer.nickname = nickname;
        newPlayer.guild = guild;
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
                });
             }
         }).exec()
        .then(function(){
            // finally get the room
            Room.findOne({'id':'0'},function(err, room){
                //console.log('hello from startNewGame - find room');
                if(err){console.error(err); return;}
                room.initialize();
                room.announce(newPlayer); 
                RoomManager.addPlayerToRoom(room.id, newPlayer);

            }).exec()
            .then(function(room){

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
};
    
exports.removePlayer = function(socket, callback){
    
    if(users.length > 0){ // in case server shut down and avoid negative numbers
        --numUsers;
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
        console.log('inside test: '+newRoom);
        console.log('item: '+newRoom.npcs[0].inventory[0]);
        console.log('health: '+newRoom.npcs[0].attributes['health']);
        Item.populate(newRoom.npcs, {path : 'inventory ', model:'Item'}, function(err, npcs){
            npcs.forEach(function(npc){
                console.log(npc.keyword +' has item '+npc.inventory[0]);

            });

                console.log('hello from where we send the data back to ');
                //remove player from old roomlist and add to new roomlist
                RoomManager.removePlayerFromRoom(oldRoom.id, player.nickname,
                RoomManager.addPlayerToRoom(newRoom.id, player)); 

                var newRoomies = RoomManager.getPlayersInRoom(newRoom.id);
                var oldRoomies = RoomManager.getPlayersInRoom(oldRoom.id);


                var data ={
                    'newRoomies'    : newRoomies,
                    'oldRoomies'    : oldRoomies,
                    'newRoom'       : newRoom,
                    'npcs'          : newRoom.npcs,
                    'inventory'     : newRoom.inventory
                };     
                
                newRoom.announce(player);

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
        description :   'The panda jumps off the shelf and brushes some flour off his fur.',
        maxLoad     :   1
    };
    
    var items = [1];
    Npc.createNpcinDB(panda, items);
};

exports.insertTestRoom = function(){
  /***** Kitchen -  RoomId = 3 - Start here *******************************************************************************/

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
    var npcs = [2];

// room
    var kitchen = {
        name        : 'kitchen',
        id          : 3,
        description : 'Pots and pans where ever you look. This must be the kitchen.'    
    };
    
    Room.createRoomWithNpc(kitchen, exits, npcs, function(err){
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