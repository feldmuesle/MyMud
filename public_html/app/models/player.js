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
        // get the room-name        
        Room.getRoomById(self.location).exec(function(err, room){
            Texter.updatePlayer(self, room.name);
            setTimeout(function(){
                self.attributes['health'] = self.attributes['maxHealth'];
                Texter.updatePlayer(self, room.name);
                Texter.write(self.nickname+' has regenerated.',self.socketId);

            },15000);
            console.log('player regenerating: '+self.attributes['health']);
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

PlayerSchema.methods.tellInventory = function(){
    
};

PlayerSchema.methods.write = function(message){
    console.log('hello from methods.write: '+message);
    
    this.emit('write', {'message'   : message});
};

// transfor plain js-object into mongoose-doc
PlayerSchema.statics.getPlayer = function (config){
    
    var PlayerModel = this || mongoose.model('Player');
    var player = new PlayerModel();
    player.nickname = config.nickname;
    player.guild = config.guild;
    player.location = config.location;
    player.gender = config.gender;
    player.inventory = [];
    player.socketId = config.socketId;    
    player.attributes['maxHealth'] = config.attributes.maxHealth;
    player.attributes['health'] = config.attributes.health;
    player.attributes['hp'] = config.attributes.hp;
    player.attributes['sp'] = config.attributes.sp;
//    console.log('hello from get player '+player);
    for(var i=0; i<config.inventory.length; i++){
        player.inventory.push(config.inventory);
    }
    console.log('hello from Player.method.getPlayer');
    return player;
};

// add ref-id of item to inventory
PlayerSchema.statics.getInventory = function(player){
    var self = this || mongoose.model('Player');
    return self.findOne({'_id':player._id}).populate('inventory');
};

var Player = module.exports = mongoose.model('Player', PlayerSchema);


//
//PlayerSchema.methods.savePlayer = function(playerObj){
//    
//    User.findOne().where({'player.nickname' : playerObj.nickname}, function(err, user){
//        if(err){console.error(err); return;}
//        user.player[0].attributes['health'] = playerObj.attributes['health'];
//        user.save(function(err){
//           if(err){console.error(err); return;} 
//           console.log('player has been saved');
//        });
//    });   
//};

//PlayerSchema.methods.setAttribute = function (attr,val){
//    var self = this;
//    console.log('hello from setAttribute');
//    self.attributes[attr] = val;
//};
//
//PlayerSchema.methods.getAttribute = function(attr) {
//        var self = this;
//        console.log('hello from getAttribute');
//        return typeof self.attributes[attr] != "undefinded" ? self.attributes[attr]:false;
//};





//PlayerSchema.statics.savePlayer = function (player, callback){
//    console.log('hello from savePlayer');
//    var PlayerModel = this || mongoose.model('Player');
//    var pl = new PlayerModel();
//    pl.nickname = player.nickname;
//    pl.guild = player.guild;
//    pl.location = player.location;
//    pl.gender = player.gender;
//    pl.inventory = player.inventory;
//    pl.socketId = player.socketId;    
//    pl.attributes.maxHealth = player.attributes.maxHealth;
//    pl.attributes.health = player.attributes.health;
//    pl.attributes.hp = player.attributes.hp;
//    pl.attributes.sp = player.attributes.sp;
//    
//    pl.save(function(err){
//        if(err){
//            console.log('something went wrong when saving a player.');
//            return null; 
//        }
//        return callback(Room._id);
//    });    
//};
//
//PlayerSchema.statics.insertSkills = function (playerId, skills, callback){
//    var PlayerModel = this || mongoose.model('Player');
//    PlayerModel.findOne({_id : playerId}, function(err, player){
//        if(err){
//            console.log(err);
//            return; 
//        }      
//
//        console.log('PlayerId = '+ player._id);
//        console.log('The Skills-array-length id: '+ skills.length);
//        for(var i=0; i< skills.length; i++){
//            player.skillIds.push[skills._id];
//        }
//
//        player.save(function(err2){
//            if(err2){
//                console.log(err2);
//                return;
//            }
//            return callback();
//        });
//    });   
//};



