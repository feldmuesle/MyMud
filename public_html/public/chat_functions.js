/* 
 this file contains all functions for displaying in the DOM
 */

// configure socket.io clientside
//var socket = io.connect();


//initialize screen - show starup-form, hide rest of game
$(function(){
       $('#chatWrapper').hide();
       $('#profile').hide();
       $('#playerlist').hide();
       $('#roomPlayerlist').hide();
       $('#gameSignup').hide();
       $('#alert').hide();       
       $('#pseudoInput').focus();
       $('#loadGame').click(function(){loadGame();});
       $('#loadGame1').click(function(){loadGame();});
       $('#newGame').click(function(){slideGameSignup();});
       $('#startGame').click(function(){checkNickname();});
       $('#btnChatSubmit').click(function(){sendMessage(); return;});
       $('#chatInput').keypress(function(e){
          var key = e.which;
          if(key == '13'){  //send message if user clicks enter
              sendMessage();
              return;
          }
       });
    });
  
// initialize game with existing player
function loadGame(){    
    socket.emit('loadGame', {'userId' : user._id}); 
}

// check if entered nickname is unique -> if yes, new game is initialized
function checkNickname(){
    if($('#pseudoInput').val()!==''){
            
        var nickname = $('#pseudoInput').val().trim(); 
        var guild = $('#playerclass').val();
        socket.emit('check nickname', {
           nickname :   nickname,
           guild    :   guild,
           userId   :   user._id
        });
    }
}


// show alert-message in startup-form 
function alert(message){
    $('#pseudoInput').val('');
    $('.alert').text(message);
}

// show form for starting a new game
function slideGameSignup(){
            $('#gameChoice').slideUp();
            $('#gameSignup').show();
            
            
        }

// set screen-height, hide startup-form and show the game!!
function gameInit(){
    
    setAutoHeight();            
    $('#profile').show();
    $('#playerlist').show();
    $('#roomPlayerlist').show();
    $('#chatWrapper').show();
    $('#pseudoSet').hide();
    $('#chatInput').focus();
}


    function sendMessage(){
        // check if there's a message 
        console.log('somebody is trying to send a message');
        if($('#chatInput').val() !== ''){
            var msg = $('#chatInput').val();
            if(msg.charAt(0)=='*'){             // if there's a * it means command, check it!
                var command = msg.split('*');
                console.log('There\'s a command:' +command[1]);
                checkCommand(command[1], socket);
            } else { // otherwise just post the msg
                var data ={
                'action'  : 'says',  
                'msg'     :   msg,
                'username':   player.nickname   
                };
                console.log('somebody is trying to send a message.');
                // send message to the server
                socket.emit('message', data);
                // add message to screen
                addAction('say' ,msg, 'you');
            }
            
            // empty inputfield
            $('#chatInput').val('');
        }
        
    }

    // add plain message to chat
    function addMessage(msg, nickname){
        console.log('hello from addMessage');
        var date = new Date();
        var time = date.getHours()+':'+ date.getMinutes();
        var message = '<i>' + time + '</i> '+ nickname +' '+ msg;
        appendToChat('message', message);
    }
    
    // append li på rigtig måde
    function appendToChat(cssClass, msg){
        $('<li class="'+cssClass+'"><p>'+msg+'</p></li>').hide().appendTo('#chatEntries').slideDown('fast');
    }
    
    function typeOnScreen(msg, index){
        $('<li></li>').appendTo('#chatEntries').slideDown('fast');
        var currLi = $('#chatEntries').children('li').last();
        newMsg = true;
        type(msg, 0, currLi, index);     
    }
    
    
    var k = 1;
    // typewriter-effect    
    function type(text, pos, el){
        console.log('typing: '+text);
        var letter = text.substring(0,pos);
        $(el).html(letter);

        if(pos == text.length){
//            console.log('we finished typing');            
//            console.log('runtimes: '+k);
//            console.log('stream-length: '+textStream.stream.length);
//            k++            
            
            if(textStream.stream.length == 1){
                console.log('no more messages!');
                return;
            }
            // else 
            textStream.remove(0); //remove the message from array
            textStream.readyAgain(); // emit that we are ready to type next msg in array
            textStream.write(); // write it!
            
        }else {
            setTimeout(function(){
                type(text, pos+1, el);
            },80);   
        }
        
    }

    
    // get typewriter-effect
    function addOutput(msg){
        output.push(msg);
    };
    
    function setLocation(roomTitle){        
        $('#location').text(roomTitle);        
    }
    
    function addAction(action, msg, nickname){
        console.log('hello from addAction');
        var date = new Date();
        var time = date.getHours()+':'+ date.getMinutes();
        var message ='<i>' + time + '</i> '+ nickname +' '+action+' ' + msg;
        appendToChat('message', message);
    }
    
    function addExitDesc(aExits){
        for(var i=0; i< aExits.length; i++){
            appendToChat('info', '<p>'+aExits[i].description+'</p>');
        }
    }
    
    function displayPlayerlist(playerlist){
        
       var curPlayerlist = '<li><strong>Players online: </strong></li>';
       var numPlayers = playerlist.length;
       
       for(var i=0; i < numPlayers; i++){          
          if(i == numPlayers-1 ){ 
              curPlayerlist = curPlayerlist + '<li>'+playerlist[i]+'</li>';
          }else{
              curPlayerlist = curPlayerlist + '<li>'+playerlist[i]+', '+'</li>'; 
          }
       }       
       $('#playerlist').html(curPlayerlist);
    }
    
    function displayRoomPlayerlist(playerlist, roomTitle){
        
       var curPlayerlist = '<li><strong>Players in '+roomTitle+':</strong></li>';
       for(var i=0; i < playerlist.length; i++){
          curPlayerlist = curPlayerlist + '<li><span class="glyphicon glyphicon-user"></span> '+playerlist[i].nickname+'</li>';
       }       
       $('#roomPlayerlist').html(curPlayerlist);
    }
    
    function displayPlayerStats(player, roomName){
        
        var stats =[];
        var name = '<dt>Nickname: </dt><dd>'+player.nickname+'</dd>';
        var location = '<dt id="location"><span class="glyphicon glyphicon-move"></span> Location: </dt><dd>'
                +roomName +'</dd>';
        var playerclass = '<dt id="location"><span class="glyphicon glyphicon-flag"></span> Guild: </dt><dd>'
                +player.guild+'</dd>';
        var health = '<dt><span class="glyphicon glyphicon-heart"></span> Health: </dt><dd>'
                +player.attributes.health +'</dd>';
//        var experience = '<li>Experience: '+player.attributes.experience+'</li>';
//        var level = '<li>Level: '+player.attributes.level+'</li>';
        var hp = '<dt><span class="glyphicon glyphicon-flash"></span> HP: </dt><dd>'
                + player.attributes.hp+'</dd>';
        var sp = '<dt><span class="glyphicon glyphicon-fire"></span> SP: </dt><dd>'
                +player.attributes.sp+'</dd>';
        
        stats.push(name, playerclass,location, health, hp, sp);
        var playerstats = '<h3>Profile</h3>';
        for(var i=0; i< stats.length; i++){
            playerstats = playerstats + stats[i];            
        }
        $('#profile').html(playerstats);
    };
    
    // misc-functions
    function getExitFromArray(room, direction){
        var index;
        for(var i=0; i<room.exits.length; i++){
            if(room.exits[i].direction == direction){
                index = i;
                return index;
            }
        }        
    }
    
    // adjust height of chatlist to current window
    function setAutoHeight(){
        var windowH = $(window).height();
        console.log('window height is '+windowH);
        $('#chatWrapper').height(windowH);
    }
    
    // check if the defender exists in room
    function getIndexByKeyValue(array, key, value){
        for (var i = 0; i< array.length; i++){
            if (array[i][key] == value){
                return i;
            }
            return null;
        }
    }
    
    
    // get opposite direction 
    function getOppDirection (direction){
        console.log('Direction: '+direction);
        var opp;
        switch(direction){
            case 'north': 
                opp = 'south';
                break;
            case 'east': 
                opp = 'west';
                break;
            case 'south': 
                opp = 'north';
                break;
            case 'west': 
                opp = 'east';
                break;
        }
        console.log('turn around from '+direction+' to '+opp);
        return opp;
    }
    
    
//    // get typewriter-effect
//    function typewriter(el,text,pos,no){
//        ctext=text.substring(0,pos)+(pos%2?'_':'<blink>_</blink>');
//        $(el).html(ctext);
//        if(pos==text.length){
//         $(el).html(text+"<blink>_</blink>");
//        } else {
//         window.setTimeout('typwriter("'+el+'","'+text+'",'+(pos+1)+','+1+');',800);
//        }
//    }

//});
