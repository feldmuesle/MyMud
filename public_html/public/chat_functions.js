/* 
 this file contains all functions for displaying in the DOM
 */

// configure socket.io clientside
var socket = io.connect();

//$(document).ready(function(){

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
    console.log('hello from inside loadGame');
    
    socket.emit('loadGame', {'userId' : user._id}); 
}


function checkNickname(){
    if($('#pseudoInput').val()!==''){
            
        var nickname = $('#pseudoInput').val().trim(); 
        var guild = $('#playerclass').val();
        console.log('The players nickname clientside is: '+nickname);
        console.log('The chosen guild clientside is: '+guild);
        console.log('The users id is: '+user._id);
        socket.emit('check nickname', {
           nickname :   nickname,
           guild    :   guild,
           userId   :   user._id
        });
    }
}

function alert(message){
    $('#pseudoInput').val('');
    $('.alert').text(message);
}

function slideGameSignup(){
            $('#gameChoice').slideUp();
            $('#gameSignup').show();
            
            
        }

function gameInit(){
    
    setAutoHeight();            
    $('#profile').show();
    $('#playerlist').show();
    $('#roomPlayerlist').show();
    $('#chatWrapper').show();
    $('#pseudoSet').hide();
    $('#chatInput').focus();
}

// initialize the game 
    function initializeGame(){
        if($('#pseudoInput').val()!==''){
            
//            var nickname = $('#pseudoInput').val().trim(); 
//            var guild = $('#playerclass').val();
//            console.log('The players nickname clientside is: '+nickname);
//            console.log('The chosen guild clientside is: '+guild);
//            console.log('The users id is: '+user._id);
            setAutoHeight();
            
            $('#profile').show();
            $('#playerlist').show();
            $('#roomPlayerlist').show();
            $('#chatWrapper').show();
            $('#pseudoSet').hide();
            $('#chatInput').focus();
                        
            var data = {
                'nickname'  :   nickname,
                'guild'     :   guild,
                'userId'    :   user._id
            };

            //tell the server your nickname/pseudo and get initialized as a player
            socket.emit('initialize player', data);
        }
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
    
    // add meta-message to chat
//    function addMeta(chatmeta){
//        console.log('hello from addMeta');
//        var message = '<p>'+chatmeta+'</p>';
//        appendToChat('chatmeta', message);
//    }
    
//    function addLocationDesc(info){
//        console.log('hello from addInfo');
//        var message = '<p>'+info+'</p>';
//        appendToChat('info', message);
//    }
    
    function addExitDesc(aExits){
        for(var i=0; i< aExits.length; i++){
            appendToChat('info', '<p>'+aExits[i].description+'</p>');
        }
    }
    
    function displayPlayerlist(playerlist){
        
       var curPlayerlist = '<li><strong>Players online:</strong></li>';
       for(var i=0; i < playerlist.length; i++){
          curPlayerlist = curPlayerlist + '<li>'+playerlist[i]+'</li>';
       }       
       $('#playerlist').html(curPlayerlist);
    }
    
    function displayRoomPlayerlist(playerlist, roomTitle){
        
       var curPlayerlist = '<li><strong>Players in '+roomTitle+':</strong></li>';
       for(var i=0; i < playerlist.length; i++){
          curPlayerlist = curPlayerlist + '<li>'+playerlist[i].nickname+'</li>';
       }       
       $('#roomPlayerlist').html(curPlayerlist);
    }
    
    function displayPlayerStats(player){
        
        var stats =[];
        var name = '<li>Name: '+player.nickname+'</li>';
        var playerclass = '<li>Guild: '+player.guild+'</li>';
        var location = '<li>Location:<span id="location"> '+player.location +'</span></li>';
        var health = '<li>Health:<span id="health"> '+player.attributes.health +'</span></li>';
        var experience = '<li>Experience: '+player.attributes.experience+'</li>';
        var level = '<li>Level: '+player.attributes.level+'</li>';
        var hp = '<li>Hitpoints: '+ player.attributes.hp+'</li>';
        var sp = '<li>Spellpoints: '+player.attributes.sp+'</li>';
        
        stats.push(name, playerclass,location, health,experience, hp, sp, level);
        var playerstats = '<li><strong>Profile</strong></li>';
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
    
    
    // get typewriter-effect
    function typewriter(el,text,pos,no){
        ctext=text.substring(0,pos)+(pos%2?'_':'<blink>_</blink>');
        $(el).html(ctext);
        if(pos==text.length){
         $(el).html(text+"<blink>_</blink>");
        } else {
         window.setTimeout('typwriter("'+el+'","'+text+'",'+(pos+1)+','+1+');',800);
        }
    }

//});
