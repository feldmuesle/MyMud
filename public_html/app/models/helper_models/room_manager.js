/* 
 * This file holds an ordinary javascript-class (no mongoose since its data does'nt need to be stored in db
 * for managing the players in each room
 */

var Helper = require('../../controllers/helper_functions.js');
var RoomManager = function(){
    
    var self = this; 
    self.activeRooms = [];
    self.playersInRoom = {};
    self.id = 0;
    
    //functions
    
    self.addPlayerToRoom = function(roomId, player){
        
        // check if the the room is already active = a key
        if(self.activeRooms[roomId] != undefined){
            
            self.activeRooms[roomId].push(player);
        }else {
            // if not, create the keay and add the player
            self.activeRooms[roomId] = [];
            self.activeRooms[roomId].push(player);            
        }  
    };
    
    self.removePlayerFromRoom = function(roomId, nickname, cb){
        console.log(nickname+' leaves room with id '+roomId);
        for(i in self.activeRooms[roomId]){
            if(self.activeRooms[roomId][i].nickname == nickname){
                //var index = self.activeRooms[roomId].indexOf(player);
                //console.log('user to be removed: ' +self.activeRooms[roomId][i].nickname);
                self.activeRooms[roomId].splice(i,1);                
                return cb;
            }
        }
    };
    
    self.getPlayersInRoom = function(roomId){
      console.log('hello from getUsers from room: '+roomId);
      return self.activeRooms[roomId];  
    };   
    
    self.getPlayerByName = function (playerName, roomId){
        console.log(self.activeRooms);
        var playerI = Helper.getIndexByKeyValue(self.activeRooms[roomId], 'nickname', playerName);
        var player = self.activeRooms[roomId][playerI];
        return player;
    };
};

/** make it a singleton! ***************/
RoomManager.instance = null;

// return singleton-class
RoomManager.getInstance = function(){
    if (this.instance == null){
        this.instance = new RoomManager();
    }
    return this.instance;
};

module.exports = RoomManager.getInstance();