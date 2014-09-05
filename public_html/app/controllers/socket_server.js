/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var mongoose = require('mongoose');

/************ Chat *********************/

var users = []; //array of users that are currently connected
var numUsers =0;

// get all the models we need
var Guild = require('../models/guilds.js');
var PlayerModel = require('../models/player.js');
var User = require('../models/user.js');
var Room = require ('../models/room.js');


module.exports.response = function(socket){
    console.log('hello from socket-response');
    
    // if the user already has a game saved
    socket.on('loadGame', function(data){
        
        console.log('socket: load an existing game');
        userId = data['userId'];
        console.log('userId = '+userId);
        User.findOne({'_id': data['userId']}, function(err, user){
                if(err){console.error(err); return;}
                console.log('hello from find user');
                if(user.nickname){
                    console.log('user with nickname '+ user.nickname +' found');
                    PlayerModel.findOne({'nickname' : user.nickname}, function(err, player){
                        if(err){console.error(err); return;}

                        if(player){
                            console.log('player has been found.');
//                            var stringPlayer = JSON.stringify(player);
//                            var parsePlayer = JSON.parse(stringPlayer);
//                            console.log(stringPlayer);
//                            console.log(parsePlayer);
                            Room.findOne({'id' : player.location}, function(err, room){
                                if(err){console.error(err); return;}

                                if(room){
                                    console.log('room has been found');
//                                    var stringRoom = JSON.stringify(room);
//                                    var parseRoom = JSON.parse(stringRoom);
//                                    console.log(stringRoom);
//                                    console.log(parseRoom);
                                    // if we got player and room, send it to the client
                                        socket.emit('output', {message : 'hello from socket-emit load'});

                                }
                            });
                        }
                    });
                }
        });
        
        // find user in db
//        var promise = User.findOne({'_id': data['userId']}, function(err, user){
//                if(err){console.error(err); return;}
//                if(user.nickname){
//                    console.log('user with nickname '+ user.nickname +' found');
//                    return user;
//                }
//        }).exec();
//        promise
//        .then(function(){
//            console.log('The user is:');
//            return PlayerModel.findOne({'nickname' : user.nickname}, function(err, player){
//                if(err){console.error(err); return;}
//
//                if(player){
//                    console.log('player has been found.');
//                    var stringPlayer = JSON.stringify(player);
//                    var parsePlayer = JSON.parse(stringPlayer);
//                    console.log(stringPlayer);
//                    console.log(parsePlayer);
//                }
//            }).exec();
//        }).then(function(){
//                return Room.findOne({'id' : player.location}, function(err, room){
//                    if(err){console.error(err); return;}
//
//                    if(room){
//                        console.log('room has been found');
//                        var stringRoom = JSON.stringify(room);
//                        var parseRoom = JSON.parse(stringRoom);
//                        console.log(stringRoom);
//                        console.log(parseRoom);
//                        // if we got player and room, send it to the client
////                            socket.emit('output', {message : 'hello from socket-emit load'});
//
//                    }
//                }).exec();
//            }).then(function(player, room){
//                    console.log('hello from promise');
//                    console.log(player);
//                    console.log(room);
//                    socket.emit('start game', {
//                         'player'    : player,
//                         'room'      : room
//                      });
//            }).then(function(){
//                done();
//            }, function(err){
//                console.log(err);
//                return;
//            });
});
            
//       userPromise.then(function(){
//            // find corresponding player
//            console.log('hello from userPromise');
//            
//            console.log('user' + user.nickname + ' end');
//            console.log('hello again');
//            PlayerModel.findOne({'undun' : user.nickname}, function(err, player){
//                if(err){console.error(err); return;}
//                console.log('player has been found.');
//                if(player){
//                    Room.findOne({'id' : player.location}, function(err, room){
//                        if(err){console.error(err); return;}
//
//                        if(room){
//                            // if we got player and room, send it to the client
//                            socket.emit('start game', {
//                               'player'    : player,
//                               'room'      : room
//                            });
//                        }
//                    });
//                }
//            });
//           
//        });
 
    
    // initialize new game
    socket.on('initialize player', function(data){ 
       
        var newPlayer;       
       
       //get the chosen guild and set attributes according to it
       var guildPromise = Guild.findOne({name :data['guild']},function(err, doc){    
                
            if(err){return console.error(err);}
            
            newPlayer = new PlayerModel();
            console.log(data['nickname']);
            newPlayer.nickname = data['nickname'];
            newPlayer.guild = data['guild'];
            
            // parse mongoose-docuemnt to javascript-object
            var guild = JSON.stringify(doc);
            var newGuild = JSON.parse(guild);
                    
            // set all the players properties
            newPlayer.attributes['hp'] = newGuild.hp;
            newPlayer.attributes['sp'] = newGuild.sp;
            
            // call init-function, set default-values and set-up eventlisteners;
            newPlayer.init(socket);
            
            // now we can call the write-listner which emits a message to the player
            newPlayer.write('Here is a written message!');
            
            // when all is good, push the player into users-array and increment
            users.push(newPlayer);
            numUsers++;
        }).exec();
        guildPromise.then(function(){
            //save the player in the database
            newPlayer.save(function(err){
                if(err){console.error(err); return;}
                console.log('saving player succeeded.');
                console.log(newPlayer);
            });                        
        });
        console.log('end on initialisation');
    });
    // initialize player end
    
}; // module.exports.response end
