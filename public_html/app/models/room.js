/* Model for rooms */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PlayerModel = require('./player.js');
var Npc = require('./npc.js');
var Texter = require ('../controllers/texter.js');


var ExitSchema = new Schema({ 
   keyword      : String, // the keyword player types to leave 
   description  : String,   
   exitId       : Number, // roomId of the room it leads to
   action       : String, // action of player when leaving room
   goodbye      : String, // leaving-msg to other users in room 
   hello        : String  // arrival-msg to other user in room
});

var RoomSchema = new Schema({
    name        : String,
    id          : Number,
    description : String,
    exits       : [ExitSchema],
    npcs        :[{type: Schema.ObjectId, ref:'Npc'}],
    inventory   :[Schema.Types.Mixed]
});


RoomSchema.set('toObject', {getters : true});
ExitSchema.set('toObject', {getters : true});

RoomSchema.statics.createRoomWithNpc = function(room, exits, npcIds){
    console.log('hello from createRoom');
    var RoomModel = this || mongoose.model('Room');
    var Room = new RoomModel();
    Room.name = room.name;
    Room.id = room.id;
    Room.description = room.description;
    Room.exits = [];
    Room.npcs = [];
    Room.inventory = [];
    
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
    
    // find all npcs by id and push their ref onto rooms npc-array
    
    
        Npc.find({'id' : {$in : npcIds}}, function(err,npcs){
            if(err){console.error(err); return;};             
            
            for (var i=0; i<npcs.length; i++){
                Room.npcs.push(npcs[i]._id);
                console.log('pushing '+npcs[i]._id);
            }
            
        }).exec()
            .then(function(){
                
                Room.save(function(err){
                    if(err){
                        console.log('something went wrong when creating a room.');
                        return null; 
                    }    
                    console.log(Room.npcs);
                    console.log('new room created:');
                });  
            });
        
};

RoomSchema.statics.getNpcs = function(roomId){
    var RoomModel = this || mongoose.model('Room');
    RoomModel.findOne({'id':roomId}, function(err, room){
        if(err){console.error(err); return;}
    }).populate('npcs').exec(function(err, room){
        if(err){console.error(err); return;}
        console.log('Room.getNpc: '+room);
        return room;
    });
};


RoomSchema.statics.createRoom = function(room, 
exits){
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
RoomSchema.methods.setListeners = function(){
    console.log('listerners for room set.');
    var self = this || mongoose.model('Room'); 
    
    // set up listeners
    self.on('playerEnters', function(data){
        console.log(data['nickname'] +' enters '+self.name);
        // write room-description
        Texter.write (self.description, data['socketId']);
        // write exits-description
        for (var i=0; i< self.exits.length; i++){
            Texter.write(self.exits[i].description, data['socketId']);
        }
        
    });    
};

// emit event: players enters room
RoomSchema.methods.announce = function(player){
    var self = this || mongoose.model('Room');    
    self.emit('playerEnters', player);
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
