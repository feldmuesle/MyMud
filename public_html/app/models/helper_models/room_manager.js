/* 
 * This file holds an ordinary javascript-class (no mongoose since its data does'nt need to be stored in db
 * for managing the players in each room
 */

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
        console.log('user '+nickname+' should leave room with id '+roomId);
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