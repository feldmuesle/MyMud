/* 
Model for the player
 */
var User = require('./user.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Room = require('./room.js');
var Item = require('./item.js');
var Helper = require('../controllers/helper_functions.js');
var Texter = require ('../controllers/texter.js');

var PlayerSchema = Schema({
    nickname    :   String,
    guild       :   String,
    location    :   String,
    inventory   :   [{type:Schema.Types.ObjectId, ref :'Item'}],
    socketId    :   String,
    gender      :   String,
    attributes  :   { 
        maxHealth   :   Number,
        health      :   Number,
        hp          :   Number,
        sp          :   Number
    }
});



PlayerSchema.set('toObject', {getters : true});

// set all default-values and set up event-listeners
PlayerSchema.methods.initialize = function(socket){
    console.log('hello from the players init-function');
    var self = this || mongoose.model('Player'); 
    self.socketId = socket.id;
    self.location = 0;
    self.attributes['maxHealth'] = 100;
    self.attributes['health'] = self.attributes['maxHealth'];    
    
    self.setListeners(socket);       
};

// set all listeners
PlayerSchema.methods.setListeners = function(){
    
    console.log('listeners for player set');
    var self = this || mongoose.model('Player'); 
    
    // set up listener
    self.on('regen', function(){
        var self = this || mongoose.model('Player'); 
        
        // check if there's any need for regenerating
        if(self.attributes.health < 100){
            // get the room-name 
            Room.getRoomById(self.location).exec(function(err, room){
                if(err){console.error(err); return;}
                
                Texter.updatePlayer(self, room.name);
                setTimeout(function(){
                    self.attributes['health'] = self.attributes['maxHealth'];
                    Texter.updatePlayer(self, room.name);
                    Texter.write(self.nickname+' has regenerated.',self.socketId);
                },25000);
            });
        }                
    }); 
    
    self.on('dead', function(){
        self.emit('regen');
        var msg = 'Oh no!! - You got yourself killed.....................';            
        Texter.write(msg,self.socketId);
        msg = '.............................................................';
        Texter.write(msg,self.socketId);
        msg = 'Instead of seeing a bright light you wake up by a butterfly tickling your nose.';
        Texter.write(msg,self.socketId);
        msg = 'You know this place! Ah, everything\'s fine although your inventory has been stolen.';
        
        // get the start room and send room-description
        Room.getRoomById(0).exec(function(err, room){
            if(err){console.error(err); return;}
            
            room.setListeners();
            room.announce(self); // writes description to player
        });
    });
    
    self.on('look', function(data){
       var msg = 'You take a good look at the '+data;
       Texter.write(msg, self.socketId);
    });
    
    self.on('take item', function(item){
        var msg = 'You pick up the '+item.keyword +' and stuff it into your backpack.';
        Texter.write(msg, self.socketId);
        self.emit('inventory');
    });
    
    self.on('drop item', function(item){
        var msg = 'You take the '+item.keyword +' out of your backpack and drop it.';
        Texter.write(msg, self.socketId);
    });
    
    self.on('inventory', function(){
        Item.getInventoryOf(self).exec(function(err, items){
            if(err){console.error(err); return;}
            var msg;
            
            if(items.length > 0){
                 var msg = 'Your backpack holds: '+Helper.grammatize(items);
            }else{
                var msg = 'Your backpack is empty.';
            }
           
            Texter.write(msg, self.socketId);   
        });
           
    });
};

PlayerSchema.methods.write = function(message){
    console.log('hello from methods.write: '+message);
    
    this.emit('write', {'message'   : message});
};

// transfor plain js-object into mongoose-doc
PlayerSchema.statics.getPlayer = function (config){
    
    var PlayerModel = this || mongoose.model('Player');
    var player = new PlayerModel(config);
    console.log('hello from Player.method.getPlayer');
    return player;
};

// add ref-id of item to inventory
PlayerSchema.statics.getInventory = function(player){
    var self = this || mongoose.model('Player');
    return self.findOne({'_id':player._id}).populate('inventory');
};

//reset all
PlayerSchema.methods.die = function(){
    var self = this || mongoose.model('Player');
    self.inventory = [];
    self.location = 0;
    return self;
};

// cast javascript-obj to mongoose objectid for proper saving
PlayerSchema.methods.addItem = function(itemObjId){
    var self = this || mongoose.model('Player');
    // cast itemId to mongoose type objectId
    var itemId = mongoose.Types.ObjectId(itemObjId);
    self.inventory.push(itemId);
};

var Player = module.exports = mongoose.model('Player', PlayerSchema);




