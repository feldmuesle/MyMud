/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/************ Chat *********************/

var users = []; //array of users that are currently connected
var numUsers =0;

// get all the models we need

var User = require('../models/user.js');
var Game = require('./game_functions.js');



module.exports.response = function(socket){
    console.log('hello from socket-response');

    
    /*************************************************************/
    
    // if the user already has a game saved
    socket.on('loadGame', function(data){
        
        var userId = data['userId'];

        Game.loadGame(userId, function(game){            
            socket.emit('start game', {
                player  :   game['player'],
                room    :   game['room'],
                numUsers:   game['numUsers'],
                roomies :   game['roomies']
            });
        });
    });

        
    // check if the nickname is already taken
    socket.on('check nickname', function(data){
       var nickname = data['nickname'];
       var guild    = data['guild'];
       var userId   = data['userId'];       
       
       User.findOne({'nickname': nickname}, function(err, user){
            if(err){console.error(err); return;}

            // if there's already a user with this nickname, prompt user to choose another one
            if(user){
                socket.emit('nickname taken', {
                   nickname :   nickname,
                   message  :  'the nickname'+ nickname +' is already taken, please choose a different nickname.'
                });  

            }else{
                // fire up a new game
                Game.startNewGame(userId, nickname, guild, socket, function(game){
                    console.log('hello from startNewGame-callback');
                    
                    // configure socket for the room
                    socket.room = game['room'].name;
                    socket.roomId = game['room'].id;
                    socket.join(game['room'].name);
                    
                    // start game clientside
                    socket.emit('start game', {
                        player  :   game['player'],
                        room    :   game['room'],
                        numUsers:   game['numUsers'],
                        roomies :   game['roomies']
                    });                  
                });                
//                User.findOneAndUpdate({_id : userId}, {nickname : nickname}, function(err, user){
//                   if(err){console.error(err); return;}
////                   socket.emit('initialize game');
//                    
//                }); 
            }              
        });
    }); // socket.on'check nickname' end
    
}; // module.exports.response end
