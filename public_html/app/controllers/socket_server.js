/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/************ Chat *********************/

var users = []; //array of users that are currently connected
var numUsers =0;

// get all the models we need

var Guild = require('../models/guilds.js');
var PlayerModel = require('../models/player.js');
var User = require('../models/user.js');
var Room = require ('../models/room.js');
var Game = require('./game_functions.js');




module.exports.response = function(socket){
    console.log('hello from socket-response');

    
    /*************************************************************/
    
    // if the user already has a game saved
    socket.on('loadGame', function(data){
        
        console.log('server-socket: load an existing game');
        userId = data['userId'];
        console.log('userId = '+userId);
        Game.loadGame(userId, function(game){
            console.log('hello from loadGame-callback');
            socket.emit('start game', {
                        player  :   game['player'],
                        room    :   game['room'],
                        numUsers:   game['numUsers']
                    });
        });
    });

        
    // check if the nickname is already taken
    socket.on('check nickname', function(data){
       var nickname = data['nickname'];
       var guild    = data['guild'];
       var userId   = data['userId'];       
       console.log('server-socket:(check nickname)');
       
       User.findOne({'nickname': nickname}, function(err, user){
            if(err){console.error(err); return;}

            // if there's already a user with this nickname, prompt user to choose another one
            if(user){
                socket.emit('nickname taken', {
                   nickname :   nickname,
                   message  :  'the nickname'+ nickname +' is already taken, please choose a different nickname.'
                });  

            }else{
                
                Game.startNewGame(nickname, guild, socket, function(game){
                    console.log('hello from startNewGame-callback');
                    socket.emit('start game', {
                                player  :   game['player'],
                                room    :   game['room'],
                                numUsers:   game['numUsers']
                            });
                });
                
                console.log('there is no player called '+nickname+' yet');
                User.findOneAndUpdate({_id : userId}, {nickname : nickname}, function(err, user){
                   if(err){console.error(err); return;}
//                   socket.emit('initialize game');
                    
                }); 

            }              
        });
    });
    
}; // module.exports.response end
