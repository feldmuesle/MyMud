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
};


function addListeners (){
    
    texter.once('welcome', function(data){
       var welcome = 'Welcome '+data['nickname']+' - nice you are visiting!'; 
       var socket = getSocket(data['socketId']);
       socket.emit('output', {'message':welcome}); 
    });
    
    texter.once('welcome again', function(data){
       var welcome = 'Welcome again '+data['nickname']+' - we missed you!'; 
       var socket = getSocket(data['socketId']);
       socket.emit('output', {'message':welcome}); 
    });
    
        
    texter.once('writeOnce', function(data){
        
        var socket = getSocket(data['socketId']);
        console.log('texter says:' +data['message']);
        console.log('socket' +socket.id);
        socket.emit('output', {'message':data['message']});    
    });
    
    texter.once('broadcast room', function(data){
        
        var socket = getSocket(data['socketId']);
        console.log('texter says:' +data['message']);
        console.log('socket' +socket.id);
        socket.to(data['room']).emit('output', {'message':data['message']});    
    });
};

exports.addListeners = function(){
    addListeners();
};

exports.welcome = function(player){
    texter.removeAllListeners();
    addListeners();
    texter.emit('welcome',player);
};

exports.welcomeAgain = function(player){
    texter.removeAllListeners();
    addListeners();
    texter.emit('welcome again',player);
};

exports.broadcastRoomies = function(msg, socketId, roomName){
    texter.removeAllListeners();
    addListeners();
    texter.emit('broadcast room',{
        'message'   : msg,
        'socketId'  : socketId,
        'room'      : roomName        
    });
};

exports.write = function(msg, socketId){  
    texter.removeAllListeners();
    addListeners();
    texter.emit('writeOnce', {'message':msg, 'socketId':socketId});
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