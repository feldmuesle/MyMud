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