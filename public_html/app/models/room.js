/* Model for rooms */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PlayerModel = require('./player.js');
var Npc = require('./npc.js');
var Item = require('./item.js');
var Texter = require ('../controllers/texter.js');
var Helper = require('../controllers/helper_functions.js');


//validators
var valEmpty = [Helper.valEmpty, '{PATH} must just not be empty.'];

var ExitSchema = new Schema({ 
   keyword      : {type:String, trim:true, lowercase:true, validate:valEmpty}, // the keyword player types to leave 
   description  : {type:String, trim:true, validate:valEmpty}, 
   exitId       : Number, // roomId of the room it leads to
   action       : {type:String, trim:true, validate:valEmpty}, // action of player when leaving room
   goodbye      : {type:String, trim:true, validate:valEmpty}, // leaving-msg to other users in room 
   hello        : {type:String, trim:true, validate:valEmpty}  // arrival-msg to other user in room
});

var RoomSchema = new Schema({
    name        : {type:String, trim:true, lowercase:true, unique:true},
    id          : {type:Number, required:true, unique:true},
    description : {type:String, trim:true, validate:valEmpty},
    exits       : [ExitSchema],
    npcs        :[{type: Schema.ObjectId, ref:'Npc'}],
    inventory   :[{type: Schema.ObjectId, ref:'Item'}]
});


RoomSchema.set('toObject', {getters : true});
ExitSchema.set('toObject', {getters : true});

// set the validations
RoomSchema.path('name').validate(Helper.valEmpty, 'name must not be empty');

//sanitize string before saving
RoomSchema.pre('save', function(next){
    console.log('hello from room-pre-save');
    // sanitize all strings
    var self = this || mongoose.model('Room');
    var exits = self.exits;
    self.name = Helper.sanitizeString(self.name);
    self.description = Helper.sanitizeString(self.description);
    
    for(var i=0; i< self.exits.length; i++){        
        self.exits[i]['keyword'] = Helper.sanitizeString(self.exits[i]['keyword']);
        self.exits[i]['description'] = Helper.sanitizeString(self.exits[i]['description']);
        self.exits[i]['goodbye'] = Helper.sanitizeString(self.exits[i]['goodbye']);
        self.exits[i]['hello'] = Helper.sanitizeString(self.exits[i]['hello']);
        self.exits[i]['action'] = Helper.sanitizeString(self.exits[i]['action']);
    }
    next();
});


RoomSchema.statics.createRoomWithNpc = function(room, exits, npcIds, itemIds, cb){
    console.log('hello from createRoom');
    var RoomModel = this || mongoose.model('Room');
    var Room = new RoomModel();
    Room.name = room.name;
    Room.id = room.id;
    Room.description = room.description;
    Room.exits = [];
    Room.npcs = [];
    Room.inventory = [];
            
    for(var i=0; i< exits.length; i++){
        var Exit = new ExitModel();
        console.log('hello from exit-loop.');
        Exit.description = exits[i].description;
        Exit.exitId = exits[i].exitId;
        Exit.keyword = exits[i].keyword;
        Exit.goodbye = exits[i].goodbye;
        Exit.action = exits[i].action;
        Exit.hello = exits[i].hello;
        Room.exits.push(Exit);
    }
    
    
    // find all npcs by id and push their ref onto rooms npc-array   - if there are any
    if(npcIds){
        Npc.find({'id' : {$in : npcIds}}).exec(function(err,npcs){
            if(err){console.error(err); return;};             

            for (var i=0; i<npcs.length; i++){
                Room.npcs.push(npcs[i]._id);
                console.log('pushing '+npcs[i]._id);
            }
            if(!itemIds){
                return cb(err, Room);
            }
        }).then(function(err){

            // check also if there are any items 
            if(itemIds){
                Item.find({'id' : {$in : itemIds}}).exec(function(err,items){
                    if(err){console.error(err); return;};             

                    for (var i=0; i<items.length; i++){
                        Room.inventory.push(items[i]._id);
                        console.log('pushing '+items[i]._id);
                    }

                    return cb(err,Room);
                });
            }
        });       
    }else if(itemIds){ 
            
            Item.find({'id' : {$in : itemIds}}).exec(function(err,items){
                if(err){console.error(err); return;};             

                for (var i=0; i<items.length; i++){
                    Room.inventory.push(items[i]._id);
                    console.log('pushing '+items[i]._id);
                }

                return cb(err,Room);
            });
    }else {
        cb(null,Room);
    }  
    
};

RoomSchema.statics.updateRoom = function(room, exits, npcIds, itemIds, cb){
    var RoomModel = this || mongoose.model('Room');    
    
    RoomModel.findOne({'id':room.id}, function(err, doc){
        doc.name = room.name;
        doc.description = room.description;
        doc.exits = []; // empty the array
        doc.npcs = [];
        doc.inventory = [];
        
        for(var i=0; i<exits.length; i++){
            var Exit = new ExitModel();
            console.log('hello from exit-loop.');
            Exit.description = exits[i].description;
            Exit.exitId = exits[i].exitId;
            Exit.keyword = exits[i].keyword;
            Exit.goodbye = exits[i].goodbye;
            Exit.action = exits[i].action;
            Exit.hello = exits[i].hello; 
            doc.exits.push(Exit);
        }
        
        
            // find all npcs by id and push their ref onto rooms npc-array   - if there are any
    if(npcIds){
        Npc.find({'id' : {$in : npcIds}}).exec(function(err,npcs){
            if(err){console.error(err); return;};             

                for (var i=0; i<npcs.length; i++){
                    doc.npcs.push(npcs[i]._id);
                    console.log('pushing '+npcs[i]._id);
                }
                if(!itemIds){
                    return cb(err, doc);
                }
            }).then(function(err){

                // check also if there are any items 
                if(itemIds){
                    Item.find({'id' : {$in : itemIds}}).exec(function(err,items){
                        if(err){console.error(err); return;};             

                        for (var i=0; i<items.length; i++){
                            doc.inventory.push(items[i]._id);
                            console.log('pushing '+items[i]._id);
                        }

                        return cb(err,doc);
                    });
                }
            });       
        }else if(itemIds){ 

                Item.find({'id' : {$in : itemIds}}).exec(function(err,items){
                    if(err){console.error(err); return;};             

                    for (var i=0; i<items.length; i++){
                        doc.inventory.push(items[i]._id);
                        console.log('pushing '+items[i]._id);
                    }

                    return cb(err,doc);
                });
        }else {
            cb(null,doc);
        }
    });
};

RoomSchema.statics.getRoomById = function(roomId){
    var RoomModel = this || mongoose.model('Room');
    
    return RoomModel.findOne({'id':roomId}, function(err, room){
        if(err){console.error(err); return;}
        console.log('room from findOne: '+room.name);
    
    });
};



RoomSchema.statics.getRoomWithNpcs = function(roomId){
    var RoomModel = this || mongoose.model('Room');
    return RoomModel.findOne({'id':roomId}, function(){
    }).populate('npcs inventory');
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
    
    self.on('look', function(data){
        // write room-description
        Texter.write (self.description, data['socketId']);
        // write exits-description
        for (var i=0; i< self.exits.length; i++){
            Texter.write(self.exits[i].description, data['socketId']);
        }
        if(self.npcs.length > 0){
            Texter.write('There is '+Helper.grammatize(self.npcs) +' in the room.', data['socketId']);
        }        
        
        //TODO: populate also inventory if there is
        if(self.inventory.length > 0){
            Texter.write('Also you see '+ Helper.grammatize(self.inventory)+' laying around.', data['socketId']);
        } 
    });  
};

// emit event: players enters room
RoomSchema.methods.announce = function(player){
    var self = this || mongoose.model('Room');    
    self.emit('playerEnters', player);
};

// give close description on room
RoomSchema.methods.look = function(player){
    var self = this || mongoose.model('Room');    
    self.emit('look', player);
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
