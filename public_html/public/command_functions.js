/* 
 This file contains all command-functions for the mud
 */

//commands
    function checkCommand(cmd, socket){
    
        var command = cmd.split(/[ ,]+/);
        var leave = false;
        var index;
        console.log(command[0]);
        console.log(command[1]);
        console.log(command.length);
        
        // check if it's a keyword for the exits
        for(var i=0; i< room.exits.length; i++){
            if(command[0] == room.exits[i]['keyword']){
                console.log('you typed '+command[0]+' - that is a keyword');
                index = i;
                leave = true;               
            }
        }
        
        // if it is, send the correspondent exitmessage
        if(leave){
            
            textStream.add(room.exits[index].action +'...');
            console.log('leave is true');
            var change = {
                newRoomId   : room.exits[index].exitId,
                oldRoom     : room,
                player      : player,
                index       : index
            };
                                               
            socket.emit('changeRoom',change);
        }else if(command[0] == 'help'){
            var title = '<h4>Help</h4>';
            var move ='For moving just write the keyword for the exit that\'s wrapped between *';
            var desc = 'You can also write following commands.';
            
            var look = '\'look\' or \'look roomname\' e.g. \'look meadow\' to get details on your location.';
            var lookNpc = '\'look npc\' e.g. \'look panda\' to get details on the npc.';
            var lookItem = '\'look item\' e.g. \'look flower\' to get details on the item.';
            var lookNpcItem = '\'look npc item\' e.g. \'look panda flower\' to get details on the npcs item.';
            var takeItem = '\'take item\' e.g. \'take flower\' to take an item.';
            var dropItem = '\'drop item\' e.g. \'drop flower\' to drop an item.';
            var giveItem = '\'give npc item\' e.g. \'give panda flower\' to give the npc an item.';
            var npcChat = '\'chat npc \' e.g. \'chat panda\' to chat with the npc.';
            var attackNpc = '\'attack npc \' e.g. \'attack panda\' to attack the npc.';
            var attackPlayer = '\'attack playername \' e.g. \'attack thurax\' to attack the player thurax.';
            
            var help = [title, move, desc, look, lookNpc, lookItem, lookNpcItem, takeItem, 
                dropItem, giveItem, npcChat, attackNpc, attackPlayer];
            
            help.forEach(function(record){
                appendToChat('help', record);
            });
            
            
        
        
        }else { // if it's not a moving-command, check for other commands
            
            socket.emit('command',{'command' : command, 'player' : player, 'room':room});
               
        }       
    }
    
    
    
    
    function increaseExperience(){
        
    }

