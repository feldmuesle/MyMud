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

exports.changeRoom = function(oldRoom, newRoomId, player, callback){

    
    // get the new room from db
    Room.findOne({id: newRoomId},function(err, newRoom){
        if(err){console.error(err); return;} 
        return newRoom;
    }).exec()
    .then(function(newRoom){
        console.log('hello from change-room-promise');            
        console.log(newRoom);           

        Npc.find({'_id':{$in : newRoom.npcs}}, function(err, docs){
             if(err){console.error(err); return;}

             if(docs.length > 0){
                 console.log('npc found');
                 console.log('hello inside: '+docs);             

             }else{
                 console.log('no npc in this room');
             }                                   
        }).exec()
        .then(function(npcs){
            console.log('hello from npc-promise '+npcs);
            //remove player from old roomlist and add to new roomlist
            RoomManager.removePlayerFromRoom(oldRoom.id, player.nickname,
            RoomManager.addPlayerToRoom(newRoom.id, player)); 

            var newRoomies = RoomManager.getPlayersInRoom(newRoom.id);
            var oldRoomies = RoomManager.getPlayersInRoom(oldRoom.id);
            console.log(newRoomies.length +' users in new room with id '+newRoom.id);
            console.log(oldRoomies.length +' users in old room with id '+oldRoom.id);


            var data ={
                'newRoomies'    : newRoomies,
                'oldRoomies'    : oldRoomies,
                'newRoom'       : newRoom,
                'npcs'          : npcs
            };     
            
            callback(data);
        });      
        
    });        
};

exports.insertTestNpc = function(){
    var panda = {
        id          :   2,
        name        :   'Poodie',
//        location    :   2,
        hp          :   15,
        sp          :   0,
        shortDesc   :   'On top of a shelf sits a panda. It\'s waving at you.',
        description :   'The panda jumps off the shelf and brushes off some flour in his fur. Hello my friend.',
        maxLoad     :   1
    };
    var npcs = [panda];
    Npc.createNpcinDB(npcs);
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