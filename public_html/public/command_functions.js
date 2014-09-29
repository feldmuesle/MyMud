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
        }
        else { // if it's not a moving-command, check for other commands
            
            socket.emit('command',{'command' : command, 'player' : player, 'room':room});
               
        }       
    }
    
    
    
    
    function increaseExperience(){
        
    }

