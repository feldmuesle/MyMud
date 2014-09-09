/* 
 * This file handles the game itself
 */

// modules we need
var events = require('events');
var eventEmitter = new events.EventEmitter();

// global variables we need
var users = []; //array of users that are currently connected
var numUsers =0;

// get all the models we need
var User = require('../models/user.js');
var Game = require('./game_functions.js');



module.exports.response = function(socket){
    console.log('hello from socket-response');

    
    /********* GAMESTART - CONNECT ****************************************************/
    
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
                    
                    // configure socket 
                    socket.pseudo = game['player'].nickname;
                    socket.room = game['room'].name;
                    socket.roomId = game['room'].id;
                    socket.join(game['room'].name);
                    
                    // start game clientside
                    socket.emit('start game', {
                        player  :   game['player'],
                        room    :   game['room'],
                        users   :   game['online'],
                        roomies :   game['roomies']
                    });       
                    
                    // set variables to broadcast, since socket.broadcast has to be done outside of this callback!            
                    var broadcast = {
                        currSocket  :   socket,
                        players     :   game['online'],
                        roomies     :   game['roomies']
                    };

                    // broadcast to all players online and update players-online-list
                    eventEmitter.emit('broadcast user joined', broadcast);

                    //broadcast new playerlist to players in same room 
                    eventEmitter.emit('broadcast players in room', broadcast);
                });    
            }              
        }); // end of promise-chain
        eventEmitter.once('broadcast user joined', function(data){
                        
            socket.broadcast.emit('user joined',{
                username    :   data['currSocket'].pseudo,
                numUsers    :   data['players'].length,
                usersOnline :   data['players']
            });
        });   
        
        eventEmitter.once('broadcast players in room', function(data){
            
            socket.broadcast.to(socket.room).emit('playerlist',{
                playersInRoom   :  data['roomies'],
                currRoom        :  data['currSocket'].room
            });
            
        });  
    }); // socket.on'check nickname' end
    
    // load a game from db, if the user already has a game saved
    socket.on('loadGame', function(data){
        
        var userId = data['userId'];
        var playersOnline;
        var playersInRoom;

        Game.loadGame(userId, function(game){ 
            
            // configure socket of player
            game['player'].socketId = socket.id;
            socket.pseudo = game['player'].nickname;
            socket.room = game['room'].name;
            socket.roomId = game['room'].id;
            socket.join(game['room'].name);
            
            
            // send the game to the client
            socket.emit('start game', {
                player  :   game['player'],
                room    :   game['room'],
                users   :   game['online'],
                roomies :   game['roomies']
            });
            
            // set variables to broadcast, since socket.broadcast has to be done outside of this callback!            
            var broadcast = {
                currSocket  :   socket,
                players     :   game['online'],
                roomies     :   game['roomies']
            };
            
            // broadcast to all players online and update players-online-list
            eventEmitter.emit('broadcast user joined', broadcast);
            
            //broadcast new playerlist to players in same room 
            eventEmitter.emit('broadcast players in room', broadcast);
            
        });// function loadGame-callback -> end        
        
        eventEmitter.once('broadcast user joined', function(data){
                        
            socket.broadcast.emit('user joined',{
                username    :   data['currSocket'].pseudo,
                numUsers    :   data['players'].length,
                usersOnline :   data['players']
            });
        });   
        
        eventEmitter.once('broadcast players in room', function(data){
            
            socket.broadcast.to(socket.room).emit('playerlist',{
                playersInRoom   :  data['roomies'],
                currRoom        :  data['currSocket'].room
            });
            
        });  
        
    }); // socket.on 'load game' -> end
    
    /******* GAMEEND - DISCONNECT ***********************************************/
    
    //when a user disconnects
    socket.on('disconnect', function(){
                
        Game.removePlayer(socket , function(data){
            
            // broadcast to all users online that user has left and update players-online-list
            socket.broadcast.emit('user left',{
                username        :   socket.pseudo,
                numUsers        :   data['numUsers'],
                usersOnline     :   data['online']
            });
            
            //broadcast new playerlist to players in same room as left user
            socket.broadcast.to(socket.room).emit('playerlist',{
                playersInRoom   :  data['roomies'],
                currRoom        :  socket.room
            });
        });     

    }); // socket.on'disconnect' -> end
    
}; // module.exports.response end
