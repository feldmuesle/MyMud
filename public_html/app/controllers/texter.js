/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var events = require('events');
var texter = new events.EventEmitter();
var clients = []; // all socket online


exports.updateSockets = function(sockets){
    clients = sockets;
    console.log('clients: '+clients);
};


function addListeners (socketId){
    var socket = getSocket(socketId);
    
    texter.once('welcome', function(data){
       var welcome =' Welcome '+data['nickname']+' - nice you are visiting!';        
       socket.emit('output', {'message':welcome}); 
    });
    
    texter.once('welcome again', function(data){
       var welcome = 'Welcome again '+data['nickname']+' - we missed you!';
       socket.emit('output', {'message':welcome}); 
    });
    
    texter.once('updatePlayer', function(data){
       socket.emit('updatePlayer', data); 
    });
    
        
    texter.once('writeOnce', function(data){
        socket.emit('output', {'message':data['message']});    
    });
    
    texter.once('broadcast room', function(data){
        console.log('texter broadcast room');
        console.log('socket' +data['socketId']);
        socket.to(data['room']).emit('output', {'message':data['message']});    
    });
};

exports.addListeners = function(socketId){
    addListeners(socketId);
};

exports.welcome = function(player){
    texter.removeAllListeners();
    addListeners(player.socketId);
    texter.emit('welcome',player);
};

exports.welcomeAgain = function(player){
    texter.removeAllListeners();
    addListeners(player.socketId);
    texter.emit('welcome again',player);
};

exports.broadcastRoomies = function(msg, socketId, roomName){
    texter.removeAllListeners();
    addListeners(socketId);
    texter.emit('broadcast room',{
        'message'   : msg,
        'socketId'  : socketId,
        'room'      : roomName        
    });
};

exports.write = function(msg, socketId){  
    texter.removeAllListeners();
    addListeners(socketId);
    texter.emit('writeOnce', {'message':msg, 'socketId':socketId});
};

exports.updatePlayer = function(player, roomName){  
    texter.removeAllListeners();
    addListeners(player.socketId);
    texter.emit('updatePlayer', {'player':player, 'room': roomName});
};

/***********************************************************************************/
/****** helper-functions **********************************************************/

//get the players socket
function getSocket(socketId){
    
    for(var i=0; i<clients.length; i++){
        if(clients[i]['id'] == socketId){
            return clients[i];
        }
    }    
}