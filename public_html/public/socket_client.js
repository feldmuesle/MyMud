// handles the client-side of socket.io

// configure socket.io clientside
var socket = io.connect();

// initialize variables
var player;
var connected = false;
var typing = false;
var room;
var exits = [];
var usersOnline = [];
var playersInRoom = [];
var hitWhere = ['right on the nose','on the shinbone', 'in the butt', 'on the left toe'];
var hitHow = ['hit', 'kick', 'bite', 'knock'];

$(document).ready(function(){   
    
  
/******** socket-events recieving from server **************/
    
    // simply output a message to the client
    socket.on('output', function(data){
        appendToChat('info', data['message']);
    });
    
    // if nickname is already taken when starting new game
    socket.on('nickname taken', function(data){ 
       // flash an alert-message about it to client
       
       alert(data['message']);
    });
    
    socket.on('initialize game', function(){
       console.log('we are ready to initialize the game'); 
       gameInit();
    });
    
    
    // start-message when new user logs on
    socket.on('start game', function(data){
        console.log('hello from start game listener');
        room = data ['room'];
        player = data['player'];
        var chatmeta = 'Welcome '+player.nickname+ ', ' + data['numUsers'] +' users online';
        console.log('Welcome '+player.nickname+ ', ' + data['numUsers'] +' users online');
        appendToChat('chatmeta',chatmeta);  
        appendToChat('info',room.description);
        addExitDesc(room.exits);
        displayPlayerStats(player);
    });

    // broadcast that user has joined
    socket.on('user joined', function(data){
       var chatmeta = data['username'] +' just joined. '+ data['numUsers']+' users online.';
       appendToChat('chatmeta',chatmeta);
    });

    // broadcast that user has left
    socket.on('user left', function(data){
        var chatmeta = data['username'] +' just left. '+ data['numUsers']+' users online.';
        appendToChat('chatmeta',chatmeta);
    });
    
    //get the message back from the server
    socket.on('message', function(data){        
        //if there's set an action, display it
        if(data['action']!= 'undefined'){
            addAction(data['action'], data['msg'], data['username']);
        }else {
            addMessage(data['msg'], data['username']);
        }        
    });
    
    // display info
    socket.on('addInfo', function(data){
       appendToChat('chatmeta',data['msg']); 
    });
    
    // change room
    socket.on('enterRoom', function(data){
       room = data['room'];
       setLocation(room.title);
       appendToChat('info',room.description);
       addExitDesc(room.exits);
    });
    
    //get current playerlist 
    socket.on('playerlist', function(data){  
       usersOnline = data['usersOnline'];
       playersInRoom = data['playersInRoom'];
       displayPlayerlist(usersOnline);   
       displayRoomPlayerlist( playersInRoom, data['currRoom']);
    });
    
    //update playerstats 
    socket.on('updatePlayerStats', function(data){
        
        for(var i in data['elements']){
            console.log('value: '+data['elements'][i]['value']);
            console.log('id: '+data['elements'][i]['id']);
            $('#'+data['elements'][i]['id']+'').text(data['elements'][i]['value']);
        }       
    });


});  //document.ready-function end
