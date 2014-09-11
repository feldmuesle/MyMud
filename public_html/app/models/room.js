/* Model for rooms */

var mongoose = require('mongoose');
var PlayerModel = require('./player.js');


var ExitSchema = new mongoose.Schema({ 
   keyword      : String, // the keyword player types to leave 
   description  : String,   
   exitId       : Number, // roomId of the room it leads to
   action       : String, // action of player when leaving room
   goodbye      : String // leaving-msg to other users in room 
   //hello        : String  // arrival-msg to other user in room
});

var RoomSchema = new mongoose.Schema({
    name        : String,
    id          : Number,
    description : String,
    exits       : [ExitSchema]
});


RoomSchema.set('toObject', {getters : true});
ExitSchema.set('toObject', {getters : true});

RoomSchema.statics.createRoom = function(room, exits){
    console.log('hello from createRoom');
    var RoomModel = this || mongoose.model('Room');
    var Room = new RoomModel();
    Room.name = room.name;
    Room.id = room.id;
    Room.description = room.description;
    Room.exits = [];
    
    console.log('The Exit-array-length id: '+exits.length);
    for(var i=0; i< exits.length; i++){
        var Exit = new ExitModel();
        console.log('hello from exit-loop.');
        Exit.description = exits[i].description;
        Exit.exitId = exits[i].exitId;
        Exit.keyword = exits[i].keyword;
        Exit.goodbye = exits[i].goodbye;
        Exit.action = exits[i].action;
        Room.exits.push(Exit);
    }
    
    Room.save(function(err){
        if(err){
            console.log('something went wrong when creating a room.');
            return null; 
        }        
        console.log('new room created:');
    });    
};

// this approach strangely doesn't work if the model also uses eventlisteners
// the function insertExits simply stops, no errors no nothing
// SOLUTION: use createRoom-function instead
{
//RoomSchema.statics.insertRoom = function (room, callback){
//    console.log('hello from insertRoom');
//    var RoomModel = this || mongoose.model('Room');
//    var Room = new RoomModel();
//    Room.name = room.name;
//    Room.id = room.id;
//    Room.description = room.description;
//    Room.exits = [];
//    
//    Room.save(function(err){
//        if(err){
//            console.log('something went wrong when saving a room.');
//            return null; 
//        }
//        return callback(Room._id);
//    });    
//};
//
//RoomSchema.statics.insertExits = function (room_id, exits, callback){
//    
//    var RoomModel = this || mongoose.model('Room');
//    RoomModel.findOne({'_id' : room_id}, function(err, room){
//        if(err){
//            console.log(err); 
//            return; 
//        }      
//        
//        for(var i=0; i< exits.length; i++){
//            var Exit = new ExitModel();
//            console.log('hello from exit-loop.');
//            Exit.description = exits[i].description;
//            Exit.exitId = exits[i].exitId;
//            Exit.keyword = exits[i].keyword;
//            Exit.goodbye = exits[i].goodbye;
//            Exit.action = exits[i].action;
//            room.exits.push(Exit);
//        }
//
//        room.save(function(err2){
//            if(err2){
//                console.log(err2);
//                return;
//            }
//            return callback();
//        });
//    });   
//};
}

// setting up event-listeners like this 
RoomSchema.methods.initialize = function(){
    var self = this;
    
    // set up listeners
    self.on('player enters', function(data){
        console.log(data['player'].nickname +' enters '+self.name);
    });    
};

// emit event: players enters room
RoomSchema.methods.announce = function(player){
    console.log('hello from room.announce()');
    var self = this || mongoose.model('Room');    
    self.emit('player enters', {'player' : player});
};

//RoomModel = function(){
//    var self = this;
//    self.users = [];
//    
//    //methods
//    self.addUser = function(user){
//        self.users.push(user);
//        console.log('a user has entered '+self.title);
//    };
//
//    self.removeUser = function(user){
//        if(user !== 'undefined'){
//            var leavingUser = self.users.indexOf(user);
//            self.users.splice(leavingUser, 1);
//            console.log('a user has left '+self.title);
//        }
//    };
//    
//};


var ExitModel =  mongoose.model('Exit', ExitSchema);
var Room = mongoose.model('Room',RoomSchema);
module.exports = Room;
