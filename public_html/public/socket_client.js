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
   
    
    // start up the game
    socket.on('start game', function(data){
        console.log('hello from socket.on "start game"-beginning');
        room = data ['room'];
        player = data['player'];
        online = data['users'];
        roomies = data['roomies'];
        
        // show the game
        gameInit();
        
        var chatmeta = 'Welcome '+player.nickname+ ', ' + online.length +' users online';
        appendToChat('chatmeta',chatmeta);  
        appendToChat('info',room.description);
        addExitDesc(room.exits);
        console.log('players in room: ');
        displayPlayerStats(player, room.name);
        displayRoomPlayerlist( roomies, room.name);
        displayPlayerlist(online); 
        
        console.log('hello from socket.on "start game"-ending');
    });

    // broadcast that user has joined and update players-online-list
    socket.on('user joined', function(data){
       var chatmeta = data['username'] +' just joined. '+ data['numUsers']+' users online.';
       appendToChat('chatmeta',chatmeta);
       displayPlayerlist(data['usersOnline']); 
       
       console.log('hello from socket.on "user joined"');
       console.log('username=' + data['username']);
       console.log('numUsers=' + data['numUsers']);
       console.log('usersOnline=' + data['usersOnline']);
    });

    // broadcast that user has left and update players-online-list
    socket.on('user left', function(data){
        var chatmeta = data['username'] +' just left. '+ data['numUsers']+' users online.';
        appendToChat('chatmeta',chatmeta);
        displayPlayerlist(data['usersOnline']);     
        console.log('hello from socket.on "user left"');
    });
    
    //get current players in room and display them in players-in-room-list
    socket.on('playerlist', function(data){ 
        playersInRoom = data['playersInRoom'];
        displayRoomPlayerlist( playersInRoom, data['currRoom']);
        console.log('hello from socket.on "playerlist"');
    });
    
    /********* code above worked through ********************/
    
    // change room
    socket.on('enterRoom', function(data){
       room = data['room'];
       setLocation(room.title);
       appendToChat('info',room.description);
       addExitDesc(room.exits);
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
    
    
    
    
    
    //update playerstats 
    socket.on('updatePlayerStats', function(data){
        
        for(var i in data['elements']){
            console.log('value: '+data['elements'][i]['value']);
            console.log('id: '+data['elements'][i]['id']);
            $('#'+data['elements'][i]['id']+'').text(data['elements'][i]['value']);
        }       
    });


});  //document.ready-function end
