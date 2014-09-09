/* 
 This file contains all command-functions for the mud
 */

//commands
    function checkCommand(cmd, socket){
    
        var command = cmd.split(' ');
        var leave = false;
        var index;
        console.log(command[0]);
        console.log(command[1]);
        console.log(command.length);
        
        // check if it's a keyword for the exits
        for(var i=0; i< room.exits.length; i++){
            if(command[0] == room.exits[i]['keyword']){
                console.log('you typed '+command[0]+' -the keyword');
                leave = true;
                return;                
            }
        }
        
        // if it is, send the correspondent exitmessage
        if(leave){
            var change = {
                    newRoomId   : room.exits[index].exitId,
                    oldRoom     : room,
                    player      : player,
                    msgLeave    : player.nickname +' leaves towards '+room.exits[index].direction,
                    msgArrive   : player.nickname +' arrives from '+ room.exits[index].direction
                };
                                               
                socket.emit('changeRoom',change);
        }
        else { // if it's not a moving-command, check for other commands
            
            // all other commands contain more than one argument, so check for that first
            if(command.length == 1){
                var msg = '*'+command[0]+' alone won\'t work. You are missing arguments.';
                appendToChat('chatmeta', msg);
                return;
            }
            
            // check for commands
            switch(command[0]){
                
                case "attack":
                    attack(player, command[1]);
                    break;
                
                default:
                    var msg ='\'';
                    for(var i=0; i<command.length; i++){
                        msg += command[i]+ ' ';
                    }
                    msg +='\' is not a valid command. Maybe you mispelled something?';
                    appendToChat('chatmeta',msg); 
                    break;                
            };       
        }       
    }
    
    
    //attack
    function attack(attacker, defender){
        
        var index = getIndexByKeyValue(playersInRoom, 'nickname', defender);
        
        //check if there's anybody to attack in the room
        if(index != null){
            defender = playersInRoom[index];            
            battle(attacker, defender);
            
            appendToChat('info','You attack '+defender.nickname);
        } else {
            appendToChat('meta','Nobody called '+defender+' you could attack is in this room.');
        }                
    }    
    
    // battle 
    function battle(attacker, defender){
        
        console.log(attacker);
        console.log(defender);
        
        var msg = attacker.nickname +' attacks '+defender.nickname;
        var attackPoints = Math.floor(Math.random()* attacker.attributes.hp +1);
        var defensePoints = Math.floor(Math.random()* defender.attributes.hp +1);
        var hitHowIndex = Math.floor(Math.random()* hitHow.length);
        var hitWhereIndex = Math.floor(Math.random()* hitWhere.length);
        var defMsg ="";
        var attMsg ="";
        var impact = "";
        var damage = 0;
        var stats = "";
        var outcome = "";
        
        // define impact
        switch(true){
            case (attackPoints <5):
                impact = 'gimpy';
                damage = 1;
                break;
            
            case (attackPoints >5 && attackPoints < 10):
                impact = 'half-hearted';
                damage = 2;
                break;
            
            case (attackPoints >10 && attackPoints < 15):
                impact = 'properly';
                damage = 3;
                break;
            
            case (attackPoints >15 && attackPoints < 20):
                impact = 'viciously';
                damage = 4;
                break;
        }
        console.log('attackPoints= '+attackPoints);
        console.log('defensePoints= '+defensePoints);
        
        if(attackPoints > defensePoints){
            defMsg = attacker.nickname+' '+hitHow[hitHowIndex]+'s you '+impact+' '+hitWhere[hitWhereIndex];
            attMsg = 'You attack '+defender.nickname+' and '+impact+' '+hitHow[hitHowIndex]+' the poor soul '+hitWhere[hitWhereIndex];
            var health = defender.attributes['health'];
            var newHealth = health - damage;
            defender.attributes['health']= newHealth;            
            stats = 'attack';
            outcome = attacker.nickname +' wins the battle. '
                +damage+' points of damage has been done.';
            
        }else {
            defMsg = attacker.nickname+'\'s attack was pretty lame and you '+hitHow[hitHowIndex]+' '+impact+' back '+hitWhere[hitWhereIndex]+' instead';
            attMsg = defender.nickname+' parries your lame attack and '+hitHow[hitHowIndex]+'s you '+impact+' '+hitWhere[hitWhereIndex]+' instead';
            var health = attacker.attributes['health'];
            var newHealth = health - damage;
            attacker.attributes['health']= newHealth;
            stats = 'defense';
            outcome = defender.nickname +' wins the battle. '
                +damage+' points of damage has been done.';
        }    
        
        var data = {
            attacker    : attacker,
            defender    : defender,
            message     : msg,
            stats       : stats,
            defMsg      : defMsg,
            attMsg      : attMsg, 
            outcome     : outcome
        };
        
        socket.emit('battle', data);
    }
    
    function increaseExperience(){
        
    }

