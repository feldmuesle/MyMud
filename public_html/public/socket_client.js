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


$(document).ready(function(){   
    
  
/******** socket-events recieving from server **************/
    
    // simply output a message to the client
    socket.on('output', function(data){
        textStream.add(data['message']);
    });
    
    // if nickname is already taken when starting new game
    socket.on('nickname taken', function(data){ 
       // flash an alert-message about it to client
       alert(data['message']);
    });
   
    
    // start up the game
    socket.on('start game', function(data){
        
        room = data ['room'];
        player = data['player'];
        online = data['users'];
        roomies = data['roomies'];
        
        // display the game-interface on screen
        gameInit();          
        displayPlayerStats(player, room.name);
        displayRoomPlayerlist( roomies, room.name);
        displayPlayerlist(online); 

        
    });

    // broadcast that user has joined and update players-online-list
    socket.on('user joined', function(data){
        var chatmeta = data['username'] +' just joined. '+ data['numUsers']+' users online.';
//       appendToChat('chatmeta',chatmeta);
        textStream.add(chatmeta);
        displayPlayerlist(data['usersOnline']); 
    });

    // broadcast that user has left and update players-online-list
    socket.on('user left', function(data){
        var chatmeta = data['username'] +' just left. '+ data['numUsers']+' users online.';
        appendToChat('chatmeta',chatmeta);
        displayPlayerlist(data['usersOnline']);
    });
        
    //get current players in room and display them in players-in-room-list
    socket.on('playerlist', function(data){ 
        playersInRoom = data['playersInRoom'];
        displayRoomPlayerlist( playersInRoom, data['currRoom']);
    });
    
    //get current players in room and display them in players-in-room-list
    socket.on('updatePlayer', function(data){ 
        player = data['player'];
        displayPlayerStats(player, data['room']);
    });
    
    // change room
    socket.on('enterRoom', function(data){
       room = data['room'];
       console.log('inventory in new room: '+room.inventory);
       var roomies = data['roomies'];
       displayRoomPlayerlist(roomies, room.name);
       setLocation(room.name);
     
    });
    
    // inform when there's traffic in the room
    //  and update players-in-room-list
    socket.on('roomTraffic', function(data){
        
        displayRoomPlayerlist(data['roomies'], data['currRoom']);
        textStream.add(data['info']);      
       
    });
    
    // update npc when in battle and lost health
    socket.on('updateNpc', function(data){
        console.log('update npc '+data);
       var npc = data['npc'];
       var npcI =  getIndexByKeyValue(npcs, 'keyword', npc.keyword);
       npcs[npcI].attributes['health']= npc.attributes['health'];
       console.log('updated npc '+npc);
    });
    
    
    /********* code above worked through ********************/
    
    
    
    
    
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
