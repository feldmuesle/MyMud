/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var events = require('events');
var texter = new events.EventEmitter();
var clients = []; // all socket online


function getSocket(socketId){
    
    for(var i=0; i<clients.length; i++){
        if(clients[i]['id'] == socketId){
            return clients[i];
        }
    }    
}

exports.updateSockets = function(sockets){
    clients = sockets;
};


function addListeners (){
    
    texter.once('writeOnce', function(data){
        
        var socket = getSocket(data['socketId']);
        console.log('texter says:' +data['message']);
        console.log('socket' +socket.id);
        socket.emit('output', {'message':data['message']});    
    });
};
exports.addListeners = function(){
    addListeners();
};


exports.write = function(msg, socketId){  
    texter.removeAllListeners();
    addListeners();
    texter.emit('writeOnce', {'message':msg, 'socketId':socketId});
};

